import { loadLibraryWithMockedReactNative, renderHook } from './helpers/load-library-with-mocked-react-native';

global.IS_REACT_ACT_ENVIRONMENT = true;

const LINKING_ERROR = "The package 'react-native-android-navigation-mode' does not seem to be linked correctly.";

function nativeModuleWithInfo(info) {
  return {
    getNavigationMode: jest.fn(() => (info.mode === 'unknown' ? '3-button' : info.mode)),
    getNavigationModeInfo: jest.fn(() => info)
  };
}

const UNSUPPORTED = { mode: 'unknown', interactionMode: null, source: 'unsupported' };
const UNAVAILABLE = { mode: 'unknown', interactionMode: null, source: 'unavailable' };

describe('getAndroidNavigationModeInfo', () => {
  it.each([
    { mode: '3-button', interactionMode: 0, source: 'resource' },
    { mode: '2-button', interactionMode: 1, source: 'resource' },
    { mode: 'gesture', interactionMode: 2, source: 'resource' },
    { mode: 'gesture', interactionMode: 2, source: 'secure-settings' },
    { mode: '2-button', interactionMode: 1, source: 'swipe-up-setting' },
    { mode: '3-button', interactionMode: 0, source: 'sdk-default' },
    UNAVAILABLE
  ])('returns the native result %p', (info) => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInfo(info) });

    expect(library.getAndroidNavigationModeInfo()).toEqual(info);
  });

  it('treats a native payload with an unexpected mode as unavailable', () => {
    const { library } = loadLibraryWithMockedReactNative({
      nativeModule: nativeModuleWithInfo({ mode: 'sideways', interactionMode: 7, source: 'resource' })
    });

    expect(library.getAndroidNavigationModeInfo()).toEqual(UNAVAILABLE);
  });

  it('drops an interaction mode outside 0, 1 and 2', () => {
    const { library } = loadLibraryWithMockedReactNative({
      nativeModule: nativeModuleWithInfo({ mode: 'gesture', interactionMode: 5, source: 'resource' })
    });

    expect(library.getAndroidNavigationModeInfo()).toEqual({ mode: 'gesture', interactionMode: null, source: 'resource' });
  });

  it('returns unsupported outside Android without resolving the native module', () => {
    const nativeModule = nativeModuleWithInfo(UNAVAILABLE);
    const loaded = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule });

    expect(loaded.library.getAndroidNavigationModeInfo()).toEqual(UNSUPPORTED);
    expect(loaded.nativeModuleLookups.count).toBe(0);
    expect(nativeModule.getNavigationModeInfo).not.toHaveBeenCalled();
  });

  it('throws the linking error when the native module is missing', () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: undefined });

    expect(() => library.getAndroidNavigationModeInfo()).toThrow(LINKING_ERROR);
  });

  it('asks for a rebuild when the installed native binary lacks the method', () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: { getNavigationMode: jest.fn(() => 'gesture') } });

    expect(() => library.getAndroidNavigationModeInfo()).toThrow(/getNavigationModeInfo.*[Rr]ebuild/s);
  });
});

describe('legacy getter native resolution', () => {
  it('does not resolve the native module outside Android', () => {
    const loaded = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule: nativeModuleWithInfo(UNAVAILABLE) });

    loaded.library.getAndroidNavigationMode();

    expect(loaded.nativeModuleLookups.count).toBe(0);
  });

  it('maps an unknown native detection to 3-button, consistent with the detailed API', () => {
    const nativeModule = nativeModuleWithInfo(UNAVAILABLE);
    const { library } = loadLibraryWithMockedReactNative({ nativeModule });

    expect(library.getAndroidNavigationModeInfo().mode).toBe('unknown');
    expect(library.getAndroidNavigationMode()).toBe('3-button');
  });
});

describe('useAndroidNavigationModeInfo', () => {
  it('returns the info read during the first render', () => {
    const info = { mode: 'gesture', interactionMode: 2, source: 'resource' };
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInfo(info) });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);

    expect(result.current).toEqual({ info, error: null });
  });

  it('re-reads after subscribing so a change between render and effect is not missed', () => {
    const nativeModule = nativeModuleWithInfo({ mode: '3-button', interactionMode: 0, source: 'resource' });
    nativeModule.getNavigationModeInfo
      .mockReturnValueOnce({ mode: '3-button', interactionMode: 0, source: 'resource' })
      .mockReturnValue({ mode: 'gesture', interactionMode: 2, source: 'resource' });
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);

    expect(result.current.info).toEqual({ mode: 'gesture', interactionMode: 2, source: 'resource' });
  });

  it('does not re-render after subscribing when the info is unchanged', () => {
    const loaded = loadLibraryWithMockedReactNative({
      nativeModule: nativeModuleWithInfo({ mode: 'gesture', interactionMode: 2, source: 'resource' })
    });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);

    expect(result.renderCount).toBe(1);
  });

  it('refreshes when the app becomes active and ignores other states', () => {
    const nativeModule = nativeModuleWithInfo({ mode: '3-button', interactionMode: 0, source: 'resource' });
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);

    nativeModule.getNavigationModeInfo.mockReturnValue({ mode: 'gesture', interactionMode: 2, source: 'resource' });
    loaded.TestRenderer.act(() => loaded.emitAppState('background'));
    expect(result.current.info.mode).toBe('3-button');

    loaded.TestRenderer.act(() => loaded.emitAppState('active'));
    expect(result.current.info.mode).toBe('gesture');
  });

  it('returns the getter error instead of throwing during render', () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: undefined });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);

    expect(result.current.info).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error.message).toBe(LINKING_ERROR);
  });

  it('clears the error after a later successful read', () => {
    const nativeModule = nativeModuleWithInfo({ mode: 'gesture', interactionMode: 2, source: 'resource' });
    const failure = new Error('read failed');
    nativeModule.getNavigationModeInfo.mockImplementation(() => {
      throw failure;
    });
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);
    expect(result.current).toEqual({ info: null, error: failure });

    nativeModule.getNavigationModeInfo.mockReturnValue({ mode: 'gesture', interactionMode: 2, source: 'resource' });
    loaded.TestRenderer.act(() => loaded.emitAppState('active'));

    expect(result.current).toEqual({ info: { mode: 'gesture', interactionMode: 2, source: 'resource' }, error: null });
  });

  it('drops the previous info when a later read fails', () => {
    const nativeModule = nativeModuleWithInfo({ mode: 'gesture', interactionMode: 2, source: 'resource' });
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);

    const failure = new Error('read failed');
    nativeModule.getNavigationModeInfo.mockImplementation(() => {
      throw failure;
    });
    loaded.TestRenderer.act(() => loaded.emitAppState('active'));

    expect(result.current).toEqual({ info: null, error: failure });
  });

  it('removes its AppState listener on unmount', () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInfo(UNAVAILABLE) });
    const { renderer } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);

    expect(loaded.activeAppStateListenerCount()).toBe(1);
    loaded.TestRenderer.act(() => renderer.unmount());

    expect(loaded.activeAppStateListenerCount()).toBe(0);
  });

  it('returns unsupported outside Android without subscribing or resolving native code', () => {
    const loaded = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule: nativeModuleWithInfo(UNAVAILABLE) });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationModeInfo);

    expect(result.current).toEqual({ info: UNSUPPORTED, error: null });
    expect(loaded.AppState.addEventListener).not.toHaveBeenCalled();
    expect(loaded.nativeModuleLookups.count).toBe(0);
  });
});

describe('public exports', () => {
  it('matches the declared runtime exports', () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInfo(UNAVAILABLE) });

    expect(Object.keys(library).sort()).toEqual([
      'NAVIGATION_MODE',
      'getAndroidNavigationBarHeight',
      'getAndroidNavigationBarInsets',
      'getAndroidNavigationMode',
      'getAndroidNavigationModeInfo',
      'useAndroidNavigationBarInsets',
      'useAndroidNavigationMode',
      'useAndroidNavigationModeInfo'
    ]);
  });
});

describe('native module resolution', () => {
  it('resolves the module through TurboModuleRegistry by its native name on Android', () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInfo(UNAVAILABLE) });

    loaded.library.getAndroidNavigationModeInfo();
    loaded.library.getAndroidNavigationMode();

    expect(loaded.TurboModuleRegistry.get).toHaveBeenCalledWith('AndroidNavigationMode');
  });

  it('does not load the Codegen spec on import or outside Android', () => {
    const loaded = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule: nativeModuleWithInfo(UNAVAILABLE) });

    loaded.library.getAndroidNavigationMode();
    loaded.library.getAndroidNavigationModeInfo();

    expect(loaded.TurboModuleRegistry.get).not.toHaveBeenCalled();
  });

  it('calls native methods on the module object', () => {
    const nativeModule = {
      getNavigationMode() {
        return this === nativeModule ? 'gesture' : 'detached';
      },
      getNavigationModeInfo() {
        return this === nativeModule
          ? { mode: 'gesture', interactionMode: 2, source: 'resource' }
          : { mode: 'detached', interactionMode: null, source: 'resource' };
      }
    };
    const { library } = loadLibraryWithMockedReactNative({ nativeModule });

    expect(library.getAndroidNavigationMode()).toBe('gesture');
    expect(library.getAndroidNavigationModeInfo().mode).toBe('gesture');
  });
});

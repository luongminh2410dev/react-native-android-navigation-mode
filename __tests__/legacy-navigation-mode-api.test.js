import { loadLibraryWithMockedReactNative, renderHook } from './helpers/load-library-with-mocked-react-native';

global.IS_REACT_ACT_ENVIRONMENT = true;

const LINKING_ERROR = "The package 'react-native-android-navigation-mode' does not seem to be linked correctly.";

function nativeModuleReturning(value) {
  return { getNavigationMode: jest.fn(() => value) };
}

describe('NAVIGATION_MODE', () => {
  it('exposes the three mode strings', () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleReturning('gesture') });

    expect(library.NAVIGATION_MODE).toEqual({
      GESTURE: 'gesture',
      TWO_BUTTON: '2-button',
      THREE_BUTTON: '3-button'
    });
  });
});

describe('getAndroidNavigationMode', () => {
  it.each(['gesture', '2-button', '3-button'])('returns the native mode %s on Android', (mode) => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleReturning(mode) });

    expect(library.getAndroidNavigationMode()).toBe(mode);
  });

  it.each(['unknown', '', null, undefined, 2])('maps the unexpected native value %p to 3-button', (value) => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleReturning(value) });

    expect(library.getAndroidNavigationMode()).toBe('3-button');
  });

  it('throws the linking error when the native module is missing', () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: undefined });

    expect(() => library.getAndroidNavigationMode()).toThrow(LINKING_ERROR);
  });

  it('throws the linking error when the native method is missing', () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: {} });

    expect(() => library.getAndroidNavigationMode()).toThrow(LINKING_ERROR);
  });

  it('returns gesture outside Android without calling native code', () => {
    const nativeModule = nativeModuleReturning('3-button');
    const { library } = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule });

    expect(library.getAndroidNavigationMode()).toBe('gesture');
    expect(nativeModule.getNavigationMode).not.toHaveBeenCalled();
  });
});

describe('useAndroidNavigationMode', () => {
  it('returns the mode read during the first render', () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleReturning('2-button') });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationMode);

    expect(result.current).toBe('2-button');
  });

  it('re-reads the mode when the app becomes active', () => {
    const nativeModule = nativeModuleReturning('3-button');
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationMode);

    nativeModule.getNavigationMode.mockReturnValue('gesture');
    loaded.TestRenderer.act(() => loaded.emitAppState('active'));

    expect(result.current).toBe('gesture');
  });

  it('does not re-read the mode for background or inactive changes', () => {
    const nativeModule = nativeModuleReturning('3-button');
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationMode);
    const callsAfterMount = nativeModule.getNavigationMode.mock.calls.length;

    nativeModule.getNavigationMode.mockReturnValue('gesture');
    loaded.TestRenderer.act(() => {
      loaded.emitAppState('background');
      loaded.emitAppState('inactive');
    });

    expect(result.current).toBe('3-button');
    expect(nativeModule.getNavigationMode).toHaveBeenCalledTimes(callsAfterMount);
  });

  it('removes its AppState listener on unmount', () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleReturning('gesture') });
    const { renderer } = renderHook(loaded, loaded.library.useAndroidNavigationMode);

    expect(loaded.activeAppStateListenerCount()).toBe(1);
    loaded.TestRenderer.act(() => renderer.unmount());

    expect(loaded.activeAppStateListenerCount()).toBe(0);
  });

  it('returns gesture outside Android without subscribing to AppState', () => {
    const nativeModule = nativeModuleReturning('3-button');
    const loaded = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationMode);

    expect(result.current).toBe('gesture');
    expect(loaded.AppState.addEventListener).not.toHaveBeenCalled();
    expect(nativeModule.getNavigationMode).not.toHaveBeenCalled();
  });
});

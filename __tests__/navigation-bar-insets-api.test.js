import { loadLibraryWithMockedReactNative, renderHook } from './helpers/load-library-with-mocked-react-native';

global.IS_REACT_ACT_ENVIRONMENT = true;

const LINKING_ERROR = "The package 'react-native-android-navigation-mode' does not seem to be linked correctly.";
const INSETS_EVENT = 'androidNavigationBarInsetsDidChange';

const PORTRAIT = { top: 0, right: 0, bottom: 48, left: 0 };
const LANDSCAPE_RIGHT = { top: 0, right: 42, bottom: 0, left: 0 };
const HIDDEN = { top: 0, right: 0, bottom: 0, left: 0 };

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });
  return { promise, resolve, reject };
}

function nativeModuleWithInsets(insets) {
  return {
    getNavigationMode: jest.fn(() => 'gesture'),
    getNavigationModeInfo: jest.fn(() => ({ mode: 'gesture', interactionMode: 2, source: 'resource' })),
    getNavigationBarInsets: jest.fn(() => Promise.resolve(insets)),
    addListener: jest.fn(),
    removeListeners: jest.fn()
  };
}

async function flushPromises(loaded) {
  await loaded.TestRenderer.act(async () => {
    await Promise.resolve();
  });
}

describe('getAndroidNavigationBarInsets', () => {
  it('resolves the native insets in dp', async () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInsets(PORTRAIT) });

    await expect(library.getAndroidNavigationBarInsets()).resolves.toEqual(PORTRAIT);
  });

  it('keeps zero edges for a hidden bar, distinct from null', async () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInsets(HIDDEN) });

    await expect(library.getAndroidNavigationBarInsets()).resolves.toEqual(HIDDEN);
  });

  it('resolves null when the window has no insets yet', async () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInsets(null) });

    await expect(library.getAndroidNavigationBarInsets()).resolves.toBeNull();
  });

  it('clamps negative or missing edges to zero', async () => {
    const { library } = loadLibraryWithMockedReactNative({
      nativeModule: nativeModuleWithInsets({ top: -3, right: undefined, bottom: 24.5, left: 0 })
    });

    await expect(library.getAndroidNavigationBarInsets()).resolves.toEqual({ top: 0, right: 0, bottom: 24.5, left: 0 });
  });

  it('resolves null outside Android without resolving the native module', async () => {
    const loaded = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule: nativeModuleWithInsets(PORTRAIT) });

    await expect(loaded.library.getAndroidNavigationBarInsets()).resolves.toBeNull();
    expect(loaded.TurboModuleRegistry.get).not.toHaveBeenCalled();
  });

  it('rejects with the linking error when the native module is missing', async () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: undefined });

    await expect(library.getAndroidNavigationBarInsets()).rejects.toThrow(LINKING_ERROR);
  });

  it('asks for a rebuild when the native binary lacks the method', async () => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: { getNavigationMode: jest.fn() } });

    await expect(library.getAndroidNavigationBarInsets()).rejects.toThrow(/getNavigationBarInsets.*[Rr]ebuild/s);
  });
});

describe('getAndroidNavigationBarHeight', () => {
  it.each([
    [PORTRAIT, 48],
    [LANDSCAPE_RIGHT, 42],
    [{ top: 0, right: 0, bottom: 20, left: 30 }, 30],
    [HIDDEN, 0]
  ])('returns the largest edge of %p', async (insets, height) => {
    const { library } = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInsets(insets) });

    await expect(library.getAndroidNavigationBarHeight()).resolves.toBe(height);
  });

  it('resolves null when insets are unavailable or outside Android', async () => {
    const android = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInsets(null) });
    await expect(android.library.getAndroidNavigationBarHeight()).resolves.toBeNull();

    const ios = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule: nativeModuleWithInsets(PORTRAIT) });
    await expect(ios.library.getAndroidNavigationBarHeight()).resolves.toBeNull();
  });
});

describe('useAndroidNavigationBarInsets', () => {
  it('starts empty and reads after mount', async () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInsets(PORTRAIT) });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);
    expect(result.current).toEqual({ insets: null, error: null });

    await flushPromises(loaded);

    expect(result.current).toEqual({ insets: PORTRAIT, error: null });
  });

  it('subscribes to native inset changes with the native module', async () => {
    const nativeModule = nativeModuleWithInsets(PORTRAIT);
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });

    renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);
    await flushPromises(loaded);

    expect(loaded.NativeEventEmitter).toHaveBeenCalledWith(nativeModule);
    expect(loaded.activeNativeEventListenerCount()).toBe(1);
  });

  it('updates on native events such as rotation or the bar being hidden', async () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInsets(PORTRAIT) });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);
    await flushPromises(loaded);

    loaded.TestRenderer.act(() => loaded.emitNativeEvent(INSETS_EVENT, LANDSCAPE_RIGHT));
    expect(result.current.insets).toEqual(LANDSCAPE_RIGHT);

    loaded.TestRenderer.act(() => loaded.emitNativeEvent(INSETS_EVENT, HIDDEN));
    expect(result.current.insets).toEqual(HIDDEN);

    loaded.TestRenderer.act(() => loaded.emitNativeEvent(INSETS_EVENT, null));
    expect(result.current.insets).toBeNull();
  });

  it('does not re-render when an event repeats the current insets', async () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: nativeModuleWithInsets(PORTRAIT) });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);
    await flushPromises(loaded);
    const rendersAfterRead = result.renderCount;

    loaded.TestRenderer.act(() => loaded.emitNativeEvent(INSETS_EVENT, { ...PORTRAIT }));

    expect(result.renderCount).toBe(rendersAfterRead);
  });

  it('ignores a pending read superseded by a newer event', async () => {
    const nativeModule = nativeModuleWithInsets(PORTRAIT);
    const pendingRead = deferred();
    nativeModule.getNavigationBarInsets.mockReturnValueOnce(pendingRead.promise);
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);

    loaded.TestRenderer.act(() => loaded.emitNativeEvent(INSETS_EVENT, LANDSCAPE_RIGHT));
    pendingRead.resolve(PORTRAIT);
    await flushPromises(loaded);

    expect(result.current.insets).toEqual(LANDSCAPE_RIGHT);
  });

  it('re-reads when the app becomes active', async () => {
    const nativeModule = nativeModuleWithInsets(PORTRAIT);
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);
    await flushPromises(loaded);

    nativeModule.getNavigationBarInsets.mockReturnValue(Promise.resolve(HIDDEN));
    loaded.TestRenderer.act(() => loaded.emitAppState('active'));
    await flushPromises(loaded);

    expect(result.current.insets).toEqual(HIDDEN);
  });

  it('returns read errors and clears them after a later successful read', async () => {
    const nativeModule = nativeModuleWithInsets(PORTRAIT);
    const failure = new Error('no window');
    nativeModule.getNavigationBarInsets.mockReturnValueOnce(Promise.reject(failure));
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);
    await flushPromises(loaded);
    expect(result.current).toEqual({ insets: null, error: failure });

    loaded.TestRenderer.act(() => loaded.emitAppState('active'));
    await flushPromises(loaded);

    expect(result.current).toEqual({ insets: PORTRAIT, error: null });
  });

  it('returns the linking error without subscribing when the module is missing', () => {
    const loaded = loadLibraryWithMockedReactNative({ nativeModule: undefined });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);

    expect(result.current.insets).toBeNull();
    expect(result.current.error.message).toBe(LINKING_ERROR);
    expect(loaded.activeNativeEventListenerCount()).toBe(0);
    expect(loaded.activeAppStateListenerCount()).toBe(0);
  });

  it('removes listeners on unmount and ignores a read that resolves afterwards', async () => {
    const nativeModule = nativeModuleWithInsets(PORTRAIT);
    const pendingRead = deferred();
    nativeModule.getNavigationBarInsets.mockReturnValueOnce(pendingRead.promise);
    const loaded = loadLibraryWithMockedReactNative({ nativeModule });
    const { result, renderer } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    loaded.TestRenderer.act(() => renderer.unmount());
    pendingRead.resolve(LANDSCAPE_RIGHT);
    await flushPromises(loaded);

    expect(loaded.activeNativeEventListenerCount()).toBe(0);
    expect(loaded.activeAppStateListenerCount()).toBe(0);
    expect(result.current).toEqual({ insets: null, error: null });
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('stays empty outside Android without subscribing', () => {
    const loaded = loadLibraryWithMockedReactNative({ os: 'ios', nativeModule: nativeModuleWithInsets(PORTRAIT) });

    const { result } = renderHook(loaded, loaded.library.useAndroidNavigationBarInsets);

    expect(result.current).toEqual({ insets: null, error: null });
    expect(loaded.NativeEventEmitter).not.toHaveBeenCalled();
    expect(loaded.AppState.addEventListener).not.toHaveBeenCalled();
  });
});

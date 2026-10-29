/**
 * Loads `src/index.js` against a fresh mocked `react-native` module.
 * React and react-test-renderer are loaded from the same module registry so hooks share one React copy.
 */
export function loadLibraryWithMockedReactNative({ os = 'android', nativeModule } = {}) {
  jest.resetModules();

  let appStateHandlers = [];
  const AppState = {
    addEventListener: jest.fn((type, handler) => {
      appStateHandlers.push(handler);
      return {
        remove: jest.fn(() => {
          appStateHandlers = appStateHandlers.filter((registered) => registered !== handler);
        })
      };
    })
  };

  const nativeModuleLookups = { count: 0 };
  const NativeModules = {};
  Object.defineProperty(NativeModules, 'AndroidNavigationMode', {
    enumerable: true,
    get() {
      nativeModuleLookups.count += 1;
      return nativeModule;
    }
  });

  jest.doMock('react-native', () => ({ Platform: { OS: os }, NativeModules, AppState }), { virtual: true });

  const library = require('../../src/index');
  const React = require('react');
  const TestRenderer = require('react-test-renderer');

  return {
    library,
    React,
    TestRenderer,
    AppState,
    nativeModuleLookups,
    emitAppState(nextState) {
      appStateHandlers.slice().forEach((handler) => handler(nextState));
    },
    activeAppStateListenerCount() {
      return appStateHandlers.length;
    }
  };
}

/** Renders `useHook` in a test component and returns the latest value plus the renderer. */
export function renderHook(loaded, useHook) {
  const { React, TestRenderer } = loaded;
  const result = { current: undefined, renderCount: 0 };

  function Probe() {
    result.current = useHook();
    result.renderCount += 1;
    return null;
  }

  let renderer;
  TestRenderer.act(() => {
    renderer = TestRenderer.create(React.createElement(Probe));
  });

  return { result, renderer };
}

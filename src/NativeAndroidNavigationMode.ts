// Codegen spec for the AndroidNavigationMode native module. `src/index.js` requires it lazily on Android only.
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

// Codegen does not support literal unions here; `src/index.js` narrows these values to the public types.
export type NavigationModeInfoPayload = {
  mode: string;
  interactionMode: number | null;
  source: string;
};

export type NavigationBarInsetsPayload = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export interface Spec extends TurboModule {
  getNavigationMode(): string;
  getNavigationModeInfo(): NavigationModeInfoPayload;
  getNavigationBarInsets(): Promise<NavigationBarInsetsPayload | null>;
  // Event subscription hooks used by NativeEventEmitter; available on every supported React Native version.
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>('AndroidNavigationMode');

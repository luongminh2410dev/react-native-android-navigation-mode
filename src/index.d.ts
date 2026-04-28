export type AndroidNavigationMode = 'gesture' | '2-button' | '3-button';

export declare const NAVIGATION_MODE: {
  GESTURE: 'gesture';
  TWO_BUTTON: '2-button';
  THREE_BUTTON: '3-button';
};

export declare function getAndroidNavigationMode(): AndroidNavigationMode;

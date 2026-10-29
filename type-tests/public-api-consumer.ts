// Consumer-side type checks for the published declarations. Run with `npm run typecheck`.
import {
  NAVIGATION_MODE,
  getAndroidNavigationMode,
  getAndroidNavigationModeInfo,
  useAndroidNavigationMode,
  useAndroidNavigationModeInfo,
  type AndroidNavigationMode,
  type AndroidNavigationModeInfo
} from 'react-native-android-navigation-mode';

const mode: AndroidNavigationMode = getAndroidNavigationMode();
const hookMode: AndroidNavigationMode = useAndroidNavigationMode();

const gesture: 'gesture' = NAVIGATION_MODE.GESTURE;
const twoButton: '2-button' = NAVIGATION_MODE.TWO_BUTTON;
const threeButton: '3-button' = NAVIGATION_MODE.THREE_BUTTON;

// @ts-expect-error The legacy API never returns 'unknown'.
const legacyUnknown: AndroidNavigationMode = 'unknown';

const info: AndroidNavigationModeInfo = getAndroidNavigationModeInfo();
const detailedMode: AndroidNavigationMode | 'unknown' = info.mode;
const interactionMode: 0 | 1 | 2 | null = info.interactionMode;

// @ts-expect-error The detailed mode may be 'unknown', so it is not a legacy mode.
const narrowedWithoutCheck: AndroidNavigationMode = info.mode;

function describeSource(source: AndroidNavigationModeInfo['source']): string {
  switch (source) {
    case 'resource':
    case 'secure-settings':
    case 'swipe-up-setting':
    case 'sdk-default':
    case 'unavailable':
    case 'unsupported':
      return source;
    default:
      return 'future source';
  }
}

const hookResult = useAndroidNavigationModeInfo();
const hookInfo: AndroidNavigationModeInfo | null = hookResult.info;
const hookError: Error | null = hookResult.error;

const appMode: AndroidNavigationMode = info.mode === 'unknown' ? NAVIGATION_MODE.THREE_BUTTON : info.mode;

export {
  mode,
  hookMode,
  gesture,
  twoButton,
  threeButton,
  legacyUnknown,
  detailedMode,
  interactionMode,
  narrowedWithoutCheck,
  describeSource,
  hookInfo,
  hookError,
  appMode
};

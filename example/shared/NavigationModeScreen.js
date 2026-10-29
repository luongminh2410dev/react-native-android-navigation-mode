import React, { useEffect, useState } from 'react';
import { Linking, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  getAndroidNavigationBarHeight,
  getAndroidNavigationMode,
  getAndroidNavigationModeInfo,
  useAndroidNavigationBarInsets,
  useAndroidNavigationMode,
  useAndroidNavigationModeInfo
} from 'react-native-android-navigation-mode';

// Fixture runs read this line from logcat (tag ReactNativeJS) to verify results without screenshots.
const LOG_TAG = '[NavigationModeExample]';

function readSafely(read) {
  try {
    return { value: read(), error: null };
  } catch (error) {
    return { value: null, error: String(error && error.message ? error.message : error) };
  }
}

function architectureSnapshot() {
  return {
    bridgeless: global.RN$Bridgeless === true,
    fabric: global.nativeFabricUIManager != null
  };
}

// Launching with `-a android.intent.action.VIEW -d navmode-example://keyboard` renders a text input; tap it to open the keyboard.
function useScenario() {
  const [scenario, setScenario] = useState(null);
  useEffect(() => {
    Linking.getInitialURL().then((url) => setScenario(url ? url.replace('navmode-example://', '') : null));
  }, []);
  return scenario;
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{typeof value === 'string' ? value : JSON.stringify(value)}</Text>
    </View>
  );
}

export default function NavigationModeScreen() {
  const legacyHookMode = useAndroidNavigationMode();
  const { info, error } = useAndroidNavigationModeInfo();
  const legacyGetter = readSafely(getAndroidNavigationMode);
  const infoGetter = readSafely(getAndroidNavigationModeInfo);
  const architecture = architectureSnapshot();
  const insetsHook = useAndroidNavigationBarInsets();
  const scenario = useScenario();
  const [height, setHeight] = useState({ value: null, error: null });

  const insetsKey = JSON.stringify(insetsHook.insets);
  useEffect(() => {
    let mounted = true;
    getAndroidNavigationBarHeight().then(
      (value) => mounted && setHeight({ value, error: null }),
      (heightError) => mounted && setHeight({ value: null, error: String(heightError.message) })
    );
    return () => {
      mounted = false;
    };
  }, [insetsKey]);

  const snapshot = {
    legacyHookMode,
    legacyGetter,
    infoHook: { info, error: error ? error.message : null },
    infoGetter,
    insetsHook: { insets: insetsHook.insets, error: insetsHook.error ? insetsHook.error.message : null },
    height,
    architecture,
    scenario
  };
  const serialized = JSON.stringify(snapshot);

  useEffect(() => {
    console.log(`${LOG_TAG} ${serialized}`);
  }, [serialized]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Android navigation mode</Text>
        <Text style={styles.hint}>
          Change the navigation style in Settings › System › Gestures › System navigation, then return to this app.
        </Text>
        <Row label="useAndroidNavigationMode()" value={legacyHookMode} />
        <Row label="getAndroidNavigationMode()" value={legacyGetter} />
        <Row label="useAndroidNavigationModeInfo()" value={snapshot.infoHook} />
        <Row label="getAndroidNavigationModeInfo()" value={infoGetter} />
        <Row label="useAndroidNavigationBarInsets()" value={snapshot.insetsHook} />
        <Row label="getAndroidNavigationBarHeight()" value={height} />
        <Row label="Architecture" value={architecture} />
        {scenario === 'keyboard' ? <TextInput style={styles.input} placeholder="Keyboard check" /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '600', color: '#111111', marginBottom: 8 },
  hint: { fontSize: 14, color: '#444444', marginBottom: 16 },
  row: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#111111' },
  value: { fontSize: 13, color: '#333333', fontFamily: 'monospace' },
  input: { borderWidth: 1, borderColor: '#999999', padding: 8, marginTop: 8 }
});

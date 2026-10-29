# Kế hoạch nâng cấp react-native-android-navigation-mode

> **For agentic workers:** REQUIRED SUB-SKILL: Use `executing-plans` to implement this plan task-by-task. Thực thi tuần tự, review sau từng đợt; không cần dùng subagent.

**Goal:** Cải thiện độ tin cậy của detection, bổ sung TurboModule thực sự, hoàn thiện kiểm thử và tài liệu, sau đó bổ sung navigation bar insets/height.

**Architecture:** Giữ API detection đồng bộ và contract hiện tại. Một bộ detection Kotlin dùng chung cho lớp tích hợp Legacy Native Module và TurboModule; JS cung cấp API cũ cùng API chi tiết có `unknown` và nguồn phát hiện. Insets/height là khả năng bất đồng bộ, độc lập với detection mode.

**Tech Stack:** JavaScript, TypeScript declarations và Codegen spec, Kotlin, React Native, Gradle, Jest, ESLint, TypeScript consumer checks, AndroidX WindowInsetsCompat cho đợt insets.

**Spec:** Các quyết định đã thống nhất với chủ thư viện được ghi tại mục 1 và các public contracts trong tài liệu này. Không cần tìm một spec riêng để thực thi.

**Ngày lập:** 2026-10-29.

## 1. Quyết định đã chốt và giới hạn thực thi

### Global constraints

- Giữ tên package `react-native-android-navigation-mode` và toàn bộ exports hiện có.
- Giữ React Native tối thiểu `0.71`, React tối thiểu `18` và Android minSdk mặc định `21`; ứng dụng vẫn chịu mức Android tối thiểu của phiên bản React Native mà nó sử dụng.
- Giữ hỗ trợ Legacy Architecture; bổ sung New Architecture bằng TurboModule.
- Giữ API detection đồng bộ.
- Không thêm runtime npm dependencies ngoài peer dependencies hiện có. Công cụ phát triển và kiểm thử đặt trong `devDependencies`.
- Không mở rộng native sang iOS. API mới báo platform không hỗ trợ; API cũ giữ fallback hiện tại.
- Giữ native module name `AndroidNavigationMode`.
- Không đổi kiểu trả về hoặc fallback của getter/hook cũ. Ngoại lệ duy nhất đã được chấp nhận là bug fix detection ở Task 2.
- Không thêm `loading` cho detection đồng bộ.
- Height/insets triển khai sau phần lõi, không gộp vào đợt TurboModule.
- Những phiên bản nêu trong roadmap là phiên bản dự kiến; đối chiếu trạng thái phát hành thực tế trước khi cập nhật version. Không tự publish.

### Quyền thực thi

Được sửa code, tài liệu và chạy kiểm tra tĩnh/unit test không build hoặc chạy app. Không tự build, rebuild, bundle, cài đặt, launch/restart app hoặc development server; không điều khiển simulator/emulator; không chụp ảnh hoặc quay video. App/emulator/server đang chạy và command approval đã lưu không phải sự cho phép thực hiện các hành động đó.

Hoàn thành code và kiểm tra được phép trước; chỉ thực hiện hành động bị giới hạn sau khi có ủy quyền rõ ràng cho đúng phạm vi. Các Kotlin/Gradle tests cần biên dịch native cũng nằm sau bước xin quyền chạy native verification. Tái sử dụng sự cho phép đã có cho cùng hành động và phạm vi, không hỏi lại.

Cài dependencies (`npm install` devDependencies, khởi tạo fixture bằng `npx`/CLI) cần hỏi người dùng trước theo AGENTS.md; nêu danh sách package khi xin quyền. Quyền đã cấp được dùng lại cho cùng phạm vi.

Không tự publish npm, push, gửi PR React Native Directory hoặc thay đổi GitHub metadata. Chuẩn bị nội dung để review trước. Không sửa các file ngoài phạm vi hoặc ghi đè thay đổi của người dùng.

Task nào thay đổi structure, tooling hoặc scripts thì cập nhật `AGENTS.md` và các skill bị ảnh hưởng trong `.agents/skills/` ngay trong task đó (layer map, mô tả "no tests/no example", danh sách kiểm tra được phép).

### Hiện trạng đã kiểm tra

- Phiên bản tại thời điểm khảo sát: `1.0.1`.
- `src/index.js`: getter đồng bộ qua `NativeModules`; hook đọc lại khi app active.
- `src/index.d.ts`: public types hiện tại chỉ có ba mode.
- Native Kotlin dùng `ReactContextBaseJavaModule` và `@ReactMethod(isBlockingSynchronousMethod = true)`, chưa có TurboModule spec/Codegen.
- Resource được ưu tiên; settings chỉ được thử khi resource không tồn tại. Giá trị ngoài `1/2` bị quy về `3-button`; nhánh resource chưa có bảo vệ lỗi như settings.
- `app.plugin.js` là no-op; không có native iOS hoặc podspec.
- Không có runtime npm dependencies; chưa có test thực sự, example hoặc CI.
- Khảo sát chỉ đọc mã nguồn và tài liệu; chưa build, chạy app hay kiểm thử thiết bị.

### Roadmap

| Đợt | Kết quả | Thời gian ước lượng |
| --- | --- | --- |
| 1.1.0 | API chi tiết, detection an toàn, test và sửa tài liệu | 3–4 ngày |
| 1.2.0 | TurboModule, đường legacy và example/fixture tối thiểu | 4–6 ngày |
| 1.3.0 | Hoàn thiện example, CI, compatibility matrix và nội dung phân phối | 2–3 ngày |
| 1.4.0 | Insets theo cửa sổ và height tiện ích | 4–6 ngày |

Ước lượng cho một người quen React Native/Kotlin; chưa tính thời gian chờ quyền kiểm thử, thiết bị và duyệt phát hành. Không dùng số downloads/stars làm release gate.

**Đã chốt: thực thi liên tục toàn bộ plan, không phát hành giữa các đợt.** Cột "Đợt" chỉ dùng để nhóm thay đổi. Release gate của từng đợt là checkpoint nội bộ, phải đạt trước khi sang đợt sau. Phát hành một lần sau khi hoàn thành Task 7; version chọn theo semver tại thời điểm phát hành (các thay đổi đều additive hoặc bug fix đã chấp nhận, nên là minor). Không cần bản `next` cho đợt 1.

## 2. Đợt 1 — Detection đáng tin cậy, dự kiến 1.1.0

### Task 1: Thiết lập kiểm tra và ghi nhận hành vi hiện tại

**Files:** Sửa `package.json`; tạo Jest/ESLint/TypeScript configs, JS tests và consumer type fixtures; thêm Kotlin test source set. Bộ detection dùng chung đặt trong cùng package Kotlin hiện tại, tách khỏi lớp bridge.

- [ ] Đọc lại source, hướng dẫn AGENTS và trạng thái workspace trước khi sửa. Không giả định repo sạch hoặc Git khả dụng.
- [ ] Thay script test giả bằng Jest; thêm `lint` và `typecheck` scripts.
- [ ] Giữ implementation JS hiện có; không chuyển toàn bộ thư viện sang TypeScript chỉ để thêm tooling.
- [ ] `src/index.js` là ESM không transpile: Jest cần babel transform. Unit test mock `react-native` (`Platform`, `NativeModules`, `AppState`) thay vì cài cả React Native; hook test dùng renderer tương thích React 18.
- [ ] Đặt JS tests ngoài `src/` (ví dụ `__tests__/` ở root) để không lọt vào thư mục được publish.
- [ ] Viết test getter hiện tại: ba mode hợp lệ, giá trị không hợp lệ, thiếu native module, platform ngoài Android. Lưu ý `src/index.js` hiện đọc `NativeModules.AndroidNavigationMode` ngay lúc import trên mọi platform; test ghi nhận đúng hành vi này, việc chuyển sang resolve lazy thuộc Task 2.
- [ ] Viết test hook: giá trị ban đầu, refresh khi active, không refresh khi background, cleanup listener.
- [ ] Tách bộ detection Kotlin khỏi lớp bridge, với nguồn đọc resource/settings có thể thay thế bằng fake trong test. Logic quyết định không phụ thuộc trực tiếp lớp `android.*` để chạy được bằng JVM unit test; không cần khởi tạo React Native runtime.
- [ ] Giữ hành vi ba mode hiện tại trong bước tách code; thay đổi thuật toán nằm ở Task 2.
- [ ] `files` hiện publish nguyên `android` và `src`. Thêm negation cho mọi thứ không thuộc runtime: `!android/build`, `!android/.gradle`, `!android/.cxx`, `!android/src/test`, `!**/__tests__`. Xác nhận bằng `npm pack --dry-run --ignore-scripts`.
- [ ] Cập nhật AGENTS.md và các skill liên quan cho tooling/scripts mới.

**Nghiệm thu:** Test mô tả contract cũ trước khi thêm API mới; thay đổi tooling không làm đổi exports. `android/` không phải Gradle project độc lập (không có settings.gradle/wrapper, `react-android` không khai version) nên Kotlin tests chỉ chạy được qua host app ở Task 5, sau khi được phép biên dịch native.

### Task 2: Bổ sung API chi tiết và sửa fallback

**Files:** Sửa `src/index.js`, `src/index.d.ts`, native module và bộ detection Kotlin; mở rộng JS/Kotlin tests.

**Public interfaces bổ sung:**

```ts
export type AndroidNavigationModeInfo = {
  mode: AndroidNavigationMode | 'unknown';
  interactionMode: 0 | 1 | 2 | null;
  source:
    | 'resource'
    | 'secure-settings'
    | 'swipe-up-setting'
    | 'sdk-default'
    | 'unavailable'
    | 'unsupported';
};

export declare function getAndroidNavigationModeInfo():
  AndroidNavigationModeInfo;

export declare function useAndroidNavigationModeInfo(): {
  info: AndroidNavigationModeInfo | null;
  error: Error | null;
};
```

**Interfaces giữ nguyên:**

```ts
export type AndroidNavigationMode = 'gesture' | '2-button' | '3-button';

export declare function getAndroidNavigationMode(): AndroidNavigationMode;
export declare function useAndroidNavigationMode(): AndroidNavigationMode;
```

- [ ] Viết test cho hành vi mới trước khi sửa implementation; xác nhận test thất bại vì hành vi chưa có, không phải do lỗi cấu hình.
- [ ] Thêm native method đồng bộ `getNavigationModeInfo()`, dùng chung bộ detection với `getNavigationMode()`.
- [ ] Chỉ chấp nhận `0 → 3-button`, `1 → 2-button`, `2 → gesture`.
- [ ] Đọc resource `config_navBarInteractionMode` trước.
- [ ] Nếu resource thiếu, đọc lỗi hoặc giá trị ngoài `0/1/2`, tiếp tục đọc secure setting `navigation_mode`.
- [ ] **Đã chốt: Android dưới 10 (API < 29) không có gesture navigation, nên không trả `unknown`.** Sau khi resource và `navigation_mode` không cho kết quả hợp lệ:
  - API 28 (Android 9): đọc secure setting `swipe_up_to_switch_apps_enabled`. Giá trị `1` → `2-button`, `0` → `3-button`, `source: 'swipe-up-setting'`. Thiếu, lỗi hoặc giá trị khác thì chuyển sang bước dưới.
  - API < 29 còn lại: `mode: '3-button'`, `source: 'sdk-default'`.
  - Với các source suy ra này, `interactionMode` lấy theo mode (`0` cho 3-button, `1` cho 2-button) để luôn khớp `mode`.
  - Detector nhận SDK level qua tham số hoặc nguồn có thể fake, để test không phụ thuộc `Build.VERSION`.
- [ ] Từ API 29 trở lên, nếu cả hai nguồn thất bại thì trả `mode: 'unknown'`, `interactionMode: null`, `source: 'unavailable'`. Không giữ raw value ngoài khoảng như một kết quả hợp lệ.
- [ ] Bảo vệ cả nhánh resource và settings; chỉ xử lý các lỗi đọc cần thiết (`Resources.NotFoundException`, `Settings.SettingNotFoundException`, `SecurityException` cho trường hợp Android 12+ chặn đọc settings key ẩn), không dùng catch để che lỗi lập trình ở toàn bộ module.
- [ ] **Bug fix đã được chủ thư viện chấp nhận cho API cũ (thuộc bản minor):** vì dùng chung detector, `getAndroidNavigationMode()` đổi ở ba trường hợp. Resource có giá trị ngoài `0/1/2`: trước trả `3-button`, nay đọc tiếp settings. Đọc resource ném lỗi: trước lỗi truyền lên JS, nay chuyển sang settings. Android 9 bật swipe-up: trước trả `3-button`, nay trả `2-button`. Fallback cuối vẫn là `3-button`. Ghi vào CHANGELOG.
- [ ] Ghi trong JSDoc, types và README rằng `source` và `mode` của API chi tiết có thể thêm giá trị ở bản minor sau (ví dụ nguồn OEM); consumer nên có nhánh mặc định khi `switch`.
- [ ] Getter mới ngoài Android trả `unknown/unsupported`, `interactionMode: null`; không resolve native module.
- [ ] Getter mới ném lỗi rõ ràng khi module chưa link hoặc binary native thiếu method mới; thông báo cần rebuild binary sau nâng cấp, không tự chạy rebuild.
- [ ] Hook mới đọc đồng bộ lần đầu và bắt lỗi getter thành `{ info: null, error }`.
- [ ] Khi lần đọc sau thành công, hook cập nhật `info` và xóa `error`; khi lỗi đọc phát sinh, trả `info: null` cùng lỗi, không giữ dữ liệu cũ như kết quả mới.
- [ ] Sau khi gắn AppState listener, đọc lại để tránh bỏ lỡ thay đổi giữa render và effect; refresh mỗi lần app active.
- [ ] Cleanup listener khi unmount; không thêm polling hoặc observer thay đổi mode trực tiếp trong đợt này.
- [ ] API cũ vẫn trả `3-button` trên Android khi không xác định được, và `gesture` ngoài Android.
- [ ] API cũ vẫn coi thiếu native module là lỗi cấu hình, không che bằng fallback.
- [ ] Không thêm `UNKNOWN` vào `NAVIGATION_MODE` cũ trong đợt này.

**Test bắt buộc:**

- [ ] Ba giá trị hợp lệ từ từng nguồn.
- [ ] Resource hợp lệ được ưu tiên khi settings cho kết quả khác.
- [ ] Resource thiếu, ném lỗi hoặc ngoài khoảng nhưng settings hợp lệ.
- [ ] Hai nguồn cùng thiếu, ném lỗi hoặc ngoài khoảng trên API ≥ 29.
- [ ] API 28: swipe-up `1`, `0`, thiếu hoặc lỗi; API < 28: `sdk-default`; `navigation_mode` hợp lệ trên máy cũ vẫn được ưu tiên.
- [ ] Unknown của API mới và fallback API cũ nhất quán.
- [ ] Platform ngoài Android không đụng tới native resolution.
- [ ] Hook mới xử lý lỗi, phục hồi, foreground refresh và cleanup.
- [ ] Consumer type checks khớp runtime exports và giữ nguyên kiểu ba mode của API cũ.

### Task 3: Sửa tài liệu nền tảng

**Files:** Sửa `README.md`; tạo `CHANGELOG.md`. Giữ `app.plugin.js` và entry tương ứng để tương thích.

- [ ] Bỏ hướng dẫn `pod-install` cho package này.
- [ ] Nêu rõ iOS chỉ có JS fallback, không có native iOS.
- [ ] Giải thích Expo cần development/production build, không chạy trong Expo Go.
- [ ] Ghi rõ plugin hiện tại là no-op và không bắt buộc cho cấu hình hiện tại; không xóa plugin entry đang tồn tại.
- [ ] Thêm ví dụ API chi tiết và ứng dụng tự chọn fallback khi `unknown`.
- [ ] Giải thích mode và safe-area/insets là thông tin khác nhau; không suy padding chỉ từ gesture mode.
- [ ] Nêu giới hạn OEM và nguồn dữ liệu hệ thống; không tuyên bố detection luôn chính xác.
- [ ] Khởi tạo changelog cho thay đổi mới; không tự suy diễn lịch sử release cũ. Thêm `CHANGELOG.md` vào `files` vì npm không tự đưa file này vào tarball.
- [ ] Hướng dẫn consumer chạy Jest: package ship mã chưa transpile, `transformIgnorePatterns` mặc định của preset React Native không transform package này; nêu cách thêm package vào pattern hoặc mock module.

**Release gate đợt 1 (checkpoint):** JS tests, lint và consumer type checks đạt. Kotlin tests chạy ở Task 5 qua fixture và phải đạt trước khi phát hành. Đến lúc đó, ghi rõ native checks chưa chạy và không gọi đợt này là đã xác minh đầy đủ.

## 3. Đợt 2 — TurboModule, dự kiến 1.2.0

### Task 4: Thêm Codegen và đường tích hợp native

**Files:** Thêm `src/NativeAndroidNavigationMode.ts` làm Codegen spec; sửa `package.json`, `android/build.gradle`, native registration/package và JS module resolution. Tạo wrappers/source sets cần thiết trong Android package hiện tại.

- [ ] Spec bao gồm getter cũ và getter thông tin mới, đều đồng bộ.
- [ ] Dùng payload object với các kiểu Codegen hỗ trợ; JS wrapper cung cấp public string unions và numeric union đã chốt ở Task 2.
- [ ] Cấu hình `codegenConfig` với loại `modules`, thư mục spec và Java package hiện tại.
- [ ] Thêm lớp TurboModule kế thừa generated spec, đăng ký đúng TurboModule metadata.
- [ ] Giữ lớp tích hợp legacy; hai đường gọi chung bộ detection Kotlin, không sao chép thuật toán.
- [ ] Cấu hình Gradle/source sets để legacy không phụ thuộc lớp generated chỉ có ở đường New Architecture.
- [ ] Với RN 0.82 trở lên, không chọn đường legacy chỉ vì ứng dụng còn đặt `newArchEnabled=false`.
- [ ] Chốt và ghi lại cơ chế chọn kiến trúc trước khi code rộng: cách đọc `newArchEnabled`, cách xác định phiên bản RN trong Gradle (ví dụ đọc `react-native/package.json`) để coi RN ≥ 0.82 là New Architecture, và bố cục source set `newarch`/`oldarch`.
- [ ] API đăng ký package/module đã thay đổi qua các bản RN 0.71 → mới nhất (ví dụ `TurboReactPackage` và `BaseReactPackage`, chữ ký constructor `ReactModuleInfo`). Đối chiếu trên từng fixture của Task 5; mã Kotlin phải compile trên toàn ma trận, tách theo source set khi cần.
- [ ] Codegen bắt file spec phải gọi `TurboModuleRegistry.get`/`getEnforcing` ở top-level. Để không resolve lúc import, `src/index.js` chỉ `require('./NativeAndroidNavigationMode')` bên trong hàm, sau khi đã kiểm tra platform. Xác minh trên fixture rằng trong legacy, `TurboModuleRegistry.get` fallback về `NativeModules`.
- [ ] Spec `.ts` ship trong `src/` dạng chưa transpile: cấu hình Jest/typecheck của repo xử lý được file này.
- [ ] Giữ native module name `AndroidNavigationMode`; tránh đăng ký hai module cùng tên trong một cấu hình.
- [ ] Resolve module sau khi kiểm tra platform; không gọi Android `getEnforcing` ngay lúc import entrypoint chung trên iOS.
- [ ] Không viết thêm C++/JSI thủ công; dùng Codegen và cơ chế TurboModule của React Native.
- [ ] Đưa spec, JS/types và native sources cần thiết vào npm artifact; không yêu cầu consumer chạy bước build JS thủ công để sử dụng package.
- [ ] Thêm test module resolution, missing module/method và payload mapping mà không cần chạy app.

### Task 5: Tạo example tối thiểu và fixture tương thích

**Files:** Tạo `example/` với màn hình dùng chung; thêm các cấu hình fixture và tài liệu cách chạy ma trận, không nhân bản logic thư viện.

- [ ] **Đã chốt: commit đầy đủ các fixture.** Bố cục: `example/shared/` chứa màn hình dùng chung; mỗi dòng ma trận dưới đây là một app độc lập (`example/rn-0.71/`, `example/rn-0.76/`, …), cộng một Expo development build fixture. Các fixture import màn hình dùng chung, không sao chép.
- [ ] `.gitignore` loại `node_modules`, `build`, `.gradle`, `.cxx`, `local.properties` và output của từng fixture. Toàn bộ `example/` nằm ngoài npm artifact.
- [ ] Khởi tạo fixture bằng CLI cần tải và cài package, nên xin quyền trước theo mục 1.
- [ ] Example hiển thị getter/hook cũ, thông tin chi tiết, source và lỗi.
- [ ] Chạy Kotlin unit tests của detector (chuẩn bị từ Task 1–2) qua fixture sau khi được phép biên dịch native.
- [ ] `android/build.gradle` cố định Java/Kotlin target 17, nên fixture RN 0.71 phải dùng JDK 17. Ghi yêu cầu này vào compatibility matrix. Không đổi target khi chưa hỏi, vì đây là public surface.
- [ ] Khóa patch version, dependencies và toolchain của từng fixture tại thời điểm triển khai; ghi rõ phiên bản thực tế thay vì chỉ lưu minor range.
- [ ] Với fixture RN cũ, dùng toolchain phù hợp; không ép mọi fixture dùng cùng JDK/Gradle/Kotlin.
- [ ] Kiểm tra package thông qua tarball thay vì chỉ dùng đường dẫn source local.
- [ ] Thêm bằng chứng registration và đường resolve để chứng minh module được gọi qua TurboModule.

| RN | Cấu hình cần xác minh |
| --- | --- |
| 0.71 | Legacy |
| 0.76 | Legacy và New Architecture |
| 0.81 | Legacy và New Architecture |
| 0.82 | New Architecture |
| 0.88 | New Architecture |

Đây là ma trận mục tiêu. Dòng 0.88 nghĩa là bản RN stable mới nhất tại thời điểm triển khai; nếu 0.88 chưa stable thì dùng bản stable mới nhất và ghi rõ. Không tuyên bố New Architecture trên các RN 0.71–0.75 đã được xác minh từ kết quả legacy; không suy ra mọi phiên bản trung gian đều đã được thử.

- [ ] Nếu fixture có cơ chế tắt interop, chạy cấu hình đó sau khi được phép.
- [ ] Nếu không tắt được interop, dùng bằng chứng registration/generated spec/resolve và ghi rõ giới hạn xác minh; không phát minh một flag cấu hình không có trong RN fixture.
- [ ] Không dùng riêng build thành công trên New Architecture để kết luận không phụ thuộc interop.
- [ ] Ghi riêng `build verified` và `runtime verified`, cùng phiên bản và ngày kiểm tra.
- [ ] Không phát hành ở đợt này (xem mục Roadmap). Phát hành `next` trước hay stable trực tiếp ở lần phát hành cuối do chủ thư viện quyết; không tự publish.

**Release gate đợt 2:** Đạt ma trận được công bố, API cũ giữ contract, artifact đầy đủ và có bằng chứng TurboModule. Khi thiếu quyền hoặc thiết bị, ghi rõ gate còn thiếu; không nâng metadata thành tuyên bố đã xác minh.

## 4. Đợt 3 và 4 — Hoàn thiện sản phẩm, bổ sung insets

### Task 6: Example, CI và khả năng khám phá — dự kiến 1.3.0

**Files:** Hoàn thiện `example/`, `README.md`, `CHANGELOG.md`; tạo CONTRIBUTING, issue template và GitHub Actions workflows. Chuẩn bị nội dung Directory/metadata trong tài liệu để chủ thư viện review.

- [ ] Example có hướng dẫn đổi navigation style trong Settings rồi quay lại app để xem refresh.
- [ ] README dẫn bằng bài toán sử dụng, sau đó tới cài đặt và API.
- [ ] Thêm ví dụ phối hợp safe-area; không tự cộng hai lần bottom padding hoặc đưa một giá trị ước đoán theo mode thành safe-area thực tế.
- [ ] Thêm compatibility matrix từ kết quả thực tế, tách phần dự kiến kiểm thử khỏi phần đã xác minh.
- [ ] Issue template thu thập RN version, Android version, OEM, architecture và nguồn detection.
- [ ] CI mặc định chạy JS tests, lint và types.
- [ ] Native workflow để `workflow_dispatch`, không tự bật build trên push/PR; chỉ kích hoạt sau khi được phép.
- [ ] Chuẩn bị GitHub description/topics, npm keywords và entry React Native Directory. Chỉ chỉnh keywords trong repo; metadata bên ngoài và PR Directory cần chỉ dẫn riêng.
- [ ] Metadata phân biệt Android native support với fallback ngoài Android; không quảng bá package như thư viện native iOS.
- [ ] Chỉ công bố New Architecture sau khi đạt release gate đợt 2.
- [ ] Có thể thêm sơ đồ minh họa bằng tài liệu; không tự chụp ảnh app đang chạy.
- [ ] Ghi chú release giải thích JS mới cần binary có native methods tương ứng.

### Task 7: Navigation bar insets/height — dự kiến 1.4.0

**Files:** Thêm reader/observer native riêng cho window insets; mở rộng cả legacy wrapper và TurboModule spec, JS/types, tests, example và tài liệu.

**Public interfaces bổ sung:**

```ts
export type AndroidNavigationBarInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export declare function getAndroidNavigationBarInsets():
  Promise<AndroidNavigationBarInsets | null>;

export declare function getAndroidNavigationBarHeight():
  Promise<number | null>;

export declare function useAndroidNavigationBarInsets(): {
  insets: AndroidNavigationBarInsets | null;
  error: Error | null;
};
```

- [ ] Đọc WindowInsets của cửa sổ hiện tại trên UI thread, trả kết quả bất đồng bộ.
- [ ] Dùng AndroidX WindowInsetsCompat; khóa dependency tương thích API 21 và các fixture, không tăng minSdk của thư viện. Ưu tiên dùng `androidx.core` mà React Native đã kéo vào transitive; nếu phải khai báo thì không ép nâng version của host app.
- [ ] Chọn một cơ chế event chạy được trên toàn ma trận. `EventEmitter` của Codegen chỉ có ở các bản RN mới; bản cũ cần `addListener`/`removeListeners` cùng `NativeEventEmitter`. Kiểm tra mốc phiên bản trên fixture trước khi chọn.
- [ ] Insets phản ánh navigation bar đang hiển thị, theo bốn cạnh, đơn vị dp.
- [ ] Không gộp status bar, IME hoặc system gesture insets.
- [ ] `getAndroidNavigationBarHeight()` dùng cùng đường đo insets và trả cạnh lớn nhất; không tự đọc một resource height riêng.
- [ ] Tài liệu giải thích height là độ dày, không mặc định dùng làm `paddingBottom` khi landscape.
- [ ] Thanh bị ẩn nhưng đo được → bốn cạnh bằng 0 và height bằng 0.
- [ ] Chưa có activity/window/insets hoặc ngoài Android → `null`; đây không phải exception.
- [ ] Không fallback sang resource height để giả làm số đo cửa sổ.
- [ ] Hook ban đầu có `insets: null, error: null`; bắt đầu đọc sau mount. Lỗi thực thi bất thường trả `insets: null, error`; lần đọc thành công xóa lỗi.
- [ ] Hook cập nhật khi insets, orientation, activity hoặc trạng thái foreground thay đổi; bỏ kết quả bất đồng bộ thuộc activity/đợt đọc đã hết hiệu lực.
- [ ] Theo dõi insets bằng observer/view do thư viện sở hữu, không thay thế listener của host; không consume insets để làm thay đổi layout ứng dụng.
- [ ] Cleanup observer, listener và tham chiếu activity khi không còn subscriber hoặc module bị hủy; không giữ activity đã bị hủy.
- [ ] Hợp nhất sự kiện trong JS wrapper để hook có cùng contract trên hai kiến trúc; native chỉ gửi thay đổi của cửa sổ đang hoạt động.
- [ ] Giữ detection mode độc lập với insets; ẩn navigation bar không có nghĩa mode đã thay đổi.

**Test bắt buộc:**

- [ ] Px sang dp với nhiều density, giữ giá trị không âm.
- [ ] Insets ở cạnh trái/phải trong landscape và height lấy đúng cạnh lớn nhất.
- [ ] Phân biệt 0 với null; ngoài Android không resolve native module.
- [ ] Bàn phím không làm tăng navigation bar insets.
- [ ] Immersive hide/show, orientation, foreground và activity recreation.
- [ ] Cleanup, unmount trong khi Promise pending và bỏ sự kiện/kết quả cũ.
- [ ] Hoạt động cùng listener/insets handling của ứng dụng mà không đổi hành vi host.

**Release gate đợt 4:** Ngoài unit/static checks, cần native/runtime evidence cho các tình huống cửa sổ đã nêu trước khi phát hành stable.

## 5. Kiểm tra, nghiệm thu và bàn giao

### Kiểm tra được phép mặc định

Các scripts sau phải được thiết lập bởi tooling mới và không build/launch app:

```sh
npm test -- --runInBand
npm run lint
npm run typecheck
npm pack --dry-run --ignore-scripts
```

Không chạy script `prepare`, codegen hoặc lifecycle script có tác dụng build app như một bước ngầm của kiểm tra package. Dry-run chỉ xác nhận danh sách file; kiểm tra consumer từ tarball và native build là bước riêng.

### Kiểm tra native/thiết bị sau khi được ủy quyền

- Gesture và 3-button trên AOSP cùng ít nhất một OEM.
- 2-button trên Android/device có hỗ trợ thực tế; không ép thiết bị không hỗ trợ để tạo kết quả.
- Đổi mode trong Settings rồi quay lại ứng dụng.
- Kiểm tra build và đường gọi legacy/TurboModule theo ma trận Task 5.
- Một Expo development build: chọn SDK stable còn được hỗ trợ tại thời điểm triển khai, khóa phiên bản SDK/RN trong fixture và ghi rõ kết quả.
- Các tình huống insets của Task 7: portrait/landscape, keyboard, immersive, activity recreation và cùng tồn tại với xử lý insets của host.
- Không cần screenshot/video để chứng minh API; chỉ capture nếu được yêu cầu hoặc được cho phép riêng.

### Kết thúc mỗi task

- [ ] Chạy kiểm tra được phép và đọc kết quả trước khi khẳng định đạt.
- [ ] Review API, fallback, dependencies và package contents theo phạm vi task.
- [ ] Nếu task đổi structure, tooling hoặc scripts: AGENTS.md và các skill liên quan đã được cập nhật.
- [ ] Ghi lại file đã thay đổi, hành vi mới, lệnh đã chạy và kết quả.
- [ ] Phân biệt rõ kiểm tra chưa chạy, kiểm tra thất bại và kiểm tra thành công.
- [ ] Không đánh dấu native/runtime verified nếu chưa thực hiện.
- [ ] Nếu có Git và được yêu cầu commit, chỉ stage file thuộc task; không đưa debug log hay thay đổi ngoài phạm vi vào commit. Không tự push/publish.

### Thứ tự bàn giao

Thực thi liên tục: hoàn thành và review đợt 1, tiếp đến đợt 2, đợt 3 và cuối cùng đợt 4, rồi mới phát hành một lần. Khi chưa có quyền native verification, hoàn thiện code và kiểm tra được phép của đợt đang làm, báo rõ release gate còn thiếu và yêu cầu đúng hành động cần xác minh; không tự công bố stable hoặc tuyên bố tương thích đã được chứng minh.

Thay đổi mức RN tối thiểu, kiểu trả về hoặc fallback của API cũ nằm ngoài kế hoạch này và cần một thiết kế major version riêng.

### Tài liệu tham chiếu

- [React Native Turbo Native Modules](https://reactnative.dev/docs/turbo-native-modules-introduction)
- [React Native 0.82: New Architecture và interop](https://reactnative.dev/blog/2025/10/08/react-native-0.82)
- [Android WindowInsets.Type](https://developer.android.com/reference/android/view/WindowInsets.Type)
- [Expo Continuous Native Generation: khi nào cần config plugin](https://docs.expo.dev/workflow/continuous-native-generation/)
- [React Native Directory metadata](https://github.com/react-native-community/directory/blob/main/react-native-libraries.json)

Các trang tài liệu thay đổi theo thời gian. Khi triển khai, dùng API/documentation phù hợp phiên bản fixture đã khóa; không áp dụng mù quáng hướng dẫn RN mới nhất vào fixture RN cũ.

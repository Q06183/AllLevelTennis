# AllLevelTennis

欢迎使用 AllLevelTennis 项目！本项目使用 Expo 和 React Native 构建。

---

## 本地打包 Android APK 指南 (SOP)

本文档记录了如何在本地编译并生成 Android 的 APK 安装包。

### 前置环境要求
确保你的电脑已经配置了 Java (JDK 17) 和 Android SDK。
如果遇到 `JAVA_HOME` 找不到或 `sdkmanager` 命令不存在的问题，请在终端执行以下命令刷新环境变量：
```bash
source ~/.zshrc
```

### 核心步骤

**1. （可选）重新生成/同步原生 Android 项目**
如果你修改了 `app.json`（如包名、图标配置）或者安装了新的原生依赖包，需要先执行以下通用命令生成 Android 工程：
```bash
npx expo prebuild --clean --platform android
```
*(注：该命令会重新生成 `android` 目录。如果仅修改了 React/TS 业务代码则无需执行。)*

**2. 进入 `android` 目录**
因为打包脚本位于 android 文件夹内，你必须先进入该目录：
```bash
cd android
```

**3. 执行本地打包命令**
使用 Gradle 编译 Debug 版本的 APK：
```bash
./gradlew assembleDebug
```
*(注意：首次执行时可能会下载 Gradle 发行包和依赖库，后续打包速度会非常快。)*

**4. 获取并安装 APK**
当终端输出 `BUILD SUCCESSFUL` 时，说明打包完成。生成的 APK 文件路径位于：
`android/app/build/outputs/apk/debug/app-debug.apk`

你可以运行以下命令直接在访达 (Finder) 中打开 APK 所在的文件夹：
```bash
open app/build/outputs/apk/debug/
```

---

### 常见问题与进阶操作

*   **打 Release (正式版) 包（用于真机独立离线运行）**：
    如果你需要构建真正可以在手机上脱离电脑离线运行的版本，请按以下顺序执行：
    ```bash
    cd android
    ./gradlew assembleRelease
    ```
    当终端输出 `BUILD SUCCESSFUL` 时，生成的正式版 APK 即可使用。
    你可以执行以下命令直接在访达中打开生成的文件夹：
    ```bash
    open app/build/outputs/apk/release/
    ```
    *(注：正式包通常需要配置签名文件才能在手机上正常安装使用。)*

*   **直接安装到手机/模拟器**：
    如果手机已通过数据线连接到电脑，或安卓模拟器已打开，只需在项目根目录执行：
    ```bash
    npx expo run:android
    ```
    此命令会自动完成编译流程，并直接启动应用。

---

## iOS 运行与原生工程生成指南 (SOP)

本文档记录了如何在本地运行 iOS 版本以及如何在 Xcode 中打开并编译项目。

### 前置环境要求
确保你的 macOS 电脑上已经安装了 **Xcode**（可通过 Mac App Store 免费下载）。

### 方法一：使用 Expo 直接在 iOS 模拟器运行（最简单，推荐）
如果你只是想在 iOS 模拟器里查看效果或开发业务逻辑，不需要修改原生代码，推荐使用此方法：

**1. 在项目根目录启动服务**
```bash
npx expo start
```

**2. 启动 iOS 模拟器**
在终端出现二维码后，按下键盘上的 **`i`** 键，Expo 会自动启动 iOS 模拟器并运行项目。

### 方法二：在 Xcode 中打开并运行（适合打包或修改原生代码）
如果你需要配置证书、修改原生模块或进行原生级别的调试，需要先生成原生 iOS 工程。

**1. 生成原生 iOS 目录**
在终端执行以下命令，这会生成 `ios` 文件夹并自动安装所需的 CocoaPods 依赖：
```bash
npx expo prebuild --platform ios
```
*(注：如果需要清理缓存重新生成，可加上 `--clean` 参数：`npx expo prebuild --clean --platform ios`)*

**2. 在 Xcode 中打开项目**
生成完毕后，通过以下命令打开项目工作区：
```bash
open ios/AllLevelTennis.xcworkspace
```
*(注意：务必打开 `.xcworkspace` 文件，而不是 `.xcodeproj`)*

**3. 在 Xcode 中编译运行 (开发/调试模式)**
1. Xcode 界面加载完成后，在顶部中间的设备列表中，选择一个你想用的模拟器（如 iPhone 15）。
2. 点击左上角的 **▶ (Run)** 按钮，或者使用快捷键 `Cmd + R` 开始编译并运行。
*(注：默认的 Debug 模式需要依赖电脑端的 Metro 服务提供 JS Bundle，支持热更新。如果服务未启动，应用会报错 `-1004 Could not connect to the server`)*

### 方法三：打包完全独立、离线可运行的正式版 (Release 包)
如果你希望应用**不依赖电脑端的 Server**，将 JS 代码和资源直接打进 App 包中（真正可脱机运行的独立 App），请使用 **Release** 模式编译。

**方式 A：通过命令行（推荐）**
在项目根目录运行以下命令，会自动以 Release 模式编译并安装到模拟器：
```bash
npx expo run:ios --configuration Release
```

**方式 B：通过 Xcode 操作**
1. 在 Xcode 顶部菜单栏，点击左上角的方案名称 `AllLevelTennis`。
2. 选择 **`Edit Scheme...`** (快捷键 `Cmd + <`)。
3. 在左侧选择 **`Run`**，右侧的 `Build Configuration` 切换为 **`Release`**。
4. 关闭窗口，点击 **▶ (Run)** 重新编译运行。
*(注：开发时如需恢复热更新，记得将 Scheme 改回 `Debug` 模式)*

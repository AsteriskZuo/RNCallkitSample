_中文 | [English](./README.md)_

---

## 示例项目介绍

该项目为 Uikit SDK 演示项目。

主要进行 Uikit SDK 最简单的演示。如果需要更加详细的使用示例，请看其他示例项目。

## 环境

- react-native: 0.70.0 以上
- nodejs: 16.18.0 以上

## 创建项目

```sh
npx react-native init RNUikitSample --template react-native-template-typescript
```

## 项目初始化

```sh
yarn
```

## 项目配置

### package.json

添加 Chat SDK 和 Uikit SDK

```sh
yarn add react-native-chat-sdk
yarn add react-native-chat-uikit
```

添加页面路由组件

```sh
yarn add @react-navigation/native
yarn add @react-navigation/native-stack
yarn add react-native-safe-area-context
yarn add react-native-screens
```

添加 Uikit SDK 需要的依赖

```sh
yarn add @react-native-clipboard/clipboard
yarn add @react-native-firebase/app
yarn add @react-native-firebase/messaging
yarn add @react-native-camera-roll/camera-roll
yarn add @react-native-async-storage/async-storage
yarn add react-native-audio-recorder-player
yarn add react-native-create-thumbnail
yarn add react-native-document-picker
yarn add react-native-file-access
yarn add react-native-image-picker
yarn add react-native-permissions
yarn add react-native-video
yarn add react-native-get-random-values
```

### ios

在 `Info.plist` 添加权限

```xml
	<key>NSLocationWhenInUseUsageDescription</key>
	<string></string>
	<key>NSMicrophoneUsageDescription</key>
	<string>mic</string>
	<key>NSPhotoLibraryUsageDescription</key>
	<string>photo</string>
	<key>NSUserNotificationsUsageDescription</key>
	<string>notifications</string>
```

在 `Podfile` 添加额外配置

```ruby
  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
```

```ruby
  permissions_path = File.join(File.dirname(`node --print "require.resolve('react-native-permissions/package.json')"`), "ios")
  pod 'Permission-Camera', :path => "#{permissions_path}/Camera"
  pod 'Permission-MediaLibrary', :path => "#{permissions_path}/MediaLibrary"
  pod 'Permission-Microphone', :path => "#{permissions_path}/Microphone"
  pod 'Permission-Notifications', :path => "#{permissions_path}/Notifications"
  pod 'Permission-PhotoLibrary', :path => "#{permissions_path}/PhotoLibrary"
```

### android

在 `AndroidManifest.xml` 添加权限

```xml
  <uses-permission android:name="android.permission.INTERNET"/>
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
```

在 `build.gradle` 添加 `kotlin` 支持

```groovy
buildscript {
    ext {
        // ...
        kotlinVersion = '1.6.10'
        if (findProperty('android.kotlinVersion')) {
            kotlinVersion = findProperty('android.kotlinVersion')
        }
    }
    dependencies {
        // ...
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}
```

## 代码实现

### 配置本地环境

```typescript
export const RootParamsList: Record<string, object | undefined> = {
  Main: {},
  Chat: {},
};
export let appKey = '1135220126133718#demo';
export let defaultId = 'asterisk001';
export let defaultPs = 'qwerty';
export const autoLogin = false;
export const debugModel = true;
export const defaultTargetId = 'du006';

try {
  appKey = require('./env').appKey;
  defaultId = require('./env').id;
  defaultPs = require('./env').ps;
} catch (error) {
  console.error(error);
}
```

### 初始化 Uikit SDK

```typescript
const Root = createNativeStackNavigator();

const App = () => {
  console.log('App:');
  return (
    <UikitContainer
      option={{
        appKey: appKey,
        autoLogin: autoLogin,
        debugModel: debugModel,
      }}>
      <NavigationContainer>
        <Root.Navigator initialRouteName="Main">
          <Root.Screen name="Main" component={MainScreen} />
          <Root.Screen name="Chat" component={ChatScreen} />
        </Root.Navigator>
      </NavigationContainer>
    </UikitContainer>
  );
};

export default App;
```

### 登录和退出

```typescript
export function MainScreen({
  navigation,
}: NativeStackScreenProps<typeof RootParamsList>): JSX.Element {
  console.log('test:', defaultId, defaultPs);
  const placeholder1 = 'Please User Id';
  const placeholder2 = 'Please User Password or Token';
  const placeholder3 = 'Please Chat Target Id';
  const [id, setId] = React.useState(defaultId);
  const [token, setToken] = React.useState(defaultPs);
  const [chatId, setChatId] = React.useState(defaultTargetId);
  const {login: loginAction, logout: logoutAction} = useChatSdkContext();
  const login = () => {
    loginAction({
      id,
      pass: token,
      type: 'easemob',
      onResult: (result: {result: boolean; error?: any}) => {
        console.log('logout:', result.result, result.error);
      },
    });
  };
  const logout = () => {
    logoutAction({
      onResult: (result: {result: boolean; error?: any}) => {
        console.log('logout:', result.result, result.error);
      },
    });
  };
  const gotoChat = () => {
    if (chatId.length > 0) {
      navigation.push('Chat', {chatId: chatId, chatType: 0});
    }
  };
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={placeholder1}
            value={id}
            onChangeText={t => {
              setId(t);
            }}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder2}
            value={token}
            onChangeText={t => {
              setToken(t);
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button style={styles.button} onPress={login}>
            SIGN IN
          </Button>
          <Button style={styles.button} onPress={logout}>
            SIGN OUT
          </Button>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={placeholder3}
            value={chatId}
            onChangeText={t => {
              setChatId(t);
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button style={styles.button} onPress={gotoChat}>
            START CHAT
          </Button>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  button: {
    height: 40,
    marginHorizontal: 10,
  },
  inputContainer: {
    marginHorizontal: 20,
  },
  input: {
    height: 40,
    borderBottomColor: '#0041FF',
    borderBottomWidth: 1,
    backgroundColor: 'white',
    marginVertical: 10,
  },
});
```

### 集成聊天页面

```typescript
export function ChatScreen({
  route,
}: NativeStackScreenProps<typeof RootParamsList>): JSX.Element {
  console.log('test:', route.params);
  const chatRef = React.useRef<ChatFragmentRef>({} as any);
  const chatId = React.useRef((route.params as any).chatId ?? '').current;
  // const chatType = (route.params as any).chatType ?? 0;
  const [showSheet, setShowSheet] = React.useState(false);

  const onPressInInputVoiceButton = () => {
    Services.ms
      .startRecordAudio({
        audio: {
          AudioEncoderAndroid: AudioEncoderAndroidType.AAC,
          AudioSourceAndroid: AudioSourceAndroidType.MIC,
          AVModeIOS: AVModeIOSOption.measurement,
          AVEncoderAudioQualityKeyIOS: AVEncoderAudioQualityIOSType.high,
          AVNumberOfChannelsKeyIOS: 2,
          AVFormatIDKeyIOS: AVEncodingOption.aac,
        } as AudioSet,
        onPosition: pos => {
          console.log('test:startRecordAudio:pos:', pos);
        },
        onFailed: error => {
          console.warn('test:startRecordAudio:onFailed:', error);
        },
        onFinished: ({result, path, error}) => {
          console.log('test:startRecordAudio:onFinished:', result, path, error);
        },
      })
      .then(result => {
        console.log('test:startRecordAudio:result:', result);
      })
      .catch(error => {
        console.warn('test:startRecordAudio:error:', error);
      });
  };
  const onPressOutInputVoiceButton = () => {
    console.log('test:onPressOutInputVoiceButton:', Services.dcs);
    let localPath = Services.dcs.getFileDir(chatId, uuid());
    Services.ms
      .stopRecordAudio()
      .then((result?: {pos: number; path: string}) => {
        if (result?.path) {
          const extension = getFileExtension(result.path);
          localPath = localPath + extension;
          Services.ms
            .saveFromLocal({
              targetPath: localPath,
              localPath: result.path,
            })
            .then(() => {
              onVoiceRecordEnd?.({
                localPath,
                duration: result.pos / 1000,
              });
            })
            .catch(error => {
              console.warn('test:startRecordAudio:save:error', error);
            });
        }
      })
      .catch(error => {
        console.warn('test:stopRecordAudio:error:', error);
      });
  };
  const onVoiceRecordEnd = (params: {localPath: string; duration: number}) => {
    chatRef.current.sendVoiceMessage(params);
  };

  const More = () => {
    if (showSheet === false) {
      return null;
    }

    const handlers1 = {
      onStartShouldSetResponder: (_: GestureResponderEvent): boolean => {
        return true;
      },
      onStartShouldSetResponderCapture: (_: GestureResponderEvent): boolean => {
        return false;
      },
      onResponderGrant: (_: GestureResponderEvent) => {},
      onResponderRelease: (_: GestureResponderEvent) => {
        console.log('test:onResponderRelease:1:');
        setShowSheet(false);
      },
    } as GestureResponderHandlers;
    const handlers2 = {
      onStartShouldSetResponder: (_: GestureResponderEvent): boolean => {
        return true;
      },
      onStartShouldSetResponderCapture: (_: GestureResponderEvent): boolean => {
        return false;
      },
      onResponderGrant: (_: GestureResponderEvent) => {},
      onResponderRelease: (_: GestureResponderEvent) => {
        console.log('test:onResponderRelease:2:');
      },
    } as GestureResponderHandlers;

    const onCamera = () => {
      setShowSheet(false);
      Services.ms
        .openCamera({})
        .then(result => {
          console.log('openCamera:', Platform.OS, result);
          chatRef.current?.sendImageMessage([
            {
              name: result?.name ?? '',
              localPath: result?.uri ?? '',
              fileSize: result?.size ?? 0,
              imageType: result?.type ?? '',
              width: result?.width ?? 0,
              height: result?.height ?? 0,
              onResult: r => {
                console.log('openCamera:result:', r);
              },
            },
          ]);
        })
        .catch(error => {
          console.warn('error:', error);
        });
    };
    const onAlbum = () => {
      setShowSheet(false);
      Services.ms
        .openMediaLibrary({selectionLimit: 1})
        .then(result => {
          console.log('openMediaLibrary:', Platform.OS, result);
          chatRef.current?.sendImageMessage(
            result.map(value => {
              return {
                name: value?.name ?? '',
                localPath: value?.uri ?? '',
                fileSize: value?.size ?? 0,
                imageType: value?.type ?? '',
                width: value?.width ?? 0,
                height: value?.height ?? 0,
                onResult: r => {
                  console.log('openMediaLibrary:result:', r);
                },
              };
            }),
          );
        })
        .catch(error => {
          console.warn('error:', error);
        });
    };
    const onFiles = async () => {
      setShowSheet(false);
      const ret = await Services.ps.hasMediaLibraryPermission();
      if (ret === false) {
        await Services.ps.requestMediaLibraryPermission();
      }
      Services.ms
        .openDocument({})
        .then(result => {
          console.log('openDocument:', Platform.OS, result);
          chatRef.current?.sendFileMessage({
            localPath: result?.uri ?? '',
            fileSize: result?.size ?? 0,
            displayName: result?.name,
            onResult: r => {
              console.log('openDocument:result', r);
            },
          });
        })
        .catch(error => {
          console.warn('error:', error);
        });
    };

    return (
      <View style={[styles.moreContainer]} {...handlers1}>
        <View style={styles.contentContainer} {...handlers2}>
          <Button style={styles.button} onPress={onCamera}>
            Camera
          </Button>
          <Button style={styles.button} onPress={onAlbum}>
            Album
          </Button>
          <Button style={styles.button} onPress={onFiles as any}>
            Files
          </Button>
        </View>
      </View>
    );
  };

  const ChatFragmentMemo = React.memo(ChatFragment);
  return (
    <ScreenContainer mode="padding" edges={['right', 'left', 'bottom']}>
      <ChatFragmentMemo
        propsRef={chatRef}
        screenParams={{
          params: route.params as any,
        }}
        onPressInInputVoiceButton={onPressInInputVoiceButton}
        onPressOutInputVoiceButton={onPressOutInputVoiceButton}
        onVoiceRecordEnd={onVoiceRecordEnd}
        onClickInputMoreButton={() => {
          setShowSheet(true);
        }}
      />
      <More />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  moreContainer: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    height: 200,
  },
  button: {
    height: 40,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 20,
  },
});
```

完整示例 [参考](./App.tsx)

## 运行和演示

执行 React-Native 运行命令 `yarn run ios` 或者 `yarn run android`，开始体验吧。

## Q & A

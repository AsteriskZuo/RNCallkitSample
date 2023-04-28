_中文 | [English](./README.md)_

---

## 示例项目介绍

该项目为 Callkit SDK 演示项目。

主要进行 Callkit SDK 最简单的演示。如果需要更加详细的使用示例，请看其他示例项目。

## 环境

- react-native: 0.70.0 以上
- nodejs: 16.18.0 以上

## 创建项目

```sh
npx react-native@latest init RNCallkitSample --template react-native-template-typescript
```

## 项目初始化

```sh
yarn
```

## 项目配置

### package.json

添加 Chat SDK 和 Callkit SDK

```sh
yarn add react-native-chat-sdk
yarn add react-native-chat-callkit
yarn add react-native-agora
```

**说明** 集成 `react-native-chat-callkit` 有两种方式：

1. 集成本地依赖 `yarn add <local repo path>`
2. 集成 npm 包 `yarn add react-native-chat-callkit`

[react-native-chat-callkit repo](https://github.com/easemob/react-native-chat-library/packages/react-native-chat-callkit)

添加页面路由组件

```sh
yarn add @react-navigation/native
yarn add @react-navigation/native-stack
yarn add react-native-safe-area-context
yarn add react-native-screens
```

添加 Callkit SDK 需要的依赖

```sh
yarn add @react-native-camera-roll/camera-roll
yarn add @react-native-community/blur
yarn add @react-native-firebase/app
yarn add @react-native-firebase/messaging
yarn add react-native-device-info
yarn add react-native-permissions
yarn add react-native-vector-icons
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
  Call: {},
};
export let appKey = '<your app key>';
export let agoraAppId = '<your agora app key>';
export let defaultId = '';
export let defaultPs = '';
export const autoLogin = false;
export const debugModel = true;
export const defaultTargetId = ['<foo>', '<bar>'];

try {
  appKey = require('./env').appKey;
  defaultId = require('./env').id;
  defaultPs = require('./env').ps;
  agoraAppId = require('./env').agoraAppId;
} catch (error) {
  console.error(error);
}
```

### 初始化 Callkit SDK

```typescript
const Root = createNativeStackNavigator();

const App = () => {
  console.log('App:');
  const [ready, setReady] = React.useState(false);

  // AppServerClient.rtcTokenUrl = 'http://a41.easemob.com/token/rtc/channel';
  // AppServerClient.mapUrl = 'http://a41.easemob.com/agora/channel/mapper';

  if (ready === false) {
    const init = () => {
      ChatClient.getInstance()
        .init(
          new ChatOptions({appKey: appKey, autoLogin: false, debugModel: true}),
        )
        .then(() => {
          setReady(true);
        })
        .catch(e => {
          console.warn('test:error:', e);
        });
    };
    init();
  }

  if (ready === false) {
    return <ActivityIndicator />;
  }

  return (
    <CallkitContainer
      option={{
        appKey: appKey,
        agoraAppId: agoraAppId,
      }}
      type="easemob"
      requestRTCToken={(params: {
        appKey: string;
        channelId: string;
        userId: string;
        userChannelId?: number | undefined;
        type?: 'easemob' | 'agora' | undefined;
        onResult: (params: {data?: any; error?: any}) => void;
      }) => {
        console.log('requestRTCToken:', params);
        AppServerClient.getRtcToken({
          userAccount: params.userId,
          channelId: params.channelId,
          appKey,
          userChannelId: params.userChannelId,
          type: params.type,
          onResult: (pp: {data?: any; error?: any}) => {
            console.log('test:', pp);
            params.onResult(pp);
          },
        });
      }}
      requestUserMap={(params: {
        appKey: string;
        channelId: string;
        userId: string;
        onResult: (params: {data?: any; error?: any}) => void;
      }) => {
        console.log('requestUserMap:', params);
        AppServerClient.getRtcMap({
          userAccount: params.userId,
          channelId: params.channelId,
          appKey,
          onResult: (pp: {data?: any; error?: any}) => {
            console.log('requestUserMap:getRtcMap:', pp);
            params.onResult(pp);
          },
        });
      }}
      requestCurrentUser={(params: {
        onResult: (params: {user: CallUser; error?: any}) => void;
      }) => {
        console.log('requestCurrentUser:', params);
        ChatClient.getInstance()
          .getCurrentUsername()
          .then(result => {
            params.onResult({
              user: {
                userId: result,
                userNickName: result,
              },
            });
          })
          .catch(error => {
            console.warn('test:getCurrentUsername:error:', error);
          });
      }}>
      <NavigationContainer>
        <Root.Navigator initialRouteName="Main">
          <Root.Screen name="Main" component={MainScreen} />
          <Root.Screen
            options={() => {
              return {
                headerShown: false,
                presentation: 'fullScreenModal',
              };
            }}
            name="Call"
            component={CallScreen}
          />
        </Root.Navigator>
      </NavigationContainer>
    </CallkitContainer>
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
  const {call} = useCallkitSdkContext();
  const placeholder1 = 'Please User Id';
  const placeholder2 = 'Please User Password or Token';
  const placeholder3 = 'Please Call Target Ids';
  const [id, setId] = React.useState(defaultId);
  const [token, setToken] = React.useState(defaultPs);
  const [ids, setIds] = React.useState(defaultTargetId);
  const [logged, setLogged] = React.useState(false);
  const type = 'easemob';
  const login = () => {
    if (type === 'easemob') {
      ChatClient.getInstance()
        .login(id, token)
        .then(() => {
          console.log('test:login:success:');
          setLogged(true);
        })
        .catch(e => {
          console.log('test:error:', e);
        });
    } else {
      ChatClient.getInstance()
        .loginWithAgoraToken(id, token)
        .then(() => {
          console.log('test:login:success:');
          setLogged(false);
        })
        .catch(e => {
          console.log('test:error:', e);
        });
    }
  };
  const registry = () => {};
  const logout = () => {
    ChatClient.getInstance()
      .logout()
      .then(() => {
        console.log('test:logout:success:');
      })
      .catch(e => {
        console.log('test:error:', e);
      });
  };
  const gotoCall = React.useCallback(
    async (params: {
      av: 'audio' | 'video';
      sm: 'single' | 'multi';
      isInviter: boolean;
      inviterId?: string;
    }) => {
      if (logged === false) {
        console.log('test:', 'Please log in first.');
      }
      if ((await requestAV()) === false) {
        console.log('test:', 'Failed to request permission.');
        return;
      }
      if (ids.length > 0) {
        const {av, sm, isInviter, inviterId} = params;
        if (isInviter === false) {
          navigation.push('Call', {ids, av, sm, isInviter, inviterId});
        } else {
          navigation.push('Call', {ids, av, sm, isInviter});
        }
      }
    },
    [ids, logged, navigation],
  );
  const addListener = React.useCallback(() => {
    const listener = {
      onCallReceived: (params: {
        channelId: string;
        inviterId: string;
        callType: CallType;
        extension?: any;
      }) => {
        console.log('onCallReceived:', params);
        const av =
          params.callType === CallType.Video1v1 ||
          params.callType === CallType.VideoMulti
            ? 'video'
            : 'audio';
        const sm =
          params.callType === CallType.AudioMulti ||
          params.callType === CallType.VideoMulti
            ? 'multi'
            : 'single';
        gotoCall({av, sm, isInviter: false, inviterId: params.inviterId});
      },
      onCallOccurError: (params: {channelId: string; error: CallError}) => {
        console.warn('onCallOccurError:', params);
      },
    } as CallListener;
    call.addListener(listener);
    return () => {
      call.removeListener(listener);
    };
  }, [call, gotoCall]);
  React.useEffect(() => {
    const ret = addListener();
    return () => ret();
  }, [addListener]);
  return (
    <SafeAreaView
      style={styles.container}
      mode="padding"
      edges={['right', 'left', 'bottom']}>
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
          <Pressable style={styles.button} onPress={login}>
            <Text style={styles.buttonText}>SIGN IN</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={registry}>
            <Text style={styles.buttonText}>SIGN UP</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={logout}>
            <Text style={styles.buttonText}>SIGN OUT</Text>
          </Pressable>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder={placeholder3}
            value={JSON.stringify(ids)}
            onChangeText={t => {
              try {
                const r = JSON.parse(t);
                setIds(r as string[]);
              } catch (error) {
                console.log('test:error:', error);
              }
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            style={styles.button}
            onPress={() => {
              gotoCall({av: 'audio', sm: 'single', isInviter: true});
            }}>
            <Text style={styles.buttonText}>Single Audio Call</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => {
              gotoCall({av: 'video', sm: 'single', isInviter: true});
            }}>
            <Text style={styles.buttonText}>Single Video Call</Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => {
              gotoCall({av: 'video', sm: 'multi', isInviter: true});
            }}>
            <Text style={styles.buttonText}>Multi Call</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  button: {
    height: 40,
    marginHorizontal: 10,
    backgroundColor: 'blue',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  inputContainer: {
    marginHorizontal: 20,
    // backgroundColor: 'red',
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

### 动态请求权限

```typescript
import {request} from 'react-native-permissions';

export async function requestAV(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const mic = await request('ios.permission.MICROPHONE');
      const cam = await request('ios.permission.CAMERA');
      const blu = await request('ios.permission.BLUETOOTH_PERIPHERAL');
      if (mic === 'granted' && cam === 'granted') {
        return true;
      }
      console.log('test:', mic, cam, blu);
    } else if (Platform.OS === 'android') {
      const mic = await request('android.permission.CAMERA');
      const cam = await request('android.permission.RECORD_AUDIO');
      const blu = await request('android.permission.BLUETOOTH_CONNECT');
      if (mic === 'granted' && cam === 'granted' && blu === 'granted') {
        return true;
      }
      console.log('test:', mic, cam, blu);
    }
    return false;
  } catch (error) {
    console.log('test:', error);
    return false;
  }
}
```

### 获取 token 和 用户关系映射

```typescript
export class AppServerClient {
  private static _rtcTokenUrl: string =
    'http://a1.easemob.com/token/rtcToken/v1';
  private static _mapUrl: string = 'http://a1.easemob.com/channel/mapper';

  protected _(): void {}
  private static async req(params: {
    method: 'GET' | 'POST';
    url: string;
    kvs: any;
    from: 'requestToken' | 'requestUserMap';
    onResult: (p: {data?: any; error?: any}) => void;
  }): Promise<void> {
    // console.log('AppServerClient:req:', params);
    try {
      const accessToken = await ChatClient.getInstance().getAccessToken();
      // console.log('AppServerClient:req:', accessToken);
      const json = params.kvs as {
        userAccount: string;
        channelName: string;
        appkey: string;
      };
      const url = `${params.url}?appkey=${encodeURIComponent(
        json.appkey,
      )}&channelName=${encodeURIComponent(
        json.channelName,
      )}&userAccount=${encodeURIComponent(json.userAccount)}`;
      // console.log('AppServerClient:req:', url);
      const response = await fetch(url, {
        method: params.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const value = await response.json();
      // console.log('AppServerClient:req:', value);
      if (value.code !== 'RES_0K') {
        params.onResult({error: {code: value.code}});
      } else {
        if (params.from === 'requestToken') {
          params.onResult({
            data: {
              token: value.accessToken,
              uid: value.agoraUserId,
            },
          });
        } else if (params.from === 'requestUserMap') {
          params.onResult({
            data: {
              result: value.result,
            },
          });
        }
      }
    } catch (error) {
      params.onResult({error});
    }
  }
  public static getRtcToken(params: {
    userAccount: string;
    channelId: string;
    appKey: string;
    userChannelId?: number | undefined;
    type?: 'easemob' | 'agora' | undefined;
    onResult: (params: {data?: any; error?: any}) => void;
  }): void {
    const tokenUrl = (url: string) => {
      let ret = url;
      if (params.type !== 'easemob') {
        ret += `/${params.channelId}/agorauid/${params.userChannelId!}`;
      }
      return ret;
    };

    AppServerClient.req({
      method: 'GET',
      url: tokenUrl(AppServerClient._rtcTokenUrl),
      kvs: {
        userAccount: params.userAccount,
        channelName: params.channelId,
        appkey: params.appKey,
      },
      from: 'requestToken',
      onResult: params.onResult,
    });
  }
  public static getRtcMap(params: {
    userAccount: string;
    channelId: string;
    appKey: string;
    onResult: (params: {data?: any; error?: any}) => void;
  }): void {
    AppServerClient.req({
      method: 'GET',
      url: AppServerClient._mapUrl,
      kvs: {
        userAccount: params.userAccount,
        channelName: params.channelId,
        appkey: params.appKey,
      },
      from: 'requestUserMap',
      onResult: params.onResult,
    });
  }

  public static set rtcTokenUrl(url: string) {
    AppServerClient._rtcTokenUrl = url;
  }
  public static set mapUrl(url: string) {
    AppServerClient._mapUrl = url;
  }
}
```

### 集成音视频通话

```typescript
export function CallScreen({
  route,
  navigation,
}: NativeStackScreenProps<typeof RootParamsList>): JSX.Element {
  console.log('test:', route.params);
  const av = (route.params as any).av as 'audio' | 'video';
  const sm = (route.params as any).sm as 'single' | 'multi';
  const ids = (route.params as any).ids as string[];
  const currentId = React.useRef('');
  const inviterId = React.useRef((route.params as any).inviterId ?? '');
  const callType = React.useRef(av).current;
  const isInviter = React.useRef((route.params as any).isInviter as boolean);
  const inviteeId = React.useRef(ids[0] ?? '');
  const inviteeIds = React.useRef(ids);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const init = () => {
      ChatClient.getInstance()
        .getCurrentUsername()
        .then(value => {
          currentId.current = value;
          isInviter.current = true;
          if (isInviter.current === true) {
            inviterId.current = currentId.current;
          }
          setReady(true);
        })
        .catch(e => {
          console.log('test:error:', e);
        });
    };
    init();
  }, []);

  if (ready === false) {
    return <ActivityIndicator />;
  }

  console.log(
    'test:2:',
    inviteeId.current,
    currentId.current,
    isInviter.current,
    callType,
  );

  if (sm === 'single') {
    return (
      <SingleCall
        inviterId={inviteeId.current}
        currentId={currentId.current}
        currentName={currentId.current}
        callType={callType}
        isInviter={isInviter.current}
        onClose={(
          elapsed: number,
          reason?: CallEndReason | undefined,
        ): void => {
          console.log('test:', elapsed, reason);
          navigation.goBack();
        }}
        onError={(error: CallError) => {
          console.log('test:', error);
          navigation.goBack();
        }}
        inviteeId={inviteeId.current}
      />
    );
  } else {
    return (
      <MultiCall
        inviterId={inviteeId.current}
        currentId={currentId.current}
        currentName={currentId.current}
        callType={callType}
        isInviter={isInviter.current}
        onClose={(
          elapsed: number,
          reason?: CallEndReason | undefined,
        ): void => {
          console.log('test:', elapsed, reason);
          navigation.goBack();
        }}
        onError={(error: CallError) => {
          console.log('test:', error);
          navigation.goBack();
        }}
        inviteeIds={inviteeIds.current}
      />
    );
  }
}
```

完整示例 [参考](./App.tsx)

## 运行和演示

执行 React-Native 运行命令 `yarn run ios` 或者 `yarn run android`，开始体验吧。

## Q & A

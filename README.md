_English | [中文](./README.zh.md)_

---

## Example project introduction

This project is a demo project of Callkit SDK.

Mainly for the simplest demo of Callkit SDK. For more detailed usage examples, please see other example projects.

## environment

- react-native: 0.70.0 or higher
- nodejs: 16.18.0 or later

## create project

```sh
npx react-native@latest init RNCallkitSample --template react-native-template-typescript
```

## Project initialization

```sh
yarn
```

## Project configuration

### package.json

Add Chat SDK and Callkit SDK

```sh
yarn add react-native-chat-sdk
yarn add react-native-chat-Callkit
yarn add react-native-agora
```

**Description** There are two ways to integrate `react-native-chat-callkit`:

1. Integrate local dependencies `yarn add <local repo path>`
2. Integrate npm package `yarn add react-native-chat-callkit`

[react-native-chat-callkit repo](https://github.com/easemob/react-native-chat-library/packages/react-native-chat-callkit)

Add page routing component

```sh
yarn add @react-navigation/native
yarn add @react-navigation/native-stack
yarn add react-native-safe-area-context
yarn add react-native-screens
```

Add dependencies required by Callkit SDK

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

Add permissions in `Info.plist`

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

Add additional configuration in `Podfile`

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

Add permission in `AndroidManifest.xml`

```xml
   <uses-permission android:name="android.permission.INTERNET"/>
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
```

Add `kotlin` support in `build.gradle`

```groovy
buildscript {
     ext {
         //...
         kotlinVersion = '1.6.10'
         if (findProperty('android. kotlinVersion')) {
             kotlinVersion = findProperty('android. kotlinVersion')
         }
     }
     dependencies {
         //...
         classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
     }
}
```

## Code

### Configure the local environment

```typescript
export const RootParamsList: Record<string, object | undefined> = {
  Main: {},
  Call: {},
};
export let appKey = '1135220126133718#demo';
export let agoraAppId = '';
export let defaultId = 'asterisk001';
export let defaultPs = 'qwerty';
export let accountType: 'agora' | 'easemob' | undefined;
export const autoLogin = false;
export const debugModel = true;
export let defaultTargetId = ['asterisk025'];

try {
  appKey = require('./env').appKey;
  defaultId = require('./env').id;
  defaultPs = require('./env').ps;
  agoraAppId = require('./env').agoraAppId;
  accountType = require('./env').accountType;
  defaultTargetId = [require('./env').targetId as string];
} catch (error) {
  console.error(error);
}
```

### Initialize Callkit SDK

```typescript
const Root = createNativeStackNavigator();

const App = () => {
  dlog.log('App:');
  const [ready, setReady] = React.useState(false);
  const enableLog = true;

  if (accountType !== 'easemob') {
    AppServerClient.rtcTokenUrl = 'https://a41.easemob.com/token/rtc/channel';
    AppServerClient.mapUrl = 'https://a41.easemob.com/agora/channel/mapper';
  }

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
          dlog.warn('init:error:', e);
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
      enableLog={enableLog}
      type={accountType}
      requestRTCToken={(params: {
        appKey: string;
        channelId: string;
        userId: string;
        userChannelId?: number | undefined;
        type?: 'easemob' | 'agora' | undefined;
        onResult: (params: {data?: any; error?: any}) => void;
      }) => {
        dlog.log('requestRTCToken:', params);
        AppServerClient.getRtcToken({
          userAccount: params.userId,
          channelId: params.channelId,
          appKey,
          userChannelId: params.userChannelId,
          type: params.type,
          onResult: (pp: {data?: any; error?: any}) => {
            dlog.log('requestRTCToken:onResult:', pp);
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
        dlog.log('requestUserMap:', params);
        AppServerClient.getRtcMap({
          userAccount: params.userId,
          channelId: params.channelId,
          appKey,
          onResult: (pp: {data?: any; error?: any}) => {
            dlog.log('requestUserMap:onResult:', pp);
            params.onResult(pp);
          },
        });
      }}
      requestCurrentUser={(params: {
        onResult: (params: {user: CallUser; error?: any}) => void;
      }) => {
        dlog.log('requestCurrentUser:', params);
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
            dlog.warn('requestCurrentUser:error:', error);
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

### Login and logout

```typescript
export function MainScreen({
  navigation,
}: NativeStackScreenProps<typeof RootParamsList>): JSX.Element {
  dlog.log('MainScreen:', defaultId, defaultPs);
  const {call} = useCallkitSdkContext();
  const placeholder1 = 'Please User Id';
  const placeholder2 = 'Please User Password or Token';
  const placeholder3 = 'Please Call Target Ids';
  const [id, setId] = React.useState(defaultId);
  const [token, setToken] = React.useState(defaultPs);
  const [ids, setIds] = React.useState(defaultTargetId);
  const [v, setV] = React.useState(JSON.stringify(defaultTargetId));
  const [logged, setLogged] = React.useState(false);
  const type = accountType;
  const logRef = React.useRef({
    logHandler: (message?: any, ...optionalParams: any[]) => {
      console.log(message, ...optionalParams);
    },
  });

  dlog.handler = (message?: any, ...optionalParams: any[]) => {
    logRef.current?.logHandler?.(message, ...optionalParams);
  };

  const setValue = (t: string) => {
    try {
      setIds(JSON.parse(t));
    } catch (error) {
      dlog.warn('value:', error);
    } finally {
      setV(t);
    }
  };
  const login = () => {
    dlog.log('MainScreen:login:', id, token, type);
    if (type !== 'easemob') {
      AppServerClient.getAccountToken({
        userId: id,
        userPassword: token,
        onResult: (params: {data?: any; error?: any}) => {
          if (params.error === undefined) {
            ChatClient.getInstance()
              .loginWithAgoraToken(id, params.data.token)
              .then(() => {
                dlog.log('loginWithAgoraToken:success:');
                setLogged(true);
              })
              .catch(e => {
                dlog.log('loginWithAgoraToken:error:', e);
              });
          } else {
            dlog.log('loginWithAgoraToken:error:', params.error);
          }
        },
      });
    } else {
      ChatClient.getInstance()
        .login(id, token)
        .then(() => {
          dlog.log('login:success:');
          setLogged(true);
        })
        .catch(e => {
          dlog.log('login:error:', e);
        });
    }
  };
  const registry = () => {
    AppServerClient.registerAccount({
      userId: id,
      userPassword: token,
      onResult: (params: {data?: any; error?: any}) => {
        dlog.log('registerAccount:', id, token, params);
      },
    });
  };
  const logout = () => {
    ChatClient.getInstance()
      .logout()
      .then(() => {
        dlog.log('logout:success:');
        setLogged(false);
      })
      .catch(e => {
        dlog.log('logout:error:', e);
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
        dlog.log('gotoCall:', 'Please log in first.');
      }
      if ((await requestAV()) === false) {
        dlog.log('gotoCall:', 'Failed to request permission.');
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
        dlog.log('onCallReceived:', params);
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
        dlog.warn('onCallOccurError:', params);
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
            value={v}
            onChangeText={setValue}
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
        <LogMemo propsRef={logRef} />
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

### Request permissions

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
      dlog.log('requestAV:', mic, cam, blu);
    } else if (Platform.OS === 'android') {
      const mic = await request('android.permission.CAMERA');
      const cam = await request('android.permission.RECORD_AUDIO');
      const blu = await request('android.permission.BLUETOOTH_CONNECT');
      if (mic === 'granted' && cam === 'granted') {
        return true;
      }
      dlog.log('requestAV:', mic, cam, blu);
    }
    return false;
  } catch (error) {
    dlog.log('requestAV:', error);
    return false;
  }
}
```

### Get token and users map

```typescript
export class AppServerClient {
  private static _rtcTokenUrl: string =
    'https://a1.easemob.com/token/rtcToken/v1';
  private static _mapUrl: string = 'https://a1.easemob.com/channel/mapper';
  private static _regUrl: string =
    'https://a41.easemob.com/app/chat/user/register';
  private static _tokenUrl: string =
    'https://a41.easemob.com/app/chat/user/login';

  protected _(): void {}
  private static async req(params: {
    method: 'GET' | 'POST';
    url: string;
    kvs: any;
    from: 'requestToken' | 'requestUserMap';
    onResult: (p: {data?: any; error?: any}) => void;
  }): Promise<void> {
    dlog.log('AppServerClient:req:', params);
    try {
      const accessToken = await ChatClient.getInstance().getAccessToken();
      dlog.log('AppServerClient:req:', accessToken);
      const json = params.kvs as {
        userAccount: string;
        channelName: string;
        appkey: string;
        userChannelId?: number;
      };
      const url = `${params.url}?appkey=${encodeURIComponent(
        json.appkey,
      )}&channelName=${encodeURIComponent(
        json.channelName,
      )}&userAccount=${encodeURIComponent(json.userAccount)}`;
      dlog.log('AppServerClient:req:', url);
      const response = await fetch(url, {
        method: params.method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const value = await response.json();
      dlog.log('AppServerClient:req:', value, value.code);
      if (value.code === 'RES_0K' || value.code === 'RES_OK') {
        if (params.from === 'requestToken') {
          params.onResult({
            data: {
              token: value.accessToken,
              uid: value.agoraUserId ?? json.userChannelId,
            },
          });
        } else if (params.from === 'requestUserMap') {
          params.onResult({
            data: {
              result: value.result,
            },
          });
        }
      } else {
        params.onResult({error: {code: value.code}});
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
      dlog.log('test:tokenUrl', params.type, url);
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
        userChannelId: params.userChannelId,
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

  private static async req2(params: {
    userId: string;
    userPassword: string;
    from: 'registerAccount' | 'getAccountToken';
    onResult: (params: {data?: any; error?: any}) => void;
  }): Promise<void> {
    try {
      let url = '';
      if (params.from === 'getAccountToken') {
        url = AppServerClient._tokenUrl;
      } else if (params.from === 'registerAccount') {
        url = AppServerClient._regUrl;
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAccount: params.userId,
          userPassword: params.userPassword,
        }),
      });
      const value = await response.json();
      dlog.log('test:value:', url, value, value.code);
      if (value.code === 'RES_0K' || value.code === 'RES_OK') {
        if (params.from === 'getAccountToken') {
          params.onResult({data: {token: value.accessToken}});
        } else if (params.from === 'registerAccount') {
          params.onResult({data: {}});
        }
      } else {
        params.onResult({error: {code: value.code}});
      }
    } catch (error) {
      params.onResult({error});
    }
  }

  public static registerAccount(params: {
    userId: string;
    userPassword: string;
    onResult: (params: {data?: any; error?: any}) => void;
  }): void {
    this.req2({...params, from: 'registerAccount'});
  }

  public static getAccountToken(params: {
    userId: string;
    userPassword: string;
    onResult: (params: {data?: any; error?: any}) => void;
  }): void {
    this.req2({...params, from: 'getAccountToken'});
  }

  public static set rtcTokenUrl(url: string) {
    AppServerClient._rtcTokenUrl = url;
  }
  public static set mapUrl(url: string) {
    AppServerClient._mapUrl = url;
  }
  public static set regUrl(url: string) {
    AppServerClient._regUrl = url;
  }
  public static set tokenUrl(url: string) {
    AppServerClient._tokenUrl = url;
  }
}
```

Complete example [Reference](./App.tsx)

## Run and demo

Execute the React-Native run command `yarn run ios` or `yarn run android`, and start to experience it.

## more detailed example

[see](https://github.com/easemob/react-native-chat-library/tree/dev/examples/callkit-example)

## Q & A

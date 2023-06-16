AgoraChatCallKit is an open-source audio and video UI library developed based on Agora's real-time communications and signaling services. With this library, you can implement audio and video calling functionalities with enhanced synchronization between multiple devices. In scenarios where a user ID is logged in to multiple devices, once the user deals with an incoming call that is ringing on one device, all the other devices stop ringing simultaneously.

This page describes how to implement real-time audio and video communications using the AgoraChatCallKit.

## Understand the tech

The basic process for implementing real-time audio and video communications with AgoraChatCallKit is as follows:

1. Set up the local environment, including the `appkey`, `appAgoraId` and other information.
2. Initialize the CallKit component.
3. Add a listener to receive notifications, including receiving invitation notifications and error notifications.
4. For the call invitation on the caller side, load and display the components on the call page and perform the corresponding call operations on the components.
5. For the reception of the call invitation on the callee side, load and display the components on the call page.

## Prerequisites

Before proceeding, ensure that your development environment has the following:

- react-native: 0.66.0 or later
- nodejs: 16.18.0 or later

## Project setup

### Configure the local environment

1. Generate local environment variables:

```sh
yarn run env
```

2. Enter your local environment variables:

```typescript
export const RootParamsList: Record<string, object | undefined> = {
  Main: {},
  Call: {},
};
export let appKey = '<your app key>';
export let agoraAppId = '<App ID of your Agora RTC>';
export let defaultId = '<your user ID>';
export let defaultPs = '<your user token>';
export let accountType: 'agora' | 'easemob' | undefined;
export const autoLogin = false;
export const debugModel = true;
export let defaultTargetId = ['<target ID>'];

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

### Configure app permissions

iOS:

1. Add permissions in `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string></string>
<key>NSMicrophoneUsageDescription</key>
<string>mic</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>photo</string>
<key>NSUserNotificationsUsageDescription</key>
<string>notifications</string>
<key>NSBluetoothAlwaysUsageDescription</key>
<string>blue</string>
<key>NSBluetoothPeripheralUsageDescription</key>
<string>blue peripheral</string>
```

2. Add additional configurations in `Podfile`:

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

Android:

1. Add permissions in `AndroidManifest.xml`:

```xml
   <uses-permission android:name="android.permission.INTERNET"/>
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
```

2. Add `kotlin` support in `build.gradle`:

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

3. Request permissions dynamically.

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

### Integrate the Agora Chat SDK and the CallKit SDK

1. Open a terminal, enter the `RNCallkitSample` directory, and run the following commands to add the Agora Chat SDK and UIKit SDK in `package.json`.

```sh
yarn add react-native-chat-sdk
yarn add react-native-chat-Callkit
yarn add react-native-agora
```

For the project details, see the [react-native-chat-callkit repo](https://github.com/AgoraIO-Usecase/AgoraChat-rn/tree/dev/packages/react-native-chat-callkit).

2. Add page routing components：

```sh
yarn add @react-navigation/native
yarn add @react-navigation/native-stack
yarn add react-native-safe-area-context
yarn add react-native-screens
```

3. Add dependencies required by the CallKit SDK:

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

## Implement audio and video calling

This section introduces the core steps for implementing audio and video calls in your project.

### Initialize AgoraChatCallKit

During the initialization, the following parameters are configured:

- `appKey`：Required by the Agora Chat SDK. For details, see [Get the information of the Chat project](./enable.html#get-the-information-of-the-chat-project).
- `agoraAppId`: Required by Agora RTC. For details, see [Get the App ID](https://docs.agora.io/en/video-calling/reference/manage-agora-account?platform=android#get-the-app-id).
- `requestRTCToken`
- `requestUserMap`
- `requestCurrentUser`

For a call, the call signaling is implemented via `react-native-agora-chat` and the audio or video call process is implemented via `react-native-agora`. As the accounts of Agora RTC and Agora Chat are not globally recognizable at present, the accounts need to be mapped via a method. During a call, you need to implement the method to get the Agora Chat RTC token and the method to map the Agora RTC user ID (UID) and Agora Chat user ID.

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
          new ChatOptions({
            appKey: appKey,
            autoLogin: false,
            debugModel: true,
          }),
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

### Log in

The login implementation logic is as follows:

```typescript
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
```

### Send a call invitation

The `SingleCall` component provides the one-to-one call page that supports the following functions:

- Answers a call
- Rejects a call
- Hangs up a call
- Enables/disables the camera
- Enables/disables the microphone

For the caller's client, only the components on the one-to-one call page need to be displayed to start a call:

- `callType`: The call type, i.e., audio call or video call.
- `inviterId`: The user ID of the caller. If the current user makes a call, `inviterId` is the user ID of the current user.
- `inviteeId`: The user ID of the callee.

```typescript
<SingleCall
  inviterId={inviterId.current}
  currentId={currentId.current}
  currentName={currentId.current}
  callType={callType}
  isInviter={isInviter.current}
  onClose={(elapsed: number, reason?: CallEndReason | undefined): void => {
    dlog.log('CallScreen:SingleCall:', elapsed, reason);
    navigation.goBack();
  }}
  onError={(error: CallError) => {
    dlog.log('CallScreen:SingleCall:', error);
    navigation.goBack();
  }}
  inviteeId={inviteeId.current}
/>
```

<img src="https://web-cdn.agora.io/docs-files/1655259327417" style="zoom:50%;" />

For a group call, the page component `MultiCall` is used.

The property `inviteeIds` indicates the user IDs of the invitees.

```typescript
<MultiCall
  inviterId={inviterId.current}
  currentId={currentId.current}
  currentName={currentId.current}
  callType={callType}
  isInviter={isInviter.current}
  onClose={(elapsed: number, reason?: CallEndReason | undefined): void => {
    // todo: Close the group call page.
  }}
  onError={(error: CallError) => {
    // todo: Handle the error message and close the page..
  }}
  inviteeIds={inviteeIds.current}
/>
```

### Receive the invitation

To receive call invitations, you need to configure a call listener.

Once a call invitation is sent, the callee receives the invitation in the `onCallReceived` event.

```typescript
const {call} = useCallkitSdkContext();
const listener = {
  onCallReceived: (params: {
    channelId: string;
    inviterId: string;
    callType: CallType;
    extension?: any;
  }) => {
    // todo: Load and display the initialization page.
    // example: gotoCall({av, sm, isInviter: false, inviterId: params.inviterId});
  },
  onCallOccurError: (params: {channelId: string; error: CallError}) => {
    dlog.warn('onCallOccurError:', params);
  },
} as CallListener;
call.addListener(listener);
```

After a call invitation is received, you need to load and display the call page, which is implemented in an asynchronous manner. Page redirection is used in the following sample code.

```typescript
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
        // todo: jump to CallScreen page with navigation
      } else {
        // todo: jump to CallScreen page with navigation
      }
    }
  },
  [ids, logged, navigation],
);
```

**Only online users can make a call. If the callee is offline, he or she will handle the call invitation when getting online.**

<img src="https://web-cdn.agora.io/docs-files/1655259340569" style="zoom:50%;" />

### Send a call invitation during a group call

You can set the `inviteeList` property to allow users in a group call to send call invitations to other users.

```typescript
<MultiCall inviteeList={{InviteeList: ContactList}} />
```

### Listen for callback events

For a one-to-one call or group call, the user may perform the following actions:

- If a user joins a call, the information of this user will display on the call page.
- If a user leaves a call, the information of this user will be removed from the call page.
- If a user enables the camera, the peer user in the one-to-one call or others in the group call can see the user; otherwise, the peer user or others in the call cannot see the user.
- If a user enables the microphone, the peer user in the one-to-one call or others in the group call can hear the user; otherwise, the user is muted and the peer user or others in the call cannot hear the user.

### End the call

A one-to-one call ends as soon as one of the two users hangs up, while a group call ends only after the local user hangs up.

If an error occurs, the page component provides a callback that shows the specific error.

## Next steps

This section contains extra steps you can take for the audio and video call functionalities in your project.

### Call exceptions

If a call exception or error occurs due to an issue in the network or software, the SDK triggers the `onCallOccurError` event, which presents the detailed information of the exception.

```typescript
const {call} = useCallkitSdkContext();
const listener = {
  onCallOccurError: (params: {channelId: string; error: CallError}) => {
    // todo: Error or exception handling.
  },
} as CallListener;
call.addListener(listener);
```

```typescript
<SingleCall
  onError={(error: CallError) => {
    // todo: Handle the error message and close the page..
  }}
/>
```

```typescript
<MultiCall
  onError={(error: CallError) => {
    // todo: Handle the error message and close the page..
  }}
/>
```

## Reference

The Agora Chat CallKit SDK is designed on the basis of the Agora Chat SDK. Through the two SDKs, one-to-one real-time audio and video calls and group calls can be implemented.

The SDK mainly provides the call manager, listener, and view to complete the call.

<table>
  <tr>
    <td>Function</td>
    <td>Description</td>
  </tr>
  <tr>
    <td>CallManager</td>
    <td style="font-size: 15px">
      A manager that provides functions such as adding and removing listeners.
    </td>
  </tr>
  <tr>
    <td>CallListener</td>
    <td style="font-size: 15px">
      Listener for receiving notifications such as invitations and sending
      errors.
    </td>
  </tr>
  <tr>
    <td>SingleCall</td>
    <td style="font-size: 15px">
      Provides a one-to-one call page for operations like invitation, answering, and hanging up, and a page that supports audio and video calls.
    </td>
  </tr>
  <tr>
    <td>MultiCall</td>
    <td style="font-size: 15px">
      Provides a group call page for operations such as invitation, answering, and hanging up. 
    </td>
  </tr>
</table>

### Manager

The `CallManager` is mainly for call management. It provides the following methods:

- `addListener`: adds a listener.
- `removeListener`: removes the listener.

### Listener

The `CallListener` listener can receive call invitations. It provides the following events:

- `onCallReceived`: Occurs when a call invitation is received.
- `onCallOccurError`: Occurs when an error is reported during a call.

### Call page

`SingleCall` is the one-to-one audio and video page component. `MultiCall` is the group audio and video page component. Inherited from `BasicCall`, the two components have common properties and events.

Common properties provided by the two components are as follows:

| Property            | Type    | Description                                                                       |
| :------------------ | :------ | :-------------------------------------------------------------------------------- |
| `inviterId`         | String  | The user ID of the inviter.                                                       |
| `inviterName `      | String  | The nickname of the inviter.                                                      |
| `inviterUrl `       | String  | The avatar URL of the inviter.                                                    |
| `currentId `        | String  | The current user ID.                                                              |
| `currentName `      | String  | The nickname of the current user.                                                 |
| `currentUrl `       | String  | The avatar URL of the current user.                                               |
| `timeout `          | Number  | The timeout time. If the timeout period expires, the call hangs up automatically. |
| `bottomButtonType ` | String  | Initial Button group style.                                                       |
| `muteVideo `        | Boolean | Whether to disable video.                                                         |
| `callType `         | String  | The call type, i.e., audio call or video call.                                    |
| `callState `        | String  | The call state.                                                                   |
| `isMinimize `       | Boolean | Whether the call page is the minimized state.                                     |
| `isTest `           | Boolean | Whether to enable the test mode. It is disabled by default.                       |

Common events provided by the two components are as follows:

| Event           | Description                                                                                                                                                                                                                                                                        |
| :-------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onHangUp`      | Occurs when a user hangs up a call. When a user hangs up a call, the local user receives the `onHangUp` event and the `onClose` event.                                                                                                                                             |
| `onCancel`      | Occurs when the call is cancelled. Only the caller receives the event.                                                                                                                                                                                                             |
| `onRefuse`      | Occurs when the call is rejected by the callee when a call invitation is received. The callee(s) receive this event.                                                                                                                                                               |
| `onClose`       | Occurs when a user hangs up a call. In one-to-one call, both users in the call receive this event. In a group call, the user that hangs up the call receives the event. This events also shows the call duration. In this event, you can close the call page to release resources. |
| `onError`       | Occurs when a call error is reported.                                                                                                                                                                                                                                              |
| `onInitialized` | Occurs when the page initialization is complete.                                                                                                                                                                                                                                   |
| `onSelfJoined`  | Occurs when a user joins a call. The user that successfully joins the call receives the event.                                                                                                                                                                                     |

Besides the common properties and events, `SingleCall` provides the following property and event:

- `inviteeId`: The user ID of the invitee. The property value is of the string type.
- `onPeerJoined`: Occurs when the invitee joins the call. The caller receives this event.

Besides the common properties and events, `MultiCall` provides the following properties:

- `inviteeIds`: The list of user IDs of the invitees when a group call is started. The property value is of the array type.
- `inviteeList`: The list of user IDs of the invitees during an ongoing group call. The property value is of the array type.

For group audio and video calls, the Agora Chat CallKit SDK supports up to 18 video channels and 128 audio channels.

## Reference

Agora provides an open-source [React Native sample project for Agora Chat](https://github.com/AgoraIO-Usecase/AgoraChat-Callkit-rn) on GitHub. You can download the sample to try it out or view the source code.

Also, if you have any issues, see [React Native AgoraChatCallKit SDK repository](https://github.com/AgoraIO-Usecase/AgoraChat-rn/tree/dev/packages/react-native-chat-callkit)

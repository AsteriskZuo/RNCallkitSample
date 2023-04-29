/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import {
  CallUser,
  GlobalContainer as CallkitContainer,
} from 'react-native-chat-callkit';

import {accountType, agoraAppId, appKey, dlog} from './AppConfig';
import {MainScreen} from './Main';
import {CallScreen} from './Call';
import {AppServerClient} from './AppServer';
import {ChatClient, ChatOptions} from 'react-native-chat-sdk';
import {ActivityIndicator} from 'react-native';

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

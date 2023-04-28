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

import {agoraAppId, appKey} from './AppConfig';
import {MainScreen} from './Main';
import {CallScreen} from './Call';
import {AppServerClient} from './AppServer';
import {ChatClient, ChatOptions} from 'react-native-chat-sdk';
import {ActivityIndicator} from 'react-native';

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

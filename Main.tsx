import * as React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {
  RootParamsList,
  accountType,
  defaultId,
  defaultPs,
  defaultTargetId,
} from './AppConfig';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TextInput} from 'react-native';
import {ChatClient} from 'react-native-chat-sdk';
import {
  CallType,
  CallError,
  CallListener,
  useCallkitSdkContext,
} from 'react-native-chat-callkit';
import {requestAV} from './AppPermission';
import {AppServerClient} from './AppServer';

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
  const type = accountType;
  const login = () => {
    console.log('test:login:', id, token, type);
    if (type !== 'easemob') {
      AppServerClient.getAccountToken({
        userId: id,
        userPassword: token,
        onResult: (params: {data?: any; error?: any}) => {
          console.log('test:', id, token, params);
          if (params.error === undefined) {
            ChatClient.getInstance()
              .loginWithAgoraToken(id, params.data.token)
              .then(() => {
                console.log('test:loginWithAgoraToken:success:');
                setLogged(false);
              })
              .catch(e => {
                console.log('test:error:', e);
              });
          } else {
            console.log('test:error:', params.error);
          }
        },
      });
    } else {
      ChatClient.getInstance()
        .login(id, token)
        .then(() => {
          console.log('test:login:success:');
          setLogged(true);
        })
        .catch(e => {
          console.log('test:error:', e);
        });
    }
  };
  const registry = () => {
    AppServerClient.registerAccount({
      userId: id,
      userPassword: token,
      onResult: (params: {data?: any; error?: any}) => {
        console.log('test:', id, token, params);
      },
    });
  };
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

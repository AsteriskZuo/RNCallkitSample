import * as React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {RootParamsList} from './AppConfig';
import {ActivityIndicator} from 'react-native';
import {
  CallEndReason,
  CallError,
  MultiCall,
  SingleCall,
} from 'react-native-chat-callkit';
import {ChatClient} from 'react-native-chat-sdk';

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

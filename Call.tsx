import * as React from 'react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootParamsList, dlog} from './AppConfig';
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
  dlog.log('CallScreen:', route.params);
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
          if (isInviter.current === true) {
            inviterId.current = currentId.current;
          } else {
            inviteeIds.current = [currentId.current];
          }
          setReady(true);
        })
        .catch(e => {
          dlog.log('getCurrentUsername:error:', e);
        });
    };
    init();
  }, []);

  if (ready === false) {
    return <ActivityIndicator />;
  }

  dlog.log(
    'CallScreen:2:',
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
          dlog.log('CallScreen:SingleCall:', elapsed, reason);
          navigation.goBack();
        }}
        onError={(error: CallError) => {
          dlog.log('CallScreen:SingleCall:', error);
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
          dlog.log('CallScreen:MultiCall:', elapsed, reason);
          navigation.goBack();
        }}
        onError={(error: CallError) => {
          dlog.log('CallScreen:MultiCall:', error);
          navigation.goBack();
        }}
        inviteeIds={inviteeIds.current}
      />
    );
  }
}

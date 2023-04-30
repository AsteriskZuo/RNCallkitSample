import * as React from 'react';
import {Text, StyleSheet, ScrollView} from 'react-native';

const max_count = 10;

type LogRef = {
  logHandler: (message?: any, ...optionalParams: any[]) => void;
};
type LogProps = {
  propsRef: React.RefObject<LogRef>;
};
export const LogMemo = React.memo(({propsRef}: LogProps) => {
  const [log, setLog] = React.useState('');
  const logRef = React.useRef('');
  if (propsRef.current) {
    propsRef.current.logHandler = (message?: any, ...optionalParams: any[]) => {
      const arr = [message, ...optionalParams];
      let str = logRef.current;
      for (const a of arr) {
        if (a?.toString) {
          str += a.toString() + ' ';
        }
      }
      if (str.trim().length > 0) {
        str += '\n';
      }
      const ret = str.matchAll(/\n/g);
      let count = 0;
      for (const {} of ret) {
        ++count;
      }
      if (count > max_count) {
        const pos = str.indexOf('\n');
        if (pos > 0) {
          const t = str.substring(pos + 1);
          logRef.current = t;
        }
      } else {
        logRef.current = str;
      }
      setLog(logRef.current);
    };
  }
  return (
    <ScrollView style={styles.container}>
      <Text>{log}</Text>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: 'red',
  },
});

import {dlog} from './AppConfig';
import {Platform} from 'react-native';
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

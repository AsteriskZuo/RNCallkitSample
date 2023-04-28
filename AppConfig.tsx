export const RootParamsList: Record<string, object | undefined> = {
  Main: {},
  Call: {},
};
export let appKey = '1135220126133718#demo';
export let agoraAppId = '';
export let defaultId = 'asterisk001';
export let defaultPs = 'qwerty';
export const autoLogin = false;
export const debugModel = true;
export const defaultTargetId = ['du005', 'du006'];

try {
  appKey = require('./env').appKey;
  defaultId = require('./env').id;
  defaultPs = require('./env').ps;
  agoraAppId = require('./env').agoraAppId;
} catch (error) {
  console.error(error);
}

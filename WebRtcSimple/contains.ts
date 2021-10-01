import { Subject } from 'rxjs';

export const START_CALL = new Subject();
export const RECEIVED_CALL = new Subject();
export const ACCEPT_CALL = new Subject();
export const REJECT_CALL = new Subject();
export const END_CALL = new Subject();
export const REMOTE_STREAM = new Subject();
export const SEND_MESSAGE = new Subject();
export const MESSAGE = new Subject();

export interface userInfo {
  username: string;
  name: string;
  avatar: string;
}

export interface SetupPeer {
  optional: object | undefined
  key: string | undefined;
}

export const CallType = {
  start: 'START_CALL',
  received: 'RECEIVED_CALL',
  accept: 'ACCEPT_CALL',
  reject: 'REJECT_CALL',
  end: 'END_CALL',
  remote: 'REMOTE_STREAM',
  message: 'MESSAGE'
}

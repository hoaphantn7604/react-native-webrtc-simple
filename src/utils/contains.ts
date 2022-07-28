import { Subject } from 'rxjs';

export const START_CALL = new Subject();
export const RECEIVED_CALL = new Subject();
export const ACCEPT_CALL = new Subject();
export const END_CALL = new Subject();

export const START_GROUP_CALL = new Subject();
export const RECEIVED_GROUP_CALL = new Subject();
export const JOIN_GROUP_CALL = new Subject();
export const LEAVE_GROUP_CALL = new Subject();

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

export type TypeProps = 'RECEIVED_CALL' | 'ACCEPT_CALL' | 'START_CALL' | 'END_CALL' | 'REJECT_CALL' | 'MESSAGE' | 'START_GROUP_CALL' | 'RECEIVED_GROUP_CALL' | 'JOIN_GROUP_CALL' | 'LEAVE_GROUP_CALL';
export type UserDataProps = object | null;

export const CallEvents = {
  start: 'START_CALL',
  received: 'RECEIVED_CALL',
  accept: 'ACCEPT_CALL',
  end: 'END_CALL',
  remote: 'REMOTE_STREAM',
  message: 'MESSAGE',
  startGroup: 'START_GROUP_CALL',
  receivedGroup: 'RECEIVED_GROUP_CALL',
  joinGroup: 'JOIN_GROUP_CALL',
  leaveGroup: 'LEAVE_GROUP_CALL',
}

export interface VideoConfigs {
  width?: number,
  height?: number,
  frameRate?: number,
}

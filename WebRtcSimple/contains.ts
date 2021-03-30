import { Subject } from 'rxjs';

export const START_CALL = new Subject();
export const RECEIVED_CALL = new Subject();
export const ACCEPT_CALL = new Subject();
export const REJECT_CALL = new Subject();
export const END_CALL = new Subject();
export const REMOTE_STREAM = new Subject();

export interface userInfo {
    username: string;
    name: string;
    avatar: string;
  }
  
export interface SetupPeer {
host: string | undefined;
port: string | undefined;
path: string | undefined;
key: string | undefined;
}
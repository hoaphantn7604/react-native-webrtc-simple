import { startWebRTC } from './WebRtcSimple/webrtc';
import { callToUser, peerConnection } from './WebRtcSimple/peer';
import { START_CALL, RECEIVED_CALL, ACCEPT_CALL, REJECT_CALL, END_CALL, REMOTE_STREAM, SetupPeer } from './WebRtcSimple/contains';

let currentCall: any = null;
let stream: any = null;
let peerServer: any = null;
let conn: any = null;

const WebRTCSimple = {
  start: async (configPeer: SetupPeer) => {
    const myStream = await startWebRTC();
    stream = myStream;
    if (myStream) {
      const peer = await peerConnection(configPeer, myStream);
      if (peer) {
        peerServer = peer;
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  getMyStream: () => {
    return stream;
  },
  getMyId: (callback: (id: string) => void) => {
    peerServer.on('open', (id: string) => {
      callback(id);
    });
  },
  listenning: {
    callEvent: (callback: (type: 'RECEIVED_CALL' | 'ACCEPT_CALL' | 'START_CALL' | 'END_CALL' | 'REJECT_CALL', userdata?:| object) => void) => {

      START_CALL.subscribe((data: any) => {
        conn = data.conn;
        callback('START_CALL');
      });

      RECEIVED_CALL.subscribe((values: any) => {
        conn = values.conn;
        const userData = values?.data?.userData;
        callback('RECEIVED_CALL', userData);
      });

      ACCEPT_CALL.subscribe(() => {
        callback('ACCEPT_CALL');
      });

      REJECT_CALL.subscribe(() => {
        callback('REJECT_CALL');
      });

      END_CALL.subscribe(()=>{
        callback('END_CALL');
      });

      REMOTE_STREAM.subscribe((data: any) => {
        currentCall = data.call;
      });

    },
    getRemoteStream: (callback: (remoteStream: any) => void) => {
      REMOTE_STREAM.subscribe((data: any) => {
        callback(data.remoteStream);
      });
    },
  },
  event: {
    call: (callId: string, userData: any = {}) => {
      callToUser(callId, userData);
    },
    acceptCall: () => {
      if(conn){
        ACCEPT_CALL.next({conn});
      }
    },
    rejectCall: () => {
      if(conn){
        REJECT_CALL.next({conn});
      }
    },
    endCall: () => {
      if(currentCall){
        END_CALL.next(currentCall);
      } 
    },
    switchCamera: () => {
      stream?.getVideoTracks()[0]._switchCamera();
    },
    muted: (mute: boolean) => {
      stream.getTracks().map((track: any) => {
        track.muted = mute;
      });
      console.log(stream);
    },
  },
};

export default WebRTCSimple;

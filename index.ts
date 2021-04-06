import { startWebRTC } from './WebRtcSimple/webrtc';
import { callToUser, peerConnection } from './WebRtcSimple/peer';
import { START_CALL, RECEIVED_CALL, ACCEPT_CALL, REJECT_CALL, END_CALL, REMOTE_STREAM, SetupPeer } from './WebRtcSimple/contains';

let interval: any = null;
let currentCall: any = null;
let ringTime = 20;

let stream: any = null;
let peerServer: any = null;

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
    callEvent: (callback: (type: 'RECEIVED_CALL' | 'ACCEPT_CALL' | 'START_CALL' | 'END_CALL' | 'REJECT_CALL') => void) => {
      START_CALL.subscribe(() => {
        callback('START_CALL');
        let timer = ringTime;
        interval = setInterval(() => {
          timer = timer - 1;
          if (timer === 0) {
            END_CALL.next(currentCall);
          }
        }, 1000);
      });
      RECEIVED_CALL.subscribe((call) => {
        currentCall = call;
        callback('RECEIVED_CALL');
        let timer = ringTime;
        interval = setInterval(() => {
          timer = timer - 1;
          if (timer === 0) {
            REJECT_CALL.next(currentCall);
          }
        }, 1000);
      });
      ACCEPT_CALL.subscribe(() => {
        callback('ACCEPT_CALL');
        clearInterval(interval);
      });
      END_CALL.subscribe(() => {
        callback('END_CALL');
      });
      REJECT_CALL.subscribe(() => {
        callback('REJECT_CALL');
        clearInterval(interval);
      });
    },
    getRemoteStream: (callback: (remoteStream: any) => void) => {
      REMOTE_STREAM.subscribe((stream) => {
        callback(stream);
      });
    },
  },
  event: {
    call: (callId: string) => {
      START_CALL.next();
      callToUser(callId, stream, peerServer);
    },
    acceptCall: () => {
      ACCEPT_CALL.next(currentCall);
    },
    rejectCall: () => {
      REJECT_CALL.next(currentCall);
    },
    endCall: () => {
      END_CALL.next(currentCall);
    },
    switchCamera: () => {
      stream?.getVideoTracks()[0]._switchCamera();
    },
    muted: (mute: boolean) => {
      stream?.getTracks().map((track: any) => {
        track.muted = mute;
      });
      console.log(stream);
    },
  },
};

export default WebRTCSimple;

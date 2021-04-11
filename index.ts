import { startWebRTC } from './WebRtcSimple/webrtc';
import { callToUser, peerConnection } from './WebRtcSimple/peer';
import { START_CALL, RECEIVED_CALL, ACCEPT_CALL, REJECT_CALL, END_CALL, REMOTE_STREAM, SetupPeer } from './WebRtcSimple/contains';

let currentCall: any[] = [];
let stream: any = null;
let peerServer: any = null;
let peerConn: any[] = [];
let sessionId: string | null = null;

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
  getLocalStream: () => {
    return stream;
  },
  getSessionId: (callback: (id: string) => void) => {
    peerServer.on('open', (id: string) => {
      callback(id);
    });
  },
  listenings: {
    callEvents: (callback: (type: 'RECEIVED_CALL' | 'ACCEPT_CALL' | 'START_CALL' | 'END_CALL' | 'REJECT_CALL', userdata?: | object) => void) => {

      START_CALL.subscribe((data: any) => {
        peerConn.push(data.peerConn);
        callback('START_CALL');
      });

      RECEIVED_CALL.subscribe((data: any) => {
        peerConn.push(data.peerConn);
        const userData = data?.userData;
        callback('RECEIVED_CALL', userData);
      });

      ACCEPT_CALL.subscribe(() => {
        callback('ACCEPT_CALL');
      });

      REJECT_CALL.subscribe(() => {
        peerConn = [];
        callback('REJECT_CALL');
      });

      END_CALL.subscribe(() => {
        currentCall = [];
        peerConn = [];
        callback('END_CALL');
      });

      REMOTE_STREAM.subscribe((data: any) => {
        currentCall.push(data.call);
      });

    },
    getRemoteStream: (callback: (remoteStream: any) => void) => {
      REMOTE_STREAM.subscribe((data: any) => {
        callback(data.remoteStream);
      });
    },
  },
  events: {
    call: (callId: string, userData: any = {}) => {
      callToUser(callId, userData);
    },
    acceptCall: () => {
      if (peerConn.length > 0) {
        ACCEPT_CALL.next({ peerConn });
      }
    },
    rejectCall: () => {
      if (peerConn.length > 0) {
        REJECT_CALL.next({ peerConn });
      }
    },
    endCall: () => {
      if (currentCall.length > 0) {
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

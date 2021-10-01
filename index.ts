import { startWebRTC } from './WebRtcSimple/webrtc';
import { callToUser, listeningRemoteCall, peerConnection } from './WebRtcSimple/peer';
import { START_CALL, RECEIVED_CALL, ACCEPT_CALL, REJECT_CALL, END_CALL, REMOTE_STREAM, SetupPeer, SEND_MESSAGE, MESSAGE } from './WebRtcSimple/contains';
import { Vibration } from 'react-native';
import _ from 'lodash';

let currentCall: any[] = [];
let stream: any = null;
let peerServer: any = null;
let peerConn: any[] = [];
let sessionId: string | null = null;
let configPeerData: any = null;

const WebRTCSimple = {
  start: async (configPeer: SetupPeer) => {
    if (sessionId === null) {
      const myStream = await startWebRTC();
      stream = myStream;
      if (myStream) {
        configPeerData = configPeer;
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
    }
  },
  refresh: async (callback: (status: boolean) => void) => {
    if (sessionId) {
      const myStream = await startWebRTC();
      stream = myStream;
      if (myStream) {
        const peer = await peerConnection(configPeerData, myStream);
        if (peer) {
          peerServer = peer;
          callback(true);
          return true;
        } else {
          callback(false);
          return false;
        }
      } else {
        callback(false);
        return false;
      }
    }
  },
  getLocalStream: () => {
    return stream;
  },
  getSessionId: (callback: (id: string) => void) => {
    if (sessionId) {
      callback(sessionId);
    } else {
      peerServer.on('open', (id: string) => {
        sessionId = id;
        listeningRemoteCall(sessionId, stream);
        callback(id);
      });
      peerServer.on('error', console.log);
    }
  },
  listenings: {
    callEvents: (callback: (type: 'RECEIVED_CALL' | 'ACCEPT_CALL' | 'START_CALL' | 'END_CALL' | 'REJECT_CALL' | 'MESSAGE', userdata?: | object | null) => void) => {

      START_CALL.subscribe((data: any) => {
        peerConn.push(data.peerConn);
        const userData = data?.userData;
        callback('START_CALL', userData);
      });

      RECEIVED_CALL.subscribe((data: any) => {
        peerConn.push(data.peerConn);
        const userData = data?.userData;
        callback('RECEIVED_CALL', userData);
      });

      ACCEPT_CALL.subscribe((data: any) => {
        callback('ACCEPT_CALL', data?.sessionId ? data?.sessionId : null);
      });

      REJECT_CALL.subscribe((data: any) => {
        peerConn = [];
        callback('REJECT_CALL', data?.sessionId ? data?.sessionId : null);
      });

      END_CALL.subscribe((data: any) => {
        currentCall = [];
        peerConn = [];
        callback('END_CALL', data && data.sessionId ? { sessionId: data.sessionId } : null);
      });

      REMOTE_STREAM.subscribe((data: any) => {
        currentCall.push(data.call);
      });

      MESSAGE.subscribe((data: any) => {
        callback('MESSAGE', data?.sessionId ? data : null);
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
      if (sessionId) {
        callToUser(sessionId, callId, userData);
      } else {
        console.log('Call error: Session is null');
      }
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
        END_CALL.next({ currentCall, peerConn });
      }
    },
    switchCamera: () => {
      stream?.getVideoTracks().map(track => {
        track._switchCamera();
      });
    },
    videoEnable: (enable: boolean) => {
      stream?.getVideoTracks().map(track => {
        track.enabled = enable;
      });
    },
    audioEnable: (enable: boolean) => {
      stream.getAudioTracks().map(track => {
        track.enabled = enable;
      });
    },
    vibration: {
      start: (time: number) => {
        Vibration.vibrate(_.times(time, () => 2000));
      },
      cancel: () => {
        Vibration.cancel();
      }
    },
    message: (message: any) => {
      if (peerConn.length > 0) {
        SEND_MESSAGE.next({ peerConn, message });
      }
    },
  },
};

export default WebRTCSimple;

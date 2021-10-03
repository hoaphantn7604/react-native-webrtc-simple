import _ from 'lodash';
import { Vibration } from 'react-native';
import { ACCEPT_CALL, END_CALL, JOIN_GROUP_CALL, LEAVE_GROUP_CALL, MESSAGE, RECEIVED_CALL, REJECT_CALL, REMOTE_STREAM, SEND_MESSAGE, SetupPeer, START_CALL, START_GROUP_CALL, TypeProps, UserDataProps } from './WebRtcSimple/contains';
import { callToUser, joinGroup, leaveGroup, listeningRemoteCall, peerConnection, startGroup, startStream } from './WebRtcSimple/peer';
import { startWebRTC } from './WebRtcSimple/webrtc';

let stream: any = null;
let peerServer: any = null;
let arrPeerConn: any[] = [];
let arrCurrentCall: any[] = [];
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
    callEvents: (callback: (type: TypeProps, userdata?: UserDataProps) => void) => {

      START_CALL.subscribe((data: any) => {
        arrPeerConn.push(data.peerConn);
        const userData = data?.userData;
        callback('START_CALL', userData);
      });

      RECEIVED_CALL.subscribe((data: any) => {
        arrPeerConn.push(data.peerConn);
        const userData = data?.userData;
        callback('RECEIVED_CALL', userData);
      });

      ACCEPT_CALL.subscribe((data: any) => {
        callback('ACCEPT_CALL', data?.sessionId ? data?.sessionId : null);
      });

      REJECT_CALL.subscribe((data: any) => {
        arrPeerConn = [];
        callback('REJECT_CALL', data?.sessionId ? data?.sessionId : null);
      });

      END_CALL.subscribe((data: any) => {
        arrCurrentCall = [];
        arrPeerConn = [];
        callback('END_CALL', data && data?.sessionId ? { sessionId: data?.sessionId } : null);
      });

      REMOTE_STREAM.subscribe((data: any) => {
        arrCurrentCall.push(data.call);
      });

      MESSAGE.subscribe((data: any) => {
        callback('MESSAGE', data?.sessionId ? data : null);
      });

      START_GROUP_CALL.subscribe((data: any) => {
        arrPeerConn.push(data.peerConn);
        const userData = data?.userData;
        callback('GROUP_CALL', userData);
      });

      JOIN_GROUP_CALL.subscribe((data: any) => {
        arrPeerConn.push(data.peerConn);
        const sessionId = data?.sessionId;
        if (sessionId) {
          callback('JOIN_GROUP_CALL', { sessionId });
        } else {
          callback('JOIN_GROUP_CALL', null);
        }
      });
      LEAVE_GROUP_CALL.subscribe((data: any) => {
        const sessionId = data?.sessionId;
        if (sessionId) {
          callback('LEAVE_GROUP_CALL', { sessionId });
        } else {
          arrCurrentCall = [];
          arrPeerConn = [];
          callback('LEAVE_GROUP_CALL', null);
        }
      });
    },
    getRemoteStream: (callback: (remoteStream: any) => void) => {
      REMOTE_STREAM.subscribe((data: any) => {
        callback(data.remoteStream);
      });
    },
  },
  events: {
    call: (receiverId: string, userData: object = {}) => {
      if (sessionId) {
        callToUser(sessionId, receiverId, userData);
      } else {
        console.log('Call error: Session is null');
      }
    },
    acceptCall: () => {
      if (arrPeerConn.length > 0) {
        ACCEPT_CALL.next({ peerConn: arrPeerConn });
      }
    },
    rejectCall: () => {
      if (arrPeerConn.length > 0) {
        REJECT_CALL.next({ peerConn: arrPeerConn });
      }
    },
    endCall: () => {
      if (arrCurrentCall.length > 0) {
        END_CALL.next({ arrCurrentCall, peerConn: arrPeerConn });
      }
    },
    switchCamera: () => {
      stream?.getVideoTracks().map((track: any) => {
        track._switchCamera();
      });
    },
    videoEnable: (enable: boolean) => {
      stream?.getVideoTracks().map((track: any) => {
        track.enabled = enable;
      });
    },
    audioEnable: (enable: boolean) => {
      stream.getAudioTracks().map((track: any) => {
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
      if (arrPeerConn.length > 0) {
        SEND_MESSAGE.next({ peerConn: arrPeerConn, message });
      }
    },
    groupCall: (groupSessionId: string[], userData: object = {}) => {
      if (sessionId) {
        startGroup(sessionId, groupSessionId, userData);
      } else {
        console.log('Call error: Session is null');
      }
    },
    joinGroup: (arrSessionId: string[]) => {
      if (sessionId) {
        joinGroup(sessionId, arrSessionId);
      } else {
        console.log('Call error: Session is null');
      }
    },
    leaveGroup: () => {
      leaveGroup({ sessionId, arrCurrentCall, peerConn: arrPeerConn });
    },
    addStream: (sessionId: string) => {
      if (sessionId) {
        startStream(sessionId, stream);
      } else {
        console.log('Call error: Session is null');
      }
    },
  },
};

export default WebRTCSimple;

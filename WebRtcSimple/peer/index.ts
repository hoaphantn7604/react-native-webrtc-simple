import Peer from './peerjs';
import { RECEIVED_CALL, ACCEPT_CALL, REJECT_CALL, END_CALL, REMOTE_STREAM, SetupPeer, START_CALL, CallType } from '../contains';

let peer: any = null;
const peerConnection = async (configPeer: SetupPeer, myStream: any) => {
  peer = new Peer(configPeer?.key ? configPeer.key : undefined, configPeer.optional ? configPeer.optional : undefined);
  return peer;
};

const listeningRemoteCall = (sessionId: string, myStream: any) => {
  // listening event connect
  peer.on('connection', (peerConn: any) => {
    if (peerConn) {
      peerConn.on('error', console.log);
      peerConn.on('open', () => {
        peerConn.on('data', (data: any) => {
          // the other person call to you
          if (data.type === CallType.start) {
            RECEIVED_CALL.next({ peerConn, userData: data.userData });
          }
          // the other person closed the call
          if (data.type === CallType.reject) {
            REJECT_CALL.next({ sessionId: data.sessionId });
          }
          // the other person end the call
          if (data.type === CallType.end) {
            END_CALL.next({ sessionId: data.sessionId });
          }
        });
      });
    }
  });

  // listening event accept call
  ACCEPT_CALL.subscribe((data: any) => {
    try {
      if (data?.sessionId) {
        startStream(data.sessionId, myStream);
      } else {
        if (data?.peerConn) {
          data.peerConn.map((item: any) => {
            if (item) {
              item.send({ type: CallType.accept, sessionId });
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }

  });

  // listening event reject call
  REJECT_CALL.subscribe((data: any) => {
    try {
      if (data && data?.peerConn) {
        data.peerConn.map((item: any) => {
          if (item) {
            item.send({ type: CallType.reject, sessionId });
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  // listening event end call 
  END_CALL.subscribe((data: any) => {
    try {
      if (data && data?.currentCall && data?.peerConn) {
        data.peerConn.map((item: any) => {
          if (item) {
            item.send({ type: CallType.end, sessionId });
          }
        });
        data.currentCall.map((item: any) => {
          if (item) {
            item.close();
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  // listening event start stream
  peer.on('call', (call: any) => {
    call.answer(myStream);
    call.on('stream', (remoteStream: any) => {
      REMOTE_STREAM.next({ remoteStream, call });
    });

    call.on('close', function () {
    });
  });
};

const callToUser = (sessionId: string, userId: string, userData: any) => {
  // create connection peer to peer
  const peerConn = peer.connect(userId);
  if (peerConn) {
    peerConn.on('error', (e: any) => {
      // when connect error then close call
      console.log(e)
      REJECT_CALL.next({ sessionId: userId });
    });
    peerConn.on('open', () => {
      // send a message to the other
      userData.sessionId = sessionId;
      const data = {
        type: CallType.start,
        userData,
      }
      peerConn.send(data);

      // save current connection
      START_CALL.next({ peerConn, userData });

      peerConn.on('data', (data: any) => {
        // the other person accept call
        if (data.type === CallType.accept) {
          ACCEPT_CALL.next({ peerConn, sessionId: data.sessionId });
        }
        // the other person reject call
        if (data.type === CallType.reject) {
          REJECT_CALL.next({ sessionId: data.sessionId });
        }
        // the other person end the call
        if (data.type === CallType.end) {
          END_CALL.next({ sessionId: data.sessionId });
        }
      });
    });
  }
};

const startStream = (userId: string, myStream: any) => {
  if (peer) {
    const call = peer.call(userId, myStream);
    call.on('stream', (remoteStream: any) => {
      REMOTE_STREAM.next({ remoteStream, call });
    });

    call.on('close', function () {
    });
  }

};

export { peerConnection, listeningRemoteCall, callToUser, startStream };

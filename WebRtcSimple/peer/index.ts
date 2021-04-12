import Peer from 'react-native-peerjs';
import { RECEIVED_CALL, ACCEPT_CALL, REJECT_CALL, END_CALL, REMOTE_STREAM, SetupPeer, START_CALL } from '../contains';

let peer = null;
const peerConnection = async (configPeer: SetupPeer, myStream: any) => {
  peer = new Peer(configPeer?.key ? configPeer.key : undefined, configPeer.optional ? configPeer.optional : undefined);
  return peer;
};

const listeningRemoteCall = (sessionId: string, myStream: any) => {
  // listening event connect
  peer.on('connection', (peerConn) => {
    peerConn.on('error', console.log);
    peerConn.on('open', () => {
      peerConn.on('data', (data: any) => {
        // the other person call to you
        if (data.type === 'START_CALL') {
          RECEIVED_CALL.next({ peerConn, userData: data.userData });
        }
        // the other person closed the call
        if (data.type === 'REJECT_CALL') {
          REJECT_CALL.next({ sessionId: data.sessionId });
        }
      });
    });
  });

  // listening event accept call
  ACCEPT_CALL.subscribe((data: any) => {
    if (data.sessionId) {
      startStream(data.sessionId, myStream);
    } else {
      if (data.peerConn) {
        data.peerConn.map(item => {
          if (item) {
            item.send({ type: 'ACCEPT_CALL', sessionId });
          }
        });
      }

    }
  });

  // listening event reject call
  REJECT_CALL.subscribe((data: any) => {
    if (data && data.peerConn) {
      data.peerConn.map(item => {
        if (item) {
          item.send({ type: 'REJECT_CALL', sessionId });
        }
      });
    }
  });

  // listening event end call 
  END_CALL.subscribe((call: any) => {
    if (call) {
      call.map((item) => {
        if (item) {
          item.close();
        }
      });
    }
  });

  // listening event start stream
  peer.on('call', (call: any) => {
    call.answer(myStream);
    call.on('stream', (remoteStream: any) => {
      REMOTE_STREAM.next({ remoteStream, call });
    });

    call.on('close', function () {
      END_CALL.next();
    });
  });
};

const callToUser = (sessionId: string, userId: any, userData: any) => {
  const remotePeer = new Peer();
  remotePeer.on('error', console.log);
  remotePeer.on('open', (remotePeerId) => {
    // create connection peer to peer
    const peerConn = remotePeer.connect(userId);
    peerConn.on('error', () => {
      // when connect error then close call
      REJECT_CALL.next({ peerConn });
    });
    peerConn.on('open', () => {
      // save current connection
      START_CALL.next({ peerConn });

      // send a message to the other
      userData.sessionId = sessionId;
      const data = {
        type: 'START_CALL',
        userData,
      }
      peerConn.send(data);

      peerConn.on('data', (data) => {
        // the other person accept call
        if (data.type === 'ACCEPT_CALL') {
          ACCEPT_CALL.next({ peerConn, sessionId: data.sessionId });
        }
        // the other person reject call
        if (data.type === 'REJECT_CALL') {
          REJECT_CALL.next({sessionId: data.sessionId});
        }
      }
      );
    });
  });
};

const startStream = (userId: any, myStream: any) => {
  if (peer) {
    const call = peer.call(userId, myStream);
    call.on('stream', (remoteStream: any) => {
      REMOTE_STREAM.next({ remoteStream, call });
    });

    call.on('close', function () {
      END_CALL.next();
    });
  }

};

export { peerConnection, listeningRemoteCall, callToUser };

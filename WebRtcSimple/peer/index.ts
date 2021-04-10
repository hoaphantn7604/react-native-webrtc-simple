import Peer from 'react-native-peerjs';
import { RECEIVED_CALL, ACCEPT_CALL, REJECT_CALL, END_CALL, REMOTE_STREAM, SetupPeer, START_CALL } from '../contains';

let peer = null;
const peerConnection = async (configPeer: SetupPeer, myStream: any) => {
  peer = new Peer(configPeer?.key ? configPeer.key : undefined, configPeer.optional ? configPeer.optional : undefined);
  if (peer) {
    listeningRemoteCall(myStream);
  }
  return peer;
};

const listeningRemoteCall = (myStream) => {
  // listening event connect
  peer.on('connection', (conn) => {
    conn.on('error', console.log);
    conn.on('open', () => {
      conn.on('data', (data) => {
        // the other person call to you
        if (data.type === 'START_CALL') {
          RECEIVED_CALL.next({ conn, data });
        }
        // the other person closed the call
        if (data.type === 'REJECT_CALL') {
          END_CALL.next();
        }
      });
    });
  });

  // listening event accept call
  ACCEPT_CALL.subscribe((data: any) => {
    if (data.userId) {
      startStream(data.userId, myStream);
    } else {
      data.conn.send('ACCEPT_CALL');
    }
  });

  // listening event reject call
  REJECT_CALL.subscribe((data: any) => {
    data.conn.send('REJECT_CALL');
  });

  // listening event end call 
  END_CALL.subscribe((call: any) => {
    if (call) {
      call.close();
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

const callToUser = (userId: any, userData: any) => {
  const remotePeer = new Peer();

  remotePeer.on('error', console.log);
  remotePeer.on('open', (remotePeerId) => {
    // create connection peer to peer
    const conn = remotePeer.connect(userId);
    conn.on('error', () => {
      // when connect error then close call
      REJECT_CALL.next({ conn });
    });
    conn.on('open', () => {
      // save current connection
      START_CALL.next({ conn });

      // send a message to the other
      const data = {
        type: 'START_CALL',
        userData,
        userId
      }
      conn.send(data);

      conn.on('data', (data) => {
        // the other person accept call
        if (data === 'ACCEPT_CALL') {
          ACCEPT_CALL.next({ conn, userId });
        }
        // the other person reject call
        if (data === 'REJECT_CALL') {
          END_CALL.next();
        }
      }
      );
    });
  });

  // listening event reject call
  REJECT_CALL.subscribe((data: any) => {
    const params = {
      type: 'REJECT_CALL',
      userData
    }
    data.conn.send(params);
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

export { peerConnection, callToUser };

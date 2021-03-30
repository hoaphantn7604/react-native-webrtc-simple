import Peer from 'react-native-peerjs';
import { ACCEPT_CALL, SetupPeer, END_CALL, RECEIVED_CALL, REJECT_CALL, REMOTE_STREAM } from '../../index';

const peerConnection = async (configPeer: SetupPeer, myStream: any) => {
  let peer = null;
  if (configPeer.host && configPeer.port) {
    peer = new Peer(configPeer?.key ? configPeer.key : undefined, {
      host: configPeer.host,
      secure: false,
      port: configPeer.port,
      path: configPeer.path,
    });
  } else {
    peer = new Peer(configPeer?.key ? configPeer.key : undefined);
  }

  listeningRemoteCall(myStream, peer);
  return peer;
};

const listeningRemoteCall = (myStream: any, peerServer: any) => {
  peerServer.on('call', (call: any) => {
    RECEIVED_CALL.next(call);

    call.on('stream', (remoteStream: any) => {
      REMOTE_STREAM.next(remoteStream);
    });

    call.on('close', function () {
      END_CALL.next(call);
    });

    ACCEPT_CALL.subscribe((call: any) => {
      if (call) {
        call.answer(myStream);
      }
    });

    END_CALL.subscribe((call: any) => {
      if (call) {
        call.close();
      }
    });

    REJECT_CALL.subscribe((call: any) => {
      if (call) {
        call.answer(myStream);
        setTimeout(() => {
          call.close();
        }, 500);
      }
    });
  });
};

const callToUser = (userId: any, myStream: any, peerServer: any) => {
  const call = peerServer.call(userId, myStream);
  call.on('stream', (remoteStream: any) => {
    ACCEPT_CALL.next();
    REMOTE_STREAM.next(remoteStream);
  });

  call.on('close', function () {
    END_CALL.next();
  });

  END_CALL.subscribe(() => {
    call.close();
  });
};

export { peerConnection, callToUser };

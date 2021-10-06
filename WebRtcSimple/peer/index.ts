import { ACCEPT_CALL, CallEvents, END_CALL, JOIN_GROUP_CALL, LEAVE_GROUP_CALL, MESSAGE, RECEIVED_CALL, RECEIVED_GROUP_CALL, REMOTE_STREAM, SEND_MESSAGE, SetupPeer, START_CALL, START_GROUP_CALL } from '../contains';
import Peer from './peerjs';

let peer: any = null;
const peerConnection = async (configPeer: SetupPeer) => {
  peer = new Peer(configPeer?.key ? configPeer.key : undefined, configPeer.optional ? configPeer.optional : undefined);
  return peer;
};

const listeningRemoteCall = (sessionId: string, myStream: any) => {
  // listening event connect
  peer.on('connection', (peerConn: any) => {
    if (peerConn) {
      peerConn.on('error', (e: any) => {
        console.log(e);
        END_CALL.next();
      });
      peerConn.on('open', () => {
        peerConn.on('data', (data: any) => {
          // the other person call to you
          if (data.type === CallEvents.start) {
            RECEIVED_CALL.next({ peerConn, userData: data.userData });
          }
          // events send message
          if (data.type === CallEvents.message) {
            MESSAGE.next({ sessionId: data.sessionId, message: data.message });
          }
          // events group call
          if (data.type === CallEvents.startGroup) {
            RECEIVED_GROUP_CALL.next({ peerConn, userData: data.userData });
          }
          // events join group call
          if (data.type === CallEvents.joinGroup) {
            JOIN_GROUP_CALL.next({ peerConn, sessionId: data.sessionId });
          }
        });
      });
    }
  });

  // listening events accept call
  ACCEPT_CALL.subscribe((data: any) => {
    try {
      if (data?.sessionId) {
        startStream(data.sessionId, myStream, sessionId);
      } else {
        if (data?.peerConn) {
          data.peerConn.map((item: any) => {
            if (item) {
              item.send({ type: CallEvents.accept, sessionId });
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }

  });

  // listenings events end call 
  END_CALL.subscribe((data: any) => {
    try {
      if (data) {
        if (data?.arrCurrentCall) {
          data.arrCurrentCall.map((item: any) => {
            if (item) {
              item.close();
            }
          });
        }

        if (data?.peerConn) {
          data.peerConn.map((item: any) => {
            if (item) {
              item.close();
            }
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  });


  // listenings events message
  SEND_MESSAGE.subscribe((data: any) => {
    try {
      if (data && data?.peerConn) {
        data.peerConn.map((item: any) => {
          if (item) {
            item.send({ type: CallEvents.message, sessionId, message: data.message });
          }
        });
      }
    } catch (error) {
      console.log(error);
    }
  });

  // listenings events start stream
  peer.on('call', (call: any) => {
    const id = call?.metadata?.sessionId;
    call.answer(myStream);
    call.on('stream', (remoteStream: any) => {
      REMOTE_STREAM.next({ remoteStream, call, sessionId: id });
    });

    call.on('close', function () {
    });
  });
};

const callToUser = (sessionId: string, receiverId: string, userData: any) => {
  // create connection peer to peer
  const peerConn = peer.connect(receiverId);
  if (peerConn) {
    peerConn.on('error', (e: any) => {
      // when connect error then close call
      console.log(e)
      END_CALL.next();
    });
    peerConn.on('open', () => {
      // send a message to the other
      userData.sessionId = sessionId;
      const data = {
        type: CallEvents.start,
        userData,
      }
      peerConn.send(data);
      // save current connection
      START_CALL.next({ peerConn, userData });

      peerConn.on('data', (data: any) => {
        // the other person accept call
        if (data.type === CallEvents.accept) {
          ACCEPT_CALL.next({ peerConn, sessionId: data.sessionId });
        }
      });
    });
  }
};

const startGroup = (sessionId: string, arrSessionId: string[], userData: any) => {
  arrSessionId.map(receiverId => {
    if (receiverId !== sessionId) {
      const peerConn = peer.connect(receiverId);
      if (peerConn) {
        peerConn.on('error', (e: any) => {
          // when connect error then close call
          console.log(e)
          LEAVE_GROUP_CALL.next({ sessionId: receiverId });
        });
        peerConn.on('open', () => {
          // send a message to the other
          userData.groupSessionId = [...arrSessionId, sessionId];
          const data = {
            type: CallEvents.startGroup,
            userData,
          }
          peerConn.send(data);
          // save current connection
          START_GROUP_CALL.next({ peerConn });
        });
      }
    }
  });
};

const joinGroup = (sessionId: string, arrSessionId: string[]) => {
  arrSessionId.map(receiverId => {
    if (sessionId !== receiverId) {
      const peerConn = peer.connect(receiverId);
      if (peerConn) {
        peerConn.on('error', (e: any) => {
          // when connect error then close call
          console.log(e)
          LEAVE_GROUP_CALL.next({ sessionId: receiverId });
        });
        peerConn.on('open', () => {
          // send a message to the other
          const data = {
            type: CallEvents.joinGroup,
            sessionId
          }
          peerConn.send(data);
          // save current connection
          JOIN_GROUP_CALL.next({ peerConn });
        });
      }
    }
  });
};

const leaveGroup = (data: any) => {
  if (data) {
    if (data?.arrCurrentCall) {
      data.arrCurrentCall.map((item: any) => {
        if (item) {
          item.close();
        }
      });
    }

    if (data?.peerConn) {
      data.peerConn.map((item: any) => {
        if (item) {
          item.close();
        }
      });
    }
  }
  LEAVE_GROUP_CALL.next();
}

const startStream = (sessionId: string, myStream: any, mySessionId?: string) => {
  if (peer) {
    const options = { metadata: { "sessionId": mySessionId } };
    const call = peer.call(sessionId, myStream, options);
    call.on('stream', (remoteStream: any) => {
      REMOTE_STREAM.next({ remoteStream, call, sessionId });
    });

    call.on('close', function () {
    });
  }

};

export { peerConnection, listeningRemoteCall, callToUser, startGroup, joinGroup, leaveGroup, startStream };

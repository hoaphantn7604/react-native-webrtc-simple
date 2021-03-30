import { Dimensions } from 'react-native';
import { mediaDevices, RTCPeerConnection } from 'react-native-webrtc';

const { width, height } = Dimensions.get('window');

const configuration = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };

const startWebRTC = async () => {
  const pc = new RTCPeerConnection(configuration);
  let isFront = true;
  const stream = await mediaDevices.enumerateDevices().then(async (sourceInfos) => {
    let videoSourceId;
    for (let i = 0; i < sourceInfos.length; i++) {
      const sourceInfo = sourceInfos[i];
      if (
        sourceInfo.kind === 'videoinput' &&
        sourceInfo.facing === (isFront ? 'front' : 'environment')
      ) {
        videoSourceId = sourceInfo.deviceId;
      }
    }

    const stream = await mediaDevices.getUserMedia({
      audio: false,
      video: {
        mandatory: {
          minWidth: width,
          minHeight: height,
          minFrameRate: 30,
        },
        facingMode: isFront ? 'user' : 'environment',
        optional: [videoSourceId],
      },
    });
    if (stream) {
      return stream;
    }
  });

  pc.createOffer().then((desc) => {
    pc.setLocalDescription(desc).then(() => {
      // Send pc.localDescription to peer
      console.log('setLocalDescription', desc);
    });
  });

  pc.onicecandidate = function (event) {
    // send event.candidate to peer
    console.log('onicecandidate', event);
  };
  if (stream) {
    return stream;
  }
};

export { startWebRTC };

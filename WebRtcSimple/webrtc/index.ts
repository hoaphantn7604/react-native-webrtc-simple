import { mediaDevices } from 'react-native-webrtc';

const startWebRTC = async () => {
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
      audio: true,
      video: true,
    });

    if (stream) {
      return stream;
    }
  });

  if (stream) {
    return stream;
  }
};

export { startWebRTC };

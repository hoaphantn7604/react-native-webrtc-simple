import { mediaDevices } from 'react-native-webrtc';
import { VideoConfigs } from '../contains';

const startWebRTC = async (videoConfigs?: VideoConfigs) => {
  let isFront = true;
  const stream = await mediaDevices.enumerateDevices().then(async (sourceInfos: any) => {
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
      video: videoConfigs ? videoConfigs : true,
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

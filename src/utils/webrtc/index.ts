import { mediaDevices } from 'react-native-webrtc';
import type { VideoConfigs } from '../contains';

let videoSourceId: any[] = [];
const startWebRTC = async (videoConfigs?: VideoConfigs) => {
  let isFront = true;
  const stream = await mediaDevices.enumerateDevices().then(async (_sourceInfos: any) => {
    videoSourceId = [];
    for (let i = 0; i < _sourceInfos.length; i++) {
      const sourceInfo = _sourceInfos[i];
      if (
        sourceInfo.kind === 'videoinput' &&
        sourceInfo.facing === (isFront ? 'front' : 'environment')
      ) {
        videoSourceId.push(sourceInfo.deviceId);
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

export { startWebRTC, videoSourceId };

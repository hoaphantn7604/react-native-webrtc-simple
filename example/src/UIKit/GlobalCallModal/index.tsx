import React, { useEffect, useImperativeHandle, useState } from 'react';
import {
  Image,
  Modal, StatusBar, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { CallEvents, WebRTCSimple } from 'react-native-webrtc-simple';
import { Timer } from './../index';
import { styles } from './styles';

const RTCViewNew: any = RTCView;

let interval: any = null;
const ringtime = 20;

export const globalCallRef = React.createRef<any>();
export const globalCall = {
  call: (sessionId: string, userData: object) => {
    globalCallRef?.current?.call(sessionId, userData);
  },
};

export interface Props {
  name?: string;
}

StatusBar.setBarStyle('dark-content');
const GlobalCallUI = React.forwardRef((_props, ref) => {

  const [visible, setVisible] = useState<boolean>(false);
  const stream = WebRTCSimple.getLocalStream();
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const [type, setType] = useState<string>('');
  const [audioEnable, setAudioEnable] = useState<boolean>(true);
  const [videoEnabled, setVideoEnable] = useState<boolean>(true);
  const [cameraType, setCameraType] = useState<'front' | 'end'>('front');
  const [remoteCameraType, setRemoteCameraType] = useState<'front' | 'end'>('front');
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');

  useImperativeHandle(ref, () => {
    return { call };
  });

  useEffect(() => {
    WebRTCSimple.listenings.getRemoteStream((remoteStream) => {
      setRemoteStream(remoteStream);
    });

    WebRTCSimple.listenings.callEvents((type, userData: any) => {

      console.log('CallEvents: ',type, userData);

      if (type !== CallEvents.message) {
        setType(type);
      }

      if (type === CallEvents.received || type === CallEvents.start) {
        video(true);
        audio(true);
        let time = ringtime;
        interval = setInterval(() => {
          time = time - 1;
          if (time === 0) {
            endCall();
            clearInterval(interval);
          }
        }, 1000);

        if (type === CallEvents.received) {
          WebRTCSimple.events.vibration.start(20);

          if (userData?.sender_name && userData?.sender_avatar) {
            setName(userData.sender_name);
            setAvatar(userData.sender_avatar);
          }
        } else {
          if (userData?.receiver_name && userData?.receiver_avatar) {
            setName(userData.receiver_name);
            setAvatar(userData.receiver_avatar);
          }
        }
        setVisible(true);
      }

      if (type === CallEvents.accept) {
        clearInterval(interval);
        WebRTCSimple.events.vibration.cancel();
      }

      if (type === CallEvents.end) {
        clearInterval(interval);
        WebRTCSimple.events.vibration.cancel();
        setVisible(false);
        setAudioEnable(true);
        setVideoEnable(true);
      }

      if (type === CallEvents.message) {
        if (userData?.message?.type === 'SWITCH_CAMERA') {
          setRemoteCameraType(userData?.message?.value);
        }
      }
    });
  }, []);

  const call = (sessionId: string, userData: object) => {
    WebRTCSimple.events.call(sessionId, userData);
  };

  const acceptCall = () => {
    WebRTCSimple.events.acceptCall();
  };

  const endCall = () => {
    WebRTCSimple.events.endCall();
  };

  const switchCamera = () => {
    if (cameraType === 'front') {
      setCameraType('end');
      WebRTCSimple.events.message({ type: 'SWITCH_CAMERA', value: 'end' });
    } else {
      setCameraType('front');
      WebRTCSimple.events.message({ type: 'SWITCH_CAMERA', value: 'front' });
    }
    WebRTCSimple.events.switchCamera();
  };

  const video = (enable: boolean) => {
    WebRTCSimple.events.videoEnable(enable);
  };

  const audio = (enable: boolean) => {
    WebRTCSimple.events.audioEnable(enable);
  };

  const renderIcon = (icon: any, color: string, onPress: () => void) => {
    return (<View>
      <TouchableOpacity
        style={[styles.btnCall, { backgroundColor: color }]}
        onPress={() => {
          onPress();
        }}>
        <Image style={[styles.icon, { tintColor: color === 'white' ? 'black' : 'white' }]} source={icon} />
      </TouchableOpacity>
    </View>)
  }

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={() => {
        setVisible(false);
      }}>
      <View style={styles.modalCall}>
        {name.length > 0 && type !== CallEvents.accept && <Text style={styles.name}>{name}</Text>}
        {avatar.length > 0 && type !== CallEvents.accept && (
          <Image style={styles.avatar} source={{ uri: avatar }} />
        )}
        {(type === CallEvents.start || type === CallEvents.received) && <Timer style={styles.timer} textStyle={styles.textTimer} start />}
        {type === CallEvents.accept && remoteStream && (
          <View style={{ flex: 1 }}>
            {stream && (
              <View style={styles.boxMyStream}>
                <RTCViewNew mirror={cameraType === 'front' ? true : false} streamURL={stream.toURL()} zOrder={999} style={styles.myStream} objectFit="cover" />
                {type === CallEvents.accept &&
                  <Timer
                    style={styles.timer2}
                    textStyle={styles.textTimer2}
                    start
                  />}
                <TouchableOpacity onPress={() => switchCamera()}>
                  <Image style={styles.iconCamera} source={require('./icon/camera.png')} />
                </TouchableOpacity>
              </View>
            )}

            <RTCViewNew mirror={remoteCameraType === 'front' ? true : false} streamURL={remoteStream.toURL()} zOrder={99} style={styles.stream} objectFit="cover" />
          </View>
        )}
        {type === CallEvents.start && (
          <View style={styles.manageCall}>
            {renderIcon(require('./icon/endcall.png'), 'red', () => {
              setVisible(false);
              endCall();
            })}
          </View>
        )}
        {type === CallEvents.received && (
          <View style={styles.manageCall}>
            {renderIcon(require('./icon/call.png'), 'green', () => {
              acceptCall();
            })}
            {renderIcon(require('./icon/endcall.png'), 'red', () => {
              setVisible(false);
              endCall();
            })}
          </View>
        )}
        {type === CallEvents.accept && (
          <View style={styles.manageCall}>
            {renderIcon(require('./icon/micro.png'), audioEnable ? 'white' : 'red', () => {
              audio(!audioEnable);
              setAudioEnable(!audioEnable);
            })}

            {renderIcon(require('./icon/video.png'), videoEnabled ? 'white' : 'red', () => {
              video(!videoEnabled);
              setVideoEnable(!videoEnabled);
            })}

            {renderIcon(require('./icon/endcall.png'), 'red', () => {
              setVisible(false);
              endCall();
            })}

          </View>
        )}
      </View>
    </Modal>
  );
});

export default GlobalCallUI;

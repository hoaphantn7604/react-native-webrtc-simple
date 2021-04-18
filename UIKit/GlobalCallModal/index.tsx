import React, { useImperativeHandle, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar
} from 'react-native';
import { dimensionsScale } from 'react-native-utils-scale';
import { RTCView } from 'react-native-webrtc';
import WebrtcSimple from '../../index';
import _ from 'lodash';
import { CallType, SetupPeer } from '../../WebRtcSimple/contains';

let interval: any = null;
const ringtime = 20;

export const globalCallRef = React.createRef<any>();
export const globalCall = {
  start: (configuration: SetupPeer, callback: (sessionId: string) => void) => {
    globalCallRef?.current?.start(configuration, callback);
  },
};

const { width, height } = Dimensions.get('window');

export interface Props {
  name?: string;
}


StatusBar.setBarStyle('dark-content');
const GlobalCallUI = React.forwardRef((props, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');

  const [stream, setStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);

  const [type, setType] = useState('');
  const [audioEnable, setAudioEnable] = useState(false);
  const [videoEnabled, setVideoEnable] = useState(true);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('');

  useImperativeHandle(ref, () => {
    return { start };
  });

  const start = (configuration: SetupPeer, callback: (sessionId: string) => void) => {
    WebrtcSimple.start(configuration)
      .then((status) => {
        if (status) {
          const stream = WebrtcSimple.getLocalStream();
          setStream(stream);

          WebrtcSimple.getSessionId((id: string) => {
            setUserId(id);
            callback(id);
          });
        }
      })
      .catch();

    WebrtcSimple.listenings.callEvents((type, userData: any) => {
      setType(type);
      console.log('type: ', type, userData);

      if (type === CallType.received || type === CallType.start) {
        let time = ringtime;
        interval = setInterval(() => {
          time = time - 1;
          if (time === 0) {
            rejectCall();
            clearInterval(interval);
          }
        }, 1000);

        if (type === CallType.received) {
          WebrtcSimple.events.vibration.start(20);

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

      if (type === CallType.accept || type === CallType.reject) {
        clearInterval(interval);
        WebrtcSimple.events.vibration.cancel();
      }

      if (type === CallType.end || type === CallType.reject) {
        setVisible(false);
        setAudioEnable(true);
        setVideoEnable(true);
      }
    });

    WebrtcSimple.listenings.getRemoteStream((remoteStream) => {
      setRemoteStream(remoteStream);
    });
  };

  const acceptCall = () => {
    WebrtcSimple.events.acceptCall();
  };

  const rejectCall = () => {
    WebrtcSimple.events.rejectCall();
  };

  const endCall = () => {
    WebrtcSimple.events.endCall();
  };

  const switchCamera = () => {
    WebrtcSimple.events.switchCamera();
  };

  const video = (enable: boolean) => {
    WebrtcSimple.events.videoEnable(enable);
  };

  const audio = (enable: boolean) => {
    WebrtcSimple.events.audioEnable(enable);
  };

  if (!userId) {
    return <View style={{ backgroundColor: 'green' }} />;
  }

  const renderIcon = (icon: any, color: string, onPress: () => void) => {
    return (<View>
      <TouchableOpacity
        style={[styles.btnCall, { backgroundColor: color }]}
        onPress={() => {
          onPress();
        }}>
        <Image style={[styles.icon, {tintColor:color === 'white' ? 'black' : 'white' }]} source={icon} />
      </TouchableOpacity>
    </View>)
  }

  return (
    <Modal
      visible={visible}
      transparent
      onRequestClose={() => {
        setVisible(false);
      }}>
      <View style={styles.modalCall}>
        {name.length > 0 && type !== CallType.accept && <Text style={styles.name}>{name}</Text>}
        {avatar.length > 0 && type !== CallType.accept && (
          <Image style={styles.avatar} source={{ uri: avatar }} />
        )}
        {type === CallType.accept && remoteStream && (
          <View style={{ flex: 1 }}>
            {stream && (
              <View style={styles.boxMyStream}>
                <RTCView streamURL={stream.toURL()} style={styles.myStream} objectFit="cover" />
                <TouchableOpacity onPress={()=> switchCamera()}>
                <Image style={styles.iconCamera} source={require('./icon/camera.png')} />
                </TouchableOpacity>
              </View>
            )}

            <RTCView streamURL={remoteStream.toURL()} style={styles.stream} objectFit="cover" />
          </View>
        )}
        {type === CallType.start && (
          <View style={styles.manageCall}>
            {renderIcon(require('./icon/endcall.png'), 'red', () => {
              setVisible(false);
              rejectCall();
            })}
          </View>
        )}
        {type === CallType.received && (
          <View style={styles.manageCall}>
            {renderIcon(require('./icon/call.png'), 'green', () => {
              acceptCall();
            })}
            {renderIcon(require('./icon/endcall.png'), 'red', () => {
              setVisible(false);
              rejectCall();
            })}
          </View>
        )}
        {type === CallType.accept && (
          <View style={styles.manageCall}>
            {renderIcon(require('./icon/micro.png'), audioEnable ? 'white' : 'red', () => {
              audio(!audioEnable);
              setAudioEnable(!audioEnable);
            })}

            {renderIcon(require('./icon/video.png'), videoEnabled ? 'white' : 'red', () => {
              video(!videoEnabled);
              setVideoEnable(!videoEnabled);
            })}

            {/* 
            <TouchableOpacity
              style={[styles.btnCall, { backgroundColor: 'green' }]}
              onPress={() => {
                switchCamera();
              }}>
              <Text style={styles.text}>Switch camera</Text>
            </TouchableOpacity> */}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCall: {
    flex: 1,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCall: {
    width: 70 * dimensionsScale.scale(),
    height: 70 * dimensionsScale.scale(),
    borderRadius: 35 * dimensionsScale.scale(),
    marginHorizontal: 20 * dimensionsScale.scale(),
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3 * dimensionsScale.scale()
  },
  icon: {
    width: 35 * dimensionsScale.scale(),
    height: 35 * dimensionsScale.scale(),
  },
  manageCall: {
    flexDirection: 'row',
    marginVertical: 20 * dimensionsScale.scale(),
    position: 'absolute',
    bottom: 10 * dimensionsScale.scale(),
  },
  boxMyStream: {
    borderRadius: 10 * dimensionsScale.scale(),
    padding: 3 * dimensionsScale.scale(),
    position: 'absolute',
    zIndex: 99 * dimensionsScale.scale(),
    bottom: 140 * dimensionsScale.scale(),
    backgroundColor: 'white',
    right: 10 * dimensionsScale.scale(),
  },
  myStream: {
    width: 150 * dimensionsScale.scale(),
    height: 180 * dimensionsScale.scale(),
    borderRadius: 10 * dimensionsScale.scale()
  },
  iconCamera: {
    width: 30 * dimensionsScale.scale(),
    height: 30 * dimensionsScale.scale(),
    position: 'absolute',
    zIndex: 999,
    tintColor: 'white',
    right: 10 * dimensionsScale.scale(),
    bottom: 10 * dimensionsScale.scale(),
  },
  stream: {
    width: width,
    height: height,
  },
  name: {
    fontSize: 20 * dimensionsScale.scale(),
    color: 'white',
    fontWeight: 'bold',
  },
  avatar: {
    width: 80 * dimensionsScale.scale(),
    height: 80 * dimensionsScale.scale(),
    borderRadius: 40 * dimensionsScale.scale(),
    marginTop: 20 * dimensionsScale.scale(),
  },
});

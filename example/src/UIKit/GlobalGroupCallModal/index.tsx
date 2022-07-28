import React, { useEffect, useImperativeHandle, useState } from 'react';
import {
  FlatList, Image,
  Modal, StatusBar, Text,
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import {WebRTCSimple, CallEvents} from 'react-native-webrtc-simple';
import { Timer } from './../index';
import { styles } from './styles';

let interval: any = null;
const ringtime = 20;
let status: 'start' | 'ring' | 'incall' | 'none' = 'none';
const { width, height } = Dimensions.get('window');

const RTCViewNew: any = RTCView;

export const globalGroupCallRef = React.createRef<any>();
export const globalGroupCall = {
  call: (sessionId: string[], userData: object) => {
    globalGroupCallRef?.current?.call(sessionId, userData);
  }
};

export interface Props {
  name?: string;
}

StatusBar.setBarStyle('dark-content');
const GlobalCallUI = React.forwardRef((_props, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<'start' | 'ring' | 'incall' | 'none'>('none');
  const stream = WebRTCSimple.getLocalStream();
  const [remotes, setRemotes] = useState<any[]>([]);
  const [groupSessionId, setGroupSessionId] = useState<string[]>([]);
  const [audioEnable, setAudioEnable] = useState<boolean>(true);
  const [videoEnabled, setVideoEnable] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');

  useImperativeHandle(ref, () => {
    return { call };
  });

  useEffect(() => {
    WebRTCSimple.listenings.getRemoteStream((remoteStream, sessionId) => {
      if (status === 'incall' || status === 'start' || status === 'ring') {
        const checkSessionId = remotes.filter((e: any) => e.sessionId === sessionId);
        if (checkSessionId.length === 0) {
          setRemotes((e: any) => [...e, { remoteStream, sessionId }]);
        }
      }
    });

    WebRTCSimple.listenings.callEvents((type, userData: any) => {
      if (type === CallEvents.receivedGroup) {
        WebRTCSimple.events.vibration.start(20);
        setVisible(true);
        video(true);
        audio(true);

        if (userData?.groupSessionId?.length > 0) {
          let time = ringtime;
          interval = setInterval(() => {
            time = time - 1;
            if (time === 0) {
              leaveGroup();
              clearInterval(interval);
              setVisible(false);
            }
          }, 1000);

          setName(userData.name);
          setAvatar(userData.avatar);
          setCallStatus('ring');
          status = 'ring';
          setGroupSessionId(userData.groupSessionId);
        }
      }

      if (type === CallEvents.leaveGroup) {
        if (userData?.sessionId) {
          const listRemote = remotes.filter((e: any) => e.sessionId !== userData?.sessionId);
          setRemotes(listRemote);
        } else {
          setRemotes([]);
          clearInterval(interval);
        }
      }
      if (type === CallEvents.joinGroup) {
        clearInterval(interval);
        if (userData?.sessionId) {
          if (status === 'incall' || status === 'start') {
            WebRTCSimple.events.addStream(userData?.sessionId);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    if (remotes.length > 0) {
      setCallStatus('incall');
    }
  }, [remotes]);

  const call = (sessionId: string[], userData: any) => {
    if (sessionId.length > 0) {

      setVisible(true);
      video(true);
      audio(true);
      status = 'start';
      setCallStatus('start');

      let time = ringtime;
      interval = setInterval(() => {
        time = time - 1;
        if (time === 0) {
          leaveGroup();
          clearInterval(interval);
          setVisible(false);
        }
      }, 1000);

      setName(userData?.name);
      setAvatar(userData?.avatar);
      WebRTCSimple.events.groupCall(sessionId, userData);
    }
  };

  const joinGroup = () => {
    WebRTCSimple.events.vibration.cancel();
    status = 'incall';
    setCallStatus('incall');
    WebRTCSimple.events.joinGroup(groupSessionId);
  };

  const leaveGroup = () => {
    WebRTCSimple.events.vibration.cancel();
    status = 'none';
    setCallStatus('none');
    WebRTCSimple.events.leaveGroup();
  };

  const video = (enable: boolean) => {
    WebRTCSimple.events.videoEnable(enable);
  };

  const audio = (enable: boolean) => {
    WebRTCSimple.events.audioEnable(enable);
  };

  const switchCamera = () => {
    WebRTCSimple.events.switchCamera();
  };

  const _renderStream = ({ item, index }: any) => {
    return (
      <RTCViewNew
        key={index.toString()}
        mirror
        streamURL={item.remoteStream.toURL()}
        zOrder={999}
        style={[styles.remoteStream, remotes.length === 1 && { width: width, height: height }]}
        objectFit="cover"
      />
    );
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
        {(callStatus === 'start' || callStatus === 'ring') && <Text style={styles.name}>{name}</Text>}
        {(callStatus === 'start' || callStatus === 'ring') && <Image style={styles.avatar} source={{ uri: avatar }} />}
        {(callStatus === 'start' || callStatus === 'ring') && <Timer style={styles.timer} textStyle={styles.textTimer} start />}

        {callStatus === 'incall' && <View style={styles.boxMyStream}>
          <RTCViewNew mirror streamURL={stream.toURL()} zOrder={999} style={styles.myStream} objectFit="cover" />
          <Timer
            style={styles.timer2}
            textStyle={styles.textTimer2} start
          />
          <TouchableOpacity onPress={() => switchCamera()}>
            <Image style={styles.iconCamera} source={require('./icon/camera.png')} />
          </TouchableOpacity>
        </View>}
        {remotes.length > 0 && <View style={styles.wrapListStream}>
          <FlatList
            extraData={remotes}
            data={remotes}
            numColumns={2}
            keyExtractor={(_item, index) => index.toString()}
            renderItem={_renderStream}
          />
        </View>}
        {callStatus === 'start' && <View style={styles.manageCall}>
          {renderIcon(require('./icon/endcall.png'), 'red', () => {
            setVisible(false);
            leaveGroup();
          })}
        </View>}

        {callStatus === 'ring' && <View style={styles.manageCall}>
          {renderIcon(require('./icon/call.png'), 'green', () => {
            joinGroup();
          })}
          {renderIcon(require('./icon/endcall.png'), 'red', () => {
            setVisible(false);
            leaveGroup();
          })}
        </View>}

        {callStatus === 'incall' &&
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
              leaveGroup();
            })}
          </View>}

      </View>
    </Modal>
  );
});

export default GlobalCallUI;

import React, { useEffect, useImperativeHandle, useState } from 'react';
import {
  FlatList, Image,
  Modal, StatusBar, Text,
  TouchableOpacity,
  View
} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import WebrtcSimple from '../../index';
import { CallEvents } from '../../WebRtcSimple/contains';
import { Timer } from './../index';
import { styles } from './styles';

let interval: any = null;
const ringtime = 20;
let status: 'start' | 'ring' | 'incall' | 'none' = 'none';

export const globalGroupCallRef = React.createRef<any>();
export const globalGroupCall = {
  call: (sessionId: string[], userData: object) => {
    globalGroupCallRef?.current?.call(sessionId, userData);
  },
  refresh: (callback: (status: boolean) => void) => {
    globalGroupCallRef?.current?.refresh(callback);
  },
};

export interface Props {
  name?: string;
}

StatusBar.setBarStyle('dark-content');
const GlobalCallUI = React.forwardRef((props, ref) => {
  const [visible, setVisible] = useState<boolean>(false);
  const [callStatus, setCallStatus] = useState<'start' | 'ring' | 'incall' | 'none'>('none');
  const stream = WebrtcSimple.getLocalStream();
  const [remotes, setRemotes] = useState<any[]>([]);
  const [groupSessionId, setGroupSessionId] = useState<string[]>([]);
  const [audioEnable, setAudioEnable] = useState<boolean>(true);
  const [videoEnabled, setVideoEnable] = useState<boolean>(true);
  const [name, setName] = useState<string>('');
  const [avatar, setAvatar] = useState<string>('');

  useImperativeHandle(ref, () => {
    return { call, refresh };
  });

  const refresh = (callback: (status: boolean) => void) => {
    WebrtcSimple.refresh(callback);
  };

  useEffect(() => {
    WebrtcSimple.listenings.getRemoteStream((remoteStream, sessionId) => {
      if (status === 'incall' || status === 'start' || status === 'ring') {
        const checkSessionId = remotes.filter((e: any) => e.sessionId === sessionId);
        if (checkSessionId.length === 0) {
          setRemotes((e: any) => [...e, { remoteStream, sessionId }]);
        }
      }
    });

    WebrtcSimple.listenings.callEvents((type, userData: any) => {
      if (type === CallEvents.receivedGroup) {
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
            WebrtcSimple.events.addStream(userData?.sessionId);
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

  const call = (sessionId: string[], userData: object) => {
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
      WebrtcSimple.events.groupCall(sessionId, userData);
    }
  };

  const joinGroup = () => {
    status = 'incall';
    setCallStatus('incall');
    WebrtcSimple.events.joinGroup(groupSessionId);
  };

  const leaveGroup = () => {
    status = 'none';
    setCallStatus('none');
    WebrtcSimple.events.leaveGroup();
  };

  const video = (enable: boolean) => {
    WebrtcSimple.events.videoEnable(enable);
  };

  const audio = (enable: boolean) => {
    WebrtcSimple.events.audioEnable(enable);
  };

  const switchCamera = () => {
    WebrtcSimple.events.switchCamera();
  };

  const _renderStream = ({ item, index }: any) => {
    return (
      <RTCView
        mirror
        streamURL={item.remoteStream.toURL()}
        zOrder={999}
        style={styles.remoteStream}
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
          <RTCView mirror streamURL={stream.toURL()} zOrder={999} style={styles.myStream} objectFit="cover" />
          <Timer
            style={styles.timer2}
            textStyle={styles.textTimer2} start
          />
          <TouchableOpacity onPress={() => switchCamera()}>
            <Image style={styles.iconCamera} source={require('./icon/camera.png')} />
          </TouchableOpacity>
        </View>}
        {remotes.length > 0 && <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start' }}>
          <FlatList extraData={remotes} data={remotes} numColumns={2} renderItem={_renderStream} />
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

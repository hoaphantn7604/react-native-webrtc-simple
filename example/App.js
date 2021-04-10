/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import WebrtcSimple from 'react-native-webrtc-simple';
import { RTCView } from 'react-native-webrtc';
import Clipboard from '@react-native-community/clipboard';
import { dimensionsScale } from 'react-native-utils-scale';

const { width, height } = Dimensions.get('window');

const App = (props) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [userId, setUserId] = useState(null);
  const [type, setType] = useState('');
  const [mute, setMute] = useState(false);
  const [visible, setVisible] = useState(false);
  const [callId, setCallId] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    const configuration = {
      // optional: {
      //   host: '192.168.30.216',
      //   port: '3000',
      //   path: '/mypeer'
      // }
      optional: null
      ,
      key: Math.random().toString(36).substr(2, 4), //optional
    };

    WebrtcSimple.start(configuration)
      .then((status) => {
        if (status) {
          const stream = WebrtcSimple.getLocalStream();
          setStream(stream);

          WebrtcSimple.getMyId((id) => {
            setUserId(id);
          });
        }
      })
      .catch();

    WebrtcSimple.listenings.callEvent((type, userData) => {
      setType(type);
      if (userData) {
        console.log(userData);
        setText(userData.name)
      }

      if (type === 'RECEIVED_CALL') {
        setVisible(true);
      }

      if (type === 'END_CALL' || type === 'REJECT_CALL') {
        setVisible(false);
      }
    });

    WebrtcSimple.listenings.getRemoteStream((remoteStream) => {
      setRemoteStream(remoteStream);
    });
  }, []);

  const callToUser = (userId) => {
    setVisible(true);
    setText('Calling...!');
    const data = {
      name: 'User name',
      avatar: '',
    };
    WebrtcSimple.events.call(userId, data);
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

  const muted = (mute) => {
    WebrtcSimple.events.muted(!mute);
  };

  if (!userId) {
    return <View style={{ flex: 1, backgroundColor: 'green' }} />;
  }
  return (
    <View style={styles.container}>

      <View>
        <Text style={{ fontSize: 30 }}>{userId}</Text>
        <View style={styles.btn}>
          <Button
            title="Copy"
            color={Platform.OS === 'ios' ? 'white' : 'black'}
            onPress={() => {
              Clipboard.setString(userId);
            }}
          />
        </View>
      </View>

      <View style={styles.rowbtn}>
        <TextInput
          style={styles.textInput}
          placeholder="Enter id"
          onChangeText={(text) => {
            setCallId(text);
          }}
        />
        <View style={styles.btn}>
          <Button
            title="Call"
            color={Platform.OS === 'ios' ? 'white' : 'black'}
            onPress={() => {
              callToUser(callId);
            }}
          />
        </View>
      </View>
      <Modal
        visible={visible}
        transparent
        onRequestClose={() => {
          setVisible(false);
        }}>
        <View style={styles.modalCall}>
          {text.length > 0 && type !== 'ACCEPT_CALL' && <Text style={{ fontSize: 20 }}>{text}</Text>}
          {type === 'ACCEPT_CALL' && remoteStream && (
            <View style={{ flex: 1 }}>
              {stream && (
                <RTCView
                  streamURL={stream.toURL()}
                  style={styles.myStream}
                  objectFit="cover"
                />
              )}

              <RTCView
                streamURL={remoteStream.toURL()}
                style={styles.stream}
                objectFit="cover"
              />
            </View>
          )}
          {type === 'START_CALL' && (
            <View style={styles.manageCall}>
              <TouchableOpacity
                style={[styles.btnCall, { backgroundColor: 'red' }]}
                onPress={() => {
                  setVisible(false);
                  rejectCall();
                }}>
                <Text style={styles.text}>End</Text>
              </TouchableOpacity>
            </View>
          )}
          {type === 'RECEIVED_CALL' && (
            <View style={styles.manageCall}>
              <TouchableOpacity
                style={[styles.btnCall, { backgroundColor: 'green' }]}
                onPress={() => {
                  acceptCall();
                }}>
                <Text style={styles.text}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnCall, { backgroundColor: 'red' }]}
                onPress={() => {
                  setVisible(false);
                  rejectCall();
                }}>
                <Text style={styles.text}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
          {type === 'ACCEPT_CALL' && (
            <View style={styles.manageCall}>
              <TouchableOpacity
                style={[
                  styles.btnCall,
                  { backgroundColor: mute ? 'red' : 'green' },
                ]}
                onPress={() => {
                  muted(!mute);
                  setMute(!mute);
                }}>
                <Text style={styles.text}>Speaker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnCall, { backgroundColor: 'green' }]}
                onPress={() => {
                  switchCamera();
                }}>
                <Text style={styles.text}>Switch camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnCall, { backgroundColor: 'red' }]}
                onPress={() => {
                  setVisible(false);
                  endCall();
                }}>
                <Text style={styles.text}>End</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowbtn: {
    flexDirection: 'row',
    paddingHorizontal: 16 * dimensionsScale.scale(),
    alignItems: 'center',
    marginVertical: 8 * dimensionsScale.scale(),
  },
  btn: {
    margin: 16 * dimensionsScale.scale(),
    width: 80 * dimensionsScale.scale(),
    height: 40 * dimensionsScale.scale(),
    backgroundColor: 'black',
  },
  textInput: {
    width: 200 * dimensionsScale.scale(),
    height: 50 * dimensionsScale.scale(),
    borderWidth: 0.5 * dimensionsScale.scale(),
    borderColor: 'gray',
    paddingHorizontal: 12 * dimensionsScale.scale(),
  },
  myStream: {
    width: 150 * dimensionsScale.scale(),
    height: 180 * dimensionsScale.scale(),
    position: 'absolute',
    right: 0,
    zIndex: 99 * dimensionsScale.scale(),
    top: 40 * dimensionsScale.scale(),
  },
  stream: {
    width: width,
    height: height,
  },
  button: {
    width: 100 * dimensionsScale.scale(),
  },
  row: {
    flexDirection: 'row',
  },
  modalCall: {
    flex: 1,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCall: {
    width: 80 * dimensionsScale.scale(),
    height: 80 * dimensionsScale.scale(),
    borderRadius: 40 * dimensionsScale.scale(),
    marginHorizontal: 20 * dimensionsScale.scale(),
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12 * dimensionsScale.scale(),
    textAlign: 'center',
  },
  manageCall: {
    flexDirection: 'row',
    marginVertical: 20 * dimensionsScale.scale(),
    position: 'absolute',
    bottom: 10 * dimensionsScale.scale(),
  },
});

export default App;

/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import WebrtcSimple from 'react-native-webrtc-simple';
import {RTCView} from 'react-native-webrtc';
import Clipboard from '@react-native-community/clipboard';

const {width, height} = Dimensions.get('window');

const App = (props) => {
  const [stream, setStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [userId, setUserId] = useState(null);
  const [type, setType] = useState('');
  const [mute, setMute] = useState(false);
  const [visible, setVisible] = useState(false);
  const [callId, setCallId] = useState('');

  useEffect(() => {
    // peerjs setup
    const setup = {
      // host: '192.168.30.216', //optional
      // port: '3000', //optional
      // path: '/mypeer', //optional
      // key: '', //optional
    };

    WebrtcSimple.start(setup)
      .then((status) => {
        if (status) {
          const stream = WebrtcSimple.getMyStream();
          console.log('My stream: ', stream);
          setStream(stream);

          WebrtcSimple.getMyId((id) => {
            console.log('UserId: ', id);
            setUserId(id);
          });
        }
      })
      .catch();

    WebrtcSimple.listenning.callEvent((type) => {
      console.log('Type: ', type);
      setType(type);
      if (type === 'RECEIVED_CALL') {
        setVisible(true);
      }
      if (type === 'ACCEPT_CALL') {
      }
      if (type === 'END_CALL') {
        setVisible(false);
      }
    });

    WebrtcSimple.listenning.getRemoteStream((remoteStream) => {
      console.log('Remote stream', remoteStream);
      setRemoteStream(remoteStream);
    });
  }, []);

  const callToUser = (userId) => {
    WebrtcSimple.event.call(userId);
  };

  const acceptCall = () => {
    WebrtcSimple.event.acceptCall();
  };

  const rejectCall = () => {
    WebrtcSimple.event.rejectCall();
  };

  const endCall = () => {
    WebrtcSimple.event.endCall();
  };

  const switchCamera = () => {
    WebrtcSimple.event.switchCamera();
  };

  const muted = (mute) => {
    WebrtcSimple.event.muted(!mute);
  };

  if (!userId) {
    return null;
  }
  return (
    <View style={styles.container}>
      <View>
        <Text>{userId}</Text>
        <Button
          style={styles.btn}
          title="Copy"
          onPress={() => {
            Clipboard.setString(userId);
          }}
        />
      </View>

      <View style={styles.rowbtn}>
        <TextInput
          style={styles.textInput}
          onChangeText={(text) => {
            setCallId(text);
          }}
        />
        <Button
          style={styles.btn}
          title="Call"
          onPress={() => {
            callToUser(callId);
          }}
        />
      </View>
      <Modal
        visible={visible}
        transparent
        onRequestClose={() => {
          setVisible(false);
        }}>
        <View style={styles.modalCall}>
          {type === 'ACCEPT_CALL' && remoteStream && (
            <View style={{flex: 1}}>
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
                style={[styles.btnCall, {backgroundColor: 'red'}]}
                onPress={() => {
                  setVisible(false);
                  endCall();
                }}>
                <Text style={styles.text}>End</Text>
              </TouchableOpacity>
            </View>
          )}
          {type === 'RECEIVED_CALL' && (
            <View style={styles.manageCall}>
              <TouchableOpacity
                style={[styles.btnCall, {backgroundColor: 'green'}]}
                onPress={() => {
                  acceptCall();
                }}>
                <Text style={styles.text}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnCall, {backgroundColor: 'red'}]}
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
                  {backgroundColor: mute ? 'red' : 'green'},
                ]}
                onPress={() => {
                  muted(!mute);
                  setMute(!mute);
                }}>
                <Text style={styles.text}>Speaker</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnCall, {backgroundColor: 'green'}]}
                onPress={() => {
                  switchCamera();
                }}>
                <Text style={styles.text}>Switch camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnCall, {backgroundColor: 'red'}]}
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
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  btn: {
    margin: 16,
  },
  textInput: {
    width: 200,
    height: 40,
    borderWidth: 0.5,
    borderColor: 'gray',
    paddingHorizontal: 12,
  },
  myStream: {
    width: 150,
    height: 180,
    position: 'absolute',
    right: 0,
    zIndex: 99,
    top: 40,
  },
  stream: {
    width: width,
    height: height,
  },
  button: {
    width: 100,
  },
  row: {
    flexDirection: 'row',
  },
  modalCall: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCall: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  manageCall: {
    flexDirection: 'row',
    marginVertical: 20,
    position: 'absolute',
    bottom: 10,
  },
});

export default App;

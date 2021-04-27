/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import Clipboard from '@react-native-community/clipboard';
import React, {useEffect, useState} from 'react';
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {dimensionsScale, isIOS} from 'react-native-utils-scale';
import WebrtcSimple from 'react-native-webrtc-simple';
import {
  globalCall,
  globalCallRef,
  GlobalCallUI,
} from 'react-native-webrtc-simple/UIKit';

const App = (props) => {
  const [userId, setUserId] = useState(null);
  const [callId, setCallId] = useState('');

  useEffect(() => {
    const configuration = {
      optional: null,
      key: isIOS() ? 'test1' : 'test2',
    };

    globalCall.start(configuration, (sessionId) => {
      setUserId(sessionId);
    });
  }, []);

  const callToUser = (userId) => {
    if (userId.length > 0) {
      const data = {
        sender_name: 'Sender Name',
        sender_avatar:
          'https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png',
        receiver_name: 'Receiver Name',
        receiver_avatar:
          'https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png',
      };
      WebrtcSimple.events.call(userId, data);
    } else {
      alert('Please enter userId');
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={{fontSize: 30}}>{userId}</Text>
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
          autoCapitalize="none"
          keyboardType="default"
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
      <GlobalCallUI ref={globalCallRef} />
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
    backgroundColor: 'black',
    paddingHorizontal: 10 * dimensionsScale.scale(),
  },
  textInput: {
    width: 200 * dimensionsScale.scale(),
    height: 50 * dimensionsScale.scale(),
    borderWidth: 0.5 * dimensionsScale.scale(),
    borderColor: 'gray',
    paddingHorizontal: 12 * dimensionsScale.scale(),
  },
});

export default App;

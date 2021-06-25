import React, {useEffect, useState} from 'react';
import {
  Button,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import WebrtcSimple from 'react-native-webrtc-simple';
import {
  globalCall,
  globalCallRef,
  GlobalCallUI,
} from 'react-native-webrtc-simple/UIKit';

const App = _props => {
  const [userId, setUserId] = useState(null);
  const [callId, setCallId] = useState('');

  useEffect(() => {
    const configuration = {
      optional: null,
      key: Math.random().toString(36).substr(2, 4),
    };

    globalCall.start(configuration, sessionId => {
      setUserId(sessionId);
    });
  }, []);

  const callToUser = userId => {
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
      </View>

      <View style={styles.rowbtn}>
        <TextInput
          style={styles.textInput}
          autoCapitalize="none"
          keyboardType="default"
          placeholder="Enter id"
          onChangeText={text => {
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
    backgroundColor: 'white',
  },
  rowbtn: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    marginVertical: 8,
  },
  btn: {
    margin: 16,
    backgroundColor: 'black',
    paddingHorizontal: 10,
  },
  textInput: {
    width: 200,
    height: 50,
    borderWidth: 0.5,
    borderColor: 'gray',
    paddingHorizontal: 12,
  },
});

export default App;

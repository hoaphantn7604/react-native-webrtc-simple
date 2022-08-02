import * as React from 'react';

import { StyleSheet, View, Text, Alert, Button, TextInput } from 'react-native';
import {WebRTCSimple} from 'react-native-webrtc-simple';
import { globalCall, globalCallRef, GlobalCallUI, globalGroupCall, globalGroupCallRef, GlobalGroupCallUI } from './UIKit';

export default function App() {
  const [sessionId, setSessionId] = React.useState<string>('');
  const [callId, setCallId] = React.useState<string>('');

  const startConnection = () => {
    const configuration: any = {
      optional: null,
      key: Math.random().toString(36).substr(2, 4),
    };

    WebRTCSimple.start(configuration, { frameRate: 120 })
      .then(status => {
        if (status) {
          WebRTCSimple.getSessionId((sessionId: string) => {
            setSessionId(sessionId);
          });
        }
      })
      .catch();
  };

  React.useEffect(()=>{
    startConnection();
  },[]);

  const callToUser = (callId: string) => {
    if (callId.length > 0) {
      if (callId !== sessionId) {
        const useData = {
          sender_name: "fullName",
          sender_avatar:
            'https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png',
          receiver_name: "receverName",
          receiver_avatar:
            'https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png',
        };
        globalCall.call(callId, useData);
      } else {
        Alert.alert("You can't call yourself");
      }
    } else {
      Alert.alert('Please enter call Id');
    }
  };

  const groupCall = (callIds: string) => {
    const ids = callIds.replace(' ', '').split(',');

    const data = {
      name: 'Group name',
      avatar:
        'https://www.atlantawatershed.org/wp-content/uploads/2017/06/default-placeholder.png',
    };
    globalGroupCall.call(ids, data);
  };

  return (
    <View style={styles.container}>
      <Text>Session Id {sessionId}</Text>
      <TextInput placeholder='Enter SessionId' onChangeText={setCallId} autoCapitalize={"none"} />
      <Button title='Call Now' onPress={()=>{callToUser(callId)}}/>
      <View style={styles.line}/>
      <Button title='Group Call' onPress={()=>{groupCall(callId)}}/>
      <GlobalCallUI ref={globalCallRef} />
      <GlobalGroupCallUI ref={globalGroupCallRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  line: {
    height: 20
  }
});

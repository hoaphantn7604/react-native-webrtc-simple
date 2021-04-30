# react-native-webrtc-simple

## Getting started

`$ yarn add react-native-webrtc-simple`

### Dependencies
`$ yarn add react-native-webrtc`

### IOS Setup
  `cd ios && pod install`

  Navigate to `<ProjectFolder>/ios/<ProjectName>/` and edit `Info.plist` adding the following lines:

  ```
  <key>NSCameraUsageDescription</key>
  <string>Camera permission description</string>
  <key>NSMicrophoneUsageDescription</key>
  <string>Microphone permission description</string>
  ```

  When build release:
  `Enable Bitcode = No`

### Android Setup
  Locate your app's `AndroidManifest.xml` file and add these permissions:

  ```xml
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.BLUETOOTH" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
  ```

  Add this line in AndroidManifest.xml in `<application>` tag:
  android:usesCleartextTraffic="true"

  Add this line to `android/gradle.properties`:
  android.enableDexingArtifactTransform.desugaring=false

### Demo
![](./document/demo1.png?raw=true "Demo")

## Usage
```javascript
import WebrtcSimple from 'react-native-webrtc-simple';

useEffect(() => {
    const configuration = {
      // optional: {
      //   host: '192.168.30.216',
      //   port: '3000',
      //   path: '/mypeer'
      // }
      optional: null
      ,
      // key: Math.random().toString(36).substr(2, 4), //optional
    };
    
    WebrtcSimple.start(configuration)
        .then((status) => {
        if (status) {
            const stream = WebrtcSimple.getLocalStream();
            console.log('My stream: ', stream);

            WebrtcSimple.getSessionId((id: string) => {
                console.log('UserId: ', id);
            });
        }
        })
        .catch();

    WebrtcSimple.listenings.callEvents((type, userData) => {   
      console.log('Type: ', type);
      // START_CALL
      // RECEIVED_CALL
      // REJECT_CALL
      // ACCEPT_CALL
      // END_CALL   
    });

    WebrtcSimple.listenings.getRemoteStream((remoteStream) => {
      console.log('Remote stream', remoteStream);
    });

}, []);

const callToUser = (userId) => {
  const data = {
    name: '<name>',
    avatar: '<avatar>',
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

const video = (enable: boolean) => {
  WebrtcSimple.events.videoEnable(enable);
};

const audio = (enable: boolean) => {
  WebrtcSimple.events.audioEnable(enable);
};

```

### Usage with UIKit
```js
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
        key: Math.random().toString(36).substr(2, 4),
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
```

### Issue

  Crash in ios device when is an incoming call:
  follow ticket https://github.com/react-native-webrtc/react-native-webrtc/issues/962

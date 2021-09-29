# react-native-webrtc-simple

## Getting started

`$ yarn add react-native-webrtc-simple react-native-webrtc`

### Demo
![](./document/demo1.png?raw=true "Demo")

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

## Document

## WebrtcSimple

| Method                       | Description                   | 
| ---------------------------- | ----------------------------- |
| start                        |                               |
| refresh                      |                               |
| getLocalStream               |                               |
| getSessionId                 |                               |
| listenings                   |                               |
| events                       |                               |

### WebrtcSimple.start
| Value    | Type           | Description                                                             | 
| -------- | -------------- | ----------------------------------------------------------------------- |
| optional | Object or null |                                                                         |
| key      | String         |                                                                         |


### WebrtcSimple.listenings.callEvents
| Value            | Type    | Description                                                             | 
| ---------------- | ------- | ----------------------------------------------------------------------- |
| START_CALL       | String  |                                                                         |
| RECEIVED_CALL    | String  |                                                                         |
| REJECT_CALL      | String  |                                                                         |
| ACCEPT_CALL      | String  |                                                                         |
| END_CALL         | String  |                                                                         |

### WebrtcSimple.events
| Method        | Params                         | Description                                                             | 
| --------------| ------------------------------ | ----------------------------------------------------------------------- |
| call          | ( sessionId:String, data:any ) |                                                                         |
| acceptCall    | No                             |                                                                         |
| rejectCall    | No                             |                                                                         |
| switchCamera  | No                             |                                                                         |
| videoEnable   | No                             |                                                                         |
| audioEnable   | No                             |                                                                         |



## Usage
```js
import WebrtcSimple from 'react-native-webrtc-simple';

useEffect(() => {
    const configuration = {
      optional: null,
      key: Math.random().toString(36).substr(2, 4), //optional
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

const refreshConnection = () => {
  WebrtcSimple.refresh();
};

const callToUser = (userId) => {
  const data = {};
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
Source code example: https://github.com/hoaphantn7604/react-native-webrtc-simple/tree/master/example

### Issue

  Crash in ios device when is an incoming call:
  follow ticket https://github.com/react-native-webrtc/react-native-webrtc/issues/962

# react-native-webrtc-simple
A simple and easy to use module that help in making video call for React Native.

## Getting started

`$ yarn add react-native-webrtc-simple react-native-webrtc`

#### Source code demo
- [react-native-template-video-call](https://github.com/hoaphantn7604/react-native-template-video-call) React Native Video Call Template.

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

### Document

#### WebrtcSimple

| Method                       | Description                   | 
| ---------------------------- | ----------------------------- |
| start                        | Create connections            |
| getSessionId                 | Get your session id           |
| getLocalStream               | Get your video stream         |
| getRemoteStream              | Get remote video stream       |
| listenings                   | Listenings call events        |
| events                       | Method call events            |

#### WebrtcSimple.start
| Value    | Type           | Description                                                             | 
| -------- | -------------- | ----------------------------------------------------------------------- |
| optional | Object or null | Option peer configuration                                               |
| key      | String         | Your session id                                                         |

## Peer-to-Peer

#### WebrtcSimple.listenings.callEvents
| Value            | Type    | Description                                                             | 
| ---------------- | ------- | ----------------------------------------------------------------------- |
| START_CALL       | String  | Your start call status                                                  |
| RECEIVED_CALL    | String  | Call received status                                                    |
| ACCEPT_CALL      | String  | Call aceept status                                                      |
| END_CALL         | String  | Call end status                                                         |
| MESSAGE          | String  | Listenings a message                                                    |

#### WebrtcSimple.events
| Method        | Params                         | Description                                                             | 
| --------------| ------------------------------ | ----------------------------------------------------------------------- |
| call          | sessionId:String, data:any     | Initiate a call                                                         |
| acceptCall    | No                             | Accept a call                                                           |
| endCall       | No                             | Reject a call                                                           |
| switchCamera  | No                             | Switch mamera                                                           |
| videoEnable   | No                             | On/Off video                                                            |
| audioEnable   | No                             | On/Off audio                                                            |
| message       | data:any                       | Events send message                                                     |


## Multiple Peer

#### WebrtcSimple.listenings.callEvents
| Value                | Type    | Description                                                             | 
| -------------------- | ------- | ----------------------------------------------------------------------- |
| START_GROUP_CALL     | String  | Your start call status                                                  |
| RECEIVED_GROUP_CALL  | String  | Call received status                                                    |
| JOIN_GROUP_CALL      | String  | Call received status                                                    |
| LEAVE_GROUP_CALL     | String  | Call reject status                                                      |


#### WebrtcSimple.events
| Method        | Params                                          | Description                                                             | 
| --------------| ----------------------------------------------- | ----------------------------------------------------------------------- |
| groupCall     | groupSessionId: string[], userData: object = {} | Start group call                                                        |
| joinGroup     | arrSessionId: string[]                          | Join group call                                                         |
| leaveGroup    | No                                              | Leave group call                                                        |
| addStream     | sessionId: string                               | Create a stream                                                         |
| switchCamera  | No                                              | Switch mamera                                                           |
| videoEnable   | No                                              | On/Off video                                                            |
| audioEnable   | No                                              | On/Off audio                                                            |
| message       | data:any                                        | Events send message                                                     |


### Usage
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
      // ACCEPT_CALL
      // END_CALL   
      // MESSAGE
      // START_GROUP_CALL
      // RECEIVED_GROUP_CALL
      // JOIN_GROUP_CALL
      // LEAVE_GROUP_CALL
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

const sendMessage = (message: any) => {
    WebrtcSimple.events.message(message);
};

const groupCall = (sessionId: string[]) => {
    const data = {};
    WebrtcSimple.events.groupCall(sessionId, data);    
};

const joinGroup = (groupSessionId: string[]) => {
  WebrtcSimple.events.joinGroup(groupSessionId);
};

const leaveGroup = () => {
  WebrtcSimple.events.leaveGroup();
};

```
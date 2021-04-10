# react-native-webrtc-simple

## Getting started

`$ yarn add react-native-webrtc-simple`

### Dependencies

```javascript
    yarn add react-native-webrtc-simple // Follow their instructions
    cd ios && cd pod install && cd ../
```

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
            const stream = WebrtcSimple.getMyStream();
            console.log('My stream: ', stream);

            WebrtcSimple.getMyId((id: string) => {
                console.log('UserId: ', id);
            });
        }
        })
        .catch();

    WebrtcSimple.listenning.callEvent((type) => {   
      console.log('Type: ', type);
      // START_CALL
      // RECEIVED_CALL
      // REJECT_CALL
      // ACCEPT_CALL
      // END_CALL   
    });

    WebrtcSimple.listenning.getRemoteStream((remoteStream) => {
      console.log('Remote stream', remoteStream);
    });

}, []);

const callToUser = (userId) => {
    const data = {
      name: '<user name>',
      avatar: '<avatar>',
    };
    WebrtcSimple.event.call(userId, data);
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

```
### Issue
```javascript
  Crash in ios device when is an incoming call:
  follow ticket https://github.com/react-native-webrtc/react-native-webrtc/issues/962

```
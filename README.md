# react-native-webrtc-simple

## Getting started

`$ yarn add react-native-webrtc-simple`

### Dependencies

```javascript
    yarn add rxjs
    yarn add react-native-peerjs
    yarn add react-native-webrtc
```

## Usage
```javascript
import WebrtcSimple from 'react-native-webrtc-simple';

useEffect(() => {
    // peerjs setup
    const setup: any = {
        // host: '192.168.30.216', //optional
        // port: '3000', //optional
        // path: '/mypeer', //optional
        // key: '', //optional
    };
    
    WebRTCSimple.start(setup)
        .then((status) => {
        if (status) {
            const stream = WebRTCSimple.getMyStream();
            console.log('My stream: ', stream);

            WebRTCSimple.getMyId((id: string) => {
                console.log('UserId: ', id);
            });
        }
        })
        .catch();

    WebRTCSimple.listenning.callEvent((type) => {   
      console.log('Type: ', type);
    });
    WebRTCSimple.listenning.getRemoteStream((remoteStream) => {
      console.log('Remote stream', remoteStream);
      setRemoteStream(remoteStream);
    });

}, []);

const callToUser = (userId: string) => {
    WebRTCSimple.event.call(userId);
};

const acceptCall = () => {
    WebRTCSimple.event.acceptCall();
};

const rejectCall = () => {
    WebRTCSimple.event.rejectCall();
};

const endCall = () => {
    WebRTCSimple.event.endCall();
};

const switchCamera = () => {
    WebRTCSimple.event.switchCamera();
};

const muted = (mute: boolean) => {
    WebRTCSimple.event.muted(!mute);
};

```

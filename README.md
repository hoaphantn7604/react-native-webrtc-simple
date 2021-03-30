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
    
    WebrtcSimple.start(setup)
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
    });
    WebrtcSimple.listenning.getRemoteStream((remoteStream) => {
      console.log('Remote stream', remoteStream);
    });

}, []);

const callToUser = (userId: string) => {
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

const muted = (mute: boolean) => {
    WebrtcSimple.event.muted(!mute);
};

```

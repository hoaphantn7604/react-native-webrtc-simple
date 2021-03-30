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

```

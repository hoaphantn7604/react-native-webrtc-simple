import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import WebrtcSimple from 'react-native-webrtc-simple';

export interface Props { }

const App: React.FC<Props> = (props) => {
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


  return <SafeAreaView style={styles.container} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;

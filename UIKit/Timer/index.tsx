import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { dimensionsScale } from 'react-native-utils-scale';

export interface Props {
  containerStyle?: ViewStyle;
  textStyle?: ViewStyle;
  start: boolean;
}

const defaulProps = {
  containerStyle: {},
  textStyle: {},
};

let interval: any = null;
let hours = 0;
let minute = 0;
let second = 0;

const TimerComponent: React.FC<Props> = (props) => {
  const [key, setKey] = useState(Math.random());

  const timer = () => {
    interval = setInterval(() => {
      if (second < 60) {
        second = second + 1;
      } else {
        second = 0;
        minute = minute + 1;
      }
      if (minute === 60) {
        minute = 0;
        hours = hours + 1;
      }
      setKey(Math.random());
    }, 1000);
  };

  useEffect(() => {
    if (props.start) {
      timer();
    } else {
      clearInterval(interval);
    }
  }, [props.start]);

  return (
    <View style={styles.container} key={key}>
      <Text style={styles.text}>{`${hours}:${minute.toString().length === 1 ? '0' : ''}${minute}:${
        second.toString().length === 1 ? '0' : ''
      }${second}`}</Text>
    </View>
  );
};

TimerComponent.defaultProps = defaulProps;

export default TimerComponent;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'black',
    minWidth: 100 * dimensionsScale.scale(),
    minHeight: 100 * dimensionsScale.scale(),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50 * dimensionsScale.scale(),
    borderWidth: 5 * dimensionsScale.scale(),
    borderColor: 'white',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20 * dimensionsScale.fontScale(),
    color: 'white',
  },
});

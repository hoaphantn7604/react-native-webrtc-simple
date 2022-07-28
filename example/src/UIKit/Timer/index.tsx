import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

export interface Props {
  style?: ViewStyle;
  textStyle?: TextStyle;
  start: boolean;
}

const defaulProps = {
  style: {},
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
      if(interval){
        clearInterval(interval);
      }
      hours = 0;
      minute = 0;
      second = 0;
      timer();
    } else {
      clearInterval(interval);
    }
    return ()=>{
      hours = 0;
      minute = 0;
      second = 0;
      clearInterval(interval);
    }
  }, [props.start]);

  return (
    <View style={[styles.container, props.style]} key={key}>
      <Text style={[styles.text, props.textStyle]}>{`${hours}:${minute.toString().length === 1 ? '0' : ''}${minute}:${second.toString().length === 1 ? '0' : ''
        }${second}`}</Text>
    </View>
  );
};

TimerComponent.defaultProps = defaulProps;

export default TimerComponent;

const styles = StyleSheet.create({
  container: {
    minWidth: 100,
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
  },
});

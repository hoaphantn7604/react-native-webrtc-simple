import { StyleSheet } from 'react-native';
import { scale, width } from 'react-native-utils-scale';

export const styles = StyleSheet.create({
  container: { flex: 1 },
  modalCall: {
    flex: 1,
    backgroundColor: 'gray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxMyStream: {
    borderRadius: 10,
    padding: 3,
    position: 'absolute',
    zIndex: 999,
    bottom: 140,
    backgroundColor: 'white',
    right: 10,
  },
  myStream: {
    width: 150,
    height: 180,
    borderRadius: 10,
  },
  iconCamera: {
    width: 30,
    height: 30,
    position: 'absolute',
    zIndex: 999,
    tintColor: 'white',
    right: 10,
    bottom: 10,
  },
  remoteStream: {
    width: width / 2,
    height: width / 2 + 50,
  },
  manageCall: {
    flexDirection: 'row',
    marginVertical: 20,
    position: 'absolute',
    bottom: 10,
  },
  icon: {
    width: 35,
    height: 35,
  },
  btnCall: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3
  },
  name: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginTop: 20,
  },
  timer: {
    backgroundColor: 'transparent',
    minWidth: 70,
    minHeight: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50
  },
  textTimer: {
    fontSize: 20
  },
  timer2: {
    backgroundColor: 'transparent',
    minWidth: 70,
    minHeight: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'white',
    position: 'absolute',
    zIndex: 9,
    right: 10,
    top: 10
  },
  textTimer2: {
    fontSize: 12
  },
  wrapListStream: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start'
  }
});

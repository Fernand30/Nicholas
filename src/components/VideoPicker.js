import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  PixelRatio,
  TouchableOpacity,
  Image,
} from 'react-native';

import ImagePicker from 'react-native-image-picker';

export default class App extends React.Component {

  state = {
    videoSource: null
  };

  selectVideoTapped() {
    const options = {
      title: 'Select a Video',
      takePhotoButtonTitle: 'Take Video...',
      mediaType: 'video',
      videoQuality: 'low'
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled video picker');
      }
      else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        this.setState({
          videoSource: response.uri
        });
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={this.selectVideoTapped.bind(this)}>
          <View style={[styles.avatar, styles.avatarContainer]}>
            <Text>Select a Video</Text>
          </View>
        </TouchableOpacity>

        { this.state.videoSource &&
          <Text style={{margin: 8, textAlign: 'center'}}>{this.state.videoSource}</Text>
        }
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF'
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    borderRadius: 75,
    width: 150,
    height: 150
  }
});

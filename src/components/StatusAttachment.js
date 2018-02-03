import React, {PureComponent} from 'react'
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'

type Props = {
  imageStyle: any,
  imageSource: any,
  onPressRemove: () => void,
  hideRemove: boolean,
}

export default class StatusAttachment extends PureComponent {
  props: Props

  render() {
    return (
        <View style={styles.container}>
          {!this.props.hideRemove && <TouchableOpacity style={styles.button} onPress={this.props.onPressRemove} >
            <Image source={require('../../assets/icons/profileStatusRemove.png')}/>
          </TouchableOpacity>}
          <Image style={styles.image} source={this.props.imageSource}/>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingRight: 10,
  },
  image: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  button: {
    position: 'absolute',
    top: 4,
    right: 12,
    zIndex: 2,
  },
})
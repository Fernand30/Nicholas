import React, { PureComponent } from 'react'
import {
  TouchableOpacity,
  Image,
  StyleSheet
} from 'react-native'

type Props = {
  source: any,
  onPress: () => void,
  style?: any,
  visible?: boolean,
}

export default class NavImageButton extends PureComponent {
  props: Props
  static defaultProps = {
    visible: true
  }

  render() {
    const { source, onPress, style, visible } = this.props

    if (!visible) {
      return null
    }

    return (
        <TouchableOpacity onPress={onPress} style={styles.container}>
          <Image style={[styles.image, style]} source={source} />
        </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end'
  },
  image: {
    height: 25,
    width: 25,
    resizeMode: 'contain'
  }
})
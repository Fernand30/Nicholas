import React, {PureComponent} from 'react'
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'

type Props = {
  onPress: () => void,
  style?: any,
  renderRight?: () => void,
  disabled?: boolean,
}

export default class Button extends PureComponent {
  props: Props

  renderRight() {
    if (this.props.renderRight !== undefined) {
      return typeof this.props.renderRight === 'function' ?
          this.props.renderRight() :
          this.props.renderRight
    }

    return <Image source={require('../../assets/Images_Icons/config_arrow.png')}/>
  }

  render() {
    const {style, onPress, disabled} = this.props
    const _style = [styles.button, style]

    const Container = disabled ? View : TouchableOpacity

    return (
        <Container style={_style} onPress={onPress}>
          <View style={styles.buttonContent}>
            {this.props.children}
          </View>
          {this.renderRight()}
        </Container>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 10.5,
    paddingRight: 17,
    paddingVertical: 14.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
import React, {PureComponent} from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'
import FloatLabelTextField from './FloatLabelTextField/index'
import * as Color from '../constants/Color'

type Props = {
  onChangeText: (text: string) => void,
  containerStyle?: any,
  inputStyle?: any,
  inputFocusedStyle?: any,
}

export default class FloatingLabelInput extends PureComponent {
  props: Props

  render() {
    const containerStyle = [styles.inputContainer, this.props.containerStyle]

    return (
        <View style={containerStyle} key={this.props.id}>
          <FloatLabelTextField  {...this.props} />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  inputContainer: {
    alignSelf: 'stretch',
    borderBottomWidth: 0.5,
    borderBottomColor: Color.CONTRAST_COLOR,
  },
})
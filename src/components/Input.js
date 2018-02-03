import React, {PureComponent} from 'react'
import {
  View, TextInput, StyleSheet,
} from 'react-native'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'

type Props = {
  hasError?: boolean,
  containerStyle?: any,
}

export default class Input extends PureComponent {
  props: Props

  render() {
    const {hasError, containerStyle} = this.props
    const wrapperStyle = [styles.inputWrapper, containerStyle]

    if (hasError) {
      wrapperStyle.push(styles.inputError)
    }

    const inputStyle = [styles.input]

    if (this.props.editable === false) {
      inputStyle.push(styles.inputDisabled)
    }

    return (
        <View style={wrapperStyle}>
          <TextInput
              placeholderTextColor={Color.WHITE}
              numberOfLines={1}
              style={inputStyle}
              {...this.props}
          />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  inputWrapper: {
    // alignSelf: 'stretch',
    borderBottomWidth: 0.5,
    borderBottomColor: Color.CONTRAST_COLOR,
  },
  input: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 20,
    height: 44,
  },
  inputDisabled:{
    color: Color.GREYISH_BROWN,
  },
  inputError: {
    borderBottomWidth: 0.5,
    borderBottomColor: Color.BLUE,
  },
})
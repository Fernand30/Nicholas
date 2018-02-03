import React, {Component} from 'react'
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Platform,
  Image,
  TouchableOpacity,
} from 'react-native'
import FloatingLabel from './FloatingLabel'
// import TextFieldHolder from './TextFieldHolder'
import * as Color from '../../constants/Color'
import * as Font from '../../constants/Font'

const INPUT_HEIGHT = Platform.OS === 'ios' ? 25 : 30
const FONT_SIZE = 19
const LABEL_PADDING = Platform.OS === 'ios' ? 25 : 30

type Props = {
  inputStyle?: any,
  inputFocusedStyle?: any,
}

export default class FloatLabelTextField extends Component {
  props: Props

  state = {
    focused: false,
    text: this.props.value || this.props.defaultValue,
    secureTextEntry: this.props.secureTextEntry || false,
    passwordMaskVisible: (this.props.secureTextEntry && false) || true, //not visible by default if secureTextEntry == true
  }

  inputHeight = this.props.multiline && this.props.numberOfLines > 1 ?
      INPUT_HEIGHT * this.props.numberOfLines :
      INPUT_HEIGHT
  containerHeight = this.props.multiline && this.props.numberOfLines > 1 ?
      (INPUT_HEIGHT + 5) * this.props.numberOfLines :
      (INPUT_HEIGHT + LABEL_PADDING)

  componentWillReceiveProps(newProps) {
    if (newProps.hasOwnProperty('value') &&
        newProps.value !== this.state.text) {
      this.setState({text: newProps.value})
    }
  }

  inputRef() {
    return this.refs.input
  }

  focus() {
    this.inputRef().focus()
  }

  blur() {
    this.inputRef().blur()
  }

  isFocused() {
    return this.inputRef().isFocused()
  }

  clear() {
    this.inputRef().clear()
  }

  setFocus = () => {
    this.setState({
      focused: true,
    })
    try {
      return this.props.onFocus()
    } catch (_error) {
    }
  }

  unsetFocus = () => {
    this.setState({
      focused: false,
    })
    try {
      return this.props.onBlur()
    } catch (_error) {
    }
  }

  labelStyle() {
    if (this.state.focused) {
      return [styles.fieldLabel, styles.fieldLabelFocused]
    }
  }

  inputStyle() {
    const style = [
      styles.valueText,
      {height: this.inputHeight},
      this.props.inputStyle]

    if (this.state.text) {
      style.push(styles.valueFocused)
      style.push(this.props.inputFocusedStyle)
    }

    // if (this.props.editable === false) {
    //   style.push({textAlignVertical: 'center',})
    // } else {
      style.push({textAlignVertical: 'top',})
    // }

    if (this.state.secureTextEntry) {
      style.push(styles.valuePassword)
    }

    return style
  }

  placeholderValue() {
    if (this.state.text) {
      return this.props.placeholderLabel || this.props.placeholder
    }
  }

  onChangeText = (text) => {
    this.setState({text})

    if (this.props.onChangeText) {
      this.props.onChangeText(text)
    }
  }

  togglePasswordMask = () => {
    this.setState({passwordMaskVisible: !this.state.passwordMaskVisible})
  }

  renderPasswordButton() {
    if (!this.state.secureTextEntry) {
      return null
    }

    const icon = this.state.passwordMaskVisible ?
        require('../../../assets/icons/passVisibleWhite.png') :
        require('../../../assets/icons/passInvisibleWhite.png')
    return (
        <TouchableOpacity onPress={this.togglePasswordMask}
                          style={styles.btnPassMask}>
          <Image source={icon}/>
        </TouchableOpacity>
    )
  }

  render() {
    let content

    if (this.props.editable === false) {
      content = (
          <Text style={this.inputStyle()}
                numberOfLines={this.props.numberOfLines ||
                1}>{this.state.text || this.props.placeholder}</Text>
      )
    } else {
      content = (
          <TextInput {...this.props}
                     ref='input'
                     disableFullscreenUI={true}
                     secureTextEntry={this.state.secureTextEntry &&
                     this.state.passwordMaskVisible}
                     placeholderTextColor="white"
                     underlineColorAndroid="transparent"
                     style={this.inputStyle()}
                     value={this.state.text}
                     onFocus={this.setFocus}
                     onBlur={this.unsetFocus}
                     onChangeText={this.onChangeText}
          />
      )
    }

    return (
        <View style={[styles.container, {height: this.containerHeight}]}>
          <View style={styles.viewContainer}>
            {/*<View style={styles.paddingView}/>*/}
            <View style={[styles.fieldContainer]}>
              <FloatingLabel visible={this.state.text}>
                <Text style={[
                  styles.fieldLabel,
                  this.labelStyle()]}>{this.placeholderValue()}</Text>
              </FloatingLabel>
              {content}
              {this.renderPasswordButton()}
            </View>
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {},
  viewContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  // paddingView: {
  //   width: 5
  // },
  btnPassMask: {
    position: 'absolute',
    bottom: 0,
    padding: 10,
    right: 0,
  },
  fieldLabel: {
    // height: 15,
    padding: 2,
    marginLeft: 10,
    fontSize: 15,
    ...Font.FONT_BOLD,
    color: '#FFF',
  },
  fieldLabelFocused: {
    color: Color.TXT_TOPBOX,
  },
  fieldContainer: {
    flex: 1,
    // backgroundColor: 'blue',
    justifyContent: 'center',
  },
  valueText: {
    backgroundColor: 'transparent',
    ...Font.FONT_LIGHT,
    fontSize: FONT_SIZE,
    color: '#FFF',
    padding: 0,
  },
  valuePassword: {
    paddingRight: 40,
    overflow: 'hidden',
  },
  valueFocused: {
    marginTop: LABEL_PADDING,
    fontSize: 18,
    ...Font.FONT_LIGHT,
  },
})
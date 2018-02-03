import React, {PureComponent} from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native'
import * as Style from '../constants/Style'
import * as Color from '../constants/Color'

type Props = {
  backgroundColor: string,
  onPress?: () => void,
  label: string,
  loading: boolean,
}

export default class PrimaryButton extends PureComponent {
  props: Props
  static defaultProps = {
    backgroundColor: Color.BTN_COLOR,
  }

  render() {
    const containerStyle = [
      styles.button,
      Style.PRIMARY_BUTTON_STYLE,
      {backgroundColor: this.props.backgroundColor},
      this.props.disabled && !this.props.loading ? styles.disabledBg : null,
    ]
    const labelStyle = [
      Style.PRIMARY_BUTTON_LABEL, styles.label, this.props.disabled ? styles.disabledLabel : null]

    return (
        <TouchableOpacity
            activeOpacity={this.props.disabled ? 1 : 0.2}
            onPress={this.props.disabled || this.props.loading ? null : this.props.onPress}
            style={[containerStyle]}>
          {!this.props.loading && <Text style={labelStyle}>{this.props.label}</Text>}
          {this.props.loading && <ActivityIndicator color="white"/>}
        </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  button: {
    height: 46,
  },
  label: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  disabledBg: {
    backgroundColor: '#EDEEF0',
  },
  disabledLabel: {
    color: '#AEB3BB',
  },
})
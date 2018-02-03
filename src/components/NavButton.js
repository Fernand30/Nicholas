import React, {PureComponent} from 'react'
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import * as Font from '../constants/Font'
import * as Color from '../constants/Color'

type Props = {
  label: string,
  visible?: boolean,
  disabled?: boolean,
  loading?: boolean,
  onPress: () => void,
  style?: any,
}

export default class NavButton extends PureComponent {
  props: Props

  render() {
    const {label, onPress, style, visible = true, disabled, loading} = this.props
    const _style = [{color: 'white', ...Font.FONT_LIGHT, fontSize: 17,}, style]

    if (loading) {
      return (
          <ActivityIndicator color={Color.CONTRAST_COLOR}/>
      )
    }

    if (!visible) {
      return null
    }

    let _onPress = onPress

    if (disabled) {
      _onPress = null
      _style.push({color: Color.WARM_GREY})
    }

    return (
        <TouchableOpacity onPress={_onPress} activeOpacity={disabled ? 1 : 0.2}>
          <Text style={_style}>{label}</Text>
        </TouchableOpacity>
    )
  }
}
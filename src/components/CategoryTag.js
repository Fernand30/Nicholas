import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'

type Props = {
  label: string,
  active: boolean,
  style?: any,
  onPress?: () => void,
}

export default class CategoryTag extends PureComponent {
  props: Props

  render() {
    const {label, style, active, onPress} = this.props
    const _style = [styles.container, style]
    const labelStyle = [styles.label]

    if (active){
      _style.push(styles.active)
      labelStyle.push(styles.labelActive)
    }

    return (
        <TouchableOpacity onPress={onPress}>
          <View style={_style}>
            <Text style={labelStyle}>{label}</Text>
          </View>
        </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: 30,
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: Color.TAGS_COLOR,
  },
  label:{
      ...Font.FONT_MEDIUM,
    fontSize: 17.5,
    paddingHorizontal: 24.5,
    backgroundColor: 'transparent',
  },
  active:{
    backgroundColor: Color.NAV_BGCOLOR,
  },
  labelActive: {
    color: Color.CONTRAST_COLOR,
  },
})
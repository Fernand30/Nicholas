import React, {PureComponent} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import * as Font from "../constants/Font"
import * as Color from '../constants/Color'

type Props = {
  checked: boolean,
  disabled: boolean,
  label: string,
  size: number,
  style: any,
  onPress: () => void
}

export default class CheckBox extends PureComponent {
  props: Props
  static defaultProps = {
    size: 35
  }

  render() {
    const {size, onPress, label, style, checked, disabled} = this.props
    const borderSize = size / 2
    const boxStyle = [styles.box, {width: size, height: size}]
    let checkStyle = [{width: size - borderSize, height: size - borderSize}]

    if (checked) {
      checkStyle.push(styles.boxChecked)
    }

    const Container = disabled ? View : TouchableOpacity

    return (
      <Container style={[styles.container, style]} onPress={onPress}>
        <View style={boxStyle}>
          <View style={checkStyle}/>
        </View>
        <Text style={styles.label}>{label}</Text>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: Color.CONTRAST_COLOR,
    // margin: 2,
  },
  label: {
    color: Color.CONTRAST_COLOR,
    marginLeft: 20,
    ...Font.FONT_LIGHT,
    fontSize: 17.5,
  },
})
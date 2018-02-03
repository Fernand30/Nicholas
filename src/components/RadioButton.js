import React, {Component} from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import * as Font from "../constants/Font"
import * as Color from '../constants/Color'

export default RadioButton = ({checked, label, subLabel, size = 35, style, onPress}) => {
  const radius = size / 2
  const border = size * .4
  const boxStyle = [styles.box, {width: size, height: size, borderRadius: radius}]
  let checkStyle = [{width: size - border, height: size - border, borderRadius: radius}]

  if (checked) {
    checkStyle.push(styles.boxChecked)
  }

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={boxStyle}>
        <View style={checkStyle}/>
      </View>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.subLabel}>{subLabel}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    borderWidth: 0.5,
    borderColor: Color.CONTRAST_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: Color.CONTRAST_COLOR,
  },
  labelContainer: {
    marginLeft: 20,
  },
  label: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 17.5,
  },
  subLabel: {
    color: Color.WARM_GREY,
    ...Font.FONT_BOLD,
    fontSize: 15.5,
  },
})
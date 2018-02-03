import React, {Component} from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native'
import * as Font from '../constants/Font'
import * as Color from '../constants/Color'

export default PriceRadioButton = ({disabled, sold, soldLabel, selected, name, price, size = 35, style, onPress}) => {
  const radius = size / 2
  const border = size * .4
  const boxStyle = [styles.box, {width: size, height: size, borderRadius: radius}]
  let checkStyle = [{width: size - border, height: size - border, borderRadius: radius}]

  if (selected || sold) {
    checkStyle.push(styles.boxChecked)
  }

  let nameContainerStyle = []
  let labelStyle = [styles.label]
  const Container = sold || disabled ? View : TouchableOpacity

  if (sold) {
    labelStyle.push(styles.labelDisabled)
    nameContainerStyle.push(styles.nameContainer)
    checkStyle.push(styles.boxCheckedSold)
  }

  return (
      <Container style={[styles.container, style]} onPress={sold ? null : onPress}>
        {!disabled && <View style={boxStyle}>
          <View style={checkStyle}/>
        </View>}
        <View style={styles.labelContainer}>
          <View style={nameContainerStyle}>
            <Text style={labelStyle}>{name}</Text>
            {sold && <Text style={styles.sold}>{soldLabel}</Text>}
          </View>
          <Text style={styles.subLabel}>{price}</Text>
        </View>
      </Container>
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
    marginRight: 20,
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: Color.CONTRAST_COLOR,
  },
  boxCheckedSold: {
    backgroundColor: Color.WARM_GREY,
  },
  labelContainer: {
  },
  label: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 17.5,
  },
  labelDisabled: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
  },
  nameContainer:{
    flexDirection: 'row',
    alignItems: 'center',
  },
  sold: {
    color: Color.BLUE,
    ...Font.FONT_LIGHT,
    textDecorationLine: 'none',
    marginLeft: 10,
  },
  subLabel: {
    color: Color.WARM_GREY,
    ...Font.FONT_BOLD,
    fontSize: 15.5,
  },
})
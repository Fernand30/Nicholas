import React, {PureComponent} from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import * as Color from '../constants/Color'
import _ from 'lodash'
import * as Font from '../constants/Font'

type Props = {
  min?: number,
  max?: number,
  step?: number,
  disabled?: boolean,
  containerStyle?: any,
  buttonStyle?: any,
  labelStyle?: any,
  onValueChange?: (value) => void,
}

export default class Stepper extends PureComponent {
  props: Props

  static defaultProps = {
    min: 1,
    max: 999999,
    step: 1,
    disabled: false,
  }

  onValueChange = (currentValue) => {
    if (typeof this.props.onValueChange === 'function') {
      this.props.onValueChange(currentValue)
    }
  }

  onPressAdd = () => {
    let currentValue = this.props.value + 1

    if (currentValue >= this.props.max) {
      currentValue = this.props.max
    }

    this.onValueChange(currentValue)
  }

  onPressSub = () => {
    let currentValue = this.props.value - 1

    if (currentValue <= this.props.min) {
      currentValue = this.props.min
    }

    this.onValueChange(currentValue)
  }

  render() {
    const {value, disabled, containerStyle, min, max, buttonStyle, labelStyle} = this.props
    const Button = disabled ? View : TouchableOpacity
    // const digitPadding = `${max}`.length

    return (
        <View style={[styles.container, containerStyle]}>
          <View style={[styles.btnWrapper, styles.borderR]}>
            <Button style={styles.btn}
                    onPress={this.onPressSub}>
              <Text style={[
                styles.label,
                styles.btnLabel,
                value === min ? styles.labelDisabled : null,
                buttonStyle]}>-</Text>
            </Button>
          </View>
          {/*<View style={styles.labelWrapper}>*/}
            <TextInput
                numberOfLines={1}
                style={[styles.labelWrapper, styles.label]}
                defaultValue={`${value}`}
                maxLength={6}
                onChangeText={this.onValueChange}
                keyboardType="numeric"
            />
          {/*</View>*/}
          <View style={[styles.btnWrapper, styles.borderL]}>
            <Button style={styles.btn}
                    onPress={this.onPressAdd}>
              <Text style={[
                styles.label,
                styles.btnLabel,
                value === max ? styles.labelDisabled : null,
                buttonStyle]}>+</Text>
            </Button>
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.BACKGROUND_COLOR,
    borderWidth: 0.5,
    borderColor: Color.CONTRAST_COLOR,
    borderRadius: 2.5,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 44,
    minWidth: 140,
  },
  borderL: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.3)',
  },
  borderR: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.3)',
  },
  btnWrapper: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrapper: {
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  btn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnLabel: {
    fontSize: 40,
  },
  label: {
    color: Color.CONTRAST_COLOR,
    fontSize: 22.5,
    ...Font.FONT_BOLD,
    textAlign: 'center',
  },
  labelDisabled: {
    color: Color.WARM_GREY,
  },
})
import React, {PureComponent} from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native'
import * as Font from '../constants/Font'
import * as Color from '../constants/Color'

type Props = {
  label: string,
  renderLeft?: any,
  renderRight?: any,
  renderLabel?: any,
  onPress?: () => void,
  style?: any,
  labelStyle?: any,
  loading?: boolean,
  disabled?: boolean,
}

export default class Button extends PureComponent {
  props: Props

  renderLeft() {
    const {renderLeft} = this.props
    if (!renderLeft) {
      return null
    }

    return (
        <View style={styles.left}>
          {typeof renderLeft === 'function' ? renderLeft() : renderLeft}
        </View>
    )
  }

  renderRight() {
    const {renderRight} = this.props
    if (!renderRight) {
      return null
    }

    return (
        <View style={styles.right}>
          {typeof renderRight === 'function' ? renderRight() : renderRight}
        </View>
    )
  }

  renderLabel() {
    const {renderLabel, labelStyle, disabled, loading} = this.props

    if (!renderLabel) {
      const _labelStyle = [styles.buttonLabel, labelStyle]

      if (disabled) {
        _labelStyle.push(styles.buttonLabelDisabled)
      }

      if (!loading) {
        return <Text style={_labelStyle}>{this.props.label}</Text>
      }

      return (
          <View style={styles.labelWrapper}>
            {loading &&
              <ActivityIndicator style={styles.loader} color={Color.CONTRAST_COLOR}/>
            }
            <Text style={_labelStyle}>{this.props.label}</Text>
          </View>
      )
    }

    return (
        <View style={styles.center}>
          {typeof renderLabel === 'function' ? renderLabel() : renderLabel}
        </View>
    )
  }

  render() {
    const {onPress, style, disabled} = this.props
    const buttonStyle = [styles.button, style]
    const Container = disabled ? View : TouchableOpacity

    if (disabled) {
      buttonStyle.push(styles.buttonDisabled)
    }

    return (
        <Container activeOpacity={0.6} style={buttonStyle} onPress={onPress}>
          {this.renderLeft()}
          {this.renderLabel()}
          {this.renderRight()}
        </Container>
    )
  }
}

const styles = StyleSheet.create({
  loader: {
    position: 'absolute',
    top: 5,
    left: 4,
    zIndex: 2,
  },
  button: {
    backgroundColor: Color.BTN_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Color.CONTRAST_COLOR,
    borderRadius: 1.5,
    height: 42.5,
  },
  buttonDisabled: {
    borderColor: Color.WARM_GREY,
  },
  labelWrapper: {
    flexDirection: 'row',
  },
  buttonLabel: {
    flex: 1,
    color: Color.CONTRAST_COLOR,
    textAlign: 'center',
    fontSize: 17,
    ...Font.FONT_LIGHT,
    paddingVertical: 4.5,
  },
  buttonLabelDisabled: {
    color: Color.WARM_GREY,
  },
  center: {},
  left: {
    borderRightWidth: 0.5,
    borderRightColor: Color.CONTRAST_COLOR,
    padding: 4,
    justifyContent: 'center',
    height: 42.5,
  },
  right: {
    borderLeftWidth: 0.5,
    borderLeftColor: Color.CONTRAST_COLOR,
    padding: 1,
    height: 42.5,
  },
})
import React, {PureComponent} from 'react'
import {
  StyleSheet,
  View,
} from 'react-native'
import * as Color from '../constants/Color'
import CachedImage from './CachedImage'

type Props = {
  uid?: string,
  size?: number,
  size?: number,
  style?: Object,
  containerStyle?: Object,
  source?: Object,
}

export default class Avatar extends PureComponent {
  static defaultProps: Props = {
    size: 30,
    style: {},
    containerStyle: {},
  }

  render() {
    const {size, style, containerStyle, source} = this.props
    const radius = size / 2
    const _style = {
      borderWidth: 1,
      borderColor: 'transparent',
    }
    const _sizeStyle = {height: size, width: size}
    const _containerStyle = [
      {
        backgroundColor: Color.NAV_BGCOLOR,
        overflow: 'hidden',
        borderRadius: radius,
        ..._sizeStyle,
      },
      containerStyle,
    ]

    let content

    if (source) {
      content = (
          <CachedImage
              mutable
              resizeMode='cover'
              removeClippedSubviews
              style={StyleSheet.flatten([_style, style, _sizeStyle])}
              borderRadius={radius}
              source={source}>
            {this.props.children}
          </CachedImage>
      )
    } else {
      content = (
          <View style={StyleSheet.flatten([_sizeStyle])}>
            {this.props.children}
          </View>
      )
    }

    return (
        <View
            style={_containerStyle}>
          {content}
        </View>
    )
  }
}
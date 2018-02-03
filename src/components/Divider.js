import React, {PureComponent} from 'react'
import {
  View,
} from 'react-native'

type Props = {
  style?: any,
}

export default class Divider extends PureComponent {
  props: Props

  render() {
    const style = [{height: 0.5, backgroundColor: 'rgba(255,255,255,0.5)',}, this.props.style]
    return (
        <View style={style}/>
    )
  }
}
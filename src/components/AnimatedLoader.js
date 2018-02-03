import React, {PureComponent} from 'react'
import {
  View,
  ActivityIndicator,
  Platform,
} from 'react-native'
import Animation from 'lottie-react-native'
import * as Color from '../constants/Color'

type Props = {
  style?: any,
  source: any,
  speed?: number,
}

export default class AnimatedLoader extends PureComponent {
  props: Props

  static defaultProps = {
    style: {
      width: 100,
      height: 100,
    },
    speed: 1,
  }

  componentDidMount() {
    if (Platform.OS === 'ios') {
      this.start()
    }
  }

  start = () => {
    if (!this.animation) {
      setTimeout(this.start, 300)
    } else {
      this.animation.play()
    }
  }

  render() {
    if (Platform.OS === 'android') {
      return <ActivityIndicator color={Color.CONTRAST_COLOR} size="large"/>
    }

    return (
        <View>
          <Animation
              ref={animation => {
                this.animation = animation
              }}
              speed={this.props.speed}
              style={this.props.style}
              source={this.props.source}
              loop={true}
          />
        </View>
    )
  }
}
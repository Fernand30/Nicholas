import React, {PureComponent} from 'react'
import {
  Platform,
  Text,
  Animated,
  StyleSheet,
  StatusBar,
} from 'react-native'
import * as Font from '../constants/Font'
import {connect} from 'react-redux'

type Props = {
  type?: 'success' | 'warning' | 'error',
  message: string,
}

@connect((state) => SessionAwareStatusBar.getStateProps(state))
export default class SessionAwareStatusBar extends PureComponent {
  props: Props

  static getStateProps(state) {
    return {
      session: state.session,
      hasUser: state.currentUser.uid !== null,
    }
  }

  state = {
    type: 'warning',
    message: 'Connecting...',
    loggedIn: false,
    posAnim: new Animated.Value(0),
    opaAnim: new Animated.Value(1),
  }

  componentDidMount() {
    this.slideIn()
    if (this.props.session.loggedIn) {
      this.setState({loggedIn: true})
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.session.loggedIn && nextProps.session.loggedIn) {
      setTimeout(() => {
        this.slideOut(() => this.setState({loggedIn: true}))
      }, 2000)
    }

    if (!this.props.session.error && nextProps.session.error) {
      this.setState({
        type: 'error',
        message: 'Could not connect to server.',
      }, () => {
        setTimeout(this.slideOut, 1500)
      })
    }
  }

  slideIn = () => {
    Animated.timing(
        this.state.posAnim,
        {
          toValue: 20,
          duration: 200,
          useNativeDriver: true,
        },
    ).start()
  }

  slideOut = (callback) => {
    Animated.parallel([
      Animated.timing(
          this.state.posAnim,
          {
            toValue: -20,
            useNativeDriver: true,
            duration: 200,
          },
      ),
      Animated.timing(
          this.state.opaAnim,
          {
            toValue: 0,
            useNativeDriver: true,
            duration: 200,
          },
      ),
    ]).start(callback)
  }

  render() {
    const {type, message, posAnim, opaAnim} = this.state
    const _style = [
      styles.container,
      styles[type],
      {
        transform: [{translateY: posAnim}],
        opacity: opaAnim,
      },
    ]

    if (Platform.OS === 'android' || (!this.props.hasUser || this.state.loggedIn)) {
      return <StatusBar hidden={false} animated={true} barStyle="light-content"/>
    }

    return (
        <Animated.View style={_style}>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    top: -20,
    left: 0,
    right: 0,
    height: 20,
    zIndex: 1,
  },
  message: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 12,
    ...Font.FONT_BOLD,
    paddingVertical: 4,
  },
  success: {
    backgroundColor: 'green',
  },
  warning: {
    backgroundColor: 'orange',
  },
  error: {
    backgroundColor: 'red',
  },
})
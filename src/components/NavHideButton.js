import React, {PureComponent} from 'react'
import {
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native'
import {NavigationActions} from 'react-navigation'
import {connect} from 'react-redux'

type Props = {
  navigation?: Object,
  onPress?: () => void,
  disabled?: boolean,
  hidden?: boolean,
  style?: any,
}

@connect(() => ({}))
export default class NavBarButton extends PureComponent {
  props: Props

  defaultHandler = () => {
    this.props.dispatch(NavigationActions.back())
  }

  render() {
    const {navigation, onPress, disabled, hidden, style} = this.props

    if (hidden) {
      return null
    }

    const handler = disabled ? null : (onPress || this.defaultHandler.bind(this, navigation))

    return (
        <TouchableOpacity style={[styles.container, style]} onPress={handler}>
          <Image source={require('../../assets/Images_Icons/btn_create_cancel.png')}/>
        </TouchableOpacity>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    // position: 'absolute',
    // left: 0,
    // top: 10,
  },
})
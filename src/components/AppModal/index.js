import React, {Component} from 'react'
import {
  StyleSheet,
  Dimensions,
  Modal,
  DeviceEventEmitter,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native'
import PropTypes from 'prop-types'
import {View, initializeRegistryWithDefinitions} from 'react-native-animatable'
import * as ANIMATION_DEFINITIONS from './animations'

// Override default animations
initializeRegistryWithDefinitions(ANIMATION_DEFINITIONS)

export default class AppModal extends Component {
  static propTypes = {
    animationIn: PropTypes.string,
    animationInTiming: PropTypes.number,
    animationOut: PropTypes.string,
    animationOutTiming: PropTypes.number,
    backdropColor: PropTypes.string,
    backdropOpacity: PropTypes.number,
    backdropTransitionInTiming: PropTypes.number,
    backdropTransitionOutTiming: PropTypes.number,
    children: PropTypes.node.isRequired,
    isVisible: PropTypes.bool.isRequired,
    onModalShow: PropTypes.func,
    onModalHide: PropTypes.func,
    hideOnBack: PropTypes.bool,
    onBackButtonPress: PropTypes.func,
    style: PropTypes.any,
  }

  static defaultProps = {
    animationIn: 'slideInUp',
    animationInTiming: 300,
    animationOut: 'slideOutDown',
    animationOutTiming: 300,
    backdropColor: 'black',
    backdropOpacity: 0.70,
    backdropTransitionInTiming: 300,
    backdropTransitionOutTiming: 300,
    onModalShow: () => null,
    onModalHide: () => null,
    isVisible: false,
    hideOnBack: true,
    onBackButtonPress: () => null,
  }

  // We use an internal state for keeping track of the modal visibility: this allows us to keep
  // the modal visibile during the exit animation, even if the user has already change the
  // isVisible prop to false.
  // We also store in the state the device width and height so that we can update the modal on
  // device rotation.
  state = {
    isVisible: false,
    deviceWidth: Dimensions.get('window').width,
    deviceHeight: Dimensions.get('window').height,
  }

  componentWillReceiveProps(nextProps) {
    if (!this.state.isVisible && nextProps.isVisible) {
      this.setState({isVisible: true})
    }
  }

  componentWillMount() {
    if (this.props.isVisible) {
      this.setState({isVisible: true})
    }
  }

  componentDidMount() {
    if (this.state.isVisible) {
      this._open()
    }
    DeviceEventEmitter.addListener('didUpdateDimensions',
        this._handleDimensionsUpdate)
  }

  componentDidUpdate(prevProps, prevState) {
    // On modal open request, we slide the view up and fade in the backdrop
    if (this.state.isVisible && !prevState.isVisible) {
      this._open()
      // On modal close request, we slide the view down and fade out the backdrop
    } else if (!this.props.isVisible && prevProps.isVisible) {
      this._close()
    }
  }

  _handleDimensionsUpdate = dimensionsUpdate => {
    // Here we update the device dimensions in the state if the layout changed (triggering a render)
    const deviceWidth = Dimensions.get('window').width
    const deviceHeight = Dimensions.get('window').height
    if (deviceWidth !== this.state.deviceWidth ||
        deviceHeight !== this.state.deviceHeight) {
      this.setState({deviceWidth, deviceHeight})
    }
  }

  _open = () => {
    this.backdropRef.transitionTo(
        {opacity: this.props.backdropOpacity},
        this.props.backdropTransitionInTiming,
    )
    this.contentRef[this.props.animationIn](this.props.animationInTiming)
        .then(() => {
          this.props.onModalShow()
        })
  }

  _close = async () => {
    this.backdropRef.transitionTo({opacity: 0},
        this.props.backdropTransitionOutTiming)
    this.contentRef[this.props.animationOut](this.props.animationOutTiming)
        .then(() => {
          this.setState({isVisible: false})
          this.props.onModalHide()
        })
  }

  _closeOnBack = () => {
    if (this.props.hideOnBack) {
      this._close()
    }

    this.props.onBackButtonPress()
  }

  render() {
    const {
      backdropColor,
      children,
      style,
      ...otherProps
    } = this.props
    const {deviceWidth, deviceHeight} = this.state
    return (
        <Modal
            transparent={true}
            animationType={'none'}
            visible={this.state.isVisible}
            onRequestClose={this._closeOnBack}
            {...otherProps}
        >

          <View
              ref={ref => (this.backdropRef = ref)}
              style={[
                styles.backdrop,
                {
                  backgroundColor: backdropColor,
                  width: deviceWidth,
                  height: deviceHeight,
                },
              ]}
          />
          <View
              ref={ref => (this.contentRef = ref)}
              style={[styles.content, style]}
              {...otherProps}
          >
            {children}
          </View>
        </Modal>
    )
  }
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
})
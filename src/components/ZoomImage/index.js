/**
 * Created by TinySymphony on 2017-03-23.
 * Improved by Carlos Yakimov on 2017-06-06
 */

import React, {PropTypes, Component} from 'react'
import {
  View,
  Image,
  Easing,
  StyleSheet,
  NativeModules,
  findNodeHandle,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native'
import ImageModal from './ImageModal'
import CachedImage from '../CachedImage'

const winWidth = Dimensions.get('window').width
const winHeight = Dimensions.get('window').height
const winRatio = winWidth / winHeight

const RCTUIManager = NativeModules.UIManager

type Props = {
  disabled: boolean,
  startCapture: boolean,
  moveCapture: boolean,
  responderNegotiate: () => void,
  easingFunc: () => void,
  rebounceDuration: number,
  closeDuration: number,
  showDuration: number,
  enableScaling: boolean,
  imgSize?: { width: number, height: number }
}

class ZoomImage extends Component {
  props: Props
  static defaultProps = {
    disabled: false,
    startCapture: false,
    moveCapture: false,
    rebounceDuration: 800,
    closeDuration: 140,
    showDuration: 100,
    easingFunc: Easing.linear,
    enableScaling: false,
  }

  state = {
    maxSize: {
      width: 0,
      height: 0,
    },
    isModalVisible: false,
  }
  enableModal = false

  getMaxSizeByRatio = (ratio) => {
    return {
      width: ratio >= winRatio ? winWidth : winWidth / ratio,
      height: ratio >= winRatio ? winWidth / ratio : winHeight,
    }
  }

  componentDidMount() {
    if (!this.props.imgSize && this.props.source.uri) {
      Image.getSize(this.props.source.uri, (w, h) => {
        this.setState((state) => {
          state.maxSize = this.getMaxSizeByRatio(w / h)
          this.enableModal = true
        })
      })
    } else {
      this.setState((state) => {
        state.maxSize = this.getMaxSizeByRatio(
            this.props.imgSize.width / this.props.imgSize.height)
        this.enableModal = true
      })
    }
  }

  openModal = () => {
    if (!this.refs.view || !this.enableModal || this.props.disabled) return
    RCTUIManager.measure(findNodeHandle(this.refs.view),
        (x, y, w, h, px, py) => {
          this.originPosition = {x, y, w, h, px, py}
        })
    this.setState({
      isModalVisible: true,
    })
  }

  closeModal = () => {
    if (this.props.disabled) return
    this.setState({
      isModalVisible: false,
    })
  }

  modalRefBind = (modal) => {
    this._modal = modal
  }

  render() {
    return (
        <TouchableWithoutFeedback onPress={this.openModal}
                                  ref="view">
          <View style={this.props.containerStyle}>
            <CachedImage
                source={this.props.source}
                style={this.props.imgStyle}/>
            <ImageModal
                ref={this.modalRefBind}
                disabled={this.props.disabled}
                visible={this.state.isModalVisible}
                onClose={this.closeModal}
                originPosition={this.originPosition}
                size={this.state.maxSize}
                minAlpha={this.props.minAlpha}
                source={this.props.source}
                rebounceDuration={this.props.rebounceDuration}
                closeDuration={this.props.closeDuration}
                showDuration={this.props.showDuration}
                easingFunc={this.props.easingFunc}
                enableScaling={this.props.enableScaling}
            />
          </View>
        </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  toucharea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  modalText: {
    color: '#fff',
  },
})

export default ZoomImage
import React, {PureComponent} from 'react'
import {
  TouchableWithoutFeedback,
} from 'react-native'
import AppModal from './AppModal/index'

type Props = {
  onPressOverlay?: () => void,
  isVisible: boolean,
}

export default class OverlayModal extends PureComponent {
  props: Props
  static defaultProps = {
    isVisible: false,
  }


  render() {
    return (
        <TouchableWithoutFeedback onPress={this.props.onPressOverlay}>
          <AppModal isVisible={this.props.isVisible} {...this.props}>
            <TouchableWithoutFeedback>
              {this.props.children}
            </TouchableWithoutFeedback>
          </AppModal>
        </TouchableWithoutFeedback>
    )
  }
}
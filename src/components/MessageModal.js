import React, {PureComponent} from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Font from "../constants/Font"
import * as Style from "../constants/Style"
import * as Color from '../constants/Color'

type Props = {
  onRequestClose?: () => boolean,
  title?: string,
  dismissLabel: string,
  visible?: boolean,
  animationType: 'slide' | 'fade' | 'none'
}

export default class MessageModal extends PureComponent {
  props: Props

  render() {
    const {children, title, dismissLabel, dismissPress, visible, onRequestClose} = this.props

    return (
      <Modal
        onRequestClose={onRequestClose}
        animationType="slide"
        transparent={true}
        visible={visible}
      >
        <View style={styles.modal}>
          <View style={styles.modalInner}>
            {title && <Text style={styles.modalTitle}>{title}</Text>}

            {children}

            <TouchableOpacity style={[Style.PRIMARY_BUTTON_STYLE, styles.modalButton]}
                              onPress={dismissPress}>
              <Text style={Style.PRIMARY_BUTTON_LABEL}>{dismissLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInner: {
    backgroundColor: Color.CONTRAST_COLOR,
    borderRadius: 4,
    overflow: 'hidden',
    // minHeight: 220,
    width: Dimensions.get('window').width * 0.8,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  modalTitle: {
    ...Font.FONT_BOLD,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    borderRadius: 2.5,
    marginTop: 20,
  }
})
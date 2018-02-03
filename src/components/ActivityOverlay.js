import React, {PureComponent} from 'react'
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native'
import OverlayModal from './OverlayModal'

type Props = {
  isVisible: boolean,
}

export default class ActivityOverlay extends PureComponent {
  props: Props

  render() {
    return (
        <OverlayModal isVisible={this.props.isVisible} animationIn="zoomIn" animationOut="fadeOutDown">
          <View style={styles.loadingModalContent}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="white"/>
            </View>
          </View>
        </OverlayModal>
    )
  }
}

const styles = StyleSheet.create({
  loadingModalContent: {
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'gray',
    padding: 20,
    borderRadius: 6,
    width: 100,
  },
})
import React, {PureComponent} from 'react'
import {
  StyleSheet,
  View,
} from 'react-native'

type Props = {
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
}

export default class EventCallout extends PureComponent {
  props: Props

  render() {
    console.log(this.position)
    return (
      <View style={[styles.container]}>
        <View style={[styles.bubble, this.props.style]}>
          <View style={styles.amount}>
            {this.props.children}
          </View>
        </View>
        <View style={styles.arrowBorder}/>
        <View style={styles.arrow}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignSelf: 'flex-start',
    zIndex: 999,
  },
  bubble: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#212121',
    backgroundColor: 'transparent',
    paddingHorizontal: 5,
    paddingVertical: 12,
    borderRadius: 5,
  },
  amount: {
    flex: 1,
  },
  arrow: {
    backgroundColor: 'transparent',
    borderWidth: 16,
    borderColor: 'transparent',
    borderTopColor: '#212121',
    alignSelf: 'flex-start',
    marginTop: -32,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderWidth: 16,
    borderColor: 'transparent',
    borderTopColor: '#212121',
    alignSelf: 'flex-start',
    marginTop: -0.5,
  },
})
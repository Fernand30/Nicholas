import React, {PureComponent} from 'react'
import {
  View,
  Text,
  Platform,
  StyleSheet,
} from 'react-native'
import * as Style from './constants/Style'

type Props = {
  title?: string,
  headerLeft?: React.Element<*>,
  headerRight?: React.Element<*>,
}

export default class NavBar extends PureComponent {
  props: Props

  render() {
    return (
        <View style={styles.container}>
          <View style={styles.left}>
            {this.props.headerLeft && this.props.headerLeft}
          </View>
          {this.props.title && <Text numberOfLines={1} style={styles.title}>{this.props.title}</Text>}
          <View style={styles.right}>
            {this.props.headerRight && this.props.headerRight}
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    marginTop: Platform.OS === 'ios' ? 20 : 0,
    paddingHorizontal: 17,
    justifyContent: 'center',
  },
  left: {
    position: 'absolute',
    left: 17,
  },
  right: {
    position: 'absolute',
    right: 17,
  },
  title: {
    ...Style.HEADER_TITLE_STYLE.headerTitleStyle,
    backgroundColor: 'transparent',
    marginHorizontal: 16,
    textAlign: Platform.OS === 'ios' ? 'center' : 'left',
  },
})
import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import * as Color from '../constants/Color'
import Icon from 'react-native-vector-icons/Ionicons'
import * as Font from '../constants/Font'

type Props = {
  label: string,
  qty: number,
  containerStyle?: any,
  onPressRemove: () => void,
  hiddenRemove: boolean,
}

export default class ContributionLabel extends PureComponent {
  props: Props

  render() {
    const {label, qty, containerStyle, onPressRemove, hiddenRemove = false} = this.props
    const _containerStyle = [styles.container, containerStyle]
    return (
        <View style={_containerStyle}>
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
          <View style={styles.buttonWrapper}>
            <Text style={[styles.label, styles.qty]} numberOfLines={1}>({qty})</Text>
            {!hiddenRemove && <TouchableOpacity style={styles.button} onPress={onPressRemove}>
              <Icon name="ios-close" color="white" style={styles.icon}
                    size={25}/>
            </TouchableOpacity>}
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.WHITE,
    borderRadius: 50,
    flexDirection: 'row',
    // justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    height: 44,
  },
  label: {
    fontSize: 17.5,
    ...Font.FONT_LIGHT,
    flex: 0.7
  },
  qty:{
    marginLeft: 10,
  },
  buttonWrapper: {
    flexDirection: 'row',
    flex: 0.3
  },
  button: {
    backgroundColor: Color.BACKGROUND_COLOR,
    height: 25,
    width: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    // marginLeft: 27.5,
  },
  icon: {
    backgroundColor: 'transparent',
    marginTop: 2,
  },
})
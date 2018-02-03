import React, {PureComponent} from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  Image,
} from 'react-native'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'

type Props = {
  placeHolder?: string,
  icon?: any,
  textStyle?: any,
  editable: boolean,
  onChangeText?: (text: string) => void,
}

export default class SearchInput extends PureComponent {
  props: Props

  static defaultProps = {
    icon: require('../../assets/icons/icSearch.png'),
    editable: true,
  }

  render() {
    const {placeholder,placeholderTextColor, onChangeText, textStyle, editable,value} = this.props
    const style = [styles.box, textStyle]
    return (
        <View style={styles.container}>
          <TextInput
              editable={editable}
              onChangeText={onChangeText}
              style={style}
              value={value}
              underlineColorAndroid="transparent"
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}/>
          <Image style={styles.icon}
                 source={this.props.icon}/>
        </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
  },
  box: {
  
    backgroundColor: 'rgba(255,255,255,0.26)',
    borderWidth: 0.5,
    borderRadius: 1.5,
    borderColor: Color.INFO_COLOR,
    height: 30,
    ...Font.FONT_LIGHT,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 0,
  },
  icon: {
    position: 'absolute',
    top: 5,
    left: 10,
  },
})
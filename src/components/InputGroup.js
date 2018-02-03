import React, {Component} from 'react';
import {
  View,
  Image,
  StyleSheet,
  TextInput
} from 'react-native';
import * as Color from '../constants/Color'

type Props = {
  containerStyle?: any,
}

export default class InputGroup extends Component {
  props: Props

  render() {
    const mergedStyles = [this.props.style, styles.input]
    return (
      <View style={[styles.container, this.props.containerStyle]}>
        <TextInput underlineColorAndroid="transparent" {...this.props} style={mergedStyles} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container:{
    flexDirection: 'row',
    borderWidth: 0.5,
    borderColor: Color.TRANSPARENT,
    borderRadius: 6,
    height: 60,
    overflow: 'hidden',
  },
  
  input:{
    paddingLeft: 30,
  }


})
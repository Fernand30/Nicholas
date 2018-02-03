import React, {Component} from 'react'
import {
  StyleSheet,
  ImageBackground,
} from 'react-native'
import * as Color from '../constants/Color'

export default class SplashScreen extends Component {
  render() {
    return (
        <ImageBackground source={require('../../assets/Images_Icons/bg.png')} style={styles.container}>

        </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
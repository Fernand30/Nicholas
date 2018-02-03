import React, {Component} from 'react'
import {
  View,
  Dimensions,
  Image,
  StyleSheet,
} from 'react-native'
import AnimatedSearch from '../components/AnimatedLoader'

export default class AnimationTestScreen extends Component {
  render() {
    return (
        <View style={{backgroundColor: 'black', flex: 1}}>
          <AnimatedSearch />
        </View>
    )
  }
}
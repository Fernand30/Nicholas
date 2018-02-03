import React, {Component} from 'react';
import {
  StyleSheet,
  Animated,
} from 'react-native'

export default class FloatingLabel extends Component {
  constructor(props) {
    super(props);

    let initialPadding = 9;
    let initialOpacity = 0;

    if (this.props.visible) {
      initialPadding = 5;
      initialOpacity = 1;
    }

    this.state = {
      paddingAnim: new Animated.Value(initialPadding),
      opacityAnim: new Animated.Value(initialOpacity)
    }
  }

  componentWillReceiveProps(newProps) {
    Animated.timing(this.state.paddingAnim, {
      toValue: newProps.visible ? 5 : 9,
      duration: 230
    }).start();

    return Animated.timing(this.state.opacityAnim, {
      toValue: newProps.visible ? 1 : 0,
      duration: 230
    }).start();
  }

  render() {
    const animatedStyle = {opacity: this.state.opacityAnim}
    return (
      <Animated.View style={[styles.floatingLabel, animatedStyle]}>
        {this.props.children}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  floatingLabel: {
    position: 'absolute',
    top: 0,
    left: 0
  },
});
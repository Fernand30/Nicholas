import React, { PureComponent } from 'react';
import {
  Animated,
} from 'react-native'

export default class TextFieldHolder extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      marginAnim: new Animated.Value(this.props.withValue ? 10 : 0)
    }
  }

  componentWillReceiveProps(newProps) {
    return Animated.timing(this.state.marginAnim, {
      toValue: newProps.withValue ? 10 : 0,
      duration: 230
    }).start();
  }

  render() {
    return (
      <Animated.View style={{ marginTop: this.state.marginAnim }}>
        {this.props.children}
      </Animated.View>
    );
  }
}
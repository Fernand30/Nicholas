import React, {PureComponent} from 'react'
import {
  View,
  Slider,
  StyleSheet,
} from 'react-native'
import * as Color from '../constants/Color'

export default class SliderRadius extends PureComponent {
  state = {
    radius: this.props.radius
  }

  render() {
    const sliderProps = {
      minimumTrackTintColor: Color.BLUE,
      maximumTrackTintColor: Color.CONTRAST_COLOR,
      thumbTintColor: Color.BLUE,
      step: 1,
    }

    return (
        <View style={styles.controlGroup}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{I18n.t('filterScreen.maxDist')}:</Text>
            <Text style={styles.value}>{this.state.radius} KM</Text>
          </View>
          <Slider
              maximumValue={100}
              minimumValue={1}
              value={this.props.radius}
              {...sliderProps}
              onValueChange={this.props.onDistanceChance}/>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  controlGroup: {
    paddingHorizontal: 50 / 2,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12.5,
  },
  label: {
    color: Color.CAMEL,
    ...Font.FONT_BOLD,
    fontSize: 15,
  },
})
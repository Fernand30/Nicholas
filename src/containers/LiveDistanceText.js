import React, {PureComponent} from 'react'
import {
  Text,
} from 'react-native'
import {connect} from 'react-redux'
import GeoHelper from '../utils/GeoHelper'

type Props = {
  targetLocation: Array<number, number>,
  style?: any,
}

@connect(state => state => ({currentLocation: state.geoLocation}))
export default class LiveDistanceText extends PureComponent {
  props: Props

  render() {
    const {latitude, longitude} = this.props.currentLocation

    if (!latitude) {
      return <Text style={this.props.style}>? KM</Text>
    }

    const distance = GeoHelper.getDistance([latitude, longitude], this.props.targetLocation)
    return <Text style={this.props.style}>{distance} KM</Text>
  }
}
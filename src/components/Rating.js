import React, { PureComponent } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import * as Color from '../constants/Color'
import Icon from 'react-native-vector-icons/Ionicons'

type Props = {
  rating: number,
  size: number,
  editable: boolean,
  onSetRating: (rating: number) => void,
}

export default class Rating extends PureComponent {
  props: Props

  static defaultProps = {
    size: 24,
    rating: 0,
    editable: true,
  }

  onPressStar = (rating) => {
    if (typeof this.props.onSetRating === 'function') {
      this.props.onSetRating(rating)
    }
  }

  renderFilledStar = (rate, index) => {
    const { editable } = this.props
    const Container = editable ? TouchableOpacity : View

    return (
        <Container style={styles.star} onPress={this.onPressStar.bind(this, index + 1)} key={`${index}-filled`}>
          <Icon name="md-star" size={this.props.size} color={Color.CAMEL} />
        </Container>
    )
  }

  renderEmptyStar = (rate, index) => {
    const rating = Math.floor(this.props.rating) + index + 1
    const { editable } = this.props
    const Container = editable ? TouchableOpacity : View

    return (
        <Container style={styles.star} onPress={this.onPressStar.bind(this, rating)} key={index}>
          <Icon name="md-star-outline" size={this.props.size} color={Color.CAMEL} />
        </Container>
    )
  }

  render() {
    const stars = Math.floor(this.props.rating)
    const left = 5 - stars

    return (
        <View style={styles.container}>
          {stars > 0 && Array(stars).fill().map(this.renderFilledStar)}
          {left > 0 && Array(left).fill().map(this.renderEmptyStar)}
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  star: {
    marginRight: 5
  }
})
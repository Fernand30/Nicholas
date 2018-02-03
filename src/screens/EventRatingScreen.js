import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator
} from 'react-native'
import * as Color from '../constants/Color'
import Avatar from '../components/Avatar'
import * as Font from '../constants/Font'
import I18n from '../i18n'
import NavBackButton from '../components/NavBackButton'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { navigate, navigateBack } from '../redux/actions/nav'
import Button from '../components/Button'
import { fetchEvent, rateEvent } from '../redux/actions/event'
import Rating from '../components/Rating'
import moment from 'moment'

@connect((state, ownProps) => EventRatingScreen.getStateProps(state, ownProps),
    dispatch => EventRatingScreen.getActionProps(dispatch))
export default class EventRatingScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: I18n.t('eventRatingScreen.title'),
    headerLeft: <NavBackButton />
  })

  static getStateProps(state, ownProps) {
    return {
      eventId: ownProps.navigation.state.params.id,
      event: state.events.entities[ownProps.navigation.state.params.id],
      currentUser: state.currentUser.profile,
      isRated: state.event.rated.indexOf(ownProps.navigation.state.params.id) !== -1
    }
  }

  static getActionProps(dispatch) {
    return {
      actions: bindActionCreators({
        navigate,
        rateEvent,
        fetchEvent,
        dismiss: navigateBack
      }, dispatch)
    }
  }

  state = {
    rating: null
  }

  componentDidMount() {
    if (!this.props.event) {
      this.props.actions.fetchEvent(this.props.eventId)
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isRated && nextProps.isRated) {
      this.props.actions.dismiss()
    }
  }

  onPressSave = () => {
    this.props.actions.rateEvent(this.props.event._key, this.state.rating)
  }

  onSetRating = rating => {
    this.setState({ rating })
  }

  renderLoading() {
    return (
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
          </View>
        </View>
    )
  }

  render() {
    const { event, currentUser } = this.props
    if (!event) {
      return this.renderLoading()
    }

    const when = moment().diff(moment.unix(event.end_date), 'days')
    const hostName = event.user.display_name

    return (
        <View style={styles.container}>
          <View style={styles.avatarContainer}>
            <Avatar
                style={styles.avatar}
                containerStyle={styles.avatar1}
                size={94}
                source={{ uri: currentUser.profile_img }} />
            <Avatar
                size={94}
                source={{ uri: event.user.profile_img }} />
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.msg1}>{I18n.t('eventRatingScreen.attended', { count: when })}</Text>
            <Text style={styles.eventName} numberOfLines={1}>"{event.name}"</Text>
            <Text style={styles.msg1}>{I18n.t('eventRatingScreen.fromUser', { name: hostName })}</Text>
          </View>

          <Text style={styles.rateMsg}>{I18n.t('eventRatingScreen.how')}</Text>

          <View style={styles.ratingContainer}>
            <Rating rating={this.state.rating} size={40} onSetRating={this.onSetRating} />
          </View>

          <Button
              style={styles.buttonSave}
              onPress={this.onPressSave}
              disabled={this.state.rating <= 0}
              label={I18n.t('eventRatingScreen.save')}
          />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
    alignItems: 'center',
    paddingTop: 52
  },
  avatarContainer: {
    flexDirection: 'row'
  },
  avatar: {
    borderColor: 'black',
    borderWidth: 2.5
  },
  avatar1: {
    marginRight: -10,
    zIndex: 1
  },
  messageContainer: {
    marginTop: 28.5,
    alignItems: 'center'
  },
  msg1: {
    color: Color.CONTRAST_COLOR,
    fontSize: 17.5,
    ...Font.FONT_LIGHT
  },
  rateMsg: {
    color: Color.CONTRAST_COLOR,
    fontSize: 20,
    ...Font.FONT_LIGHT,
    marginTop: 40,
    marginBottom: 30
  },
  eventName: {
    color: Color.CONTRAST_COLOR,
    fontSize: 17.5,
    ...Font.FONT_BOLD
  },

  loadingContainer: {
    marginTop: 20
  },
  buttonSave: {
    marginHorizontal: 20,
    marginTop: 40
  }
})
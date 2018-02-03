import React, { Component } from 'react'
import {
  View,
  Image,
  StyleSheet,
  Text,
  AppState,
  Linking,
  Platform
} from 'react-native'
import { connect } from 'react-redux'
import * as Font from '../constants/Font'
import * as Color from '../constants/Color'
import I18n from '../i18n'
import Permissions from 'react-native-permissions'
import GeoHelper from '../utils/GeoHelper'
import Button from '../components/Button'
import NavImageButton from '../components/NavImageButton'
import TabBarIcon from '../components/TabBarIcon'
import EventListContainer from '../containers/EventListContainer'
import { addFavorite, removeFavorite } from '../redux/actions/favorites'
import { setGeoLocation } from '../redux/actions/geoLocation'
import { eventFar, eventNear } from '../redux/actions/event'
import { navigate } from '../redux/actions/nav'
import { BANNERS_GEO_INDEX } from '../constants/Firebase';
import { bannerFar, bannerNear } from '../redux/actions/banners';

@connect(state => MainScreen.getStateProps(state))

export default class MainScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    headerLeft: (

        <NavImageButton onPress={() => navigation.navigate('NewEvent')}
                        source={require('../../assets/Images_Icons/btn_add.png')} />
    ),
    headerTitle: (
        <Image style={{ width: 40, height: 40, alignSelf: 'center' }}
               source={require('../../assets/Images_Icons/logo_nav.png')} />
    ),
    headerRight: (
        // <View style={styles.navRightContainer}>
        //   {navigation.state.params && navigation.state.params.filtersHidden &&
        //   <NavImageButton
        //       style={{ marginRight: 10 }}
        //       source={require('../../assets/icons/icStarInactive.png')} />}
          <NavImageButton
              onPress={() => navigation.navigate('Chat')}
              source={require('../../assets/Images_Icons/btn_chat.png')}/>
        // </View>
    ),
    scrollEnabled: false,
    tabBarIcon: (props) => (
        <TabBarIcon
            {...props}
            iconSource={require('../../assets/Images_Icons/Tabs/tab_today_gray.png')}
            focusedIconSource={require('../../assets/Images_Icons/Tabs/tab_today_blue.png')} />
    )
  })


  static getStateProps(state) {
    //alert(JSON.stringify(state.user))
    return {
      radius: state.eventsFilter.radius,
      eventsToRate: state.currentUser.profile.events_to_rate
    }
  }

  //Geo
  latitude
  longitude
  requestedEventRating = false
  eventRatingTimer

  state = {
    hasLocationPermission: true,
    filtersHidden: false
  }

  componentDidMount() {
    this.eventGeoHelper = new GeoHelper()
    this.bannerGeoHelper = new GeoHelper(BANNERS_GEO_INDEX)
    AppState.addEventListener('change', this.handleAppStateChange)
    Permissions.check('location').then(this.handlePermission)

    if (this.props.eventsToRate && !this.requestedEventRating) {
      this.requestUserRating(this.props.eventsToRate)
    }
  }

  componentWillUnmount() {
    clearTimeout(this.eventRatingTimer)
    AppState.removeEventListener('change', this.handleAppStateChange)
    this.eventGeoHelper.clearEventsWatcher()
    this.eventGeoHelper.stopPositionWatcher()
    this.bannerGeoHelper.clearEventsWatcher()
    this.bannerGeoHelper.stopPositionWatcher()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.radius !== nextProps.radius) {
      this.eventGeoHelper.updateRadius(nextProps.radius)
      this.bannerGeoHelper.updateRadius(nextProps.radius)
    }
    if (nextProps.eventsToRate && !this.requestedEventRating) {
      this.requestUserRating(nextProps.eventsToRate)
    }
  }

  requestUserRating = (eventsToRate = {}) => {
    this.requestedEventRating = true
    const eventId = Object.keys(eventsToRate)[0]
    this.eventRatingTimer = setTimeout(() => {
      this.props.dispatch(navigate('EventRating', { id: eventId }))
    }, 2000)
  }

  onEventNear = (key, location, distance) => {
    this.props.dispatch(eventNear(key, location, distance))
  }

  onEventFar = (key, location, distance) => {
    this.props.dispatch(eventFar(key, location, distance))
  }

  onBannerNear = (key, location, distance) => {
    this.props.dispatch(bannerNear(key, location, distance))
  }

  onBannerFar = (key, location, distance) => {
    this.props.dispatch(bannerFar(key, location, distance))
  }

  onUserPositionChanged = (latitude, longitude) => {
    if (latitude && longitude) {
      this.latitude = latitude
      this.longitude = longitude
      this.props.dispatch(setGeoLocation(latitude, longitude))
      this.eventGeoHelper.watchKeys({
        latitude,
        longitude,
        radius: this.props.radius,
        onKeyNear: this.onEventNear,
        onKeyFar: this.onEventFar
      })
      this.bannerGeoHelper.watchKeys({
        latitude,
        longitude,
        radius: this.props.radius,
        onKeyNear: this.onBannerNear,
        onKeyFar: this.onBannerFar
      })
    }
  }

  handlePermission = response => {
    //response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
    const authorized = response === 'authorized'
    this.setState({ hasLocationPermission: authorized })

    if (response === 'undetermined') {
      setTimeout(() => Permissions.request('location').then(this.handlePermission), 500)
    }

    if (authorized) {
      this.eventGeoHelper.watchPosition(this.onUserPositionChanged)
      this.bannerGeoHelper.watchPosition(this.onUserPositionChanged)
    }
  }

  handleAppStateChange = () => {
    Permissions.check('location').then(this.handlePermission)
  }

  onPressSettings = () => {
    const url = 'App-Prefs:root=Privacy&path=LOCATION'
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        return Linking.openURL(url)
      }
    }).catch(err => {
    })
  }

  onPressFavorite = (key: string, isFavorite: boolean) => {

    if (isFavorite) {
      this.props.dispatch(removeFavorite(key))
    } else {
      this.props.dispatch(addFavorite(key))
    }
  }

  renderPermissionDenied() {
    return (
        <View style={[styles.container, styles.permissionContainer]}>
          <Image source={require('../../assets/images/iOnboard.png')} />
          <View>
            <Text style={styles.permissionTitle}>
              {I18n.t('mainScreen.permissionTitle')}
            </Text>
            <Text style={styles.permissionMessage}>{I18n.t('mainScreen.permissionMessage')}</Text>
          </View>
          {Platform.OS === 'ios' &&
          <Button style={styles.permissionButton}
                  label={I18n.t('mainScreen.permissionButton')}
                  onPress={this.onPressSettings} />}
        </View>
    )
  }

  render() {
    if (!this.state.hasLocationPermission) {
      return this.renderPermissionDenied()
    }
    
    return (
        <View style={styles.container}>
          <EventListContainer onPressFavorite={this.onPressFavorite} />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.GRAY
  },
  navRightContainer: {
    flexDirection: 'row'
  },
  listContainer: {
    paddingTop: 10
  },
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 40
  },
  permissionTitle: {
    ...Font.FONT_BOLD,
    fontSize: 20,
    textAlign: 'center',
    color: Color.CONTRAST_COLOR
  },
  permissionMessage: {
    ...Font.FONT_LIGHT,
    fontSize: 15,
    color: Color.CONTRAST_COLOR,
    textAlign: 'center'
  },
  permissionButton: {
    paddingVertical: 10,
    paddingHorizontal: 40
  }
})

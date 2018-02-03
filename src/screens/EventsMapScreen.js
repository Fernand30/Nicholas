import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  Image,
  Platform,
  InteractionManager,
} from 'react-native'
import {connect} from 'react-redux'
import MapView from 'react-native-maps'
import {getNearEvents} from '../redux/selectors/index'
import I18n from '../i18n'
import NavBackButton from '../components/NavBackButton'
import Button from '../components/Button'
import * as Font from '../constants/Font'
import * as Color from '../constants/Color'
import IconHelper from '../utils/IconHelper'
import CachedImage from '../components/CachedImage'
import GeoHelper from '../utils/GeoHelper'
const IS_ANDROID = Platform.OS !== 'ios'

@connect((state, ownProps) => EventsMapScreen.getStateProps(state, ownProps))
export default class EventsMapScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('eventsMapScreen.title'),
    headerLeft: <NavBackButton/>,
  })

  static getStateProps(state, ownProps) {
    return {
      geoLocation: state.geoLocation,
      events: getNearEvents(state) || [],
    }
  }

  state = {
    displayMarkers: false,
    loading: true,
  }

  componentDidMount() {
    //render map after Navigation Transition has completed
    InteractionManager.runAfterInteractions(() => {
      this.setState({
        loading: false,
      })
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    const loaded = this.state.loading && !nextState.loading
    const displayMarkers = !this.state.displayMarkers &&
        nextState.displayMarkers

    const locationUpdated = (this.props.longitude !== nextProps.longitude) ||
        (this.props.latitude !== nextProps.latitude)

    return loaded || displayMarkers || locationUpdated
  }

  onPressEvent = (event) => {
    this.props.navigation.navigate('Event', {id: event._key, title: event.name})
  }

  onMapReady = () => {
    if (!this.state.displayMarkers) {
      this.setState({displayMarkers: true})
    }
  }

  renderMarkers() {
    const {geoLocation: {latitude, longitude}, events} = this.props
    const center = [latitude, longitude]

    return events.map(event => {
      let calloutProps = {}

      if (IS_ANDROID) {
        calloutProps = {
          onPress: this.onPressEvent.bind(this, event),
        }
      }

      const [latitude, longitude] = event.location
      return <MapView.Marker
          flat
          key={event._key}
          image={IconHelper.getPinImageSource(event.categories[0])}
          coordinate={{latitude, longitude}}
          title={event.name}>
        <MapView.Callout {...calloutProps}>
          <View style={styles.coverContainer}>
            {!IS_ANDROID &&
            <CachedImage style={styles.cover}
                         source={{uri: event.cover_img}}/>}
            <View style={styles.infoContainer}>
              <Text style={styles.eventName}>{event.name}</Text>
              <View style={styles.detailContainer}>
                <Image source={require('../../assets/icons/listPins.png')}/>
                <Text style={styles.detail}>{GeoHelper.getDistance(event.location, center)} km</Text>
                <Image style={styles.euro}
                       source={require('../../assets/icons/listEur.png')}/>
                <Text style={styles.detail}>{I18n.t('event.from', {count: event.min_price})}</Text>
              </View>
            </View>
          </View>
          {!IS_ANDROID &&
          <Button label={I18n.t('eventsMapScreen.viewEvent')}
                  style={styles.btnView}
                  onPress={this.onPressEvent.bind(this, event)}/>}
        </MapView.Callout>
      </MapView.Marker>
    })
  }

  render() {
    const {geoLocation: {latitude, longitude}, events} = this.props

    if (this.state.loading) {
      return null
    }

    if (latitude === null || longitude === null) {
      return (
          <View style={[styles.container, styles.messageContainer]}>
            <Text>{I18n.t('eventsMapScreen.cannotLocate')}</Text>
          </View>
      )
    }

    return (
        <View style={styles.container}>
          <MapView
              ref="_MapView"
              style={styles.map}
              initialRegion={{
                latitude,
                longitude,
                latitudeDelta: 0.001,
                longitudeDelta: 0.0321,
              }}
              loadingEnabled={true}
              showsUserLocation={true}
              loadingBackgroundColor="#E9E9EF"
              onMapReady={this.onMapReady}
          >
            {this.state.displayMarkers && events.length > 0 &&
            this.renderMarkers()}
          </MapView>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  callout: {
    paddingHorizontal: 10,
  },
  coverContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  cover: {
    height: 48.9,
    width: 86.5,
  },
  infoContainer: {
    marginLeft: 10,
  },
  detailContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  detail: {
    ...Font.FONT_LIGHT,
    fontSize: 13.5,
    marginLeft: 4,
    color: (Platform.OS === 'ios' ?
        Color.BACKGROUND_COLOR :
        Color.BACKGROUND_COLOR),
  },
  euro: {
    marginLeft: 14,
  },
  eventName: {
    ...Font.FONT_BOLD,
    color: Color.CAMEL,
    fontSize: 15,
  },
  btnView: {
    backgroundColor: 'black',
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginHorizontal: 20,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  coordinates: {
    backgroundColor: Color.CONTRAST_COLOR,
  },
})
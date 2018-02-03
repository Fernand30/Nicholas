import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Platform,
  Linking, Text,
} from 'react-native'
import MapView from 'react-native-maps'
import NavBackButton from '../components/NavBackButton'
import I18n from '../i18n'
import IconHelper from '../utils/IconHelper'
import ActionSheet from 'react-native-actionsheet'
import Button from '../components/Button'
import * as Font from '../constants/Font'
import * as Color from '../constants/Color'

const IS_ANDROID = Platform.OS !== 'ios'

export default class MapScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: navigation.state.params ?
        navigation.state.params.title :
        I18n.t('mapScreen.title'),
    headerLeft: <NavBackButton/>,
  })

  OPTIONS = ['Apple Maps', 'Google Maps', I18n.t('mapScreen.cancel')]

  getActionSheet() {
    if (Platform.OS === 'android') {
      return null
    }

    return (
        <ActionSheet
            ref="actionSheet"
            title={I18n.t('mapScreen.getDirectionsWith')}
            options={this.OPTIONS}
            cancelButtonIndex={2}
            onPress={this.onPressAction}
        />
    )
  }

  onPressAction = (index) => {
    if (index === 0) {
      this.openAppleMaps()
    } else if (index === 1) {
      this.openGoogleMaps()
    }
  }

  onPressGetDirections = () => {
    if (Platform.OS === 'ios') {
      this.refs.actionSheet.show()
    } else {
      this.openGoogleMaps()
    }
  }

  onMapReady = () => {
    this.refs.marker.showCallout()
  }

  openAppleMaps = () => {
    const {address} = this.props.navigation.state.params
    Linking.openURL(
        `http://maps.apple.com/?daddr=${encodeURIComponent(address)}`)
  }

  openGoogleMaps = () => {
    const {address} = this.props.navigation.state.params
    Linking.openURL(
        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
            address)}`)
  }

  render() {
    const {latitude, longitude, category, address} = this.props.navigation.state.params
    let calloutProps = {}

    if (IS_ANDROID) {
      calloutProps = {
        onPress: this.onPressGetDirections,
      }
    }

    const textStyle = [styles.address]
    return (
        <View style={styles.container}>
          <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                region={{
                  latitude: latitude,
                  longitude: longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                onMapReady={this.onMapReady}
                loadingEnabled={true}
                showsUserLocation={true}>
              <MapView.Marker
                  ref="marker"
                  image={IconHelper.getPinImageSource(category)}
                  coordinate={{latitude, longitude}}
                  calloutOffset={{x: 0, y: 0}}
                  calloutAnchor={{x: 0, y: 0}}>
                <MapView.Callout {...calloutProps}>
                  <Text style={textStyle}>{address}</Text>
                  
                  <Button label={I18n.t('mapScreen.getDirections')}
                          style={styles.btnView}
                          onPress={this.onPressGetDirections}/>
                </MapView.Callout>
              </MapView.Marker>
            </MapView>
          </View>
          {this.getActionSheet()}
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  callout: {
    width: 250,
  },
  address: {
    color: Color.BACKGROUND_COLOR,
    ...Font.FONT_LIGHT,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 30,
    maxWidth: 200,
  },
  btnView: {
    backgroundColor: 'black',
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginHorizontal: 20,
  },
})
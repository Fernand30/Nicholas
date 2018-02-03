import GeoFire from 'geofire'
import Firebase from './Firebase'
import { EVENTS_GEO_INDEX } from '../constants/Firebase'

export default class GeoHelper {
  constructor(indexName = EVENTS_GEO_INDEX) {
    this.geoFire = new GeoFire(Firebase.getDbRef(indexName))
  }

  watchId
  geoQuery
  isWatchingEvents = false

  watchPosition(callback: (lat: number, lon: number) => void, errorCallback: error => void) {
    if (!this.watchId) {
      this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            callback && callback(latitude, longitude)
          },
          errorCallback,
          { timeout: 20000, maximumAge: 1000 }
      )
    }
  }

  stopPositionWatcher() {
    if (!this.watchId) {
      navigator.geolocation.clearWatch(this.watchId)
    }
  }

  updateRadius(radius) {
    this.geoQuery.updateCriteria({
      radius: radius
    })
  }

  watchKeys({ latitude, longitude, radius, onKeyNear, onKeyFar }) {
    //Instantiate geoQuery
    if (!this.geoQuery) {
      this.geoQuery = this.geoFire.query({
        center: [latitude, longitude],
        radius: radius
      })
    } else {
      this.geoQuery.updateCriteria({
        center: [latitude, longitude],
        radius: radius
      })
    }

    if (!this.isWatchingEvents) {
      this.geoQuery.on('key_entered', onKeyNear)
      this.geoQuery.on('key_exited', onKeyFar)
    }

    this.isWatchingEvents = true
  }

  clearEventsWatcher() {
    if (this.geoQuery) {
      this.geoQuery.cancel()
    }
    this.isWatchingEvents = false
  }

  static setEventLocation(key: string, location: Array<number>) {
    return new GeoFire(Firebase.getDbRef('eventGeoLocationIndex')).set(key, location)
  }

  static getDistance(point1, point2) {
    return parseFloat(GeoFire.distance(point1, point2)).toFixed(1)
  }

}
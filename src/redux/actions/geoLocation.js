import * as Action from './ActionTypes';

export const setGeoLocation = (latitude: number, longitude: number) => (dispatch) => (dispatch({
  type: Action.SET_NEW_GEO_LOCATION,
  payload: {latitude, longitude}
}))

export const geoLocationError = (error) => (dispatch) => (dispatch({
  type: Action.GEO_LOCATION_ERROR,
  payload: {errorMessage: error}
}))
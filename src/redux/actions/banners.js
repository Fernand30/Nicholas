import * as Action from './ActionTypes';
import Firebase from '../../utils/Firebase';

export const bannerNear = (_key: string, location: string, distance: number) => (dispatch) => {
  dispatch({
    type: Action.BANNER_NEAR,
    payload: {
      _key,
      location,
      distance
    }
  })
  dispatch(fetchBanner(_key))
}

export const bannerFar = (_key: string, location: string, distance: number) => (dispatch) => {
  dispatch({
    type: Action.BANNER_FAR,
    payload: { _key },
    location,
    distance
  })
}

export const fetchBanner = (_key: string, forceRefresh: boolean = false) => (dispatch, getState) => {
  //Check if entity is already in state
  if (!forceRefresh && getState().banners.byId[_key]) {
    return null
  }

  dispatch({
    type: Action.BANNER_FETCH_REQUEST,
    payload: _key
  })

  Firebase.getDbRef('banners').child(_key).on('value', (snapshot) => {
    const banner: Event = snapshot.val()
    dispatch({
      type: Action.BANNER_FETCH_SUCCESS,
      payload: { ...banner, _key }
    })
  })
}
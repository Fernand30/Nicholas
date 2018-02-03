import * as Action from '../actions/ActionTypes'
import _ from 'lodash'

const initialState = {
  nearBanners: {}, // {'banner key': distance}  e.g. {'asklj123lkj123': 5.42123123}
  byId: {},
  fetching: [],
}

class Banners {
  static reduce(state = initialState, action) {
    if (Banners[action.type]) {
      return Banners[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.BANNER_NEAR](state, action) {
    return {
      ...state,
      nearBanners: {...state.nearBanners, [action.payload._key]: action.payload.distance},
    }
  }

  static [Action.BANNER_FAR](state, action) {
    return {
      ...state,
      nearBanners: _.omit(state.nearBanners, [action.payload._key]),
    }
  }

  static [Action.BANNER_FETCH_REQUEST](state, action) {
    return {
      ...state,
      fetching: [
        ...state.fetching,
        action.payload,
      ],
    }
  }

  static [Action.BANNER_FETCH_SUCCESS](state, action) {
    return {
      ...state,
      byId: {...state.byId, [action.payload._key]: {...action.payload}},
      fetching: state.fetching.filter(key => key !== action.payload._key),
    }
  }
}

export default Banners.reduce

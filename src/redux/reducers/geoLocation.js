import * as Action from '../actions/ActionTypes';

const initialState = {
  error: false,
  latitude: null,
  longitude: null,
}

class GeoLocation {
  static reduce(state = initialState, action) {
    if (GeoLocation[action.type]) {
      return GeoLocation[action.type](state, action);
    } else {
      return state;
    }
  }

  static [Action.SET_NEW_GEO_LOCATION](state, action) {
    return {
      ...state,
      ...action.payload,
    }
  }

  static [Action.GEO_LOCATION_ERROR](state, action) {
    return {
      ...state,
      error: true,
    }
  }
}

export default GeoLocation.reduce;

import * as Action from '../actions/ActionTypes'

const initialState = {
  currentFilter: 'ALL',
  activeCategory: null,
  placeTypes: [],
  minPrice: 0,
  maxPrice: 1000,
  radius: 1000000000,
  date: null,
}

class EventsFilter {
  static reduce(state = initialState, action) {
    if (EventsFilter[action.type]) {
      return EventsFilter[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.SET_EVENTS_FILTER_PARAMS](state, action) {
    return {
      ...state,
      ...action.payload,
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default EventsFilter.reduce

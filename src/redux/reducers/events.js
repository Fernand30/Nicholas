import * as Action from '../actions/ActionTypes'
import _ from 'lodash'
// import {TEST_EVENTS} from '../../constants/MockData'

const initialState = {
  nearEvents: {}, // {'event key': distance}  e.g. {'asklj123lkj123': 5.42123123}
  entities: {},
  tickets: {},
  fetching: [],
}

class Events {
  static reduce(state = initialState, action) {
    if (Events[action.type]) {
      return Events[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.EVENT_NEAR](state, action) {
    return {
      ...state,
      nearEvents: {...state.nearEvents, [action.payload._key]: action.payload.distance},
    }
  }

  static [Action.EVENT_FAR](state, action) {
    return {
      ...state,
      nearEvents: _.omit(state.nearEvents, [action.payload._key]),
    }
  }

  static [Action.EVENT_TICKETS_FETCH_SUCCESS](state, action) {
    return {
      ...state,
      tickets: {...state.tickets, [action.payload._key]: action.payload.tickets},
    }
  }

  static [Action.EVENT_FETCH_REQUEST](state, action) {
    return {
      ...state,
      fetching: [
        ...state.fetching,
        action.payload,
      ],
    }
  }

  static [Action.EVENT_FETCH_SUCCESS](state, action) {
    return {
      ...state,
      entities: {...state.entities, [action.payload._key]: {...action.payload}},
      fetching: state.fetching.filter(key => key !== action.payload._key),
    }
  }

  static [Action.EVENT_PUSHING_SUCCESS](state, action) {
    return {
      ...state,
      entities: {...state.entities, [action.payload._key]: {...action.payload}},
    }
  }

  static [Action.SUSPEND_EVENT_SUCCESS](state, action) {
    return {
      ...state,
      entities: {
        ...state.entities,
        [action.payload._key]: {
          ...state.entities[action.payload._key],
          is_canceled: true,
        },
      },
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default Events.reduce

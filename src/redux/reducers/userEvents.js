import * as Action from '../actions/ActionTypes'
import _ from 'lodash'

const initialState = {
  events: {},
  isRequesting: false,
  hasError: false,
  errorMessage: null,
}

class UserEvents {
  static reduce(state = initialState, action) {
    if (UserEvents[action.type]) {
      return UserEvents[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.WAIVE_EVENT_SPOT_REQUEST](state, action) {
    return {
      ...state,
      isRequesting: true,
    }
  }

  static [Action.WAIVE_EVENT_SPOT_ERROR](state, action) {
    return {
      ...state,
      hasError: true,
      isRequesting: false,
    }
  }

  static [Action.WAIVE_EVENT_SPOT_SUCCESS](state, action) {
    return {
      ...state,
      isRequesting: false,
      events: _.omit(state.events, [action.payload]),
    }
  }

  static [Action.ATTEND_EVENT_REQUEST](state, action) {
    return {
      ...state,
      isRequesting: true,
    }
  }

  static [Action.ATTEND_EVENT_SUCCESS](state, action) {
    return {
      ...state,
      isRequesting: false,
      events: {
        ...state.events,
        [action.payload._key]: action.payload.event,
      },
    }
  }

  static [Action.ATTEND_EVENT_ERROR](state, action) {
    return {
      ...state,
      isRequesting: false,
    }
  }

  static [Action.USER_EVENT_RECEIVED](state, action) {
    return {
      ...state,
      events: action.payload || {},
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default UserEvents.reduce

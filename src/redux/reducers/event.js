import * as Action from '../actions/ActionTypes'

const initialState = {
  isPushing: false,
  isSuspending: false,
  isSaved: false,
  rated: [],
  hasError: false
}

class Event {
  static reduce(state = initialState, action) {
    if (Event[action.type]) {
      return Event[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.EVENT_PUSHING](state, action) {
    return {
      ...state,
      isPushing: true
    }
  }

  static [Action.EVENT_PUSHING_SUCCESS](state, action) {
    return {
      ...state,
      isPushing: false,
      isSaved: true
    }
  }

  static [Action.EVENT_PUSHING_ERROR](state, action) {
    return {
      ...state,
      isPushing: false,
      isSaved: false
    }
  }

  static [Action.SUSPEND_EVENT_REQUEST](state, action) {
    return {
      ...state,
      isSuspending: true
    }
  }

  static [Action.SUSPEND_EVENT_SUCCESS](state, action) {
    return {
      ...state,
      isSuspending: false
    }
  }

  static [Action.SUSPEND_EVENT_ERROR](state, action) {
    return {
      ...state,
      isSuspending: false
    }
  }

  static [Action.EVENT_RATE_SUCCESS](state, { payload: { _key } }) {
    return {
      ...state,
      rated: [
        ...state.rated,
        _key
      ]
    }
  }

  static [Action.CLEAR_EVENT](state, action) {
    return initialState
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default Event.reduce

import * as Action from '../actions/ActionTypes'
const initialState = {
  isPushing: false,
  isSaved: false,
  hasError: false,
}

class Event {
  static reduce(state = initialState, action) {
    if (Event[action.type]) {
      return Event[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.USER_ID_UPLOAD_REQUEST](state, action) {
    return {
      ...state,
      isPushing: true,
    }
  }

  static [Action.USER_ID_UPLOAD_SUCCESS](state, action) {
    return {
      ...state,
      isPushing: false,
      isSaved: true,
    }
  }

  static [Action.USER_ID_UPLOAD_ERROR](state, action) {
    return {
      ...state,
      isPushing: false,
      isSaved: false,
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default Event.reduce

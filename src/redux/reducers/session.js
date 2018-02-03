import * as Action from '../actions/ActionTypes'

const initialState = {
  loggedIn: false,
}

class SessionReducer {
  static reduce(state = initialState, action) {
    if (SessionReducer[action.type]) {
      return SessionReducer[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.SIGN_IN](state, action) {
    return {
      loggedIn: true,
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default SessionReducer.reduce

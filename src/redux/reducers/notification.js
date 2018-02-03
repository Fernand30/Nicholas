import * as Action from '../actions/ActionTypes'

const initialState = {
  list: [],
}

class NotificationReducer {
  static reduce(state = initialState, action) {
    if (NotificationReducer[action.type]) {
      return NotificationReducer[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.NOTIFICATION_RECEIVED](state, action) {
    return {
      ...state,
      list: [
        ...state.list,
        action.payload,
      ],
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default NotificationReducer.reduce

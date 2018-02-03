import * as Action from '../actions/ActionTypes'
import _ from 'lodash'

const initialState = {
  attendees: {},
}

class UserEvents {
  static reduce(state = initialState, action) {
    if (UserEvents[action.type]) {
      return UserEvents[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.EVENT_ATTENDEES_RECEIVED](state, action) {
    return {
      ...state,
      attendees: {
        [action.payload._key]: action.payload.users,
      },
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default UserEvents.reduce

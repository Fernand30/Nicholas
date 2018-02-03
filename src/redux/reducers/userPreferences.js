import * as Action from '../actions/ActionTypes'

const initialState = {
  isFetching: false,
  hasError: false,
  preferences: {
    notifications: {},
  },
}

class UserPreferences {
  static reduce(state = initialState, action) {
    if (UserPreferences[action.type]) {
      return UserPreferences[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.USER_PREFERENCES_RECEIVED](state, action) {
    return {
      ...state,
      preferences: action.payload,
    }
  }

  static [Action.USER_NOTIF_UPDATED](state, action) {
    return {
      ...state,
      preferences: {
        ...state.preferences,
        notifications: {
          ...state.notifications,
          [action.payload.type]: action.payload.value,
        },
      },
    }
  }

  static [Action.USER_NOTIF_ERROR](state, action) {
    return {
      ...state,
      hasError: false,
      preferences: {
        ...state.preferences,
        notifications: {
          ...state.notifications,
          [action.payload.type]: !action.payload.value,
        },
      },
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default UserPreferences.reduce

import * as Action from '../actions/ActionTypes'

const stateConstants = {
  isPushing: false,
  isFetching: false,
  isUpdatingPassword: false,
  isPasswordUpdated: false,
  passwordUpdateError: null,
}
const initialState = {
  uid: null,
  email: null,
  emailVerified: false,
  displayName: null,
  profile: {
    uid: null,
    username: null,
    first_name: null,
    last_name: null,
    sex: null,
    tags: [],
    birth_date: null,
    profile_img: null,
    cover_img: null,
    is_verified: false,
    is_pro: false,
    uploaded_id: null,
    city: null,
    occupation: null,
    phone: null,
    current_status: null,
    organization: null,
    tax_id: null,
    rating: null,
    is_deleted: false,
    eventsCreated: {},
    secretEventsCreated: {},
    chatGroups: {},
  },
  ...stateConstants
}

class CurrentUserReducer {
  static reduce(state = initialState, action) {
    if (CurrentUserReducer[action.type]) {
      return CurrentUserReducer[action.type](state, action)
    } else {
      return state
    }
  }

  static 'persist/REHYDRATE'(state, action) {
    return {
      ...action.payload.currentUser,
      ...stateConstants,
    }
  }

  static [Action.SET_CURRENT_USER](state, action) {
    return {
      ...state,
      uid: action.payload.uid,
      email: action.payload.email,
      emailVerified: action.payload.emailVerified,
      displayName: action.payload.displayName,
    }
  }

  static [Action.FETCH_PROFILE_REQUEST](state, action) {
    return {
      ...state,
      isFetching: true,
    }
  }

  static [Action.PROFILE_UPDATE_REQUEST](state, action) {
    return {
      ...state,
      isPushing: true,
    }
  }

  static [Action.PROFILE_UPDATE_SUCCESS](state, action) {
    return {
      ...state,
      isPushing: false,
    }
  }

  static [Action.PROFILE_UPDATE_ERROR](state, action) {
    return {
      ...state,
      isPushing: false,
      hasError: true,
    }
  }

  static [Action.PROFILE_RECEIVED](state, action) {
    return {
      ...state,
      profile: action.payload,
      isFetching: false,
    }
  }

  static [Action.PUBLISH_STATUS_SUCCESS](state, action) {
    return {
      ...state,
      current_status: action.payload.post,
    }
  }

  static [Action.UPDATE_PASSWORD_REQUEST](state, action) {
    return {
      ...state,
      isUpdatingPassword: true,
      passwordUpdateError: null,
    }
  }

  static [Action.UPDATE_PASSWORD_SUCCESS](state, action) {
    return {
      ...state,
      isPasswordUpdated: true,
      isUpdatingPassword: false,
      passwordUpdateError: null,
    }
  }

  static [Action.UPDATE_PASSWORD_ERROR](state, action) {
    return {
      ...state,
      isPasswordUpdated: false,
      isUpdatingPassword: false,
      passwordUpdateError: action.payload,
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default CurrentUserReducer.reduce

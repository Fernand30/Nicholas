import * as Action from '../actions/ActionTypes'
import _ from 'lodash'

const initialState = {
  byUser: {},
  fetching: [], //user uids
  hasError: false,
  errorMessage: null,
}

class UserPhotos {
  static reduce(state = initialState, action) {
    if (UserPhotos[action.type]) {
      return UserPhotos[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.USER_PHOTOS_RECEIVED](state, action) {
    return {
      ...state,
      byUser: {
        ...state.byUser,
        [action.payload._key]: action.payload.photos,
      },
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default UserPhotos.reduce

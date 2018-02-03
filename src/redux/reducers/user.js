import * as Action from '../actions/ActionTypes'
import _ from 'lodash'

const initialState = {
  hasError: false,
  entities: {},
  followers: {},
  following: {},
  fetching: [], //array of uid
  isSearching: false,
}

class UserReducer {
  static reduce(state = initialState, action) {
    if (UserReducer[action.type]) {
      return UserReducer[action.type](state, action)
    } else {
      return state
    }
  }

  static 'persist/REHYDRATE'(state, action) {
    const currState = action.payload.user || state
    return {
      ...currState,
      fetching: [],
      isSearching: false,
      hasError: false,
    }
  }

  static [Action.FETCH_USER_REQUEST](state, action) {
    return {
      ...state,
      fetching: [
        ...state.fetching,
        action.payload,
      ],
    }
  }

  static [Action.FETCH_USER_ERROR](state, action) {
    return {
      ...state,
      isFetching: false,
    }
  }

  static [Action.FETCH_USER_SUCCESS](state, action) {
    return {
      ...state,
      isFetching: false,
      fetching: state.fetching.filter(uid => uid !== action.payload),
      entities: {
        ...state.entities,
        [action.payload._key]: action.payload.user,
      },
    }
  }

  static [Action.FOLLOW_USER_REQUEST](state, action) {
    return {
      ...state,
      following: _.merge(state.following, {
        [action.payload.follower]: {
          [action.payload.followed]: true,
        },
      }),
    }
  }

  static [Action.UNFOLLOW_USER_REQUEST](state, action) {
    const following = _.cloneDeep(state.following)
    delete following[action.payload.follower][action.payload.followed]

    return {
      ...state,
      following,
    }
  }

  static [Action.FETCH_FOLLOWING_SUCCESS](state, action) {
    return {
      ...state,
      following: _.merge(state.following, {
        [action.payload.follower]: action.payload.following,
      }),
    }
  }

  static [Action.FETCH_FOLLOWERS_SUCCESS](state, action) {
    return {
      ...state,
      followers: _.merge(state.followers, {
        [action.payload.followed]: action.payload.followers,
      }),
    }
  }

  static [Action.SIGN_OUT]() {
    return initialState
  }

}

export default UserReducer.reduce

import * as Action from '../actions/ActionTypes'
import _ from 'lodash'

const initialState = {
  byUser: {},
  fetching: [], //user uids,
  fetchError: null,
  isPublishing: false,
  publishError: null,
}

class Feed {
  static reduce(state = initialState, action) {
    if (Feed[action.type]) {
      return Feed[action.type](state, action)
    } else {
      return state
    }
  }


  static [Action.PUBLISH_STATUS_REQUEST](state, action) {
    return {
      ...state,
      isPublishing: true,
      publishError: null,
    }
  }

  static [Action.PUBLISH_STATUS_SUCCESS](state, action) {
    return {
      ...state,
      isPublishing: false,
      publishError: null,
      byUser: _.merge({}, state.byUser, {
        [action.payload.userUid]: {
          [action.payload._key]: action.payload.post,
        }
      })
    }
  }

  static [Action.PUBLISH_STATUS_ERROR](state, action) {
    return {
      ...state,
      isPublishing: false,
      publishError: action.payload
    }
  }

  static [Action.FETCH_FEED_REQUEST](state, action) {
    return {
        ...state,
      fetching: [...state.fetching, action.payload],
    }
  }

  static [Action.FETCH_FEED_SUCCESS](state, action) {
    return {
      ...state,
      fetching: state.fetching.filter(uid => uid !== action.payload._key),
      byUser: {
        ...state.byUser,
        [action.payload._key]: action.payload.feed,
      },
    }
  }

  static [Action.FETCH_FEED_ERROR](state, action) {
    return {
      ...state,
      fetching: state.fetching.filter(uid => uid !== action.payload._key),
    }
  }

}

export default Feed.reduce

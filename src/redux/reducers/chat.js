import * as Action from '../actions/ActionTypes'
import _ from 'lodash'

const initialState = {
  isCreating: false,
  isFetching: false,
  hasError: false,
  lastGroupCreated: null,
  groups: {},
  messages: {},
}

class ChatReducer {
  static reduce(state = initialState, action) {
    if (ChatReducer[action.type]) {
      return ChatReducer[action.type](state, action)
    } else {
      return state
    }
  }

  static 'persist/REHYDRATE'(state, action) {
    return initialState
    const currState = action.payload.chat || state
    return {
      ...currState,
      lastGroupCreated: null,
      isCreating: false,
      isFetching: false,
    }
  }

  static [Action.CREATE_CHAT_REQUEST](state, action) {
    return {
      ...state,
      isCreating: true,
    }
  }

  static [Action.FETCH_CHAT_GROUPS_REQUEST](state, action) {
    return {
      ...state,
      isFetching: true,
    }
  }

  static [Action.FETCH_CHAT_GROUPS_SUCCESS](state, action) {
    return {
      ...state,
      isFetching: false,
      groups: action.payload,
    }
  }

  static [Action.FETCH_CHAT_GROUPS_ERROR](state, action) {
    return {
      ...state,
      isFetching: false,
      hasError: true,
      groups: action.payload,
    }
  }

  static [Action.CREATE_CHAT_ERROR](state, action) {
    return {
      ...state,
      hasError: true,
      isCreating: false,
      lastGroupCreated: null,
    }
  }

  static [Action.CREATE_CHAT_SUCCESS](state, action) {
    return {
      ...state,
      isCreating: false,
      lastGroupCreated: action.payload._key,
      groups: {
        ...state.groups,
        [action.payload._key]: action.payload.group,
      },
    }
  }

  static [Action.FETCH_CHAT_MESSAGES_REQUEST](state, action) {
    return {
      ...state,
      isFetching: true,
    }
  }

  static [Action.FETCH_CHAT_MESSAGES_ERROR](state, action) {
    return {
      ...state,
      isFetching: false,
      hasError: true,
    }
  }

  static [Action.FETCH_CHAT_MESSAGES_SUCCESS](state, action) {
    return {
      ...state,
      isFetching: false,
      hasError: false,
      messages: {
        ...state.messages,
        [action.payload._key]: action.payload.messages,
      },
    }
  }

  static [Action.MESSAGE_RECEIVED](state, action) {
    return {
      ...state,
      groups: _.merge({}, state.groups, {
        [action.payload._gid]: {
          last_message: action.payload._message,
        },
      }),
      messages: _.merge({}, state.messages, {
        [action.payload._gid]: {
          [action.payload._nid]: {
            user_id: action.payload._uid,
            message: action.payload._message,
            timestamp: +action.payload._timestamp,
          },
        },
      }),
    }
  }

  static [Action.SEND_CHAT_MSG_REQUEST](state, action) {
    return {
      ...state,
      groups: _.merge({}, state.groups, {
        [action.payload.groupUid]: {
          last_message: action.payload.message.message,
        },
      }),
      messages: _.merge({}, state.messages, {
        [action.payload.groupUid]: {
          [action.payload._key]: action.payload.message,
        },
      }),
    }
  }

  static [Action.CLEAR_CHAT](state, action) {
    return {
      ...state,
      isCreating: false,
      hasError: false,
      lastGroupCreated: null,
    }
  }

  static [Action.CLEAR_CHAT_ERROR](state, action) {
    return {
      ...state,
      hasError: false,
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default ChatReducer.reduce

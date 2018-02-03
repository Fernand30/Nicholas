import * as Action from '../actions/ActionTypes'
import _ from 'lodash'

const initialState = {
  errorMessage: null,
  hasError: false,
  isPushing: false,
  isFetching: false,
  sources: {},
}

class PaymentSources {
  static reduce(state = initialState, action) {
    if (PaymentSources[action.type]) {
      return PaymentSources[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.PAYMENT_CARD_RECEIVED](state, action) {
    return {
      ...state,
      sources: action.payload,
    }
  }

  static [Action.ADD_PAYMENT_CARD_REQUEST](state, action) {
    return {
      ...state,
      isPushing: true,
      hasError: false,
      errorMessage: null,
    }
  }

  static [Action.REMOVE_PAYMENT_CARD_REQUEST](state, action) {
    return {
      ...state,
      isPushing: true,
      hasError: false,
      errorMessage: null,
    }
  }

  static [Action.REMOVE_PAYMENT_CARD_SUCCESS](state, action) {
    return {
      ...state,
      isPushing: false,
      hasError: false,
      errorMessage: null,
      sources: _.omit(state.sources, action.payload),
    }
  }

  static [Action.ADD_PAYMENT_CARD_SUCCESS](state, action) {
    const [key] = Object.keys(action.payload)
    return {
      ...state,
      isPushing: false,
      hasError: false,
      errorMessage: null,
      sources: {
        ...state.sources,
        [key]: action.payload[key],
      },
    }
  }

  static [Action.REMOVE_PAYMENT_CARD_ERROR](state, action) {
    return {
      ...state,
      isPushing: false,
      hasError: true,
      errorMessage: action.payload.response.data ? action.payload.response.data.error : action.payload.message,
    }
  }

  static [Action.ADD_PAYMENT_CARD_ERROR](state, action) {
    return {
      ...state,
      isPushing: false,
      hasError: true,
      errorMessage: action.payload.response.data ? action.payload.response.data.error : action.payload.message,
    }
  }
}

export default PaymentSources.reduce

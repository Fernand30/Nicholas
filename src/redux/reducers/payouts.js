import * as Action from '../actions/ActionTypes'

const initialState = {
  errorMessage: null,
  hasError: false,
  isPushing: false,
  isFetching: false,
  accounts: {},
}

class Payouts {
  static reduce(state = initialState, action) {
    if (Payouts[ action.type ]) {
      return Payouts[ action.type ](state, action)
    } else {
      return state
    }
  }

  static [Action.BANK_ACCOUNT_RECEIVED](state, action) {
    return {
      ...state,
      accounts: action.payload,
      isPushing: false,
    }
  }

  static [Action.ADD_BANK_ACCOUNT_REQUEST](state) {
    return {
      ...state,
      isPushing: true,
      hasError: false,
      errorMessage: null,
    }
  }

  static [Action.ADD_BANK_ACCOUNT_SUCCESS](state, { payload }) {
    return {
      ...state,
      isPushing: false,
      hasError: false,
      errorMessage: null,
      accounts: payload,
    }
  }

  static [Action.ADD_BANK_ACCOUNT_ERROR](state, action) {
    return {
      ...state,
      isPushing: false,
      hasError: true,
      errorMessage: action.payload.response.data ? action.payload.response.data.error : action.payload.message,
    }
  }
}

export default Payouts.reduce

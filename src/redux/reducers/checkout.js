import * as Action from '../actions/ActionTypes'
const initialState = {
  isPushing: false,
  charged: false,
  hasError: false,
  errorMessage: null,
}

class Checkout {
  static reduce(state = initialState, action) {
    if (Checkout[action.type]) {
      return Checkout[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.CHECKOUT_REQUEST](state, action) {
    return {
      ...state,
      isPushing: true,
      charged: false,
      hasError: false,
      errorMessage: null,
    }
  }

  static [Action.CHECKOUT_SUCCESS](state, action) {
    return {
      isPushing: false,
      charged: true,
      hasError: false,
      errorMessage: null,
    }
  }

  static [Action.CHECKOUT_ERROR](state, action) {
    return {
      ...state,
      isPushing: false,
      errorMessage: action.payload.response.error,
      hasError: true,
      charged: false,
    }
  }

  static [Action.CLEAR_CHECKOUT](state, action) {
    return initialState
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }
}

export default Checkout.reduce

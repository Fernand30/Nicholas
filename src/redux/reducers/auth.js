import * as Action from '../actions/ActionTypes';

const initialState = {
  loggedIn: false,
}

class Auth {
  static reduce(state = initialState, action) {
    if (Auth[action.type]) {
      return Auth[action.type](state, action);
    } else {
      return state;
    }
  }

  static [Action.SIGN_OUT](state, action) {
    return initialState
  }

  static [Action.SIGN_IN](state, action) {
    return {
      loggedIn: true,
    }
  }
}

export default Auth.reduce;

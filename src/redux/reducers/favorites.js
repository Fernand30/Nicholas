import * as Action from '../actions/ActionTypes'

const initialState = {
  events: [],
}

class Favorites {
  static reduce(state = initialState, action) {
    if (Favorites[action.type]) {
      return Favorites[action.type](state, action)
    } else {
      return state
    }
  }

  static [Action.ADD_FAVORITE_EVENT](state, action) {
    return {
      events: [...state.events, action.payload],
    }
  }

  static [Action.REMOVE_FAVORITE_EVENT](state, action) {
    return {
      events: [...state.events].filter(id => id !== action.payload),
    }
  }

}

export default Favorites.reduce

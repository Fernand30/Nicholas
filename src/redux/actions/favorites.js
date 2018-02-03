import * as Action from './ActionTypes'

export const addFavorite = (uid) => (dispatch) => {
  dispatch({
    type: Action.ADD_FAVORITE_EVENT,
    payload: uid,
  })
}

export const removeFavorite = (uid) => (dispatch) => {
  dispatch({
    type: Action.REMOVE_FAVORITE_EVENT,
    payload: uid,
  })
}

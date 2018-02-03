import * as Action from './ActionTypes'
import Firebase from '../../utils/Firebase'

export const signIn = () => (dispatch) => {
  return dispatch({
    type: Action.SIGN_IN,
  })
}

export const signOut = () => (dispatch) => {
  Firebase.getInstance().auth().signOut()
  return dispatch({
    type: Action.SIGN_OUT,
  })
}
import * as Action from './ActionTypes'
import Firebase from '../../utils/Firebase'

let dbRef

export const subscribeToUserPreferences = (uid) => (dispatch) => {
  dbRef = Firebase.getDbRef(`user_preferences/${uid}`)
  dbRef.on('value', snapshot => {
    dispatch({
      type: Action.USER_PREFERENCES_RECEIVED,
      payload: snapshot.val(),
    })
  })
}

export const unSubscribeToUserPreferences = () => (dispatch) => {
  if (dbRef) {
    dbRef.off('value')
  }
  return dispatch({
    type: Action.USER_PREFERENCES_UNSUBSCRIBED,
  })
}

export const updateNotification = (notificationType: number, value: boolean) => (dispatch, getState) => {
  const uid = getState().currentUser.uid

  dispatch({
    type: Action.USER_NOTIF_UPDATED,
    payload: {
      type: notificationType,
      value,
    },
  })

  Firebase.getDbRef(`user_preferences/${uid}/notifications`)
      .child(notificationType)
      .set(value)
      .catch(error => {
        dispatch({
          type: Action.USER_NOTIF_ERROR,
          payload: {
            type: notificationType,
            value,
            error,
          },
        })
      })
}
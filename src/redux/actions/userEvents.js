import Firebase from '../../utils/Firebase'
import * as Action from './ActionTypes'
let eventsRef

export const subscribeToUserEvents = (uid) => (dispatch) => {

  eventsRef = Firebase.getDbRef(`user_events/${uid}`)
  eventsRef.on('value', snapshot => {
    dispatch({
      type: Action.USER_EVENT_RECEIVED,
      payload: snapshot.val(),
    })
  })
}

export const unSubscribeToUserEvents = () => (dispatch) => {
  if (eventsRef) {
    eventsRef.off('value')
  }
  return dispatch({
    type: Action.USER_EVENT_UNSUBSCRIBED,
  })
}

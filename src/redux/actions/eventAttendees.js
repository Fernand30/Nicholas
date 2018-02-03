import Firebase from '../../utils/Firebase'
import * as Action from './ActionTypes'

let refs = {}

export const subscribeToEventAttendees = (uid) => (dispatch) => {
  refs[uid] = Firebase.getDbRef(`event_attendees/${uid}`)
  refs[uid].on('value', snapshot => {
    dispatch({
      type: Action.EVENT_ATTENDEES_RECEIVED,
      payload: {
        _key: uid,
        users: snapshot.val(),
      },
    })
  })
}

export const unSubscribeToEventAttendees = (uid) => (dispatch) => {
  if (refs[uid]) {
    refs[uid].off('value')
  }
}

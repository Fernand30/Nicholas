import * as Action from './ActionTypes'
import Firebase from '../../utils/Firebase'

let photosRef = {}

export const subscribeToUserPhotos = (uid) => (dispatch) => {
  photosRef[uid] = Firebase.getDbRef(`user_photos/${uid}`)
  photosRef[uid].on('value', snapshot => {
    dispatch({
      type: Action.USER_PHOTOS_RECEIVED,
      payload: {
        _key: uid,
        photos: snapshot.val(),
      },
    })
  })
}

export const unSubscribeToUserPhotos = (uid) => (dispatch) => {
  if (photosRef[uid]) {
    photosRef[uid].off('value')
  }
  return dispatch({
    type: Action.USER_PHOTOS_UNSUBSCRIBED,
    payload: uid,
  })
}
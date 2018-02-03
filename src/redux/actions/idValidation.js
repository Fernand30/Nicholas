import * as firebase from 'firebase'
import * as Action from './ActionTypes'
import Firebase from '../../utils/Firebase'
import {fileToBlob} from '../../utils/FS'
import {ImageMeta} from '../../TypeDefinition'

export const uploadId = (image: ImageMeta) => (dispatch, getState) => {
  dispatch({
    type: Action.USER_ID_UPLOAD_REQUEST,
  })
  const userId = getState().currentUser.uid
  // Upload file first
  uploadIdImage(userId, image,
      () => {
        Firebase.getDbRef(`/users/${userId}/uploaded_id`).set(true, () => {
          Firebase.getDbRef(`/pending_id_validations/${userId}`).set(true)
          dispatch({
            type: Action.USER_ID_UPLOAD_SUCCESS,
          })
        })
      },
      error => {
        dispatch({
          type: Action.USER_ID_UPLOAD_ERROR,
          payload: error,
        })
      })
}

async function uploadIdImage(filename, image: ImageMeta, successCallback: FileUploadMeta, errorCallback) {
  const ref = Firebase.getStorageRef(`id-validation`).child(filename)
  const blob = await fileToBlob(image.uri, image.mime)
  const uploadTask = ref.put(blob, {contentType: image.mime})

  uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      null,
      errorCallback,
      () => {
        if (successCallback) {
          successCallback({
            ref: `id-validation/${filename}`,
            url: uploadTask.snapshot.downloadURL,
          })
        }
      },
  )
}
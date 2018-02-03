import * as Action from './ActionTypes'
import * as firebase from 'firebase'
import Firebase from '../../utils/Firebase'
import _ from 'lodash'
import ApiHelper from '../../utils/ApiHelper'
import {FileUploadMeta, ImageMeta} from '../../TypeDefinition'
import {fileToBlob} from '../../utils/FS'
import Auth from '../../utils/Auth'

let userRef

const update = (uid, profile, dispatch) => {
  // alert(JSON.stringify(profile))
  const path = `users/${uid}`
  Firebase.getDbRef(path)
      .update(profile)
      .then(() => {
        dispatch({
          type: Action.PROFILE_UPDATE_SUCCESS,
        })
      })
      .catch(error => {
        dispatch({
          type: Action.PROFILE_UPDATE_ERROR,
          payload: error,
        })
      })
}

export const chatApi = ( email,password) => {
  
   var jsonPostData = JSON.stringify({
             email: email,
             password: password
      });
      data = fetch('http://128.199.102.105//api/v1/auth/sign_in.json', {
           method: 'POST',
           headers: {
                        'Content-Type': 'application/json'
                      },
           body:jsonPostData,
            })
      return(data)

};

export const contactApi = (accesstoken, client, uid) => {
  var jsonPostData = JSON.stringify({
             'access-token': accesstoken,
             'client': client,
             'uid': uid
      });
  
      data = fetch('http://128.199.102.105//api/v1/contacts.json?access-token='+accesstoken+'&client='+client+'&uid='+uid, {
           method: 'GET'
            })
      return(data)

};

export const updatePassword = (currentPassword: string, newPassword: string) => (dispatch, getState) => {
  dispatch({
    type: Action.UPDATE_PASSWORD_REQUEST,
  })

  const user = Auth.getUser()
  const credentials = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword)

  Auth.getUser()
      .reauthenticateWithCredential(credentials)
      .then(() => {
        Auth.getUser().updatePassword(newPassword)
            .then(() => {
              dispatch({
                type: Action.UPDATE_PASSWORD_SUCCESS,
              })
            })
            .catch(error => {
              dispatch({
                type: Action.UPDATE_PASSWORD_ERROR,
                payload: error,
              })
            })
      })
      .catch(error => {
        dispatch({
          type: Action.UPDATE_PASSWORD_ERROR,
          payload: error,
        })
      })
}

export const setFcmToken = (uid, token) => dispatch => {
  Firebase.getDbRef(`user_fcm_tokens/${uid}`).update({[token]: true}, () => {
    dispatch({
      type: Action.SET_FCM_TOKEN,
    })
  })
}

export const subscribeToProfileUpdates = (uid) => (dispatch) => {
  userRef = Firebase.getDbRef(`users/${uid}`)

  dispatch({
    type: Action.FETCH_PROFILE_REQUEST,
    payload: uid,
  })

  userRef.on('value', snapshot => {
    dispatch({
      type: Action.PROFILE_RECEIVED,
      payload: snapshot.val(),
    })
  })
}

export const unSubscribeToProfileUpdates = () => (dispatch) => {
  if (userRef) {
    userRef.off('value')
  }
}

export const setCurrentUser = (user) => (dispatch) => {
  return dispatch({
    type: Action.SET_CURRENT_USER,
    payload: user,
  })
}

export const updateIp = () => (dispatch) => {
  dispatch({
    type: Action.UPDATE_USER_IP,
  })
  ApiHelper
      .authenticatedRequest('updateIp')
      .catch(error => {
        //@todo Report
      })
}

export const updateProfile = (
    user: User, profilePicture: ImageMeta = null, coverPicture: ImageMeta = null) => (dispatch, getState) => {
  dispatch({
    type: Action.PROFILE_UPDATE_REQUEST,
  })
  const uid = Firebase.getInstance().auth().currentUser.uid
  const profile: User = _.pick(user,
      [
        'first_name',
        'last_name',
        'sex',
        'username',
        'address',
        'address_components',
        'birth_date',
        'cover_img',
        'occupation',
        'profile_img',
        'uploaded_id',
        'display_name',
        'google_place_id',
        'location',
        'tags',
      ]) //filter fields to avoid writing to protected fields
  if (profile.address_components === undefined) {
    delete profile.address_components
  }
  profile['display_name'] = `${profile.first_name} ${profile.last_name}`

  //Just update the profile
  if (!profilePicture && !coverPicture) {
    return update(uid, profile, dispatch)
  }

  const promises = []

  if (coverPicture) {
    let ext = coverPicture.uri.split('.').pop()
    let uploadPromise = new Promise((resolve, reject) => {
      uploadImage(uid, `coverPicture.${ext}`, coverPicture,
          (fileMeta: FileUploadMeta) => {
            profile.cover_img = fileMeta.url
            profile.cover_storage_ref = fileMeta.ref
            resolve()
          },
          error => reject(error))
    })

    promises.push(uploadPromise)
  }

  if (profilePicture) {
    let ext = profilePicture.uri.split('.').pop()
    let uploadPromise = new Promise((resolve, reject) => {
      uploadImage(uid, `profilePicture.${ext}`, profilePicture,
          (fileMeta: FileUploadMeta) => {
            profile.profile_img = fileMeta.url
            profile.profile_storage_ref = fileMeta.ref
            resolve()
          },
          error => reject(error))
    })

    promises.push(uploadPromise)
  }

  Promise.all(promises).then(() => {
    update(uid, profile, dispatch)
  }).catch(error => {
    dispatch({
      type: Action.PROFILE_UPDATE_ERROR,
      payload: error,
    })
  })
}

export const updatePhoneProfile = (
    user: User, uid: uid, profilePicture: ImageMeta = null, coverPicture: ImageMeta = null) => (dispatch, getState) => {
  dispatch({
    type: Action.PROFILE_UPDATE_REQUEST,
  })
  // const uid: uid = _.pick(uid, ['uid'])
  const profile: User = _.pick(user,
      [
        'first_name',
        'last_name',
        'sex',
        'username',
        'address',
        'address_components',
        'birth_date',
        'cover_img',
        'occupation',
        'profile_img',
        'uploaded_id',
        'display_name',
        'google_place_id',
        'location',
        'tags',
      ]) //filter fields to avoid writing to protected fields
  if (profile.address_components === undefined) {
    delete profile.address_components
  }
  profile['display_name'] = `${profile.first_name} ${profile.last_name}`

  //Just update the profile
  if (!profilePicture && !coverPicture) {
    return update(uid, profile, dispatch)
  }

  const promises = []

  if (coverPicture) {
    let ext = coverPicture.uri.split('.').pop()
    let uploadPromise = new Promise((resolve, reject) => {
      uploadImage(uid, `coverPicture.${ext}`, coverPicture,
          (fileMeta: FileUploadMeta) => {
            profile.cover_img = fileMeta.url
            profile.cover_storage_ref = fileMeta.ref
            resolve()
          },
          error => reject(error))
    })

    promises.push(uploadPromise)
  }

  if (profilePicture) {
    let ext = profilePicture.uri.split('.').pop()
    let uploadPromise = new Promise((resolve, reject) => {
      uploadImage(uid, `profilePicture.${ext}`, profilePicture,
          (fileMeta: FileUploadMeta) => {
            profile.profile_img = fileMeta.url
            profile.profile_storage_ref = fileMeta.ref
            resolve()
          },
          error => reject(error))
    })

    promises.push(uploadPromise)
  }

  Promise.all(promises).then(() => {
    update(uid, profile, dispatch)
  }).catch(error => {
    dispatch({
      type: Action.PROFILE_UPDATE_ERROR,
      payload: error,
    })
  })
}

async function uploadImage(
    path: string, filename: string, image: ImageMeta, successCallback: FileUploadMeta, errorCallback) {
  const ref = Firebase.getStorageRef(`users`).child(path).child(filename)
  const blob = await fileToBlob(image.uri, image.mime)
  const uploadTask = ref.put(blob, {contentType: image.mime})

  uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      null,
      errorCallback,
      () => {
        if (successCallback) {
          successCallback({
            ref: `${path}/${filename}`,
            url: uploadTask.snapshot.downloadURL,
          })
        }
      },
  )
}

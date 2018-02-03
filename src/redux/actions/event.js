import * as Action from './ActionTypes'
import * as firebase from 'firebase'
import Firebase from '../../utils/Firebase'
import { fileToBlob } from '../../utils/FS'
import { Event, EventCover, EventVideoCover, EventAudioCover, EventTicket, EventUser, FileUploadMeta } from '../../TypeDefinition'
import _ from 'lodash'
import GeoHelper from '../../utils/GeoHelper'
import Auth from '../../utils/Auth'

function prepareEvent(
    event: Event, isSecret: boolean, fileMeta: FileUploadMeta, userId: string,
    profile: EventUser): Event {
  const _event: Event = _.omit(event, ['_key'])

  //Filter out all user properties except:
  const user = _.pickBy(profile, (val, key) => [
    'display_name',
    'profile_img',
    'organization',
    'username'
  ].indexOf(key) !== -1)

  _event.user = Object.assign({}, user, { uid: userId }) //Adds 'uid' property
  _event.timestamp = firebase.database.ServerValue.TIMESTAMP
  _event.name = _.capitalize(_event.name)
  // alert('updateEvent' + '/n' + JSON.stringify(fileMeta) + '/n' + JSON.stringify(videoFileMeta)+ '/n' + JSON.stringify(audioFileMeta))

  if (fileMeta) {
    _event.cover_img = fileMeta.url
    _event.cover_storage_ref = fileMeta.ref
  }

  if (!_event.is_free) {
    _event.attendance_limit = event.prices.map(p => p.qty).reduce((prev, next) => prev + next, 0)

    const prices = event.prices.map(p => p.price)
    _event.min_price = Math.min(...prices)
    _event.max_price = Math.max(...prices)
  } else {
    _event.attendance_limit = +_event.attendance_limit || 1
    _event.min_price = 0
    _event.max_price = 0
  }

  if (_event.is_private) {
    _event.address = null
    _event.is_secret = null
  }

  if (isSecret) {
    _event.is_private = null
    _event.is_secret = true
  }
  return _event
}

function prepareVideoEvent(
    event: Event, isSecret: boolean, videoFileMeta: FileUploadMeta, userId: string,
    profile: EventUser): Event {
  const _event: Event = _.omit(event, ['_key'])

  //Filter out all user properties except:
  const user = _.pickBy(profile, (val, key) => [
    'display_name',
    'profile_img',
    'organization',
    'username'
  ].indexOf(key) !== -1)

  _event.user = Object.assign({}, user, { uid: userId }) //Adds 'uid' property
  _event.timestamp = firebase.database.ServerValue.TIMESTAMP
  _event.name = _.capitalize(_event.name)
  // alert('updateEvent' + '/n' + JSON.stringify(fileMeta) + '/n' + JSON.stringify(videoFileMeta)+ '/n' + JSON.stringify(audioFileMeta))

  if (videoFileMeta) {
    _event.cover_video = videoFileMeta.url
    _event.cover_video_storage_ref = videoFileMeta.ref
  }

  if (!_event.is_free) {
    _event.attendance_limit = event.prices.map(p => p.qty).reduce((prev, next) => prev + next, 0)

    const prices = event.prices.map(p => p.price)
    _event.min_price = Math.min(...prices)
    _event.max_price = Math.max(...prices)
  } else {
    _event.attendance_limit = +_event.attendance_limit || 1
    _event.min_price = 0
    _event.max_price = 0
  }

  if (_event.is_private) {
    _event.address = null
    _event.is_secret = null
  }

  if (isSecret) {
    _event.is_private = null
    _event.is_secret = true
  }
  return _event
}

function prepareAudioEvent(
    event: Event, isSecret: boolean, audioFileMeta: FileUploadMeta, userId: string,
    profile: EventUser): Event {
  const _event: Event = _.omit(event, ['_key'])

  //Filter out all user properties except:
  const user = _.pickBy(profile, (val, key) => [
    'display_name',
    'profile_img',
    'organization',
    'username'
  ].indexOf(key) !== -1)

  _event.user = Object.assign({}, user, { uid: userId }) //Adds 'uid' property
  _event.timestamp = firebase.database.ServerValue.TIMESTAMP
  _event.name = _.capitalize(_event.name)
  // alert('updateEvent' + '/n' + JSON.stringify(fileMeta) + '/n' + JSON.stringify(videoFileMeta)+ '/n' + JSON.stringify(audioFileMeta))

  if (audioFileMeta) {
    _event.cover_audio = audioFileMeta.url
    _event.cover_audio_storage_ref = audioFileMeta.ref
  }

  if (!_event.is_free) {
    _event.attendance_limit = event.prices.map(p => p.qty).reduce((prev, next) => prev + next, 0)

    const prices = event.prices.map(p => p.price)
    _event.min_price = Math.min(...prices)
    _event.max_price = Math.max(...prices)
  } else {
    _event.attendance_limit = +_event.attendance_limit || 1
    _event.min_price = 0
    _event.max_price = 0
  }

  if (_event.is_private) {
    _event.address = null
    _event.is_secret = null
  }

  if (isSecret) {
    _event.is_private = null
    _event.is_secret = true
  }
  return _event
}

// ... and look them up by key ...
export const eventNear = (_key: string, location: string, distance: number) => (dispatch) => {
  dispatch({
    type: Action.EVENT_NEAR,
    payload: {
      _key,
      location,
      distance
    }
  })
  dispatch(fetchEvent(_key))
}

export const eventFar = (_key: string, location: string, distance: number) => (dispatch) => {
  dispatch({
    type: Action.EVENT_FAR,
    payload: { _key },
    location,
    distance
  })
}

export const attendFreeEvent = (
    _key: string, isSecret: boolean = false, contributionIndex: number) => (
    dispatch, getState) => {
  dispatch({
    type: Action.ATTEND_EVENT_REQUEST
  })

  const userId = Auth.getUid()
  const eventData = {
    ts: firebase.database.ServerValue.TIMESTAMP,
    is_secret: isSecret,
    contribution_id: contributionIndex
  }
  Firebase.getDbRef(`user_events/${userId}`).child(_key).set(eventData).then(() => {
    dispatch({
      type: Action.ATTEND_EVENT_SUCCESS,
      payload: {
        _key,
        event: eventData
      }
    })
  }).catch(() => {
    dispatch({
      type: Action.ATTEND_EVENT_ERROR,
      _payload: {
        _key
      }
    })
  })
}

export const waiveEventSpot = (_key: string, isSecret: boolean) => (dispatch, getState) => {
  dispatch({
    type: Action.WAIVE_EVENT_SPOT_REQUEST
  })

  const userId = Auth.getUid()
  Firebase.getDbRef(`user_events/${userId}`).child(_key).set(null).then(() => {
    dispatch({
      type: Action.WAIVE_EVENT_SPOT_SUCCESS,
      payload: _key
    })
  }).catch(() => {
    dispatch({
      type: Action.WAIVE_EVENT_SPOT_ERROR,
      payload: _key
    })
  })
}

export const suspendEvent = (_key: string, isSecret: boolean) => (dispatch, getState) => {
  dispatch({
    type: Action.SUSPEND_EVENT_REQUEST
  })

  const root = isSecret ? 'secret_events' : 'events'
  const path = `${root}/${_key}`

  Firebase.getDbRef(path).child('is_canceled').set(true).then(() => {
    dispatch({
      type: Action.SUSPEND_EVENT_SUCCESS,
      payload: _key
    })
  }).catch(() => {
    dispatch({
      type: Action.SUSPEND_EVENT_ERROR,
      payload: _key
    })
  })
}

export const rateEvent = (_key: string, rating: number) => (dispatch, getState) => {
  const currentUserId = getState().currentUser.uid

  Firebase.getDbRef(`/event_ratings/${_key}/${currentUserId}`).set(rating)
      .then(() => {
        dispatch({
          type: Action.EVENT_RATE_SUCCESS,
          payload: {
            _key,
            rating
          }
        })
      })
      .catch(error => {
        dispatch({
          type: Action.EVENT_RATE_ERROR,
          payload: {
            _key,
            error
          }
        })
      })
}

export const fetchEvent = (_key: string, forceRefresh: boolean = false) => (dispatch, getState) => {
  //Check if entity is already in state
  if (!forceRefresh && getState().events.entities[_key]) {
    return null
  }

  dispatch({
    type: Action.EVENT_FETCH_REQUEST,
    payload: _key
  })

  Firebase.getDbRef('events').child(_key).on('value', (snapshot) => {
    const event: Event = snapshot.val()
    dispatch({
      type: Action.EVENT_FETCH_SUCCESS,
      payload: { ...event, _key }
    })
  })
}

export const fetchTickets = (_key: string, forceRefresh: boolean = false) => (
    dispatch, getState) => {
  //Check if entity is already in state
  if (!forceRefresh && getState().events.tickets[_key]) {
    return null
  }

  Firebase.getDbRef('event_tickets').child(_key).on('value', (snapshot) => {
    const tickets: EventTicket = snapshot.val()
    dispatch({
      type: Action.EVENT_TICKETS_FETCH_SUCCESS,
      payload: { tickets, _key }
    })
  })
}

const pushEvent = (
    ref, isUpdating: boolean, event: Event, isSecret: boolean, fileMeta: FileUploadMeta,
    getState) => (
    dispatch, getState) => {
      const userId = getState().currentUser.uid
      const userProfile = getState().currentUser.profile
      const _address = event.address
      const _event = prepareEvent(event, isSecret, fileMeta, userId, userProfile)
      // alert(JSON.stringify(_event))
      const pushSuccess = (event) => dispatch({
        type: Action.EVENT_PUSHING_SUCCESS,
        payload: {
          _key: ref.key,
          ..._event
        }
      })

      ref.update(_event, () => {
        const pricePath = `event_tickets/${ref.key}`

        _event.prices.forEach((p: EventTicket) => {
          let ref = Firebase.getDbRef(pricePath)

          if (isUpdating && p._key) {
            ref.child(p._key).update(_.omit(p, ['purchase_count', '_key']))
          } else {
            ref.push({ ...p, purchase_count: 0 })
          }
        })

        if (!isSecret) {
          //add event to geofire index
          GeoHelper.setEventLocation(ref.key, _event.location)
          if (_event.is_private) {
            const addressRef = Firebase.getDbRef(`private_events_address/${ref.key}`)
            addressRef.set({ address: _address }, pushSuccess())
          } else {
            pushSuccess()
          }
        }
      })
}

const pushVideoEvent = (
    ref, isUpdating: boolean, event: Event, isSecret: boolean, videoFileMeta: FileUploadMeta,
    getState) => (
    dispatch, getState) => {
      const userId = getState().currentUser.uid
      const userProfile = getState().currentUser.profile
      const _address = event.address
      const _event = prepareVideoEvent(event, isSecret, videoFileMeta, userId, userProfile)
      // alert(JSON.stringify(_event))
      const pushSuccess = (event) => dispatch({
        type: Action.EVENT_PUSHING_SUCCESS,
        payload: {
          _key: ref.key,
          ..._event
        }
      })

      ref.update(_event, () => {
        const pricePath = `event_tickets/${ref.key}`

        _event.prices.forEach((p: EventTicket) => {
          let ref = Firebase.getDbRef(pricePath)

          if (isUpdating && p._key) {
            ref.child(p._key).update(_.omit(p, ['purchase_count', '_key']))
          } else {
            ref.push({ ...p, purchase_count: 0 })
          }
        })

        if (!isSecret) {
          //add event to geofire index
          GeoHelper.setEventLocation(ref.key, _event.location)
          if (_event.is_private) {
            const addressRef = Firebase.getDbRef(`private_events_address/${ref.key}`)
            addressRef.set({ address: _address }, pushSuccess())
          } else {
            // pushSuccess()
          }
        }
      })
}

const pushAudioEvent = (
    ref, isUpdating: boolean, event: Event, isSecret: boolean, audioFileMeta: FileUploadMeta,
    getState) => (
    dispatch, getState) => {
      const userId = getState().currentUser.uid
      const userProfile = getState().currentUser.profile
      const _address = event.address
      const _event = prepareAudioEvent(event, isSecret, audioFileMeta, userId, userProfile)
      // alert(JSON.stringify(_event))
      const pushSuccess = (event) => dispatch({
        type: Action.EVENT_PUSHING_SUCCESS,
        payload: {
          _key: ref.key,
          ..._event
        }
      })

      ref.update(_event, () => {
        const pricePath = `event_tickets/${ref.key}`

        _event.prices.forEach((p: EventTicket) => {
          let ref = Firebase.getDbRef(pricePath)

          if (isUpdating && p._key) {
            ref.child(p._key).update(_.omit(p, ['purchase_count', '_key']))
          } else {
            ref.push({ ...p, purchase_count: 0 })
          }
        })

        if (!isSecret) {
          //add event to geofire index
          GeoHelper.setEventLocation(ref.key, _event.location)
          if (_event.is_private) {
            const addressRef = Firebase.getDbRef(`private_events_address/${ref.key}`)
            addressRef.set({ address: _address }, pushSuccess())
          } else {
            // pushSuccess()
          }
        }
      })
}






export const updateEvent = (
    eventId: string, event: Event, isSecret: boolean, coverImage?: EventCover, coverVideo?: EventVideoCover, coverAudio?: EventAudioCover) => (
    dispatch, getState) => {

  dispatch({
    type: Action.EVENT_PUSHING
  })

  const userId = getState().currentUser.uid
  const path = isSecret ? `secret_events/${eventId}` : `events/${eventId}`
  const ref = Firebase.getDbRef(path)

  if (coverImage) {
    // If cover changed, delete previous and upload new
    const coverRef = firebase.storage().ref().child(event.cover_storage_ref)
    coverRef.delete().then(() => {
      uploadCover(userId, eventId, coverImage, (fileMeta) => {
        dispatch(pushEvent(ref, true, event, isSecret, fileMeta, getState))
      })
    }).catch(error => {
      dispatch({ type: Action.EVENT_PUSHING_ERROR, payload: { error } })
    })

  } else {
    //Just update event fields
    dispatch(pushEvent(ref, true, event, isSecret, null, getState))
  }

  if (coverVideo) {
    // If cover changed, delete previous and upload new
    const coverVideoRef = firebase.storage().ref().child(event.cover_video_storage_ref)
    coverVideoRef.delete().then(() => {
      uploadCover(userId, eventId, coverVideo, (videoFileMeta) => {
        dispatch(pushEvent(ref, true, event, isSecret, videoFileMeta, getState))
      })
    }).catch(error => {
      dispatch({ type: Action.EVENT_PUSHING_ERROR, payload: { error } })
    })

  } else {
    //Just update event fields
    dispatch(pushEvent(ref, true, event, isSecret, null, getState))
  }

  if (coverAudio) {
    // If cover changed, delete previous and upload new
    const coverAudioRef = firebase.storage().ref().child(event.cover_audio_storage_ref)
    coverAudioRef.delete().then(() => {
      uploadCover(userId, eventId, coverAudio, (audioFileMeta) => {
        dispatch(pushEvent(ref, true, event, isSecret, audioFileMeta, getState))
      })
    }).catch(error => {
      dispatch({ type: Action.EVENT_PUSHING_ERROR, payload: { error } })
    })

  } else {
    //Just update event fields
    dispatch(pushEvent(ref, true, event, isSecret, null, getState))
  }
}

export const createEvent = (event: Event, isSecret: boolean, coverImage: EventCover, coverVideo: EventVideoCover, coverAudio: EventAudioCover) => (
    dispatch, getState) => {
      // alert(JSON.stringify(coverAudio))
  dispatch({
    type: Action.EVENT_PUSHING
  })
  const userId = getState().currentUser.uid
  const path = isSecret ? 'secret_events' : 'events'
  const ref = Firebase.getDbRef(path).push()
  // Upload file first
  let uImage = coverImage ? coverImage:null
  let uVideo = coverVideo ? coverVideo:null
  let uAudio = coverAudio ? coverAudio:null

  if (coverImage) {
    uploadCover(userId, ref.key, uImage, (fileMeta) => {
      dispatch(pushEvent(ref, false, event, isSecret, fileMeta, getState))
    })
  }

  if (coverVideo) {
    uploadVideoCover(userId, ref.key, uVideo, (videoFileMeta) => {
      dispatch(pushVideoEvent(ref, false, event, isSecret, videoFileMeta, getState))
    })
  }

  if (coverAudio) {
    uploadAudioCover(userId, ref.key, uAudio, (audioFileMeta) => {
      dispatch(pushAudioEvent(ref, false, event, isSecret, audioFileMeta, getState))
    })
  }




}

export const clearEvent = () => (dispatch, getState) => {
  dispatch({
    type: Action.CLEAR_EVENT
  })
}



async function uploadCover(
    userId: string, eventId: string, image: EventCover, successCallback: FileUploadMeta) {
  // alert(JSON.stringify(image))
  const ext = image.uri.split('.').pop()
  const epoch = new Date().getTime()
  const filename = `${eventId}-${epoch}.${ext}`
  const ref = Firebase.getStorageRef(`user-events`).child(userId).child(filename)
  const blob = await fileToBlob(image.uri, image.mime)
  const uploadTask = ref.put(blob, { contentType: image.mime })

  uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      null,
      null,
      () => {
        if (successCallback) {
          successCallback({
            ref: `user-events/${userId}/${filename}`,
            url: uploadTask.snapshot.downloadURL
          })
        }
      }
  )
}

async function uploadVideoCover(
    userId: string, eventId: string, video: EventVideoCover, successCallback: FileUploadMeta) {
  // alert(JSON.stringify(image))

  const videoext = video.videouri.split('.').pop()
  const videoepoch = new Date().getTime()
  const videofilename = `${eventId}-${videoepoch}.${videoext}`
  const videoref = Firebase.getStorageRef(`user-events`).child(userId).child(videofilename)
  const videoblob = await fileToBlob(video.videouri, 'video/mov')
  const videouploadTask = videoref.put(videoblob, { contentType: 'video/mov' })

  videouploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      null,
      null,
      () => {
        if (successCallback) {
          successCallback({
            ref: `user-events/${userId}/${videofilename}`,
            url: videouploadTask.snapshot.downloadURL
          })
        }
      }
  )
}

async function uploadAudioCover(
    userId: string, eventId: string, audio: EventAudioCover, successCallback: FileUploadMeta) {
  // alert(JSON.stringify(image))
  const audioext = audio.audiouri.split('.').pop()
  const audioepoch = new Date().getTime()
  const audiofilename = `${eventId}-${audioepoch}.${audioext}`
  const audioref = Firebase.getStorageRef(`user-events`).child(userId).child(audiofilename)
  const audioblob = await fileToBlob(audio.audiouri, 'audio/aac')
  const audiouploadTask = audioref.put(audioblob, { contentType: 'audio/aac' })

  audiouploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      null,
      null,
      () => {
        if (successCallback) {
          successCallback({
            ref: `user-events/${userId}/${audiofilename}`,
            url: audiouploadTask.snapshot.downloadURL
          })
        }
      }
  )
}

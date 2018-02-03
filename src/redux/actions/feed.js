import type {ImageMeta} from '../../TypeDefinition'
import * as Action from './ActionTypes'
import Firebase from '../../utils/Firebase'
import {fileToBlob} from '../../utils/FS'

export const publishStatus = (comment: string, images: Array<ImageMeta>) => (dispatch, getState) => {
  const userUid = getState().currentUser.uid
  dispatch({
    type: Action.PUBLISH_STATUS_REQUEST,
  })

  // Get a key for a new Post.
  const newPostKey = Firebase.getDbRef('user_feed').child(userUid).push().key

  const root = '/user-feed'
  const path = `${userUid}/${newPostKey}`
  const promises = images.map(img => {
    return uploadFile(root, path, img).then(snapshot => {
      const filename = img.uri.split('/').pop()
      return {
        width: img.width,
        height: img.height,
        storage_ref: `${root}/${path}/${filename}`,
        url: snapshot.downloadURL,
      }
    })
  })

  Promise
      .all(promises)
      .then((images: Array) => {
        const post = {
          comment,
          images,
          timestamp: Firebase.timestamp(),
        }

        return Firebase
            .getDbRef(`/user_feed/${userUid}/${newPostKey}`)
            .set(post)
            .then(() => {
              dispatch({
                type: Action.PUBLISH_STATUS_SUCCESS,
                payload: {
                  userUid,
                  _key: newPostKey,
                  post: {
                    ...post,
                    timestamp: new Date().getTime(),
                  },
                },
              })
            })
      })
      .catch(error => {
        return dispatch({type: Action.PUBLISH_STATUS_ERROR, payload: error})
      })
}

export const fetchFeed = (userUid: string) => dispatch => {
  dispatch({
    type: Action.FETCH_FEED_REQUEST,
    payload: userUid,
  })

  Firebase
      .getDbRef(`/user_feed/${userUid}`)
      .once('value')
      .catch(error => dispatch({
        type: Action.FETCH_FEED_ERROR,
        payload: error,
      }))
      .then(snapshot => {
        dispatch({
          type: Action.FETCH_FEED_SUCCESS,
          payload: {
            _key: userUid,
            feed: snapshot.val(),
          },
        })
      })
}

async function uploadFile(root: string, path: string, image: ImageMeta) {
  const filename = image.uri.split('/').pop()
  const ref = Firebase.getStorageRef(root).child(path).child(filename)
  const blob = await fileToBlob(image.uri, image.mime)
  return ref.put(blob, {contentType: image.mime})
}
import * as Action from './ActionTypes'
import Firebase from '../../utils/Firebase'
import Auth from '../../utils/Auth'

export const fetchUser = (uid, forceRefresh = false) => (dispatch, getState) => {
  //Check if entity is already in state
  if (!forceRefresh && getState().user.entities[uid]) {
    return null
  }

  dispatch({
    type: Action.FETCH_USER_REQUEST,
    payload: uid
  })

  Firebase.getDbRef(`/users/${uid}`).on('value', snapshot => {
    dispatch({
      type: Action.FETCH_USER_SUCCESS,
      payload: {
        _key: uid,
        user: snapshot.val()
      }
    })
  })
}

export const followUser = (followedId) => (dispatch, getState) => {
  const followerId = Auth.getUid()

  dispatch({
    type: Action.FOLLOW_USER_REQUEST,
    payload: {
      follower: followerId,
      followed: followedId
    }
  })

  Firebase.getDbRef(`/user_followers/${followedId}/${followerId}`)
      .set(true)
      .catch(() => {
        dispatch({
          type: Action.FOLLOW_USER_ERROR,
          payload: {
            follower: followerId,
            followed: followedId
          }
        })
      })
}

export const unFollowUser = (followedId) => (dispatch, getState) => {
  const followerId = getState().currentUser.uid

  dispatch({
    type: Action.UNFOLLOW_USER_REQUEST,
    payload: {
      follower: followerId,
      followed: followedId
    }
  })

  Firebase.getDbRef(`/user_followers/${followedId}/${followerId}`)
      .set(null)
      .catch(() => {
        dispatch({
          type: Action.UNFOLLOW_USER_ERROR,
          payload: {
            follower: followerId,
            followed: followedId
          }
        })
      })
}

export const fetchFollowing = (followerId) => dispatch => {
  dispatch({
    type: Action.FETCH_FOLLOWING_REQUEST,
    payload: {
      follower: followerId
    }
  })

  Firebase.getDbRef(`/user_following/${followerId}`).once('value', snapshot => {
    dispatch({
      type: Action.FETCH_FOLLOWING_SUCCESS,
      payload: {
        follower: followerId,
        following: snapshot.val()
      }
    })
  })
}

export const fetchFollowers = (followedId) => dispatch => {
  dispatch({
    type: Action.FETCH_FOLLOWERS_REQUEST,
    payload: {
      followed: followedId
    }
  })

  Firebase.getDbRef(`/user_followers/${followedId}`).once('value')
      .then(snapshot => {
        dispatch({
          type: Action.FETCH_FOLLOWERS_SUCCESS,
          payload: {
            followed: followedId,
            followers: snapshot.val()
          }
        })
      })
      .catch(error => {
        dispatch({
          type: Action.FETCH_FOLLOWING_ERROR,
          payload: {
            followed: followedId,
            error
          }
        })
      })
}
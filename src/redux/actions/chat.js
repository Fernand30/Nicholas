import * as firebase from 'firebase'
import * as Action from './ActionTypes'
import Firebase from '../../utils/Firebase'
import Auth from '../../utils/Auth'
import {fetchUser} from './user'

export const fetchChats = () => (dispatch, getState) => {
  const state = getState().currentUser.profile.chat_groups || {}
  const groups = Object.keys(state)

  if (groups.length === 0) {
    return
  }

  dispatch({
    type: Action.FETCH_CHAT_GROUPS_REQUEST,
  })

  const promises = groups.map(key => Firebase.getDbRef('/chat_groups').child(key).once('value'))

  Promise.all(promises).then(function(snapshots) {
    const users = getState().user.entities
    let groups = {}
    snapshots.forEach(snapshot => {
      const missingUsers = Object.keys(snapshot.val().members).filter(uid => users[uid] === undefined)
      missingUsers.forEach(uid => dispatch(fetchUser(uid)))
      return groups[snapshot.key] = {...snapshot.val(), _key: snapshot.key}
    })
    dispatch({
      type: Action.FETCH_CHAT_GROUPS_SUCCESS,
      payload: groups,
    })
  })
}

export const getUsers = (usersUid: Array<string>) => dispatch => {
  const currentUid = Auth.getUid()
  let Udata  = []
  usersUid.map(key => {
      Firebase.getDbRef(`/users`).child(key).once('value').then(function(snapshot){
          name = snapshot.val().display_name;
          pic = snapshot.val().profile_img;
          Udata.push({'id':name,'img':pic})
      })
    })
  return Udata;
}

export const createChat = (usersUid: Array<string>) => dispatch => {
  const currentUid = Auth.getUid()
  dispatch({
    type: Action.CREATE_CHAT_REQUEST,
    payload: usersUid,
  })

  const members = {
    [currentUid]: true,
  }
  usersUid.forEach(uid => members[uid] = true)

  const chatData = {
    creator_uid: currentUid,
    members,
    groupname: (usersUid.length>1)?'New Group':'',
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  }

  // Get a key for a new Post.
  const newChatKey = Firebase.getDbRef().child('chat_groups').push().key

  Firebase.getDbRef(`/chat_groups/${newChatKey}`).set(chatData)
      .then(() => {
        dispatch({
          type: Action.CREATE_CHAT_SUCCESS,
          payload: {
            _key: newChatKey,
            group: {
              ...chatData,
              timestamp: new Date().getTime(),
            },
          },
        })
      })
      .catch(error => {
        dispatch({
          type: Action.CREATE_CHAT_ERROR,
          payload: error,
        })
      })
}

export const editGroupName = (groupName,groupKey) => dispatch => {
  const currentUid = Auth.getUid()

  const info = {
    groupname:groupName
  }

  Firebase.getDbRef(`/chat_groups/${groupKey}`).update(info)
      .then(() => {
       
      })
      .catch(error => {
        dispatch({
          type: Action.CREATE_CHAT_ERROR,
          payload: error,
        })
      })
}

export const addUsers = (data,groupKey) => dispatch => {
  const currentUid = Auth.getUid()
  Firebase.getDbRef(`/chat_groups/${groupKey}/members`).update(data)
      .then(() => {
       
      })
      .catch(error => {
        dispatch({
          type: Action.CREATE_CHAT_ERROR,
          payload: error,
        })
      })
}

export const fetchMessages = (chatUid: string, afterTimestamp?: number) => dispatch => {
  let query = Firebase.getDbRef()
      .child('chat_messages')
      .child(chatUid)
      .orderByChild('timestamp')

  if (afterTimestamp) {
    query = query.startAt(afterTimestamp)
  }

  dispatch({
    type: Action.FETCH_CHAT_MESSAGES_REQUEST,
    payload: {
      _key: chatUid,
    },
  })

  return query
      .once('value')
      .then(snapshot => {
        dispatch({
          type: Action.FETCH_CHAT_MESSAGES_SUCCESS,
          payload: {
            _key: chatUid,
            messages: snapshot.val(),
          },
        })
      })
      .catch(error => {
        dispatch({
          type: Action.FETCH_CHAT_MESSAGES_ERROR,
          payload: error,
        })
      })
}

export const sendMessage = (chatUid: string, message: string) => dispatch => {
  const currentUid = Auth.getUid()
  const newMsgKey = Firebase.getDbRef().child('chat_messages').child(chatUid).push().key
  const chatData = {
    user_id: currentUid,
    message,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  }

  dispatch({
    type: Action.SEND_CHAT_MSG_REQUEST,
    payload: {
      _key: newMsgKey,
      groupUid: chatUid,
      message: {
        ...chatData,
        timestamp: new Date().getTime(),
      },
    },
  })

  // Get a key for a new Post.
  Firebase.getDbRef(`/chat_messages/${chatUid}/${newMsgKey}`).set(chatData)
      .then(() => {
        dispatch({
          type: Action.SEND_CHAT_MSG_SUCCESS,
          payload: {
            _key: newMsgKey,
          },
        })
      })
      .catch(error => {
        dispatch({
          type: Action.SEND_CHAT_MSG_ERROR,
          payload: error,
        })
      })
      
}

export const clearChat = uid => dispatch => {
  dispatch({
    type: Action.CLEAR_CHAT,
    payload: uid,
  })
}

export const messageReceived = payload => dispatch => {
  dispatch({
    type: Action.MESSAGE_RECEIVED,
    payload,
  })
}
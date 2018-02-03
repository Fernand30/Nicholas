import * as Action from './ActionTypes'

export const notificationReceived = payload => dispatch => {
  dispatch({
    type: Action.NOTIFICATION_RECEIVED,
    payload: {
      timestamp: new Date().getTime(),
      ...payload,
    },
  })
}
import * as Action from './ActionTypes'

type Filter = 'CATEGORY' | 'FAVORITES' | 'FILTERED'

export const updateEventFilterParams = (params = Object) => (dispatch) => {
  dispatch({
    type: Action.SET_EVENTS_FILTER_PARAMS,
    payload: params,
  })
}

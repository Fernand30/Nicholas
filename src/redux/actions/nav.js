import {NavigationActions} from 'react-navigation'

export const navigate = (routeName: string, params: Object) => dispatch => {
  return dispatch(NavigationActions.navigate({routeName: routeName, params}))
}

export const navigateBack = () => dispatch => {
  return dispatch(NavigationActions.back())
}
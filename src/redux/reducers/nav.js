import {NavigationActions} from 'react-navigation'
import * as Action from '../actions/ActionTypes'
import {AppNavigator} from '../../AppNavigator'
import _, {isEqual} from 'lodash'

const firstScreen = AppNavigator.router.getActionForPathAndParams('Login')

const initialState = AppNavigator.router.getStateForAction(firstScreen)

class Nav {
  static reduce(state = initialState, action) {
    if (Nav[action.type]) {
      return Nav[action.type](state, action)
    } else {
      return AppNavigator.router.getStateForAction(action, state)
    }
  }

  static 'Navigation/BACK'(state, action) {
    const newState = AppNavigator.router.getStateForAction(
        NavigationActions.back(), state,)
    if (state.routes[state.index].routeName === 'Main') {
      if (newState.routes[newState.index].routeName === 'Login') {
        return state
      }
    }

    return newState
  }

  static 'Navigation/NAVIGATE'(state, action) {
    const {routes, index} = state
    const {routeName, params} = action

    const currentRoute = routes[index]

    if (currentRoute.routes) {
      const lastScene = currentRoute.routes[currentRoute.routes.length - 1]

      // Check for duplication
      if (lastScene.routeName === routeName &&
          isEqual(lastScene.params, params)) {
        return state
      }
    }

    return AppNavigator.router.getStateForAction(action, state)
  }

  static [Action.SET_CURRENT_USER](state, action) {
    const currentRoute = state.routes[state.index]
    //Navigate to Main after Signing in / up
    if (action.payload.uid !== null && ['Login', 'SignUp', 'PhoneAuth'].indexOf(currentRoute.routeName) !== -1) {
      return AppNavigator.router.getStateForAction(
          NavigationActions.navigate({routeName: 'Main'}), state)
    }
    return AppNavigator.router.getStateForAction(action, state)
  }

  static [Action.SIGN_OUT](state, action) {
    return AppNavigator.router.getStateForAction(action, initialState)
  }
}

export default Nav.reduce

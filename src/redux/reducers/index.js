import {combineReducers} from 'redux'
import * as ActionTypes from '../actions/ActionTypes'
import currentUser from "./currentUser"
import nav from "./nav"
import auth from "./auth"
import geoLocation from "./geoLocation"
import event from "./event"
import events from "./events"
import session from './session'
import payment from './payment'
import idValidation from './idValidation'
import checkout from './checkout'
import userEvents from './userEvents'
import eventAttendees from './eventAttendees'
import favorites from './favorites'
import eventsFilter from './eventsFilter'
import user from './user'
import notification from './notification'
import chat from './chat'
import feed from './feed'
import userPhotos from './userPhotos'
import userPreferences from './userPreferences'
import banners from './banners';
import payouts from './payouts'

// Updates error message to notify about the failed fetches.
const errorMessage = (state = null, action) => {
  const {type, error} = action

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
}

const AppReducer = combineReducers({
  nav,
  auth,
  banners,
  session,
  currentUser,
  userEvents,
  userPhotos,
  userPreferences,
  eventAttendees,
  idValidation,
  payment,
  payouts,
  checkout,
  favorites,
  geoLocation,
  event,
  events,
  eventsFilter,
  user,
  notification,
  chat,
  feed,
  errorMessage,
});

export default AppReducer;

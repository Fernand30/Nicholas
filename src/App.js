import React, {Component} from 'react'
import {
  View,
  Image,
  ImageBackground,
} from 'react-native'
import {connect} from 'react-redux'
import AppWithNavigationState from './AppNavigator'
import * as Color from './constants/Color'
import Firebase from './utils/Firebase'
import {signIn, signOut} from './redux/actions/auth'
import SessionAwareStatusBar from './components/SessionAwareStatusBar'
import {
  setCurrentUser, setFcmToken,
  subscribeToProfileUpdates,
  unSubscribeToProfileUpdates,
} from './redux/actions/currentUser'
import {fetchCards} from './redux/actions/payment'
import {subscribeToUserEvents, unSubscribeToUserEvents} from './redux/actions/userEvents'
import FCM, { FCMEvent } from 'react-native-fcm'
import {fetchFollowing} from './redux/actions/user'
import {notificationReceived} from './redux/actions/notification'
import {messageReceived} from './redux/actions/chat'
import {subscribeToUserPreferences, unSubscribeToUserPreferences} from './redux/actions/userPreferences'
import {navigate} from './redux/actions/nav'
import {NotificationTypes} from './constants/NotificationsTypes'
import { fetchBankAccounts } from './redux/actions/payouts'

@connect((state, ownProps) => App.getStateProps(state, ownProps))
export default class App extends Component {
  static getStateProps(state, ownProps) {
    return {
      // currentUser: state.currentUser,
    }
  }

  //Push notifications topic
  notificationTopic
  notificationListener
  refreshTokenListener

  state = {
    loading: true,
  }

  componentDidMount() {
    const {dispatch} = this.props
    Firebase.getInstance().auth().onAuthStateChanged(user => {
      if (user) {
        dispatch(signIn(user))
        dispatch(setCurrentUser(user))
        dispatch(subscribeToProfileUpdates(user.uid))
        dispatch(subscribeToUserEvents(user.uid))
        dispatch(subscribeToUserPreferences(user.uid))
        dispatch(fetchCards())
        dispatch(fetchBankAccounts())
        dispatch(fetchFollowing(user.uid))
        this.listenNotifications(user)
      } else {
        if (this.notificationTopic) {
          FCM.unsubscribeFromTopic(this.notificationTopic)
        }
        dispatch(unSubscribeToProfileUpdates())
        dispatch(unSubscribeToUserEvents())
        dispatch(unSubscribeToUserPreferences())
        dispatch(signOut())
      }
      this.setState({loading: false})

    })
  }

  componentWillReceiveProps(nextProps) {

    const {dispatch} = this.props
    const {currentUser} = nextProps

    if (this.props.currentUser.uid !== currentUser.uid) {
      dispatch(setCurrentUser(currentUser))
      this.setState({loading: false})
    }
  }

  componentWillUnmount() {

    // stop listening for events
    if (this.notificationListener) {
      this.notificationListener.remove()
    }
    if (this.refreshTokenListener) {
      this.refreshTokenListener.remove()
    }
  }

  listenNotifications(user) {

    FCM.requestPermissions()
    FCM.getFCMToken()
        .then(token => {
          this.props.dispatch(setFcmToken(user.uid, token))
        })
    this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, (token) => {
      this.props.dispatch(setFcmToken(user.uid, token))
    })
    FCM.subscribeToTopic(`/topics/${user.uid}`)
    FCM.getInitialNotification().then(()=>{

      this.handleNotification
    })
    this.notificationListener = FCM.on(FCMEvent.Notification, this.handleNotification)
  }

  handleNotification = (notification) => {
    if (!notification || notification._type === undefined) {
      return
    }

    switch (+notification._type) {
      case NotificationTypes.NEW_MESSAGE:
        this.props.dispatch(messageReceived(notification))
        if(notification.opened_from_tray){
          this.props.dispatch(navigate('Conversation', {id: notification._gid}))
        }
        break;
      default:
        notification._notification = JSON.parse(notification._notification)
        this.props.dispatch(notificationReceived(notification))
    }
  }

  renderLoading() {
    const style = {
      flex: 1,
      backgroundColor: Color.TRANSPARENT,
      alignItems: 'center',
      justifyContent: 'center',
    }
    return (
        <ImageBackground source={require('../assets/Images_Icons/splash.png')} style={style}>

        </ImageBackground>
    )
  }

  render() {
    if (this.state.loading) {
      return this.renderLoading()
    }

    return (
        <View style={{flex: 1}}>
          <SessionAwareStatusBar/>
          <AppWithNavigationState/>
        </View>
    )
  }

}

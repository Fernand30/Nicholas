import React, {Component} from 'react'
import {
  Platform,
  Linking,
} from 'react-native'
import {connect} from 'react-redux'
import {addNavigationHelpers, StackNavigator} from 'react-navigation'
import TabNavigator from './components/TabView/TabNavigator'

import * as Color from './constants/Color'

import LoginScreen from './screens/LoginScreen'
import MainScreen from './screens/MainScreen'
import ProfileScreen from './screens/ProfileScreen'
import PhoneAuthScreen from './screens/PhoneAuthScreen'
import SignUpScreen from './screens/SignUpScreen'
import ChatScreen from './screens/ChatScreen'
import GroupInfoScreen from './screens/GroupInfo'
import EditNameScreen from './screens/EditName'
import EventsMapScreen from './screens/EventsMapScreen'
import EventScreen from './screens/EventScreen'
import CreateEventScreen from './screens/EventCreateScreen'
import RecoverPasswordScreen from './screens/RecoverPasswordScreen'
import FilterScreen from './screens/FilterScreen'
import TabBarBottom from './components/TabView/TabBarBottom'
import NotificationsScreen from './screens/NotificationsScreen'
import MapScreen from './screens/MapScreen'
import ProfileEditScreen from './screens/ProfileEditScreen'
import {HEADER_STYLE, HEADER_TITLE_STYLE} from './constants/Style'
import ConversationScreen from './screens/ConversationScreen'
import NewMessageScreen from './screens/NewMessageScreen'
import ConfigScreen from './screens/ConfigScreen'
import IdUploadScreen from './screens/IdUploadScreen'
import SettingsScreen from './screens/SettingsScreen'
import PaymentScreen from './screens/PaymentScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import RequestsScreen from './screens/RequestsScreen'
import EventRatingScreen from './screens/EventRatingScreen'
import SearchScreen from './screens/SearchScreen'
import SplashScreen from './screens/SplashScreen'
import AnimationTestScreen from './screens/AnimationTestScreen'
import AddCardScreen from './screens/AddCardScreen'
import ShareStatusScreen from './screens/ShareStatusScreen'
import UserFollowersScreen from './screens/UserFollowersScreen';
import UserFollowingScreen from './screens/UserFollowingScreen'
import AddBankScreen from './screens/AddBankScreen'
import AddUserScreen from './screens/AddUser'
import FollowingScreen from './screens/FollowingScreen'

const TabsNavigator = TabNavigator({
  Search: {screen: SearchScreen},
  Following: {screen: FollowingScreen},
  // NewEventPlaceholder: {screen: CreateEventScreen},
  Notifications: {screen: NotificationsScreen},
  Profile: {screen: ProfileScreen},
}, {
  tabBarComponent: TabBarBottom,
  tabBarPosition: 'bottom',
  tabBarOptions: {
    showIcon: true,
    showLabel: false,
    activeTintColor: Color.CAMEL,
    tabStyle: {

    },

    labelStyle: {
      fontSize: 10,
      ...Platform.select({
        ios: {
          marginBottom: 4,
          marginTop: 0,
        },
      })
    },
    style: {
      borderTopColor: 'rgba(255,255,255,0.2)',
      borderTopWidth: 1,
      backgroundColor: Color.TAB_COLOR,
      height: 60,
    },
  },
  swipeEnabled: false,
  animationEnabled: false,
  lazy: true,
  headerMode: 'float',
})

const MainNavigator = StackNavigator({
  TabsNavigator: {screen: TabsNavigator},
  Animation: {screen: AnimationTestScreen},
  Event: {screen: EventScreen,},
  EventsMap: {screen: EventsMapScreen},
  Map: {screen: MapScreen},
  Filter: {screen: FilterScreen},
  Login: {screen: LoginScreen},
  Chat: {screen: ChatScreen},
  EditEvent: {screen: CreateEventScreen},
  Conversation: {screen: ConversationScreen},
  NewMessage: {screen: NewMessageScreen},
  Config: {screen: ConfigScreen},
  Settings: {screen: SettingsScreen},
  Payment: {screen: PaymentScreen},
  AddCard: {screen: AddCardScreen},
  AddBank: {screen: AddBankScreen},
  Checkout: {screen: CheckoutScreen},
  Requests: {screen: RequestsScreen},
  Search: {screen: SearchScreen},
  ShareStatus: {screen: ShareStatusScreen},
  UserFollowers: {screen: UserFollowersScreen},
  UserFollowing: {screen: UserFollowingScreen},
  GroupInfo: {screen: GroupInfoScreen},
  EditName: {screen: EditNameScreen},
  AddUser: {screen: AddUserScreen}
}, {
  headerMode: 'none',
  navigationOptions: {
    ...HEADER_TITLE_STYLE,
    ...HEADER_STYLE,
  },
})

export const AppNavigator = StackNavigator({
  Main: {screen: MainNavigator,},
  EventLinkHandler: {
    screen: EventScreen,
    path: 'event/:id',
  },
  UserLinkHandler: {
    screen: ProfileScreen,
    path: 'user/:id',
  },
  Splash: {screen: SplashScreen},
  Login: {screen: LoginScreen},
  PhoneAuth: {screen: PhoneAuthScreen},
  SignUp: {screen: SignUpScreen},
  RecoverPassword: {screen: RecoverPasswordScreen},
  NewEvent: {screen: CreateEventScreen},
  ProfileEdit: {screen: ProfileEditScreen},
  IdUpload: {screen: IdUploadScreen},
  EventRating: {screen: EventRatingScreen}
}, {
  // headerMode: 'none',
  mode: 'modal',
  navigationOptions: {
    ...HEADER_TITLE_STYLE,
    ...HEADER_STYLE,
    gesturesEnabled: false,
  },
})

type Props = {
  dispatch: () => void,
  nav: Object,
}

@connect(state => state => ({nav: state.nav}))
export default class AppWithNavigationState extends Component {
  props: Props

  uriPrefix = Platform.OS === 'android' ? 'test://test/' : 'com.motiondisplays.wattz://'

  componentDidMount() {
    Linking.addEventListener('url', ({url}: { url: string }) => {
      this.handleOpenURL(url)
    })

    Linking.getInitialURL().then((url: ?string) => url && this.handleOpenURL(url),
    )
  }

  urlToPathAndParams(url: string) {
    const params = {}
    const delimiter = this.uriPrefix || '://'
    let path = url.split(delimiter)[1]
    if (typeof path === 'undefined') {
      path = url
    }
    return {
      path,
      params,
    }
  }

  handleOpenURL = (url: string) => {
    const parsedUrl = this.urlToPathAndParams(url)
    if (parsedUrl) {
      const {path, params} = parsedUrl
      const action = AppNavigator.router.getActionForPathAndParams(path, params)
      if (action) {
        this.props.dispatch(action)
      }
    }
  }

  render() {

    const {dispatch, nav} = this.props
    return <AppNavigator navigation={addNavigationHelpers({dispatch, state: nav})}/>
  }
}

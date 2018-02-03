import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableHighlight,
  Image
} from 'react-native'
import I18n from '../i18n'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import Divider from '../components/Divider'
import moment from 'moment'
import NavImageButton from '../components/NavImageButton'
import * as Font from '../constants/Font'
import Avatar from '../components/Avatar'
import TabBarIcon from '../components/TabBarIcon'
import {connect} from 'react-redux'
import Icon from 'react-native-vector-icons/FontAwesome'
import FCM from 'react-native-fcm'
import {NotificationTypes as NotificationsTypes} from '../constants/NotificationsTypes'

@connect((state, ownProps) => NotificationsScreen.getStateProps(state, ownProps))
export default class NotificationsScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    headerLeft: (
        <NavImageButton onPress={() => navigation.navigate('NewEvent')}
                        source={require('../../assets/Images_Icons/btn_add.png')} />
    ),
    headerTitle: (
        <Image style={{ width: 40, height: 40, alignSelf: 'center' }}
               source={require('../../assets/Images_Icons/logo_nav.png')} />
    ),
    headerRight: (
          <NavImageButton
              onPress={() => navigation.navigate('Chat')}
              source={require('../../assets/Images_Icons/btn_chat.png')} />
    ),


    tabBarLabel: I18n.t('notificationScreen.tab'),
    
    tabBarIcon: (props) => (
        <TabBarIcon
            {...props}
            iconSource={require('../../assets/Images_Icons/Tabs/tab_notification_gray.png')}
            focusedIconSource={require('../../assets/Images_Icons/Tabs/tab_notification_blue.png')}/>
    )
  })

  static getStateProps(state, ownProps) {
    return {
      notifications: state.notification.list || [],
    }
  }

  componentDidMount(){
    FCM.setBadgeNumber(0)
  }

  onPressNotification = notification => {
    const type = +notification._type
    switch (type) {
      case NotificationsTypes.STATUS_UPDATE:
        this.props.navigation.navigate('UserLinkHandler', {id: notification._uid})
        break;
      case NotificationsTypes.NEW_FOLLOWER:
        this.props.navigation.navigate('UserLinkHandler', {id: notification._follower})
        break;
    }
  }

  renderNotification = ({item, index}) => {
    return (
        <TouchableHighlight
            onPress={this.onPressNotification.bind(this, item)}
            activeOpacity={1}
            underlayColor={Color.GREYISH_BROWN}>
          <View style={styles.wrapper}>
            {item._icon !== '' && <Avatar size={50} source={{uri: item._icon}}
                    style={styles.avatar}/>}
            <View style={styles.content}>
              <View style={styles.nameContainer}>
                <Text style={styles.name} numberOfLines={3}>
                  {item._notification.title}<Text
                    style={styles.message}> {item._notification.body}</Text>
                </Text>
              </View>
              <Text style={styles.timestamp}>
                {moment(+item._timestamp).fromNow()}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
    )
  }

  renderEmptyState() {
    return (
        <View style={styles.emptyStateContainer}>
          <Icon name="inbox" color={Color.INFO_COLOR} size={50}/>
          <Text style={styles.emptyStateMsg}>{I18n.t('notificationsScreen.empty')}</Text>
        </View>
    )
  }

  render() {
    const count = Object.keys(this.props.notifications).length
    return (
        <View style={styles.container}>
          {count === 0 && this.renderEmptyState()}
          {count > 0 && <FlatList
              removeClippedSubviews={false}
              data={this.props.notifications.reverse()}
              keyExtractor={(item, i) => item._nid}
              renderItem={this.renderNotification}
              ItemSeparatorComponent={() => <Divider/>}
          />}
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.GRAY,
  },
  wrapper: {
    flexDirection: 'row',
    flex: 1,
    padding: 10,
  },
  content: {
    marginLeft: 13.5,
    flex: 1,
  },
  avatar: {},
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  name: {
    color: Color.CONTRAST_COLOR,
    lineHeight: 18,
    fontSize: 15,
    ...Font.FONT_BOLD,
  },
  message: {
    color: Color.CONTRAST_COLOR,
    fontSize: 12.5,
    marginLeft: 5,
    lineHeight: 18,
    ...Font.FONT_LIGHT,
  },
  timestamp: {
    flex: 1,
    color: Color.WARM_GREY,
    fontSize: 12.5,
    ...Font.FONT_BOLD,
  },

  //Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateMsg: {
    color: Color.INFO_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 15,
    marginTop: 10,
  },
})
import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native'
import {connect} from 'react-redux'
import NavBackButton from '../components/NavBackButton'
import I18n from '../i18n'
import * as Color from '../constants/Color'
import EditProfileFloatingLabelInput from '../components/EditProfileFloatingLabelInput'
import * as Font from '../constants/Font'
import Button from '../components/Button'
import {updatePassword} from '../redux/actions/currentUser'
import Auth from '../utils/Auth'
import {NotificationTypes} from '../constants/NotificationsTypes'
import {updateNotification} from '../redux/actions/userPreferences'
import _ from 'lodash'
import {PASSWORD_CHANGE_SCHEMA} from '../constants/ValidationSchemas'

@connect((state, ownProps) => SettingsScreen.getStateProps(state, ownProps))
export default class SettingsScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('settingsScreen.title'),
    headerLeft: <NavBackButton disabled={navigation.state.params && navigation.state.params.isUpdatingPassword}/>,
  })

  static getStateProps(state) {
    return {
      currentUser: state.currentUser,
      notifications: state.userPreferences.preferences ? state.userPreferences.preferences.notifications : null,
      isUpdatingPassword: state.currentUser.isUpdatingPassword,
      isPasswordUpdated: state.currentUser.isPasswordUpdated,
      passwordUpdateError: state.currentUser.passwordUpdateError,
    }
  }

  state = {
    currentPassword: null,
    newPassword: null,
    isValidPassword: false,
    visibleErrorModal: false,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isUpdatingPassword !== nextProps.isUpdatingPassword) {
      this.props.navigation.setParams({isUpdatingPassword: nextProps.isUpdatingPassword})
    }
    if (this.props.isUpdatingPassword && !nextProps.isUpdatingPassword && nextProps.isPasswordUpdated) {
      this.setState({currentPassword: null, newPassword: null})
    }
    if (!this.props.passwordUpdateError && nextProps.passwordUpdateError) {
      this.toggleErrorModal()
    }
  }

  onPressUpdatePassword = () => {
    this.props.dispatch(updatePassword(this.state.currentPassword, this.state.newPassword))
  }

  onChangePassword = (key, password) => {
    this.setState({
      [key]: password,
    }, this.validatePasswords)
  }

  validatePasswords = () => {
    PASSWORD_CHANGE_SCHEMA
        .validate(this.state)
        .then(() => this.setState({isValidPassword: true}))
        .catch(() => this.setState({isValidPassword: false}))
  }

  onChangeNotification = (type, value) => {
    this.props.dispatch(updateNotification(type, value))
  }

  toggleErrorModal = () => {
    this.setState({visibleErrorModal: !this.state.visibleErrorModal})
  }

  renderNotifications() {
    const {notifications = {}} = this.props

    return (
        <View style={styles.notificationContainer}>
          <Text style={styles.sectionTitle}>
            {I18n.t('settingsScreen.notifications')}:
          </Text>

          <View style={styles.switchContainer}>
            <Text style={styles.label}>{I18n.t('settingsScreen.notifAttend')}</Text>
            <Switch onTintColor={Color.NAV_BGCOLOR} value={_.get(notifications, NotificationTypes.EVENT_ATTENDEE, true)}
                    onValueChange={this.onChangeNotification.bind(this, NotificationTypes.EVENT_ATTENDEE)}/>
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>{I18n.t('settingsScreen.activity')}</Text>
            <Switch onTintColor={Color.NAV_BGCOLOR} value={_.get(notifications, NotificationTypes.STATUS_UPDATE, true)}
                    onValueChange={this.onChangeNotification.bind(this, NotificationTypes.STATUS_UPDATE)}/>
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>{I18n.t('settingsScreen.notifFollower')}</Text>
            <Switch onTintColor={Color.NAV_BGCOLOR} value={_.get(notifications, NotificationTypes.NEW_FOLLOWER, true)}
                    onValueChange={this.onChangeNotification.bind(this, NotificationTypes.NEW_FOLLOWER)}/>
          </View>
          <View style={styles.switchContainer}>
            <Text style={styles.label}>{I18n.t('settingsScreen.notifMessage')}</Text>
            <Switch onTintColor={Color.NAV_BGCOLOR} value={_.get(notifications, NotificationTypes.NEW_MESSAGE, true)}
                    onValueChange={this.onChangeNotification.bind(this, NotificationTypes.NEW_MESSAGE)}/>
          </View>
        </View>
    )
  }

  renderPasswordForm() {
    const hasPassword = Auth.getUser().providerData[0].providerId === 'password'

    if (!hasPassword) {
      return null
    }

    const wrongPassword = this.props.passwordUpdateError ?
        this.props.passwordUpdateError.code === 'auth/wrong-password' : false


    return (
        <View>
          <EditProfileFloatingLabelInput
              inputStyle={styles.disabledInput}
              editable={false}
              placeholder={this.props.currentUser.email}/>
          <EditProfileFloatingLabelInput
              value={this.state.currentPassword}
              containerStyle={styles.input}
              onChangeText={this.onChangePassword.bind(this, 'currentPassword')}
              secureTextEntry={true}
              placeholder={I18n.t('settingsScreen.currentPass')}/>
          <EditProfileFloatingLabelInput
              value={this.state.newPassword}
              containerStyle={styles.input}
              onChangeText={this.onChangePassword.bind(this, 'newPassword')}
              secureTextEntry={true}
              placeholderLabel={I18n.t('settingsScreen.passwordHint')}
              placeholder={I18n.t('settingsScreen.newPass')}/>
          <View style={styles.btnPassContainer}>
            <Button
                loading={this.props.isUpdatingPassword}
                disabled={!this.state.isValidPassword}
                onPress={this.onPressUpdatePassword}
                label={I18n.t('settingsScreen.updatePass')}/>
            {wrongPassword && <Text style={styles.passErrorLabel}>{I18n.t('settingsScreen.passError')}</Text>}
          </View>
        </View>
    )
  }

  render() {
    return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            {this.renderPasswordForm()}
            {this.renderNotifications()}
          </ScrollView>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.CONTRAST_COLOR,
  },
  scrollView: {
    paddingHorizontal: 22.5,
  },
  input: {
    marginTop: 2,
  },
  disabledInput: {
    color: Color.GREYISH_BROWN,
    marginTop: 10,
  },

  sectionTitle: {
    color: Color.DARK_TEXT_COLOR,
    fontSize: 17.5,
    ...Font.FONT_BOLD,
    marginBottom: 20,
    marginLeft: 10,
  },
  notificationContainer: {
    marginTop: 34,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    color: Color.DARK_TEXT_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 14,
    marginLeft: 20,
  },
  btnPassContainer: {
    marginTop: 30,
  },

  //Errors
  passErrorLabel: {
    color: Color.TOMATO,
    ...Font.FONT_BOLD,
    fontSize: 15,
    marginTop: 10,
  },
})
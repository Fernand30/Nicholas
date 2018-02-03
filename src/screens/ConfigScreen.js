import React, {Component} from 'react'
import {
  View,
  Image,
  StyleSheet,
  ScrollView,
  Text,
} from 'react-native'
import ActionSheet from 'react-native-actionsheet'
import {ImageCache} from 'react-native-img-cache'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import I18n from '../i18n'
import * as Font from '../constants/Font'
import Avatar from '../components/Avatar'
import Divider from '../components/Divider'
import ButtonNavigate from '../components/ButtonNavigate'
import {connect} from 'react-redux'
import {signOut} from '../redux/actions/auth'
import {reduxPersist} from '../Root'

@connect((state, ownProps) => ConfigScreen.getStateProps(state, ownProps))
export default class ConfigScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('configScreen.title'),
    headerLeft: <NavBackButton/>,
  })

  static getStateProps(state) {
    return {
      profile: state.currentUser.profile,
    }
  }

  state = {
    profile_img: this.props.profile.profile_img,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.profile.profile_img !== nextProps.profile.profile_img && nextProps.profile.profile_img) {
      this.setState({profile_img: nextProps.profile.profile_img})
    }
  }

  onPressLogOut = () => {
    this.refs.logoutActionSheet.show()
  }

  onPressLogoutAction = (index) => {
    if (index === 0) {
      this.props.dispatch(signOut())
      reduxPersist.purge()
      ImageCache.get().clear()
    }
  }

  onPressProfileEdit = () => {
    this.props.navigation.navigate('ProfileEdit')
  }

  onPressPayment = () => {
    this.props.navigation.navigate('Payment')
  }

  onPressSettings = () => {
    this.props.navigation.navigate('Settings')
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <ButtonNavigate onPress={this.onPressProfileEdit}>
            <Avatar
              size={22}
              containerStyle={styles.avatar}
              source={{uri: this.state.profile_img}}/>
            <Text style={styles.buttonLabel}>
              {I18n.t('configScreen.editProfile')}
            </Text>
          </ButtonNavigate>
          <Divider/>
          <ButtonNavigate onPress={this.onPressSettings}>
            <Image style={styles.rightIcon} source={require('../../assets/Images_Icons/config_setting.png')} />
            <Text style={styles.buttonLabel}>{
              I18n.t('configScreen.editSettings')}
            </Text>
          </ButtonNavigate>
          <Divider/>
          {/*<ButtonNavigate onPress={this.onPressPayment}>
            <Text style={styles.buttonLabel}>
              {I18n.t('configScreen.payment')}
            </Text>
          </ButtonNavigate>
          <Divider/>*/}
          <ButtonNavigate>
            <Image style={styles.rightIcon} source={require('../../assets/Images_Icons/config_help.png')} />
            <Text style={styles.buttonLabel}>
              {I18n.t('configScreen.help')}
            </Text>
          </ButtonNavigate>
          <Divider/>
          <ButtonNavigate>
            <Image style={styles.rightIcon} source={require('../../assets/Images_Icons/config_terms.png')} />
            <Text style={styles.buttonLabel}>
              {I18n.t('configScreen.terms')}
            </Text>
          </ButtonNavigate>
          <Divider/>
          <ButtonNavigate onPress={this.onPressLogOut}>
            <Image style={styles.rightIcon} source={require('../../assets/Images_Icons/config_user.png')} />
            <Text style={[styles.buttonLabel]}>
              {I18n.t('configScreen.privateaccount')}
            </Text>
          </ButtonNavigate>
          <Divider/>
          <ButtonNavigate onPress={this.onPressLogOut}>
            <Image style={styles.rightIcon} source={require('../../assets/Images_Icons/config_logout.png')} />
            <Text style={[styles.buttonLabel]}>
              {I18n.t('configScreen.logout')}
            </Text>
          </ButtonNavigate>
          <Divider/>
        </ScrollView>
        <ActionSheet
          ref="logoutActionSheet"
          title={I18n.t('configScreen.confirmLogout')}
          options={[I18n.t('configScreen.logout'), I18n.t('cancel')]}
          cancelButtonIndex={1}
          onPress={this.onPressLogoutAction}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.CONTRAST_COLOR,
  },
  avatar: {
    marginRight: 24,
  },
  rightIcon: {
    marginRight: 24,
  },
  buttonLabelLogout: {
    color: Color.WARM_GREY,
  },
  buttonLabel: {
    color: Color.INFO_COLOR,
    ...Font.FONT_MEDIUM,
    fontSize: 16,
    letterSpacing: 0.6,
  },
})
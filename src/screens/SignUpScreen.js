import React, {Component} from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  ImageBackground
} from 'react-native'
import I18n from '../i18n'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import * as Font from '../constants/Font'
import * as Style from '../constants/Style'
import _ from 'lodash'
import moment from 'moment'
import MessageModal from '../components/MessageModal'
import {SIGNUP_VALIDATION_SCHEMA, SIGNUP_PHONE_VALIDATION_SCHEMA} from '../constants/ValidationSchemas'
import FloatLabelTextField from '../components/FloatLabelTextField/index'
import SignUpSegmentedControl from '../components/SignUpSegmentedControl'
import Auth from '../utils/Auth'
import DateTimePicker from '../components/DateTimePicker'
import {updateProfile} from '../redux/actions/currentUser'
import {connect} from 'react-redux'
import {NavigationActions} from 'react-navigation'
import PhoneInput from 'react-native-phone-input'
// https://www.apple.com/legal/internet-services/itunes/us/terms.html
const MAX_DATE = moment().subtract(13, 'years').toDate()

const input = (props, key, index) => {
  const containerStyle = [styles.inputContainer]

  if (index > 0) {
    containerStyle.push(styles.inputFirst)
  }

  return (
      <View style={containerStyle} key={key}>
        <FloatLabelTextField {...props} key={key}/>
      </View>
  )
}

@connect(() => ({}))
export default class SignUpScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    // title: I18n.t('signUpScreen.headerTitle'),
    // headerLeft: <NavBackButton navigation={navigation}
    //                            hidden={navigation.state.params &&
    //                            navigation.state.params.pushing}/>,
    header: false,

  })

  state = {
    form: {
      first_name: null,
      last_name: null,
      email: null,
      phoneNum: null,
      password: null,
      is_PhoneNum: false,
      is_verified: false,
    },
    displayDatePicker: false,
    pushing: false,
    error: false,
  }

  createAccount = (validForm) => {
      const {dispatch} = this.props
      this.props.navigation.setParams({pushing: true,})
      this.setState({pushing: true})

      return Auth
          .createAccountWithCredentials(validForm.email, validForm.password)
          .then(() => {
            try {

              const user = _.omit(validForm, ['password', 'email'])
              // alert(JSON.stringify(user))
              dispatch(updateProfile(user))
            } catch (ex) {
              console.log(ex)
            }
          })
          .catch(this.handleError)
  }

  handleError = (error) => {
    this.props.navigation.setParams({pushing: false,})

    let message = null
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = I18n.t('signUpScreen.existingAccount', {email: this.state.form.email})
        break
      case 'auth/weak-password':
        message = I18n.t('signUpScreen.weakPassword')
        break
      default:
        message = I18n.t('genericErrorMessage')
    }
    this.setState({error: true, errorMessage: message, pushing: false,})
  }

  onPressSignUp = () => {
      // alert('email')
      // alert('email = '+JSON.stringify(SIGNUP_PHONE_VALIDATION_SCHEMA.validate(this.state.form)))
      SIGNUP_VALIDATION_SCHEMA.validate(this.state.form)
          .then(this.createAccount)
          .catch((err) => {
            this.setState({
              error: true,
              errorMessage: I18n.t('signUpScreen.modalErrorMsg'),
              pushing: false,
            })
          })
  }

  onPressHideModal = () => {
    this.setState({modalVisible: false}, () => {
      this.props.navigation.dispatch(NavigationActions.back())
    })
  }

  onPressTogglePro = () => {
    this.setState({form: {...this.state.form, is_PhoneNum: !this.state.form.is_PhoneNum}})
  }

  onPressDismissErrorModal = () => {
    this.setState({error: false})
  }

  onToggleDatePicker = () => {
    this.setState({
      displayDatePicker: !this.state.displayDatePicker,
    })
  }

  onSetBirthDate = (birth_date) => {
    this.setState({
      form: {...this.state.form, birth_date: birth_date.getTime()},
    })
  }

  renderErrorModal() {
    if (this.state.error === false) {
      return null
    }
    return (
        <MessageModal
            visible={this.state.error}
            dismissLabel={I18n.t('signUpScreen.modalErrorButton')}
            dismissPress={this.onPressDismissErrorModal}>
          <Text style={styles.errorMessage}>{this.state.errorMessage}</Text>
        </MessageModal>
    )
  }

  renderSegment() {
    const {form: {is_PhoneNum}, pushing} = this.state

    return (
        <View style={styles.segmentedContainer}>
          <SignUpSegmentedControl
              values={[I18n.t('signUpScreen.tapEmail'), I18n.t('signUpScreen.tapPhoneNum')]}
              selectedIndex={is_PhoneNum === true ? 1 : 0}
              disabled={pushing}
              onChange={this.onPressTogglePro}
              buttonStyle={styles.segmentedControl}
          />
        </View>
    )
  }

  renderForm() {
    const {form, form: {birth_date}, pushing} = this.state


    const fields = [
      {
        id: 'first_name',
        placeholder: I18n.t('signUpScreen.first_name'),
        maxLength: 35,
        paddingHorizontal: 30,
        onChangeText: first_name => this.setState(
            {form: {...form, first_name}}),
      },
      {
        id: 'last_name',
        placeholder: I18n.t('signUpScreen.last_name'),
        maxLength: 35,
        paddingHorizontal: 30,
        onChangeText: last_name => this.setState({form: {...form, last_name}}),
      },
      {
        is_PhoneNum: false,
        id: 'email',
        placeholder: I18n.t('signUpScreen.email'),
        autoCapitalize: 'none',
        autoCorrect: false,
        maxLength: 35,
        paddingHorizontal: 24,
        onChangeText: email => this.setState({form: {...form, email}}),
      },
      {

        is_PhoneNum: false,
        id: 'password',
        secureTextEntry: true,
        maxLength: 35,
        paddingHorizontal: 24,
        placeholder: I18n.t('signUpScreen.password'),
        placeholderLabel: I18n.t('signUpScreen.passwordHint'),
        onChangeText: password => this.setState({form: {...form, password}}),
      },
    ]

    return (
        <View style={styles.formContainer}>
          {fields.filter(f => f.is_PhoneNum === undefined || f.is_PhoneNum === form.is_PhoneNum)
              .map((props, index) => {
                return input({
                  ...props,
                  editable: !pushing,
                }, props.id, index)
              })}

        </View>
    )
  }

  render() {
    const {pushing} = this.state
    const label = <Text
        style={[Style.PRIMARY_BUTTON_LABEL, styles.submitLabel]}>{I18n.t(
        'signUpScreen.submit')}</Text>
    const body = pushing ?
        <ActivityIndicator size="small" color="white"/> :
        label
    const {form: {is_PhoneNum}} = this.state

    return (
        <ImageBackground source={require('../../assets/Images_Icons/bg.png')} style={styles.container}>
          <KeyboardAvoidingView keyboardVerticalOffset={20} behavior="padding"
                                style={styles.keyboardAvoidingView}>
            {this.renderErrorModal()}

            <ScrollView>
              <View style={styles.logoContainer}>
                <Image source={require('../../assets/Images_Icons/logo_signup.png')}/>
              </View>

              <Text style={styles.title}>{I18n.t('signUpScreen.headerTitle')}</Text>
              {/* {this.renderSegment()} */}
              {this.renderForm()}
            </ScrollView>
          </KeyboardAvoidingView>
            <TouchableOpacity
                style={[styles.signupButton]}
                onPress={this.onPressSignUp}
                // onPress={is_PhoneNum === true ? this.onPressPhoneSignUp : this.onPressSignUp}

                activeOpacity={pushing ? 1 : 0.7}>
              <Image source={require('../../assets/Images_Icons/btn_signup.png')}/>
            </TouchableOpacity>

          <TouchableOpacity onPress={this.onPressHideModal}>
              <Text style={styles.buttonResetLabel}>{I18n.t('signUpScreen.backtologin')}</Text>
          </TouchableOpacity>
        </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 45,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 74,
    marginBottom: 10,
  },
  shadowTitle: {
    ...Font.FONT_BOLD_ITALIC,
    position: 'absolute',
    top: 10,
    left: -10,
    width: 900,
    backgroundColor: 'transparent',
    fontSize: 75,
    letterSpacing: -3,
    color: Color.CONTRAST_COLOR,
    opacity: 0.4,
  },
  title: {
    ...Font.FONT_BOLD,
    backgroundColor: 'transparent',
    fontSize: 25,
    color: Color.CONTRAST_COLOR,
    alignSelf:'center',
    marginTop: 10,
    marginBottom: 25,
  },
  buttonResetLabel: {
    backgroundColor: Color.TRANSPARENT,
    color: Color.CONTRAST_COLOR,
    marginTop: 21.5,
    ...Font.FONT_MEDIUM,
    fontSize: 19,
    textAlign: 'center',
  },
  segmentedContainer: {
    paddingHorizontal: 25.5,
    marginBottom: 12,
  },
  segmentedControl: {
    paddingVertical: 8,
  },
  formContainer: {
    paddingHorizontal: 34,
  },
  inputContainer: {
    backgroundColor: Color.TXT_BOX,
    height: 58,
    alignSelf: 'stretch',
    borderRadius: 6,
  },
  inputFirst: {
    marginTop: 12,
  },
  input: {
    color: '#FFF',
    fontSize: 20,
    marginTop: 30,
    height: 60,
    ...Font.FONT_BOLD,
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  signupButton: {
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',

  },
  submitButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    height: 44,
  },
  submitLabel: {
    fontSize: 20,
  },
  errorMessage: {
    textAlign: 'center',
  },
  modalContent: {
    backgroundColor: Color.CONTRAST_COLOR,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 15,
  },
  modalTitle: {
    ...Font.FONT_BOLD,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    borderRadius: 2.5,
    marginHorizontal: 30,
    marginVertical: 20,
  },
})

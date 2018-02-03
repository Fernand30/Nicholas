import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Text,
  StatusBar,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Animated,
  ImageBackground
} from 'react-native'
import I18n from '../i18n'
import InputGroup from '../components/InputGroup'
import * as Font from '../constants/Font'
import * as Color from '../constants/Color'
import Icon from 'react-native-vector-icons/FontAwesome'
import {LOGIN_VALIDATION_SCHEMA} from '../constants/ValidationSchemas'
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from 'react-native-fbsdk'
import GoogleSignIn from 'react-native-google-sign-in'
import Auth from '../utils/Auth'
import {updateProfile} from '../redux/actions/currentUser'
import {chatApi} from '../redux/actions/currentUser'
import {connect} from 'react-redux'

const FACEBOOK_PERMISSIONS = ['public_profile', 'email', 'user_friends', 'user_location', 'user_work_history']

@connect(() => ({}))
export default class LoginScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    header: null,
  })

  state = {
    fadeAnim: new Animated.Value(0),  // Initial value for opacity: 0
    email: null,
    password: null,
    error: false,
    showPass: false,
    signingWithCredentials: false,
    signingWithSocial: false,
    fetchingFbToken: false,
    fetchingGoogleToken: false,
  }

  constructor(props) {
    super(props)
    this.loginWithGoogle = this.loginWithGoogle.bind(this)
  }

  componentDidMount() {
    Animated.timing(                  // Animate over time
      this.state.fadeAnim,            // The animated value to drive
      {
        toValue: 1,                   // Animate to opacity: 1 (opaque)
        duration: 1000,              // Make it take a while
      },
    ).start()                        // Starts the animation
  }

  onPressTogglePass = () => {
    this.setState({showPass: !this.state.showPass})
  }

  onPressLogin = () => {
    
     const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
     if (reg.test(this.state.email) === true){
         this.loginWithCredentials(this.state.email, this.state.password)
     }
     else{
         alert('Please insert valid email');
     }
    
  }

  onPressFacebookLogin = () => {
    this.toggleFacebookLoading()
    LoginManager.logInWithReadPermissions(FACEBOOK_PERMISSIONS)
      .then(result => {
          if (!result.isCancelled) {
            AccessToken
              .getCurrentAccessToken()
              .then(data => {
                return Auth
                  .signInWithFacebook(data.accessToken.toString())
                  .then(() => {
                    this.updateProfileWithFb(data.accessToken.toString())
                  })
                  .catch(this.handleLoginError)
                  .then(this.toggleFacebookLoading)
              })
              .catch(this.toggleFacebookLoading)
          } else {
            this.toggleFacebookLoading()
          }
        }
      )
      .catch(this.handleLoginError)
  }

  onPressGoogleLogin = () => {
    this.toggleGoogleLoading()
    GoogleSignIn.configure({
        // iOS
        clientID: '513959138340-9gkkbpviahfki93kdobmmkjanva3p6p8.apps.googleusercontent.com',
        shouldFetchBasicProfile: true,
        // iOS, Android
        //@todo ADD this https://console.firebase.google.com/project/wattz-demo/authentication/providers
        serverClientID: '513959138340-19mrne6dlaru43mbbh151hupe3htjn0m.apps.googleusercontent.com',
        // Android
        // Whether to request server auth code. Make sure to provide `serverClientID`.
        offlineAccess: false,
        // iOS, Android
        hostedDomain: '',
      })
      .then(this.loginWithGoogle)
      .catch(error => {
        if (error.description.indexOf('canceled') === -1) {
          this.handleLoginError(error)
        }
      })
      .then(this.toggleGoogleLoading)
  }

  onPressSignUp = () => {
    this.props.navigation.navigate('SignUp')
  }

  onPressSignInPhoneNumber = () => {
    this.props.navigation.navigate('PhoneAuth')
  }

  onPressRecoverPass = () => {
    this.props.navigation.navigate('RecoverPassword')
  }

  loginWithGoogle = () => {
    const {dispatch} = this.props
    return GoogleSignIn.signInPromise().then(user => {
      Auth
        .signInWithGoogle(user.idToken)
        .then(() => {
          const profile = {
            last_name: user.familyName,
            first_name: user.givenName,
          }

          if (user.photoUrl640) {
            profile['profile_img'] = user.photoUrl640
          } else if (user.photoUrlTiny) {
            profile['profile_img'] = user.photoUrlTiny
          }

          dispatch(updateProfile(profile))
        })
        .catch(this.handleLoginError)
    })
  }

  loginWithCredentials(email, pass) {

    this.toggleCredentialsLoading()
    that  = this
    chatApi(email,pass).then((responsive)=>{
      that.toggleCredentialsLoading()
      if(responsive.status=='200'){
        client = responsive.headers.map.client
        uid = responsive.headers.map.uid
        access_token = responsive.headers.map['access-token']
       
        this.props.navigation.navigate('TabsNavigator',{client:client,access_token: access_token,uid: uid})
      }else{
        alert('Please try again')
      }
    }).catch(function(err){
      alert(err)
      that.toggleCredentialsLoading()
    })
  }

  handleLoginError = error => {
    let title = null
    let message = null
    switch (error.code) {
      case 'auth/account-exists-with-different-credential':
        message = error.message
        break
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        title = I18n.t('loginScreen.error')
        message = I18n.t('loginScreen.invalidPassword')
        break
      case 'auth/user-disabled':
        title = I18n.t('loginScreen.disabledAccount')
        message = I18n.t('loginScreen.disabledAccountMsg')
        break
      default:
        title = I18n.t('loginScreen.error')
        message = I18n.t('loginScreen.contactSupport')
        console.error(error)
    }

    Alert.alert(title, message)
  }

  graphRequestCallback = (error: ?Object, result: ?Object) => {
    if (error) {
      //@todo Log
      return false
    }

    const profile = {
      first_name: result.first_name,
      last_name: result.last_name,
      display_name: `${result.first_name} ${result.last_name}`,
    }

    if (result.picture) {
      profile['profile_img'] = result.picture.data.url
    }
    if (result.cover) {
      profile['cover_img'] = result.cover.source
    }
    if (result.location) {
      profile['city'] = result.location.name
    }
    if (result.work && result.work.length > 0) {
      profile['occupation'] = result.work[0].position.name
    }

    this.props.dispatch(updateProfile(profile))
  }

  updateProfileWithFb(accessToken) {
    const infoRequest = new GraphRequest(
      '/me',
      {
        accessToken,
        parameters: {
          fields: {
            string: 'id,picture.type(large),cover{source},first_name,last_name,location,work',
          },
        },
      },
      this.graphRequestCallback,
    )
    // Start the graph request.
    new GraphRequestManager().addRequest(infoRequest).start()
  }

  toggleCredentialsLoading = () => {
    this.setState({
      signingWithCredentials: !this.state.signingWithCredentials,
    })
  }

  toggleFacebookLoading = () => {
    this.setState({
      fetchingFbToken: !this.state.fetchingFbToken,
      signingWithSocial: !this.state.signingWithSocial,
    })
  }

  toggleGoogleLoading = () => {
    this.setState({
      fetchingGoogleToken: !this.state.fetchingGoogleToken,
      signingWithSocial: !this.state.signingWithSocial,
    })
  }

  renderPassButtons() {
    const icon = this.state.showPass ?
      require('../../assets/icons/icVisible.png') :
      require('../../assets/icons/icNovisible.png')
    const toggleStyle = [styles.button]
    const toggleLabelStyle = [styles.buttonLabel]

    if (this.state.showPass) {
      toggleStyle.push(styles.buttonPassToggle)
      toggleLabelStyle.push(styles.buttonPassToggleLabel)
    }

    return (
        <TouchableOpacity style={[styles.button, styles.buttonRecover]}
                          onPress={this.onPressRecoverPass}>
          <Text style={styles.buttonLabel}>{I18n.t('loginScreen.recover')}</Text>
        </TouchableOpacity>
    )
  }

  render() {
    const {fadeAnim, showPass, signingWithSocial, signingWithCredentials} = this.state
    const emailIcon = <Image
      source={require('../../assets/icons/icEmail.png')}/>
    const passIcon = <Image
      source={require('../../assets/icons/icPassword.png')}/>
    const Touchable = signingWithSocial || signingWithCredentials ?
      View :
      TouchableOpacity

    return (
      <ImageBackground source={require('../../assets/Images_Icons/bg.png')} style={styles.container}>

        <StatusBar hidden={false} animated={true}
                   barStyle="light-content"/>
        <Animated.View                 // Special animatable View
          style={{
            flex: 1,
            opacity: fadeAnim,         // Bind opacity to animated value
          }}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.logoContainer}>
              <Image source={require('../../assets/Images_Icons/logo.png')}/>
            </View>

            <Text style = {{...Font.FONT_BOLD,fontSize:28,backgroundColor:'transparent',color:'white',textAlign:'center', marginBottom: 24}}>Get Started !</Text>

            <InputGroup
              editable={!signingWithSocial}

              style={styles.input}
              placeholderTextColor="white"
              autoCapitalize="none"
              placeholder={I18n.t('loginScreen.email')}
              keyboardType="email-address"
              onChangeText={(email) => this.setState({email})}
            />

            <InputGroup
              containerStyle={styles.passwordInput}
              editable={!signingWithSocial}
              style={styles.input}
              secureTextEntry={!showPass}
              placeholderTextColor="white"
              placeholder={I18n.t('loginScreen.password')}
              onChangeText={(password) => this.setState({password})}
            />


            <Touchable style={styles.buttonLogin} onPress={this.onPressLogin}>
              <Image source={require('../../assets/Images_Icons/btn_signin.png')}/>
              {signingWithCredentials &&
              <ActivityIndicator size="large" color="white" style={styles.credentialsActivity}/>}
            </Touchable>
            

            <Touchable onPress={this.onPressSignUp}>
              <Text style={styles.buttonSignUpLabel}>{I18n.t('loginScreen.signUp')}</Text>
            </Touchable>

            {this.renderPassButtons()}

          </ScrollView>
        </Animated.View>
      </ImageBackground>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    paddingHorizontal: 34,

  },
  backgroundImg: {
    position: 'absolute',
    left: 0,
    top: 140,
    height: Dimensions.get('window').height - 140,
    width: Dimensions.get('window').width,
    resizeMode: 'stretch',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 60,
  },
  inputIcon: {
    borderRightWidth: 1,
    borderRightColor: Color.CONTRAST_COLOR,
  },
  buttonLogin: {
    backgroundColor: Color.TRANSPARENT,
    marginTop: 20,
    alignItems: 'center'
  },
  buttonLoginLabel: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 15,
    textAlign: 'center',
  },
  credentialsActivity: {
    position: 'absolute',
    top: 10,
    alignItems: 'center',
  },
  passButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: Color.CONTRAST_COLOR,
    borderRadius: 2.5,
    paddingVertical: 4.5,
  },
  buttonLabel: {
    backgroundColor: Color.TRANSPARENT,
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_MEDIUM,
    fontSize: 19,
    textAlign: 'center',
  },
  buttonRecover: {
    marginTop: 9.5,
    borderColor: Color.TRANSPARENT,
  },
  buttonPassToggle: {
    backgroundColor: Color.CONTRAST_COLOR,
  },
  buttonPassToggleLabel: {
    color: 'black',
  },
  passwordIcon: {
    marginRight: 10.2,
  },
  input: {
    backgroundColor: Color.TXT_BOX,
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 18,
    textAlign: 'left',
    flex: 1,
  },
  passwordInput: {
    marginTop: 10,
  },
  socialContainer: {
    marginTop: 58,
  },
  buttonSocial: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonSocialLabel: {
    flex: 1,
  },
  buttonSocialIcon: {
    borderRightWidth: 0.5,
    width: 40,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonFacebook: {
    backgroundColor: '#3D5A96',
    borderRadius: 2.5,
  },
  buttonGoogle: {
    marginTop: 15,
    backgroundColor: '#CA3937',
    borderRadius: 2.5,
  },
  buttonSignUpLabel: {
    backgroundColor: Color.TRANSPARENT,
    color: Color.CONTRAST_COLOR,
    marginTop: 15.5,
    ...Font.FONT_MEDIUM,
    fontSize: 19,
    textAlign: 'center',
  },

  message: {
    color: 'green',
    fontWeight: '500',
    marginTop: 100,
    textAlign: 'center',
  },
  error: {
    color: 'red',
    fontWeight: '500',
    marginTop: 100,
    textAlign: 'center',
  },
})

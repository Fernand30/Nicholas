import React, { Component } from 'react';
import {
  View,
  StyleSheet,
  Button,
  Text,
  TextInput,
  Image,
  ImageBackground,
  TouchableOpacity,
 } from 'react-native';

import firebase from 'react-native-firebase'
import Auth from '../utils/Auth'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'
import {connect} from 'react-redux'
import InputGroup from '../components/InputGroup'
import {NavigationActions} from 'react-navigation'
import {updatePhoneProfile, updateProfile, setCurrentUser} from '../redux/actions/currentUser'

const successImageUri = 'https://cdn.pixabay.com/photo/2015/06/09/16/12/icon-803718_1280.png';

@connect(() => ({}))
export default class PhoneAuthScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    header: false,

  })

  constructor(props) {
    super(props);
    this.unsubscribe = null;
    this.state = {
      user: null,
      message: '',
      codeInput: '',
      first_name: '',
      last_name: '',
      phoneNumber: '+86',
      confirmResult: null,
    };
  }

  componentDidMount() {
    this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.setState({ user: user.toJSON() });
      } else {
        // User has been signed out, reset the state
        this.setState({
          user: null,
          message: '',
          codeInput: '',
          first_name: '',
          last_name: '',
          phoneNumber: '+86',
          confirmResult: null,
        });
      }
    });
  }

  componentWillUnmount() {
     if (this.unsubscribe) this.unsubscribe();
  }

  signIn = () => {
    // var appVerifier = window.recaptchaVerifier;
    const { phoneNumber } = this.state;
    this.setState({ message: 'Sending code ...' });

    Auth.createAccountWithPhoneNum(phoneNumber)
    // firebase.auth().signInWithPhoneNumber(phoneNumber)
      .then(confirmResult => this.setState({ confirmResult, message: 'Code has been sent!' }))
      .catch(error => this.setState({ message: `Sign In With Phone Number Error: ${error.message}` }));
  };

  confirmCode = () => {
    const { codeInput, confirmResult } = this.state;
    if (confirmResult && codeInput.length) {
      confirmResult.confirm(codeInput)
        .then((user) => {
          this.setState({ message: 'Code Confirmed!', user: user });
        })
        .catch(error => this.setState({ message: `Code Confirm Error: ${error.message}` }));
    }
  };

  signInNext = () => {
    const {dispatch} = this.props
    const { first_name, last_name } = this.state
    const form = {
      first_name: first_name,
      last_name: last_name,
      phoneNum: null,
      is_PhoneNum: false,
      is_verified: false,
    }
    // alert(this.state.user.uid)
      try {
        // this.props.dispatch(setCurrentUser(this.state.user))
        this.props.dispatch(updatePhoneProfile(form, this.state.user.uid))

      } catch (ex) {
        alert(ex)
        console.log(ex)
      }
  };

  signOut = () => {
    firebase.auth().signOut();
  }

  renderPhoneNumberInput() {
   const { phoneNumber } = this.state;

    return (
      <ImageBackground source={require('../../assets/Images_Icons/bg.png')} style={styles.container}>
      {/* <View style={{ padding: 25 }}> */}
        <Text style={styles.buttonSignUpLabel}>Enter phone number:</Text>
        {/* <TextInput
          autoFocus
          style={{ backgroundColor: 'white', height: 40, marginTop: 15, marginBottom: 15 }}
          onChangeText={value => this.setState({ phoneNumber: value })}
          placeholder={'Phone number ... '}
          value={phoneNumber}
        /> */}
        <InputGroup
          containerStyle={styles.passwordInput}
          style={styles.input}
          placeholderTextColor="white"
          placeholder={'Phone number ... '}
          onChangeText={value => this.setState({ phoneNumber: value })}
          value={phoneNumber}
        />



        <TouchableOpacity style={styles.buttonLogin} onPress={this.signIn}>
          <Image source={require('../../assets/Images_Icons/btn_signin.png')}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressHideModal}>
            <Text style={styles.buttonResetLabel}>Back to login</Text>
        </TouchableOpacity>
        {/* <Button title="Sign In" color="green" onPress={this.signIn} /> */}
      </ImageBackground>
    );
  }

  onPressHideModal = () => {
    this.setState({modalVisible: false}, () => {
      this.props.navigation.dispatch(NavigationActions.back())
    })
  }

  renderMessage() {
    const { message } = this.state;

    if (!!message.length) return null;

    return (
      <Text style={{ padding: 15, backgroundColor: '#000', color: '#fff' }}>{message}</Text>
    );
  }

  renderVerificationCodeInput() {
    const { codeInput } = this.state;

    return (
      <ImageBackground source={require('../../assets/Images_Icons/bg.png')} style={styles.container}>
        <Text style={styles.buttonSignUpLabel}>Enter verification code below:</Text>
        {/* <TextInput
          autoFocus
          style={{ height: 40, marginTop: 15, marginBottom: 15 }}
          onChangeText={value => this.setState({ codeInput: value })}
          placeholder={'Code ... '}
          value={codeInput}
        /> */}

        <InputGroup
          autoFocus
          containerStyle={styles.passwordInput}
          style={styles.input}
          placeholderTextColor="white"
          placeholder={'Code ... '}
          onChangeText={value => this.setState({ codeInput: value })}
          value={codeInput}
        />

        <TouchableOpacity style={styles.buttonLogin} onPress={this.confirmCode}>
          <Image source={require('../../assets/Images_Icons/btn_confirmcode.png')}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={this.onPressHideModal}>
            <Text style={styles.buttonResetLabel}>Back to login</Text>
        </TouchableOpacity>
        {/* <Button title="Confirm Code" color="#841584" onPress={this.confirmCode} /> */}

    </ImageBackground>
    );
  }

  render() {
    const { user, confirmResult } = this.state;

    return (
      <View style={{ flex: 1 }}>

        {!user && !confirmResult && this.renderPhoneNumberInput()}

        {/* {this.renderMessage()} */}

        {!user && confirmResult && this.renderVerificationCodeInput()}

        {user && (
          <ImageBackground source={require('../../assets/Images_Icons/bg.png')} style={styles.container}>
            <Text style={styles.buttonSignUpLabel}>Enter First Name and Last:</Text>
            <InputGroup
              autoFocus
              containerStyle={styles.passwordInput}
              style={styles.input}
              placeholderTextColor="white"
              placeholder={'First Name'}
              onChangeText={value => this.setState({ first_name: value })}
            />
            <InputGroup
              autoFocus
              containerStyle={styles.passwordInput}
              style={styles.input}
              placeholderTextColor="white"
              placeholder={'Last Name'}
              onChangeText={value => this.setState({ last_name: value })}
            />
            <Text>{JSON.stringify(user)}</Text>
            <TouchableOpacity style={styles.buttonLogin} onPress={this.signInNext}>
              <Image source={require('../../assets/Images_Icons/btn_signin.png')}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={this.signOut}>
                <Text style={styles.buttonResetLabel}>Cancel</Text>
            </TouchableOpacity>
            {/* <Button title="Sign Out" color="red" onPress={this.signOut} /> */}
          </ImageBackground>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
  },

  buttonLogin: {
    backgroundColor: Color.TRANSPARENT,
    marginTop: 50,
    alignItems: 'center'
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
  buttonSignUpLabel: {
    backgroundColor: Color.TRANSPARENT,
    color: Color.CONTRAST_COLOR,
    marginTop: 31.5,
    ...Font.FONT_MEDIUM,
    fontSize: 19,
    // textAlign: 'center',
  },
  buttonResetLabel: {
    backgroundColor: Color.TRANSPARENT,
    color: Color.CONTRAST_COLOR,
    marginTop: 21.5,
    ...Font.FONT_MEDIUM,
    fontSize: 19,
    textAlign: 'center',
  },

})

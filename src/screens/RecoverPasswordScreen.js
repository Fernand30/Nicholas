import React, {Component} from 'react'
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  ImageBackground
} from 'react-native'
import I18n from '../i18n'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'
import {isEmail} from '../utils/Validation'
import {NavigationActions} from 'react-navigation'
import NavBackButton from '../components/NavBackButton'
import Firebase from '../utils/Firebase'
import MessageModal from '../components/MessageModal'

export default class RecoverPasswordScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    header: false,
  })

  state = {
    email: '',
    modalVisible: false,
  }

  onPressHideModal = () => {
    this.setState({modalVisible: false}, () => {
      this.props.navigation.dispatch(NavigationActions.back())
    })
  }

  onPressRecover = () => {
    if (isEmail(this.state.email)) {
      Firebase
          .getInstance()
          .auth()
          .sendPasswordResetEmail(this.state.email)
          .catch(this.onError)

      this.setState({
        modalVisible: true,
      })
    }
  }

  onRequestClose = () => {

  }

  onError = (error) => {
    console.log(error)
  }

  render() {
    return (
      <ImageBackground source={require('../../assets/Images_Icons/bg.png')} style={styles.container}>
      
          <MessageModal
              onRequestClose={this.onRequestClose}
              title={I18n.t('recoverPassScreen.modalTitle')}
              visible={this.state.modalVisible}
              dismissLabel={I18n.t('recoverPassScreen.modalButton')}
              dismissPress={this.onPressHideModal}>
            <Text style={styles.modalMessage}>
              {I18n.t('recoverPassScreen.modalMessage1')}
              <Text
                  style={styles.modalMessageHighlight}>{` ${this.state.email.toLocaleLowerCase()}`}</Text>
              {I18n.t('recoverPassScreen.modalMessage2')}
            </Text>
          </MessageModal>

          <KeyboardAvoidingView style={styles.keyboardContainer}
                                behavior="padding" keyboardVerticalOffset={65}>
            <Image source={require('../../assets/Images_Icons/imgPass.png')}/>

            <Text style={styles.mainLabel}>{I18n.t(
                'recoverPassScreen.mainLabel')}</Text>
            <Text style={styles.hint}>{I18n.t('recoverPassScreen.hint')}</Text>

            <View style={styles.inputContainer}>
              <TextInput
                  backgroundColor= {Color.TXT_BOX}

                  autoCapitalize='none'
                  autoCorrect={false}
                  style={styles.input}
                  borderRadius={5}
                  placeholderTextColor={Color.CONTRAST_COLOR}
                  keyboardType="email-address"
                  placeholder={I18n.t('recoverPassScreen.placeholder')}
                  onChangeText={(email) => {
                    this.setState({email})
                  }}/>
            </View>
          </KeyboardAvoidingView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}
                              onPress={this.onPressRecover}>
              <Image source={require('../../assets/Images_Icons/btn_resetpass.png')}/>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.onPressHideModal}>
              <Text style={styles.buttonResetLabel}>{I18n.t('recoverPassScreen.backtologin')}</Text>
            </TouchableOpacity>
          </View>

          

      </ImageBackground>

    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
  },
  keyboardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    paddingTop: 90,
  },
  mainLabel: {
    backgroundColor:Color.TRANSPARENT,
    textAlign: 'center',
    ...Font.FONT_BOLD,
    fontSize: 24,
    color: Color.CONTRAST_COLOR,
    marginTop: 66,
  },
  hint: {
    backgroundColor:Color.TRANSPARENT,
    textAlign: 'center',
    ...Font.FONT_LIGHT,
    fontSize: 15,
    color: Color.CONTRAST_COLOR,
    marginTop: 6,
  },
  inputContainer: {
    alignSelf: 'stretch',
  },
  input: {
    color: '#FFF',
    textAlign: 'left',
    fontSize: 20,
    marginTop: 30,
    height: 60,
    paddingLeft: 30,
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',

  },
  buttonLabel: {
    color: Color.CONTRAST_COLOR,
    textAlign: 'center',
    fontSize: 15,
    ...Font.FONT_LIGHT,
  },

  buttonResetLabel: {
    backgroundColor: Color.TRANSPARENT,
    color: Color.CONTRAST_COLOR,
    marginTop: 21.5,
    ...Font.FONT_MEDIUM,
    fontSize: 19,
    textAlign: 'center',
  },

  modalMessage: {
    marginTop: 20,
    ...Font.FONT_LIGHT,
    textAlign: 'center',
  },
  modalMessageHighlight: {
    ...Font.FONT_BOLD,
  },
})
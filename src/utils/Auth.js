import Firebase from './Firebase'

export default class Auth {

  static getUid(): string {
    return Firebase.getInstance().auth().currentUser.uid
  }

  static getUser() {
    return Firebase.getInstance().auth().currentUser
  }

  static getAuthToken(): Promise {
    return Firebase.getInstance().auth().currentUser.getIdToken()
  }

  static createAccountWithCredentials(email: string, password: string): Promise {
    return Firebase
        .getInstance()
        .auth()
        .createUserWithEmailAndPassword(email, password)
  }

  static createAccountWithPhoneNum(phoneNum: string): Promise {
    Firebase.getInstance().auth().languageCode = 'it';
    window.recaptchaVerifier = Firebase.getInstance().auth.RecaptchaVerifier('recaptcha-container');
    var appVerifier = window.recaptchaVerifier;
    return Firebase
        .getInstance()
        .auth()
        .signInWithPhoneNumber(phoneNum, appVerifier)
  }

  static signInWithCredentials(email: string, password: string): Promise {
    return Firebase.signInWithCredentials(email, password)
  }

  static signInWithFacebook(accessToken: string): Promise {
    return Firebase.signInWithFacebook(accessToken)
  }

  static signInWithGoogle(accessToken: string): Promise {
    return Firebase.signInWithGoogle(accessToken)
  }

}

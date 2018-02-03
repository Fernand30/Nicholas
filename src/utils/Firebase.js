import * as firebase from 'firebase'

export default class Firebase {

  static instance

  static getInstance() {
    return this.instance
  }

  static init(config) {
    if (!this.instance) {
      this.instance = firebase.initializeApp(config)
    }
  }

  static signInWithCredentials(email: string, password: string) {
    return firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
  }

  static signInWithPhoneNumber(phoneNumber: string, appVerifier: string) {
    return firebase
        .auth()
        .signInWithPhoneNumber(phoneNumber, appVerifier)
  }

  static signInWithFacebook(accessToken: string) {
    const credential = firebase.auth.FacebookAuthProvider.credential(accessToken)
    return firebase
        .auth()
        .signInWithCredential(credential)
  }

  static signInWithGoogle(accessToken: string) {
    const credential = firebase.auth.GoogleAuthProvider.credential(accessToken)
    return firebase
        .auth()
        .signInWithCredential(credential)
  }

  static getDbRef(path: string) {
    return firebase.database().ref(path)
  }

  static getStorageRef(path: string) {
    return firebase.storage().ref(path)
  }

  static timestamp() {
    return firebase.database.ServerValue.TIMESTAMP
  }
}

import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native'
import I18n from '../i18n'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'
import {connect} from 'react-redux'
import Button from '../components/Button'
import NavBackButton from '../components/NavBackButton'
import PrimaryButton from '../components/PrimaryButton'
import ImagePicker from 'react-native-image-crop-picker'
import ActionSheet from 'react-native-actionsheet'
import {uploadId} from '../redux/actions/idValidation'
import {NavigationActions} from 'react-navigation'
import {updateIp} from '../redux/actions/currentUser'

@connect((state) => IdUploadScreen.getStateProps(state))
export default class IdUploadScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('idUploadScreen.title'),
    headerLeft: <NavBackButton/>,
  })

  static getStateProps(state, ownProps) {
    return {
      isPushing: state.idValidation.isPushing,
      isSaved: state.idValidation.isSaved,
      hasError: state.idValidation.hasError,
    }
  }

  state = {
    image: null,
  }

  IMAGE_OPTIONS = [
    I18n.t('idUploadScreen.fromCamera'),
    I18n.t('idUploadScreen.fromGallery'),
    I18n.t('idUploadScreen.cancel'),
  ]

  componentWillReceiveProps(nextProps) {
    if (!this.props.isSaved && nextProps.isSaved) {
      this.props.navigation.dispatch(NavigationActions.back())
    }
  }

  onImageCancelled = () => {
  }

  onImageSelected = (image) => {
    this.setState({
      image: {
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
      },
    })
  }

  onPressAction = (index) => {
    switch (index) {
      case 0:
        ImagePicker
            .openCamera({
              width: 1162,
              height: 788,
              cropping: true,
            })
            .then(this.onImageSelected)
            .catch(this.onImageCancelled)
        break
      case 1:
        ImagePicker
            .openPicker({
              width: 1162,
              height: 788,
              cropping: true,
            })
            .then(this.onImageSelected)
            .catch(this.onImageCancelled)
        break
    }
  }

  onPressUpload = () => {
    this.refs.actionSheet.show()
  }

  onPressSend = () => {
    this.props.dispatch(updateIp())
    this.props.dispatch(uploadId(this.state.image))
  }

  render() {
    return (
        <View style={styles.container}>
          <ScrollView>
            <Text style={styles.shadowTitle}>{
              I18n.t('idUploadScreen.title1').toUpperCase()}
            </Text>
            <Text style={styles.title}>{I18n.t('idUploadScreen.title1')
                .toUpperCase()}</Text>
            <View style={styles.innerContainer}>
              <Text style={styles.idValidation}>{I18n.t(
                  'idUploadScreen.idValidation')}</Text>
              <Text style={styles.why}>{I18n.t('idUploadScreen.why')}</Text>
              <Text style={styles.message}>{I18n.t(
                  'idUploadScreen.message')}</Text>

              <Button
                  onPress={this.onPressUpload}
                  label={I18n.t('idUploadScreen.btnTakePic')}
                  style={styles.btnTakePic}
                  renderLeft={<Image
                      style={styles.icon}
                      source={require('../../assets/icons/upload.png')}/>}/>

              {this.state.image && <Image style={styles.image} source={{uri: this.state.image.uri}}/>}

            </View>
          </ScrollView>
          <PrimaryButton
              loading={this.props.isPushing}
              onPress={this.onPressSend}
              disabled={this.state.image === null || this.props.isPushing}
              label={I18n.t('idUploadScreen.btnSend')}/>
          <ActionSheet
              ref="actionSheet"
              title={I18n.t('idUploadScreen.idPhoto')}
              options={this.IMAGE_OPTIONS}
              cancelButtonIndex={2}
              onPress={this.onPressAction}
          />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
  },
  innerContainer: {
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 14.5,

  },
  shadowTitle: {
    ...Font.FONT_BOLD_ITALIC,
    position: 'absolute',
    top: -30,
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
    marginTop: 5,
    marginLeft: 14.5,
    marginBottom: 27.5,
  },
  idValidation: {
    color: Color.TOMATO,
    ...Font.FONT_LIGHT,
    fontSize: 15,
    textAlign: 'center',
  },
  why: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 20,
  },
  message: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 17.5,
    textAlign: 'center',
    marginTop: 41,
    marginHorizontal: 20,
  },
  btnTakePic: {
    marginHorizontal: 20,
    width: 230,
    marginTop: 30,
  },
  btnSend: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  icon: {
    marginHorizontal: 8,
  },
  image: {
    marginTop: 20,
    width: 200,
    height: 136,
  },
})
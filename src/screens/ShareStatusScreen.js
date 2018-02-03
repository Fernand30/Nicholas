import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import NavButton from '../components/NavButton'
import Avatar from '../components/Avatar'
import {connect} from 'react-redux'
import I18n from '../i18n'
import * as Font from '../constants/Font'
import StatusAttatchment from '../components/StatusAttachment'
import ActionSheet from 'react-native-actionsheet'
import ImagePicker from 'react-native-image-crop-picker'
import _ from 'lodash'
import {USER_SOCIAL_STATUS_VALIDATION} from '../constants/ValidationSchemas'
import {publishStatus} from '../redux/actions/feed'
import ActivityOverlay from '../components/ActivityOverlay'
import {navigateBack} from '../redux/actions/nav'

@connect((state, ownProps) => ShareStatusScreen.getStateProps(state, ownProps))
export default class ShareStatusScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('shareStatusScreen.title'),
    headerLeft: <NavBackButton/>,
    headerRight: <NavButton
        disabled={navigation.state.params ? !navigation.state.params.isValid : true}
        onPress={navigation.state.params ? navigation.state.params.onPressPublish : null}
        label={I18n.t('shareStatusScreen.publish')}/>,
  })

  static getStateProps(state) {
    return {
      currentUser: state.currentUser.profile,
      isPublishing: state.feed.isPublishing,
      hasError: state.feed.publishError !== null,
    }
  }

  state = {
    status: null,
    images: [],
  }

  PHOTO_OPTIONS = [
    I18n.t('shareStatusScreen.fromCamera'),
    I18n.t('shareStatusScreen.fromGallery'),
    I18n.t('shareStatusScreen.cancel'),
  ]

  componentDidMount() {
    this.props.navigation.setParams({onPressPublish: this.onPressPublish})
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(this.state, prevState)) {
      USER_SOCIAL_STATUS_VALIDATION.validate(this.state)
          .then(() => {
            this.props.navigation.setParams({isValid: true,})
          })
          .catch(() => {
            this.props.navigation.setParams({isValid: false,})
          })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPublishing !== nextProps.isPublishing) {
      this.props.navigation.setParams({isPublishing: nextProps.isPublishing})
    }
    if (this.props.isPublishing && !nextProps.isPublishing && nextProps.hasError === false) {
      this.props.dispatch(navigateBack())
    }
  }

  onPressPublish = () => {
    this.props.dispatch(publishStatus(this.state.status, this.state.images))
  }

  onChangeStatus = (status) => {
    this.setState({status})
  }

  onPressAddImage = () => {
    this.refs.imageActions.show()
  }

  onPressAction = (index) => {
    switch (index) {
      case 0:
        ImagePicker
            .openCamera({
              mediaType: 'photo',
            })
            .then(this.onImageSelected)
            .catch(this.onImagePickerCancel)
        break
      case 1:
        ImagePicker
            .openPicker({
              multiple: true,
              mediaType: 'photo',
            })
            .then(this.onImagesSelected)
            .catch(this.onImagePickerCancel)
    }
  }

  onImagePickerCancel = () => {}

  onImageSelected = img => {
    this.setState({
      images: [
        {
          uri: img.path,
          width: img.width,
          height: img.height,
          mime: img.mime,
        }
      ]
    })
  }

  onImagesSelected = (imageList) => {
    const list = imageList.map(img => ({
      uri: img.path,
      width: img.width,
      height: img.height,
      mime: img.mime,
    }))
    const images = this.state.images.slice().concat(list)
    this.setState({images})
  }

  onPressRemoveImage = index => {
    const images = this.state.images.filter((img, _index) => _index !== index)
    this.setState({images})
  }

  renderImage = (image, index) => {
    return (
        <StatusAttatchment
            key={image.uri}
            hideRemove={this.props.isPublishing}
            onPressRemove={this.onPressRemoveImage.bind(this, index)}
            imageSource={{uri: image.uri}}/>
    )
  }

  renderOverlay() {
    return (
        <ActivityOverlay isVisible={this.props.isPublishing}/>
    )
  }

  render() {
    const {currentUser, isPublishing} = this.props
    const {
      display_name,
      username,
    } = currentUser
    const profile_img = currentUser && currentUser.profile_img ?
        {uri: currentUser.profile_img} : ''

    const Button = isPublishing ? View : TouchableOpacity

    return (
        <KeyboardAvoidingView behavior="padding" style={styles.container}>
          <View style={styles.userContainer}>
            <Avatar
                size={50}
                style={styles.avatar}
                source={profile_img}/>
            <View style={styles.nameContainer}>
              <Text style={styles.name} numberOfLines={1}>{display_name}</Text>
              {username && <Text style={styles.userHandle} numberOfLines={1}>@{username}</Text>}
            </View>
          </View>
          <TextInput
              editable={!isPublishing}
              multiline
              blurOnSubmit
              onChangeText={this.onChangeStatus}
              style={styles.input}
              placeholderTextColor={Color.WARM_GREY}
              placeholder={I18n.t('shareStatusScreen.shareStatus')}
              returnKeyType="done"
          />
          <View style={styles.imagesContainer}>
            {this.state.images.length > 0 &&
            <ScrollView horizontal style={{paddingBottom: 10}} contentContainerStyle={{paddingHorizontal: 8}}>
              {this.state.images.map(this.renderImage)}
            </ScrollView>
            }
            <Button style={styles.btnAddImage} onPress={this.onPressAddImage}>
              <Text style={styles.postImage}>{I18n.t('shareStatusScreen.addImage')}</Text>
              <Image source={require('../../assets/icons/profileStatusPic.png')}/>
            </Button>
          </View>
          <ActionSheet
              ref="imageActions"
              title={I18n.t('shareStatusScreen.addImage')}
              options={this.PHOTO_OPTIONS}
              cancelButtonIndex={2}
              onPress={this.onPressAction}
          />
          {this.renderOverlay()}
        </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.BACKGROUND_COLOR,
    flex: 1,
  },
  userContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingLeft: 17.5,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255, 0.5)',
  },
  nameContainer: {
    paddingHorizontal: 17.5,
  },
  name: {
    color: Color.CAMEL,
    fontSize: 17.5,
    ...Font.FONT_BOLD,
  },
  userHandle: {
    backgroundColor: 'transparent',
    color: Color.WARM_GREY,
    fontSize: 13.5,
    ...Font.FONT_MEDIUM_ITALIC,
  },
  input: {
    flex: 1,
    ...Font.FONT_LIGHT,
    fontSize: 22.5,
    lineHeight: 22,
    color: Color.WARM_GREY,
    paddingHorizontal: 19,
    paddingTop: 20,
  },
  imagesContainer: {
    backgroundColor: Color.CONTRAST_COLOR,
    paddingVertical: 10,
  },
  postImage: {
    ...Font.FONT_LIGHT,
    fontSize: 17.5,
  },
  btnAddImage: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
  },
})
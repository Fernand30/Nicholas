import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  Platform,
  StatusBar,
} from 'react-native'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import I18n from '../i18n'
import * as Font from '../constants/Font'
import Avatar from '../components/Avatar'
import moment from 'moment'
import Form from '../components/Form'
import {Categories, PlaceTypes, Tags} from '../constants/Data'
import CategoryTag from '../components/CategoryTag'
import EditProfileForm from '../components/EditProfileForm'
import FloatingLabelInput from '../components/FloatingLabelInput'
import EditProfileFloatingLabelInput  from '../components/EditProfileFloatingLabelInput'
import ActionSheet from 'react-native-actionsheet'
import _ from 'lodash'
import PrimaryButton from '../components/PrimaryButton'
import RNGooglePlaces from 'react-native-google-places'
import {connect} from 'react-redux'
import {PROFILE_VALIDATION_SCHEMA} from '../constants/ValidationSchemas'
import DateTimePicker from '../components/DateTimePicker'
import {updateProfile} from '../redux/actions/currentUser'
import ImagePicker from 'react-native-image-crop-picker'
import CachedImage from '../components/CachedImage'
import {navigateBack} from '../redux/actions/nav'

const CURRENT_YEAR = moment().format('Y')

@connect((state, ownProps) => ProfileEditScreen.getStateProps(state, ownProps))
export default class ProfileEditScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('profileEditScreen.title'),
    headerLeft: <NavBackButton/>,
  })

  static getStateProps(state, ownProps) {
    return {
      profile: state.currentUser.profile,
      isPushing: state.currentUser.isPushing,
    }
  }

  state = {
    form: _.cloneDeep(this.props.profile),
    isValid: false,
    pickerYear: CURRENT_YEAR - 25,
    displayDatePicker: false,
    pushing: false,
    error: false,
    tags:[],
  }

  PHOTO_OPTIONS = [
    I18n.t('profileEditScreen.fromCamera'),
    I18n.t('profileEditScreen.fromGallery'),
    I18n.t('profileEditScreen.cancel'),
  ]
  COVER_OPTIONS = [
    // I18n.t('profileEditScreen.fromTemplate'),
    I18n.t('profileEditScreen.fromGallery'),
    I18n.t('profileEditScreen.cancel'),
  ]

  componentDidMount() {
    PROFILE_VALIDATION_SCHEMA.validate(this.state.form)
        .then(() => this.setState({isValid: true}))
        .catch(() => this.setState({isValid: false}))
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevState.form, this.state.form)) {
      PROFILE_VALIDATION_SCHEMA.validate(this.state.form)
          .then(() => this.setState({isValid: true}))
          .catch(error => {
            console.log(error)
            this.setState({isValid: false})
          })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPushing && !nextProps.isPushing) {
      this.props.dispatch(navigateBack())
    }
  }

  onPressAvatarAction = (index) => {
    const WIDTH = 100 * 3
    const HEIGHT = 100 * 3
    switch (index) {
      case 0:
        ImagePicker
            .openCamera({
              width: WIDTH,
              height: HEIGHT,
              cropping: true,
              cropperCircleOverlay: true,
            })
            .then(this.onAvatarSelected)
            .catch(this.onImagePickerCancel)
        break
      case 1:
        ImagePicker
            .openPicker({
              width: WIDTH,
              height: HEIGHT,
              cropping: true,
              cropperCircleOverlay: true,
            })
            .then(this.onAvatarSelected)
            .catch(this.onImagePickerCancel)
        break
    }
  }

  onAvatarSelected = (image) => {
    this.setState({
      avatarChanged: true,
      avatarSource: {
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
      },
    })
  }

  onPressCoverAction = (index) => {
    const WIDTH = 320 * 3
    const HEIGHT = 162 * 3
    switch (index) {
      case 0:
        ImagePicker
            .openPicker({
              width: WIDTH,
              height: HEIGHT,
              cropping: true,
            })
            .then(this.onCoverSelected)
            .catch(this.onImagePickerCancel)
        break
      case 1:
        ImagePicker
            .openCamera({
              width: WIDTH,
              height: HEIGHT,
              cropping: true,
            })
            .then(this.onCoverSelected)
            .catch(this.onImagePickerCancel)
        break
    }
  }

  onCoverSelected = (image) => {
    this.setState({
      coverChanged: true,
      coverSource: {
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
      },
    })
  }

  onImagePickerCancel = () => {
  }

  onPressChangeCover = () => {
    this.refs.coverActions.show()
  }

  onPressChangePicture = () => {
    this.refs.pictureActions.show()
  }

  onPressAddress = () => {
    StatusBar.setHidden(true)
    RNGooglePlaces
        .openAutocompleteModal({
          // country: 'FR',-
        })
        .then((place) => {
          const form = {
            ...this.state.form,
            address: place.address,
            address_components: place.addressComponents,
            google_place_id: place.placeID,
          }

          this.setState({form})
        })
        .catch(error => console.log(error.message))
        .then(() => StatusBar.setHidden(false))
  }

  onSetBirthDate = date => {
    this.setState({
      form: {
        ...this.state.form,
        birth_date: date.getTime(),
      },
    })
  }

  onToggleDatePicker = () => {
    this.setState({
      displayDatePicker: !this.state.displayDatePicker,
    })
  }

  onPressSave = () => {
    const cover = this.state.coverChanged ? this.state.coverSource : null
    const avatar = this.state.avatarChanged ? this.state.avatarSource : null
    this.props.dispatch(updateProfile(this.state.form, avatar, cover))
  }

  renderForm() {
    const {form, pushing} = this.state
    const fields = [
      {
        id: 'first_name',
        defaultValue: this.props.profile.first_name,
        editable: !pushing,
        placeholder: I18n.t('profileEditScreen.first_name'),
        maxLength: 35,
        onChangeText: first_name => this.setState({form: {...form, first_name}}),
      },
      {
        id: 'last_name',
        defaultValue: this.props.profile.last_name,
        editable: !pushing,
        placeholder: I18n.t('profileEditScreen.last_name'),
        maxLength: 35,
        onChangeText: last_name => this.setState({form: {...form, last_name}}),
      },
      {
        id: 'sex',
        defaultValue: this.props.profile.sex,
        editable: !pushing,
        placeholder: I18n.t('profileEditScreen.sex'),
        maxLength: 10,
        onChangeText: sex => this.setState({form: {...form, sex}}),
      },
      {
        id: 'address',
        editable: false,
        placeholder: I18n.t('profileEditScreen.address'),
        textBreakStrategy: 'simple',
        value: form.address ? `${form.address}` : null,
        render: (props) => (
            <TouchableOpacity onPress={this.onPressAddress} key="address">
              <EditProfileFloatingLabelInput {...props} containerStyle={{marginTop: 20,}}/>
            </TouchableOpacity>
        ),
      },
      {
        id: 'birth_date',
        editable: false,
        value: form.birth_date ? `${moment(form.birth_date).format('MMMM DD. YYYY')}` : null,
        placeholder: I18n.t('profileEditScreen.birthDate'),
        render: (props) => (
            <TouchableOpacity onPress={this.onToggleDatePicker} key="birth_date">
              <EditProfileFloatingLabelInput {...props} containerStyle={{marginTop: 20,}}/>
            </TouchableOpacity>
        ),
      },
      {
        id: 'username',
        editable: !pushing,
        defaultValue: form.username,
        placeholder: I18n.t('profileEditScreen.username'),
        autoCapitalize: 'none',
        autoCorrect: false,
        maxLength: 35,
        onChangeText: username => this.setState({form: {...form, username}}),
      },
    ]

    return (
        <View style={styles.formContainer}>
          <EditProfileForm fields={fields}/>
          {this.renderTags()}
        </View>
    )
  }

  renderTags() {
    const {form: {tags}} = this.state
    //alert(JSON.stringify(tag))
    return (
        <View style={styles.tagsContainer}>
          <Text style={styles.sectionLabel}>{I18n.t('profileEditScreen.selectTags')}:</Text>
          <View style={styles.tagsWrapper}>
            {Tags.map(
                cat => <CategoryTag
                    key={cat.id}
                    active={this.state.tags.indexOf(cat.id) !== -1}
                    onPress={this.onPressCategory.bind(this,
                        cat.id)}
                    label={cat.name}
                    style={styles.tag}/>
            )}
          </View>
        </View>
    )
  }


  onPressCategory(id) {
    const {form} = this.state
    let newState = this.state.tags.slice()

    if (newState.indexOf(id) !== -1) {
      newState = newState.filter(_id => _id !== id)
    } else if (this.state.tags.length === 3) {
      newState.shift()
      newState.push(id)
    } else {
      newState.push(id)
    }

    // const form = {
    //   ...this.state.form,
    //   tags: newState,
    // }
    this.setState({
      tags: newState
    })
    tags= newState
    this.setState({form: {...form, tags}})
  }





  render() {
    const {profile} = this.props
    const birth_date = profile.birth_date ? new Date(profile.birth_date) : moment().subtract(18, 'years').toDate()

    let avatarSource
    let coverSource

    if (this.state.avatarChanged) {
      avatarSource = this.state.avatarSource
    } else {
      avatarSource = {uri: this.props.profile.profile_img}
    }

    if (this.state.coverChanged) {
      coverSource = this.state.coverSource
    } else {
      coverSource = profile && profile.cover_img ?
          {uri: profile.cover_img} :
          require('../../assets/images/defaultProfile2.png')
    }

    return (
        <KeyboardAvoidingView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollView}>
            <TouchableOpacity activeOpacity={0.8}
                              onPress={this.onPressChangeCover}>
              <CachedImage style={styles.coverImg} source={coverSource} resizeMode="cover">
                <View style={[styles.mask, styles.coverMask]}>
                  <Image
                      source={require('../../assets/Images_Icons/btn_profilebackviewcamera.png')}/>
                </View>
              </CachedImage>
            </TouchableOpacity>

            <View style={styles.avatarContainer}>
              <View>
                <Avatar
                    size={90}
                    style={styles.avatar}
                    source={avatarSource}>
                </Avatar>
                <TouchableOpacity activeOpacity={0.8}
                                    onPress={this.onPressChangePicture}
                                    style={styles.absoluteImage}>
                    <Image source={require('../../assets/Images_Icons/btn_profilephotocamera.png')}/>
                </TouchableOpacity>
              </View>  
            </View>

            {this.renderForm()}
          </ScrollView>
          <PrimaryButton
              loading={this.props.isPushing}
              disabled={!this.state.isValid}
              onPress={this.onPressSave}
              label={I18n.t('profileEditScreen.save')}
          />
          <DateTimePicker
              mode="date"
              defaultDate={birth_date}
              onSave={this.onSetBirthDate}
              isVisible={this.state.displayDatePicker}
              onCancel={this.onToggleDatePicker}/>
          {/*ACTION SHEETS*/}
          <ActionSheet
              ref="coverActions"
              title={I18n.t('profileEditScreen.changeCover')}
              options={this.COVER_OPTIONS}
              cancelButtonIndex={1}
              onPress={this.onPressCoverAction}
          />
          <ActionSheet
              ref="pictureActions"
              title={I18n.t('profileEditScreen.changeProfilePic')}
              options={this.PHOTO_OPTIONS}
              cancelButtonIndex={2}
              onPress={this.onPressAvatarAction}
          />
        </KeyboardAvoidingView>
    )
  }
}

const SCREEN_WIDTH = Dimensions.get('window').width
const PADDING = 17.5
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.CONTRAST_COLOR,
  },
  scrollView: {
    paddingBottom: 40,
  },
  mask: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  coverImg: {
    backgroundColor: Color.GREYISH_BROWN,
    height: 180,
    width: SCREEN_WIDTH,
  },
  coverMask: {
    justifyContent: 'center',
  },
  absoluteImage:{
    position:'absolute',
    left: 25.5,
    bottom: 2,
  },
  changeImg: {
    marginTop: 5,
    fontSize: 20,
    ...Font.FONT_LIGHT,
  },
  avatarMask: {
    backgroundColor: 'rgba(255,255,255,0.1)',

  },
  avatar: {
    borderWidth: 2.5,
  },
  avatarContainer: {
    marginTop: -45,
    paddingLeft: 18,

    // borderColor: 'black',
    // borderWidth: 2.5,
    // marginLeft: PADDING,
  },
  avatarCamera: {
    marginTop: 44,
  },
  formContainer: {
    marginTop: 15,
    paddingHorizontal: 25.5,
  },
  inputContainer: {
    alignSelf: 'stretch',
    borderBottomWidth: 0.5,
    borderBottomColor: Color.BACKGROUND_COLOR,
  },
  inputFirst: {
    marginTop: 20,
  },
  input: {
    color: '#FFF',
    fontSize: 20,
    marginTop: 30,
    height: 44,
    ...Font.FONT_BOLD,
  },
  btnSave: {
    backgroundColor: Color.CAMEL,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSaveLabel: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_MEDIUM,
    fontSize: 20,
    letterSpacing: 0.5,
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
  tagsContainer: {
    marginTop: 20,
  },
  sectionLabel: {
    color: Color.NAV_BGCOLOR,
    ...Font.FONT_BOLD,
    fontSize: 17.5,
    marginLeft: 23.5,
    marginBottom: 8,
  },
  tagsWrapper: {
    backgroundColor: Color.CONTRAST_COLOR,
    marginTop: 10,
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  tag: {
    marginLeft: 10,
    marginBottom: 10,
  },






  pickerWrapper: {
    ...Platform.select({
      android: {
        marginHorizontal: 30,
      },
    })
  },
})
import React, {Component} from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Switch,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
  PixelRatio,

  TouchableHighlight,
  PermissionsAndroid,
} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import VideoPicker from 'react-native-image-picker'
import ActionSheet from 'react-native-actionsheet'
import TabBarIcon from '../components/TabBarIcon'
import * as Color from '../constants/Color'
import I18n from '../i18n'
import NavHideButton from '../components/NavHideButton'
import SegmentedControl from '../components/SegmentedControl'
import * as Font from '../constants/Font'
import Form from '../components/Form'
import EditProfileForm from '../components/EditProfileForm'
import {Categories, PlaceTypes, Tags} from '../constants/Data'
import CategoryTag from '../components/CategoryTag'
import moment from 'moment'
import ContributionLabel from '../components/ContributionLabel'
import ButtonNavigate from '../components/ButtonNavigate'
import NavImageButton from '../components/NavImageButton'
import Button from '../components/Button'
import Input from '../components/Input'
import Stepper from '../components/Stepper'
import Divider from '../components/Divider'
import PrimaryButton from '../components/PrimaryButton'
import RNGooglePlaces from 'react-native-google-places'
import FloatingLabelInput from '../components/FloatingLabelInput'
import EditProfileFloatingLabelInput from '../components/EditProfileFloatingLabelInput'
import OverlayModal from '../components/OverlayModal'
import EventPlaceType from '../components/EventPlaceType'
import VideoPlayer from '../components/VideoPlayer'
import AudioRec from '../components/AudioRec'
import _ from 'lodash'
import {EVENT_VALIDATION_SCHEMA, EVENT_PROFILE_VALIDATION} from '../constants/ValidationSchemas'
import {connect} from 'react-redux'
import {
  clearEvent,
  createEvent,
  updateEvent,
} from '../redux/actions/event'
import {NavigationActions} from 'react-navigation'
import DateTimePicker from '../components/DateTimePicker'
import ContributionModal from '../components/ContributionModal'
import CachedImage from '../components/CachedImage'
import PricingHelper from '../utils/PricingHelper'
import Icon from 'react-native-vector-icons/Ionicons'
import ActivityOverlay from '../components/ActivityOverlay'
import Sound from 'react-native-sound'
import {AudioRecorder, AudioUtils} from 'react-native-audio'
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource'
const DEFAULT_PLACE_TYPE = PlaceTypes[0]

@connect((state, ownProps) => CreateEventScreen.getStateProps(state, ownProps))

export default class CreateEventScreen extends Component {

  static navigationOptions = ({navigation, screenProps}) => {
    const { params = {} } = navigation.state;
    return{
      title: navigation.state.params && navigation.state.params.id ?
        I18n.t('createEventScreen.editTitle') : I18n.t('createEventScreen.title'),
      headerLeft: <NavHideButton/>
    }
  }

  static getStateProps(state, ownProps) {
    const event = ownProps.navigation.state.params ? state.events.entities[ownProps.navigation.state.params.id] : false
    return {
      userProfile: state.currentUser.profile || {},
      event,
      eventPrices: event && state.events.tickets[event._key] ? state.events.tickets[event._key] : {},
      isPushing: state.event.isPushing,
      isEditing: event !== false,

      isSaved: state.event.isSaved,
    }

  }

  IMAGE_OPTIONS = [
    I18n.t('createEventScreen.fromCamera'),
    I18n.t('createEventScreen.fromGallery'),
    I18n.t('createEventScreen.cancel'),
  ]

  VIDEO_OPTIONS = [
    I18n.t('createEventScreen.fromCamera'),
    I18n.t('createEventScreen.fromGallery'),
    I18n.t('createEventScreen.cancel'),
  ]

  constructor(props) {
    super(props)

    let form
    let coverImageSource
    let coverVideoSource
    let coverAudioSource
    const uid = props.navigation.state.params ? props.navigation.state.params.id : null

    if (props.event) {
      //map price object to array
      const prices = []
      Object.keys(props.eventPrices).forEach(id => {
        prices.push({...props.eventPrices[id], _key: id})
      })

      form = {...props.event, prices}
      coverImageSource = {
        uri: props.event.cover_img,
      }
      coverVideoSource = {
        videouri: props.event.cover_video,
      }
      coverAudioSource = {
        audiouri: props.event.cover_audio,
      }


    } else {
      form = {
        name: null,
        description: null,
        place_type: DEFAULT_PLACE_TYPE.id,
        start_date: moment().unix(),
        end_date: null,
        address: null,
        google_place_id: null,
        min_price: 0,
        max_price: 0,
        attendance_limit: 1,
        attendance_count: 0,
        is_free: true,
        location: [],
        categories: [],
        contribution: [],
        prices: [],
      }
    }

    this.state = {
      uid,
      eventVisibility: 0,
      displayStartTimePicker: false,
      displayEndTimePicker: false,
      isFormValid: props.event !== false,
      placeTypesVisible: false,
      contributionModalVisible: false,
      pricingHelpModalVisible: false,
      coverImageSource,
      coverVideoSource,
      coverAudioSource,
      coverChanged: false,
      videocoverChanged: false,
      audiocoverChanged: false,
      form,
      placeType: PlaceTypes.find(p => p.id === form.place_type).name,
      hasValidProfile: false,

      currentTime: 0.0,
      recording: false,
      stoppedRecording: false,
      finished: false,
      audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',
      hasPermission: undefined,
    }
  }

  prepareRecordingPath(audioPath){
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "Low",
      AudioEncoding: "aac",
      AudioEncodingBitRate: 32000
    });
  }

  _checkPermission() {
    if (Platform.OS !== 'android') {
      return Promise.resolve(true);
    }

    const rationale = {
      'title': 'Microphone Permission',
      'message': 'AudioRec needs access to your microphone so you can record audio.'
    };

    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
      .then((result) => {
        console.log('Permission result:', result);
        return (result === true || result === PermissionsAndroid.RESULTS.GRANTED);
      });
  }

  _renderButton(title, onPress, active) {
    var style = (active) ? styles.recactiveButtonText : styles.recbuttonText;

    return (
      <TouchableHighlight style={styles.recbutton} onPress={onPress}>
        <Text style={style}>
          {title}
        </Text>
      </TouchableHighlight>
    );
  }

  async _pause() {
    if (!this.state.recording) {
      console.warn('Can\'t pause, not recording!');
      return;
    }

    this.setState({stoppedRecording: true, recording: false});

    try {
      const filePath = await AudioRecorder.pauseRecording();

      // Pause is currently equivalent to stop on Android.
      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async _stop() {
    if (!this.state.recording) {
      console.warn('Can\'t stop, not recording!');
      return;
    }

    this.setState({stoppedRecording: true, recording: false});

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        this._finishRecording(true, filePath);
      }
      let uri = this.state.audioPath;
      if (uri && uri.match(/^\//)) {
        uri = `file://${uri}`;
      }

      this.setState({
        audiocoverChanged: true,
        coverAudioSource: {
          audiouri: uri,
        },
      });

      return filePath;
    } catch (error) {
      console.error(error);
    }
  }

  async _play() {
    if (this.state.recording) {
      await this._stop();
    }

    // These timeouts are a hacky workaround for some issues with react-native-sound.
    // See https://github.com/zmxv/react-native-sound/issues/89.
    setTimeout(() => {
      var sound = new Sound(this.state.audioPath, '', (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });

      setTimeout(() => {
        sound.play((success) => {
          if (success) {
            console.log('successfully finished playing');
          } else {
            console.log('playback failed due to audio decoding errors');
          }
        });
      }, 100);
    }, 100);
  }

  async _record() {
    if (this.state.recording) {
      console.warn('Already recording!');
      return;
    }

    if (!this.state.hasPermission) {
      console.warn('Can\'t record, no permission granted!');
      return;
    }

    if(this.state.stoppedRecording){
      this.prepareRecordingPath(this.state.audioPath);
    }

    this.setState({recording: true});

    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }

  _finishRecording(didSucceed, filePath) {
    this.setState({ finished: didSucceed });
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
  }


  componentDidMount() {
    this.validateUserProfile()

    this._checkPermission().then((hasPermission) => {
      this.setState({ hasPermission });

      if (!hasPermission) return;

      this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = (data) => {
        this.setState({currentTime: Math.floor(data.currentTime)});
      };

      AudioRecorder.onFinished = (data) => {
        // Android callback comes in the form of a promise instead.
        if (Platform.OS === 'ios') {
          this._finishRecording(data.status === "OK", data.audioFileURL);
        }
      };
    });
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevProps.userProfile, this.props.userProfile)) {
      this.validateUserProfile()
    }
    if (!_.isEqual(prevState.form, this.state.form) || prevState.coverImageSource !== this.state.coverImageSource || prevState.coverVideoSource !== this.state.coverVideoSource || prevState.coverAudioSource !== this.state.coverAudioSource) {
      EVENT_VALIDATION_SCHEMA
          .validate(this.state.form)
          .then(() => {
            return this.setState({
              isFormValid: this.state.coverImageSource !== null, //form is valid but has cover image?
              isFormValid: this.state.coverVideoSource !== null,
              isFormValid: this.state.coverAudioSource !== null,
            })
          })
          .catch((error) => {
            return this.setState({isFormValid: false})
          })
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.isSaved && nextProps.isSaved) {
      this.props.navigation.dispatch(NavigationActions.back())
    }
  }

  componentWillUnmount() {
    this.props.dispatch(clearEvent())
  }

  validateUserProfile() {
    EVENT_PROFILE_VALIDATION
        .validate(this.props.userProfile)
        .then(() => {
          return this.setState({
            hasValidProfile: true,
          })
        })
        .catch((error) => {
          return this.setState({hasValidProfile: false})
        })
  }

  selectVideoTapped() {
    const options = {
      title: 'Select a Video',
      takePhotoButtonTitle: 'Take Video...',
      mediaType: 'video',
      videoQuality: 'medium'
    };

    VideoPicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled video picker');
      }
      else if (response.error) {
        console.log('VideoPicker Error: ', response.error);
      }
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      }
      else {
        // alert(response.uri)
        this.setState({
          videocoverChanged: true,
          coverVideoSource: {
            videouri: response.uri,
            timestamp: response.timestamp,
            // mime: image.mime,
          },
        });
      }
    });
  }

  onPressAction = (index) => {
    const WIDTH = 320 * 3
    const HEIGHT = 162 * 3
    switch (index) {
      case 0:
        ImagePicker
            .openCamera({
              width: WIDTH,
              height: HEIGHT,
              cropping: true,
            })
            .then(this.onImageSelected)
            .catch(this.onImageCancelled)
        break
      case 1:
        ImagePicker
            .openPicker({
              width: WIDTH,
              height: HEIGHT,
              cropping: true,
            })
            .then(this.onImageSelected)
            .catch(this.onImageCancelled)
        break
    }
  }


  onPressCoverImage = () => {
    this.refs.actionSheet.show()
  }

  onImageCancelled = () => {
  }

  onImageSelected = (image) => {
    this.setState({
      coverChanged: true,
      coverImageSource: {
        uri: image.path,
        width: image.width,
        height: image.height,
        mime: image.mime,
      },
    })
  }

  onPressSave = () => {
    const {isEditing} = this.props
    const {isSecret, coverChanged, videocoverChanged, audiocoverChanged, uid} = this.state
    // alert(isEditing)
    if (isEditing) {
      const cover = coverChanged ? this.state.coverImageSource : null
      const coverVideo = videocoverChanged ? this.state.coverVideoSource : null
      const coverAudio = audiocoverChanged ? this.state.coverAudioSource : null
      this.props.dispatch(updateEvent(uid, this.state.form, isSecret, cover, coverVideo, coverAudio))
    } else {
      // alert(JSON.stringify(this.state.coverAudioSource))
      if (this.state.coverImageSource == null) {
        alert('Please add the image.')
      }else {
        this.props.dispatch(createEvent(this.state.form, isSecret, this.state.coverImageSource, this.state.coverVideoSource, this.state.coverAudioSource))
      }

    }
  }

  onPressAddress = () => {
    StatusBar.setHidden(true)
    RNGooglePlaces
        .openAutocompleteModal()
        .then((place) => {
          const form = {
            ...this.state.form,
            address: place.address,
            location: [place.latitude, place.longitude],
            google_place_id: place.placeID,
          }

          this.setState({form})
        })
        .catch(error => console.log(error.message))
        .then(() => StatusBar.setHidden(false))
  }

  onPressCategory(id) {
    const {form: {categories}} = this.state
    let newState = categories.slice()

    if (newState.indexOf(id) !== -1) {
      newState = newState.filter(_id => _id !== id)
    } else if (categories.length === 3) {
      newState.shift()
      newState.push(id)
    } else {
      newState.push(id)
    }

    const form = {
      ...this.state.form,
      categories: newState,
    }
    this.setState({form})
  }

  onUpdateForm = (form) => {
    this.setState({form})
  }

  renderCover() {
    const {coverImageSource} = this.state

    const containerProps = coverImageSource ? { resizeMode: 'cover' } : null
    let Container = coverImageSource ? (this.props.isEditing ? CachedImage : Image) : View

    let mask = null
    if (!coverImageSource) {
      mask = (
          <View style={[styles.mask, styles.coverMask]}>
            <Image
                source={require(
                    '../../assets/icons/compactCameraTrans.png')}/>
            <Text style={styles.changeImg}>{
              I18n.t('createEventScreen.changeImage')}
            </Text>
          </View>
      )
    }

    return (
        <View style={styles.coverContainer}>
          <Text style={styles.sectionLabel}>{I18n.t(
              'createEventScreen.eventImage')}:</Text>
          <TouchableOpacity activeOpacity={0.8}
                            onPress={this.onPressCoverImage}>
            <Container {...containerProps} style={styles.coverImg} source={coverImageSource}>
              {mask}
            </Container>
          </TouchableOpacity>
        </View>
    )
  }

  renderVideoCover() {
    const {coverVideoSource} = this.state

    const containerProps = coverVideoSource ? { resizeMode: 'cover' } : null
    let Container = coverVideoSource ? (this.props.isEditing ? CachedImage : Image) : View

    let mask = null
    if (!coverVideoSource) {

      mask = (
          <View style={[styles.mask, styles.coverMask]}>
            <Image
                source={require(
                    '../../assets/icons/compactCameraTrans.png')}/>
            <Text style={styles.changeImg}>{
              I18n.t('createEventScreen.changeVideo')}
            </Text>
          </View>
      )
    }else {
      mask = (
        <VideoPlayer source={coverVideoSource.videouri}/>
      )
    }

    return (
        <View style={styles.coverContainer}>
          <Text style={styles.sectionLabel}>{I18n.t(
              'createEventScreen.eventVideo')}:</Text>
          {/* <TouchableOpacity activeOpacity={0.8}
                            onPress={this.onPressCoverImage}>
            <Container {...containerProps} style={styles.coverImg} source={coverImageSource}>
              {mask}
            </Container>
          </TouchableOpacity> */}
          {/* <VideoPicker /> */}


          <TouchableOpacity activeOpacity={0.8} onPress={this.selectVideoTapped.bind(this)}>
            <Container {...containerProps} style={styles.coverImg} source={coverVideoSource}>
              {mask}
            </Container>
          </TouchableOpacity>

          {/* { this.state.videoSource &&
            <Text style={{marginTop: -30, textAlign: 'center'}}>{this.state.videoSource}</Text>
          } */}
        </View>
    )
  }

  renderAudioCover() {
    const {coverAudioSource} = this.state

    const containerProps = coverAudioSource ? { resizeMode: 'cover' } : null
    let Container = coverAudioSource ? (this.props.isEditing ? CachedImage : Image) : View

    let mask = null
    if (!coverAudioSource) {
      mask = (
          <View style={[styles.mask, styles.coverMask]}>
            <Image
                source={require(
                    '../../assets/icons/compactCameraTrans.png')}/>
            <Text style={styles.changeImg}>{
              I18n.t('createEventScreen.changeAudio')}
            </Text>
          </View>
      )
    }

    return (
        <View style={styles.coverContainer}>
          <Text style={styles.sectionLabel}>{I18n.t('createEventScreen.eventAudio')}:</Text>
          {/* <TouchableOpacity activeOpacity={0.8}
                            onPress={this.onPressCoverImage}>
            <Container {...containerProps} style={styles.coverImg} source={coverImageSource}>
              {mask}
            </Container>
          </TouchableOpacity> */}
          {/* <AudioRec /> */}
          <View style={styles.reccontainer}>
            <View style={styles.reccontrols}>
              {this._renderButton("RECORD", () => {this._record()}, this.state.recording )}
              {this._renderButton("PLAY", () => {this._play()} )}
              {this._renderButton("STOP", () => {this._stop()} )}
              {/* {this._renderButton("PAUSE", () => {this._pause()} )} */}
            </View>
            <Text style={styles.recprogressText}>{this.state.currentTime} s</Text>
          </View>
        </View>
    )
  }

  renderForm() {
    const {isPushing, placeType, form} = this.state
    const fields = [
      {
        id: 'name',
        editable: !isPushing,
        placeholder: I18n.t('createEventScreen.name'),
        maxLength: 35,
        defaultValue: form.name,
        onChangeText: name => this.onUpdateForm({...form, name}),
      },
      {
        id: 'description',
        multiline: true,
        numberOfLines: 3,
        editable: !isPushing,
        placeholder: I18n.t('createEventScreen.description'),
        maxLength: 500,
        defaultValue: form.description,
        onChangeText: description => this.onUpdateForm({...form, description}),
      },
      {
        id: 'address',
        editable: false,
        placeholder: I18n.t('createEventScreen.address'),
        textBreakStrategy: 'simple',
        value: form.address ? `${form.address}` : null,
        render: (props) => (
            <TouchableOpacity onPress={this.onPressAddress} key="address">
              <EditProfileFloatingLabelInput {...props} containerStyle={{marginTop: 20,}}/>
            </TouchableOpacity>
        ),
      },
    ]

    return (
        <View style={styles.infoContainer}>
          <Text style={styles.sectionLabel}>{I18n.t(
              'createEventScreen.eventInfo')}:</Text>
          <View style={styles.infoFormContainer}>
            <EditProfileForm fields={fields}/>
          </View>
        </View>
    )
  }

  renderCategories() {
    const {form: {categories}} = this.state
    return (
        <View style={styles.tagsContainer}>
          <Text style={styles.sectionLabel}>{I18n.t(
              'createEventScreen.selectCats')}:</Text>
          <View style={styles.tagsWrapper}>
            {Tags.map(
                cat => <CategoryTag
                    key={cat.id}
                    active={categories.indexOf(cat.id) !== -1}
                    onPress={this.onPressCategory.bind(this,
                        cat.id)}
                    label={cat.name}
                    style={styles.tag}/>)}
          </View>
        </View>
    )
  }


  renderLoadingOverlay() {
    return (
        <ActivityOverlay isVisble={this.props.isPushing}/>
    )
  }

  render() {
    const {isEditing} = this.props
    const buttonLabel = isEditing ? I18n.t('createEventScreen.save') : I18n.t('createEventScreen.create')

    return (
        <View style={styles.container}>
          {this.renderLoadingOverlay()}
          <ActionSheet
              ref="actionSheet"
              title={I18n.t('createEventScreen.coverImageTitle')}
              options={this.IMAGE_OPTIONS}
              cancelButtonIndex={2}
              onPress={this.onPressAction}
          />
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <KeyboardAvoidingView behavior="padding">
              {/*{isEditing === false && this.renderSegment()}*/}
              {this.renderCover()}
              {this.renderVideoCover()}
              {/* <VideoPicker /> */}
              {this.renderAudioCover()}
              {/* <AudioRec /> */}
              {this.renderForm()}
              {this.renderCategories()}
              {/* {this.renderPickers()} */}
              {/*{this.renderContribution()}
              {this.renderSpots()}
              {this.renderPrices()}
              {this.renderPricingHelpModal()}*/}
            </KeyboardAvoidingView>
          </ScrollView>
          <PrimaryButton
              loading={this.props.isPushing}
              disabled={!this.state.isFormValid}
              label={buttonLabel}
              onPress={this.onPressSave}/>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.CONTRAST_COLOR,
  },
  avatarContainer: {
    backgroundColor: Color.GREYISH_BROWN,
    borderColor: '#fff',
    borderWidth: 2 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatar: {
    alignItems: 'center',
    borderRadius: 75,
    width: 150,
    height: 150
  },
  scrollViewContainer: {
    paddingBottom: 50,
  },
  placeTypesScrollView: {
    height: 120,
  },
  placeTypesScrollViewContent: {
    paddingLeft: 10,
    alignItems: 'center',
  },
  loadingModalContent: {
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: 'gray',
    padding: 20,
    borderRadius: 6,
    width: 100,
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
  segmentedContainer: {
    marginHorizontal: 25.5,
  },
  hint: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 15,
    marginTop: 20,
    height: 42,
  },
  coverContainer: {
    marginTop: 20,
  },
  sectionLabel: {
    color: Color.BTN_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 17.5,
    marginLeft: 23.5,
    marginBottom: 8,
  },
  mask: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
  },
  coverImg: {
    backgroundColor: Color.GREYISH_BROWN,
    height: 182.5,
    width: Dimensions.get('window').width,
  },
  coverMask: {
    justifyContent: 'center',
  },
  changeImg: {
    marginTop: 5,
    fontSize: 20,
    ...Font.FONT_LIGHT,
  },
  infoContainer: {
    marginTop: 31.5,
  },
  infoFormContainer: {
    paddingHorizontal: 31,
  },
  placeTypeSize: {
    height: 100,
    width: 100,
  },
  placeTypeBox: {
    padding: 5,
    borderWidth: 1,
    borderRadius: 12.5,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeTypeBoxActive: {
    backgroundColor: Color.BLUE,
  },
  placeTypeImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeTypeLabel: {
    backgroundColor: 'transparent',
    ...Font.FONT_BOLD,
    fontSize: 17.5,
  },
  placeTypeLabelActive: {
    color: Color.CONTRAST_COLOR,
  },
  tagsContainer: {
    marginTop: 30.5,
    paddingHorizontal: 6,
  },
  tagsWrapper: {
    marginTop: 21.5,
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  tag: {
    marginLeft: 8,
    marginBottom: 15,
  },

  verticalBorder: {
    borderTopColor: 'rgba(255,255,255,0.3)',
    borderTopWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 1,
  },

  startDateContainer: {
    marginTop: 53.5,
  },
  endDateContainer: {
    marginTop: 30.5,
  },
  btnDatePicker: {
    paddingVertical: 12.5,
  },
  btnDatePickerLabel: {
    textAlign: 'center',
    fontSize: 17.5,
    ...Font.FONT_ITALIC,
    color: Color.CONTRAST_COLOR,
  },
  endDateError: {
    color: Color.BLUE,
    ...Font.FONT_LIGHT,
    fontSize: 12,
    textAlign: 'center',
  },

  contributionsWrapper: {},
  contributionListWrapper: {
    paddingHorizontal: 17.5,
    marginTop: 20,
  },
  contributionLabel: {
    marginBottom: 10,
  },
  contributionLabelLast: {
    marginBottom: 18.5,
  },
  btnAddContrib: {
    color: Color.CONTRAST_COLOR,
    fontSize: 20,
    ...Font.FONT_LIGHT,
    paddingLeft: 17.5,
  },

  pricesContainer: {
    marginTop: 27,
  },
  priceSwitchWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  priceFree: {
    fontSize: 17.5,
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
  },

  btnCreate: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  stepperContainer: {
    flexDirection: 'row',
    marginTop: 18.5,
  },
  stepperWrapper: {},
  stepperHint: {
    fontSize: 10,
    ...Font.FONT_LIGHT,
    color: Color.CONTRAST_COLOR,
    textAlign: 'center',
    marginTop: 4,
  },
  spotsContainer: {
    marginTop: 27,
  },
  spotsInputContainer: {
    paddingHorizontal: 23.5,
  },
  spotsInput: {
    width: 120,
  },
  firstPriceContainer: {
    marginTop: 44,
  },
  priceContainer: {},
  priceInnerContainer: {
    paddingHorizontal: 20.5,
  },
  priceInput: {
    marginRight: 88,
  },
  priceAmount: {
    width: 80,
  },
  priceHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceHint: {
    color: 'white',
    marginTop: 5,
  },
  btnPriceLabel: {
    fontSize: 17.5,
  },
  btnPrice: {
    flex: 1,
    height: 44,
    marginLeft: 27,
  },
  divider: {
    marginTop: 14.5,
    marginBottom: 18,
  },
  btnAdd: {
    marginTop: 10,
    marginLeft: 20.5,
  },

  //Required actions
  requiredActionsContainer: {
    marginTop: 20,
    borderColor: Color.BLUE,
    borderWidth: 1,
    marginHorizontal: 20.5,
    paddingHorizontal: 10,
  },
  requiredActionTitle: {
    fontSize: 16,
    ...Font.FONT_LIGHT,
    color: Color.CONTRAST_COLOR,
    textAlign: 'center',
    marginVertical: 15,
  },
  requiredActionButton: {
    marginHorizontal: 20,
    marginBottom: 15,
  },

  //pricing help modal
  pricingHelpModalTitleBar: {
    backgroundColor: Color.CAMEL,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  pricingHelpModalTitle: {
    ...Font.FONT_BOLD,
    fontSize: 16,
    textAlign: 'center',
    color: Color.CONTRAST_COLOR,
  },
  pricingHelpModalContent: {
    backgroundColor: Color.CONTRAST_COLOR,
    borderRadius: 4,
    paddingBottom: 10,
    marginHorizontal: 40,
    overflow: 'hidden',
  },
  pricingHelpModalParaContainer: {
    paddingHorizontal: 20,
  },
  pricingHelpModalText: {
    ...Font.FONT_LIGHT,
    fontSize: 14,
    marginTop: 10,
  },
  pricingHelpModalButton: {
    borderColor: Color.CAMEL,
    marginTop: 20,
    marginHorizontal: 20,
  },
  pricingHelpModalButtonLabel: {
    color: Color.CAMEL,
  },

  reccontainer: {
    flex: 1,
    backgroundColor: "#2b608a",
    justifyContent: 'center',
    alignItems: 'center',
  },
  reccontrols: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  recprogressText: {
    paddingTop: 10,
    paddingBottom: 15,
    fontSize: 20,
    color: "#fff"
  },
  recbutton: {
    padding: 10
  },
  recdisabledButtonText: {
    color: '#eee'
  },
  recbuttonText: {
    fontSize: 17,
    color: "#fff"
  },
  recactiveButtonText: {
    fontSize: 17,
    color: "#B81F00"
  }
})

import React, { Component } from 'react'
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,

  TouchableHighlight,
  Platform,
  PermissionsAndroid,
} from 'react-native'
import { connect } from 'react-redux'
import I18n from '../i18n'
import NavBackButton from '../components/NavBackButton'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'
import Avatar from '../components/Avatar'
import CheckBox from '../components/CheckBox'
import PriceRadioButton from '../components/PriceRadioButton'
import IconHelper from '../utils/IconHelper'
import CachedImage from '../components/CachedImage'
import PrimaryButton from '../components/PrimaryButton'
import moment from 'moment'
import NavButton from '../components/NavButton'
import Auth from '../utils/Auth'
import { attendFreeEvent, fetchEvent, fetchTickets, suspendEvent, waiveEventSpot } from '../redux/actions/event'
import { subscribeToEventAttendees, unSubscribeToEventAttendees } from '../redux/actions/eventAttendees'
import { EVENT_CHECKOUT_VALIDATION } from '../constants/ValidationSchemas'
import AnimatedLoader from '../components/AnimatedLoader'
import LiveDistanceText from '../containers/LiveDistanceText'
import { navigate } from '../redux/actions/nav'
import ActionSheet from 'react-native-actionsheet'
import OverlayModal from '../components/OverlayModal'
import Button from '../components/Button'
import ActivityOverlay from '../components/ActivityOverlay'
import NavImageButton from '../components/NavImageButton'
import ShareHelper from '../utils/ShareHelper'
import VideoPlayer from '../components/VideoPlayer'

// import Sound from 'react-native-sound'
// import {AudioRecorder, AudioUtils} from 'react-native-audio'
// import AudioPlayer from '../components/AudioRec'
import AudioPlayer from 'react-native-play-audio';

type Props = {
  id: string,
}

const renderRightNav = (isEditable, isLoaded, onPressHandler) => {
  const style = { fontSize: 25, ...Font.FONT_BOLD, textAlignVertical: 'center', paddingBottom: 5, }

  if (isEditable) {
    return (
      <NavButton visible={isEditable} onPress={onPressHandler} style={style} label='...'/>
    )
  }

  // return (
    // <NavImageButton
    //   visible={isLoaded}
    //   source={require('../../assets/icons/btShare.png')}
    //   onPress={onPressHandler}/>
  // )
}

@connect((state, ownProps: Props) => EventScreen.getStateProps(state, ownProps))
export default class EventScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    let isEditable = false
    let isLoaded = false
    let onPressHandler = null

    if (navigation.state.params) {
      isEditable = navigation.state.params.isEditable
      isLoaded = navigation.state.params.isLoaded
      onPressHandler = isEditable ? navigation.state.params.onPressOptions : navigation.state.params.onPressShare
    }

    return ({
      title: I18n.t('eventScreen.headerTitle'),
      headerLeft: <NavBackButton/>,
      headerRight: renderRightNav(isEditable, isLoaded, onPressHandler),
    })
  }

  static getStateProps(state, ownProps) {
    const eventId = ownProps.navigation.state.params.id
    return {
      currentUserUid: state.currentUser.uid,
      tickets: state.events.tickets[ eventId ],
      event: state.events.entities[ eventId ] || false,
      attendees: state.eventAttendees.attendees[ eventId ] || false,
      userTicket: state.userEvents.events[ eventId ] || false,
      isRequesting: state.userEvents.isRequesting,
      isSuspending: state.event.isSuspending,
      isOwnedByMe: state.events.entities[ eventId ] ? state.events.entities[ eventId ].user.uid === Auth.getUid() : false,
    }
  }

  OWNER_OPTIONS = [
    // I18n.t('eventScreen.edit'),
    I18n.t('eventScreen.suspend'),
    I18n.t('eventScreen.cancel'),
  ]
  state = {
    selectedTicketKey: null,
    selectedContribution: null,
    isValid: this.props.userTicket !== false,
    isOverlayVisible: false,

    // currentTime: 0.0,
    // recording: false,
    // stoppedRecording: false,
    // finished: false,
    audioPath: this.props.event.cover_audio,//AudioUtils.DocumentDirectoryPath + '/test.aac',
    // hasPermission: undefined,
  }

  componentWillMount() {
    let eventId = this.props.navigation.state.params.id
    this.props.dispatch(fetchTickets(eventId))
    this.props.dispatch(subscribeToEventAttendees(eventId))
  }

  componentWillUnmount() {
    this.props.dispatch(unSubscribeToEventAttendees(this.props.navigation.state.params.id))
  }

  componentDidMount() {
    this.props.navigation.setParams({ onPressOptions: this.onPressOptions })
    this.props.navigation.setParams({ onPressShare: this.onPressShare })
    if (this.props.event && this.props.event.user) {
      const isEditable = this.props.event.is_canceled === true ? false : this.props.event.user.uid === Auth.getUid()
      this.props.navigation.setParams({ isEditable, isLoaded: !!this.props.event })
    }

    if (!this.props.event) {
      let eventId = this.props.navigation.state.params.id
      this.props.dispatch(fetchEvent(eventId))
    }
    this.validate()
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.event === false && nextProps.event) {
      this.validate()
      const isEditable = nextProps.event.is_canceled === true ? false : nextProps.event.user.uid === Auth.getUid()
      this.props.navigation.setParams({ title: nextProps.event.name, isEditable, isLoaded: true })
    }
  }

  validate() {
    EVENT_CHECKOUT_VALIDATION
      .validate({
        // end_date: this.props.event.end_date,
        is_free: this.props.event.is_free,
        // selectedTicketKey: this.state.selectedTicketKey,
        // selectedContribution: this.state.selectedContribution,
        // contribution: this.props.event.contribution,
      })
      .then(() => this.setState({ isValid: true }))
      .catch(() => {
        return this.setState({ isValid: false })
      })
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

  async _play() {
    // const url 'http://sample.com/sample.mp3';
    AudioPlayer.prepare(this.state.audioPath, () => {
      AudioPlayer.play();

      // AudioPlayer.getDuration((duration) => {
      //   console.log(duration);
      // });
      // setInterval(() => {
      //   AudioPlayer.getCurrentTime((currentTime) => {
      //     console.log(currentTime);
      //   });
      // }, 1000);
      // AudioPlayer.stop();
      // AudioPlayer.pause();
      // AudioPlayer.setCurrentTime(50.5);
    })
  }

  async _stop() {
      AudioPlayer.stop();
  }

  onPressOptions = () => {
    this.refs.eventActions.show()
  }

  onPressShare = () => {
    ShareHelper
      .shareEvent(this.props.event)
      .catch(() => alert(I18n.t('genericErrorMessage')))
  }

  onPressOption = index => {
    switch (index) {
      case 0:
        this.toggleSuspendModal()
        // this.props.dispatch(navigate('EditEvent', { id: this.props.navigation.state.params.id }))
        break
      case 1:
        // this.toggleSuspendModal()
    }
  }
















  onPressDirections = () => {
    const [ latitude, longitude ] = this.props.event.location
    this.props.navigation.navigate('Map', {
      title: this.props.event.name,
      latitude,
      longitude,
      address: this.props.event.address,
      category: this.props.event.categories[ 0 ],
    })
  }

  onPressBuy = () => {
    this.props.navigation.navigate('Checkout', {
      id: this.props.event._key,
      selectedTicketKey: this.state.selectedTicketKey,
      selectedContribution: this.state.selectedContribution,
    })
  }

  onPressRequest = () => {

  }

  onPressCancel = () => {
    this.props.dispatch(waiveEventSpot(this.props.event._key, this.props.event.is_secret))
    this.validate()
  }

  onPressAttend = () => {
    const { selectedContribution } = this.state
    this.props.dispatch(attendFreeEvent(this.props.event._key, this.props.event.is_secret, selectedContribution))
  }

  onPressPrice = (selectedTicketKey) => {
    this.setState({ selectedTicketKey }, this.validate)
  }

  onPressContribution = (selectedContribution) => {
    this.setState({ selectedContribution }, this.validate)
  }

  onPressSuspend = () => {
    this.toggleSuspendModal()
    this.props.dispatch(suspendEvent(this.props.event._key, this.props.event.is_secret))
  }

  onPressUser = uid => {

    if (this.props.currentUserUid === uid) {
      this.props.dispatch(navigate('Profile'))
    } else {
      this.props.dispatch(navigate('UserLinkHandler', { id: uid }))
    }
  }

  toggleSuspendModal = () => {
    this.setState({
      isOverlayVisible: !this.state.isOverlayVisible,
    })
  }

  renderSuspendOverlayModal = () => {
    return (
      <OverlayModal isVisible={this.state.isOverlayVisible} onPressOverlay={this.toggleSuspendModal}>
        <View style={styles.modalSuspendContainer}>
          <View style={styles.modalSuspendTitleWrapper}>
            <Text style={styles.modalSuspendTitle}>{I18n.t('eventScreen.warning').toUpperCase()}</Text>
          </View>
          <View style={styles.modalSuspendContentWrapper}>
            <Text style={styles.modalSuspendContent}>{I18n.t('eventScreen.suspend1')}.</Text>
            <Text style={[ styles.modalSuspendContent, styles.modalSuspendContentUndone ]}>{I18n.t(
              'eventScreen.suspend2')}.</Text>
            <View style={styles.modalSuspendButtonWrapper}>
              <Button onPress={this.onPressSuspend}
                      labelStyle={styles.modalSuspendButtonLabelConfirm}
                      style={styles.modalSuspendButtonConfirm}
                      label="Confirm"/>
              <Button onPress={this.toggleSuspendModal}
                      labelStyle={styles.modalSuspendButtonLabelCancel}
                      style={styles.modalSuspendButtonCancel}
                      label="Cancel"/>
            </View>
          </View>
        </View>
      </OverlayModal>
    )
  }

  renderAttendees() {
    const { attendees } = this.props

    if (!attendees) {
      return null
    }

    const users = Object.keys(attendees).map(k => ({ ...attendees[ k ], _key: k }))

    return (
      <View style={[ styles.sectionContainer, styles.attendeesContainer ]}>
        <Text style={styles.sectionTitle}>{I18n.t(
          'eventScreen.attendees')}:</Text>
        <View style={styles.attendeeListContainer}>
          <FlatList horizontal={true}
                    data={users}
                    keyExtractor={(item, i) => i}
                    renderItem={({ item }) => (
                      <TouchableOpacity onPress={this.onPressUser.bind(this, item._key)}>
                        <Avatar
                          size={49}
                          containerStyle={styles.attendeeAvatar}
                          source={{ uri: item.profile_img }}
                        />
                      </TouchableOpacity>
                    )}
          />
        </View>
      </View>
    )
  }

  renderContribution() {
    const { event: { contribution = [] }, userTicket } = this.props

    if (!contribution || contribution.length === 0) {
      return null
    }

    let content

    if (!userTicket) {
      const { selectedContribution = 0 } = this.state
      content = contribution.map((c, index) => (
        <CheckBox
          disabled={this.props.isOwnedByMe}
          key={index}
          label={c.name}
          checked={index === selectedContribution}
          style={styles.checkbox}
          onPress={this.onPressContribution.bind(this, index)}
        />
      ))
    } else if (contribution[ userTicket.contribution_id ]) {
      content = <CheckBox
        disabled
        label={contribution[ userTicket.contribution_id ].name}
        checked={true}
        style={styles.checkbox}
      />
    }

    if (!content) {
      return null
    }

    return (
      <View style={[ styles.sectionContainer, styles.contributionContainer ]}>
        <Text style={styles.sectionTitle}>{I18n.t('eventScreen.contribution')}:</Text>
        <View style={styles.contributionListContainer}>
          {content}
        </View>
      </View>
    )
  }

  renderTicket = (event, id) => {
    const ticket = this.props.tickets[ id ]
    const { purchase_count = 0 } = ticket
    const { selectedTicketKey } = this.state
    const sold = purchase_count >= ticket.qty
    return (
      <PriceRadioButton
        disabled={this.props.isOwnedByMe}
        sold={sold}
        soldLabel={I18n.t('eventScreen.soldOut')}
        key={id}
        name={ticket.name}
        price={`${ticket.price} €`}
        selected={id === selectedTicketKey}
        style={styles.checkbox}
        onPress={this.onPressPrice.bind(this, id)}
      />
    )
  }

  renderTickets() {
    const { event, tickets = {} } = this.props

    if (event.is_free || !tickets) {
      return null
    }
    const ids = Object.keys(tickets)
    return (
      <View style={[ styles.sectionContainer, styles.pricesContainer ]}>
        <Text style={styles.sectionTitle}>{I18n.t('eventScreen.prices')}:</Text>
        <View style={styles.contributionListContainer}>
          {ids.map(this.renderTicket.bind(this, event))}
        </View>
      </View>
    )
  }

  renderPass() {
    const ticketId = Object.keys(this.props.userTicket)[ 0 ]
    const pass = this.props.userTicket[ ticketId ]

    //User probably tapped 'Attend' when the event was FREE
    if (!pass.ticket) {
      return (
        <View style={styles.ticket}>
          <Text style={styles.ticketTitle}>EVENT PASS</Text>
          <Text style={styles.ticketName}>{I18n.t('eventScreen.freePass')}</Text>
          <Text style={styles.ticketDate}>{I18n.t('eventScreen.freeTicketDate',
            { date: moment(pass.ts).format('DD MMM YYYY HH:mm') })}</Text>
        </View>
      )
    }

    return (
      <View style={styles.ticket}>
        <Text style={styles.ticketTitle}>{I18n.t('eventScreen.ticketTitle').toUpperCase()}</Text>
        <Text style={styles.ticketName}>{pass.ticket.name}</Text>
        <Text style={styles.ticketQty}>x{pass.ticket.qty}</Text>
        <Text style={styles.ticketDate}>{I18n.t('eventScreen.ticketDate',
          { date: moment(pass.ts).format('DD MMM YYYY HH:mm') })}</Text>
        <Text style={styles.ticketId}>Id: {pass.ticket.charge_id}</Text>
      </View>
    )
  }

  renderLoading() {
    return (
      <View style={[ styles.container, styles.loadingContainer ]}>
        <AnimatedLoader source={require('../../assets/animations/snap_loader_white')}/>
      </View>
    )
  }

  render() {
    const { event, isRequesting, userTicket } = this.props

    if (!event) {
      return this.renderLoading()
    }

    const { user, categories: [ category ] } = event
    const attendanceCount = this.props.attendees ? Object.keys(this.props.attendees).length : 0
    const isFree = event.is_free
    const hasSpots = event.attendance_limit - attendanceCount > 0
    const isOwner = event.user.uid === Auth.getUid()
    const canAttend = !event.is_private
    const start_date = moment.unix(event.start_date)
    const end_date = moment.unix(event.end_date)

    const start_hour = start_date.format('HH').toUpperCase()
    const end_hour = end_date.format('HH').toUpperCase()
    const endsSameDay = start_date.isSame(end_date, 'd')

    let onPressAttend
    let labelButton
    let disableButton = !this.state.isValid || !hasSpots || event.is_canceled

    if (isFree && !userTicket) {
      onPressAttend = this.onPressAttend
      labelButton = I18n.t('eventScreen.attend')
    } else if (isFree && userTicket) {
      onPressAttend = this.onPressCancel
      labelButton = I18n.t('eventScreen.going')
      disableButton = false
    } else {
      onPressAttend = event.is_private ? this.onPressRequest : this.onPressBuy
      labelButton = event.is_private ? I18n.t('eventScreen.request') : I18n.t('eventScreen.buyTicket')
    }

    let shouldRenderButton = !isOwner

    if (userTicket && !isFree) {
      shouldRenderButton = false
    }
    // alert(event.cover_video)

    let videoView = null
    if (event.cover_video) {
      videoView = (
        <View style={styles.coverContainer}>
          <VideoPlayer source={event.cover_video}/>
        </View>
      )
    }

    let audioView = null
    // alert(event.cover_audio)
    if (event.cover_audio) {
      audioView = (
        <View style={styles.reccontainer}>
          <View style={styles.reccontrols}>
            {/* {this._renderButton("RECORD", () => {this._record()}, this.state.recording )} */}
            {this._renderButton("Audio Play", () => {this._play()} )}
            {this._renderButton("Audio Stop", () => {this._stop()} )}
            {/* {this._renderButton("PAUSE", () => {this._pause()} )} */}
            {/* <AudioPlayer source = {event.cover_audio}/> */}
          </View>
          {/* <Text style={styles.progressText}>{this.state.currentTime} s</Text> */}
        </View>
      )
    }


    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          {/*organizer*/}
          <View style={[ styles.sectionContainer, styles.organizerContainer ]}>
            {/* <Text style={styles.sectionTitle}>{
              I18n.t('eventScreen.organizes')}:
            </Text> */}
            <View style={styles.userContainer}>
              <TouchableOpacity onPress={this.onPressUser.bind(this, this.props.event.user.uid)}>
                <View style={styles.avatarContainer}>
                  {user.profile_img &&
                  <Avatar containerStyle={styles.avatar} size={45.5} source={{ uri: user.profile_img }}/>}
                  <View style={styles.userNameContainer}>
                    <Text style={styles.organizer}>{user.display_name}</Text>
                    {user.username && <Text style={styles.userHandle}>@{user.username}</Text>}
                  </View>
                </View>
              </TouchableOpacity>

              {/* {canAttend &&
              <TouchableOpacity style={styles.btnMap} onPress={this.onPressDirections}>
                <Image source={require('../../assets/icons/icGeoFence.png')}/>
              </TouchableOpacity>} */}

            </View>
          </View>

          <View style={styles.coverContainer}>
            {/* {event.is_canceled && <View style={styles.coverCanceled}>
              <Text style={styles.canceledMessage}>{I18n.t('eventScreen.canceled').toUpperCase()}</Text>
            </View>} */}
            <CachedImage source={{ uri: event.cover_img }} style={styles.cover} resizeMode="cover" mutable/>
          </View>

          <View style={styles.titleContainer}>
            <Image source={IconHelper.getIconSource(category)}/>
            <Text style={styles.title} numberOfLines={1}
                  ellipsizeMode="tail">{event.name.toUpperCase()}</Text>
          </View>

          <View
            style={[ styles.sectionContainer, styles.descriptionContainer ]}>
            <Text style={styles.sectionTitle}>{I18n.t(
              'eventScreen.description')}:</Text>
            <Text style={styles.description} ellipsizeMode="tail"
                  numberOfLines={10}>
              {event.description}
            </Text>
          </View>




          {videoView}
          {audioView}

          {/*info*/}
          <View style={[ styles.sectionContainer, styles.infoContainer ]}>
            <View style={[ styles.column ]}>
              <View style={styles.infoSection}>
                <Image source={require('../../assets/icons/eventPins.png')}/>
                <LiveDistanceText style={styles.infoLabel} targetLocation={event.location}/>
              </View>



              {/* <View style={styles.infoSection}>
                <Image source={require('../../assets/icons/eventClock.png')}/>
                <Text style={styles.infoLabel}>
                  {start_hour} hrs {start_hour !== end_hour ? `- ${end_hour} hrs` : ''}
                </Text>
              </View>
              <View style={[ styles.infoSection, styles.last ]}>
                <Image source={require('../../assets/icons/eventEur.png')}/>
                <Text style={styles.infoLabel}>
                  {isFree ?
                    I18n.t('eventScreen.free') :
                    I18n.t('eventScreen.price', { price: event.min_price })}
                </Text>
              </View> */}
            </View>
            {/* <View style={[ styles.column ]}>
              <View style={styles.infoSection}>
                <Image
                  source={require('../../assets/icons/eventCalendar.png')}/>
                <Text style={styles.infoLabel}>
                  {start_date.format('DD MMM')} {endsSameDay ? '' : `- ${end_date.format('DD MMM')}`}
                </Text>
              </View>
              <View style={[ styles.infoSection, styles.last ]}>
                <Image source={require(
                  '../../assets/icons/eventAttendees.png')}/>
                <Text style={styles.infoLabel}>{`${attendanceCount}`}/{event.attendance_limit}</Text>
              </View>
            </View> */}
          </View>

          {this.renderAttendees()}
          {this.renderContribution()}
          {this.renderSuspendOverlayModal()}
          {!userTicket && !isFree && this.renderTickets()}
          {userTicket && !isFree && this.renderPass()}
        </ScrollView>
        {/* {shouldRenderButton && <PrimaryButton
          backgroundColor={userTicket ? Color.BLUE : Color.CAMEL}
          loading={isRequesting}
          disabled={disableButton}
          label={labelButton}
          onPress={onPressAttend}/>} */}
        <ActionSheet
          ref="eventActions"
          options={this.OWNER_OPTIONS}
          cancelButtonIndex={2}
          onPress={this.onPressOption}
        />
        <ActivityOverlay isVisible={this.props.isSuspending}/>
      </View>
    )
  }
}

const PADDING_HORIZONTAL = 14.5
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.CONTRAST_COLOR,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    paddingBottom: 44,
  },
  titleContainer: {
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 25,
    marginTop: 10,
  },
  sectionContainer: {
    paddingHorizontal: PADDING_HORIZONTAL,
  },
  coverContainer: {
    marginTop: 10,
    height: 192.5,
    justifyContent: 'center',
  },
  cover: {
    position: 'absolute',
    top: 0,
    width: Dimensions.get('window').width,
    height: 192.5,
  },
  coverCanceled: {
    backgroundColor: 'rgba(0,0,0, 0.8)',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    justifyContent: 'center',
  },
  title: {
    color: Color.DARK_TEXT_COLOR,
    ...Font.FONT_BOLD,
    letterSpacing: 0.5,
    fontSize: 20,
    textAlign: 'left',
    paddingVertical: 4,
    marginLeft: 0,
  },
  sectionTitle: {
    color: Color.INFO_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 15,
  },
  organizerContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingTop: 11.5,
  },
  userContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 11,
  },
  avatarContainer: {
    flexDirection: 'row',
  },
  avatar: {
    marginRight: 19,
  },
  organizer: {
    color: Color.DARK_TEXT_COLOR,
    fontSize: 15,
    ...Font.FONT_BOLD,
  },
  userHandle: {
    fontSize: 12.5,
    ...Font.FONT_MEDIUM_ITALIC,
    color: Color.INFO_COLOR,
  },
  btnMap: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 2.5,
    borderWidth: 0.5,
    borderColor: Color.CONTRAST_COLOR,
    width: 51.5,
    height: 40,
  },

  infoContainer: {
    flexDirection: 'row',
    marginTop: 35,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28.5,
  },
  last: {
    marginBottom: 0,
  },
  infoLabel: {
    color: Color.DARK_TEXT_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 15,
    letterSpacing: 0.6,
    marginLeft: 8,
  },
  column: {
    flex: 0.5,
    flexDirection: 'column',
  },
  attendeesContainer: {
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    marginBottom: 14,
  },
  attendeeListContainer: {
    marginTop: 21,
    height: 50,
  },
  attendeeAvatar: {
    marginRight: 17.9,
  },

  contributionContainer: {
    // paddingTop: PADDING_HORIZONTAL,
    // borderTopWidth: 1,
    // borderTopColor: 'rgba(255,255,255,0.3)',
    // marginTop: 32,
  },
  contributionListContainer: {
    marginTop: 21,
  },
  pricesContainer: {
    paddingTop: PADDING_HORIZONTAL,
    // marginTop: 32,
  },
  checkbox: {
    marginBottom: 15,
  },
  descriptionContainer: {
    marginBottom: 12,
    marginTop: 12,
  },
  description: {
    color: Color.INFO_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 15,
    marginTop: 15,
  },

  btnBuy: {
    backgroundColor: Color.CAMEL,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnBuyLabel: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 20,
    letterSpacing: 0.5,
  },
  ticket: {
    backgroundColor: Color.BLUE,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'white',
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  ticketTitle: {
    color: Color.CONTRAST_COLOR,
    fontSize: 16,
    ...Font.FONT_LIGHT
  },
  ticketName: {
    color: Color.CONTRAST_COLOR,
    fontSize: 40,
    ...Font.FONT_BOLD
  },
  ticketQty: {
    color: Color.CONTRAST_COLOR,
    fontSize: 20,
    ...Font.FONT_LIGHT
  },
  ticketDate: {
    color: Color.CONTRAST_COLOR,
    fontSize: 10,
    ...Font.FONT_LIGHT,
    marginTop: 15,
  },
  ticketId: {
    color: Color.CONTRAST_COLOR,
    fontSize: 10, ...Font.FONT_LIGHT,
    marginTop: 15,
  },

  //Suspend event modal
  modalSuspendContainer: {
    paddingHorizontal: 30,
  },
  modalSuspendContentWrapper: {
    backgroundColor: Color.CONTRAST_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  modalSuspendContent: {
    ...Font.FONT_LIGHT,
    fontSize: 14,
  },
  modalSuspendContentUndone: {
    ...Font.FONT_BOLD,
    marginTop: 10,
  },
  modalSuspendTitleWrapper: {
    backgroundColor: Color.TOMATO,
  },
  modalSuspendTitle: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 15,
    textAlign: 'center',
    paddingVertical: 5,
  },
  modalSuspendButtonWrapper: {
    marginTop: 10,
  },
  modalSuspendButtonConfirm: {
    borderColor: Color.TOMATO,
    backgroundColor: Color.TOMATO,
    marginVertical: 10,
  },
  modalSuspendButtonCancel: {
    borderColor: Color.CAMEL,
  },
  modalSuspendButtonLabelConfirm: {
    color: Color.CONTRAST_COLOR,
  },
  modalSuspendButtonLabelCancel: {
    color: Color.CAMEL,
  },

  //suspended ribbon
  canceledMessage: {
    ...Font.FONT_BOLD,
    fontSize: 20,
    color: Color.TOMATO,
    textAlign: 'center',
  },




  reccontainer: {
    flex: 1,
    backgroundColor: Color.NAV_BGCOLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 0,
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
    color: Color.INFO_COLOR,
  },
  recbutton: {
    padding: 15,
  },
  recdisabledButtonText: {
    color: '#eee'
  },
  recbuttonText: {
    fontSize: 20,
    color: Color.CONTRAST_COLOR,
  },
  recactiveButtonText: {
    fontSize: 20,
    color: "#B81F00"
  },



})

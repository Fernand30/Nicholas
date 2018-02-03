import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  Image,
  Text,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native'
import I18n from '../i18n'
import * as Color from '../constants/Color'
import Avatar from '../components/Avatar'
import * as Font from '../constants/Font'
import Rating from '../components/Rating'
import SegmentedControl from '../components/SegmentedControl'
import FeedPost from '../components/FeedPost'
import ZoomImage from '../components/ZoomImage'
import CategoryTag from '../components/CategoryTag'
import NavBackButton from '../components/NavBackButton'
import NavImageButton from '../components/NavImageButton'
import Divider from '../components/Divider'
import ButtonNavigate from '../components/ButtonNavigate'
import TabBarIcon from '../components/TabBarIcon'
import { connect } from 'react-redux'
import moment from 'moment'
import Icon from 'react-native-vector-icons/Ionicons'
import { fetchEvent } from '../redux/actions/event'
import CachedImage from '../components/CachedImage'
import { fetchUser, followUser, unFollowUser } from '../redux/actions/user'
import _ from 'lodash'
import { navigate } from '../redux/actions/nav'
import { fetchFeed } from '../redux/actions/feed'
import { subscribeToUserPhotos, unSubscribeToUserPhotos } from '../redux/actions/userPhotos'
import { getUserPhotos } from '../redux/selectors/index'

const TABS = [
  I18n.t('profileScreen.tabDetails'),
  I18n.t('profileScreen.tabJournals'),
  I18n.t('profileScreen.tabReviews')
]

@connect((state, ownProps) => ProfileScreen.getStateProps(state, ownProps))
export default class ProfileScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => {
    const isMyProfile = navigation.state.params ? navigation.state.params.isMyProfile : false
    return ({
      headerTitle: (
        <Image style={{ width: 38, height: 38, alignSelf: 'center' }}
               source={require('../../assets/Images_Icons/logo_nav.png')} />
      ),
      headerLeft: <NavBackButton hidden={isMyProfile}/>,
      headerRight: (
          <NavImageButton
              visible={isMyProfile}
              source={require('../../assets/icons/settings3.png')}
              onPress={() => navigation.navigate('Config')}
              label={I18n.t('profileScreen.edit')} />
      ),
      tabBarLabel: I18n.t('profileScreen.tab'),
      tabBarIcon: (props) => (
          <TabBarIcon
              {...props}
              iconSource={require('../../assets/Images_Icons/Tabs/tab_profile_gray.png')}
            focusedIconSource={require('../../assets/Images_Icons/Tabs/tab_profile_blue.png')}/>
      )
    })
  }

  static getStateProps(state, ownProps) {
    const isMyProfile = !ownProps.navigation.state.params || !ownProps.navigation.state.params.id
    const userId = !isMyProfile ? ownProps.navigation.state.params.id : state.currentUser.uid
    const isFollowing = _.get(state.user.following, `${state.currentUser.uid}.${userId}`, false)
    // alert(JSON.stringify(Object.keys(state.currentUser.profile)))
    return {
      userId,
      isMyProfile,
      currentUser: isMyProfile ? state.currentUser.profile : (state.user.entities[userId] || {}),
      events: state.events.entities,
      feed: state.feed.byUser[userId],
      photos: getUserPhotos(state, userId),
      goingEvents: !isMyProfile ? {} : state.userEvents.events,
      isFollowing,
      isFetchingFeed: state.feed.fetching.indexOf(userId) !== -1,
    }
  }

  state = {
    currentTabIndex: 0
  }

  componentDidMount() {
    // alert('componentDidMount')
    const { dispatch, goingEvents, currentUser, isMyProfile } = this.props
    // alert(JSON.stringify(currentUser.events_created))
    this.props.navigation.setParams({ isMyProfile })

    if (currentUser && currentUser.events_created) {
      Object.keys(currentUser.events_created).forEach(id => dispatch(fetchEvent(id)))
    }

    if (goingEvents) {
      Object.keys(goingEvents).forEach(id => dispatch(fetchEvent(id)))
    }

    if (this.props.navigation.state.params && this.props.navigation.state.params.id) {
      dispatch(fetchUser(this.props.navigation.state.params.id))
    }

    dispatch(fetchFeed(this.props.userId))
    dispatch(subscribeToUserPhotos(this.props.userId))
  }

  componentWillUnmount() {
    // alert('componentWillUnmount')
    this.props.dispatch(unSubscribeToUserPhotos(this.props.userId))
  }

  componentWillReceiveProps(nextProps) {
    // alert('componentWillReceiveProps')
    if (this.props.goingEvents !== nextProps.goingEvents) {
      const currentEvents = Object.keys(this.props.goingEvents || {})
      const newEvents = Object.keys(nextProps.goingEvents || {})
      const missingEventIds = _.difference(currentEvents, newEvents)
      missingEventIds.forEach(id => this.props.dispatch(fetchEvent(id)))
    }
  }

  onChangeTab = (index) => {
    this.setState({ currentTabIndex: index })
  }

  onPressEvent = (id) => {
    this.props.dispatch(navigate('Event', { id }))
  }

  onPressEditProfile = () => {
    this.props.navigation.navigate('ProfileEdit')
  }

  onPressFollow = () => {
    const userId = this.props.userId || this.props.currentUser.uid
    if (this.props.isFollowing) {
      this.props.dispatch(unFollowUser(userId))
    } else {
      this.props.dispatch(followUser(userId))
    }
  }

  onPressStatus = () => {
    this.props.dispatch(navigate('ShareStatus'))
  }

  onPressFollowers = () => {
    this.props.dispatch(navigate('UserFollowers', { id: this.props.userId }))
  }

  onPressFollowing = () => {
    this.props.dispatch(navigate('UserFollowing', { id: this.props.userId }))
  }

  renderImage = (img, index) => {
    return (
        <ZoomImage
            key={index}
            source={{ uri: img.url }}
            imgSize={{ width: img.width, height: img.height }}
            imgStyle={styles.galleryThumbnail}
            containerStyle={styles.galleryThumbnailContainer}
            showDuration={200}
        />
    )
  }

  renderGallery() {
    const { photos } = this.props

    if (photos.length === 0) {
      return (
          <View style={styles.emptyStateContainer}>
            <Icon name="ios-images" color={Color.CONTRAST_COLOR} size={40} />
            <Text style={styles.emptyStateMsg}>{I18n.t('profileScreen.reviewEmptyState')}</Text>
          </View>
      )
    }

    return (
        <View style={styles.galleryContainer}>
          {/*<Text style={styles.galleryTitle}>This week</Text>*/}
          <View style={styles.galleryInnerContainer}>
            {photos.map(this.renderImage)}
          </View>
        </View>
    )
  }

  renderEvent = (id) => {
    const { events = {} } = this.props

    const event = events[id] || {}
    const { name = 'Loading...', start_date, end_date, cover_img } = event

    const startDate = start_date ? moment.unix(start_date).format('DD MMM') : ''
    const endDate = end_date ? moment.unix(end_date).format('DD MMM') : ''
    const time = start_date ? moment.unix(start_date).format('h:mm a') : ''

    const endsSameDay = start_date ? moment.unix(start_date).isSame(moment.unix(end_date), 'd') : false

    const onPress = event._key ? this.onPressEvent.bind(this, id) : null
    return (
        <ButtonNavigate style={styles.tabEventContainer} key={id} onPress={onPress}>
          <View style={styles.tabEventDetailContainer}>
            <View style={styles.tabEventImageContainer}>
              {cover_img && <CachedImage style={styles.tabEventImage} source={{ uri: cover_img }} />}
              {!cover_img && <View style={[styles.tabEventImage, styles.tabEventImageLoading]}>
                <ActivityIndicator size="small" color={Color.CONTRAST_COLOR} />
              </View>}
              <View style={styles.tabEventContainer}>
                <Text style={styles.tabEventName}>{name}</Text>
                {/* <Text style={styles.tabEventDate}>{startDate} {endsSameDay ? '' : ` - ${endDate}`}</Text>
                <Text style={styles.tabEventDate}>{time}</Text> */}
              </View>
            </View>
          </View>
          <Divider />
        </ButtonNavigate>
    )
  }

  renderMyEvents() {
    const { currentUser: { events_created = {} } } = this.props
    if (Object.keys(events_created).length === 0) {
      return null
    }

    return (
        <View>
          {/* <Text style={styles.eventsCreated}>{I18n.t('profileScreen.myEvents')}</Text> */}
          {Object.keys(events_created).map(this.renderEvent)}
          <Divider />
        </View>
    )
  }

  renderGoingEvents() {
    const { goingEvents } = this.props
    if (Object.keys(goingEvents).length === 0) {
      return null
    }

    return (
        <View>
          <Text style={styles.eventsCreated}>{I18n.t('profileScreen.going')}</Text>
          {Object.keys(goingEvents).map(this.renderEvent)}
        </View>
    )
  }

  renderEventsEmptyState() {
    return (
        <View style={styles.emptyStateContainer}>
          <Icon name="ios-sad-outline" color="white" size={40} />
          <Text style={styles.emptyStateMsg}>{I18n.t('profileScreen.eventEmptyState')}</Text>
        </View>
    )
  }

  renderEvents() {
    const { goingEvents = {}, currentUser: { events_created } } = this.props

    if (Object.keys(goingEvents).length === 0 &&
        (!events_created || Object.keys(events_created).length === 0 )) {
      return this.renderEventsEmptyState()
    }

    return (
        <View style={styles.eventsContainer}>
          {this.renderMyEvents()}
          {this.renderGoingEvents()}
        </View>
    )
  }

  renderFeedBubble = (key) => {
    const post = this.props.feed[key]
    return (
        <View key={key}>
          <FeedPost
              post={post}
              user={this.props.currentUser} />
          <Divider />
        </View>
    )
  }

  renderFeed() {
    if (this.props.isFetchingFeed) {
      return (
          <ActivityIndicator />
      )
    }

    const postUids = Object.keys(this.props.feed || {}).reverse()

    const { currentUser = {}, isMyProfile } = this.props
    const {
      display_name = 'Loading...',
      username,
      follower_count = 0,
      following_count = 0,
      occupation = '-',
      address_components,
      sex,
      birth_date,
      rating,
      events_created = {},
      tags,
    } = currentUser

    const age = birth_date ? moment().diff(new Date(birth_date), 'years') : '-'
    const country = address_components ?
        (address_components.country) :
        null
    const province = address_components ?
        (address_components.administrative_area_level_3 || address_components.administrative_area_level_2 ||
            address_components.administrative_area_level_1) :
        null
    const city = address_components ?
        (address_components.locality) :
        null
        // alert(JSON.stringify(tags))

    const totalLocation = (city != null? city:'')+', '+(province != null? province:'')+', '+country
    i = 0;
    return (
        <View style={styles.activityContainer}>
          <Text style={styles.infoLabel}>Age        :  {age}</Text>
          <Text style={styles.infoLabel}>Sex         :  {sex != null? sex:'-'}</Text>
          <Text style={styles.infoLabel}>Location  :  {country != null? totalLocation:'-'}</Text>

          <View style={styles.divid}/>

          {tags != null?
          <View style={styles.tagsWrapper}>
            {tags.map(
                cat =>{i++; return(<CategoryTag
                                    key={i}
                                    active={true}
                                    label={cat}
                                    style={styles.tag}
                                    />)}
            )}
          </View>:null}
        </View>


    )
  }





  renderFollowButton() {
    if (this.props.isMyProfile) {
      return null
    }

    const icon = this.props.isFollowing ?
        require('../../assets/icons/userFollowing.png') :
        require('../../assets/icons/userFollow.png')

    return (
        <View style={styles.btnFollow}>
          <TouchableOpacity onPress={this.onPressFollow}>
            <Image source={icon} />
          </TouchableOpacity>
        </View>
    )
  }

  renderCurrentTab() {
    let renderFun

    switch (this.state.currentTabIndex) {
      case 0:
        renderFun = this.renderFeed
        break
      case 1:
        renderFun = this.renderEvents
        break
      case 2:
        renderFun = this.renderGallery
    }

    return renderFun.call(this)
  }

  renderStatus() {
    const { currentUser = {} } = this.props
    const {
      current_status = {}
    } = currentUser

    if (!this.props.isMyProfile) {
      let currentStatusLabel = I18n.t('profileScreen.shareStatus')
      const currentStatusStyle = [styles.statusLabel]

      if (!this.props.isMyProfile && (!current_status || !current_status.comment)) {
        return null
      }

      if (current_status && current_status.comment) {
        currentStatusLabel = current_status.comment
      } else {
        currentStatusStyle.push(styles.statusLabelDefault)
      }
      return (
          <View style={styles.statusContainer}>
            <View style={styles.statusButton}>
              <Text style={currentStatusStyle}>{currentStatusLabel}</Text>
            </View>
          </View>
      )
    }

    return (
        <View style={styles.statusContainer}>
          <TouchableOpacity style={styles.statusButton} onPress={this.onPressStatus}>
            <Image style={styles.statusIcon} source={require('../../assets/icons/profileStatus.png')} />
            <Text style={styles.statusLabelDefault}>{I18n.t('profileScreen.shareStatus')}</Text>
          </TouchableOpacity>
        </View>
    )
  }

  render() {
    const { currentUser = {}, isMyProfile } = this.props
    const {
      display_name = 'Loading...',
      username,
      follower_count = 0,
      following_count = 0,
      occupation = '-',
      address_components,
      birth_date,
      rating,
      events_created = {}
    } = currentUser
    const profile_img = currentUser && currentUser.profile_img ?
        { uri: currentUser.profile_img } : ''
    const age = birth_date ? moment().diff(new Date(birth_date), 'years') : '-'

    const { currentTabIndex } = this.state

    const coverSource = currentUser && currentUser.cover_img ?
        { uri: currentUser.cover_img } :
        require('../../assets/images/defaultProfile2.png')

    const city = address_components ?
        (address_components.administrative_area_level_3 || address_components.administrative_area_level_2 ||
            address_components.administrative_area_level_1) :
        null

    const eventCount = Object.keys(events_created).length + Object.keys(this.props.goingEvents).length

    const SocialContainer = isMyProfile ? TouchableOpacity : View

    // alert(JSON.stringify(events_created))
    return (
        <ScrollView style={styles.scrollView}>
          <CachedImage style={styles.coverImg} source={coverSource} resizeMode="cover" />
          <View style={styles.avatarContainer}>
            <View style={styles.coverContainer}>
              <Avatar
                  size={90}
                  style={styles.avatar}
                  source={profile_img} />
            </View>
            <View style={styles.statsContainer}>
              {this.renderFollowButton()}
              <View style={styles.statContainer}>
                <Text style={[styles.stat, styles.statNumber]}>{eventCount}</Text>
                <Text style={[styles.stat, styles.statLabel]}>{I18n.t('profileScreen.post', { count: eventCount })
                    .toUpperCase()}</Text>
              </View>
              <View style={styles.statContainer}>
                <SocialContainer onPress={this.onPressFollowers}>
                  <Text style={[styles.stat, styles.statNumber]}>{follower_count}</Text>
                  <Text style={[styles.stat, styles.statLabel]}>{I18n.t('profileScreen.followers',
                      { count: follower_count }).toUpperCase()}</Text>
                </SocialContainer>
              </View>
              <View style={styles.statContainer}>
                <SocialContainer onPress={this.onPressFollowing}>
                  <Text style={[styles.stat, styles.statNumber]}>{following_count}</Text>
                  <Text style={[styles.stat, styles.statLabel]}>{I18n.t('profileScreen.following',
                      { count: following_count }).toUpperCase()}</Text>
                </SocialContainer>
              </View>
            </View>
          </View>
          {/*end avatar*/}

          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{display_name}</Text>


            <TouchableOpacity onPress={this.onPressEditProfile}>
              {isMyProfile && <Text style={styles.buttonEditProfile}>{I18n.t('profileScreen.editProfile')}</Text>}
            </TouchableOpacity>

          </View>
          {username && <Text style={styles.userHandle} numberOfLines={1}>@{username}</Text>}
          {/*{this.renderStatus()}*/}
          {/*end name*/}

          {/*<View style={[styles.sectionContainer, styles.infoContainer]}>
            <View style={[styles.column]}>
              <View style={styles.infoSection}>
                <Rating rating={rating} editable={false} />
              </View>
              <View style={styles.infoSection}>
                <Image source={require('../../assets/icons/profileAge.png')} />
                <Text style={styles.infoLabel}>{age}</Text>
              </View>
            </View>
            <View style={[styles.column]}>
              <View style={styles.infoSection}>
                <Image source={require('../../assets/icons/profilePin.png')} />
                <Text numberOfLines={1} style={styles.infoLabel}>{city || '-'}</Text>
              </View>
              <View style={[styles.infoSection, styles.last]}>
                <Image source={require('../../assets/icons/profileJob.png')} />
                <Text style={styles.infoLabel} numberOfLines={1}>{occupation}</Text>
              </View>
            </View>
          </View>*/}
          {/*end info*/}

          <View style={styles.segmentContainer}>
            <SegmentedControl values={TABS}
                              selectedIndex={currentTabIndex}
                              onChange={this.onChangeTab}
                              buttonStyle={styles.segmentedControl} />
          </View>
          {this.renderCurrentTab()}
        </ScrollView>
    )
  }
}

const PADDING = 17.5
const screenWidth = (Dimensions.get('window').width / 3) - 3

const styles = StyleSheet.create({
  navButton: {
    color: 'white',
    ...Font.FONT_LIGHT,
    fontSize: 17
  },
  scrollView: {
    backgroundColor: Color.CONTRAST_COLOR
  },
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR
  },
  coverImg: {
    backgroundColor: Color.WARM_GREY,
    height: 180,
    width: Dimensions.get('window').width
  },
  coverPlaceholder: {
    backgroundColor: Color.WARM_GREY,
    height: 180,
    width: Dimensions.get('window').width
  },
  btnFollow: {
    position: 'absolute',
    top: -40,
    right: 14
  },
  avatarContainer: {
    flexDirection: 'row',
    marginTop: -45,
    paddingLeft: PADDING
  },
  avatar: {
    borderWidth: 2.5
  },
  statsContainer: {
    flex: 1,
    alignSelf: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 0
  },
  statContainer: {
    // flex: 1,
  },
  stat: {
    backgroundColor: 'transparent',
    textAlign: 'center'
  },
  statLabel: {
    color: Color.WARM_GREY,
    ...Font.FONT_MEDIUM,
    fontSize: 12
  },
  statNumber: {
    color: Color.DARK_TEXT_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 18
  },

  nameContainer: {
    flexDirection: 'row',
    paddingHorizontal: PADDING,
    marginTop: 15,
  },
  name: {
    color: Color.BACKGROUND_COLOR,
    fontSize: 20,
    ...Font.FONT_BOLD,
    width: 150,
    marginLeft: 8,
  },
  buttonEditProfile: {
    fontSize: 15,
    ...Font.FONT_BOLD,
    textAlign: 'center',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: Color.BTN_COLOR,
    paddingVertical: 3,
    paddingHorizontal: 18,
    marginLeft: 20,
  },
  userHandle: {
    backgroundColor: 'transparent',
    color: Color.WARM_GREY,
    fontSize: 14,
    ...Font.FONT_MEDIUM_ITALIC,
    marginTop: -5,
    paddingHorizontal: PADDING,
    marginLeft: 14,
  },
  divid: {
    marginTop :20,
    borderBottomWidth: 1,
    borderBottomColor: Color.TAGS_COLOR,
  },

  sectionContainer: {
    paddingHorizontal: PADDING
  },
  infoContainer: {
    flexDirection: 'row'
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    height: 24
  },
  last: {
    marginBottom: 0
  },
  infoLabel: {
    flex: 1,
    color: Color.INFO_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 17.5,
    letterSpacing: 0.6,
    marginLeft: 15
  },
  column: {
    flex: 0.5,
    flexDirection: 'column'
  },

  segmentContainer: {
    marginTop: 15,
    paddingHorizontal: 0,
    marginBottom: 15
  },
  segmentedControl: {
    paddingVertical: 12.5
  },

  galleryContainer: {},
  galleryInnerContainer: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  galleryTitle: {
    color: 'white',
    fontSize: 22.5,
    ...Font.FONT_LIGHT,
    marginBottom: 15.5,
    textAlign: 'center'
  },
  galleryDay: {
    color: Color.WARM_GREY,
    ...Font.FONT_BOLD,
    fontSize: 17.5,
    textAlign: 'center'
  },
  galleryThumbnailContainer: {
    height: screenWidth,
    width: screenWidth,
    margin: 1
  },
  galleryThumbnail: {
    height: screenWidth,
    width: screenWidth
  },
  activityContainer: {
    marginTop: 10,
    paddingHorizontal: 20
  },
  activityBubble: {
    marginBottom: 15
  },

//  tab event
  eventsContainer: {},
  eventsCreated: {
    color: Color.WARM_GREY,
    fontSize: 17.5,
    ...Font.FONT_BOLD,
    textAlign: 'center',
    marginTop: 15
  },
  tabEventContainer: {
    // flexDirection: 'row',
    // marginTop: 10,
    justifyContent: 'center',
    paddingLeft: 30,
    paddingRight: 20
  },
  tabEventImageContainer: {
    flexDirection: 'row'
  },
  tabEventDetailContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  tabEventDate: {
    color: Color.CONTRAST_COLOR,
    fontSize: 15,
    ...Font.FONT_LIGHT
  },
  tabEventStatus: {
    color: Color.CONTRAST_COLOR,
    fontSize: 15,
    ...Font.FONT_BOLD_ITALIC
  },
  tabEventImage: {
    height: 67,
    width: 67,
    marginRight: 8
  },
  tabEventImageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.WARM_GREY
  },
  tabEventName: {
    fontSize: 15,
    ...Font.FONT_BOLD,
    color: Color.DARK_TEXT_COLOR
  },

  emptyStateContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  emptyStateMsg: {
    marginTop: 10,
    color: Color.INFO_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 16
  },

  //Status
  statusContainer: {
    borderTopColor: 'rgba(255,255,255, 0.5)',
    borderTopWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.5)',
    borderBottomWidth: 0.5,
    marginVertical: 10
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 12
  },
  statusIcon: {
    marginRight: 16
  },
  statusLabel: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 15
  },
  statusLabelDefault: {
    color: Color.WARM_GREY
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
    marginTop: 20,
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  tag: {
    marginLeft: 10,
    marginBottom: 10,
  },
})

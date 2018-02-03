import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  LayoutAnimation,
  Text,
  Dimensions,
  Image,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native'
import {connect} from 'react-redux'
import {getBanners, getFilteredNearEvents, getNearEvents} from '../redux/selectors/index'
import EventCard from '../components/EventCard'
import AnimatedLoader from '../components/AnimatedLoader'
import * as Color from '../constants/Color'
import EventListFilters from './EventListFilters'
import I18n from '../i18n/index'
import Swiper from 'react-native-swiper';
import {NavigationActions} from 'react-navigation'

type Props = {
  onPressEvent: (event: Event) => void,
  onPressFavorite: (key: string) => void,
}

@connect((state) => EventListContainer.getStateProps(state))
export default class EventListContainer extends Component {
  props: Props

  static getStateProps(state) {
    return {
      currentUid: state.currentUser.uid,
      eventsCount: getNearEvents(state).length,
      events: getFilteredNearEvents(state),
      favorites: state.favorites.events,
      banners: getBanners(state)
    }
  }

  searchingTimer
  carouselTimer
  searchingTicks = 0

  state = {
    isSearching: true,
    visibleCarousel: false,
  }

  componentDidMount() {
    this.carouselTimer = setTimeout(() => {
      this.setState({
        visibleCarousel: true,
      })
    }, 400)
    this.startSearchingAnimationCheck()
  }

  componentWillUnmount() {
    clearTimeout(this.searchingTimer)
    clearTimeout(this.carouselTimer)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.events.length === 0 && nextProps.events.length > 0) {
      LayoutAnimation.easeInEaseOut()
    }
  }

  startSearchingAnimationCheck = () => {
    clearTimeout(this.searchingTimer)
    this.searchingTimer = setTimeout(this.checkIfEventsLoaded, 1500)
  }

  checkIfEventsLoaded = () => {
    if (this.searchingTicks >= 5 || this.props.eventsCount > 0) {

      this.setState({isSearching: false})
      this.searchingTicks = 0

    } else {
      this.searchingTicks++
      this.startSearchingAnimationCheck()

    }
  }

  onPressEvent = (event) => {
    this.props.dispatch(NavigationActions.navigate({routeName: 'Event', params: {id: event._key, title: event.name}}))
  }

  onPressEventAvatar = uid => {
    if (uid === this.props.currentUid) {
      this.props.dispatch(NavigationActions.navigate({routeName: 'Profile'}))
    } else {
      this.props.dispatch(NavigationActions.navigate({routeName: 'UserLinkHandler', params: {id: uid}}))
    }
  }

  renderEventCard = (item) => {
    const isFavorite = this.props.favorites.indexOf(item._key) !== -1
    return (
        <EventCard
            key={item._key}
            onPressAvatar={this.onPressEventAvatar.bind(this, item.user.uid)}
            active={false}
            isFavorite={isFavorite}
            event={item}
            onPressFavorite={this.props.onPressFavorite.bind(this, item._key, isFavorite)}
            onPress={this.onPressEvent.bind(this, item)}/>
    )
  }

  renderBanner = (banner) => {
    const {width} = Dimensions.get('window')
    const style = { width, height: 121 };

    const isEvent = +banner.type === 2;
    const Container = isEvent ? TouchableWithoutFeedback : View
    const onPress = isEvent ? this.onPressEvent.bind(this, {_key: banner.event.uid, name: banner.event.name}) : null
    let uri

    if (isEvent) {
      uri = banner.cover_img || banner.event.cover_img
    } else {
      uri = banner.cover_img
    }

    return (
        <Container style={style} key={banner._key} onPress={onPress} >
          <Image style={style} source={{uri}}/>
        </Container>
    )
  }

  renderBanners() {
    if (this.props.banners.length === 0) {
      return null
    }

    return (
        <Swiper
            autoplay
            showsPagination={false}
            paginationStyle={{bottom: 0}}
            dotStyle={{borderWidth: 1, borderColor: 'white'}}
            activeDotColor="white"
        >
          {this.props.banners.map(this.renderBanner)}
        </Swiper>
    )
  }

  render() {
    return (
        <View style={{flex: 1}}>
          <ScrollView>
            <View style={{height: 10}}>
              {this.renderBanners()}
            </View>
            <View style={styles.eventList}>
              {this.props.events.map(this.renderEventCard)}
            </View>
            {this.state.isSearching && <View style={styles.loadingContainer}>
              <AnimatedLoader speed={1.4} source={require('../../assets/animations/searching.json')}/>
            </View>}
            {!this.state.isSearching && this.props.events.length === 0 &&
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEvents}>
                {I18n.t('noEventsNear', {count: this.props.eventsCount})}
              </Text>
            </View>
            }
          </ScrollView>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventList: {
    paddingHorizontal: 16,
  },
  noEventsContainer: {
    flex: 1,
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  noEvents: {
    color: Color.INFO_COLOR,
    textAlign: 'center',
    lineHeight: 20,
  },
  circleStyle: {
    width: 7,
    height: 7,
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 1,
  },
})

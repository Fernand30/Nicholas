import React, {PureComponent} from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'
import Avatar from './Avatar'
import CachedImage from './CachedImage'
import moment from 'moment'
import I18n from '../i18n'
import {Event} from '../TypeDefinition'
import LiveDistanceText from '../containers/LiveDistanceText'

type Props = {
  event: Event,
  onPress: () => void,
  onPressFavorite: () => void,
  onPressAvatar: (uid: string) => void,
  isFavorite: boolean,
}

export default class EventCard extends PureComponent {
  props: Props

  render() {
    const {onPress, isFavorite, event, event: {user}} = this.props
    const btnFavStyle = [styles.btnFavorite]

    if (isFavorite) {
      btnFavStyle.push(styles.btnFavoriteActive)
    }

    const now = moment()
    const start_date = moment.unix(event.start_date)
    const end_date = moment.unix(event.end_date)
    const isLive = start_date.isBefore(now) && end_date.isAfter(now)

    return (
        <View>
        <View style={styles.infoContainer}>
            <TouchableOpacity onPress={this.props.onPressAvatar}>
              <Avatar
                  size={40}
                  source={{uri: user.profile_img}}/>
            </TouchableOpacity>
            <View style={styles.hostContainer}>
              <Text style={styles.hostName}>
                {`${user.display_name}`}
                {user.username && <Text style={styles.hostHandle}> (@{user.username})</Text>}
              </Text>
              {/*<View style={styles.detailContainer}>
                <Image source={require('../../assets/icons/listPins.png')}/>
                <LiveDistanceText targetLocation={event.location} style={styles.detail}/>
                <Image style={styles.euro} source={require('../../assets/icons/listEur.png')}/>
                <Text style={styles.detail}>
                  {event.is_free ?
                      I18n.t('event.free') :
                      I18n.t('event.from', {count: event.min_price})}
                </Text>
                <Image style={styles.euro} source={require('../../assets/icons/listClock.png')}/>
                <Text style={styles.detail}>{start_date.format('HH:mm')} hrs</Text>
              </View>*/}
            </View>
          </View>



        <View style={styles.container}>
          <TouchableOpacity style={styles.touch} onPress={onPress}>
            <CachedImage style={styles.cover} source={{uri: event.cover_img}}>
              {/*<View style={styles.dateContainer}>
                <Text style={[styles.date, styles.dateDay]}>
                  {start_date.format('DD').toUpperCase()}
                </Text>
                <Text style={[styles.date, styles.dateMonth]}>
                  {start_date.format('MMM').toUpperCase()}
                </Text>
                {isLive && <View style={styles.liveContainer}>
                  <Icon name="circle" color="#EC4D4F" size={7}/><Text style={styles.live}>{I18n.t('event.live')}</Text>
                </View>}
              </View>*/}

              {/*<TouchableOpacity style={btnFavStyle} onPress={this.props.onPressFavorite}>
                <Image source={require('../../assets/icons/icStarActive.png')}/>
              </TouchableOpacity>*/}

            </CachedImage>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{event.name}</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>


        </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: Color.CONTRAST_COLOR,
    borderWidth: 0.0,
    borderRadius: 12,

    marginBottom: 20,
    minHeight: 200,

    shadowColor: Color.DARK_TEXT_COLOR,
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: {width: 1, height: 1},
  },
  touch: {
    flex: 1,
    backgroundColor: Color.TRANSPARENT,
  },
  cover: {
    backgroundColor: Color.CONTRAST_COLOR,
    // resizeMode: 'cover',
    height: 180,
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  titleContainer: {
    backgroundColor: Color.CONTRAST_COLOR,
    paddingLeft: 8,
    alignItems: 'center',
    height: 80,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    backgroundColor: Color.TRANSPARENT,

    color: Color.DARK_TEXT_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 17.5,
    top: 6,
    height: 25,
    paddingHorizontal: 8,
    alignSelf:'flex-start'
  },
  description: {
    backgroundColor: Color.TRANSPARENT,
    top: 10,
    color: Color.INFO_COLOR,
    ...Font.FONT_MEDIUM,
    fontSize: 12,
    height: 34,
    paddingHorizontal: 8,
    alignSelf:'flex-start',
  },
  btnFavorite: {
    position: 'absolute',
    backgroundColor: Color.CAMEL,
    right: 7.5,
    bottom: 7.5,
    height: 44,
    width: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',

    shadowColor: 'black',
    shadowRadius: 2,
    shadowOpacity: 0.5,
    shadowOffset: {width: 0, height: 1},
  },
  btnFavoriteActive: {
    backgroundColor: Color.BLUE,
  },
  dateContainer: {
    alignItems: 'center',
    backgroundColor: Color.CONTRAST_COLOR,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    top: 0,
    width: 51.5,
    height: 60,
  },
  date: {
    backgroundColor: 'transparent',
    ...Font.FONT_BOLD,
  },
  dateDay: {
    fontSize: 17.5,
  },
  dateMonth: {
    fontSize: 13.5,
  },
  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  live: {
    backgroundColor: 'transparent',
    color: '#EC4D4F',
    fontSize: 14,
    ...Font.FONT_BOLD_ITALIC,
    marginLeft: 3,
  },
  infoContainer: {
    flexDirection: 'row',
    backgroundColor: Color.TRANSPARENT,
    paddingHorizontal: 6,
    paddingVertical: 6.5,
  },
  hostContainer: {
    justifyContent: 'center',
    marginLeft: 10,
  },
  hostName: {
    ...Font.FONT_BOLD,
    fontSize: 15,
  },
  hostHandle: {
    color: Color.WARM_GREY,
    ...Font.FONT_ITALIC,
    fontSize: 14,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  detail: {
    ...Font.FONT_LIGHT,
    fontSize: 12.5,
    marginLeft: 4,
  },
  euro: {
    marginLeft: 14,
  },
})

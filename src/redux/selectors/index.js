import {createSelector} from 'reselect'
import {UserCard} from '../../TypeDefinition'
import moment from 'moment'

const _getPaymentSources = (state) => state.payment.sources
const _getBankAccounts = (state) => state.payouts.accounts
const _getNearEvents = (state) => state.events.nearEvents
const _getEvents = (state) => state.events.entities
const _getUsers = (state) => state.user.entities
const _getUserFollowers = (state, userId) => state.user.followers[userId]
const _getUserFollowing = (state, userId) => state.user.following[userId]
const _getUserPhotos = (state, userId) => state.userPhotos.byUser[userId]
const _getFavoriteEvents = (state) => state.favorites.events
const _getEventsFilter = (state) => state.eventsFilter
const _getChatMessages = (state, groupUid) => state.chat.messages[groupUid]
const _getBanners = (state) => state.banners.byId

export const getNearEvents: Array = createSelector(
  [_getNearEvents, _getEvents],
  (nearEvents, events) => {
    const eventKeys = Object.keys(nearEvents)
    const now = new Date().getTime()

    const map = eventKeys.map(_key => {
      const event = events[_key]
      const hasData = event ? Object.keys(event).length > 1 : false
      return hasData ? {...event, _key, _distance: nearEvents[_key]} : undefined
    })

    return map.filter(e => {
      return e !== undefined
    })
  },
)

export const getFilteredNearEvents: Array = createSelector(
  [getNearEvents, _getEventsFilter, _getFavoriteEvents],
  (nearEvents, filter, favorites) => {

    if (filter.currentFilter === 'FAVORITES') {
      return nearEvents.filter(e => favorites.indexOf(e._key) !== -1)

    } else {

      return nearEvents
      //Filter by date
        .filter(e => {
          if (!filter.date) {
            return true
          }
          const startDate = moment.unix(e.start_date)
          const endDate = moment.unix(e.end_date)
          //https://momentjs.com/docs/#/query/is-between/
          return moment(filter.date).isBetween(startDate, endDate, 'day', '[]')
        })
        //Filter active category
        .filter(e => {
          if (!filter.activeCategory) {
            return true
          }
          return e.categories.indexOf(filter.activeCategory) !== -1
        })
        //Filter by selected place types
        // .filter(e => filter.placeTypes.length > 0 ? filter.placeTypes.indexOf(e.place_type) > -1 : true)
        // //Filter by price range
        // .filter(e => {
        //   if (filter.minPrice && filter.minPrice > e.min_price) {
        //     return false
        //   }
        //   if (filter.maxPrice && e.max_price > filter.maxPrice) {
        //     return false
        //   }
        //
        //   return true
        // })
    }

    return nearEvents
  },
)

export const getPaymentSources: Array<UserCard> = createSelector(_getPaymentSources, sources => {
  if (!sources) {
    return []
  }

  return Object.keys(sources).map(_key => {
    const source = sources[_key]

    return {...source, _key}
  }).filter(s => !s.is_deleted)
})

export const getBankAccounts: Array<UserCard> = createSelector(_getBankAccounts, accounts => {
  if (!accounts) {
    return []
  }

  return Object.keys(accounts).map(_key => ({ ...accounts[ _key ], _key }))
})

export const getUserFollowers: Array = createSelector(
  [_getUsers, _getUserFollowers],
  (users, followers) => {
    const _followers = followers || {}
    return Object.keys(_followers).map(_key => ({...users[_key], _key,}))
  },
)

export const getUserFollowing: Array = createSelector(
  [_getUsers, _getUserFollowing],
  (users, following) => {
    const _following = following || {}
    return Object.keys(_following).map(_key => ({...users[_key], _key,}))
  },
)

export const getContacts: Array = createSelector(
  [_getUsers, _getUserFollowing, _getUserFollowers],
  (users, following, followers) => {
    const _following = Object.keys(following || {})
    const _followers = Object.keys(followers || {})
    const unique = new Set(_followers.concat(_following))
    return Array.from(unique).map(_key => ({...users[_key], _key,}))
  },
)

export const getChatMessages: Array = createSelector(
  [_getChatMessages],
  (messages) => {
    return Object.keys(messages || {}).map(_key => ({...messages[_key], _key}))
  },
)

export const getUserPhotos: Array = createSelector(
  [_getUserPhotos],
  (photos) => {
    return Object.keys(photos || {}).map(_key => ({...photos[_key], _key}))
  },
)

export const getBanners: Array = createSelector(
  [_getBanners],
  (banners) => {
    const now = new Date().getTime()
    return Object
      .keys(banners || {})
      .map(id => ({...banners[id], _key: id}))
      .filter(banner => {
        return now >= banner.start_date * 1000 && now < banner.end_date * 1000
      })
  },
)

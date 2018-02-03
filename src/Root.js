import React, {Component} from 'react'
import {BackHandler, AsyncStorage} from 'react-native'
import {Provider} from 'react-redux'
import {createStore, applyMiddleware} from 'redux'
import thunk from 'redux-thunk'
import AppReducer from './redux/reducers'
import {createLogger} from 'redux-logger'
import {persistStore, autoRehydrate} from 'redux-persist'
import Firebase from './utils/Firebase'
import {CONFIG} from './constants/Firebase'
import {NavigationActions} from 'react-navigation'
import {composeWithDevTools} from 'redux-devtools-extension'
import App from './App'

Firebase.init(CONFIG)

const middlewares = [thunk]

if (__DEV__) {
  const logger = createLogger()
  console.ignoredYellowBox = ['Setting a timer', 'Using <Image>']
  // middlewares.push(logger)
}
const store = createStore(AppReducer, composeWithDevTools(
    applyMiddleware(...middlewares),
    autoRehydrate(),
))

if (module.hot) {
  module.hot.accept(() => {
    const nextRootReducer = require('./redux/reducers').default
    store.replaceReducer(nextRootReducer)
  })
}

// begin periodically persisting the store
export const reduxPersist = persistStore(store,
    {
      whitelist: ['currentUser', 'userEvents', 'favorites', 'notification', 'chat'],
      storage: AsyncStorage,
    })

// reduxPersist.purge()
// ImageCache.get().clear();

export default class Root extends Component {
  componentDidMount() {
    BackHandler.addEventListener('backPress', this.onBackPress)
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('backPress')
  }

  onBackPress = () => {
    if (!store.getState().event.isPushing) {
      store.dispatch(NavigationActions.back())
    }
    return true
  }

  render() {
    return (
        <Provider store={store}>
          <App/>
        </Provider>
    )
  }
}
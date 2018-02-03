import React, { Component } from 'react'
import {
  View,
  StyleSheet
} from 'react-native'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import I18n from '../i18n'
import { connect } from 'react-redux'
import UserListContainer from '../containers/UserListContainer'
import { getUserFollowers } from '../redux/selectors/index'
import { fetchFollowers, fetchUser } from '../redux/actions/user'
import { navigate } from '../redux/actions/nav'

@connect((state, ownProps) => UserFollowersScreen.getStateProps(state, ownProps))
export default class UserFollowersScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: I18n.t('userFollowersScreen.title'),
    headerLeft: <NavBackButton />
  })

  static getStateProps(state, ownProps) {
    return {
      userId: ownProps.navigation.state.params.id,
      users: getUserFollowers(state, ownProps.navigation.state.params.id),
      followers: state.user.followers[ownProps.navigation.state.params.id]
    }
  }

  componentDidMount() {
    this.props.dispatch(fetchFollowers(this.props.userId))
  }

  componentWillReceiveProps(nextProps) {
    const followers = Object.keys(nextProps.followers || {})
    console.log(followers)
    if (this.props.users.length !== followers.length) {
      followers.forEach(uid => this.props.dispatch(fetchUser(uid)))
    }
  }

  onPressUser = user => {
    this.props.dispatch(navigate('UserLinkHandler', { id: user._key }))
  }

  render() {
    return (
        <View style={styles.container}>
          <UserListContainer
              users={this.props.users}
              onPressUser={this.onPressUser}
          />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.CONTRAST_COLOR
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyStateText: {
    color: Color.CONTRAST_COLOR,
    maxWidth: 250,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20
  },
  searchContainer: {
    paddingHorizontal: 25,
    marginVertical: 10
  }
})

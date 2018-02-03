import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Image,
  Text,
} from 'react-native'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import I18n from '../i18n'
import * as Font from '../constants/Font'
import NavButton from '../components/NavButton'
import SearchInput from '../components/SearchInput'
import {connect} from 'react-redux'
import {getContacts} from '../redux/selectors/index'
import {fetchUser} from '../redux/actions/user'
import {clearChat, createChat} from '../redux/actions/chat'
import {NavigationActions} from 'react-navigation'
import UserListContainer from '../containers/UserListContainer'

@connect((state, ownProps) => NewMessageScreen.getStateProps(state, ownProps))
export default class NewMessageScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('newMessageScreen.title'),
    headerLeft: <NavBackButton/>,
    headerRight: <NavButton
        loading={navigation.state.params ? navigation.state.params.isCreating : false}
        disabled={navigation.state.params ? !navigation.state.params.isValid : true}
        onPress={navigation.state.params ? navigation.state.params.onPressNext : null}
        label={I18n.t('newMessageScreen.next')}/>,
  })

  static getStateProps(state, ownProps) {
    return {
      contacts: getContacts(state, state.currentUser.uid),
      chatId: state.chat.lastGroupCreated,
      isCreating: state.chat.isCreating,
    }
  }

  state = {
    selected: [],
    searchTerm: null,
  }

  componentWillMount() {
    if (this.props.chatId) {
      this.props.dispatch(NavigationActions.back())
    }
  }

  componentDidMount() {
    this.props.navigation.setParams({onPressNext: this.onPressNext})
    this.fetchContacts()
  }

  componentWillUnmount() {
    if (this.props.chatId) {
      this.props.dispatch(clearChat(this.props.chatId))
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.contacts.length !== nextProps.contacts.length) {
      this.fetchContacts()
    }
    if (this.props.isCreating && !nextProps.isCreating) {
      this.props.navigation.navigate('Conversation', {id: nextProps.chatId})
    }
  }

  onPressNext = () => {
    this.props.navigation.setParams({isCreating: true,})
    this.props.dispatch(createChat(this.state.selected))
  }

  fetchContacts() {
    const missingContacts = this.props.contacts.filter(user => !user.display_name)
    if (missingContacts.length > 0) {
      missingContacts.forEach(user => this.props.dispatch(fetchUser(user._key)))
    }
  }

  onPressContact = (contact) => {
    let selected = this.state.selected.slice()

    if (selected.indexOf(contact._key) !== -1) {//remove from array if exists
      selected = selected.filter(id => id !== contact._key)
    } else {
      selected.push(contact._key)
    }

    this.props.navigation.setParams({isValid: selected.length > 0})

    this.setState({
      selected,
    })
  }

  onChangeSearch = (searchTerm) => {
    this.setState({searchTerm})
  }

  renderEmptyState() {
    return (
        <View style={styles.container}>
          <View style={styles.emptyStateContainer}>
            <Image source={require('../../assets/icons/newMessageEmptyState.png')}/>
            <Text style={styles.emptyStateText}>{I18n.t('newMessageScreen.emptyState')}</Text>
          </View>
        </View>
    )
  }

  render() {
    let contacts = this.props.contacts
    if (contacts.length === 0) {
      return this.renderEmptyState()
    }

    if (this.state.searchTerm) {
      contacts = contacts.filter(
          c => !c.display_name || c.display_name.toLowerCase().indexOf(this.state.searchTerm.toLowerCase()) !== -1)
    }

    return (
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <SearchInput
                onChangeText={this.onChangeSearch}
                placeholder={I18n.t('newMessageScreen.search')}
            />
          </View>
          <UserListContainer
              users={contacts}
              selected={this.state.selected}
              onPressUser={this.onPressContact}
          />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.GRAY,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: Color.INFO_COLOR,
    maxWidth: 250,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 20,
  },
  searchContainer:{
    paddingHorizontal: 25,
    marginVertical: 10,
  },
})
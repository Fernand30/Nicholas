import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
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
import {clearChat, createChat, addUsers} from '../redux/actions/chat'
import {NavigationActions} from 'react-navigation'
import UserListContainer from '../containers/UserListContainer'
import * as firebase from 'firebase'

@connect((state, ownProps) => NewMessageScreen.getStateProps(state, ownProps))
export default class NewMessageScreen extends Component {

  static navigationOptions = ({navigation, screenProps}) => {
    const { params = {} } = navigation.state;
    groupKey = navigation.state.params.groupKey
    return{
      title: <Text style={{fontSize:18,color:'white'}}>Add User</Text>,
      headerLeft: <NavBackButton/>,
      headerRight: <TouchableOpacity onPress={() => params.handleSave()} 
                      style={{justifyContent:'center',alignItems:'center'}}>
                    <Text style={{fontSize:18,color:'white'}}>
                    Done
                    </Text>
                </TouchableOpacity>,
      }
  }

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

  goAdd(){
    let selectedKey = this.state.selected
    addData ={}
   for(i = 0; i<selectedKey.length; i++){
      addData[selectedKey[i]] = true
   }
    this.props.dispatch(addUsers(addData,groupKey)) 
    this.props.navigation.goBack(null)
  }

  componentDidMount() {
    this.props.navigation.setParams({ handleSave: this.goAdd.bind(this) });
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
    backgroundColor: Color.BACKGROUND_COLOR,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: Color.CONTRAST_COLOR,
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
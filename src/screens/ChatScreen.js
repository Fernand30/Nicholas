import React, {Component} from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  ActivityIndicator,
} from 'react-native'
import NavBackButton from '../components/NavBackButton'
import * as Color from '../constants/Color'
import I18n from '../i18n'
import * as Font from '../constants/Font'
import Avatar from '../components/Avatar'
import moment from 'moment'
import NavImageButton from '../components/NavImageButton'
import SearchInput from '../components/SearchInput'
import Divider from '../components/Divider'
import TabBarIcon from '../components/TabBarIcon'
import {connect} from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'
import Button from '../components/Button'
import {fetchChats, fetchMessages} from '../redux/actions/chat'
import AppWithNavigationState from '../AppNavigator'
import * as firebase from 'firebase'


@connect((state, ownProps) => ChatScreen.getStateProps(state, ownProps))
export default class ChatScreen extends Component {

  constructor(props){
    super(props)
    this.state=({
      count: 0,
      searchText:'',
      propstate: this.props,
    })
    flag = 0;
    itemCount = 0;
  }

  static navigationOptions = ({navigation, screenProps}) => ({
    headerLeft: <NavBackButton/>,
    headerRight: (
        <NavImageButton
            onPress={() => {
              navigation.navigate('NewMessage')
            }}
            source={require('../../assets/icons/addChat.png')}/>
    ),
    title: I18n.t('chatScreen.title'),
    tabBarLabel: I18n.t('chatScreen.tab'),
    tabBarIcon: (props) => (
        <TabBarIcon
                    {...props}
                    iconSource={require('../../assets/Images_Icons/Tabs/tab_search_gray.png')}
                    focusedIconSource={require('../../assets/Images_Icons/Tabs/tab_search_blue.png')}
                    
                    />
    ),
  })

  static getStateProps(state) {
    
      return {
        currentUserUid: state.currentUser.uid,
        groups: state.chat.groups,
        users: state.user.entities,
        isFetchingUser: state.currentUser.isFetching,
      }
  }

  componentDidMount() {
    if (!this.props.isFetchingUser) {
      this.props.dispatch(fetchChats())
    }
  }

  refresh(){
    this.componentDidMount()
  }

  componentWillReceiveProps(nextProps) {
    componentProps = nextProps
    if (this.props.isFetchingUser && !nextProps.isFetchingUser) {
      this.props.dispatch(fetchChats())
    }

    const groupCount = Object.keys(this.props.groups || {}).length
      if (groupCount > 0) {
        //Fetch messages
        Object.keys(this.props.groups).forEach(group => {
          this.props.dispatch(fetchMessages(group, group.last_message_timestamp))
        })
      }
      this.setState({propstate: nextProps})
      
    }

  onPressChat(chat, title, isGroup) {
    
    this.props.navigation.navigate('Conversation', {
      title:title,
      id: chat._key,
      isGroup: isGroup,
      item: chat,
      onRefresh: ()=>{
        this.refresh()
      }
    })
  }

  onPressStartConversation = () => {
    this.props.navigation.navigate('NewMessage')
  }

  renderChat = ({item}) => {
    itemCount ++;
        let groupKey = item._key
        if(searchUid[groupKey] == 0){
          return null
        }else{
          searchUid[groupKey] =  0;
        }
        const {members = {}} = item
        const memberUids = Object.keys(members).filter(uid => uid !== this.props.currentUserUid)

        let profileImg = ''
        let title  =''
        let names = []

        if(memberUids.length>1) {
          isGroup = true; 
          groupNumber ++;
          profileImg=require('../../assets/images/icon_group_chat.png')
          groupIndex++;  
          title=item.groupname   
         }else{
           
           isGroup = false
           const user = this.props.users[memberUids[0]]
           if(!user) {return}
           profileImg = {uri: user.profile_img}
           title = user.display_name 
         }

        if(this.state.searchText!=''){
             flag = 0;
             for(i = 0;i<memberUids.length;i++){
                 user = this.props.users[memberUids[i]].display_name
                if(user) {
                   if(user.includes(this.state.searchText)) flag = 1;
                }
             }
             if((!title.includes(this.state.searchText))&&(flag==0)) return null;          
        }

        if (title=='') {
          
          memberUids.forEach(uid => {
            if (this.props.users[uid]) {
              names.push(this.props.users[uid].username || this.props.users[uid].display_name)
            }
          })

          title = names.length > 0 ? names.join(', ') : `${I18n.t('chatScreen.loading')}...`
        }

        
        const message = item.last_message || I18n.t('chatScreen.defaultMsg')
        const messageStyle = item.last_message ? styles.chat : [styles.chat, styles.chatDefault]
        return (
            <TouchableHighlight
                onPress={this.onPressChat.bind(this, item, title, isGroup)}
                activeOpacity={1}
                underlayColor={Color.GREYISH_BROWN}>
              <View style={styles.chatBubble}>
                <Avatar size={50} source={profileImg} style={styles.chatAvatar}/>
                <View style={styles.chatContent}>
                  <View style={styles.chatNameContainer}>
                    <Text style={styles.chatName} numberOfLines={1}>{title}</Text>
                    <Text style={styles.chatTimestamp}>{moment(item.last_message_timestamp || item.timestamp)
                        .fromNow()}</Text>
                  </View>
                  <Text style={messageStyle} numberOfLines={2}>{message}</Text>
                </View>
              </View>
            </TouchableHighlight>
        )
  }

  renderEmptyState() {

    return (
        <View style={styles.container}>
          <View style={styles.emptyStateContainer}>
            <Icon name="ios-chatbubbles" color={Color.CONTRAST_COLOR} size={40} style={styles.emptyStateIcon}/>
            <Button label={I18n.t('chatScreen.startConversation')} onPress={this.onPressStartConversation}/>
          </View>
        </View>
    )
  }

  renderLoading() {
    return (
        <View style={styles.container}>
          <View style={styles.emptyStateContainer}>
            <ActivityIndicator color={Color.CONTRAST_COLOR}/>
          </View>
        </View>
    )
  }

  chatSearch(text){
    this.setState({
      searchText: text
    })
  }

  goBack(){
    this.props.navigation.navigate('Chat')
  }

  render() {
    groupIndex = 0;
    groupNumber = 0;
    itemCount = 0;
    
    searchUid = {}
    const {groups = {}, isFetchingUser} = this.state.propstate
    const groupUids = Object.keys(groups)
    if (isFetchingUser && groupUids.length === 0) {
      this.renderLoading()
    }

    if (groupUids.length === 0) {
      return this.renderEmptyState()
    }

    const data = groupUids
        .map(uid => ({...groups[uid], _key: uid}))
        .sort((a, b) => {
          return (b.last_message_timestamp || b.timestamp) > (a.last_message_timestamp || a.timestamp)
        })
    var i = 0;
   
    length = data.length;
    
    return (
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <SearchInput onChangeText={(text) => this.chatSearch(text)} placeholder={I18n.t('chatScreen.search')}/>
          </View>
          <FlatList
              removeClippedSubviews={false}
              data={data}
              keyExtractor={(item, i) => item._key}
              renderItem={this.renderChat}
              ItemSeparatorComponent={() => <Divider/>}
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
  searchContainer:{
    paddingHorizontal: 25,
    marginVertical: 10,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    marginBottom: 10,
  },
  chatBubble: {
    // backgroundColor: Color.GREYISH_BROWN,
    flexDirection: 'row',
    flex: 1,
    padding: 10,
  },
  chatContent: {
    marginLeft: 13.5,
    flex: 1,
  },
  chatAvatar: {},
  chatNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  chatName: {
    color: Color.DARK_TEXT_COLOR,
    lineHeight: 22,
    fontSize: 15,
    ...Font.FONT_BOLD,
    maxWidth: 180,
  },
  chat: {
    color: Color.CONTRAST_COLOR,
    fontSize: 12,
    lineHeight: 16,
    ...Font.FONT_LIGHT,
  },
  chatDefault: {
    color: Color.WARM_GREY,
  },
  chatTimestamp: {
    textAlign: 'right',
    flex: 1,
    color: Color.WARM_GREY,
    fontSize: 12,
    ...Font.FONT_BOLD,
  },
})
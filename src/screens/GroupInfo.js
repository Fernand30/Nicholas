import React, {Component} from 'react'
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  ActivityIndicator,
  Image,
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
import {fetchChats, fetchMessages, getUsers} from '../redux/actions/chat'
import AppWithNavigationState from '../AppNavigator'

@connect((state, ownProps) => ChatScreen.getStateProps(state, ownProps))
export default class ChatScreen extends Component {

  constructor(props){
    super(props)
    this.state=({
      count: 0,
      searchText:'',
      groupName: ''
    })
  }

  static navigationOptions = ({navigation, screenProps}) => {
    userUids = navigation.state.params.userUids
    title = navigation.state.params.title
    groupKey = navigation.state.params.groupKey
    onConversation = navigation.state.params.changeTitle
    return{
      headerLeft: <NavBackButton/>,
    
      title: <Text style={{fontSize:18,color:'white'}}>GroupInfo</Text>,
    }
  }


  static getStateProps(state) {
    //alert(Object.keys(state.currentUser.profile.chat_groups)[0])
      return {
        currentUserUid: state.currentUser.uid,
        groups: state.chat.groups,
        users: state.user.entities,
        isFetchingUser: state.currentUser.isFetching,
      }
  }

  componentDidMount() {
    // if (!this.props.isFetchingUser) {
    //   this.props.dispatch(fetchChats())
    // }
    this.setState({title: title}) 
  }

  changeTitle(title){
    this.setState({title: title}) 
    onConversation(title)
  }

  componentWillReceiveProps(nextProps) {
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
    }

  onPressStartConversation = () => {
    this.props.navigation.navigate('NewMessage')
  }

  renderChat = ({item}) => {

    pic = item.img    
     
        return (
            <View style={{flexDirection:'row',alignItems:'center',paddingLeft:20,marginTop:10}} >
               <Image source={{uri:pic}} style={{width:50,height:50,borderRadius:25}}/>
               <Text style={{color:'white'}} > {item.id}</Text>
            </View>
        )
    
  }

  renderEmptyState() {

    return (
        <View style={styles.container}>
          <View style={styles.emptyStateContainer}>
            <Icon name="ios-chatbubbles" color={Color.CONTRAST_COLOR} size={40} style={styles.emptyStateIcon}/>
            <Button label={I18n.t('chatScreen.startConversation')} onPress={this.onPressStartConversation} />
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

  goAddUser(){
    this.props.navigation.navigate('AddUser',{groupKey: groupKey})
  }

  goNameEdit(){
    this.props.navigation.navigate('EditName',{groupName:title,groupKey: groupKey, onBack: (param)=>{
      this.changeTitle(param)
    }})
  }

  render() {
    
    searchUid = {}
    const {groups = {}, isFetchingUser} = this.props
  
    const groupUids = Object.keys(groups)
    if (isFetchingUser && groupUids.length === 0) {
      this.renderLoading()
    }

    if (groupUids.length === 0) {
      return this.renderEmptyState()
    }

    const data = Object.keys(userUids.members);
    let Udata  = []
    Udata  = this.props.dispatch(getUsers(data)) 
    
    return (
        <View style={styles.container}>
          <TouchableOpacity onPress={this.goNameEdit.bind(this)} style={{marginTop:40,borderColor:'#474747',borderBottomWidth:1,height:60,justifyContent:'center'}}>
              <View style={{marginLeft:20,marginRight:20,flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderColor:'#010101',borderBottomWidth:2}}>
                <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                    <Image source={require('../../assets/images/icon_group_chat.png')} style={{width:50,height:50,borderRadius:25}} />
                    <Text style={{marginLeft:10,fontSize:18,color:'white'}}>Edit Name</Text>
                    <Text style={{marginLeft:10,fontSize:16,color:'#787878'}}>({this.state.title})</Text>
                </View>    
                <Text style={{fontSize:16,color:'#787878'}}>&gt;</Text>
              </View>  
          </TouchableOpacity>

          <TouchableOpacity onPress={this.goAddUser.bind(this)} style={{marginTop:10,borderColor:'#474747',borderBottomWidth:1,height:60,justifyContent:'center'}}>
              <View style={{marginLeft:20,marginRight:20,flex:1,flexDirection:'row',alignItems:'center',justifyContent:'space-between',borderColor:'#010101',borderBottomWidth:2}}>
                <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                    <View style={{width:40,height:40,borderRadius:20, backgroundColor:'white',alignItems:'center'}}>
                        <Text style={{backgroundColor:'transparent',fontSize:28}}> + </Text>
                    </View>    
                    <Text style={{marginLeft:10,fontSize:18,color:'white'}}>Add User</Text>
                </View>    
                <View/>
              </View>  
          </TouchableOpacity>
          <Text style={{marginTop:20,marginBottom:20, color:'white',fontSize:20,textAlign:'center'}}>{data.length} Paticipants</Text>
          
          <FlatList
              data={Udata}
              renderItem={this.renderChat}
              keyExtractor={item => item.id}
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
    color: Color.CONTRAST_COLOR,
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
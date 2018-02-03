import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image
} from 'react-native'
import _ from 'lodash'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'
import I18n from '../i18n'
import NavBackButton from '../components/NavBackButton'
import SearchInput from '../components/SearchInput'
import RNGooglePlaces from 'react-native-google-places'
import GeoHelper from '../utils/GeoHelper'
import {connect} from 'react-redux'
import SegmentedControl from '../components/SegmentedControl'
import {getNearEvents,getContacts,getUserFollowing,getUserFollowers} from '../redux/selectors/index'
import ButtonNavigate from '../components/ButtonNavigate'
import TabBarIcon from '../components/TabBarIcon'
import NavImageButton from '../components/NavImageButton'
import moment from 'moment'
import Divider from '../components/Divider'
import {fetchEvent} from '../redux/actions/event'
import {navigate} from '../redux/actions/nav'
import {contactApi} from '../redux/actions/currentUser'
import { fetchUser,followUser, unFollowUser } from '../redux/actions/user'

const TABS = [
  I18n.t('searchScreen.Top'),
  I18n.t('searchScreen.People'),
  I18n.t('searchScreen.Tags'),
  I18n.t('searchScreen.Place')
]

@connect((state, ownProps) => SearchScreen.getStateProps(state, ownProps))
export default class SearchScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
   
    headerTitle: (
        <Image style={{ width: 40, height: 40, alignSelf: 'center' }}
               source={require('../../assets/Images_Icons/logo_nav.png')} />
    ),
    
    tabBarLabel: I18n.t('profileScreen.tab'),
      tabBarIcon: (props) => (
          <TabBarIcon
              {...props}
              iconSource={require('../../assets/Images_Icons/Tabs/tab_search_gray.png')}
            focusedIconSource={require('../../assets/Images_Icons/Tabs/tab_search_blue.png')}/>
      )
  })

  static getStateProps(state, ownProps) {
    const isMyProfile = !ownProps.navigation.state.params || !ownProps.navigation.state.params.id
    const userId = !isMyProfile ? ownProps.navigation.state.params.id : state.currentUser.uid
    //const isFollowing = _.get(state.user.following, `${state.currentUser.uid}.${userId}`, false)    
    return {
      nearEvents: getNearEvents(state),
      events: state.events.entities,
      loadingEvents: state.events.fetching,
      currentUid: userId,
      isFollowing:state.user.following
    }
  }

  constructor(props){
    super(props)
    followingList=[];
    realList=[];
    this.state = ({
      isEvent: true,
      userName: '',
      eventName:'',
      currentTabIndex: 0,
      value:[],
      uidArray:[],
      dataArray:[]
    })
  }

  componentDidMount() {
    that = this;
    tem = [];
    
    if(this.props.isFollowing[followingList]!=null){
      followingList = Object.keys(this.props.isFollowing)[0]
      realList = Object.keys(this.props.isFollowing[followingList])
    }
    followingList = Object.keys(this.props.isFollowing)[0]
    if(this.props.isFollowing[followingList]!=null){
      realList = Object.keys(this.props.isFollowing[followingList])
    }
    //alert(JSON.stringify(this.props.navigation.state.params))
    if(this.props.navigation.state.params){
      access_token  =this.props.navigation.state.params.access_token
      client  =this.props.navigation.state.params.client
      uid  =this.props.navigation.state.params.uid
    contactApi(access_token,client,uid).then((response)=>response.json()).then((data)=>{
      that.setState({dataArray:data})
      // alert(that.state.dataArray[0].id)
    }).catch(function(err){
      alert(err)
    })
    }
    
  }

  onChangeTab = (index) => {
    this.setState({ currentTabIndex: index, userName:''})
  }

  onChangeUserText = text => {
    this.setState({userName:text})
  }

  onPressUser = id => {
    this.props.dispatch(navigate('UserLinkHandler', {id:id}))
    //this.props.user.entities[id]
  }


  onPressEvent = id => {
    this.props.dispatch(navigate('Event', {id}))
  }
  
  onPressFollow = (uid) => {
      this.props.dispatch(followUser(uid))
  }

  goFollow(uid){
    //alert(Object.keys(this.props))
    this.onPressFollow(uid)
    realList.push(uid)
    this.setState({uidArray:realList})
  }

  renderUsers(value) {
   // alert(this.props)
    const {nearEvents, events} = this.props
    let list = []

    if(this.state.currentTabIndex==0){
      list = Object.keys(value)
      if (list.length === 0) {
        return (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No user found</Text>
          </View>
        )
      }
      return (
          <View>
            {list.map(this.renderUser)}
          </View> 
        )
    }else if(this.state.currentTabIndex==1){
      list = Object.keys(value)
      if (list.length === 0) {
        return (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No user found</Text>
          </View>
        )
      }
      return (
          <View>
           {list.map(this.renderUser)}
          </View>
        )
    }else if(this.state.currentTabIndex==2){
      list = nearEvents
      if (list.length === 0) {
        return (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No events found</Text>
          </View>
        )
      }

      return (
        <View>
          {list.map(this.renderEvent)}
        </View>
      )
    }else if(this.state.currentTabIndex==3){
      list = nearEvents
      if (list.length === 0) {
        return (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>No events found</Text>
          </View>
        )
      }

      return (
        <View>
          {list.map(this.renderPeople)}
        </View>
      )
    }
      
    
  }

  componentWillReceiveProps(nextProps) {
    
  }


  renderUser = key => {
    if(key==this.props.currentUid) return;
    user = userArray[key]
    
    const profileImg = user.profile_img
    const displayName = user.display_name
    const followText = (this.state.uidArray.indexOf(key)==-1)?'Follow':'Following';
    const onPress = key ? this.onPressUser.bind(this, key) : null
    const searchText = this.state.userName
    if(searchText!=''&&displayName.toLowerCase().indexOf(searchText.toLowerCase())==-1) return null
    return (
      <View key={key} onPress={onPress}>
            <View style={styles.userContainer}>
              <Image source={{uri:profileImg}} style={{width:60,height:60,borderRadius:30,resizeMode:'cover'}}/>
              <Text style={styles.tabUserName}>{displayName}</Text>
              <View style={{flex:1,justifyContent:'center',alignItems:'flex-end',paddingRight:5}}>
                <TouchableOpacity onPress={this.goFollow.bind(this,key)} 
                         style={(this.state.uidArray.indexOf(key)==-1)?styles.followingButton:styles.followButton}>
                  <Text style={(this.state.uidArray.indexOf(key)==-1)?styles.followingText:styles.buttonText}>{followText}</Text>
                </TouchableOpacity>
              </View>
            </View>
      </View>
    )
  }

  renderEvent = event => {
    const {name = 'Loading...', cover_img, user, categories} = event
    let allCat = ''
    
    for(i=0;i<categories.length;i++){
      allCat = allCat + categories[i]
    }
    const displayName = user.display_name
    const searchText = this.state.userName
    if(searchText!=''&&allCat.toLowerCase().indexOf(searchText.toLowerCase())==-1) return null

    const onPress = event._key ? this.onPressEvent.bind(this, event._key) : null

    return (
      <ButtonNavigate key={event._key} onPress={onPress}>
          <View style={styles.tabEventContainer}>
            <Image source={{uri:cover_img}} style={{width:60,height:60,borderRadius:5,resizeMode:'cover'}}/>
            <View style={{marginLeft: 20,paddingVertical:5,justifyContent:'space-between'}}>
              <Text style={styles.tabEventName}>{name}</Text>
              <Text style={styles.tabDisplayName}>{displayName}</Text>
            </View>
          </View>
        <Divider/>
      </ButtonNavigate>
    )
  }

  renderPeople = event => {
    const {name = 'Loading...', cover_img, user, categories, address} = event
    let allCat = ''
    
    const displayName = user.display_name
    const searchText = this.state.userName
    if(searchText!=''&&address.toLowerCase().indexOf(searchText.toLowerCase())==-1) return null

    const onPress = event._key ? this.onPressEvent.bind(this, event._key) : null

    return (
      <ButtonNavigate key={event._key} onPress={onPress}>
          <View style={styles.tabEventContainer}>
            <Image source={{uri:cover_img}} style={{width:60,height:60,borderRadius:5,resizeMode:'cover'}}/>
            <View style={{marginLeft: 20,paddingVertical:5,justifyContent:'space-between'}}>
              <Text style={styles.tabEventName}>{name}</Text>
              <Text style={styles.tabDisplayName}>{displayName}</Text>
            </View>
          </View>
        <Divider/>
      </ButtonNavigate>
    )
  }

  changeUser(){
    this.setState({
        isEvent:false
      })
  }

  renderItem = ({item}) => (
    <View style={styles.contactView}>
        <View style={styles.imageView}/>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
    </View>
  );


  render() {
    currentTabIndex = this.state.currentTabIndex
    userArray = this.state.value
    keys = Object.keys(userArray)
    
    return (
      <View style={styles.container}>
        <View style={{backgroundColor:Color.TAB_BACKGROUND_COLOR,paddingTop:10}}>
          <View style={styles.input}>
              <SearchInput
                textStyle={styles.inputGeo}
                onChangeText={this.onChangeUserText}
                value={this.state.userName}
                placeholder={I18n.t('searchScreen.search')}
                placeholderTextColor='#c6c6c6'/>
          </View>
          <View style={styles.segmentContainer}>
            
          </View>
        </View> 
       
           <FlatList
            data={this.state.dataArray}
            renderItem={this.renderItem}
            keyExtractor={item => item.id}
          />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.CONTRAST_COLOR,
  },
  name:{
    fontSize: 16,
    marginLeft: 20,
    width: 40,
  },
  email:{
    fontSize: 16,
    marginLeft: 20,
  },
  imageView:{
    width: 50,
    height: 50,
    backgroundColor: Color.DARK_TEXT_COLOR,
  },
  contactView:{
    flexDirection:'row',
    alignItems:'center',
    marginTop: 5,
    marginHorizontal: 10,
    borderRadius: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: Color.DARK_TEXT_COLOR,
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: {width: 1, height: 1},
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventsContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal:20
  },
  emptyStateText: {
    color: Color.INFO_COLOR,
  },
  input: {
    marginBottom: 5,
    paddingHorizontal: 20,
  },
  inputGeo: {
    textAlign: 'left',
    paddingLeft: 40,
  },
  innerContainer: {
    flexDirection: 'row',
  },
  segmentedControl: {
    paddingVertical: 12.5,
  },

  //event styles
  tabEventContainer: {
    flexDirection:'row'
  },
  followButton:{
    width: 80,
    height:25,
    borderRadius:3,
    backgroundColor: Color.BTN_COLOR,
    alignItems:'center',
    justifyContent:'center',

    shadowColor: Color.DARK_TEXT_COLOR,
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: {width: 1, height: 1},
  },
  buttonText:{
    fontSize: 12,
    backgroundColor:'transparent',
    color:'white'
  },
  followingButton:{
    width: 80,
    height:25,
    borderRadius:3,
    backgroundColor: 'white',
    alignItems:'center',
    justifyContent:'center',

    shadowColor: Color.DARK_TEXT_COLOR,
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: {width: 1, height: 1},
  },
  followingText:{
    fontSize: 12,
    backgroundColor:'transparent',
  },
  tabUserContainer: {
    marginTop: 10,
    paddingLeft: 0,
    paddingRight: 25,
  },
  userContainer:{
    flexDirection:'row',
    alignItems:'center',
    marginVertical: 10,
  },
  tabEventImageContainer: {
    flexDirection: 'row',
  },
  tabEventDetailContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabEventDate: {
    color: Color.DARK_TEXT_COLOR,
    fontSize: 15,
    ...Font.FONT_LIGHT,
  },
  tabEventStatus: {
    color: Color.DARK_TEXT_COLOR,
    fontSize: 15,
    ...Font.FONT_BOLD_ITALIC,
  },
  segmentContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 0.3,
    borderColor:'#dfe1e4',
    backgroundColor: '#f7f8f9',
  },
  tabEventImage: {
    height: 67,
    width: 67,
    marginRight: 8,
  },
  tabEventImageLoading: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Color.WARM_GREY,
  },
  tabEventName: {
    fontSize: 15,
    ...Font.FONT_BOLD,
    color: Color.DARK_TEXT_COLOR,
  },
  tabDisplayName: {
    fontSize: 13,
    color: Color.DARK_TEXT_COLOR,
  },
  tabUserName: {
    marginLeft:20,
    fontSize: 15,
    ...Font.FONT_BOLD,
    color: Color.DARK_TEXT_COLOR,
  },
})
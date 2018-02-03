import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Text,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'
import I18n from '../i18n'
import NavBackButton from '../components/NavBackButton'
import SearchInput from '../components/SearchInput'
import RNGooglePlaces from 'react-native-google-places'
import GeoHelper from '../utils/GeoHelper'
import {connect} from 'react-redux'
import {getNearEvents} from '../redux/selectors/index'
import Avatar from '../components/Avatar'
import SegmentedControl from '../components/SegmentedControl'
import ButtonNavigate from '../components/ButtonNavigate'
import TabBarIcon from '../components/TabBarIcon'
import NavImageButton from '../components/NavImageButton'
import moment from 'moment'
import Divider from '../components/Divider'
import {fetchEvent} from '../redux/actions/event'
import {fetchAllUser} from '../redux/actions/user'
import {navigate} from '../redux/actions/nav'
import { getContacts } from '../redux/selectors/index'
import Firebase from '../utils/Firebase'

const TABS = [
  I18n.t(''),
]

@connect((state, ownProps) => SearchScreen.getStateProps(state, ownProps))
export default class SearchScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    // headerLeft: <NavBackButton/>,
    // title: 'Search',
    headerLeft: (
        <NavImageButton onPress={() => navigation.navigate('NewEvent')}
                        source={require('../../assets/Images_Icons/btn_add.png')} />
    ),
    headerTitle: (
        <Image style={{ width: 40, height: 40, alignSelf: 'center' }}
               source={require('../../assets/Images_Icons/logo_nav.png')} />
    ),
    headerRight: (
          <NavImageButton
              onPress={() => navigation.navigate('Chat')}
              source={require('../../assets/Images_Icons/btn_chat.png')} />
    ),

    tabBarLabel: I18n.t('profileScreen.tab'),
      tabBarIcon: (props) => (
          <TabBarIcon
              {...props}
              iconSource={require('../../assets/Images_Icons/Tabs/tab_following_gray.png')}
            focusedIconSource={require('../../assets/Images_Icons/Tabs/tab_following_blue.png')}/>
      )
  })

  static getStateProps(state, ownProps) {
    const isMyProfile = !ownProps.navigation.state.params || !ownProps.navigation.state.params.id
    const userId = !isMyProfile ? ownProps.navigation.state.params.id : state.currentUser.uid
    const nearEvents = !isMyProfile ? state.events.entities : state.events.entities
    return {
      nearEvents: getNearEvents(state),
      events: state.events.entities,
      loadingEvents: state.events.fetching,
      currentUid: state.currentUser.uid,
      currentUserName: state.currentUser.profile.display_name,
      currentUser: isMyProfile ? state.currentUser.profile : (state.user.entities[userId] || {}),
      contacts: getContacts(state, state.currentUser.uid),
    }
  }

  constructor(props){
    super(props)
    uidArray=[];
    searchArray=[];
    this.state = ({
      isEvent: true,
      userName: '',
      eventName:'',
      uidArray: [],
    })
    
  }
  state = {
    place: null,
    events: [],
  }
  //Geo
  geoHelper = new GeoHelper()
  eventsQueue = []


  componentDidMount() {
    Firebase.getDbRef(`/users`).once('value').then(function(snapshot){
          value = snapshot.val()
      })
  }

  onPressAddress = () => {
    StatusBar.setHidden(true)
    RNGooglePlaces
      .openAutocompleteModal()
      .then(this.onLocationChanged)
      .catch(error => console.log(error.message))
      .then(() => StatusBar.setHidden(false))
  }

  onLocationChanged = (place) => {
    this.geoHelper.watchKeys({
      latitude: place.latitude,
      longitude: place.longitude,
      radius: 2,
      onKeyNear: this.onEventNear,
      onKeyFar: this.onEventFar,
    })
    this.setState({place})
  }

  onEventNear = (key, location, distance) => {
    if (!this.props.events[key]) {
      this.eventsQueue.push(key)
      this.props.dispatch(fetchEvent(key))
    }

    const events = this.state.events.slice()
    events.push(key)
    this.setState({events})
  }

  onEventFar = (key, location, distance) => {
    const events = this.state.events.slice().filter(_key => _key !== key)
    this.setState({events})
  }

  onChangeText = text => {
    this.setState({eventName:text})
  }

  onChangeUserText = text => {
    this.setState({userName:text})
  }

  onPressEvent = id => {
    this.props.dispatch(navigate('Event', {id}))
  }

  onPressUser = id => {
    this.props.dispatch(navigate('UserLinkHandler', {id:id}))
  }

  renderCurrentTab(uid) {

    const  currentUser = value[uid]
    const {
      display_name = 'Loading...',
      username,
      follower_count = 0,
      following_count = 0,
      occupation = '-',
      address_components,
      sex,
      birth_date,
      rating,
      events_created = {},
      tags,
    } = currentUser

    const age = birth_date ? moment().diff(new Date(birth_date), 'years') : '-'
    const country = address_components ?
        (address_components.country) :
        null
    const province = address_components ?
        (address_components.administrative_area_level_3 || address_components.administrative_area_level_2 ||
            address_components.administrative_area_level_1) :
        null
    const city = address_components ?
        (address_components.locality) :
        null
        // alert(JSON.stringify(tags))

    const totalLocation = (city != null? city:'')+', '+(province != null? province:'')+', '+country
    return (
        <View style={styles.detailContainer}>
          <Text style={styles.infoLabel}>Age        : {age}</Text>
          <Text style={styles.infoLabel}>Sex         : {sex != null? sex:'-'} </Text>
          <Text style={styles.infoLabel}>Location : {country != null? totalLocation:'-'} </Text>
         
          <TouchableOpacity onPress={this.onPressUser.bind(this,uid)} style={styles.profileButton}>
            <Text style={styles.buttonText}>Profile</Text>
          </TouchableOpacity>
         
        </View>


    )
  }

  onPressUser = id => {
    this.props.dispatch(navigate('UserLinkHandler', {id:id}))
  }

  addUid(uid){
    if(uidArray.indexOf(uid)==-1){
      uidArray.push(uid)  
    }else{
      uidArray.splice(uidArray.indexOf(uid), 1);
    }
    
    this.setState({uidArray: uidArray})
  }


  renderUser = event => {
    const {name = 'Loading...', start_date, end_date,user} = event
    if(searchArray.indexOf(user.uid)!=-1) return null;
    else searchArray.push(user.uid)
    
    const profileImg = user.profile_img
    const displayName = user.display_name
    const username = user.username
    const uid = user.uid
    const startDate = start_date ? moment.unix(start_date).format('DD MMM') : ''
    const endDate = end_date ? moment.unix(end_date).format('DD MMM') : ''
    const time = start_date ? moment.unix(start_date).format('h:mm a') : ''

    const endsSameDay = start_date ? moment.unix(start_date).isSame(moment.unix(end_date), 'd') : false

    const onPress = event._key ? this.onPressUser.bind(this, uid) : null
    return (
      <View style={styles.tabUserContainer1} key={event._key}>
            <View style={styles.userContainer1}>
              <TouchableOpacity onPress={this.addUid.bind(this,uid)}>
                <Image source={{uri:profileImg}} style={{width:50,height:50,borderRadius:25,resizeMode:'cover'}}/>
              </TouchableOpacity>  
              <View style={styles.description}>
                <Text style={styles.tabUserName}>{displayName}</Text>
                <Text style={styles.descriptiontext}>@{username}</Text>
              </View>  
            </View>
            {(this.state.uidArray.indexOf(uid)!=-1)?this.renderCurrentTab(uid):null}
        <Divider/>
      </View>
    )
  }

  renderUsers() {
    //alert(Object.keys(this.props))
    const {nearEvents, events} = this.props
    const {text, place} = this.state
    //entireUsers = Users
    let list = []
    list = nearEvents
    if (list.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No user found</Text>
        </View>
      )
    }
    
    if (this.state.userName!='') {
      list = list.filter(user => {
        return user.name.toLowerCase().indexOf(this.state.userName.toLowerCase()) !== -1 ||
          user.description.toLowerCase().indexOf(this.state.userName.toLowerCase()) !== -1
      })
    }

    return (
      <View>
        {list.map(this.renderUser)}
      </View>
    )
  }

  render() {
   const { currentUser = {},Users = {}, isMyProfile } = this.props
   searchArray=[]
    const profile_img = currentUser && currentUser.profile_img ?
        { uri: currentUser.profile_img } : ''
    const display_name = currentUser && currentUser.username ?
          currentUser.display_name : ''
    const username = currentUser && currentUser.username ?
          currentUser.username : ''

    return (
      <View style={styles.eventsContainer}>
      <View style={styles.tabUserContainer}>
        <View style={styles.userContainer}>
            <Avatar
                size={70}
                style={styles.avatar}
                source={profile_img} />
            <View style={styles.description1}>
              <Text style={styles.displayName}>{display_name}</Text>
              <Text style={styles.descriptiontext1}>@{username}</Text>
            </View>
            <TouchableOpacity style={{flex:1,alignItems:'flex-end',justifyContent: 'center', }}> 
              <Image style={{width: 50, height: 50, }}
                 source={require('../../assets/images/qrImage.png')} />
            </TouchableOpacity>     
          </View>
        </View>
          <ScrollView>

                  <View>
                    <View style={styles.eventsContainer}>
                      {this.renderUsers()}
                    </View>
                  </View>
        </ScrollView>
        <TouchableOpacity style={styles.plusView}>
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 25,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText:{
    color:'white'
  },
  eventsContainer: {
    flex: 1,
    marginTop: 20,
    backgroundColor: 'white',
  },
  plusView:{
    alignSelf:'flex-end',
    marginBottom:5,
    width:30,
    height:30,
    borderRadius:15,
    alignItems:'center',
    justifyContent:'center',
    borderWidth:2,
    borderColor: Color.BTN_COLOR,
    marginRight:20,
    paddingBottom:5,
  },
  plusText:{
    fontSize: 30,
    backgroundColor:'transparent',
  },
  emptyStateText: {
    color: Color.INFO_COLOR,
  },
  input: {
    marginBottom: 5,

  },
  buttonView:{
    alignItems:'flex-end',
  },
  inputGeo: {
    textAlign: 'left',
    paddingLeft: 40,
  },
  innerContainer: {
    flexDirection: 'row',
  },

  //event styles
  tabEventContainer: {
    marginTop: 10,
    paddingLeft: 0,
    paddingRight: 25,
  },
  tabUserContainer: {
    marginTop: 10,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    
    shadowColor: Color.DARK_TEXT_COLOR,
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: {width: 1, height: 1},
  },
  tabUserContainer1: {
    marginTop: 10,
    marginHorizontal: 20,
    borderRadius: 5,
    
    shadowColor: Color.DARK_TEXT_COLOR,
    shadowRadius: 3,
    shadowOpacity: 0.5,
    shadowOffset: {width: 1, height: 1},
  },
  userContainer:{
    flexDirection:'row',
  },
  profileButton:{
    backgroundColor: Color.BTN_COLOR,
    borderRadius: 5,
    width:80,
    height:25,
    alignItems:'center',
    justifyContent:'center',
    alignSelf:'flex-end',
    marginTop:10,
  },
  userContainer1:{
    flexDirection:'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  
  detailContainer:{
    backgroundColor: '#f7f7f7',
    paddingLeft: 50,
    paddingRight: 10,
    paddingBottom: 10,
    paddingTop: 10,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  tabEventImageContainer: {
    flexDirection: 'row',
  },
  tabEventDetailContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  avatar: {
    borderWidth: 2.5
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
  tabUserName: {
    fontSize: 15,
    ...Font.FONT_BOLD,
    color: Color.DARK_TEXT_COLOR,
  },
  displayName: {
    fontSize: 20,
    ...Font.FONT_BOLD,
    color: Color.DARK_TEXT_COLOR,
  },
  descriptiontext: {
    fontSize: 14,
    color: Color.DARK_TEXT_COLOR,
  },
  descriptiontext1: {
    fontSize: 18,
    color: Color.DARK_TEXT_COLOR,
    marginTop:5
  },
  description: {
    marginLeft: 20,
    paddingTop: 5,
    justifyContent:'space-between'
  },
  description1: {
    marginLeft: 20,
    paddingTop: 5,
  },
})
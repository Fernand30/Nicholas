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
  TextInput,
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
import {fetchChats, fetchMessages, editGroupName} from '../redux/actions/chat'
import AppWithNavigationState from '../AppNavigator'

@connect((state, ownProps) => ChatScreen.getStateProps(state, ownProps))
export default class ChatScreen extends Component {

  constructor(props){
    super(props)
    this.state=({
      count: 0,
      GroupName:''
    })
  }

  static navigationOptions = ({navigation, screenProps}) => {
    const { params = {} } = navigation.state;
    groupName = navigation.state.params.groupName
    groupKey = navigation.state.params.groupKey
    onBack = navigation.state.params.onBack
    return{
      headerLeft: <NavBackButton/>,
      title: <Text style={{fontSize:18,color:'white'}}>EditName</Text>,
      headerRight: <TouchableOpacity onPress={() => params.handleSave()} ><Text style={{fontSize:16,color:'white'}}> OK</Text></TouchableOpacity>
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
    
    this.props.navigation.setParams({ handleSave: this.goEditGroupName.bind(this) });
    this.setState({
      groupName: groupName
    })
  }

  goEditGroupName(){
    if(this.state.groupName == ''){
      alert('Please fill group name');
      return;
    }
    this.props.dispatch(editGroupName(this.state.groupName, groupKey))
    onBack(this.state.groupName)
    this.props.navigation.goBack(null)
  }


  render() {
    
    return (
        <View style={styles.container}>
          <TextInput underlineColorAndroid="transparent"
                   style={{marginTop:20,paddingLeft:10,height:40,backgroundColor:'#424242',marginRight:20,marginLeft:20,color:'white'}}
                   onChangeText={(text) => this.setState({groupName:text})} value={this.state.groupName}/>
          
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
import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Text,
  Image
} from 'react-native'
import {Bubble, GiftedChat} from 'react-native-gifted-chat'
import I18n from '../i18n'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import * as Font from '../constants/Font'
import moment from 'moment'
import {connect} from 'react-redux'
import {sendMessage} from '../redux/actions/chat'
import {getChatMessages} from '../redux/selectors/index'
import {SOUND_SEND_MSG} from '../utils/Sound'
import {navigate} from '../redux/actions/nav'
import { responsiveHeight, responsiveWidth, responsiveFontSize } from 'react-native-responsive-dimensions';

@connect((state, ownProps) => ConversationScreen.getStateProps(state, ownProps))
export default class ConversationScreen extends Component {

  static navigationOptions = ({navigation, screenProps}) => {

    userUids = navigation.state.params.item
    title = navigation.state.params.title
    groupKey = navigation.state.params.id
    isGroup = navigation.state.params.isGroup
    onRefresh = navigation.state.params.onRefresh
    const { params = {} } = navigation.state;
    // if(isGroup==true){
    //   return{
    //       header: false  
    //     }
    //   }else{
    //     return{
    //       title: navigation.state.params.title || I18n.t('conversationScreen.title'),
    //       headerLeft: <NavBackButton/>,
    //     }
    //   } 
    return{
      header: false
    }
  }

  constructor(props){
    super(props)
    this.state = ({
      title:''
    })
  }

  static getStateProps(state, ownProps) {
    currentUserUid = state.currentUser.uid;
    return {
      currentUserUid: state.currentUser.uid,
      currentUserProfile: state.currentUser.profile,
      messages: getChatMessages(state, ownProps.navigation.state.params.id),
      users: state.user.entities,
    }
  }

  goGroupInfo(){
      this.props.navigation.navigate('GroupInfo',{title:this.state.title,userUids:userUids,groupKey: groupKey,changeTitle: (param)=>{
          this.changeTitle(param)
      }})
  }

  chatId: string
  state = {
    isCreating: this.props.navigation.state.params.isCreating || false,
    isGroup: this.props.navigation.state.params.isGroup || false,
    text: null,
  }
 
  componentDidMount() {
    this.chatId = this.props.navigation.state.params.id
    this.props.navigation.setParams({ handleSave: this.goGroupInfo.bind(this) });   
    this.setState({title: title})
  }

  changeTitle(title){
    if(title){
      this.setState({
      title: title,
      })
    }
  }

  componentWillUnmount(){
    Keyboard.dismiss()
  }

  onSend = (messages = []) => {
    SOUND_SEND_MSG.play()
    messages.forEach(m => this.props.dispatch(sendMessage(this.chatId, m.text)))
    this.setState({text: ''})
  }

  onInputTextChanged = text => {
    this.setState({text})
  }

  onPressAvatar = user => {
    this.props.dispatch(navigate('UserLinkHandler', {id: user._id}))
  }

  formatMessage = (message) => {
    const {users} = this.props
    let name
    let avatar

      name = (users[message.user_id])?users[message.user_id].display_name:''
      avatar = (users[message.user_id])?users[message.user_id].profile_img:''
      return (
              {
                _id: message._key,

                text: message.message,
                createdAt: moment(message.timestamp).toDate(),
                user: {
                  _id: message.user_id,
                  name, 
                  avatar,
                },
              }
          )
  }

  renderBubble(props) {
    
    if(props.currentMessage.user._id == currentUserUid){
        return (
        <Bubble
            {...props}
            wrapperStyle={{
              right: {
                backgroundColor: Color.CAMEL,
              },
            }}
        />
     )
    }else{
        return (
          <View style={{backgroundColor:Color.GRAY,borderRadius:10}}>
            <Text style={{marginLeft:10,marginTop:5,backgroundColor:'transparent',...Font.FONT_BOLD,}}>{props.currentMessage.user.name}</Text>
            <Bubble
                {...props}
                wrapperStyle={{
                  right: {
                    backgroundColor: Color.CAMEL,
                  },
                }}
            />
        </View>
     )
    }
    
  }

  goback(){
    if((isGroup==true)&&(title)){
      onRefresh()
    }
     //
    this.props.navigation.goBack(null)
  }

  render() {
    //alert(isGroup)
    const {messages} = this.props
    const data = messages
        .sort((a, b) => {
          return b.timestamp - a.timestamp
        })
        .map(message => this.formatMessage(message))

    return (

        <View style={styles.container}>
        {((isGroup==true)&&(title))?<View style={styles.headerView}>
                    <View style={{flex:1}}>
                        <TouchableOpacity onPress={this.goback.bind(this)}>
                            <Image source={require('../../assets/icons/btArrowsLongLeft.png')}/>
                        </TouchableOpacity>    
                    </View> 
                    <TouchableOpacity onPress={this.goGroupInfo.bind(this)} style={{flex:1,alignItems:'center',justifyContent:'center'}}>   
                          <Text style={styles.titleText}>{this.state.title}</Text>
                    </TouchableOpacity>    
                    <View style={{flex:1}}/>
                  </View>:
                <View style={styles.headerView}>
                    <View style={{flex:1}}>
                        <TouchableOpacity onPress={this.goback.bind(this)}>
                            <Image source={require('../../assets/icons/btArrowsLongLeft.png')}/>
                        </TouchableOpacity>    
                    </View> 
                  
                          <Text style={styles.titleText}>{this.state.title||I18n.t('conversationScreen.title')}</Text>
                  
                    <View style={{flex:1}}/>
                  </View>}
          <GiftedChat
              text={this.state.text}
              messages={data}
              onSend={this.onSend}
              onPressAvatar={this.onPressAvatar}
              user={{
                _id: this.props.currentUserUid,
              }}
              renderAvatarOnTop
              onInputTextChanged={this.onInputTextChanged}
              renderBubble={this.renderBubble.bind(this)}
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
  headerView:{
    paddingLeft:responsiveWidth(4),
    paddingRight:responsiveWidth(4),
    marginTop:responsiveHeight(2.5),
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    height:responsiveHeight(8)
  },
  titleText: {
    color:'white',
    textAlign:'center',
    fontSize:18
  },
  backImage:{
    width:responsiveWidth(8),
    height:responsiveWidth(4),
    resizeMode:'stretch'
  },
  headerSubTitle: {
    fontSize: 13.5,
    color: Color.WARM_GREY,
    ...Font.FONT_BOLD,
    lineHeight: 15,
    textAlign: 'center',
  },
  groupName: {
    color: Color.CONTRAST_COLOR,
  },
})
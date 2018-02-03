import React, {PureComponent} from 'react'
import {
  Image,
  Text,
  View,
  ImageBackground
} from 'react-native'
import {connect} from 'react-redux'
import * as firebase from 'firebase'
import Auth from '../utils/Auth'

type ImageSource = {
  uri: string,
  width: number,
  height: number,
}

type Props = {
  iconSource: ImageSource | number | Array<ImageSource>,
  focusedIconSource: ImageSource | number | Array<ImageSource>,
  focused?: boolean,
  style?: any,
}
//@connect((state, ownProps) => ChatScreen.getStateProps(state, ownProps))
export default class TabBarIcon extends PureComponent {
  props: Props
  constructor(props){
    super(props)
    this.state=({
      messageCount: 0
    })
  }

  componentDidMount(){
    
  }

  static getStateProps(state) {
      return {
          currentUserUid: state.currentUser.uid,
          groups: state.chat.groups,
          users: state.user.entities,
          isFetchingUser: state.currentUser.isFetching,
      }
  }
  
  render() {
    
    const {iconSource, focusedIconSource, focused, style,messageCount} = this.props
    const _img = (focused && focusedIconSource) ? focusedIconSource : iconSource
    
    return (
           <View>
            <Image source={_img} style={style} />
            {
              (this.state.messageCount>0) ? <View style={{alignItems:'center',justifyContent:'center', position:'absolute',right:-5,top:-5, width:20,height:20,borderRadius:10,backgroundColor:'#00a2ff'}}>
                                  <Text style={{color:'white'}}>{String(this.state.messageCount)}</Text>
                               </View>
                               : null   
            }

            
          </View>
    )
  }
}
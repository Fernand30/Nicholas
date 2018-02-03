import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import I18n from '../i18n'
import Divider from '../components/Divider'
import * as Font from '../constants/Font'
import {TEST_PENDING_APPROVAL} from '../constants/MockData'
import Avatar from '../components/Avatar'
import PrimaryButton from '../components/PrimaryButton'

export default class RequestsScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('requestsScreen.title'),
    headerLeft: <NavBackButton/>,
  })

  state = {
    accepted: [1],
    rejected: [2],
  }

  onPressAccept(id) {
    const accepted = this.state.accepted.slice()
    const rejected = this.state.rejected.filter(_id => _id !== id)

    accepted.push(id)

    this.setState({
      accepted,
      rejected,
    })
  }

  onPressReject(id) {
    const accepted = this.state.accepted.filter(_id => _id !== id)
    const rejected = this.state.rejected.slice()

    rejected.push(id)

    this.setState({
      accepted,
      rejected,
    })
  }

  renderPerson = ({item}) => {
    const rejected = this.state.rejected.indexOf(item.id) !== -1
    const accepted = this.state.accepted.indexOf(item.id) !== -1

    const acceptIcon = accepted ?
        require('../../assets/icons/acceptFilled.png') :
        require('../../assets/icons/accept.png')
    const cancelIcon = rejected ?
        require('../../assets/icons/cancelFilled.png') :
        require('../../assets/icons/cancel.png')

    return (
        <View style={styles.wrapper}>
          <Avatar
              size={50}
              source={{uri: item.profile_img}}
              style={styles.avatar}/>
          <View style={styles.content}>
            <View style={styles.nameContainer}>
              <Text style={styles.username} numberOfLines={1}>
                {item.username}
              </Text>
              <Text style={styles.name}>
                {item.first_name} {item.last_name}
              </Text>
            </View>
            <View style={[styles.buttonContainer]}>
              <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={this.onPressReject.bind(this,
                      item.id)}>
                <Image source={cancelIcon}/>
              </TouchableOpacity>
              <TouchableOpacity
                  onPress={this.onPressAccept.bind(this, item.id)}>
                <Image source={acceptIcon}/>
              </TouchableOpacity>
            </View>
          </View>
        </View>
    )
  }

  render() {
    return (
        <View style={styles.container}>
          <Text style={styles.title}>{I18n.t('requestsScreen.subTitle', {count: TEST_PENDING_APPROVAL.length})}</Text>
          <FlatList
              removeClippedSubviews={false}
              data={TEST_PENDING_APPROVAL}
              keyExtractor={(item, i) => item.id}
              renderItem={this.renderPerson}
              ItemSeparatorComponent={() => <Divider />}
          />
          <PrimaryButton label={I18n.t('requestsScreen.confirm')} />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
  },
  title:{
    color: Color.CONTRAST_COLOR,
    fontSize: 22.5,
      ...Font.FONT_BOLD,
    textAlign: 'center',
    marginBottom: 26,
  },
  wrapper: {
    flexDirection: 'row',
    padding: 10,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 13.5,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  username: {
    color: Color.CONTRAST_COLOR,
    lineHeight: 22,
    fontSize: 15,
    ...Font.FONT_BOLD,
  },
  name: {
    color: Color.WARM_GREY,
    fontSize: 12,
    ...Font.FONT_BOLD,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  cancelButton: {
    marginRight: 30,
  },
})
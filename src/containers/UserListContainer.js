import React, {PureComponent} from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native'
import Divider from '../components/Divider'
import Avatar from '../components/Avatar'
import type {User} from '../TypeDefinition'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'

type Props = {
  onPressUser: (user: User) => void,
  selected: Array<string>,
  users: Array<User>,
}

export default class UserListContainer extends PureComponent {
  props: Props

  static defaultProps = {
    selected: [],
    users: [],
    onPressUser: () => ({}),
  }

  renderUser = ({item}) => {
    const selected = this.props.selected.indexOf(item._key) !== -1
    const nameStyle = item.username ? styles.name : styles.username
    const onPress = this.props.onPressUser.bind(this, item)

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.6}>
          <View style={styles.wrapper}>
            <Avatar
                size={50}
                source={{uri: item.profile_img}}
                style={styles.avatar}/>
            <View style={styles.content}>
              <View style={styles.nameContainer}>
                {item.username && <Text style={styles.username} numberOfLines={1}>
                  {item.username}
                </Text>}
                <Text style={nameStyle}>
                  {item.first_name} {item.last_name}
                </Text>
              </View>
              {selected && <Image source={require('../../assets/icons/checkmark.png')}/>}
            </View>
          </View>
        </TouchableOpacity>
    )
  }

  render() {
    return (
        <FlatList
            removeClippedSubviews={false}
            data={this.props.users}
            keyExtractor={(item, i) => item._key}
            renderItem={this.renderUser}
            ItemSeparatorComponent={() => <Divider/>}
        />
    )
  }
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 13.5,
    paddingRight: 20.5,
  },
  wrapper: {
    flexDirection: 'row',
    padding: 10,
  },
  nameContainer: {
    justifyContent: 'center',
  },
  name: {
    color: Color.INFO_COLOR,
    fontSize: 12,
    ...Font.FONT_BOLD,
  },
  username: {
    color: Color.DARK_TEXT_COLOR,
    lineHeight: 22,
    fontSize: 15,
    ...Font.FONT_BOLD,
  },
})

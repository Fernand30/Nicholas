import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import Avatar from './Avatar'
import * as Color from '../constants/Color'
import moment from 'moment'
import * as Font from '../constants/Font'
import CachedImage from './CachedImage'
import ZoomImage from './ZoomImage'
import type {Post} from '../TypeDefinition'

type Props = {
  user: Object,
  post: Post,
}

export default class FeedPost extends Component {
  props: Props

  renderComment() {
    if (!this.props.post.comment) {
      return null
    }

    return (
        <Text style={styles.comment}>{this.props.post.comment}</Text>
    )
  }

  renderImage = image => {
    return (
        <ZoomImage
            key={image.url}
            source={{uri: image.url}}
            imgSize={{width: 640, height: 473}}
            imgStyle={styles.thumbnail}
            containerStyle={styles.thumbnail}
            showDuration={200}
        />
    )
  }

  renderImages() {
    if (!this.props.post.images || this.props.post.images.length === 0) {
      return null
    }

    //<CachedImage style={styles.thumbnail} source={this.props.imageSource} />

    return (
        <View>
          {this.props.post.images.map(this.renderImage)}
        </View>
    )
  }

  render() {
    const {style, user, post: {timestamp}} = this.props
    const containerStyle = [styles.container, style]

    return (
        <View style={containerStyle}>
          <View style={styles.userContainer}>
            <Avatar size={50} source={{uri: user.profile_img}}/>
            <View style={styles.content}>
              <Text
                  style={styles.name}>{user.first_name} {user.last_name}
              </Text>
              {this.renderComment()}
              {this.renderImages()}
            </View>
          </View>
          <Text style={styles.timestamp}>{moment(timestamp).fromNow()}</Text>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: Color.GREYISH_BROWN,
    paddingTop: 12,
    paddingBottom: 4,
    paddingHorizontal: 12,
    borderRadius: 2,
  },
  content: {
    marginLeft: 24,
    flex: 1,
  },
  name: {
    color: Color.CAMEL,
    ...Font.FONT_BOLD,
    fontSize: 15,
  },
  userContainer: {
    flexDirection: 'row',
  },
  comment: {
    color: Color.CONTRAST_COLOR,
    fontSize: 15,
    ...Font.FONT_LIGHT,
    marginTop: 5,
  },
  thumbnail: {
    height: 200,
    width: 200,
    marginTop: 8,
  },
  timestamp: {
    color: Color.CONTRAST_COLOR,
    textAlign: 'right',
    fontSize: 12.5,
    ...Font.FONT_ITALIC,
  },
})
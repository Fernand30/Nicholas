import FBSDK from 'react-native-fbsdk'
import type { Event } from './../TypeDefinition'
import { EVENTS_URL } from '../constants/Firebase'

const {
  ShareDialog,
} = FBSDK

export default class ShareHelper {
  static shareEvent(event: Event): Promise {
    const url = `${EVENTS_URL}/${event._key}`
    const shareLinkContent = {
      contentType: 'link',
      contentTitle: event.name,
      contentUrl: url,
      imageUrl: event.cover_img,
    }

    return ShareDialog.canShow(shareLinkContent)
      .then(canShow => {
          if (canShow) {
            return ShareDialog.show(shareLinkContent)
          }
        },
      )
      .then(result => {
          if (result.isCancelled) {
            return false
          }

          return !!result.postId
        },
      )
  }
}
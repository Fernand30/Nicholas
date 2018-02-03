import React, { PureComponent } from 'react'
import { Image, ImageBackground } from 'react-native'
import { CustomCachedImage, CachedImageBackground } from 'react-native-img-cache'
import ImageProgress from 'react-native-image-progress'

export default class CachedImage extends PureComponent {
  setNativeProps = (props) => undefined

  render() {
    const { source: { uri }, children } = this.props
    if (uri && uri.indexOf('http') === 0) {
      const Component = children ? CachedImageBackground : CustomCachedImage
      return <Component {...this.props} component={ImageProgress}/>
    }

    if (children) {
      return <ImageBackground {...this.props} />
    }

    return (
      <Image {...this.props} />
    )
  }
}
import React, {Component} from 'react'
import {Animated, FlatList, ListView, Platform, View} from 'react-native'

statusBarHeight = Platform.select({ios: 20, android: 0})

// const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
const AnimatedFlatList = Animated.createAnimatedComponent(ListView)
const defaultRowHasChanged = (r1, r2) => r1 !== r2

type Props = {
  headerColor?: any,
  headerHeight?: number,
  contentContainerStyle?: any,
  renderTop?: any, //can't be 'renderHeader' as it conflicts with ListView properties
  renderItem: any,
}

export default class Collapsible extends Component {
  props: Props
  static defaultProps = {
    headerHeight: Platform.select({ios: 64, android: 56}),
  }

  scrollAnim = new Animated.Value(0)
  offsetAnim = new Animated.Value(0)

  constructor(props) {
    super(props)

    const rowHasChanged = this.props.rowHasChanged || defaultRowHasChanged
    this.dataSource = new ListView.DataSource({rowHasChanged})

    this.state = {
      scrollAnim: this.scrollAnim,
      offsetAnim: this.offsetAnim,
      clampedScroll: Animated.diffClamp(
          Animated.add(
              this.scrollAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 1],
                extrapolateLeft: 'clamp',
              }),
              this.offsetAnim,
          ),
          0,
          props.headerHeight,
      ),

      data: this.dataSource.cloneWithRows(props.data),
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      data: this.dataSource.cloneWithRows(nextProps.data),
    })
  }

  componentDidMount() {
    this.state.scrollAnim.addListener(({value}) => {
      const diff = value - this.scrollValue
      this.scrollValue = value
      this.clampedScrollValue = Math.min(
          Math.max(this.clampedScrollValue + diff, 0),
          this.props.headerHeight,
      )
    })

    this.state.offsetAnim.addListener(({value}) => {
      this.offsetValue = value
    })
  }

  componentWillUnmount() {
    this.state.scrollAnim.removeAllListeners()
    this.state.offsetAnim.removeAllListeners()
  }

  onScrollEndDrag = () => {
    this.scrollEndTimer = setTimeout(this.onMomentumScrollEnd, 250)
  }

  onMomentumScrollBegin = () => {
    clearTimeout(this.scrollEndTimer)
  }

  onMomentumScrollEnd = () => {
    const toValue = this.scrollValue > this.props.headerHeight &&
    this.clampedScrollValue > (this.props.headerHeight) / 2
        ? this.offsetValue + this.props.headerHeight
        : this.offsetValue - this.props.headerHeight

    Animated.timing(this.state.offsetAnim, {
      toValue,
      duration: 350,
      useNativeDriver: true,
    }).start()
  }

  clampedScrollValue = 0
  offsetValue = 0
  scrollValue = 0

  render() {
    const {clampedScroll} = this.state

    const navbarTranslate = clampedScroll.interpolate({
      inputRange: [0, this.props.headerHeight],
      outputRange: [0, -(this.props.headerHeight)],
      extrapolate: 'clamp',
    })

    const navbarOpacity = clampedScroll.interpolate({
      inputRange: [0, this.props.headerHeight],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })

    const contentContainerStyle = [
      // this.props.contentContainerStyle,
      {paddingTop: this.props.headerHeight, paddingHorizontal: 10},
    ]

    return (
        <View style={{flex: 1}}>
          <AnimatedFlatList
              enableEmptySections={true}
              removeClippedSubviews={false}
              contentContainerStyle={contentContainerStyle}
              dataSource={this.state.data}
              // data={this.props.data}
              // keyExtractor={(item, i) => `collapsible-item-${i}`}
              onMomentumScrollBegin={this.onMomentumScrollBegin}
              onMomentumScrollEnd={this.onMomentumScrollEnd}
              onScroll={Animated.event(
                  [{nativeEvent: {contentOffset: {y: this.state.scrollAnim}}}],
                  {useNativeDriver: true},
              )}
              onScrollEndDrag={this.onScrollEndDrag}
              // renderItem={this.props.renderItem}
              renderRow={this.props.renderItem}
              scrollEventThrottle={16}
              {...this.props}
          />
          <Animated.View
              style={[
                {
                  backgroundColor: this.props.headerColor || 'transparent',
                  height: this.props.headerHeight,
                  left: 0,
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  opacity: navbarOpacity,
                  transform: [{translateY: navbarTranslate}],
                },
              ]}>
            {typeof this.props.renderTop === 'function' ? this.props.renderTop() : this.props.renderTop}
          </Animated.View>
        </View>
    )
  }
}
import React, {Component} from 'react'
import {
  View,
  ScrollView,
  Slider,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native'
import {connect} from 'react-redux'
import I18n from '../i18n'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import * as Font from '../constants/Font'
import {PlaceTypes} from '../constants/Data'
import moment from 'moment'
import MultiSlider from '../components/MultiSlider'
import PrimaryButton from '../components/PrimaryButton'
import DateTimePicker from '../components/DateTimePicker'
import {NavigationActions} from 'react-navigation'
import {updateEventFilterParams} from '../redux/actions/eventsFilter'
import Button from '../components/Button'

const VIEW_PADDING = 50

const CheckButton = ({label, checked, disabled, onPress}) => {
  const style = [styles.checkButton]
  const labelStyle = [styles.checkButtonLabel]

  if (checked) {
    style.push(styles.checkButtonChecked)
    labelStyle.push(styles.checkButtonLabelChecked)
  }

  return (
      <TouchableOpacity onPress={onPress} style={style}
                        activeOpacity={disabled ? 1 : 0.5}>
        <Text style={labelStyle}>{label}</Text>
        {checked &&
        <Image source={require('../../assets/icons/checkmark.png')}/>}
      </TouchableOpacity>
  )
}

@connect(state => FilterScreen.getStateProps(state))
export default class FilterScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('filterScreen.headerTitle'),
    headerLeft: <NavBackButton/>,
  })

  static getStateProps(state) {
    return {
      radius: state.eventsFilter.radius,
      placeTypes: state.eventsFilter.placeTypes,
      date: state.eventsFilter.date,
      minPrice: state.eventsFilter.minPrice,
      maxPrice: state.eventsFilter.maxPrice,
    }
  }

  // radius = this.props.radius

  state = {
    //mapped state props
    date: this.props.date,
    radius: this.props.radius,
    placeTypes: this.props.placeTypes,
    priceRange: [this.props.minPrice, this.props.maxPrice],
    //other
    pickerVisible: false,
    scrollEnabled: true,
    allPlaces: this.props.placeTypes ? this.props.placeTypes.length === 0 : true,
  }

  onDateChange = (date) => {
    date.setHours(0, 0, 0, 0)
    this.setState({date})
  }

  onDistanceChance = (km) => {
    this.setState({radius: km})
  }

  onPriceChange = range => {
    this.setState({priceRange: range})
  }

  togglePicker = () => {
    this.setState({pickerVisible: !this.state.pickerVisible})
  }

  onPressPlace = typeId => {
    const placeTypes = this.state.placeTypes
    let newArray = null

    if (placeTypes.indexOf(typeId) !== -1) {
      newArray = placeTypes.filter(id => id !== typeId)
    } else {
      newArray = [...placeTypes, typeId]
    }

    this.setState({
      placeTypes: newArray,
      allPlaces: false,
    })
  }

  onSwitchToggle = bool => {
    if (bool) {
      this.setState({
        allPlaces: bool,
        placeTypes: [],
      })
    } else {
      this.setState({allPlaces: bool})
    }
  }

  lockScroll = () => {
    this.setState({scrollEnabled: false})
  }

  unlockScroll = () => {
    this.setState({scrollEnabled: true})
  }

  onPressFilter = () => {
    const [minPrice, maxPrice] = this.state.priceRange
    this.props.dispatch(updateEventFilterParams({
      radius: this.state.radius,
      placeTypes: this.state.placeTypes,
      date: this.state.date,
      minPrice,
      maxPrice,
    }))
    this.props.dispatch(NavigationActions.back())
  }

  onPressClear = () => {
    this.setState({
      date: null,
      radius: 100,
      placeTypes: [],
      priceRange: [0, 1000],
      allPlaces: true,
    })
  }

  renderPlaces() {
    const {placeTypes} = this.state
    return (
        <View style={styles.placesContainer}>
          {PlaceTypes.map(
              p => <CheckButton
                  checked={placeTypes.indexOf(p.id) !== -1}
                  key={p.id}
                  label={p.name}
                  onPress={() => this.onPressPlace(p.id)}/>)}
        </View>
    )
  }

  render() {
    const {radius, date, pickerVisible, allPlaces, priceRange, scrollEnabled} = this.state
    const [minPrice, maxPrice] = priceRange
    const sliderProps = {
      minimumTrackTintColor: Color.BLUE,
      maximumTrackTintColor: Color.CONTRAST_COLOR,
      thumbTintColor: Color.BLUE,
      step: 1,
    }
    const sliderLength = Dimensions.get('window').width - (VIEW_PADDING)

    return (
        <View style={styles.container}>
          <ScrollView style={styles.scrollView}
                      contentContainerStyle={styles.innerContainer}
                      scrollEnabled={scrollEnabled}>
            <View style={styles.controlGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>{I18n.t('filterScreen.maxDist')}:</Text>
                <Text style={styles.value}>{radius} KM</Text>
              </View>
              <Slider
                  maximumValue={100}
                  minimumValue={1}
                  value={this.state.radius}
                  {...sliderProps}
                  onValueChange={this.onDistanceChance}/>
            </View>
            <View style={[styles.controlGroup, styles.groupSpacing]}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>{I18n.t(
                    'filterScreen.priceRange')}:</Text>
                <Text style={styles.value}>{minPrice === 0 ? I18n.t('filterScreen.free') : minPrice} - {maxPrice} €</Text>
              </View>
              <MultiSlider
                  containerStyle={{paddingVertical: 10}}
                  onValuesChange={this.onPriceChange}
                  onValuesChangeStart={this.lockScroll}
                  onValuesChangeFinish={this.unlockScroll}
                  values={priceRange}
                  min={0}
                  max={1000}
                  sliderLength={sliderLength}
                  selectedStyle={{
                    ...Platform.select({
                      android: {
                        backgroundColor: Color.CONTRAST_COLOR,
                      },
                      ios: {
                        backgroundColor: Color.BLUE,
                      },
                    }),
                  }}
                  markerStyle={{
                    ...Platform.select({
                      android: {
                        backgroundColor: Color.BLUE,
                      },
                    }),
                    borderColor: Color.CONTRAST_COLOR,
                  }}
                  trackStyle={{
                    backgroundColor: Color.CONTRAST_COLOR,
                  }}
                  selectedTrack={{
                    backgroundColor: Color.BLUE,
                  }}
              />
            </View>
            <View style={[styles.controlGroup, styles.groupSpacing]}>
              <Text style={styles.label}>{I18n.t(
                  'filterScreen.placeType')}:</Text>
            </View>
            <View style={[styles.controlGroup, styles.switchSpacing]}>
              <View style={[styles.labelContainer]}>
                <Text style={styles.value}>{I18n.t('filterScreen.all')}</Text>
                <Switch onTintColor={Color.BLUE}
                        onValueChange={this.onSwitchToggle}
                        value={allPlaces}/>
              </View>
            </View>
            {this.renderPlaces()}
            <View style={[styles.controlGroup, styles.dateSpacing]}>
              <Text style={[styles.label, styles.labelDate]}>{I18n.t('filterScreen.date')}:</Text>
            </View>
            <View style={styles.dateContainer}>
              <TouchableOpacity onPress={this.togglePicker}>
                <Text style={[styles.date]}>
                  {date ? moment(date).format('dddd, MMMM DD. YYYY') : '-'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.clearFilterContainer}>
              <Button label={I18n.t('filterScreen.clear')} onPress={this.onPressClear}/>
            </View>
          </ScrollView>
          <PrimaryButton
              onPress={this.onPressFilter}
              label={I18n.t('filterScreen.filter')}/>
          <DateTimePicker
              mode="date"
              defaultDate={this.props.date}
              onSave={this.onDateChange}
              isVisible={pickerVisible}
              onCancel={this.togglePicker}/>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
  },
  innerContainer: {
    paddingTop: 22.5,
    paddingBottom: 40,
  },
  scrollView: {
    flex: 1,
  },
  controlGroup: {
    paddingHorizontal: VIEW_PADDING / 2,
  },
  groupSpacing: {
    marginTop: 51,
  },
  placesContainer: {
    marginTop: 22.5,
  },
  switchSpacing: {
    marginTop: 23,
  },
  dateSpacing: {
    marginTop: 30,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12.5,
  },
  label: {
    color: Color.CAMEL,
    ...Font.FONT_BOLD,
    fontSize: 15,
  },
  labelDate: {
    color: Color.CAMEL,
    ...Font.FONT_BOLD,
    fontSize: 17.5,
  },
  value: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 17.5,
  },
  checkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  checkButtonChecked: {
    backgroundColor: Color.CONTRAST_COLOR,
  },
  checkButtonLabel: {
    color: Color.WARM_GREY,
    fontSize: 17.5,
  },
  checkButtonLabelChecked: {
    color: Color.DARK_TEXT_COLOR,
  },
  datePicker: {
    backgroundColor: Color.CONTRAST_COLOR,
  },
  dateContainer: {
    marginTop: 9.5,
    borderTopWidth: 0.5,
    borderTopColor: Color.CONTRAST_COLOR,
    borderBottomWidth: 0.5,
    borderBottomColor: Color.CONTRAST_COLOR,
  },
  date: {
    color: Color.CONTRAST_COLOR,
    fontSize: 17.5,
    paddingVertical: 12.5,
    paddingLeft: 42,
  },
  btnFilterLabel: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
  clearFilterContainer: {
    paddingHorizontal: 10,
    marginTop: 40,
  },
})
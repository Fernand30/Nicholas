import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  DatePickerAndroid,
  TimePickerAndroid,
  DatePickerIOS,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native'
import OverlayModal from './OverlayModal'
import I18n from '../i18n'
import * as Style from '../constants/Style'

type Props = {
  isVisible: boolean,
  mode: 'date' | 'datetime',
  onSave: (datetime: Date) => Date,
  onCancel: () => void,
  minimumDate: Date,
  maximumDate: Date,
  defaultDate: Date,
}

const IS_ANDROID = Platform.OS === 'android'

export default class DateTimePicker extends Component {
  props: Props

  state = {
    date: this.props.defaultDate || new Date(),
    isVisible: this.props.isVisible,
  }

  componentWillReceiveProps(nextProps: Props) {
    if (IS_ANDROID && !this.props.isVisible && nextProps.isVisible) {
      this.openAndroidDateTimePicker()
    } else if (this.props.isVisible !== nextProps.isVisible) {
      this.setState({isVisible: nextProps.isVisible})
    }
  }

  shouldComponentUpdate() {
    return !IS_ANDROID //No need to render for Android
  }

  openAndroidDateTimePicker() {
    DatePickerAndroid
        .open({
          minDate: this.props.minimumDate,
          maxDate: this.props.maximumDate,
          date: this.state.date,
        })
        .then(this.onSelectAndroidDate)
  }

  openTimePicker(date) {
    TimePickerAndroid
        .open({is24Hour: true,})
        .then(this.onSelectAndroidTime.bind(this, date))
        .catch(this.onCancel)
  }

  onSelectAndroidDate = ({action, year, month, day}) => {
    if (action === DatePickerAndroid.dismissedAction) {
      return this.onCancel()
    }
    // Selected year, month (0-11), day
    const date = new Date(year, month, day)

    if (this.props.mode === 'date') {
      this.setState({date}, this.onSave)
      return true
    }

    this.openTimePicker(date)
  }

  onSelectAndroidTime = (date, {action, hour, minute}) => {
    if (action === TimePickerAndroid.dismissedAction) {
      return this.onCancel()
    }
    const dateTime = new Date(date)
    dateTime.setMinutes(minute)
    dateTime.setHours(hour)

    this.setState({date: dateTime}, this.onSave)
  }

  onSelectIOSDateTime = (date) => {
    this.setState({date})
  }

  onCancel = () => {
    if (typeof this.props.onCancel === 'function') {
      this.props.onCancel()
    }
  }

  onSave = () => {
    if (typeof this.props.onSave === 'function') {
      this.props.onSave(this.state.date)
    }

    this.setState({isVisible: false})
  }

  render() {
    if (IS_ANDROID) {
      return null
    }

    return (
        <OverlayModal isVisible={this.state.isVisible} onPressOverlay={this.onCancel}>
          <View style={styles.content}>
            <DatePickerIOS
                minimumDate={this.props.minimumDate}
                maximumDate={this.props.maximumDate}
                date={this.state.date}
                onDateChange={this.onSelectIOSDateTime}
                mode={this.props.mode}/>
            <TouchableOpacity
                style={[Style.PRIMARY_BUTTON_STYLE, styles.button]}
                onPress={this.onSave}>
              <Text style={[Style.PRIMARY_BUTTON_LABEL, styles.buttonLabel]}>
                {I18n.t('ok')}
              </Text>
            </TouchableOpacity>
          </View>
        </OverlayModal>
    )
  }
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: 'white',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  button: {
    borderRadius: 2.5,
    marginHorizontal: 30,
    marginTop: 10,
  },
  buttonLabel: {
    fontSize: 15,
  },
})
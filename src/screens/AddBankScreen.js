import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Text, TouchableOpacity,
} from 'react-native'
import * as Color from '../constants/Color'
import I18n from '../i18n'
import { connect } from 'react-redux'
import _ from 'lodash'
import NavBackButton from '../components/NavBackButton'
import FloatingLabelInput from '../components/FloatingLabelInput'
import PrimaryButton from '../components/PrimaryButton'
import { NavigationActions } from 'react-navigation'
import { BANK_ACCOUNT_VALIDATION_SCHEMA } from '../constants/ValidationSchemas'
import { addBank, clearError } from '../redux/actions/payouts'
import * as Font from '../constants/Font'
import Form from '../components/Form'

@connect((state, ownProps) => AddBankScreen.getStateProps(state, ownProps))
export default class AddBankScreen extends Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: I18n.t('addBankScreen.title'),
    headerLeft: <NavBackButton
      navigation={navigation}
      disabled={navigation.state.params && navigation.state.params.isPushing}/>,
  })

  static getStateProps(state) {
    return {
      isPushing: state.payouts.isPushing,
      hasError: state.payouts.hasError,
      errorMessage: state.payouts.errorMessage,
    }
  }

  state = {
    form: {
      account_number: null,
    },

    isValid: false,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPushing !== nextProps.isPushing) {
      this.props.navigation.setParams({ isPushing: nextProps.isPushing, })
    }

    if (this.props.isPushing && !nextProps.isPushing && !nextProps.hasError) {
      this.props.navigation.dispatch(NavigationActions.back())
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevState.form, this.state.form)) {
      BANK_ACCOUNT_VALIDATION_SCHEMA
        .validate(this.state.form)
        .then(() => {
          this.setState({ isValid: true })
        })
        .catch((error) => {
          console.log(error)
          this.setState({ isValid: false })
        })
    }
  }

  componentWillUnmount() {
    this.props.dispatch(clearError())
  }

  onPressAdd = () => {
    this.props.dispatch(addBank(this.state.form))
  }

  onChangeNumber = (account_number) => {
    this.setState({
      form: {
        ...this.state.form,
        account_number,
      },
    })
  }

  renderForm() {
    const { isPushing, form } = this.state
    const fields = [
      {
        id: 'account_number',
        editable: !isPushing,
        placeholder: I18n.t('addBankScreen.accountNumber'),
        defaultValue: form.account_number,
        onChangeText: this.onChangeNumber,
      },
      {
        id: 'country',
        editable: false,
        placeholder: I18n.t('addBankScreen.country'),
        textBreakStrategy: 'simple',
        value: 'France',
      },
    ]

    return (
      <View style={styles.infoContainer}>
        <Text style={styles.sectionLabel}>{I18n.t(
          'createEventScreen.eventInfo')}:</Text>
        <View style={styles.infoFormContainer}>
          <Form fields={fields}/>
        </View>
      </View>
    )
  }

  render() {
    return (
      <KeyboardAvoidingView
        keyboardVerticalOffset={60}
        style={styles.container}
        behavior="padding">
        <View style={styles.formContainer}>
          {this.renderForm()}
          {this.props.hasError && <Text style={styles.error}>{this.props.errorMessage}</Text>}
        </View>
        <PrimaryButton loading={this.props.isPushing} label="Save" onPress={this.onPressAdd}
                       disabled={!this.state.isValid}/>
      </KeyboardAvoidingView>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  cardInfo: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  margin: {
    marginLeft: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  error: {
    marginTop: 40,
    textAlign: 'center',
    color: Color.TOMATO,
    ...Font.FONT_BOLD,
    fontSize: 16,
  },
})
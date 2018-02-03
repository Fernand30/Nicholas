import React, {Component} from 'react'
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Text,
} from 'react-native'
import * as Color from '../constants/Color'
import I18n from '../i18n'
import {connect} from 'react-redux'
import _ from 'lodash'
import NavBackButton from '../components/NavBackButton'
import FloatingLabelInput from '../components/FloatingLabelInput'
import PrimaryButton from '../components/PrimaryButton'
import {NavigationActions} from 'react-navigation'
import {CREDIT_CARD_VALIDATION_SCHEMA} from '../constants/ValidationSchemas'
import {addCard, clearError} from '../redux/actions/payment'
import * as Font from '../constants/Font'

@connect((state, ownProps) => AddCardScreen.getStateProps(state, ownProps))
export default class AddCardScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('addCardScreen.title'),
    headerLeft: <NavBackButton
        navigation={navigation}
        disabled={navigation.state.params && navigation.state.params.isPushing}/>,
  })

  static getStateProps(state) {
    return {
      isPushing: state.payment.isPushing,
      hasError: state.payment.hasError,
      errorMessage: state.payment.errorMessage,
    }
  }

  state = {
    expDate: '',

    form: {
      number: null,
      cvc: null,
      exp_month: null,
      exp_year: null,
    },

    isValid: false,
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isPushing !== nextProps.isPushing) {
      this.props.navigation.setParams({isPushing: nextProps.isPushing,})
    }

    if (this.props.isPushing && !nextProps.isPushing && !nextProps.hasError) {
      this.props.navigation.dispatch(NavigationActions.back())
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevState.form, this.state.form)) {
      CREDIT_CARD_VALIDATION_SCHEMA
          .validate(this.state.form)
          .then((form) => {
            this.setState({isValid: true})
          })
          .catch(error => {
            this.setState({isValid: false})
          })
    }
  }

  componentWillUnmount() {
    this.props.dispatch(clearError())
  }

  onPressAdd = () => {
    this.props.dispatch(addCard(this.state.form))
  }

  onChangeNumber = (number) => {
    this.setState({
      form: {
        ...this.state.form,
        number,
      },
    })
  }

  onChangeCvc = (cvc) => {
    this.setState({
      form: {
        ...this.state.form,
        cvc,
      },
    })
  }

  //"Uber-like" EXP field
  onChangeExpDate = (value) => {
    let expDate

    //MONTHS BEGIN WITH 0 OR 1. ANYTHING HIGHER IS ASSUMED AS MONTH NUMBER. e.g. 7 BECOMES 07. 9 BECOMES 09 AND SO ON
    if (value.length === 1 && value > 1) {
      expDate = `0${value}/`
    } else {

      //On slash removed
      if (this.state.expDate.length === 3 && value.length === 2) {
        expDate = value.substring(0, 1)
        //Add slash after month
      } else if (value.length === 2 && value.indexOf('/') === -1) {
        expDate = `${value}/`
      } else {
        expDate = value
      }

    }

    const [exp_month, exp_year] = expDate.split('/')

    this.setState({
      expDate,
      form: {
        ...this.state.form,
        exp_month,
        exp_year: `20${exp_year}`,
      },
    })
  }

  render() {
    return (
        <KeyboardAvoidingView
            keyboardVerticalOffset={100}
            style={styles.container}
            behavior="padding">
          <View style={styles.formContainer}>
            <FloatingLabelInput
                maxLength={19}
                onChangeText={this.onChangeNumber}
                placeholder={I18n.t('addCardScreen.cardNumber')}
                keyboardType="numeric"
            />
            <View style={[styles.cardInfo, styles.row]}>
              <View style={[styles.column]}>
                <FloatingLabelInput
                    maxLength={5}
                    value={this.state.expDate}
                    onChangeText={this.onChangeExpDate}
                    keyboardType="numeric"
                    placeholder={I18n.t('addCardScreen.expDate')}
                />
              </View>
              <View style={[styles.column, styles.margin]}>
                <FloatingLabelInput
                    maxLength={3}
                    keyboardType="numeric"
                    onChangeText={this.onChangeCvc}
                    placeholder={I18n.t('addCardScreen.cvc')}
                />
              </View>
            </View>
            {this.props.hasError && <Text style={styles.error}>{this.props.errorMessage}</Text>}
          </View>
          <PrimaryButton loading={this.props.isPushing} label="Save" onPress={this.onPressAdd}
                         disabled={!this.state.isValid}/>
        </KeyboardAvoidingView >
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
    color: Color.BLUE,
    ...Font.FONT_BOLD,
    fontSize: 16,
  },
})
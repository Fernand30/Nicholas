import React, {Component} from 'react'
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
} from 'react-native'
import * as Color from '../constants/Color'
import I18n from '../i18n'
import NavBackButton from '../components/NavBackButton'
import Divider from '../components/Divider'
import * as Font from '../constants/Font'
import Stepper from '../components/Stepper'
import * as Style from '../constants/Style'
import ButtonNavigate from '../components/ButtonNavigate'
import PrimaryButton from '../components/PrimaryButton'
import {getPaymentSources} from '../redux/selectors/index'
import {connect} from 'react-redux'
import PaymentCardListContainer from '../containers/PaymentCardListContainer'
import OverlayModal from '../components/OverlayModal'
import moment from 'moment'
import CachedImage from '../components/CachedImage'
import {clearCheckout, createCharge} from '../redux/actions/checkout'
import {NavigationActions} from 'react-navigation'

@connect((state, ownProps) => CheckoutScreen.getStateProps(state, ownProps))
export default class CheckoutScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('checkoutScreen.title'),
    headerLeft: <NavBackButton
        hidden={navigation.state.params &&
        navigation.state.params.isPushing}
        navigation={navigation}/>,
  })

  static getStateProps(state, ownProps) {
    return {
      isPushing: state.checkout.isPushing,
      isCharged: state.checkout.charged,
      hasError: state.checkout.hasError,
      errorMessage: state.checkout.errorMessage,
      cards: getPaymentSources(state),
      event: state.events.entities[ownProps.navigation.state.params.id],
      ticket: state.events.tickets[ownProps.navigation.state.params.id][ownProps.navigation.state.params.selectedTicketKey],
    }
  }

  state = {
    selectedCard: this.props.cards.length > 0 ? this.props.cards[0] : null,
    displayModal: false,
    isValid: this.props.cards.length > 0,
    qty: 1,
  }

  componentWillUnmount() {
    this.props.dispatch(clearCheckout())
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.cards.length !== nextProps.cards.length) {
      //when user adds a new card, select the last
      const selectedCard = nextProps.cards[nextProps.cards.length - 1]

      this.setState({
        selectedCard,
        isValid: true,
        displayModal: false,
      })
    }
    if (!this.props.isCharged && nextProps.isCharged) {
      this.props.navigation.dispatch(NavigationActions.back())
    }
    if (this.props.isPushing !== nextProps.isPushing) {
      this.props.navigation.setParams({isPushing: nextProps.isPushing,})
    }
  }

  onPressCard = (selectedCard: UserCard) => {
    this.setState({selectedCard})
    this.toggleModal()
  }

  toggleModal = () => {
    this.setState({
      displayCardModal: !this.state.displayCardModal,
    })
  }

  onPressAddCard = (fromModal = false) => {
    if (fromModal) {
      this.toggleModal()
    }
    this.props.navigation.navigate('AddCard')
  }

  onPressConfirm = () => {
    let ticket = {...this.props.ticket, _key: this.props.navigation.state.params.selectedTicketKey}
    let contribution = this.props.navigation.state.params.selectedContribution
    this.props.dispatch(createCharge(this.props.event._key, this.state.selectedCard._key, ticket, this.state.qty, contribution))
  }

  onChangeQty = (qty) => {
    this.setState({qty})
  }

  renderError() {
    return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>{this.props.errorMessage}</Text>
        </View>
    )
  }

  renderCardsModal() {
    if (!this.state.selectedCard) {
      return null
    }

    return (
        <OverlayModal isVisible={this.state.displayCardModal} onPressOverlay={this.toggleModal}>
          <View style={styles.modalContent}>
            <PaymentCardListContainer
                mode='checklist'
                selectedCardKey={this.state.selectedCard._key}
                onPressCard={this.onPressCard}
                renderBottom={(
                    <ButtonNavigate style={styles.btnAddPayment} onPress={this.onPressAddCard.bind(this, true)}>
                      <Text style={styles.btnAddPaymentLabel}>{I18n.t('checkoutScreen.addCard')}</Text>
                    </ButtonNavigate>
                )}
            />
          </View>
        </OverlayModal>
    )
  }

  renderCardButton() {
    const {selectedCard} = this.state

    if (!selectedCard) {
      return (
          <ButtonNavigate style={styles.btnCard} onPress={this.onPressAddCard}>
            <Text style={styles.btnCardLabel}>{I18n.t('checkoutScreen.addCard')}</Text>
          </ButtonNavigate>
      )
    }

    return (
        <ButtonNavigate
            disabled={this.props.isPushing}
            style={styles.btnCard}
            onPress={this.toggleModal}
            renderRight={<Text style={styles.btnCardLabelChange}>{I18n.t('checkoutScreen.change')}</Text>}>
          <Image style={styles.btnCardIcon}
                 source={require('../../assets/icons/creditCard.png')}/>
          <Text style={styles.btnCardLabel}>······{selectedCard.last4}</Text>
        </ButtonNavigate>
    )
  }

  renderTicket = () => {
    const {event, ticket} = this.props
    const date = moment(event.start_date).format('DD-MMM')
    const max = ticket.qty - ticket.purchase_count

    return (
        <View style={styles.itemContainer}>
          <View style={styles.itemDetailContainer}>
            <View style={styles.itemImageContainer}>
              <CachedImage style={styles.image}
                           source={{uri: event.cover_img}}/>
              <View style={styles.itemPriceContainer}>
                <Text style={styles.itemName}>{ticket.name}</Text>
                <Text style={styles.itemDate}>{date}</Text>
                <Text style={styles.itemPrice}>{ticket.price} €</Text>
              </View>
            </View>
            <Stepper
                max={max}
                value={this.state.qty}
                onValueChange={this.onChangeQty}
                containerStyle={styles.stepper}
                labelStyle={styles.stepperBtn}
                buttonStyle={styles.stepperBtn}/>
          </View>
          <Divider />
        </View>
    )
  }

  render() {
    const {ticket} = this.props
    const total = ticket.price * this.state.qty

    return (
        <View style={styles.container}>
          <ScrollView>
            {this.renderTicket()}
            <Divider style={styles.divider2}/>
            <View style={styles.row}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={[styles.totalLabel, styles.totalAmount]}>{total} €</Text>
            </View>
            {this.props.hasError && this.renderError()}
          </ScrollView>

          <View style={styles.cardContainer}>
            <Text style={[Style.SECTION_TITLE, styles.sectionTitle]}>
              {I18n.t('paymentScreen.methods')}:
            </Text>
            <Divider />
            {this.renderCardButton()}
            <Divider />
          </View>
          <PrimaryButton
              disabled={this.props.isPushing || !this.state.isValid || this.props.isCharged}
              loading={this.props.isPushing}
              onPress={this.onPressConfirm}
              label={I18n.t('checkoutScreen.confirm')}/>
          {this.renderCardsModal()}
        </View>
    )
  }
}

const PADDING = 21
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
    paddingTop: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    marginHorizontal: PADDING,
    marginTop: 10,
  },
  itemImageContainer: {
    flexDirection: 'row',
    maxWidth: 180
  },
  itemPriceContainer:{},
  itemDetailContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemDate: {
    color: Color.CONTRAST_COLOR,
    fontSize: 15,
    ...Font.FONT_LIGHT,
  },
  itemPrice: {
    color: Color.CONTRAST_COLOR,
    fontSize: 20,
    ...Font.FONT_LIGHT,
  },
  image: {
    height: 67,
    width: 67,
    marginRight: 8,
  },
  itemName: {
    fontSize: 15,
    ...Font.FONT_BOLD,
    color: Color.CAMEL,
  },
  stepper: {
    height: 31,
    width: 140,
    alignSelf: 'flex-end',
    marginBottom: 5,
  },
  stepperBtn: {
    fontSize: 20,
  },
  divider1: {
    marginVertical: 14,
  },
  divider2: {
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: PADDING,
  },
  rowFirst: {
    marginBottom: 12,
  },
  preTaxLabel: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_LIGHT,
    fontSize: 15,
  },
  preTaxAmount: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_MEDIUM,
    fontSize: 15,
  },
  taxLabel: {
    fontSize: 12,
  },
  totalLabel: {
    color: Color.BLUE,
    fontSize: 20,
    ...Font.FONT_LIGHT,
  },
  totalAmount: {
    ...Font.FONT_BOLD,
  },

  cardContainer: {
    marginBottom: 44,
    paddingTop: 8,
  },
  btnCard: {
    paddingLeft: PADDING,
  },
  btnCardIcon: {
    marginRight: 12.5,
  },
  btnCardLabel: {
    color: Color.CONTRAST_COLOR,
    fontSize: 17.5,
    letterSpacing: 0.6,
  },
  btnCardLabelChange: {
    color: Color.WARM_GREY,
    ...Font.FONT_BOLD,
    fontSize: 17.5,
  },
  sectionTitle: {
    marginBottom: 8.5,
    marginLeft: PADDING,
  },
  btnConfirm: {
    fontSize: 20,
    letterSpacing: 0.5,
  },

  //modal
  modalContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  btnAddPayment: {
    paddingLeft: 21,
  },
  btnAddPaymentLabel: {
    color: Color.CONTRAST_COLOR,
    fontSize: 17.5,
    ...Font.FONT_LIGHT,
    letterSpacing: 0.6,
  },
  errorContainer: {
    paddingHorizontal: 20,
    marginTop: 40,
  },
  errorMessage: {
    color: Color.CAMEL,
    textAlign: 'center',
    ...Font.FONT_LIGHT,
    fontSize: 16,
  },
})


import React, {Component} from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import * as Color from '../constants/Color'
import NavBackButton from '../components/NavBackButton'
import I18n from '../i18n'
import * as Style from '../constants/Style'
import Divider from '../components/Divider'
import Button from '../components/Button'
import OverlayModal from '../components/OverlayModal'
import * as Font from '../constants/Font'
import PaymentCardListContainer from '../containers/PaymentCardListContainer'
import ActionSheet from 'react-native-actionsheet'
import {removeCard} from '../redux/actions/payment'
import {connect} from 'react-redux'
import PayoutBankListContainer from '../containers/PayoutBankListContainer'
import type { UserCard, StripeBankAccount } from '../TypeDefinition'

@connect((state, ownProps) => PaymentScreen.getStateProps(state, ownProps))
export default class PaymentScreen extends Component {
  static navigationOptions = ({navigation, screenProps}) => ({
    title: I18n.t('paymentScreen.title'),
    headerLeft: <NavBackButton/>,
  })

  static getStateProps(state) {
    return {
      userProfile: state.currentUser.profile || {},
    }
  }

  state = {
    selectedCard: null,
    selectedBank: null,
    displayCardModal: false,
    displayBankModal: false,
  }

  onPressAddCard = () => {
    this.props.navigation.navigate('AddCard')
  }

  onPressAddBank = () => {
    this.props.navigation.navigate('AddBank')
  }

  onPressEditBank = () => {
    this.toggleBankModal()
    this.onPressAddBank()
  }

  onPressCard = (selectedCard: UserCard) => {
    this.setState({selectedCard})
    this.toggleCardModal()
  }

  onPressBank = (selectedBank: StripeBankAccount) => {
    this.setState({selectedBank})
    this.toggleBankModal()
  }

  onPressAction = (index) => {
    if (index === 0) {
      this.toggleCardModal()
      this.props.dispatch(removeCard(this.state.selectedCard._key))
    }
  }

  onPressDelete = () => {
    this.refs.actionSheet.show()
  }

  toggleCardModal = () => {
    this.setState({
      displayCardModal: !this.state.displayCardModal,
    })
  }

  toggleBankModal = () => {
    this.setState({
      displayBankModal: !this.state.displayBankModal,
    })
  }

  renderCardModal() {
    const card = this.state.selectedCard
    if (!card) {
      return null
    }

    return (
        <OverlayModal isVisible={this.state.displayCardModal} onPressOverlay={this.toggleCardModal}>
          <View style={styles.modal}>
            <Text style={[styles.modalText, styles.modalTitle]}>{card.brand}</Text>
            <Text style={[styles.modalText, styles.modalLabel]}>{I18n.t('paymentScreen.cardNumber')}</Text>
            <Text style={styles.modalText}>···· ···· ···· {card.last4}</Text>

            <Divider style={styles.divider}/>

            <Text style={[styles.modalText, styles.modalLabel]}>{I18n.t('paymentScreen.expDate')}</Text>
            <Text style={styles.modalText}>{card.exp_month}/{card.exp_year}</Text>

            <Button onPress={this.onPressDelete} label={I18n.t('paymentScreen.delete')} labelStyle={styles.modalBtnDeleteLabel} style={styles.modalBtnDelete}/>
          </View>
        </OverlayModal>
    )
  }

  renderBankModal() {
    const bank = this.state.selectedBank
    if (!bank) {
      return null
    }

    return (
        <OverlayModal isVisible={this.state.displayBankModal} onPressOverlay={this.toggleBankModal}>
          <View style={styles.modal}>
            <Text style={[styles.modalText, styles.modalTitle]}>{bank.bank_name}</Text>
            <Text style={[styles.modalText, styles.modalLabel]}>{I18n.t('paymentScreen.accountNumber')}</Text>
            <Text style={styles.modalText}>···· ···· ···· {bank.last4}</Text>

            <Button onPress={this.onPressEditBank} label={I18n.t('paymentScreen.edit')}
                    labelStyle={styles.modalBtnDeleteLabel} style={styles.modalBtnDelete}/>
          </View>
        </OverlayModal>
    )
  }

  renderBanks(){
    const {userProfile: stripe_connect_is_valid = false} = this.props

    if (!stripe_connect_is_valid) {
      return null
    }

    return (
      <View>
        <PayoutBankListContainer
          onPressCard={this.onPressBank}
          renderBottom={<Button style={styles.btnAdd} label={I18n.t('paymentScreen.addBank')}
                                onPress={this.onPressAddBank}/>}
        />
        {this.renderBankModal()}
      </View>
    )
  }

  render() {
    return (
        <View style={styles.container}>
          <Text style={[Style.SECTION_TITLE, styles.sectionTitle]}>
            {I18n.t('paymentScreen.methods')}:
          </Text>
          <View>
            <PaymentCardListContainer
                onPressCard={this.onPressCard}
                renderBottom={<Button style={styles.btnAdd} label={I18n.t('paymentScreen.add')}
                                      onPress={this.onPressAddCard}/>}
            />
          </View>
          <Text style={[Style.SECTION_TITLE, styles.sectionTitle, styles.bankTitle]}>
            {I18n.t('paymentScreen.payouts')}:
          </Text>
          {this.renderBanks()}
          {this.renderCardModal()}
          <ActionSheet
              ref="actionSheet"
              title={I18n.t('paymentScreen.confirmDeletion')}
              options={[I18n.t('paymentScreen.confirm'), I18n.t('paymentScreen.cancel')]}
              cancelButtonIndex={1}
              onPress={this.onPressAction}
          />
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    marginBottom: 8.5,
    marginLeft: 18.5,
  },
  bankTitle: {
    marginTop: 30,
  },
  cardBrand: {
    fontSize: 15,
  },

  modal: {
    backgroundColor: Color.CONTRAST_COLOR,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 17.5,
    marginBottom: 10,
  },
  modalText: {
    backgroundColor: 'transparent',
    color: Color.BACKGROUND_COLOR,
  },
  modalLabel: {
    color: Color.WARM_GREY,
    ...Font.FONT_BOLD,
    fontSize: 13,
  },
  modalBtnDelete: {
    marginTop: 15,
    borderWidth: 0.5,
    borderColor: Color.BACKGROUND_COLOR,
    borderRadius: 1.5,
  },
  modalBtnDeleteLabel: {
    color: Color.BACKGROUND_COLOR,
  },
  divider: {
    backgroundColor: 'rgba(174, 179, 187, 0.5)',
    marginVertical: 10,
  },

  btn: {
    paddingLeft: 21,
  },
  btnIcon: {
    marginRight: 12.5,
  },
  btnLabel: {
    color: Color.CONTRAST_COLOR,
    fontSize: 17.5,
    letterSpacing: 0.6,
  },
  btnAdd: {
    marginHorizontal: 20,
    marginTop: 26.5,
  },
})
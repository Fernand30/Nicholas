import {StripeCard} from '../../TypeDefinition'
import * as Action from './ActionTypes'
import Auth from '../../utils/Auth'
import Firebase from '../../utils/Firebase'
import Stripe from '../../utils/StripeHelper'

export const addCard = (card: StripeCard) => (dispatch, getState) => {
  dispatch({
    type: Action.ADD_PAYMENT_CARD_REQUEST,
  })

  Stripe.addCard(card)
      .then((response: StripeCard) => {
        dispatch({
          type: Action.ADD_PAYMENT_CARD_SUCCESS,
          payload: response.data,
        })
      })
      .catch(err => {
        dispatch({
          type: Action.ADD_PAYMENT_CARD_ERROR,
          payload: err,
        })
      })
}

export const removeCard = (sourceId) => (dispatch, getState) => {
  dispatch({
    type: Action.REMOVE_PAYMENT_CARD_REQUEST,
  })

  Stripe.removeCard(sourceId)
      .then(() => {
        dispatch({
          type: Action.REMOVE_PAYMENT_CARD_SUCCESS,
          payload: sourceId,
        })
      })
      .catch(err => {
        dispatch({
          type: Action.REMOVE_PAYMENT_CARD_ERROR,
          payload: err,
        })
      })
}

export const clearError = () => (dispatch, getState) => {
  dispatch({
    type: Action.CLEAR_PAYMENT_CARD_ERROR,
  })
}

export const fetchCards = () => (dispatch, getState) => {
  Firebase.getDbRef(`/stripe_customers/${Auth.getUid()}/sources`)
      .once('value', snapshot => {
        dispatch({
          type: Action.PAYMENT_CARD_RECEIVED,
          payload: snapshot.val(),
        })
      })
}
import * as Action from './ActionTypes'
import Auth from '../../utils/Auth'
import Firebase from '../../utils/Firebase'
import Stripe from '../../utils/StripeHelper'
import type { UserBankAccount } from '../../TypeDefinition'

export const addBank = (account: UserBankAccount) => (dispatch) => {
  dispatch({
    type: Action.ADD_BANK_ACCOUNT_REQUEST,
  })

  Stripe.setDefaultBankAccount(account)
    .then((response) => {
      dispatch({
        type: Action.ADD_BANK_ACCOUNT_SUCCESS,
        payload: response.data,
      })
    })
    .catch(err => {
      dispatch({
        type: Action.ADD_BANK_ACCOUNT_ERROR,
        payload: err,
      })
    })
}

export const clearError = () => (dispatch) => dispatch({ type: Action.CLEAR_BANK_ACCOUNT_ERROR })

export const fetchBankAccounts = () => (dispatch, getState) => {
  Firebase
    .getDbRef(`/stripe_customers/${Auth.getUid()}/bank_accounts`)
    .once('value')
    .then(snapshot => dispatch({ type: Action.BANK_ACCOUNT_RECEIVED, payload: snapshot.val() }))
}
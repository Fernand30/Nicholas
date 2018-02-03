import * as firebase from 'firebase'
import * as Action from './ActionTypes'
import Firebase from '../../utils/Firebase'
import I18n from '../../i18n'

let checkoutRef

export const clearCheckout = () => (dispatch, getState) => {
  if (checkoutRef) {
    checkoutRef.off('value')
  }
  dispatch({
    type: Action.CLEAR_CHECKOUT,
  })
}

export const createCharge = (
    eventId: string, sourceId: string, ticket: EventTicket, qty, contributionId: string = null) => (dispatch, getState) => {
  const userId = getState().currentUser.uid
  const event = getState().events.entities[eventId]
  const charge = {
    event_id: eventId,
    source_id: sourceId,
    contribution_id: contributionId ,
    is_secret: event.is_secret || false,
    ticket_id: ticket._key,
    ticket_name: ticket.name,
    qty,
  }

  dispatch({
    type: Action.CHECKOUT_REQUEST,
    payload: charge,
  })

  checkoutRef = Firebase.getDbRef(`/stripe_customers/${userId}/charges`).push()
  checkoutRef.on('value', snapshot => {
    const data = snapshot.val()

    if (data && data.paid !== undefined) {
      checkoutRef.off('value')
      dispatch({
        type: data.paid ? Action.CHECKOUT_SUCCESS : Action.CHECKOUT_ERROR,
        payload: {
          charge,
          response: data,
          _key: checkoutRef.key,
        },
      })
    } else if (data && data.error) {
      dispatch({
        type: Action.CHECKOUT_ERROR,
        payload: {
          response: data,
          _key: checkoutRef.key,
        },
      })
    }

  })

  checkoutRef
      .set(charge)
      .catch(error => {
        dispatch({
          type: Action.CHECKOUT_ERROR,
          payload: {
            error,
            response: {
              error: I18n.t('checkout.noTicketsLeft'),
            },
            _key: checkoutRef.key,
          },
        })
      })
}
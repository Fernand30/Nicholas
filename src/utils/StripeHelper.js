import ApiHelper from './ApiHelper'
import type { StripeCard, UserBankAccount } from '../TypeDefinition'

export default class StripeHelper {

  static addCard(source: StripeCard): Promise {
    const data = {
      source: {
        object: 'card',
        ...source,
      },
    }
    return ApiHelper.authenticatedRequest('addCard', data)
  }

  static removeCard(sourceId: string): Promise {
    return ApiHelper.authenticatedRequest('removeCard', { sourceId })
  }

  static setDefaultBankAccount(data: UserBankAccount): Promise {
    return ApiHelper.authenticatedRequest('addBank', data)
  }
}
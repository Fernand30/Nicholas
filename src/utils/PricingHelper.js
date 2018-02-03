export default class PricingHelper {

  static STRIPE_FIXED_FEE = 0.14 //EUR
  static STRIPE_PERCENT_FEE = 0.0091 //0.91%

  static calculateNetEarning(ticketPrice, isPro = false): Number {
    const price = +ticketPrice
    const wattzFee = 0.7
    const fees = wattzFee + this.stripeFees(price)
    return (price - fees).toFixed(2)
  }

  static stripeFees(price): Number {
    return (+price * this.STRIPE_PERCENT_FEE) + this.STRIPE_FIXED_FEE
  }
}
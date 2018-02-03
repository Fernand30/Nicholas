//https://github.com/jquense/yup
import yup from 'yup'
import cardValidator from 'card-validator'

export const PASSWORD_VALIDATION_SCHEMA = yup.string().required().min(6)

export const PASSWORD_CHANGE_SCHEMA = yup.object().shape({
  currentPassword: yup.string().required(),
  newPassword: PASSWORD_VALIDATION_SCHEMA,
})

export const LOGIN_VALIDATION_SCHEMA = yup.object().shape({
  email: yup.string().email(),
  password: yup.string().required(),
})

export const SIGNUP_VALIDATION_SCHEMA = yup.object().shape({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  email: yup.string().email(),
  password: PASSWORD_VALIDATION_SCHEMA,
})

export const SIGNUP_PHONE_VALIDATION_SCHEMA = yup.object().shape({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  phoneNum: yup.string().required(),

  // phone_num: yup.string()
  //     .when('PhoneNum', {
  //       is: true,
  //       then: yup.string().required(),
  //       otherwise: yup.string().ensure(),
  //     }),
})

export const PROFILE_VALIDATION_SCHEMA = yup.object().shape({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  birth_date: yup.number().required(),
  username: yup.string().required(),
  address: yup.string().required(),
  occupation: yup.string().ensure(),
})

export const CONTRIBUTION_VALIDATION_SCHEMA = yup.array().of(
    yup.object().shape({
      name: yup.string().required(),
      qty: yup.number().min(1),
    }),
).min(1).required()

export const EVENT_VALIDATION_SCHEMA = yup.object().shape({
  name: yup.string().required(),
  description: yup.string().required(),
  // place_type: yup.string().required(),
  address: yup.string().required(),
  google_place_id: yup.string().required(),
  categories: yup.array().min(1).max(3),
  // contribution: yup.array().max(10),
  location: yup.array().of(yup.number()).min(2).max(2).required(),

  // start_date: yup.number().required(),
  // end_date: yup.number().test('gt-start-date', '${path} must be greater than start_date', function(value) {
  //   const {start_date} = this.parent
  //   return value > start_date
  // }),

  // is_free: yup.boolean(),

  // attendance_limit: yup.number()
  //     .when('is_free', {
  //       is: true,
  //       then: yup.number().min(1).required(),
  //       otherwise: yup.number(),
  //     }),

  // prices: yup.array()
  //     .max(5)
  //     .when('is_free', {
  //       is: false,
  //       then: yup.array().of(
  //           yup.object().shape({
  //             name: yup.string().required(),
  //             price: yup.number().min(2),
  //             qty: yup.number().min(1),
  //           }),
  //       ).required(),
  //       otherwise: yup.array().ensure(),
  //     }),
})

export const EVENT_PROFILE_VALIDATION = yup.object().shape({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  address_components: yup.string().required(),
  birth_date: yup.number().required(),
})

export const EVENT_CHECKOUT_VALIDATION = yup.object().shape({
  is_free: yup.boolean().required(),
  // contribution: yup.array(),
  // selectedTicketKey: yup.string()
  //     .when('is_free', {
  //       is: false,
  //       then: yup.string().required(),
  //       otherwise: yup.string().ensure(),
  //     }),
  // selectedContribution: yup.string().ensure()
  //     .when('contribution', (contribution, schema) => {
  //       return contribution && contribution.length > 0 ? schema.required() : schema
  //     }),
  // end_date: yup.number().test('gt-start-date', '${path} must be greater than start_date', function(value) {
  //   return value >= new Date().getTime() / 1000
  // }),
})

export const CREDIT_CARD_VALIDATION_SCHEMA = yup.object().shape({
  number: yup
      .number()
      .required()
      .test('is-valid-cc', '${path} is not a valid credit card', value => cardValidator.number(value).isValid),
  exp_year: yup.number().min(2000).integer(),
  exp_month: yup.number().min(1).integer(),
  cvc: yup.string().required().min(3),
})

export const BANK_ACCOUNT_VALIDATION_SCHEMA = yup.object().shape({
  account_number: yup.string().required().min(11)
})

export const USER_SOCIAL_STATUS_VALIDATION = yup.object().shape({
  status: yup.string().test('status', '${path} is required if no image is provided', function(value) {
    const {images} = this.parent
    return value !== null && value.trim() !== '' || images.length > 0
  }),
  images: yup.array().test('images', '${path} is required if no "status" is provided', function(value) {
    const {status} = this.parent
    return value.length > 0 || status !== null && status.trim() !== ''
  }),
})

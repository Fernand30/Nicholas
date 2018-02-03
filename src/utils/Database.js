// @flow
import {User} from '../TypeDefinition'
import Firebase from './Firebase'
import _ from 'lodash'

function filterAttributes(object: Object, validAttributes: Array) {
  return _.pickBy(object, (val, key) => {
    return validAttributes.indexOf(key) !== -1
  })
}
const PROFILE_FIELDS: User = [
  'first_name',
  'last_name',
  'profile_img',
  'birth_year',
  'username',
  'is_verified',
  'is_pro',
  'organization',
  'tax_id',
]

export default class Database {

  static updateProfile(user: User) {
    const validAttributes = filterAttributes(user, PROFILE_FIELDS)
    const currentUser = Firebase.getInstance().auth().currentUser
    const path = `users/${currentUser.uid}`

    const keys = Object.keys(validAttributes)
    if (keys.indexOf('first_name') !== -1 || keys.indexOf('last_name') !== -1) {
      const display_name = `${validAttributes.first_name} ${validAttributes.last_name}`
      currentUser.updateProfile({displayName: display_name})

      validAttributes['display_name'] = display_name
    }

    return Firebase.getDbRef(path).update(validAttributes)
  }

}
import axios from 'axios'
import qs from 'qs'
import Auth from './Auth'

export default class ApiHelper {
  static authenticatedRequest(endpoint: string, payload: Object): Promise {
    return Auth.getAuthToken().then(token => {
      const request = {
        url: `https://us-central1-wattz-demo.cloudfunctions.net/${endpoint}`,
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }

      if (payload) {
        request.method = 'POST'
        request.data = qs.stringify(payload)
      }

      return axios(request)
    })
  }
}
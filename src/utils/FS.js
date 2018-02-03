import {
  Platform,
} from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob'
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest
window.Blob = RNFetchBlob.polyfill.Blob

const fs = RNFetchBlob.fs

export async function fileToBlob(uri, mime){
  const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri
  const data =  await fs.readFile(uploadUri, 'base64')
  return await Blob.build(data, {type: `${mime};BASE64`})
}
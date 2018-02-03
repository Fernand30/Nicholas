import SoundLib from 'react-native-sound'

export const SOUND_SEND_MSG = new SoundLib('tab1.mp3', SoundLib.MAIN_BUNDLE, (error) => {
  if (error) {
    console.log(error)
  }
})
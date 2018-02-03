export default class IconHelper {

  static getPinImageSource(eventType) {
    switch (eventType){
      case 'party':
        return require('../../assets/icons/imgPinParty.png')
      case 'culture':
        return require('../../assets/icons/imgPinCulture.png')
      case 'work':
        return require('../../assets/icons/imgPinWork.png')
      case 'sport':
        return require('../../assets/icons/imgPinSport.png')
      case 'food':
        return require('../../assets/icons/imgPinFood.png')
      case 'wellness':
        return require('../../assets/icons/imgPinWellness.png')
      case 'excursion':
        return require('../../assets/icons/imgPinExcursion.png')
      case 'fashion':
        return require('../../assets/icons/imgPinFashion.png')
      case 'gaming':
        return require('../../assets/icons/imgPinGame.png')
    }
  }

  static getIconSource(eventType){
    switch (eventType){
      case 'party':
        return require('../../assets/icons/event-types/icParty.png')
      case 'culture':
        return require('../../assets/icons/event-types/icCulture.png')
      case 'work':
        return require('../../assets/icons/event-types/icWork.png')
      case 'sport':
        return require('../../assets/icons/event-types/icSport.png')
      case 'food':
        return require('../../assets/icons/event-types/icFood.png')
      case 'wellness':
        return require('../../assets/icons/event-types/icWellness.png')
      case 'excursion':
        return require('../../assets/icons/event-types/icExcursion.png')
      case 'fashion':
        return require('../../assets/icons/event-types/icFashion.png')
      case 'gaming':
        return require('../../assets/icons/event-types/icGame.png')
    }
  }

}
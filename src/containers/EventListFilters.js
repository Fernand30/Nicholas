import React, {PureComponent} from 'react'
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  LayoutAnimation,
} from 'react-native'
import Button from '../components/Button'
import * as Color from '../constants/Color'
import I18n from '../i18n/index'
import {Categories} from '../constants/Data'
import EventCategory from '../components/EventCategory'
import {connect} from 'react-redux'
import {NavigationActions} from 'react-navigation'
import {updateEventFilterParams} from '../redux/actions/eventsFilter'

@connect(state => state => EventListFilters.getStateProps(state))
export default class EventListFilters extends PureComponent {
  static getStateProps(state) {
    return {
      favorites: state.favorites.events,
      currentFilter: state.eventsFilter.currentFilter,
      activeCategory: state.eventsFilter.activeCategory,
    }
  }

  componentWillUpdate() {
    LayoutAnimation.easeInEaseOut()
  }

  onPressCategory = (activeCategory) => {
    if (activeCategory === this.props.activeCategory) {
      this.props.dispatch(updateEventFilterParams({activeCategory: null}))
    } else {
      this.props.dispatch(updateEventFilterParams({activeCategory}))
    }
  }

  onPressFilters = () => {
    this.props.dispatch(NavigationActions.navigate({routeName: 'Filter'}))
  }

  onPressFavorites = () => {
    if (this.props.currentFilter !== 'FAVORITES') {
      this.props.dispatch(updateEventFilterParams({currentFilter: 'FAVORITES', activeCategory: null}))
    } else {
      this.props.dispatch(updateEventFilterParams({currentFilter: 'ALL'}))
    }
  }

  renderCategory = (props, index) => {
    const {activeCategory} = this.props
    return (
        <EventCategory
            {...props}
            onPress={this.onPressCategory.bind(this, props.id)}
            checked={activeCategory === props.id}
            index={index}
            key={index}
        />
    )
  }

  render() {
    const btnFavStyles = [styles.btnFavorites]
    let btnFavIcon

    if (this.props.currentFilter === 'FAVORITES') {
      btnFavStyles.push(styles.btnFavoritesActive)
      btnFavIcon = require('../../assets/icons/icStarActive.png')
    } else {
      btnFavIcon = require('../../assets/icons/icStarInactive.png')
    }

    const displayFavorites = this.props.favorites.length > 0 || this.props.currentFilter === 'FAVORITES'
    return (
        <View>
          <View style={styles.filterContainer}>
            <Button
                label={I18n.t('mainScreen.buttonFilter')}
                onPress={this.onPressFilters}
                style={styles.btnFilter}
                renderLeft={<Image
                    source={require('../../assets/icons/icFilter.png')}/>}/>
            {displayFavorites && <Button
                renderLabel={<Image source={btnFavIcon}/>}
                onPress={this.onPressFavorites}
                style={btnFavStyles}
            />}
          </View>
          <View style={styles.categoryList}>
            <ScrollView
                style={styles.categoryScrollView}
                horizontal={true}
                showsHorizontalScrollIndicator={false}>
              {Categories.map(this.renderCategory)}
            </ScrollView>
          </View>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10,
  },
  btnFilter: {
    flex: 1,
  },
  btnFavorites: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 66,
    marginLeft: 16,
  },
  btnFavoritesActive: {
    backgroundColor: Color.BLUE,
    borderColor: Color.BLUE,
  },
  categoryScrollView: {
    marginTop: 22,
    paddingBottom: 10,
    height: 90,
  },
  categoryList: {
    paddingLeft: 5,
  },
})
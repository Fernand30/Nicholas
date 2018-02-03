import React, {Component} from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native'
import * as Color from '../constants/Color'
import * as Font from '../constants/Font'
import I18n from '../i18n/index'
import NavBackButton from './NavBackButton'
import Button from './Button'
import Stepper from './Stepper'
import Input from './Input'
import Divider from './Divider'
import PrimaryButton from './PrimaryButton'
import _ from 'lodash'
import {CONTRIBUTION_VALIDATION_SCHEMA} from '../constants/ValidationSchemas'
import NavBar from '../NavBar'
import {EventContribution} from '../TypeDefinition'

type Props = {
  onPressBack: () => void,
  onPressSave: (list: Array<EventContribution>) => void,
  list: Array<EventContribution>,
}

export default class ContributionModal extends Component {
  props: Props

  state = {
    list: this.props.list,
    isValid: false,
  }

  componentDidMount() {
    this.validateForm()
  }

  componentDidUpdate(prevProps, prevState) {
    if (!_.isEqual(prevState.list, this.state.list)) {
      this.validateForm()
    }
  }

  validateForm() {
    CONTRIBUTION_VALIDATION_SCHEMA
        .validate(this.state.list)
        .then(() => this.setState({isValid: true}))
        .catch((error) => this.setState({isValid: false}))
  }

  onPressAdd = () => {
    const list = _.cloneDeep(this.state.list)
    list.push({name: '', qty: 1})
    this.setState({list})
  }

  onChangeQty = (index, qty) => {
    let list = _.cloneDeep(this.state.list)
    list[index].qty = qty

    this.setState({
      list,
    })
  }

  onChangeName = (index, name) => {
    let list = _.cloneDeep(this.state.list)
    list[index].name = name

    this.setState({
      list,
    })
  }

  onPressRemove(index) {
    const list = _.cloneDeep(this.state.list).filter((contrib, i) => i !== index)
    this.setState({
      list,
    })
  }

  onPressSave = () => {
    this.props.onPressSave(this.state.list)
  }

  renderItem = ({name, qty}, index) => {
    const count = this.state.list.length
    const style = [styles.itemContainer]

    return (
        <View style={style} key={index}>
          <View style={styles.inputWrapper}>
            <Input
                onChangeText={this.onChangeName.bind(this, index)}
                placeholder={I18n.t('contributionScreen.placeholder')}
                value={name}
                maxLength={35}
            />
          </View>
          <View style={styles.stepperContainer}>
            {count > 1 &&
            <Button
                onPress={this.onPressRemove.bind(this, index)}
                style={styles.btnDelete}
                labelStyle={styles.btnDeleteLabel}
                label={I18n.t('contributionScreen.delete')}
            />}
            <View style={styles.stepperWrapper}>
              <Stepper
                  onValueChange={this.onChangeQty.bind(this, index)}
                  containerStyle={styles.stepper}
                  value={qty}/>
            </View>
          </View>
          {count > 1 &&
          <Divider style={styles.divider}/>}
        </View>
    )
  }

  render() {
    return (
        <View style={styles.container}>
          <NavBar
              title={I18n.t('contributionScreen.title')}
              headerLeft={<NavBackButton onPress={this.props.onPressBack} />}
          />
          <ScrollView contentContainerStyle={styles.scrollView}>
            {this.state.list.map(this.renderItem)}
            <Button
                onPress={this.onPressAdd}
                style={styles.btnAdd}
                label={I18n.t('contributionScreen.btnAdd')}/>
          </ScrollView>
          <PrimaryButton
              disabled={!this.state.isValid}
              onPress={this.onPressSave}
              label={I18n.t('contributionScreen.btnSave')}/>
        </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.BACKGROUND_COLOR,
  },
  scrollView: {
    paddingBottom: 30,
  },
  shadowTitle: {
    ...Font.FONT_BOLD_ITALIC,
    position: 'absolute',
    top: -30,
    left: -10,
    width: 900,
    backgroundColor: 'transparent',
    fontSize: 75,
    letterSpacing: -3,
    color: Color.CONTRAST_COLOR,
    opacity: 0.4,
  },
  title: {
    ...Font.FONT_BOLD,
    backgroundColor: 'transparent',
    fontSize: 25,
    color: Color.CONTRAST_COLOR,
    marginTop: 5,
    marginLeft: 14.5,
    marginBottom: 27.5,
  },
  inputWrapper: {
    marginHorizontal: 27,
  },
  btnAdd: {
    marginTop: 21.5,
    marginHorizontal: 19.5,
  },
  itemMargin: {
    marginTop: 27.5,
  },
  stepperContainer: {
    flexDirection: 'row',
    marginTop: 18.5,
    paddingHorizontal: 27,
  },
  stepperWrapper: {},
  stepper: {
    alignSelf: 'flex-end',
  },
  divider: {
    marginTop: 27.5,
    marginBottom: 16,
  },
  btnDeleteLabel: {
    fontSize: 17.5,
  },
  btnDelete: {
    flex: 1,
    height: 44,
    marginRight: 30,
  },
  btnSave: {
    fontSize: 20,
    letterSpacing: 0.5,
  },
})
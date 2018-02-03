import React, {PureComponent} from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'
import EditProfileFloatingLabelInput from './EditProfileFloatingLabelInput'

type Field = {
  id: string,
  placeholder: string,
  maxLength: number,
  render?: (props: Field) => void,
  onChangeText: () => void,
}

type Props = {
  fields: Array<Field>,
  renderEnd?: any,
  containerStyle?: any,
}

export default class Form extends PureComponent {
  props: Props

  renderInput(props, index) {
    const containerStyle = []

    if (index > 0) {
      containerStyle.push(styles.inputFirst)
    }

    if (typeof props.render === 'function') {
      return props.render(props)
    }

    return (
        <EditProfileFloatingLabelInput {...props} containerStyle={containerStyle} key={props.id}/>
    )
  }

  render() {
    const {fields, renderEnd, containerStyle} = this.props
    return (
        <View style={containerStyle}>
          {fields.map(this.renderInput)}
          {renderEnd}
        </View>
    )
  }
}

const styles = StyleSheet.create({
  inputFirst: {
    marginTop: 20,
  },
})
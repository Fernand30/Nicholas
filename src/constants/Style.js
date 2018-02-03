import * as Color from "./Color"
import * as Font from "./Font"

export const PRIMARY_BUTTON_STYLE = {
  backgroundColor: Color.BTN_COLOR,
  paddingVertical: 9.5,
  borderWidth: 0,
}
export const PRIMARY_BUTTON_LABEL = {
  color: 'white',
  ...Font.FONT_MEDIUM,
  fontSize: 15,
  textAlign: 'center',
}

export const HEADER_TITLE_STYLE = {
  headerTitleStyle: {
    color: Color.CONTRAST_COLOR,
    ...Font.FONT_BOLD,
    fontSize: 17.5,
  }
}
export const HEADER_STYLE = {
  headerStyle: {
    backgroundColor: Color.NAV_BGCOLOR,
    paddingHorizontal: 17,
  },
}

export const SECTION_TITLE = {
  color: Color.CAMEL,
  fontSize: 17.5,
    ...Font.FONT_BOLD,
}
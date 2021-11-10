import Typography from "typography"

export const fonts = {
  regular: 'Helvetica Neue Regular',
  regularItalic: 'Helvetica Neue Regular Italic',
  bold: 'Helvetica Neue Bold',
  boldItalic: 'Helvetica Neue Bold Italic',
}

const typography = new Typography({
  baseFontSize: '18px',
  baseLineHeight: 1.55,
  headerLineHeight: 1.4,
  headerFontFamily: [fonts.bold, 'sans-serif'],
  bodyFontFamily: [fonts.regular, 'sans-serif'],
})

if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
const less = require('less')

module.exports = function (source) {
  let css = ''
  less.render(source, (err, data) => {
    css = data.css
  })
  return css
}
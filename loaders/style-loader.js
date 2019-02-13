module.exports = function (source) {
  let style = `
    let style = document.createElement('style')
    style.innerHTML = ${JSON.stringify(source)}
    document.head.appendChild(style)
  `
  style = style.replace(/\\n/g, '\\\\n')
  return style
}
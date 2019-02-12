const TOSTRING = Object.prototype.toString

exports.isObject = obj => {
  return TOSTRING.call(obj) === "[object Object]"
}

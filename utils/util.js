import barcode from 'barcode.js';
function convert_length(length) {
  return Math.round(wx.getSystemInfoSync().windowWidth * length / 750);
}

function barc(id, code, width, height) {
  barcode.code128(wx.createCanvasContext(id), code, convert_length(width), convert_length(height))
}
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function convert(num) {
  var s = ''
  while (num > 0) {
    var m = num % 26
    if (m === 0) m = 26
    s = (m + 9).toString(36) + s
    num = (num - m) / 26
  }
  return s.toUpperCase()
}

module.exports = {
  formatTime: formatTime,
  barcode: barc,
  convert: convert
}


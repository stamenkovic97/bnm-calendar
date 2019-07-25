export function isTouchDevice() {
  const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ')
  let mq = function(query) {
    return window.matchMedia(query).matches
  }

  // eslint-disable-next-line
  if ('ontouchstart' in window || window.DocumentTouch) {
    return true
  }

  // https://git.io/vznFH
  const query = ['(', prefixes.join('touch-enabled),('), 'interview', ')'].join('')
  return mq(query)
}

export function isIE() {
  const msie = window.navigator.userAgent.indexOf('MSIE ')

  if (msie > 0 || navigator.userAgent.match(/Trident.*rv:11\./)) {
    // stackoverflow
    return true
  }

  // and also edge

  return /Edge/i.test(navigator.userAgent)
}

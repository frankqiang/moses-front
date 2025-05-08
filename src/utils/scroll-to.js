/**
 * 滚动到指定位置的工具函数
 * @param {number} to - 目标位置
 * @param {number} duration - 动画持续时间
 */
Math.easeInOutQuad = function(t, b, c, d) {
  t /= d / 2
  if (t < 1) {
    return c / 2 * t * t + b
  }
  t--
  return -c / 2 * (t * (t - 2) - 1) + b
}

// requestAnimationFrame polyfill
const requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000 / 60) }
})()

/**
 * 滚动到指定位置
 * @param {number} to - 目标位置
 * @param {number} duration - 动画持续时间，默认为500ms
 * @param {Function} callback - 滚动完成后的回调函数
 */
export function scrollTo(to, duration = 500, callback) {
  const start = window.pageYOffset
  const change = to - start
  const increment = 20
  let currentTime = 0

  const animateScroll = function() {
    currentTime += increment
    const val = Math.easeInOutQuad(currentTime, start, change, duration)
    window.scrollTo(0, val)
    if (currentTime < duration) {
      requestAnimFrame(animateScroll)
    } else {
      if (callback && typeof callback === 'function') {
        callback()
      }
    }
  }
  animateScroll()
} 
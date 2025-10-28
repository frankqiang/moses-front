/**
 * Created by PanJiaChen on 16/11/18.
 */

// 第三方库工具函数导出
import debounce from 'lodash.debounce'
import throttle from 'lodash.throttle'
import cloneDeep from 'lodash.clonedeep'

// 导出第三方库工具函数
export { debounce, throttle, cloneDeep }

/**
 * 格式化API查询参数，移除空值和undefined值
 * @param {Object} params 原始查询参数对象
 * @returns {Object} 格式化后的查询参数对象
 */
export function formatQueryParams(params = {}) {
  const result = {}
  Object.keys(params).forEach(key => {
    const value = params[key]
    if (value !== '' && value !== null && value !== undefined) {
      result[key] = value
    }
  })
  return result
}

// formatDateTime 函数已移除，请直接使用 parseTime 函数，传入格式 '{y}-{m}-{d} {h}:{i}'

/**
 * 原始的时间解析函数 - 备份
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTimeOriginal(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * Parse the time to string - 增强版，更好地处理ISO格式日期
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }

  try {
    const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
    let date
    if (typeof time === 'object') {
      date = time
    } else {
      if ((typeof time === 'string')) {
        if ((/^[0-9]+$/.test(time))) {
          // support "1548221490638"
          time = parseInt(time)
        }
        // 注意：不再替换 - 为 /，现代浏览器可以直接解析ISO格式
      }

      if ((typeof time === 'number') && (time.toString().length === 10)) {
        time = time * 1000
      }
      date = new Date(time)
      // 如果日期无效，返回空字符串
      if (isNaN(date.getTime())) {
        return 'invalid-date'
      }
    }

    const formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay()
    }
    const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
      const value = formatObj[key]
      // Note: getDay() returns 0 on Sunday
      if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
      return value.toString().padStart(2, '0')
    })
    return time_str
  } catch (e) {
    // 出错时尝试使用原始方法
    try {
      return parseTimeOriginal(time, cFormat) || '-'
    } catch (innerError) {
      return '-'
    }
  }
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

/**
 * 格式化数字，添加千位分隔符并保留指定小数位
 * @param {number|string} num - 要格式化的数字
 * @param {number} decimals - 小数位数，默认2位
 * @returns {string} 格式化后的数字字符串
 * @example
 * formatNumber(1234.567, 2) // "1,234.57"
 * formatNumber(1234567.89) // "1,234,567.89"
 */
export function formatNumber(num, decimals = 2) {
  if (num === null || num === undefined || num === '') {
    return '0.00'
  }

  const number = parseFloat(num)
  if (isNaN(number)) {
    return '0.00'
  }

  // 使用toFixed保留指定小数位
  const fixed = number.toFixed(decimals)

  // 添加千位分隔符
  const parts = fixed.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return parts.join('.')
}

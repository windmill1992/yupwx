//格式化时间格式
const formatTime = (date, div) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  if (div == '年') {
    let arr = [year, month, day].map(formatNumber)
    return arr[0] + '年' + arr[1] + '月' + arr[2] + '日 ' + [hour, minute].map(formatNumber).join(':')
  }
  return [year, month, day].map(formatNumber).join(div) + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//1,234,444.00格式
const numFmt = value => {
  let newValue = '';
  let count = 0;
  let v = value.toString().split('.');	//取小数部分
  let r = '';
  if (v[1]) {
    r = '.' + v[1].substr(0, 2);
  } else { }
  if (value > 999) {
    value = v[0];
    for (let i = value.length - 1; i >= 0; i--) {
      count++;
      if (count % 3 == 0 && i > 0) {
        newValue += value[i] + ',';
      } else {
        newValue += value[i];
      }
    }
    newValue = newValue.split('').reverse().join('') + r;
  } else {
    newValue = v[0] + r;
  }
  return newValue;
}

//时间戳取00:00格式时间
const getHm = ts => {
  let dd = new Date(ts);
  let hh = dd.getHours();
  let mm = dd.getMinutes();
  return [hh, mm].map(formatNumber).join(':');
}

//10000->1万
const setNumLess = num => {
  if (!num || num == null || num == '' || isNaN(num)) {
    return '0.0'
  }
  num = parseFloat(num).toFixed(8);
  num = num.toString();
  let temp = '';
  let v1 = num.split('.')[0];
  let v2 = num.split('.')[1];
  if (v1.length < 5) {
    let n = parseFloat(num).toFixed(2);
    n = n.substr(-1, 1) == 0 ? parseFloat(n).toFixed(1) : n;
    return n

  } else if (v1.length >= 5 && v1.length < 9) {
    for (let i = 0; i < v1.length - 4; i++) {
      temp += v1[i];
    }
    return parseFloat(temp + '.' + v1.substr(-4, 2)) + '万'

  } else if (v1.length >= 9 && v1.length < 13) {
    for (let i = 0; i < v1.length - 8; i++) {
      temp += v1[i];
    }
    return parseFloat(temp + '.' + v1.substr(-8, 2)) + '亿'

  } else if (v1.length >= 13 && v1.length < 17) {
    for (let i = 0; i < v1.length - 12; i++) {
      temp += v1[i];
    }
    return parseFloat(temp + '.' + v1.substr(-12, 2)) + '万亿'
  } else {
    return parseFloat(parseFloat(num).toFixed(2))
  }
}

//大于1最多保留两位，小于1保留8位
const getNumFixed = (num, fixed) => {
  if (!num || num == null || num == '' || isNaN(num)) {
    return '0.0'
  }
  if (num >= 1 || num <= -1) {
    let f = fixed ? fixed : 2;
    num = parseFloat(num).toFixed(f);
    num = num.toString();
    let arr = num.split('.');
    if (!arr[1]) {
      return num
    } else {
      if (arr[1].length > f) {
        arr[1] = arr[1].substr(0, f);
      }
      return parseFloat(arr[0] + '.' + arr[1]);
    }
  } else {
    return parseFloat(parseFloat(num).toFixed(fixed ? fixed : 8));
  }
}

module.exports = {
  formatTime: formatTime,
  numFmt: numFmt,
  getHm: getHm,
  setNumLess: setNumLess,
  getNumFixed: getNumFixed
}

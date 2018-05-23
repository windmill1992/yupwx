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

const check = (k) => {
	let deadtime = parseInt(wx.getStorageSync(k));
	if (deadtime) {
		if (parseInt(deadtime) <= (Date.now() - 5000)) {
			return false;
		}
		return true;
	}
	return false;
}

module.exports = {
	formatTime: formatTime,
	check: check
}

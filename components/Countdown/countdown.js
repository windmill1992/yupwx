// components/Countdown/countdown.js
Component({
  properties: {
		time: Number,
		myClass: {
			type: String,
			value: ''
		}
  },
  data: {
		restTime: 0,
		state: 1
  },
	ready: function () {
		this._countDown();
	},
	detached: function () {
		clearInterval(this.data.timer);
	},
  methods: {
		_countDown: function () {
			const that = this;
			let time = this.data.time - Date.now();
			if (time <= 0) {
				this.setData({ restTime: 0, state: 2 });
				return;
			}
			this._getTime(time);
			let timer = setInterval(() => {
				time -= 60000;
				if (time <= 0) {
					clearInterval(that.data.timer);
					that.setData({ timer: null, restTime: 0, state: 2 });
				} else {
					that._getTime(time);
				}
			}, 60000);
			that.setData({ timer: timer });
		},
		_getTime: function (time) {
			let day = parseInt(time / 1000 / 60 / 60 / 24);
			let hh = parseInt(time / 1000 / 60 / 60 % 24);
			let mm = parseInt(time / 1000 / 60 % 60);
			let arr = [day, hh, mm].map(this._formatNum);
			let str = arr[0] + '天' + arr[1] + '时' + arr[2] + '分';
			this.setData({ restTime: str });
		},
		_formatNum: function (n) {
			if (n) {
				n = n.toString();
				return n[1] ? n : '0' + n;
			} else {
				return 0;
			}
		}
  }
})

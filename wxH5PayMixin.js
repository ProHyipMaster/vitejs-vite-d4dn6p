export default {
	data() {
		return {

		}
	},
	methods: {
		/**
		 * JSAPI 微信环境
		 * MWEB	h5
		 * APP	app
		 */
		mixinGetPayFrom() {
			const arr = ['JSAPI','MWEB','APP']
			let type = '' 
			// #ifdef H5
			if(this.isWeixin()){
				type = 'JSAPI'
			} else {
				type = 'MWEB'
			}
			// #endif
			
			// #ifdef APP-PLUS
				type = 'APP'
			// #endif
			return type
		},
		
		// 支付相关
		jsApiCall(callback) {
			var payParamter = this.payParamter;
			WeixinJSBridge.invoke('getBrandWCPayRequest', payParamter, res => {
				if (res.err_msg == 'get_brand_wcpay_request:ok') {
					callback && callback()
					return
					uni.showModal({
						title: '提示',
						cancelText: '取消',
						confirmText: '确定',
						content: '请确认支付是否完成？',
						success: res => {
							if (res.confirm) {
								this.checkStatus();
							}
						}
					});
				}
			});
		},

		addPayListener() {
			if (!this.isWeixin()) return
			if (typeof WeixinJSBridge == 'undefined') {
				if (document.addEventListener) {
					document.addEventListener('WeixinJSBridgeReady', this.jsApiCall, false);
				} else if (document.attachEvent) {
					document.attachEvent('WeixinJSBridgeReady', this.jsApiCall);
					document.attachEvent('onWeixinJSBridgeReady', this.jsApiCall);
				}
			}
			// else {
			// 	sessionStorage.setItem('order_id', '{$order.order_no}');
			// 	this.jsApiCall();
			// }
		},

		// 检查订单是否成功
		async checkStatus() {
			const res = await this.$apis.checkPayStatus({
				order_no: this.payParamter.order_no
			})
			if (res == 1) {
				uni.showToast({
					icon: 'success',
					title: '购买成功'
				});
			} else {
				uni.showToast({
					icon: 'none',
					title: '购买失败，请联系客服',
					duration: 2000
				});
			}
		},
	}
}

var mixin = {
	data: function() {
		return {}
	},
	created: function() {},
	methods: {
		
		/**
		 * @param {Object} data
		 */
		wechatAppPay(data, callback, payName){
			const obj = { MobilePayAlipay:'alipay', MobilePayWechat: 'wxpay'}
			uni.requestPayment({
				provider: obj[payName],
				orderInfo: data,
				success:(e) => {
					if(e.errMsg.indexOf('ok') >= 0) {
						callback && callback()
					} else if(e.errMsg.indexOf('fail') >= 0){
						this.simpleWarn('支付失败，请稍后重试')
					}
					// callback && callback()
					// console.log(e);
				},
				fail: (err) => {
					if(err.errMsg.includes('User canceled')){
						this.simpleWarn('您已取消支付')
					} else {
						this.simpleWarn('支付失败，请稍后重试')
					}
				}
			})
		},
		
		getDefaultAvatarBySex(sex = 0){
			const arr = [{sex: 0, name: '女', img: '/static/img/work_man/work_female.png'},
			{sex: 1, name: '男', img: '/static/img/work_man/work_male.png'}]
			return arr.filter(i => i.sex == sex)[0].img
		},
		
		isWeixin() {
			// #ifdef H5
		    var ua = navigator.userAgent.toLowerCase();
		    if(ua.indexOf("micromessenger") > -1){
				return true
			}
			return false
			// #endif
			
			// #ifdef APP-PLUS
			return false
			// #endif
		},
		
		mixGetDate({type, add = 3, minus = 0}) {
			const date = new Date();
			let year = date.getFullYear();
			let month = date.getMonth() + 1;
			let day = date.getDate();

			if (type === 'start') {
				year = year - minus;
			} else if (type === 'end') {
				year = year + add;
			}
			month = month > 9 ? month : '0' + month;;
			day = day > 9 ? day : '0' + day;
			return `${year}-${month}-${day}`;
		}, 
		
		/**
		 * @param { String } e
		 */
		copyContact(e) {
			let result = false
			// #ifdef APP-PLUS || MP-WEIXIN
			uni.setClipboardData({
				data: e,
				success() {
					result = true
					uni.showToast({
						title: '复制成功',
						icon: 'none'
					})
				},
				fail() {
					result = false
					uni.showToast({
						title: '复制失败，请稍后再试',
						icon: 'none'
					})
				}
			});
			// #endif

			// #ifdef H5
			result = this.h5Copy(e);
			uni.showToast({
				title: '复制成功',
				icon: 'none'
			})
			// #endif
			return result;
		},

		/**
		 * 接受一个数组，和object的key，将数组中key对应的值加到image上
		 * 方便组件使用数据
		 * @param {Array[Object]} arr 指定数组
		 * @param {String} 		  key 被映射值的key
		 */
		formatImgPath(arr, key = "image") {
			return arr.map(item => {
				item.image = this.$mConfig.baseUrl + '/upload/' + item[key]
				return item
			})
		},

		formatSingleImg(path) {
			return this.$mConfig.baseUrl + '/upload/' + path
		},

		/**
		 * 接受一个数组，和object的key，将数组中的key对应的值加到text上
		 * 方便组件使用数据
		 * @param {Array[Object]} arr 指定数组
		 * @param {String}        key 被映射值的key
		 */
		formatTextName(arr, key) {
			return arr.map(item => {
				item.text = item[key]
				return item
			})
		},

		/**
		 * 上传图片
		 */
		mixUploadImg() {
			return new Promise((resolve, reject) => {
				uni.chooseImage({
					sizeType: ['compressed'],
					success: chooseImageRes => {
						const tempFilePaths = chooseImageRes.tempFilePaths;
						const uploadTask = uni.uploadFile({
							url: this.$mConfig.uploadImg, //
							filePath: tempFilePaths[0],
							name: 'file',
							header: {
								'XX-Device-Type': 'mobile',
								'XX-Token': this.$store.state.token || ''
							},
							formData: {
							},
							success: res => {
								var data = JSON.parse(res.data)
								if (data.code == 1) {
									resolve({
										image: this.formatSingleImg(data.data.filepath),
										imageForServer: data.data.filepath
									})
								}
							}
						});

						// this.uploadPercent(uploadTask)
					},
					fail(e) {
						console.log(e);
					}
				});
			})
		},

		uploadPercent(task) {
			task.onProgressUpdate(res => {
				if (res.progress < 100) {
					uni.showToast({
						icon: 'loading',
						title: '进度' + JSON.stringify(res.progress)
					});
				} else {
					uni.hideToast()
				}
			});
		},
		
		mixUploadResume(){
			this.uploadCommonFn()
		},
		
		uploadCommonFn(){
			return new Promise((resolve, reject) => {
				uni.chooseFile({
					compressed: true,
					sourceType: ['album', 'camera'],
					success: chooseImageRes => {
						if(chooseImageRes.size > 1000000*10){
							uni.showToast({
								title: '文件过大',
								duration:1500,
								icon: 'none'
							})
							return
						}
						const tempFilePath = chooseImageRes.tempFilePath;
						uni.showToast({
							title: '视频上传中',
							icon: 'loading'
						});
					
						const uploadTask = uni.uploadFile({
							url: this.$mConfig.baseUrl + '/api.php/portal/Public/upload_img', //
							filePath: tempFilePath,
							name: 'file',
							header: {
								'XX-Device-Type': 'mobile',
								'XX-Token': this.$store.state.token || ''
							},
							formData: {
								file: 'file',
								// filetype: 'video'
							},
							success: res => {
								var data = JSON.parse(res.data)
								if (data.code == 1) {
									uni.hideLoading()
									resolve({
										image: this.formatSingleImg(data.data.filepath),
										imageForServer: data.data.filepath
									})
								}
							},
							fail: () => {
								uni.hideLoading()
							}
						});
					
						// this.uploadPercent(uploadTask)
					},
					fail: (e) => {
						reject(false)
						console.log('fail' + JSON.stringify(e));
					},
					complete: (e) => {
						console.log('complete' + JSON.stringify(e));
					}
				});
			})
		},
		
		/**
		 * 上传视频
		 */
		mixUploadVideo() {
			return new Promise((resolve, reject) => {
				uni.chooseVideo({
					compressed: true,
					sourceType: ['album', 'camera'],
					success: chooseImageRes => {
						if(chooseImageRes.size > 1000000*10){
							uni.showToast({
								title: '文件过大',
								duration:1500,
								icon: 'none'
							})
							return
						}
						const tempFilePath = chooseImageRes.tempFilePath;
						uni.showToast({
							title: '视频上传中',
							icon: 'loading'
						});
		
						const uploadTask = uni.uploadFile({
							url: this.$mConfig.baseUrl + '/api.php/portal/Public/upload_img', //
							filePath: tempFilePath,
							name: 'file',
							header: {
								'XX-Device-Type': 'mobile',
								'XX-Token': this.$store.state.token || ''
							},
							formData: {
								file: 'video',
								filetype: 'video'
							},
							success: res => {
								var data = JSON.parse(res.data)
								if (data.code == 1) {
									uni.hideLoading()
									resolve({
										image: this.formatSingleImg(data.data.filepath),
										imageForServer: data.data.filepath
									})
								}
							},
							fail: () => {
								uni.hideLoading()
							}
						});
		
						// this.uploadPercent(uploadTask)
					},
					fail: (e) => {
						reject(false)
						console.log('fail' + JSON.stringify(e));
					},
					complete: (e) => {
						console.log('complete' + JSON.stringify(e));
					}
				});
			})
		},

		/**
		 * @param {Object} obj 
		 * 
		 *  isLoad: 		true == 正在加载； false == 未在加载,，
		 *	reqBody: 		请求参数, 
		 * 	reqFunc:        请求方法
		 *  pageData {Object} pageData.page    分页参数 -- 当前页
		 *  pageData {Object} pageData.allPage 分页参数 -- 分页总数
		 */
		async loadMore({
			// isLoad,
			reqBody,
			reqFunc,
			pageData
		}) {
			return new Promise(async (resolve, reject) => {
				// 正在加载 或者 当前请求的页数大于总页数 且 已初始化过总页数 停止发送请求
				if (pageData.isLoad || (reqBody.page > pageData.allPage && pageData.allPage != -1)) {
					return false;
				}
				pageData.isLoad = true
				let res;
				if (reqFunc) {
					try{
						res = await reqFunc(reqBody)
					}catch(e){
						//TODO handle the exception
					}
				}
				if (res.code == 1) {
					pageData.isLoad = false
					reqBody.page += 1;
					let data = Array.isArray(res.data.data) ? res.data : res.data.list
					
					if (pageData.allPage == -1) {
						pageData.allPage = data.last_page
					}
					resolve(data) 
				} else {
					reject(res) 
				}
			})
			
		},
		
		/**
		 * 根据经纬度获取详细信息
		 * @param {Object} longitude
		 * @param {Object} latitude
		 */
		mixAnalysisLcoation({
			longitude,
			latitude
		}) {
			const baseUrl = 'https://restapi.amap.com/v3/geocode/regeo?'
			const key = 'key=8505420999b92bf544262e647df10c68'
			const location = `location=${longitude},${latitude}`
			const decodeUrl = `${baseUrl}${key}&${location}`
			return new Promise((resolve, reject) => {
				uni.request({
					method: "GET",
					url: decodeUrl,
					success: (e) => {
						if (e.data.status == 1) {
							resolve(e.data.regeocode)
							// this.formatLocationAndSave(e.data.regeocode)
						}
					},
					fail: (e) => {
						// uni.showModal({
						// content: '解析失败：' + JSON.stringify(e)
						// })
						console.dir(e);
					}
				})
			})
		},
		
		h5Copy(content) {
			if (!document.queryCommandSupported('copy')) {
				// 不支持
				return false
			}

			let textarea = document.createElement("textarea")
			textarea.value = content
			textarea.readOnly = "readOnly"
			document.body.appendChild(textarea)
			textarea.select() // 选择对象
			textarea.setSelectionRange(0, content.length) //核心
			let result = document.execCommand("copy") // 执行浏览器复制命令
			textarea.remove()
			return result

		},

		/**
		 * 发送请求时进行"防抖"，间隔一秒内的操作只执行最后一次。
		 * @param {Function} fn  	需要进行防抖的函数
		 * @param {Object} column   防抖函数所需的参数
		 * @param {Object} index    防抖函数所需的参数
		 */
		requestDebounce(fn, column, index) {
			if (this.clock) {
				clearTimeout(this.clock);
			}
			this.clock = setTimeout(() => {
				if (fn) {
					fn(column, index)
				}
				clearTimeout(this.clock);
			}, 1000);
		},
		
		/**
		 * @description 返回上一层
		 * 
		 */
		ysBack: function(){
			uni.navigateBack({
				
			})
		}
	}
}

export default mixin;

import Vue from 'vue'
import App from './App'
import store from './store'
import $AppEntryController from './AppEntryController.js'

import $apis from './apis/api.js'

import $mRouter from './common/router.js'
import $mUtils from './common/utils.js'
import $mConfig from "./config/index.config.js"
import $mAssetsPath from './config/assets.config.js'
import $mRoutesConfig from './config/routes.config.js'
import $mConstDataConfig from './config/constData.config.js'
import $modalHelper from './common/modalHelper.js'

import mPageView from "./components/m-page-view/m-page-view.vue"
import mPageHeader from './components/m-page-header/m-page-header'

Vue.component("joy-page", mPageView)
Vue.component("m-page-header", mPageHeader)

// 引入全局uView
import uView from 'uview-ui'
Vue.use(uView)

Vue.config.productionTip = false;

Vue.prototype.$AppEntryController = $AppEntryController;

Vue.prototype.$store = store;

Vue.prototype.$apis = $apis;

Vue.prototype.$mRouter = $mRouter;

Vue.prototype.$mUtils = $mUtils;

Vue.prototype.$mConfig = $mConfig;

Vue.prototype.$mAssetsPath = $mAssetsPath;

Vue.prototype.$mRoutesConfig = $mRoutesConfig;

Vue.prototype.$mConstDataConfig = $mConstDataConfig;

Vue.prototype.$modalHelper = $modalHelper;
Vue.prototype.$statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
Vue.prototype.$mainBg = '#346DF0';

var mixin = {
	methods: {
		toBackPage: function() {
			this.$mRouter.back(1)
		},
		simpleWarn(val) {
			uni.showToast({
				title: val,
				icon: 'none'
			});
		}
	}
}
Vue.mixin(mixin)

$mRouter.beforeEach((navType, to) => {
	// console.log(to.route.path)
	// console.log('before each');
	if (to.route === undefined) {
		throw ("路由钩子函数中没有找到to.route对象，路由信息:" + JSON.stringify(to));
	}
	
	if (to.route.path === $mRoutesConfig.login.path && store.getters.hasLogin) {
		uni.redirectTo({
			url: $mUtils.objParseUrlAndParam($mRoutesConfig.main.path, to.query)
		})
		return;
	}

	// 过滤需要权限的页面
	// if (to.route.requiresAuth) {
	if (false) {
		console.log('需要权限');
		// @TODO
		if (store.getters.hasLogin) {
			// 已经登录
			uni[navType]({
				url: $mUtils.objParseUrlAndParam(to.route.path, to.query)
			})
		} else {
			// 登录成功后的重定向地址和参数
			let query = {
				redirectUrl: to.route.path,
				...to.query
			}
			// 没有登录 是否强制登录?
			if (store.state.forcedLogin) {
				console.log('强制登录')
				uni.redirectTo({
					url: $mUtils.objParseUrlAndParam($mRoutesConfig.login.path, query)
				})
			} else {
				uni.navigateTo({
					url: $mUtils.objParseUrlAndParam($mRoutesConfig.login.path, query)
				})
			}
		}
	} else {
		// 已登录
		uni[navType]({
			url: $mUtils.objParseUrlAndParam(to.route.path, to.query)
		})
	}
})

Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份   
		"d+": this.getDate(), //日   
		"h+": this.getHours(), //小时   
		"m+": this.getMinutes(), //分   
		"s+": this.getSeconds(), //秒   
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度   
		"S": this.getMilliseconds() //毫秒   
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

Vue.filter('formatImg', (img) => {
	if (!img) return
	if (img.indexOf('http') >= 0 || img.indexOf('/static/img/') >= 0) {
		return img
	} else {
		return $mConfig.baseUrl + '/upload/' + img
	}
})

Vue.filter('getAge', (birth) => {
	let year = (new Date().getTime() / 1000 - birth) / 60 / 60 / 24 / 365
	return Math.round(year)
})

Vue.filter('formatDistance', (distance) => {
	const xxx = distance.toFixed(3).split('.')
	if (parseInt(xxx[0]) == 0) {
		return `${parseInt(xxx[1])}m`
	} else {
		return `${distance.toFixed(2)}km`
	}
})

Vue.filter('formatDate', (timestamp) => {
	if (timestamp.toString().length === 10) {
		return new Date(parseFloat(timestamp) * 1000).Format('yyyy-MM-dd')
	} else {
		return new Date(parseFloat(timestamp)).Format('yyyy-MM-dd')
	}
})

Vue.filter('formatDateTime', (timestamp) => {
	if (timestamp.toString().length === 10) {
		return new Date(parseFloat(timestamp) * 1000).Format('yyyy-MM-dd hh:mm:ss')
	} else {
		return new Date(parseFloat(timestamp)).Format('yyyy-MM-dd hh:mm:ss')
	}
})

Vue.filter('formatPhone', () => {
	var reg = /^(\d{3})\d*(\d{4})$/;
	return str1.replace(reg, '$1****$2')
})

App.mpType = 'app'

const app = new Vue({
	store,
	...App
})
app.$mount()

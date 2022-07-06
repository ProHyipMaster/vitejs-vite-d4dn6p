<script>
import remoteImg from 'config/assets.config.js';
var statusBarHeight = uni.getSystemInfoSync().statusBarHeight;
let osName = '';
// #ifdef APP-PLUS
osName = plus.os.name.toLowerCase() || '';
// #endif
let hasH5Login = false;
export default {
  globalData: {
    OSName: osName || '',
    mainRed: '#F23535',
    mainBlue: '#346DF0',
    mapKey: '8505420999b92bf544262e647df10c68',
    wxAppId: 'wx87a6497e123e7ab6',
    statusBarHeight,
    remoteImg,
    imei: '',
    oaid: '',
  },
  onLaunch: function (o) {
    this.getDeviceInfo();
    this.checkedHasWxH5Login();

    // #ifdef APP-PLUS
    // this.checkUpdate()
    // #endif

    // const result = uni.getStorageSync("need_display_welcome");
    // if (!result) {
    // 	this.$mRouter.redirectTo({
    // 		route: this.$mRoutesConfig.welcome
    // 	})
    // }
    // #ifdef H5
    this.saveInviteUidIfExist();
    // this.$AppEntryController.handleH5BrowserAddressBarAuth();
    // #endif
  },
  onShow: function (o) {
    // #ifdef APP-PLUS
    this.checkCopyValueToJob();
    // #endif

    this.checkedHasWxH5Login();
    // this.getJobList()
  },
  onHide: function () {},
  methods: {
    async checkedHasWxH5Login() {
      const res = await this.$apis.getOptionByFrom({
        from: 'ggh_login',
      });
      if (res.code == 1 && res.data == '1') {
        // #ifdef H5
        // 微信中且不是注册页和下载页 才进行登录
        const noWxLoginArr = ['login/reg', 'download/download'];
        const url = location.href;
        if (this.isWeixin() && !noWxLoginArr.some((i) => url.indexOf(i) >= 0)) {
          this.beforeWX();
        }
        // #endif
      }
    },

    saveInviteUidIfExist() {
      // #ifdef H5
      const searchObj = this.analysisLocationSearchAsObject();
      if (searchObj.invite_uid) {
        // 用户登录或注册时清除此storage
        uni.setStorageSync('invite_uid', searchObj.invite_uid);
      }
      // #endif
    },

    analysisLocationSearchAsObject() {
      var search = location.search.substr(1, location.search.length);
      var searchArr = search.split('&');
      var tempObj = {};
      searchArr.map((item) => {
        tempObj[item.split('=')[0]] = item.split('=')[1];
      });
      return tempObj;
    },

    /**
     * 已经保存了公众号登录code的 storage 则不再重复请求
     * 已经登录则停止请求获得code
     */
    beforeWX() {
      const value = uni.getStorageSync('temp_save_wxcode');
      const token = uni.getStorageSync('token_info');
      if (!value) {
        if (token) return;
        this.wx();
      }
    },

    wx() {
      let appid = this.globalData.wxAppId;
      let uri = encodeURIComponent(this.$mConfig.baseUrl); // 这里务必编码
      let scope = 'snsapi_userinfo'; // 获取用户信息
      window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appid}&redirect_uri=${uri}&response_type=code&scope=${scope}&state=h5wxlogin#wechat_redirect`;
    },

    /**
     * ids	imei || oaid
     * odid 	1  || ''
     */
    getDeviceInfo() {
      // #ifdef APP-PLUS
      //Android OAID获取方法介绍
      var Build = plus.android.importClass('android.os.Build');
      var androidosv = Build.VERSION.SDK_INT;
      if (androidosv >= 29) {
        plus.device.getOAID({
          success: (e) => {
            this.globalData.oaid = e.oaid;
          },
          fail: (e) => {
            this.globalData.oaid = '';
          },
        });
      } else {
        //Android IMEI获取方法介绍
        plus.device.getInfo({
          success: (e) => {
            this.globalData.imei = e.imei;
          },
          fail: (e) => {
            this.globalData.imei = '';
          },
        });
      }
      // #endif
    },

    downloadUpdate() {
      if (osName == 'anfroid') {
        var url = ''; // 下载文件地址
        var dtask = plus.downloader.createDownload(url, {}, (d, status) => {
          if (status == 200) {
            // 下载成功
            var path = d.filename;
            this.askAndDoSomething(path);
          } else {
            //下载失败
            alert('Download failed: ' + status);
          }
        });
        dtask.start();
      } else {
        var url =
          'itms-apps://itunes.apple.com/cn/app/hello-h5+/id682211190?l=zh&mt=8'; // HelloH5应用在appstore的地址
        plus.runtime.openURL(url);
      }
    },

    askAndDoSomething(path) {
      uni.showModal({
        content: '下载完成， 是否立即安装？',
        success: (res) => {
          if (res.confirm) {
            plus.runtime.install(path);
          }
        },
      });
    },

    isWeixin() {
      var ua = navigator.userAgent.toLowerCase();
      if (ua.indexOf('micromessenger') > -1) {
        return true;
      }
      return false;
    },

    /**
     * 查看粘贴板内容
     * 符合条件则跳转详情页
     */
    checkCopyValueToJob() {
      let obj = {};

      uni.getClipboardData({
        success: (res) => {
          res.data.split('&').map((item) => {
            let aKVArr = item.split('=');
            obj[aKVArr[0]] = aKVArr[1];
          });
          // uni.showModal({
          // 	content: JSON.stringify(obj)
          // })
          if (obj.f == 'link' && obj.s == 'daizhao') {
            uni.showModal({
              title: '提示',
              content: '检测到岗位，是否前往查看？',
              success: (res) => {
                if (res.confirm) {
                  this.$mRouter.push({
                    route: this.$mRoutesConfig.jobDetailParttime,
                    query: {
                      id: obj.jid,
                      agentid: obj.i,
                    },
                  });
                }
              },
            });
          }
        },
      });
    },

    getJobList() {
      let b = [];
      let a = {
        tag: '网络推广人员',
        name: '渠道销售管培生',
        location: '青岛·即墨·青岛市南区山东路9号',
        isHurry: true,
        isTop: true,
        isShare: true,
        isAgent: false,
        personMax: 10,
        personAllready: 6,
        money: 140,
        summary: '日',
        startTime: 1590131938283,
        endTime: 1590133938283,
      };
      for (var i = 0; i < 6; i++) {
        b.push(a);
      }
      this.jobArr = b;
      console.log(this);
    },

    checkUpdate() {
      var checkUrl = 'http://192.168.40.55:8080/OPT_M/userAdmin/getVersion';
      plus.nativeUI.showWaiting('检测更新...');
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        switch (xhr.readyState) {
          case 4:
            plus.nativeUI.closeWaiting();
            if (xhr.status == 200) {
              console.log('检测更新成功,获取到的版本号为:' + xhr.responseText);
              var newVer = xhr.responseText;
              if (wgtVer && newVer && wgtVer != newVer) {
                console.log('获取资源文件路径');
                getdownPath();
              } else {
                plus.nativeUI.alert('无新版本可更新！');
              }
            } else {
              console.log('检测更新失败！');
              plus.nativeUI.alert('检测更新失败！');
            }
            break;
          default:
            break;
        }
      };
      xhr.timeout = 5000; //超过5秒连接不上则断掉
      xhr.open('POST', checkUrl);
      xhr.send();
    },

    getdownPath() {
      //获取资源文件路径,其实就是将wgt文件放在tomcat的download文件夹下面,将这个绝对路径返回给前端,这样让前端直接进行下载,就ok了.
      var new_version = '';
      var wgtUrlPath = 'http://192.168.40.55:8080/OPT_M/userAdmin/downloadPath';

      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        switch (xhr.readyState) {
          case 4:
            //plus.nativeUI.closeWaiting();
            if (xhr.status == 200) {
              console.log('获取下载路径成功');
              new_version = xhr.responseText;
              downWgt(new_version); // 下载升级包
            } else {
              console.log('下载失败！');
              plus.nativeUI.alert('下载失败！');
            }
            break;
          default:
            break;
        }
      };
      xhr.open('GET', wgtUrlPath);
      xhr.send();
    },

    // 下载wgt文件
    downWgt(newVersion) {
      // 弹出对话框,询问是否更新最新版本,2018年10月22日11:21:25
      plus.nativeUI.confirm(
        '应用有新版本，是否立即下载更新？',
        function (event) {
          if (event.index == 1) {
            plus.nativeUI.showWaiting('下载最新文件中,请稍候...');
            plus.downloader
              .createDownload(
                newVersion,
                {
                  filename: '_doc/update/',
                },
                function (d, status) {
                  if (status == 200) {
                    plus.nativeUI.closeWaiting();

                    console.log('下载wgt成功：' + d.filename);
                    //alert("下载成功,文件名为:"+d.filename);

                    installWgt(d.filename); // 安装wgt包
                  } else {
                    console.log('下载wgt失败！');
                    plus.nativeUI.alert('下载wgt失败！');
                  }
                }
              )
              .start();
          }
        },
        '提示',
        ['取消', '确认']
      );
    },

    // 更新应用资源
    installWgt(path) {
      plus.nativeUI.showWaiting('安装wgt文件...');

      plus.runtime.install(
        path,
        {
          force: true,
        },
        function () {
          plus.nativeUI.closeWaiting();

          console.log('安装wgt文件成功！');

          plus.nativeUI.alert('应用资源更新完成！', function () {
            plus.runtime.restart();
          });
        },
        function (e) {
          plus.nativeUI.closeWaiting();

          console.log('安装wgt文件失败[' + e.code + ']：' + e.message);

          plus.nativeUI.alert('安装wgt文件失败[' + e.code + ']：' + e.message);
        }
      );
    },
  },
};
</script>

<style lang="scss">
@import 'uview-ui/index.scss';
/* #ifndef APP-PLUS-NVUE */
// @import 'colorui/main.css';
// @import 'colorui/icon.css';
@import '/pages/PParttimeJob/common/partTime.css';

.common-shadow {
  box-shadow: 0px 4rpx 21rpx 9rpx rgba(153, 153, 153, 0.14);
}

.text-bold {
  font-weight: bold;
}

.text-center {
  text-align: center;
}

/*每个页面公共css */
body,
page {
  min-height: 100%;
  // display: flex;
  font-size: 32upx;
  font-family: -apple-system, Helvetica, sans-serif;
}

body.modal-open {
  position: fixed;
  width: 100%;
}

image {
  vertical-align: middle;
}

/* #ifdef MP-BAIDU */
page {
  width: 100%;
  height: 100%;
  display: block;
}

swan-template {
  width: 100%;
  min-height: 100%;
  display: flex;
}

/* #endif */

.text-white {
  color: #fff;
}

.font-size-20 {
  font-size: 20rpx;
}

.font-size-22 {
  font-size: 22rpx;
}

.font-size-24 {
  font-size: 24rpx;
}

.font-size-26 {
  font-size: 26rpx;
}

.font-size-28 {
  font-size: 28rpx;
}

.font-size-30 {
  font-size: 30rpx;
}

.grey-six {
  color: #666;
}

.color-price-light-red {
  color: #ff6b6b;
}

.bg-price-light-red {
  background: #ff6b6b;
}

.border-radius-20rpx {
  border-radius: 20rpx;
}

.border-radius-10rpx {
  border-radius: 10rpx;
}

.pad-10 {
  padding: 10upx;
}

.mt-10 {
  margin-top: 10upx;
}

.round {
  border-radius: 2500rpx;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-row {
  display: flex;
  flex-direction: row;
  position: relative;
  align-items: center;
}

.input-row .title {
  width: 25%;
  padding: 20upx 0;
  padding-left: 20upx;
  line-height: 50upx;
}

.border-1px {
  position: relative;

  &::before {
    position: absolute;
    z-index: 1;
    right: 0;
    top: 0;
    left: 0upx;
    height: 1upx;
    content: '';
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    background-color: #e2e2e2;
  }

  &::after {
    position: absolute;
    z-index: 1;
    right: 0;
    bottom: 0;
    left: 0upx;
    height: 1upx;
    content: '';
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    background-color: #e2e2e2;
  }
}

.border-bottom-1px {
  position: relative;

  &::after {
    position: absolute;
    z-index: 1;
    right: 0;
    left: 0px;
    bottom: 0;
    height: 1upx;
    content: '';
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    background-color: #e2e2e2;
  }
}

.border-top-1px {
  position: relative;

  &::before {
    content: '';
    position: absolute;
    z-index: 1;
    right: 0;
    left: 0px;
    top: 0;
    height: 1upx;
    -webkit-transform: scaleY(0.5);
    transform: scaleY(0.5);
    background-color: #e2e2e2;
  }
}

.btn-row {
  margin-top: 50upx;
  padding: 20upx;
}

button.primary {
  background-color: #0faeff;
}

.one-pixel-border-right {
  position: relative;
}

.one-pixel-border-right::after {
  content: '';
  width: 1px;
  height: 100%;
  background: #e6e6e6;
  position: absolute;
  right: 0px;
  top: 50%;
  // transform: translateY(-50%);
  transform: translateY(-50%) scaleX(0.5);
}

// flex布局
.flex,
.flex-wrap {
  display: flex;
}

.flex-wrap {
  display: flex;
  flex-wrap: wrap;
}

.flex-jcsb {
  display: flex;
  justify-content: space-between;
}

.flex-aic {
  display: flex;
  align-items: center;
}

.flex-column-aic {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flex-column-aic-jcc {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.flex-column-jcsb {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.flex-aic-jcsa {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.flex-aic-jcsa-wrap {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
}

.flex-aic-jcsb-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.flex-aic-jcc {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-aic-jcsb {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-aic-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.flex-column-aic-jcsb {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

// ys-row
.ys-row {
  padding: 26rpx 30rpx;
  align-items: center;
  display: flex;

  &:not(:last-child) {
    border-bottom: 1rpx solid #f5f5f5;
  }

  &.break-line {
    display: block;
  }

  &.has-angle {
    position: relative;
    padding-right: 3em;

    &::after {
      font-family: cuIcon;
      display: block;
      content: '\e6a3';
      position: absolute;
      font-size: 16px;
      color: #8799a3;
      width: 30px;
      text-align: center;
      top: 50%;
      transform: translateY(-50%);
      right: 10px;
      margin: auto;
    }
  }

  input {
    font-size: 30rpx;
    color: #8c8c8c;
  }

  .row-left {
    min-width: 5em;
    margin-right: 70rpx;
  }

  .row-right {
    display: flex;
    flex: 1;

    picker {
      width: 100%;
    }

    image.avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-left: 30rpx;
    }

    .upload-img {
      font-size: 22rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 120rpx;
      height: 120rpx;
      border-radius: 5rpx;
    }
  }
}

.bg-white {
  background-color: #fff;
}

.iconfont {
  // width: .8em;
  // height: .8em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

// @font-face {
// 	font-family: "yakuhei";
// 	src:
// 		url('~@/static/fonts/HYYakuHei-75W.woff') format('woff'),
// 		url('~@/static/fonts/HYYakuHei-75W.svg') format('svg'),
// 		url('~@/static/fonts/HYYakuHei-75W.eot') format('eot'),
// 		url('~@/static/fonts/HYYakuHei-75W.ttf') format('truetype'),
// }

// @font-face {
// 	font-family: "pingfang";
// 	src:
// 		url('~@/static/fonts/PingFang-Medium.ttf') format('truetype'),
// }

// .yakuhei {
// 	font-family: "yakuhei" !important;
// 	font-size: 16px;
// 	font-style: normal;
// 	-webkit-font-smoothing: antialiased;
// 	-moz-osx-font-smoothing: grayscale;
// }

/* #endif*/

.loadmore-status {
  padding: 20rpx 0;
}
</style>

<!-- #ifdef MP-WEIXIN -->
<style lang="scss">
switch.green[checked] .wx-switch-input,
switch[checked] .wx-switch-input,
switch.green.checked .uni-switch-input,
switch.checked .uni-switch-input {
  background-color: $main-red !important;
  border-color: $main-red !important;
  color: #ffffff !important;
  border-color: $main-red !important;
}
</style>
<!-- #endif -->

import User from './model/user'
import $ from './utils/tool'

App({
  initUiGlobal() {
    return new Promise(resolve => {
      wx.getSystemInfo({
        success: e => {
          this.globalData.StatusBar = e.statusBarHeight
          this.globalData.screenHeight = e.screenHeight
          const capsule = wx.getMenuButtonBoundingClientRect()
          if (capsule) {
            this.globalData.Custom = capsule
            this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight
          } else {
            this.globalData.CustomBar = e.statusBarHeight + 50
          }
        },
        complete: resolve
      })
    })
  },
  initEnv() {
    wx.cloud.init({traceUser: true })
  },
  async login() {
    $.loading()
    const user = new User()   // 创建新的用户实例
    const { data: info } = await user.getInfo()   // 获取用户信息
    if (info.length === 0) {   // 第一次进入小程序的新用户
      await user.register()    // 在数据库表中加入一条数据
      $.store.set('encryption', '')
    } else {   // 注册过的用户， 调用数据库的数据
      $.store.set('encryption', info[0].encryption)
    }
    $.hideLoading()
  },
  async onLaunch() {
    this.initEnv()
    await this.initUiGlobal()
    this.login()
  },
  globalData: {
    StatusBar: null,
    Custom: null,
    CustomBar: null,
    screenHeight: null,
    env: 'keshe-0ga41i6vf89ef69d'
  },
  store: {
    encryption: ''
  }
})

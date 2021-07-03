import $ from './../../utils/tool'
import router from './../../utils/router'
import User from './../../model/user'
import Password from './../../model/password'
import log from './../../utils/log'

Page({
  data: {

  },
  onLoad() {

  },
  clearAccount() {
    wx.showModal({
      title: '提示',
      content: '注意：清空后无法恢复!',
      confirmText: '仍要清空',
      confirmColor: '#e64340',
      async success(res) {
        if (res.confirm) {
          const userModel = new User()
          const passwordModel = new Password()
          try {
            if (await userModel.clear() && await passwordModel.clear()) {
              wx.setStorageSync('pwd', '')
              $.store.set('encryption', '')
              $.tip('清空成功!')
            } else {
              throw new Error('清空调用云函数出现异常')
            }
          } catch (error) {
            log.error({ msg: error.message })
            $.tip('清空失败, 请重试!')
          }
        } else if (res.cancel) {
          $.tip('取消清空')
        }
      }
    })
  }
})

import Base from './base'
import $ from './../utils/tool'
const collectionName = 'user'    // 数据库表名

export default class extends Base {
  constructor() {
    super(collectionName)
  }

  register() {
    return this.db.add({
      data: {
        createTime: this.date,
        encryption: ''
      }
    })
  }

  getInfo() {
    return this.db.where({ _openid: '{openid}' }).limit(1).get()
  }

  async updateEncryption(encryption, pwd) {
    $.loading()
    const { result: { code = -1 } } = await $.callCloud({
      name: 'updateEncryption',
      data: { encryption }
    }, false)
    $.hideLoading()
    if (code !== -1) {
      $.store.set('encryption', encryption)  // 设置app实例的store变量为加密后的主密码
      wx.setStorageSync('pwd', pwd)  // 本地缓存主密码，下次打开就不需要再次登录了
      return true
    } else {
      $.tip('设置失败')
    }
    return false
  }

  async clear() {
    const { result: { code } } = await $.callCloud({ name: 'clearUser' })
    if (code === 0) {
      return true
    }
    return false
  }
}

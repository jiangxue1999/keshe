import $ from './../../utils/tool'
import PasswordDb from './../../model/password'
import router from './../../utils/router'
const passwordArray = ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz', '1234567890', '!@#$%&*(),./;[]']
Page({
  data: {
    userKey: '用户名',   // 用户名
    userTitleFocus: false,
    pwdSetting: false,   // 是否要自动生成
    moreOptionsShow: false,
    validatePwdShow: false,
    saveLoading: false,
    pwdArray: [0, 1, 2], // 生成密码时候的源Index
    passwordLen: 12,
    pwdItems: [
      { value: '大写', checked: true, arrIndex: 0 },
      { value: '小写', checked: true, arrIndex: 1 },
      { value: '数字', checked: true, arrIndex: 2 },
      { value: '特殊符号', checked: false, arrIndex: 3 }
    ],
    moreOptions: false,
    viewHeight: $.app.globalData.screenHeight - $.app.globalData.CustomBar,
    title: '',   // 标题
    account: '',
    password: '',
    platform: '',
    phone: '',
    mail: '',
    desc: '',
    update: false,
    _id: ''
  },
  onLoad(options) {
    const { update = false } = options
    if (update) {
      $.loading()
      const that = this
      const eventChannel = this.getOpenerEventChannel()
      eventChannel.on('postDetailData', function({ data }) {
        that.setData({ moreOptionsShow: true, moreOptions: true, update: true })
        Object.keys(data).forEach(key => {
          that.setData({
            [key]: key === 'password' ? '' : data[key]
          })
        })
        $.hideLoading()
      })
    }
  },
  validateSuccess(e) {
    const { detail: { password } } = e
    this.onSave({}, true, password) // 手动验证主密码，且验证通过
  },
  async onSave(e, passValidate = false, mainPassword = '') {   // 保存密码
    if (this.validate() || passValidate) {
      this.setData({ saveLoading: true })
      const { data: { title, account, password: pwd, platform, phone, mail, desc, userKey, _id: localId, update } } = this
      let mainKey = mainPassword
      if (mainPassword === '') {
        mainKey = wx.getStorageSync('pwd')
      }
      const password = $.encrypt(pwd, mainKey)
      const obj = { title, account, password, platform, phone, mail, desc, userKey }
      const passwordModel = new PasswordDb()
      if (update) {
        const { result: { code = -1 } } = await passwordModel.update({
          ...obj,
          _id: localId
        })
        if (code === 0) {
          await $.tip('修改成功', 1000)
          router.reLaunch()   // 重新加载到首页
        } else {
          $.tip('内容无变更或修改失败', 1000)
        }
      } else {
        const { _id = '' } = await passwordModel.add(obj)
        if (_id !== '') {
          await $.tip('保存成功', 1000)
          router.pop()   // 回到上页
        } else {
          $.tip('保存失败, 请重试', 1000)
        }
      }
      this.setData({ saveLoading: false })
    }
  },
  onCreatePwd() {
    const { data: { passwordLen, pwdArray } } = this
    if (pwdArray.length === 0) { return $.tip('生成规则最少有一项') }
    let str = ''
    const originPwds = (pwdArray.map(index => {
      return passwordArray[index]
    })).join('')    // 先取pwdArray中下标对应的密码分区，如大写字母、小写字母、数字等,结果为一维数组
    const sumLen = originPwds.length
    for (let i = 0; i < passwordLen; i++) { // 随机生成要求长度的密码
      const index = Math.floor(Math.random() * sumLen)  
      str = str + originPwds[index]
    }
    this.setData({ password: str })
    const inputComponent = this.selectComponent('#password')
    inputComponent.onInput({ detail: { value: str } })
    wx.setClipboardData({ data: str })   // 粘贴到剪贴板
  },
  onUserTitleBlur(e) {
    const { detail: { value } } = e
    if (value === '') { this.setData({ userKey: '用户名' }) }
  },
  onInputChange(e) {
    const { detail: { value, tag } } = e
    this.setData({ [tag]: value })
  },
  onUpdateUserTitle() {
    this.setData({ userTitleFocus: true })
  },
  onPwdSetting() {
    const { data: { pwdSetting } } = this
    this.setData({ pwdSetting: !pwdSetting })
  },
  onDataSet(e) {
    const { currentTarget: { dataset: { tag } } } = e
    const { detail: { value } } = e
    this.setData({ [tag]: value })
  },
  validate() {
    const { data: { title, account, password, phone, mail } } = this
    if (title === '') {
      $.tip('描述不能为空')
      return false
    }
    if (account === '') {
      $.tip('用户名不能为空')
      return false
    }
    if (password === '') {
      $.tip('密码不能为空')
      return false
    }
    const localPwd = wx.getStorageSync('pwd')
    const encryption = $.store.get('encryption')
    if ($.digest(localPwd) !== encryption) {
      this.setData({ validatePwdShow: true })
      return false
    }
    return true
  }
})

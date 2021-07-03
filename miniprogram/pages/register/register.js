import $ from './../../utils/tool'
import User from './../../model/user'
import router from './../../utils/router'
import { fingerCheck } from './../../utils/util'

Page({
  data: {
    pwd: '',
    pwd2: '',
    checked: false
  },
  onLoad() {
  },
  onChange(e) {   // 勾选复选框
    const { detail: { value: arr } } = e
    this.setData({ checked: arr.length !== 0 })
  },
  onPwdChange(e) {
    const { detail: { value: pwd } } = e
    this.setData({ pwd })
  },
  onPwd2Change(e) {
    const { detail: { value: pwd2 } } = e
    this.setData({ pwd2 })
  },
  async update(pwd) {
    const encryption = $.digest(pwd)
    const user = new User()
    const check = await user.updateEncryption(encryption, pwd)
    if (check) {
      await $.tip('设置成功', 1000)
      router.redirectTo('addAccount')
    }
  },
  async onSubmit() {
    const { data: { pwd, pwd2, checked } } = this
    if (pwd.length < 4 || pwd2.length < 4) { return $.tip('PIN码长度不能小于4') }
    if (pwd !== pwd2) { return $.tip('两次PIN码不一致') }
    if (!checked) { return $.tip('请勾选已了解') }
    if (/[\u4e00-\u9fa5]/.test(pwd)) { return $.tip('PIN码不能含有中文') }
    fingerCheck(pwd)
      .then(() => {
        this.update(pwd)
      }).catch(e => {
        const envVersion = __wxConfig.envVersion
        if (envVersion === 'develop') { 
          this.update(pwd) 
        } else {
          $.tip('不支持生物验证')
        }
      })
  }
})
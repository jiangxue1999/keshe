import router from './../../utils/router'
import $ from './../../utils/tool'

import { throttle } from './../../utils/util'
Page({
  data: {
    keywords: ''   // 搜索的关键字
  },
  onLoad() {
  },
  onInput(e) {
    const { detail: { value } } = e
    this.setData({ keywords: value })
  },
  onSearch: throttle(function() {
    const { data: { keywords } } = this
    if (keywords !== '') {
      router.push('listSearch', {}, res => {
        res.eventChannel.emit('postKeywords', { keywords })
      })
    }
  }),
  addAccount() {
    const encryption = $.store.get('encryption')
    if (encryption === '') {   // 新用户
      router.push('register')
    } else {
      router.push('addAccount')
    }
  },
  routerList() {
    router.push('list')
  },
  routerMine() {
    router.push('mine')
  }
})

// components/color-card/color-card.js
Component({
  properties: {
    hex: { type: String, value: '' },
    name: { type: String, value: '' },
    tag: { type: String, value: '' },
    tagColor: { type: String, value: '#E8B4B8' }
  },

  methods: {
    onCopy() {
      wx.setClipboardData({
        data: this.properties.hex,
        success: () => {
          wx.showToast({ title: `已复制 ${this.properties.hex}`, icon: 'success' })
        }
      })
      this.triggerEvent('copy', { hex: this.properties.hex })
    }
  }
})
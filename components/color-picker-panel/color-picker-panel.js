// components/color-picker-panel/color-picker-panel.js
Component({
  properties: {
    // 当前选中的颜色
    currentColor: {
      type: String,
      value: '#F18F43'
    },
    // 是否显示面板
    show: {
      type: Boolean,
      value: false
    },
    // 快捷颜色列表
    quickColors: {
      type: Array,
      value: ['#F18F43', '#94B276', '#D5DD5E', '#C9B8E8', '#E8B4B8', '#9B8EA8', '#F0CECE', '#B8D4C8', '#2C2C2C']
    }
  },

  data: {
    hexInputValue: '',
    hexInputError: '',
    colorPalette: {
      warm: ['#FF6B6B', '#FF8E72', '#FFA07A', '#FFB347', '#FFCC5C', '#F18F43', '#E8B4B8', '#F0CECE'],
      cool: ['#4ECDC4', '#45B7D1', '#96CEB4', '#94B276', '#88D8B0', '#7FDBDA', '#B8D4C8', '#A8D8EA'],
      soft: ['#C9B8E8', '#D5DD5E', '#E8D5B7', '#F5E6D3', '#F9F0E0', '#D4C4A8', '#9B8EA8', '#B8AABF'],
      neutral: ['#2C2C2C', '#4A4A4A', '#6B6B6B', '#8B8B8B', '#AAAAAA', '#CCCCCC', '#E8E0D8', '#F9F5F0'],
      vibrant: ['#FF4757', '#2F86A6', '#FFDD59', '#7BED9F', '#70A1FF', '#5352ED', '#D63384', '#E056FD']
    }
  },

  observers: {
    'currentColor': function(color) {
      // 同步 HEX 输入框的值
      this.setData({ hexInputValue: color, hexInputError: '' })
    }
  },

  methods: {
    // HEX 输入处理
    onHexInput(e) {
      const value = e.detail.value.toUpperCase()
      this.setData({ hexInputValue: value })

      // 验证 HEX 格式
      if (value.length === 7 && /^#[0-9A-F]{6}$/.test(value)) {
        this.setData({ hexInputError: '' })
        this.triggerEvent('colorchange', { color: value })
      } else if (value.length > 0 && !/^#[0-9A-F]*$/.test(value)) {
        this.setData({ hexInputError: '格式错误，请输入 #RRGGBB' })
      } else {
        this.setData({ hexInputError: '' })
      }
    },

    // 颜色选择器变化
    onColorPickerChange(e) {
      const color = e.detail.value.toUpperCase()
      this.setData({ hexInputValue: color, hexInputError: '' })
      this.triggerEvent('colorchange', { color })
    },

    // 选择预设颜色
    onPaletteColorSelect(e) {
      const { color } = e.currentTarget.dataset
      this.setData({ hexInputValue: color, hexInputError: '' })
      this.triggerEvent('colorchange', { color })
    },

    // 选择快捷颜色
    onQuickColorSelect(e) {
      const { color } = e.currentTarget.dataset
      this.setData({ hexInputValue: color, hexInputError: '' })
      this.triggerEvent('colorchange', { color })
    },

    // 关闭面板
    onClose() {
      this.triggerEvent('close', { color: this.data.hexInputValue })
    },

    // 确认选择
    onConfirm() {
      const color = this.data.hexInputValue
      if (/^#[0-9A-F]{6}$/.test(color)) {
        this.triggerEvent('confirm', { color })
      } else {
        this.setData({ hexInputError: '请输入有效的颜色值' })
      }
    },

    // 阻止冒泡
    stopPropagation() {}
  }
})
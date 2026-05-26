// components/emotion-tag/emotion-tag.js
Component({
  properties: {
    name: { type: String, value: '' },
    nameEn: { type: String, value: '' },
    icon: { type: String, value: '' },
    color: { type: String, value: '#E8B4B8' },
    bgColor: { type: String, value: 'rgba(232,180,184,.15)' },
    desc: { type: String, value: '' },
    selected: { type: Boolean, value: false }
  },

  methods: {
    onTap() {
      this.triggerEvent('select', { id: this.properties.id })
    }
  }
})
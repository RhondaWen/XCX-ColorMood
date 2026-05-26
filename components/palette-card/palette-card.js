// components/palette-card/palette-card.js
Component({
  properties: {
    palette: {
      type: Object,
      value: {}
    },
    colors: {
      type: Array,
      value: []
    },
    name: {
      type: String,
      value: ''
    },
    likeCount: {
      type: Number,
      value: 0
    },
    emotionTag: {
      type: String,
      value: ''
    },
    emotionColor: {
      type: String,
      value: '#E8B4B8'
    },
    favorite: {
      type: Boolean,
      value: false
    }
  },

  methods: {
    onTap() {
      this.triggerEvent('tap', { id: this.properties.palette.id })
    },

    onFavorite(e) {
      e.stopPropagation()
      this.triggerEvent('favorite', { id: this.properties.palette.id })
    }
  }
})
# 成员C · 任务详解

## 负责模块概览

| 模块 | 具体功能 | 加分项覆盖 |
|------|----------|------------|
| 情绪色历 | 每日情绪打卡、打卡历史查询 | 基本要求③ |
| Canvas模块 | 情绪色历热力图、配色预览画板 | ⑧ 画布API |
| 颜色命名API | 调用The Color API获取颜色名称 | ⑤ 调用网络API |

## 核心页面清单

| 页面 | 文件路径 | 功能说明 |
|------|----------|----------|
| 我的页 | pages/mine/mine | 个人中心、情绪色历入口 |
| 色历页 | pages/calendar/calendar | Canvas日历热力图 |
| 画板页 | pages/canvas/canvas | 配色预览画板 |
| 色板详情页（辅助） | pages/detail/detail | 展示颜色名称（API调用） |

---

## Phase 1：情绪打卡模块（第2周）

### 任务1.1：每日情绪打卡

**功能文件**：`pages/calendar/calendar.js`

**打卡交互**：
```javascript
// 选择今日情绪色进行打卡
onCheckin() {
  if (this.data.hasCheckedToday) {
    wx.showToast({ title: '今日已打卡', icon: 'none' });
    return;
  }

  wx.showModal({
    title: '情绪打卡',
    content: '确定选择这个颜色作为今日情绪色吗？',
    success: (res) => {
      if (res.confirm) {
        this.submitCheckin();
      }
    }
  });
}

submitCheckin() {
  wx.request({
    url: API_BASE + '/api/mood/checkin',
    method: 'POST',
    header: { 'Authorization': 'Bearer ' + wx.getStorageSync('userToken') },
    data: {
      date: this.formatDate(new Date()),  // YYYY-MM-DD
      emotionId: this.data.selectedEmotion.id,
      colorHex: this.data.selectedColor,
      note: this.data.note  // 可选备注
    },
    success: (res) => {
      wx.showToast({ title: '打卡成功' });
      this.setData({ hasCheckedToday: true });
      this.refreshCalendar();  // 更新热力图
    }
  });
}
```

**打卡历史查询**：
```javascript
// GET /api/mood/history?month=YYYY-MM
fetchMonthHistory(month) {
  wx.request({
    url: API_BASE + `/api/mood/history?month=${month}`,
    header: { 'Authorization': 'Bearer ' + wx.getStorageSync('userToken') },
    success: (res) => {
      // 响应：[{ date, emotionId, colorHex, note }, ...]
      this.setData({ checkinHistory: res.data });
      this.drawCalendarHeatmap();  // 绘制热力图
    }
  });
}
```

---

## Phase 2：Canvas情绪色历热力图（第2-3周）

### 任务2.1：Canvas日历热力图

**页面文件**：`pages/calendar/calendar.wxml/wxss/js/json`

**Canvas声明**：
```xml
<!-- calendar.wxml -->
<view class="calendar-container">
  <view class="month-header">
    <text class="month-title">{{currentMonth}}</text>
    <view class="month-nav">
      <button bindtap="prevMonth">◀</button>
      <button bindtap="nextMonth">▶</button>
    </view>
  </view>
  <canvas type="2d" id="heatmapCanvas" class="heatmap-canvas"
          width="{{canvasWidth}}" height="{{canvasHeight}}"></canvas>
</view>
```

**Canvas 2D API 绘制**：
```javascript
// 【加分项⑧】画布API - 情绪色历热力图
drawCalendarHeatmap() {
  const query = wx.createSelectorQuery();
  query.select('#heatmapCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');

      // 设置canvas尺寸
      canvas.width = res[0].width * dpr;
      canvas.height = res[0].height * dpr;
      ctx.scale(dpr, dpr);

      // 绘制日历格子
      const days = this.getDaysInMonth(this.data.currentYear, this.data.currentMonth);
      const history = this.data.checkinHistory;

      for (let i = 0; i < days; i++) {
        const dateStr = `${this.data.currentYear}-${this.data.currentMonth}-${i + 1}`;
        const checkin = history.find(h => h.date === dateStr);

        // 计算格子位置
        const row = Math.floor(i / 7);
        const col = i % 7;
        const x = col * CELL_WIDTH + PADDING;
        const y = row * CELL_HEIGHT + PADDING;

        // 绘制格子
        if (checkin) {
          // 已打卡：使用情绪色填充
          ctx.fillStyle = checkin.colorHex;
        } else {
          // 未打卡：淡灰色
          ctx.fillStyle = '#E5E5E5';
        }

        ctx.beginPath();
        ctx.roundRect(x, y, CELL_WIDTH - 2, CELL_HEIGHT - 2, 4);
        ctx.fill();

        // 绘制日期数字
        ctx.fillStyle = checkin ? '#FFFFFF' : '#999999';
        ctx.font = '12px sans-serif';
        ctx.fillText((i + 1).toString(), x + 8, y + 14);
      }
    });
}
```

**点击格子查看详情**：
```javascript
onCanvasTap(e) {
  // 计算点击位置对应的日期
  const { x, y } = e.detail;
  const col = Math.floor((x - PADDING) / CELL_WIDTH);
  const row = Math.floor((y - PADDING) / CELL_HEIGHT);
  const day = row * 7 + col + 1;

  if (day > this.getDaysInMonth()) return;

  const dateStr = `${this.data.currentYear}-${this.data.currentMonth}-${day}`;
  const checkin = this.data.checkinHistory.find(h => h.date === dateStr);

  if (checkin) {
    wx.showModal({
      title: `${dateStr} 情绪打卡`,
      content: `情绪色：${checkin.colorHex}\n备注：${checkin.note || '无'}`,
      showCancel: false
    });
  } else {
    wx.showToast({ title: '当日未打卡', icon: 'none' });
  }
}
```

**月份切换动画**：
```javascript
// 【加分项⑧】使用 requestAnimationFrame 实现渐入动画
animateMonthChange(direction) {
  const canvas = this.data.canvasNode;
  const ctx = canvas.getContext('2d');

  let progress = 0;
  const animate = () => {
    progress += 0.05;

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 绘制过渡状态的日历
    this.drawCalendarWithOpacity(progress * (direction === 'next' ? 1 : -1));

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
}
```

---

### 任务2.2：配色预览画板

**页面文件**：`pages/canvas/canvas.wxml/wxss/js/json`

**Canvas画板布局**：
```xml
<!-- canvas.wxml -->
<view class="canvas-board">
  <!-- 工具栏 -->
  <view class="toolbar">
    <view class="shape-btns">
      <button bindtap="selectRect" class="{{shape === 'rect' ? 'active' : ''}}">矩形</button>
      <button bindtap="selectCircle" class="{{shape === 'circle' ? 'active' : ''}}">圆形</button>
    </view>
    <view class="color-picker">
      <view wx:for="{{paletteColors}}" wx:key="*this"
            class="color-dot" style="background: {{item}}"
            bindtap="selectColor" data-color="{{item}}"></view>
    </view>
    <view class="action-btns">
      <button bindtap="undo">撤销</button>
      <button bindtap="clearCanvas">清空</button>
      <button bindtap="saveToAlbum">保存</button>
    </view>
  </view>

  <!-- 画布 -->
  <canvas type="2d" id="boardCanvas" class="board-canvas"
          bindtouchstart="onTouchStart" bindtouchmove="onTouchMove"
          bindtouchend="onTouchEnd"></canvas>
</view>
```

**绘制交互**：
```javascript
// 【加分项⑧】画布API - 配色预览画板
onTouchStart(e) {
  this.setData({ isDrawing: true, startX: e.touches[0].x, startY: e.touches[0].y });
}

onTouchEnd(e) {
  if (!this.data.isDrawing) return;
  this.setData({ isDrawing: false });

  const { startX, startY } = this.data;
  const endX = e.changedTouches[0].x;
  const endY = e.changedTouches[0].y;

  this.drawShape(startX, startY, endX, endY);

  // 记录操作历史（用于撤销）
  this.data.history.push({
    shape: this.data.shape,
    color: this.data.currentColor,
    startX, startY, endX, endY
  });
}

drawShape(x1, y1, x2, y2) {
  const canvas = this.data.canvasNode;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = this.data.currentColor;

  if (this.data.shape === 'rect') {
    const width = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    ctx.fillRect(Math.min(x1, x2), Math.min(y1, y2), width, height);
  } else if (this.data.shape === 'circle') {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
    ctx.beginPath();
    ctx.arc((x1 + x2) / 2, (y1 + y2) / 2, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// 撤销
undo() {
  if (this.data.history.length === 0) return;
  this.data.history.pop();
  this.redrawCanvas();
}

// 清空
clearCanvas() {
  const ctx = this.data.canvasNode.getContext('2d');
  ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight);
  this.setData({ history: [] });
}

// 保存到相册
saveToAlbum() {
  wx.canvasToTempFilePath({
    canvas: this.data.canvasNode,
    success: (res) => {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success: () => {
          wx.showToast({ title: '已保存到相册' });
        }
      });
    }
  });
}
```

---

## Phase 3：颜色命名API（第3周）

### 任务3.1：调用The Color API

**功能文件**：`utils/colorApi.js`

**API封装**：
```javascript
// 【加分项⑤】调用网络API - 颜色命名
const COLOR_API_BASE = 'https://www.thecolorapi.com';

function getColorName(hex) {
  // 移除 # 前缀
  const cleanHex = hex.replace('#', '');

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${COLOR_API_BASE}/id?hex=${cleanHex}`,
      method: 'GET',
      success: (res) => {
        // API返回：{ name: { value: "Deep Peach", closest_named_hex: "#FFCBA4" }, ... }
        const colorName = res.data.name.value;
        resolve({
          name: colorName,
          hex: hex,
          closestHex: res.data.name.closest_named_hex
        });
      },
      fail: (err) => {
        // 降级处理：返回HEX值
        resolve({ name: hex, hex: hex });
      }
    });
  });
}

// 批量获取颜色名称
async function getPaletteNames(colors) {
  const names = [];
  for (const color of colors) {
    const nameInfo = await getColorName(color);
    names.push(nameInfo);
  }
  return names;
}

module.exports = { getColorName, getPaletteNames };
```

**在色板详情页使用**：
```javascript
// pages/detail/detail.js
const { getPaletteNames } = require('../../utils/colorApi');

onLoad(options) {
  this.fetchDetail(options.id);
}

async fetchDetail(id) {
  // 获取色板数据
  const palette = await this.getPaletteData(id);

  // 【加分项⑤】调用颜色命名API
  const colorsWithNames = await getPaletteNames(palette.colors);

  this.setData({
    palette: palette,
    colorsWithNames: colorsWithNames
  });
}
```

**展示颜色名称**：
```xml
<!-- detail.wxml -->
<view class="color-list">
  <view wx:for="{{colorsWithNames}}" wx:key="hex" class="color-item">
    <view class="color-block" style="background: {{item.hex}}"></view>
    <text class="color-name">{{item.name}}</text>
    <text class="color-hex">{{item.hex}}</text>
    <button class="copy-btn" bindtap="copyHex" data-hex="{{item.hex}}">复制</button>
  </view>
</view>
```

---

### 任务3.2：API失败降级处理

**错误处理策略**：
```javascript
// 当颜色API失败时，展示HEX值不阻断流程
async getColorNameSafe(hex) {
  try {
    const result = await getColorName(hex);
    return result;
  } catch (error) {
    console.warn('颜色命名API调用失败，使用HEX值代替', error);
    // 【加分项⑤】降级展示HEX值
    return {
      name: hex,  // 直接用HEX作为名称
      hex: hex
    };
  }
}
```

---

## 任务清单汇总

| 序号 | 任务 | 所属Phase | 预计耗时 | 加分项 |
|------|------|-----------|----------|--------|
| 1 | 每日情绪打卡功能 | Phase 1 | 1天 | - |
| 2 | 打卡历史查询 | Phase 1 | 0.5天 | - |
| 3 | Canvas日历热力图绘制 | Phase 2 | 2天 | ⑧ |
| 4 | 点击格子查看详情 | Phase 2 | 0.5天 | - |
| 5 | 月份切换动画 | Phase 2 | 0.5天 | ⑧ |
| 6 | 配色预览画板 | Phase 2 | 1.5天 | ⑧ |
| 7 | 颜色命名API封装 | Phase 3 | 1天 | ⑤ |
| 8 | 详情页集成API | Phase 3 | 0.5天 | ⑤ |
| 9 | 联调测试 | Phase 4 | 1天 | - |

**总预计工作量**：约8天

---

## 接口清单（需对接）

| 接口 | 方法 | 说明 | 调用位置 |
|------|------|------|----------|
| /api/mood/checkin | POST | 情绪打卡 | 色历页 |
| /api/mood/history | GET | 打卡历史 | 色历页 |
| /api/palette/detail/:id | GET | 色板详情 | 详情页 |

---

## 外部API

| API | 用途 | 调用方式 |
|-----|------|----------|
| The Color API | 颜色命名 | GET https://www.thecolorapi.com/id?hex={hex} |

---

## 加分项标注位置

| 加分项 | 实现位置 | 标注方式 |
|--------|----------|----------|
| ⑤ 网络API | utils/colorApi.js | `// 【加分项⑤】调用网络API` |
| ⑧ Canvas | pages/calendar/calendar.js（热力图） | `// 【加分项⑧】画布API - 热力图` |
| ⑧ Canvas | pages/canvas/canvas.js（画板） | `// 【加分项⑧】画布API - 配色画板` |

---

## Canvas技术要点

### 1. Canvas 2D API 使用注意事项

```javascript
// 获取Canvas节点（小程序2D模式）
const query = wx.createSelectorQuery();
query.select('#myCanvas')
  .fields({ node: true, size: true })
  .exec((res) => {
    const canvas = res[0].node;
    const ctx = canvas.getContext('2d');

    // 处理高清屏
    const dpr = wx.getSystemInfoSync().pixelRatio;
    canvas.width = res[0].width * dpr;
    canvas.height = res[0].height * dpr;
    ctx.scale(dpr, dpr);
  });
```

### 2. roundRect 绘制圆角矩形

```javascript
// Canvas 2D 支持 roundRect 方法
ctx.beginPath();
ctx.roundRect(x, y, width, height, radius);
ctx.fill();
```

### 3. 图片导出

```javascript
wx.canvasToTempFilePath({
  canvas: canvasNode,  // 传入canvas节点
  success: (res) => {
    console.log(res.tempFilePath);
  }
});
```

---

## 注意事项

1. **Canvas性能**：热力图绘制时减少不必要的重绘，使用数据缓存
2. **API降级**：颜色命名API失败不阻断主流程，展示HEX值代替
3. **动画流畅**：月份切换使用 requestAnimationFrame 保证流畅
4. **触摸事件**：画板需要处理 touchstart/touchmove/touchend 三事件
5. **设计规范**：画板UI需符合莫兰迪美学，参考 `UIUX设计规范_v1.0.pdf`
6. **权限处理**：保存相册需处理授权拒绝情况
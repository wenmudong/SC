# Loading 组件重构方案

## 目标
将 Loading 组件重构为可配置的通用组件，支持像素图形、动画类型、渐变色、文案的自定义。

## 接口设计

```tsx
interface LoadingProps {
  message?: string;                                       // 文案，默认 "Loading..."
  ascii?: string;                                         // 自定义像素图形
  animation?: "stretch" | "bounce" | "spin" | "heartbeat" | "none"; // 动画类型
  gradient?: string;                                       // 渐变色，默认彩虹
  preset?: "dachshund" | "slime" | "heart";             // 预设图形
}
```

## 内置预设

| 预设 | 图形 | 动画 |
|------|------|------|
| heart（默认） | 爱心像素图 | heartbeat |
| dachshund | 腊肠狗像素图 | stretch |
| slime | 史莱姆像素图 | bounce |

## 动画类型

- `heartbeat` — scale 缩放模拟心脏跳动（默认）
- `stretch` — scaleX 拉长
- `bounce` — translateY 跳动
- `spin` — rotate 旋转
- `none` — 无动画

## 爱心像素图形

```
  ██  ██
█████████
█████████
█████████
 ███████
  █████
   ███
    █
```

## 心脏跳动动画

```css
@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.1); }
  60% { transform: scale(1); }
}
```

## 使用示例

```tsx
// 默认（爱心跳动 + 彩虹渐变）
<Loading />

// 史莱姆跳动
<Loading preset="slime" message="思考中..." />

// 自定义
<Loading
  ascii="(●ᴗ●)"
  animation="bounce"
  gradient="linear-gradient(to right, #ff6b6b, #4ecdc4)"
  message="加载中"
/>
```

## 改动文件

- `sc-frontend/src/components/Loading.tsx` — 重构
- `sc-frontend/src/components/EmptyState.tsx` — 确认无影响（已使用 GradientText）
- `sc-frontend/src/app/globals.css` — 新增 heart-beat 动画

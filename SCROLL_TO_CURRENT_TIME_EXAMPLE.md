# 如何使用滚动到当前时间线功能

DayView 组件现在暴露了一个 `scrollToCurrentTimeLine` 方法，可以通过 ref 调用来滚动到当前时间线位置。

## 使用示例

```tsx
import React, { useRef } from 'react'
import DayView, { DayViewRef } from '@/components/DayView'

const MyCalendar = () => {
  const dayViewRef = useRef<DayViewRef>(null)

  const handleScrollToNow = () => {
    // 调用滚动到当前时间线的方法
    dayViewRef.current?.scrollToCurrentTimeLine()
  }

  return (
    <div>
      <button onClick={handleScrollToNow}>滚动到当前时间</button>

      <DayView
        ref={dayViewRef}
        startHour={7}
        endHour={23}
        showCurrentTimeLine={true}
        currentDate={new Date()}
        // ... 其他 props
      />
    </div>
  )
}

export default MyCalendar
```

## 功能特点

- 该方法会平滑滚动到当前时间线所在的位置
- 只有当当前时间在日历显示范围内（startHour 到 endHour）时才会滚动
- 滚动时会考虑头部高度和边距，确保时间线可见
- 可以随时调用，不受自动滚动逻辑的限制

## API

### DayViewRef

```typescript
interface DayViewRef {
  scrollToCurrentTimeLine: () => void
}
```

### 方法说明

- `scrollToCurrentTimeLine()`: 滚动到当前时间线位置的方法
  - 无参数
  - 无返回值
  - 如果当前时间不在显示范围内，则不执行滚动

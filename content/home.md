+++
title = "Caelyreth"
description = "关于建筑、几何与空间哲学的记录。"
+++

## Markdown 展示页 {#station}

这是一座孤悬于勘测行星上的中继站。余在这里记录建筑、几何与 :accent[空间] 的哲学。

## 基础文本

这一行展示 _强调_、**强信号**、~~划去的读数~~、`行内代码`、 :kbd[⌘] + :kbd[K]、 :mark[一次观测高亮]、下标 :sub[2] 与上标 :sup[2]，以及一个[返回中继站的链接](#station)。这里有一个硬换行。\
下一行仍属于同一段传输。

这段文字带有原生属性，作为简短的注释。{.annotation}

### 第三级标题

#### 第四级标题

##### 第五级标题

###### 第六级标题

## 引文与提示

> 观测者记下坐标，然后等待，直到光不再只是可能。

> [!NOTE]
> 每篇文档都可以有自己的阅读环境，无须占用另一条路径。

> [!TIP]
> 把行动入口放在真正承载它的内容旁。

> [!IMPORTANT]
> 组件名称属于文档接口，不是最后才补上的外观。

> [!WARNING]
> 别把短暂的信号当成固定的航标。

> [!CAUTION]
> 内容与视觉尚未达成共识前，不要公布这条路径。

## 列表与任务

- 观测记录
  - 曝光
  - 仪器状态
- 传输清单

1. 标记源头。
2. 读取地平线。
3. 归档观测。

- [x] 划定视野。
- [x] 保留文档语义。
- [ ] 发布第一篇观测日志。

## 表格与图像

::table
+++
caption = "本次勘测通道"
+++

| 通道 | 状态 | 置信度 |
| :--- | :--- | :----- |
| 光学 | 开放 | 0.94   |
| 无线 | 静默 | 0.71   |
| 中继 | 排队 | 0.63   |

::

![Caelyreth 站点标记](/favicon.svg '从中继档案中找回的站点标记。')

## Code sample

```ts [relay-signal.ts]
type RelaySignal = {
  observer: string
  state: 'open' | 'quiet'
}

const signal: RelaySignal = {
  observer: 'Yu',
  state: 'open',
}
```

---

## 结构化笔记

::details
+++
summary = "查看仪器记录"
+++

档案接收机会保留原始校准，直到第二次观测确认漂移。
::

::definition-list
:definition-term[站点坐标]
:definition-description[信号第一次足够连续，因而值得被记录的位置。]
:definition-term[观测标记]
:definition-description[一个可见的小参照，让后来的人能比较同一种状态。]
::

## 参考

当前通道状态只在这份文档里有效。[^channel-state]

[^channel-state]: 这是阅读辅助，不是全站导航。

+++
title = "Markdown 语法测试"
font = "sans"
published = "2026-08-21"
summary = "覆盖本站当前启用的 Markdown、Comark 组件、公式、代码高亮与内容交互。"
+++

# 一级标题

## 文本与标题

这是一段普通文本，包含 **粗体**、_强调_、***粗斜体***、~~删除线~~、`inline_code()`、:accent[强调组件] 与 :mark[波浪标记]；也可以前往[站内关于页](/about)或查看[外部资料](https://comark.dev){target="_blank" rel="noreferrer"}。

这一行以硬换行结束。\
这一行应紧接在上一行之后。

这是一段带有属性的注记。{.annotation}

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

---

## 引文、提示与结构

> 一段普通引文保留原有的语气，不必急着把每句话变成结论。

> [!NOTE]
> 这是由 alert 插件处理的注记，可用于需要被单独看见的上下文。

::block{font="serif" align="center"}
这是一段使用 `font` 与 `align` 属性的区块内容。
::

::definition-list
:definition-term[解析]
:definition-description[将 Markdown 转换为可渲染的内容树。]
:definition-term[呈现]
:definition-description[由站点组件接管最终的排版与交互。]
::

::details{summary="展开一段细节"}
这个组件测试可展开内容的初始状态、动画和可访问性语义。
::

## 列表、表格与代码

- 无序项目
  - 嵌套项目
- 第二个项目

1. 有序项目
2. 第二步
   1. 嵌套步骤

- [x] 已完成的检查项
- [ ] 未完成的检查项

| 字段   |     值 | 说明               |
| :----- | -----: | :----------------- |
| 渲染器 | Svelte | 客户端接管文档节点 |
| 解析器 | Comark | 服务端预解析内容   |

```ts
const message = 'signal received'
const active = message.length > 0

console.info({ active, message })
```

## 公式与媒体

行内公式 $E = mc^2$ 与显示公式：

$$
\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}
$$

![站点标识](/favicon.svg '站点标识')

这一处脚注用于检查引用、回链和文末分隔线是否正常生成。[^signal]

[^signal]: 脚注由内容解析阶段汇总，并在文档末尾呈现。

+++
title = "DSH 并不是一个好的产品：也许 Harness 就该变得无聊"
font = "serif"
published = "2026-08-25"
summary = "重新整理了一下最近对 DeepSeek Harness 和 Pi 一类工具/产品的看法。"
+++

近期 :accent[ DeepSeek Harness ] 和 :accent[ Pi Agents ] 的流行，点中了过去不少 :accent[ Agent 产品 ] 的一个真实问题：

用户越来越依赖 Agent，却也越来越容易被产品预设的 :accent[ workflow ] 和 UI 假设限制。

Pi 给出的答案很直接：做一个属于你自己的 :accent[ Agent ]。

它刻意保持极简，让 Pi 适应你的工作方式，而不是让你像学习 Claude Code 一样，先学习“怎么使用 Pi”。Earendil 后来把这套思路进一步总结成一种 :accent[ Harness 哲学 ]：Harness 是模型外围的 instruction、tool、agent loop 与 model adapter。只要用户拥有这一层，就拥有相当程度的自主权。

DeepSeek Harness 则把同一逻辑包装成了更有传播力的语言：

Everything is a plugin.

核心功能与扩展都通过 :accent[ Cordis ] 组合，:accent[ Creator Mode ] 甚至允许模型检查 runtime，再重新组装新的 Preset。

这套叙事当然很强。

“:accent[ Primitives, not features ]” 和 “:accent[ Everything is a plugin ]” 用一句话压缩了很大的技术面，也给出了鲜明的立场：Agent 软件没必要永远成为模型厂控制的封闭程序栈。

但问题也恰恰从这里开始。

## 值得思考的边界

一种越来越常见的推论是：

既然 Harness 可以高度扩展、可以自己组合 workflow、可以让 Agent 自己修改配置，那么它大概就是 Agent 产品的最终形态。

我不这么认为。

这里混淆了两件事情：

[ :mark[通用机制是一种很好的开发策略；通用体验却不是天然成立的产品设计。] ]

Pi 和 DSH 解决的是 :accent[ substrate ]：模型怎么接、工具怎么挂、loop 怎么运行、能力怎么组合。但 substrate 并不等于 :accent[ product ]。

真正到了用户侧，问题就会变成：

产品默认创造了怎样的人与 Agent 的工作关系？

从这个标准看，Pi / DSH 可以是很好的 Harness，却仍然谈不上“最终产品”。

[ :mark[甚至可以说，Harness 已经开始变得有点无聊了。] ]

## “什么都能做” 不等于产品已经解决

最接近的类比可能是 Minecraft 和 Mod。

一个足够强的 :accent[ Mod 生态 ] 可以实现几乎任何游戏机制，但没人会因此认为：Minecraft + Mod = 所有游戏。

它证明的是底座足够强，可以承载很多体验，而不是所有体验都因此失去了独立设计的价值。

Emacs、Linux、Browser 也一样。

Linux 理论上可以承载几乎所有桌面工作方式，但 Windows 和 macOS 的产品价值并没有因此消失。技术上的普适性不会消灭 :accent[ Product Design ]，只会改变设计发生的位置。

所以，对于 Pi 或 DSH，真正值得问的从来不是：

“这个行为能不能通过 :accent[ plugin / skill ] 实现？”

对于高度可扩展系统，答案通常都是“能”。

真正的问题是：

[ :mark[谁来承担把这些能力变成一致体验所需要的设计、集成、维护和纠错成本？] ]

**可实现性，只是产品成立的最低条件。**

## 组合自由，也需要有人消费组合复杂度

[ :mark[模块化架构会转移复杂度，不会让复杂度消失。] ]

在一个 :accent[ opinionated ]、开箱即用的产品里，产品团队承担了组合成本。它替你决定 Mode、Review Flow、权限边界、Todo、Background Task、Subagent，以及 UI 应该怎样呈现。

代价是用户必须接受产品团队的世界观。

而高度可扩展系统把这些选择还给用户：你可以安装、组合、删除、修改。听起来当然更自由。但总有人需要决定：

哪些 extension 值得装、哪些 Skill 是有效的、两个行为冲突时谁优先、插件升级以后谁维护、以及最重要的——对于某个人每天真正做的工作，什么默认值才合理。

这些工作并没有消失，只是经常被包装进“自由”“可组合”“客制化”里，因此没那么显眼。

DSH 的 Creator Mode 给出了一个很 :accent[ Agent-native ] 的答案：

:accent[ 让 Agent 帮你设计 Agent。 ]

这是有价值的，但它主要改变了“谁来写配置”。

**“需要配置”这件事仍然存在。**

而且一个需要持续通过定制才能维持理想体验的系统，本身就意味着持续的维护成本。这对 Pi 这样的社区核心库完全合理，因为它面对的是愿意二次开发的用户。

如果把同一种哲学不加处理地直接作为面向广泛用户的商业产品交付，就很容易把大量本该由产品团队吸收的集成成本重新甩给用户。

## DSH 甚至未必是一个很好的通用核心

顺便说一句，Cordis 本身也暴露了这种问题。

它把大量依赖管理压给下游开发者：插件共享全局 Context，不同插件之间的 :accent[ substrate / contract ] 相对松散。

Cordis 用类似 :accent[ FIFO defer ] 的机制处理生命周期，当然有它的工程价值，但弱类型、global type、Mixin、插件版本依赖等问题仍然存在。这很容易让人想到 Minecraft Mod 生态：

单个 Mod 都工作得很好，真正痛苦的是它们开始互相组合之后。

自由组合的另一面，本来就是 :accent[ compatibility、versioning 和 debugging ]；这些成本最终还是要有人承担。

## “Primitives, not features” 是工程美德，不是完整 UX

Pi 拒绝把 Plan Mode、Subagent 等 :accent[ workflow semantics ] 写死进核心，这个选择在架构上很一致。

它避免一个通用 Harness 偷偷长成某一种 workflow product，也避免核心越来越难理解。

但 “Primitives, not features” 本身有一个很重要的前提：

用户已经知道自己想构造什么；这时 :accent[ Primitive ] 非常有价值。

可如果产品团队已经发现了一个高频、重复、稳定的人类问题，并能把解决方案深度整合到用户无需每次重新设计，那么 :accent[ Feature ] 同样有价值。

计算机历史上，两层从来都是共存的。

POSIX 没消灭应用。

TCP/IP 没消灭 Web Product。

Git 没消灭 GitHub。

脚本语言也没消灭 Spreadsheet。

:accent[ Agent Harness ] 大概率也一样。

## Self-Evo 也没有替这个问题收尾

这里很容易出现另一个答案：

既然不想让用户维护，那让 Agent 自己维护不就好了？

Hermes、OpenClaw、EvoMap，以及一批 :accent[ Self-Evolving Agent ]，都在沿着这个方向走。Agent 可以积累 Memory、更新 Skill、搜索历史 Session，把用户纠正转化为未来行为。

这条路线当然重要。

但它主要解决的是：行为怎样跨时间积累。

真实产品里，还有很多更基础的问题与“Agent 会不会学习”没有直接关系；一个非常会学习你的 Agent，完全可能在这些地方做得很差。而 Self-Evo 自己还会引入新的可观测性、审计问题。

所以：

:accent[ Harness 太 primitive → 加 Memory / Skill / Self-Evo ]

并没有真正回答 Pi / DSH 留下的问题；它只是另一条已经很拥挤的 Agent 路线。

真正值得问的仍然是：即使这些能力全部存在，一个 Agent 产品还需要解决什么？

## Code Agent 的竞争，有一定形式主义

今天的 :accent[ Code Agent ] 已经越来越共享同一组 Primitives：

Tool Calling、Session、Compaction、Permission、Sandbox、Skill、MCP、Subagent、Background Task、Review、Plan、Extension API……

这些都很重要，但越来越多产品差异开始表现成：

谁先 Plan，谁直接 Execute；

谁叫 Task Graph，谁叫 Todo；

谁把 Review 做成 Mode，谁把它塞进 Skill；

谁原生支持 Subagent，谁通过 Package 提供。

更值得注意的是，Harness 自己也开始被抽象。

Vercel AI SDK 7 的 :accent[ HarnessAgent ] 已经尝试把 Claude Code、Codex、Pi 等不同 Harness 放进统一接口，甚至直接用“像切换模型一样切换 Harness”来描述它。

:accent[ ACP ] 也在推进跨 Agent Client 的 Session、Resume、Close、Cancellation、Capability Negotiation。

这些标准离真正 commodity 化还早。

但方向已经很明显：

[ :mark[Model / Tool Runtime 越来越像一个可替换层。] ]

如果这个趋势持续，单纯“再造一个 Code Agent”会越来越难形成完整的 :accent[ Product Loop ]。

这也是“最后一个 Harness”这句话有意思的地方：

如果它真的接近正确，那它首先削弱的，恰恰是继续把 Harness 当作最大创新空间的理由。

## Coding 让我们高估了 Harness 本身

Code Agent 还有一个非常特殊的优势：它站在几十年成熟的软件工程基础设施之上。

Git 已经提供 Version、Diff、Branch、Rollback、History；测试提供一部分 :accent[ executable verification ]；Repository 给文件、依赖和改动一个相对稳定的 identity。

Agent 做错后，有大量工具回答：“刚才到底发生了什么？”

这会让 Coding Harness 看起来比它实际负责的部分更加完整。

但 Agent 一旦离开 Code，开始处理 Spreadsheet、PDF、Presentation、Browser、Research、Email，以及各种混合 Artifact，很多原本理所当然的能力马上消失。

过去大家把太多注意力放在 Agent Loop 上。而真实工作体验里，还有大量问题从来没有被 Harness 本身覆盖。

## 也许 Harness 就应该变得无聊

基础设施社区天然喜欢讨论 Primitive、Composable Architecture、Extension API 和优雅的 abstraction。

因为这些东西最容易被 Fork、Benchmark、Demo，也最容易形成漂亮的技术叙事。

但更广泛的用户最终感受到的，往往是另一组慢得多、也难量化得多的问题：

学习成本。

注意力消耗。

任务如何被打断与恢复。

连续工作几天以后系统会不会变成一团混乱。

人工与自动化的边界是否清楚。

以及——这个系统到底会不会让人愿意长期使用。

[ :mark[真正稀缺的资源一直是人的注意力。] ]

一个 Agent 可以拥有世界上最多的 Capability，依然可以让人精疲力尽。

极客之外，也有大量高能动、专业、愿意掌控结果，却没有兴趣长期维护工具链的人。

“最后一个 Harness”真正有意思的地方，也许不是它终结了 Agent 产品创新。

而是它终于允许我们：

**少谈一点 Harness，多思考一点 Product。**

Agent 的用户体验竞争，才刚刚开始。

原文发布于 [X](https://x.com/caelyreth/status/2092128757649915971)。{.annotation}

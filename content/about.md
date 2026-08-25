+++
title = "关于"
description = "关于泠雨、正在进行的工作，以及这座中继站的来处。"
font = "sans"
+++

# 关于 {#station}

::definition-list
:definition-term[档案名]
:definition-description[ :accent[泠雨]、:accent[Caelyreth]、冷与泠雨、~~Kohane~~、~~心羽~~、Zhenyan, Lin ]
:definition-term[存在时间]
:definition-description[19 年]
:definition-term[标识]
:definition-description[ 学生、:accent[独立开发者]、UI / UX 设计师、业余文字创作者 ]
:definition-term[话题]
:definition-description[系统开发、并行计算基建、开发者体验、Agent Harness、Web 全栈、用户体验设计]
:definition-term[地区]
:definition-description[来自福建~~某十八线县城~~、:accent[常驻浙江杭州]、目前向往去上海或者广东]
::

你好，这里是某不知名杭州~~师专~~计算机大二本科生，你可以叫我「:accent[泠雨]」~~（是泠不是冷）~~；目前在广泛的探索多个领域，做一些个人的 Side Project 以及并行计算基建方面的研究 ~~（写算子）~~。

在技术之外，业余进行一些文字内容创作，主要集中在个人体验、时代思考和一些人生哲学方面，会陆续整理搬运以前的碎片内容到「[虚空之结](/voidknot)」列表。

此外，与 [@suisanka](https://github.com/suisanka) 联合创立了「[Alpha You](https://github.com/alphayou)」，希望做一些关于 Harness 方面的生态库与产品，~~不过至今没有任何动静~~；目前仅在公众号进行一些简单营业。

你可以在[主要项目](#projects)和[时间线](#timeline)了解更多其他细节。{.annotation}

---

## 主要开源项目 {#projects}

::definition-list
:definition-term[ [mlx-lattice](https://github.com/caelyreth/mlx-lattice) ]
:definition-description[ 为 :accent[ Apple Silicon ] 优化的高效 3D 稀疏卷积计算库；具备通用的、内部分支**高度特化**的传统 MSL（Metal Shader Language）后端以及基于 :accent[ Implicit GEMM ] 的为 M5 系列芯片 :accent[神经网络加速器]（Tensor Ops）特化的快速推理路径；并兼容 MLX 原生懒加载计算图。 ]
:definition-term[ [torch-lattice](https://github.com/caelyreth/torch-lattice) ]
:definition-description[ `mlx-lattice` 的附生项目，修复并**拓展**了 [TorchSparse](https://github.com/mit-han-lab/torchsparse) 的功能集并进行语义对齐，实现了 [lattice-contract](https://github.com/caelyreth/mlx-lattice/tree/main/contract) 以通过 [MLIR](https://mlir.llvm.org) 确定化转换计算图与权重，并基本复用旧有项目训练检查点。 ]
:definition-term[ [eclat-zed](https://github.com/caelyreth/eclat-zed)、[vscode-theme-eclat](https://github.com/caelyreth/vscode-theme-eclat)、[eclat.nvim](https://github.com/caelyreth/eclat.nvim) ]
:definition-description[ 视觉压力优化的深色编辑器主题，适合长期、沉浸、的代码阅读与编写需求。完全移除青、蓝色调，使用灰度背景并保持与夜览、护眼模式的高度兼容性。 ]
::

---

## 相关时间线 {#timeline}

~~在度过了小学后两年瞎玩电脑时期之后~~，自初中时期初步接触 :accent[视觉设计]，随后在九年级时接触 :accent[ Web 前端开发]，在高中阶段接触 :accent[ Web 全栈开发]，意外结识了 [@hdsuperman](https://githu.com/hdsuperman) 前辈并部分参与了 [HackerTalk](https://hackertalk.net) 的开发，:mark[从此产生了一些想要当独立开发者、或者成立小公司的想法]。随后结识了 [@so1ve](https://github.com/so1ve) 入佬，并通过*水群*认识了更多年轻开发者。

经过~~惨烈的~~高考之后，升入[杭州师范大学](https://www.hznu.edu.cn)就读 :accent[计算机与科学] 专业，入学后摇摆在 :accent[ ACM/XCPC 竞赛] 与 :accent[网络安全竞赛（CTF）] 之中，:mark[并在学期末因为对应试性竞赛的不适感退出]。之后连续多个月学习了简单的 :accent[嵌入式设计]，~~做了一些垃圾玩具~~，并掌握较好的 ~~（相对不少电子专业学生而言）~~ 的 :accent[ PCB Layout ] 能力。

在大一的下学期（2025 年春季，~~Vibe Coding 还未爆发时~~）相对系统地学习了 :accent[神经网络与深度学习] 相关理论基础；并在导师的建议下学习了一些 :accent[科研] ~~（并非科研）~~ 方法，并在接下来的一段时间参与了 :accent[语义通信]、:accent[心电图分析]、:accent[医学影像] 数个*非常技巧性*的学术领域 ~~（水论文天坑）~~ 的相关研究（网络模块排列组合与跑分），:mark[因为无法从主观上认同这类研究的有效意义离开]。

~~在对相关领域失望以及兴趣动摇之后~~，在暑假踏上了前往西北、西藏的旅途，经历了二十天的游历之后，找回了一些最初的感觉并切割了离开的领域，:mark[认为自己还是适合做一些和实际相关的、或者创造性的工作]，并重新捡起了独立开发的事情，开始积累相对频繁的提交记录。课余继续接触更多 :accent[神经网络] 相关的应用与相关研究；并在另一位老师的邀请下，接触了一些 [ROS](https://www.ros.org) 与机械臂开发。

随后便迎来了 Claude Code 引发的 :accent[ Vibe Coding ] 大爆发以及 OpenClaw 时代，使用 AI 探索了很多感兴趣的领域，~~并写了很多以前没时间完成的玩具~~；结合数年的相关开发经验，:mark[ 积累了相对较好的 AI 编程能力与 :accent[架构设计] 能力 ]，~~但也对行业未来产生了一定悲观看法~~。

在大二下学期（2026 年春季）开学后操作系统课程上认识了 [D, Ding 教授](https://dandanding.com)，并在后来以当届学生身份作为 :accent[助教]，负责[实验设计改革](https://github.com/HZNUOperatingSystem)，并协助进行了相关外包项目推进。在学期末开始与[南京大学视觉实验室](https://vision.nju.edu.cn)合作，设计并给 Apple Silicon 编写了一个 :accent[ 3D 稀疏卷积算子库]，[mlx-lattice](https://github.com/caelyreth/mlx-lattice)，并最终在算力上限内达到了近似比肩 RTX 4090 的单算子速度，在综合研究 [Gameleon (accepted in SIGGRAPH ASIA 26)](https://github.com/gameleon2026/Gameleon) 里相比 [MLX](https://github.com/ml-explore/mlx) 稠密算子提升近 30 倍端到端计算速度；同时基于 [MLIR](https://mlir.llvm.org) 设计了 Torch -> MLX 之间 :accent[自定义算子系统] 的网络确定化转换与权重变换。

近期在[南京大学视觉实验室](https://vision.nju.edu.cn)及其相关下属公司里从事 :accent[人工智能视频编码器] 开发及初步产品化，组织并推进了团队在编码器熵模型 :accent[外周设计]、跨平台客户端与计算后端、应用程序和服务端 :accent[全栈开发]；以及内部开发流程、:accent[项目管理]、项目规范、:accent[DevOps ] 工作流设计。

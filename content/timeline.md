+++
title = "项目与时间线"
description = "正在进行的开源项目与个人经历记录。"
font = "sans"
+++

# 项目与时间线 {#projects-and-timeline}

## 主要开源项目 {#projects}

::definition-list
:definition-term[[mlx-lattice](https://github.com/caelyreth/mlx-lattice)]
:definition-description[为 :accent[Apple Silicon] 优化的高效 3D 稀疏卷积计算库；具备通用的、内部分支**高度特化**的传统 MSL（Metal Shader Language）后端以及基于 :accent[Implicit GEMM] 的为 M5 系列芯片:accent[神经网络加速器]（Tensor Ops）特化的快速推理路径；并兼容 MLX 原生懒加载计算图。]
:definition-term[[torch-lattice](https://github.com/caelyreth/torch-lattice)]
:definition-description[`mlx-lattice` 的附生项目，修复并**拓展**了 [TorchSparse](https://github.com/mit-han-lab/torchsparse) 的功能集并进行语义对齐，实现了 [lattice-contract](https://github.com/caelyreth/mlx-lattice/tree/main/contract) 以通过 [MLIR](https://mlir.llvm.org) 确定化转换计算图与权重，并基本复用旧有项目训练检查点。]
:definition-term[[eclat-zed](https://github.com/caelyreth/eclat-zed)、[vscode-theme-eclat](https://github.com/caelyreth/vscode-theme-eclat)、[eclat.nvim](https://github.com/caelyreth/eclat.nvim)]
:definition-description[为降低视觉压力设计的深色编辑器主题，适合长时间阅读与编写代码。移除青蓝色调，使用灰度背景，并兼容夜览和护眼模式。]
::

---

## 相关时间线 {#timeline}

~~小学后两年主要在瞎玩电脑~~。初中开始接触:accent[视觉设计]，九年级接触 :accent[Web 前端开发]，高中阶段接触 :accent[Web 全栈开发]。其间结识 [@hdsuperman](https://github.com/hdsuperman)，并参与了部分 [HackerTalk](https://hackertalk.net) 开发；:mark[那时开始想成为独立开发者，或成立一家小公司]。之后结识 [@so1ve](https://github.com/so1ve)，也通过*水群*认识了更多年轻开发者。

经过~~惨烈的~~高考之后，升入[杭州师范大学](https://www.hznu.edu.cn)就读:accent[计算机与科学]专业，入学后摇摆在 :accent[ACM/XCPC 竞赛]与:accent[网络安全竞赛（CTF）]之中，:mark[并在学期末因为对应试性竞赛的不适感退出]。之后连续多个月学习了简单的:accent[嵌入式设计]，~~做了一些垃圾玩具~~，并掌握较好的~~（相对不少电子专业学生而言）~~的 :accent[PCB Layout] 能力。

在大一的下学期（2025 年春季，~~Vibe Coding 还未爆发时~~）相对系统地学习了:accent[神经网络与深度学习]相关理论基础；并在导师的建议下学习了一些:accent[科研]~~（并非科研）~~方法，并在接下来的一段时间参与了:accent[语义通信]、:accent[心电图分析]、:accent[医学影像]数个*非常技巧性*的学术领域~~（水论文天坑）~~的相关研究（网络模块排列组合与跑分），:mark[因为无法从主观上认同这类研究的有效意义离开]。

~~在对相关领域失望以及兴趣动摇之后~~，在暑假踏上了前往西北、西藏的旅途，经历了二十天的游历之后，找回了一些最初的感觉并切割了离开的领域，:mark[认为自己还是适合做一些和实际相关的、或者创造性的工作]，并重新捡起了独立开发的事情，开始积累相对频繁的提交记录。课余继续接触更多:accent[神经网络]相关的应用与相关研究；并在另一位老师的邀请下，接触了一些 [ROS](https://www.ros.org) 与机械臂开发。

随后便迎来了 Claude Code 引发的 :accent[Vibe Coding] 大爆发以及 OpenClaw 时代，使用 AI 探索了很多感兴趣的领域，~~并写了很多以前没时间完成的玩具~~；结合数年的相关开发经验，:mark[积累了相对较好的 AI 编程能力与:accent[架构设计]能力]，~~但也对行业未来产生了一定悲观看法~~。

在大二下学期（2026 年春季）开学后操作系统课程上认识了 [D, Ding 教授](https://dandanding.com)，并在后来以当届学生身份作为:accent[助教]，负责[实验设计改革](https://github.com/HZNUOperatingSystem)，并协助进行了相关外包项目推进。在学期末开始与[南京大学视觉实验室](https://vision.nju.edu.cn)合作，设计并给 Apple Silicon 编写了一个 :accent[3D 稀疏卷积算子库]，[mlx-lattice](https://github.com/caelyreth/mlx-lattice)，并最终在算力上限内达到了近似比肩 RTX 4090 的单算子速度，在综合研究 [Gameleon (accepted in SIGGRAPH ASIA 26)](https://github.com/gameleon2026/Gameleon)里相比 [MLX](https://github.com/ml-explore/mlx) 稠密算子提升近 30 倍端到端计算速度；同时基于 [MLIR](https://mlir.llvm.org) 设计了 Torch -> MLX 之间:accent[自定义算子系统]的网络确定化转换与权重变换。

近期在[南京大学视觉实验室](https://vision.nju.edu.cn)及其相关下属公司里从事:accent[人工智能视频编码器]开发及初步产品化，组织并推进了团队在编码器熵模型:accent[外周设计]、跨平台客户端与计算后端、应用程序和服务端:accent[全栈开发]；以及内部开发流程、:accent[项目管理]、项目规范、:accent[DevOps] 工作流设计。

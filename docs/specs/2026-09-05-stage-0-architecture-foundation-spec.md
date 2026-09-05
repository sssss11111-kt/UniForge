# Stage 0 Architecture Foundation — Stage Specification

2026-09-05。用户已批准启动 Stage 0 及审阅修订方向，未批准任何阶段验收。

## Authority and scope

上位依据：`2026-09-05-uniforge-product-architecture-spec-v2.1-no-dev-zone.md`；实施依据：`../superpowers/plans/2026-09-05-stage-0-architecture-foundation.md`。根 AGENTS 始终适用。

目标：在 Windows 验证自主 Domain Core、SQLite/Event、Permission/Approval、typed IPC、Workspace、Model/Tool Gateway、Native/LangGraph、Knowledge/Memory、MCP 与 OCR/Speech/Document Sidecar。包括备份诊断、打包和真实测试流水线。

仅跨阶段基础对象/契约/合成数据 PoC。无课程/英语/新闻/完整项目业务，无 UI 设计冻结，无通用终端，无应用内本体开发，无正式发布/自动更新基础设施。

## Resolved review decisions

C1：严格 0→0.5→1→2→3→4→5。C2：总览+六个工作模块。C3：课程只临时执行，持久开发仅04软件项目。C4：动作语义定风险，正常Command不因SQL自动升HIGH，Agent无直写SQL。C5：普通备份排除原始聊天和Personal Core，允许显式私有备份并实施Forget失效。C6：当前规格自包含，不推断旧方案。C7：LangGraph为B适配器；Bok默认参考。C8：数据依赖图不授予并行跳阶段。

G1：AgentEvent真源、agent_runs快照；Personal Core隔离PoC。G2：checkpoint不可当普通cache删，未知副作用不重放。G3：无有效隔离不开放任意进程。G4：备份包含授权Managed Copy正文及哈希。G5：可信身份、作用域、工具版本/payload/expiry绑定、执行前重验。

## Behavior acceptance

详细计划 H 的全部18类门禁逐项验证；不能以Mock证明真实引擎、联网模型、clean Windows安装。没有账号/模型/Windows环境证据时记BLOCKED，不降低验收标准。阶段标签必须等待用户验收。

## Technical ownership

contracts为可移植契约；core为规则与应用ports；infrastructure实现SQLite/文件/凭据/进程；platform包仅通过稳定接口提供能力。Main组合可信服务，Renderer/Preload只用窄IPC子集。

## Change control

批准实施不等于冻结全部未来业务Schema。Task0.1以实测锁定依赖；版本兼容调整记ADR。安全边界不可放宽。真实外发、费用和系统变更不得超出已授权范围。

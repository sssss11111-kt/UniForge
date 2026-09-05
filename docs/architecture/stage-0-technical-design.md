# Stage 0 Technical Design

授权基线见 `../specs/2026-09-05-stage-0-architecture-foundation-spec.md`。详细接口签名由实施计划 C 定义，落实在 packages/contracts；避免在本文复制第二套类型。

调用路径：Renderer→typed Preload→Main可信身份/Schema校验→Application Services→Permission/Approval→事务/Domain Event→Projection。Runtime只持网关与Command端口，不得获取DB/凭据。

依赖方向和确切路径：实施计划B与各Task。Event与Projection：实施计划C4；SQLite：D。Native/LangGraph：C7，checkpoint单独保留；非幂等副作用UNKNOWN时停止。

Windows文件：canonical、root identity、保护路径、junction/symlink/硬链接/ADS/device path检查；未知可写路径fail closed。Process cwd不是隔离；Stage0只固定、登记能力。

Sidecar：版本化请求、correlationId、cancel/timeout/health/shutdown/进程树退出；只获临时文件句柄，不授整个工作区。不可信任意引擎无OS隔离不得开放执行。

实施顺序严格Master0.1～0.17；具体版本和技术替换用ADR，测试证据按任务保存。Stage0最小窗口只展示真实技术状态，不形成Design System。

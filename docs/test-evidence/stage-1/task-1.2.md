# Stage 1 Task 1.2 — 设置、模型中心、权限与工作区

## 范围

本任务提供设置中心的最小垂直切片：Workspace 状态、provider-neutral 模型配置摘要、权限状态和基础诊断显示。模型凭据只接受操作系统凭据存储引用（`credentialRef`），服务和 IPC DTO 不返回密钥或凭据引用本身。

## 实现

- `packages/contracts/settings/index.ts`：设置中心 DTO 与更新输入契约。
- `packages/core/application/settings-center.ts`：应用服务，校验路由与凭据引用，保存可展示状态。
- `apps/desktop/src/main/ipc/register.ts`：`settings-snapshot` 与 `settings-update-model` typed IPC handlers，拒绝未知形状和无效 sender。
- `apps/desktop/src/preload/index.ts`：仅暴露 `settings.getSnapshot` 和 `settings.updateModel`。
- `apps/desktop/src/renderer/*`：显示工作区、模型和外网权限摘要。

## 验证

在 Windows 工作区运行：

```text
npm run typecheck                 PASS
npm run lint                      PASS
npm run unit -- --run packages/core/application/settings-center.test.ts  PASS (56 tests)
npm run build:desktop             PASS
npx playwright test apps/desktop/tests/launch.spec.ts --timeout=20000 --reporter=line  PASS (1 test)
```

验证了默认工作区、模型未配置状态、外网关闭、无密钥字段，以及凭据引用格式校验。

## 边界与后续

本任务不调用真实模型供应商，不读取或保存 API key，不开放外网开关，不实现课程业务。真实 provider 连接与预算配置沿用 Model Gateway，待后续任务在具备明确权限和审批后接入。

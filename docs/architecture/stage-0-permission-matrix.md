# Stage 0 Permission Matrix

默认DENY；可信Main构建RequestContext，Renderer/Agent不能自签身份或Approval。权限扩张重新决策，任务结束撤临时grant。

| 操作 | 风险/决策 | 范围 |
|---|---|---|
| 内部查询/总结 | LOW，显式允许策略 | 当前授权Workspace对象 |
| 创建基础Task/草稿 | MEDIUM，显式策略 | typed Command，不因SQL自动HIGH |
| 写测试Artifact/删除 | HIGH，精确审批 | 专用临时/managed授权范围 |
| 敏感内容云外发/换Provider | HIGH，新审批 | 数据范围、provider/model、预算 |
| 文件跨项目/过期grant/伪造actor | DENY | 不提供隐藏替代路径 |
| UniForge源码/安装/更新器/迁移实现/权限内核/构建签名 | 无条件DENY | 不可通过Approval解除 |
| 用户项目源码修改 | Stage0不可用 | Stage5仅04软件项目 |
| 任意shell/CLI/MCP启动 | Stage0不可用 | 仅固定已登记合成fixture |
| 课程代码 | Stage0不实现 | Stage1临时受控执行，不持久开发 |
| Secret | 仅可信凭据adapter | OS安全存储，不发Renderer/日志/备份 |

审批绑定actor/run/capability/scope/payloadHash/toolVersion/policyVersion/expiry；一次消费。执行前重验撤销、canonical路径和资源身份。批准不等于任意次数授权。fork不复制可消费审批。

验证矩阵：拒绝结果+无副作用；跨Workspace、过期/撤销/并发消费、额外IPC字段、路径链接/竞争、外发fallback、Secret日志/备份泄漏。测试位置和命令见详细计划各Task。

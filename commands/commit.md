---
description: Create standardized Git commits with conventional format and emoji
argument-hint: [--check]
allowed-tools: Bash(git:*), Bash(pnpm:*)
---

# Commit

自动创建规范的 Git 提交，生成符合约定式提交规范的消息并配上合适的表情符号。

## Usage:

`/commit [--check]`

**Options:**

- `--check`: 执行预提交检查（lint、build、generate:docs）

## Process:

### 1. Pre-commit Checks (Optional)

仅在指定 `--check` 参数时执行：

- 运行 `pnpm lint` 检查代码质量
- 运行 `pnpm build` 验证构建成功
- 运行 `pnpm generate:docs` 更新文档
- 如果检查失败，询问是否继续提交

### 2. Analyze Changes

- 检查当前暂存区状态
- 如果暂存区为空，自动添加所有修改和新增文件
- 分析代码变更内容和影响范围
- 判断是否包含多个不相关的逻辑变更

### 3. Generate Commit Message

- 根据变更类型选择合适的 commit type
- 生成简洁明了的提交描述（≤70 字符）
- 添加对应的表情符号
- 使用祈使语气的动词开头

### 4. Execute Commit

- 如果发现多个独立变更，建议拆分提交
- 为每个提交生成规范的消息
- 执行 git commit 并验证结果

## Commit Types and Emoji:

| Type       | Emoji | Description    |
| ---------- | ----- | -------------- |
| `feat`     | ✨    | 新功能         |
| `fix`      | 🐛    | 错误修复       |
| `docs`     | 📝    | 文档更改       |
| `style`    | 🎨    | 代码格式/结构  |
| `refactor` | ♻️    | 代码重构       |
| `perf`     | ⚡️   | 性能改进       |
| `test`     | ✅    | 测试相关       |
| `chore`    | 🔧    | 工具/配置/依赖 |
| `ci`       | 👷    | CI/CD 相关     |
| `revert`   | ⏪️   | 回滚更改       |

**Specialized Emoji (自动根据上下文选择):**

| Emoji | Type       | Usage           |
| ----- | ---------- | --------------- |
| 🚚    | `refactor` | 移动/重命名文件 |
| 🔥    | `fix`      | 清理冗余代码    |
| 🚑️   | `fix`      | 紧急修复        |
| 🔒️   | `fix`      | 修复安全问题    |
| 📦️   | `chore`    | 更新依赖包      |
| 🏷️    | `feat`     | 更新类型定义    |
| 👔    | `feat`     | 业务逻辑        |
| 🩹    | `fix`      | 轻微修复        |
| 💚    | `fix`      | 修复 CI 构建    |

## Examples:

**Single Commits:**

```
✨ feat: 添加用户认证系统
🐛 fix: 解决渲染过程中的内存泄漏
📝 docs: 使用新端点更新 API 文档
♻️ refactor: 简化错误处理逻辑
🚑️ fix: 修复认证流程中的关键安全漏洞
🎨 style: 重新组织组件结构以提高可读性
🔥 fix: 删除过时的旧代码
```

**Split Commits (多个变更应拆分):**

```
Commit 1: ✨ feat: 添加新的solc版本类型定义
Commit 2: 📝 docs: 更新solc版本文档
Commit 3: 🔧 chore: 升级package.json中的依赖项
Commit 4: ✅ test: 为solc版本特性添加单元测试
Commit 5: 🔒️ fix: 修复依赖项中的安全漏洞
```

## Split Commit Guidelines:

变更应拆分的判断标准：

1. **功能领域**: 修改涉及不同的功能模块或业务领域
2. **变更类型**: 混合了新功能、错误修复、重构等不同类型
3. **文件类型**: 同时修改了源代码、文档、配置等
4. **逻辑关联**: 包含多个独立的逻辑变更
5. **变更规模**: 单次修改过于庞大

## Best Practices:

- **原子化提交**: 每个提交只包含一个明确目标的相关修改
- **规范格式**: `<emoji> <type>: <description>` (≤70 字符)
- **祈使语气**: 使用 "add feature" 而非 "added feature"
- **智能拆分**: 发现多个独立变更时，逐个暂存和提交
- **自动检查**: 使用 `--check` 确保 lint、build、docs 同步

## Your Task:

分析当前代码变更并执行智能提交：

1. 如果用户指定了 `$ARGUMENTS` 包含 `--check`，执行预提交检查
2. 分析所有变更，判断是否需要拆分
3. 生成符合规范的提交消息（包含合适的表情符号）
4. 如需拆分，指导用户逐个提交相关变更
5. 确保提交消息准确反映实际代码变更

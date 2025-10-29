# GitLab MR Code Review Skill

这是一个 Claude Code Skill，用于自动审查 GitLab Merge Request 并将结果发布到 GitLab。

## 架构说明

这是一个符合 **Claude Code Skills 官方规范**的实现：

- **Skill 定义**: `.claude/skills/gitlab-mr-review.md` - 定义触发条件和执行步骤（prompt）
- **辅助脚本**:
  - `fetch-mr.js` - 获取 MR 详情和代码变更（GitLab API）
  - `post-review.js` - 发布审查结果到 GitLab（GitLab API）
- **代码分析**: 由 **Claude Code 本身**完成（不需要单独配置 LLM）

### 与传统实现的区别

✅ **正确的 Skill 实现**（本项目）:

- Skill 文件定义执行步骤的 prompt
- 辅助脚本只处理 GitLab API 调用
- Claude Code 自己分析代码（使用用户已配置的 LLM）
- **无需配置** `ANTHROPIC_API_KEY`

❌ **错误的实现方式**:

- 创建独立的应用程序
- 要求配置 `ANTHROPIC_API_KEY`
- 自己调用 Anthropic API 进行代码分析

## 快速开始

### 1. 配置环境变量

```bash
# 复制配置模板
cp .env.example .env

# 编辑 .env 文件
nano .env
```

需要配置：

- `GITLAB_BASE_URL`: GitLab 实例 URL（如 https://gitlab.com）
- `GITLAB_PRIVATE_TOKEN`: GitLab 访问令牌

**重要**: **不需要配置** `ANTHROPIC_API_KEY`（Claude Code 已内置）

### 2. 创建 GitLab Personal Access Token

1. 前往 GitLab Settings → Access Tokens
2. 创建新令牌，选择权限：
   - `api`（推荐）或
   - `read_api` + `write_repository`（最小权限）
3. 复制令牌（格式：`glpat-xxxxxxxxxxxx`）
4. 设置环境变量：
   ```bash
   export GITLAB_PRIVATE_TOKEN="glpat-xxxxxxxxxxxx"
   ```

### 3. 测试辅助脚本

测试获取 MR：

```bash
node scripts/fetch-mr.js https://gitlab.com my-group/my-project 123
```

应该输出 JSON 格式的 MR 信息。

### 4. 使用 Skill

在 Claude Code 中，直接提供 MR URL：

```
Please review this MR: https://gitlab.com/my-group/my-project/merge_requests/123
```

或用中文：

```
帮我审查这个 MR: https://gitlab.com/my-group/my-project/merge_requests/456
```

**支持的 URL 格式**:

- 标准格式：`https://gitlab.com/{namespace}/{project}/merge_requests/{iid}`
- 新版格式：`https://gitlab.com/{namespace}/{project}/-/merge_requests/{iid}`

## 工作流程

1. **用户提供 MR URL** → Claude Code 识别到触发条件
2. **加载 Skill 定义** → `.claude/skills/gitlab-mr-review.md` 展开为 prompt
3. **Claude Code 执行步骤**：
   - 解析 MR URL
   - 调用 `fetch-mr.js` 获取 MR 数据
   - **Claude Code 自己分析代码**（使用 LLM 能力）
   - 生成结构化的审查结果
   - 调用 `post-review.js` 发布到 GitLab
4. **反馈给用户** → 提供 GitLab 评论链接

## 文件说明

### `scripts/fetch-mr.js`

获取 MR 信息的辅助脚本。

**用法**:

```bash
node scripts/fetch-mr.js <gitlab-base-url> <project-path> <mr-iid>
```

**示例**:

```bash
node scripts/fetch-mr.js https://gitlab.com my-group/my-project 123
```

**输出**: JSON 格式的 MR 上下文

```json
{
  "title": "MR 标题",
  "description": "MR 描述",
  "author": "作者用户名",
  "sourceBranch": "feature-branch",
  "targetBranch": "main",
  "webUrl": "https://...",
  "changes": [...],
  "diffStats": {
    "additions": 100,
    "deletions": 50,
    "totalFiles": 5
  }
}
```

### `scripts/post-review.js`

发布审查结果的辅助脚本。

**用法**:

```bash
node scripts/post-review.js <gitlab-base-url> <project-path> <mr-iid> <review-json-file>
```

**示例**:

```bash
node scripts/post-review.js https://gitlab.com my-group/my-project 123 review-result.json
```

**输入**: `review-result.json` 格式

```json
{
  "highLevelSummary": "整体评估",
  "findings": [
    {
      "title": "发现标题",
      "summary": "详细描述",
      "severity": "critical|issue|suggestion",
      "path": "file/path",
      "line": 42,
      "suggestion": "改进建议"
    }
  ],
  "testingGuidance": "测试建议",
  "risks": ["风险1", "风险2"]
}
```

## 故障排除

### 问题：401 Unauthorized

**原因**: GitLab 令牌无效或过期
**解决**:

1. 检查 `GITLAB_PRIVATE_TOKEN` 环境变量
2. 确认令牌未过期
3. 测试令牌：`curl -H "PRIVATE-TOKEN: your-token" "$GITLAB_BASE_URL/api/v4/user"`

### 问题：403 Forbidden

**原因**: 令牌权限不足
**解决**:

1. 检查令牌权限（需要 `api` 或 `read_api` + `write_repository`）
2. 重新创建令牌并授予正确权限

### 问题：404 Not Found

**原因**: MR 不存在或无访问权限
**解决**:

1. 确认 MR URL 正确
2. 确认你有权访问该项目
3. 确认项目路径格式正确（`namespace/project`）

### 问题：429 Rate Limit

**原因**: API 请求频率超限
**解决**: 等待几分钟后重试

### 问题：Skill 未触发

**原因**: 消息格式不匹配触发条件
**解决**: 确保消息同时包含：

- GitLab MR URL
- 审查意图关键词（"review", "审查", "check" 等）

示例：

```
✓ "Please review https://gitlab.com/my/project/merge_requests/123"
✓ "帮我审查这个 MR: https://gitlab.com/my/project/-/merge_requests/123"
✗ "https://gitlab.com/my/project/merge_requests/123" (缺少审查意图)
```

## 高级使用

### 自定义审查标准

你可以在与 Claude Code 对话时提供额外的审查指导：

```
Please review this MR with focus on:
- Security vulnerabilities
- Performance optimization opportunities
- TypeScript type safety

MR URL: https://gitlab.com/my/project/merge_requests/123
```

### 审查特定方面

```
请重点关注以下方面审查这个 MR:
1. 数据库查询性能
2. API 接口设计
3. 错误处理完整性

MR: https://gitlab.com/my/project/merge_requests/123
```

## 限制

- 仅支持 GitLab（不支持 GitHub, Bitbucket 等）
- 适合 < 100 个文件、< 10,000 行变更的 MR
- 需要网络访问 GitLab API
- 无法审查草稿 MR 或已归档项目

## License

MIT

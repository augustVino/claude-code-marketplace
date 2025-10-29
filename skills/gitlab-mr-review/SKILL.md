---
name: gitlab-mr-review
description: 当用户提供 GitLab Merge Request URL 并请求代码审查时，你需要使用此技能.
---

# GitLab MR Code Review Skill

当用户提供 GitLab Merge Request URL 并请求代码审查时，你需要：

## 执行步骤

### 1. 提取和验证 MR URL

- 从用户消息中提取 GitLab MR URL
- 支持两种 URL 格式：
  - 标准格式：`https://{gitlab-host}/{namespace}/{project}/merge_requests/{iid}`
  - 新版格式：`https://{gitlab-host}/{namespace}/{project}/-/merge_requests/{iid}`
- 解析出：baseUrl, projectPath, mrIid

### 2. 获取 MR 信息

使用 `scripts/fetch-mr.js` 脚本获取 MR 详情和代码变更：

```bash
node scripts/fetch-mr.js <gitlab-base-url> <project-path> <mr-iid>
```

脚本会返回 JSON 格式的 MR 上下文，包括：

- MR 标题、描述、作者
- 源分支和目标分支
- 所有文件变更和 diff

### 3. 分析代码变更

仔细分析获取到的代码变更，关注：

**代码质量**：

- 潜在的 bug 和逻辑错误
- 代码异味和反模式
- 性能问题
- 安全漏洞

**最佳实践**：

- 代码风格和一致性
- 命名规范
- 注释和文档
- 错误处理

**架构设计**：

- 代码组织和模块化
- 依赖关系
- 可测试性
- 可维护性

### 4. 生成审查结果

创建结构化的审查结果，包括：

```json
{
  "highLevelSummary": "变更的整体评估（2-3 句话）",
  "findings": [
    {
      "title": "发现标题",
      "summary": "详细描述",
      "severity": "critical|issue|suggestion",
      "path": "文件路径",
      "line": 行号（可选）,
      "suggestion": "改进建议（可选）"
    }
  ],
  "testingGuidance": "测试建议",
  "risks": ["潜在风险1", "潜在风险2"]
}
```

**严重程度分类**：

- `critical`: 严重问题，必须修复（安全漏洞、数据丢失风险等）
- `issue`: 一般问题，应该修复（bug、性能问题等）
- `suggestion`: 改进建议（代码风格、最佳实践等）

### 5. 发布审查结果

使用 `scripts/post-review.js` 脚本将审查结果发布到 GitLab：

```bash
node scripts/post-review.js <gitlab-base-url> <project-path> <mr-iid> <review-result-json-file>
```

脚本会：

- 创建总结评论（包含所有发现）
- 为有行号的发现创建讨论评论
- 检查并避免重复发布

### 6. 向用户反馈

总结审查结果并提供：

- 发现的问题数量（按严重程度分类）
- GitLab MR 评论链接
- 关键发现的简要说明

## 环境变量要求

执行此 skill 需要以下环境变量：

```bash
GITLAB_BASE_URL          # GitLab 实例 URL（如 https://gitlab.com）
GITLAB_PRIVATE_TOKEN     # GitLab 访问令牌（需要 api 或 read_api + write_repository 权限）
```

如果环境变量未配置，向用户说明：

1. 如何创建 GitLab Personal Access Token
2. 如何设置环境变量
3. 参考 `scripts/README.md`

## 错误处理

如果遇到错误，提供清晰的错误信息和建议：

- **URL 格式错误**：说明正确格式
- **401 Unauthorized**：检查 GITLAB_PRIVATE_TOKEN
- **403 Forbidden**：检查令牌权限
- **404 Not Found**：验证 MR URL 和项目访问权限
- **429 Rate Limit**：建议稍后重试

## 注意事项

- 你就是审查者，使用你自己的能力分析代码（不需要调用外部 LLM API）
- 仔细阅读每个文件的变更，理解代码意图
- 给出具体的、可操作的建议
- 对于中文项目，使用中文进行审查
- 对于英文项目，使用英文进行审查

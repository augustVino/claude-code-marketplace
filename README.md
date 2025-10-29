# Claude Code Marketplace

> 精选的 Claude Code 插件集合：技能（Skills）、工作流程（Workflows）和生产力工具

## 📖 简介

这是一个精心策划的 Claude Code 插件市场，包含各种实用的插件和技能，帮助开发者提升编码效率和代码质量。

## 🚀 功能特性

### 插件（Plugins）

#### 1. **生成提交（generate-commit）**

自动生成符合约定式提交规范的 Git 提交消息，配有合适的表情符号。

- 📁 **路径**: `plugins/generate-commit/`
- 📝 **版本**: 1.0.0
- 👤 **作者**: Vino

**主要功能**：

- ✅ 自动分析代码变更内容
- ✅ 智能生成符合规范的提交消息
- ✅ 自动添加合适的表情符号
- ✅ 支持可选的预提交检查（lint、build、docs）
- ✅ 智能判断是否需要拆分多个提交
- ✅ 支持多种提交类型（feat、fix、docs、refactor 等）

**使用方法**：

```
/commit [--check]
```

详见：[generate-commit 文档](plugins/generate-commit/commands/commit.md)

#### 2. **代码库分析（analyze-codebase）**

代码库分析工具（开发中）

- 📁 **路径**: `plugins/analyze-codebase/`
- 🚧 **状态**: 开发中

### 技能（Skills）

#### 1. **GitLab MR 代码审查（gitlab-mr-review）**

自动审查 GitLab Merge Request 并将结果发布到 GitLab。

- 📁 **路径**: `skills/gitlab-mr-review/`
- 📝 **版本**: 1.0.0
- 👤 **作者**: Vino

**主要功能**：

- 🔍 自动获取 MR 详情和代码变更
- 🤖 智能分析代码质量、安全性和最佳实践
- 📊 生成结构化的审查报告
- 💬 自动发布审查结果到 GitLab
- 🌍 支持中英文审查

**使用方法**：

在 Claude Code 中直接提供 MR URL：

```
帮我审查这个 MR: https://gitlab.com/my-group/my-project/merge_requests/123
```

或英文：

```
Please review this MR: https://gitlab.com/my-group/my-project/-/merge_requests/123
```

**环境变量配置**：

```bash
export GITLAB_BASE_URL="https://gitlab.com"
export GITLAB_PRIVATE_TOKEN="glpat-xxxxxxxxxxxx"
```

**审查内容包括**：

- 🐛 潜在的 bug 和逻辑错误
- 💡 代码异味和反模式
- ⚡ 性能问题
- 🔒 安全漏洞
- 📝 代码风格和最佳实践
- 🏗️ 架构设计和可维护性

详见：[gitlab-mr-review 文档](skills/gitlab-mr-review/SKILL.md) | [脚本说明](skills/gitlab-mr-review/scripts/README.md)

## 📦 安装

### 方式一：克隆仓库

```bash
git clone https://github.com/augustVino/claude-code-marketplace.git
cd claude-code-marketplace
```

### 方式二：使用特定插件

根据需要复制相应的插件或技能目录到你的项目中。

## 🛠️ 配置

### GitLab MR 审查配置

1. **创建 GitLab Personal Access Token**

   前往 GitLab Settings → Access Tokens，创建新令牌并选择以下权限：

   - `api`（推荐）或
   - `read_api` + `write_repository`（最小权限）

2. **设置环境变量**

   ```bash
   export GITLAB_BASE_URL="https://gitlab.com"  # 或你的 GitLab 实例 URL
   export GITLAB_PRIVATE_TOKEN="glpat-xxxxxxxxxxxx"
   ```

   或使用 `.env` 文件（需要在项目根目录）：

   ```bash
   cp .env.example .env
   nano .env  # 编辑配置
   ```

3. **测试配置**

   ```bash
   # 测试 GitLab 令牌
   curl -H "PRIVATE-TOKEN: your-token" "$GITLAB_BASE_URL/api/v4/user"

   # 测试获取 MR
   cd skills/gitlab-mr-review
   node scripts/fetch-mr.js https://gitlab.com my-group/my-project 123
   ```

## 📚 使用示例

### 示例 1：生成提交消息

```bash
# 快速提交（不执行检查）
/commit

# 带预提交检查（lint + build + docs）
/commit --check
```

生成的提交示例：

- ✨ feat: 添加用户认证系统
- 🐛 fix: 解决渲染过程中的内存泄漏
- 📝 docs: 使用新端点更新 API 文档
- ♻️ refactor: 简化解析器中的错误处理逻辑

### 示例 2：审查 GitLab MR

```
帮我审查这个 MR: https://gitlab.com/my-group/my-project/merge_requests/456
```

Claude Code 会：

1. 自动获取 MR 详情和代码变更
2. 分析代码质量和潜在问题
3. 生成结构化的审查报告
4. 自动发布到 GitLab MR 评论区
5. 返回评论链接和关键发现摘要

### 示例 3：自定义审查重点

```
请重点关注以下方面审查这个 MR:
1. 数据库查询性能
2. API 接口设计
3. 错误处理完整性

MR: https://gitlab.com/my-group/my-project/merge_requests/789
```

## 🔧 故障排除

### GitLab MR 审查常见问题

#### 401 Unauthorized

- **原因**: GitLab 令牌无效或过期
- **解决**: 检查 `GITLAB_PRIVATE_TOKEN` 环境变量，确认令牌未过期

#### 403 Forbidden

- **原因**: 令牌权限不足
- **解决**: 重新创建令牌并授予 `api` 或 `read_api` + `write_repository` 权限

#### 404 Not Found

- **原因**: MR 不存在或无访问权限
- **解决**: 确认 MR URL 正确，确认你有权访问该项目

#### 429 Rate Limit

- **原因**: API 请求频率超限
- **解决**: 等待几分钟后重试

#### Skill 未触发

- **原因**: 消息格式不匹配触发条件
- **解决**: 确保消息同时包含 GitLab MR URL 和审查意图关键词

## 🏗️ 项目结构

```
claude-code-marketplace/
├── .claude-plugin/
│   └── marketplace.json          # 插件市场配置文件
├── plugins/                       # 插件目录
│   ├── analyze-codebase/         # 代码库分析插件（开发中）
│   └── generate-commit/          # 提交消息生成插件
│       └── commands/
│           └── commit.md         # 提交命令文档
└── skills/                        # 技能目录
    └── gitlab-mr-review/         # GitLab MR 审查技能
        ├── scripts/              # 辅助脚本
        │   ├── fetch-mr.js      # 获取 MR 信息
        │   ├── post-review.js   # 发布审查结果
        │   └── README.md        # 脚本文档
        └── SKILL.md             # 技能定义
```

## 🤝 贡献

欢迎贡献新的插件和技能！

### 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '✨ feat: 添加某个惊艳的功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 插件开发规范

- 遵循 Claude Code 插件官方规范
- 提供清晰的文档和使用示例
- 包含必要的错误处理
- 更新 `marketplace.json` 配置文件

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 作者

**Vino** - [GitHub](https://github.com/augustVino)

## 🙏 致谢

感谢所有为本项目做出贡献的开发者！

## 📮 联系方式

- GitHub Issues: [提交问题](https://github.com/augustVino/claude-code-marketplace/issues)
- GitHub Discussions: [参与讨论](https://github.com/augustVino/claude-code-marketplace/discussions)

## 🗺️ 路线图

- [ ] 完善代码库分析插件
- [ ] 添加更多 Git 工作流插件
- [ ] 支持 GitHub PR 审查
- [ ] 添加代码重构建议插件
- [ ] 集成更多代码质量工具
- [ ] 提供插件市场 Web UI

---

⭐ 如果这个项目对你有帮助，欢迎给个星标！

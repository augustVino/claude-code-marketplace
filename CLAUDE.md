# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

这是一个 Claude Code 配置仓库，包含自定义命令、技能和代理，用于提升 Claude Code 的开发体验。

**仓库类型**: Plugin/Settings repository for Claude Code
**主要功能**: 提供可复用的 commands、skills 和 agents
**发布平台**: Claude Code Marketplace

## Repository Structure

```
.
├── commands/           # 自定义斜杠命令 (Custom slash commands)
│   ├── commit.md      # 智能 Git 提交命令
│   ├── translate.md   # 技术文章翻译命令
│   ├── interview.md   # 面试相关命令
│   └── create-command.md  # 创建新命令的命令
├── skills/            # 可调用的技能 (Invokable skills)
│   ├── gitlab-mr-review/   # GitLab MR 代码审查
│   ├── pdf-skill/          # PDF 处理工具包
│   ├── update-claude-md/   # 自动更新 CLAUDE.md
│   ├── typescript-advanced-types/  # TypeScript 高级类型
│   └── nanobanana-skill/   # Nanobanana 技能
├── agents/            # 自定义代理定义 (Custom agents)
│   ├── typescript-architect.md
│   ├── bash-script-master.md
│   ├── codebase-doc-writer.md
│   ├── design-system-expert.md
│   └── prompt-engineering-expert.md
└── .claude-plugin/    # 插件元数据和市场配置
    ├── plugin.json
    └── marketplace.json
```

## Architecture Patterns

### 1. Commands Structure

Commands are markdown files with YAML frontmatter located in `commands/`:

```yaml
---
description: Brief description of the command
argument-hint: Expected arguments format
allowed-tools: List of required tools
---
```

**关键特性**:
- 使用 `$ARGUMENTS` 访问命令参数
- 通过 `allowed-tools` 声明所需工具权限
- 支持中文和英文混合文档

### 2. Skills Structure

Skills are located in `skills/[skill-name]/` with a `SKILL.md` entry point:

```yaml
---
name: skill-name
description: What this skill does
allowed-tools: Optional tool restrictions
license: Optional license info
---
```

**Skills 可以包含**:
- `SKILL.md` - 主入口文件，包含技能逻辑和提示词
- `scripts/` - 辅助脚本 (Node.js, Python 等)
- 其他 markdown 文档作为参考资料

**重要 Skills**:
- `gitlab-mr-review`: 需要环境变量 `GITLAB_BASE_URL` 和 `GITLAB_PRIVATE_TOKEN`
- `pdf-skill`: 需要 Python 环境和相关依赖 (pypdf, pdfplumber, reportlab)
- `update-claude-md`: 自动分析 git 历史更新 CLAUDE.md

### 3. Agents Structure

Agents are markdown files with configuration frontmatter in `agents/`:

```yaml
---
name: agent-name
description: When to use this agent
model: sonnet|opus|haiku
color: cyan|purple|green|...
---
```

**设计原则**:
- Agents 包含详细的系统提示词和专业知识
- 通过 Task tool 调用: `subagent_type="agent-name"`
- 每个 agent 针对特定领域优化（TypeScript、Bash、文档等）

## Development Workflow

### Creating New Commands

使用 `/create-command` 命令创建新的斜杠命令:

```bash
/create-command [command-name] [description]
```

该命令会:
1. 分析命令目的和范围
2. 创建带有正确 frontmatter 的命令文件
3. 包含文档、示例和参数处理
4. 验证命令语法和结构

### Creating New Skills

Skills 需要手动创建，遵循以下结构:

1. 在 `skills/` 下创建新目录
2. 添加 `SKILL.md` 文件，包含 frontmatter 和技能逻辑
3. 如需脚本，在 `scripts/` 目录下添加
4. 更新 `.claude-plugin/marketplace.json` 注册 skill

### Testing Skills with Scripts

**GitLab MR Review**:
```bash
# 需要环境变量
export GITLAB_BASE_URL="https://gitlab.com"
export GITLAB_PRIVATE_TOKEN="your-token"

# 测试获取 MR
node skills/gitlab-mr-review/scripts/fetch-mr.js <base-url> <project-path> <mr-iid>

# 测试发布审查
node skills/gitlab-mr-review/scripts/post-review.js <base-url> <project-path> <mr-iid> <review.json>
```

**PDF Processing**:
```bash
# 需要 Python 环境
pip install pypdf pdfplumber reportlab pytesseract pdf2image

# 测试 PDF 表单填充
python skills/pdf-skill/scripts/fill_fillable_fields.py input.pdf output.pdf field_data.json

# 提取表单字段信息
python skills/pdf-skill/scripts/extract_form_field_info.py input.pdf
```

## Plugin Distribution

### Marketplace Configuration

在 `.claude-plugin/marketplace.json` 中配置插件信息:

```json
{
  "name": "claude-code-settings",
  "owner": {
    "name": "Vino",
    "url": "https://github.com/augustVino"
  },
  "metadata": {
    "description": "Claude Code settings, commands and agents for vibe coding",
    "version": "1.2.0"
  },
  "plugins": [...]
}
```

### Version Management

- 版本号遵循语义化版本控制 (Semantic Versioning)
- 同时更新 `marketplace.json` 和 `plugin.json` 中的版本号
- 使用 `/commit` 命令创建版本标签提交

## Commit Conventions

使用 `/commit` 命令执行智能提交:

```bash
/commit           # 快速提交（不运行检查）
/commit --check   # 完整提交流程（包括 lint、build、docs）
```

**Commit 规范**:
- 格式: `<emoji> <type>: <description>`
- 类型: feat, fix, docs, style, refactor, perf, test, chore, etc.
- 标题限制: 70 字符以内
- 自动拆分: 如果变更包含多个不相关逻辑，会建议拆分

**表情符号映射**:
- ✨ feat - 新功能
- 🐛 fix - 错误修复
- 📝 docs - 文档更改
- ♻️ refactor - 代码重构
- 🚚 refactor - 移动/重命名文件
- 🔥 fix - 清理冗余代码
- 🚑️ fix - 紧急修复

## Environment Setup

### Required Environment Variables

**GitLab Integration**:
```bash
GITLAB_BASE_URL          # GitLab instance URL
GITLAB_PRIVATE_TOKEN     # GitLab Personal Access Token (api scope)
```

### Optional Configuration

在 `.claude/settings.local.json` 中配置权限:

```json
{
  "permissions": {
    "allow": [
      "Bash(git reset:*)",
      "Bash(git add:*)",
      "Bash(git commit:*)"
    ]
  }
}
```

## Important Notes

### Skill Development Guidelines

1. **frontmatter 中的 allowed-tools**: 限制 skill 可用的工具，提升安全性
2. **脚本相对路径**: Skills 中的脚本应使用相对路径引用
3. **错误处理**: 所有 skills 应提供清晰的错误信息和建议
4. **语言约定**: 中文项目用中文，英文项目用英文

### Agent Design Principles

1. **专业领域**: 每个 agent 专注于特定技术栈或任务类型
2. **详细提示**: 提供丰富的示例和反例指导
3. **模型选择**: 根据任务复杂度选择 sonnet/opus/haiku
4. **上下文感知**: Agent 可访问项目特定上下文

### Command Best Practices

1. **单一职责**: 每个命令只做一件事
2. **参数验证**: 优雅处理无效或缺失的参数
3. **文档完整**: 包含用法示例和参数说明
4. **遵循约定**: 与现有命令保持一致的风格

## Useful Commands

| Command | Purpose |
|---------|---------|
| `/commit` | 创建符合规范的 Git 提交 |
| `/commit --check` | 带检查的完整提交流程 |
| `/translate` | 翻译技术文章到中文 |
| `/create-command` | 创建新的自定义命令 |

## Troubleshooting

### GitLab MR Review Issues

- **401 Unauthorized**: 检查 `GITLAB_PRIVATE_TOKEN` 是否设置
- **403 Forbidden**: 确认 token 具有足够权限 (api 或 read_api + write_repository)
- **404 Not Found**: 验证 MR URL 格式和项目访问权限

### PDF Skill Issues

- **模块缺失**: 运行 `pip install pypdf pdfplumber reportlab`
- **OCR 失败**: 确保安装了 `pytesseract` 和 `pdf2image`
- **表单填充错误**: 参考 `skills/pdf-skill/forms.md` 获取详细指导

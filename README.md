# Claude Code Settings

Claude Code 配置仓库，包含自定义命令、技能和代理，用于提升 Claude Code 的开发体验。

## 目录

- [项目概述](#项目概述)
- [快速开始](#快速开始)
- [安装指南](#安装指南)
  - [安装整个仓库](#安装整个仓库)
  - [安装单个技能](#安装单个技能)
- [命令使用指南](#命令使用指南)
- [技能使用指南](#技能使用指南)
- [代理说明](#代理说明)
- [开发指南](#开发指南)
- [故障排除](#故障排除)

## 项目概述

本仓库提供三类可复用组件：

- **Commands（命令）**：通过 `/command-name` 调用的斜杠命令
- **Skills（技能）**：通过技能机制调用的专业技能包
- **Agents（代理）**：通过 Task 工具调用的专业领域代理

## 快速开始

### 前置要求

- 已安装 Claude Code CLI
- Node.js（用于某些技能脚本）
- Python 3.x（用于 PDF 和 Nanobanana 技能）

### 基本使用

1. 克隆仓库到本地
2. 将仓库路径添加到 Claude Code 插件路径
3. 使用命令：`/commit`、`/translate` 等
4. 调用技能或代理

## 安装指南

### 安装整个仓库

#### 方式一：通过 Claude Code Marketplace

/

```bash
# 在 Claude Code 中运行
/plugin marketplace add augustVino/claude-code-settings

# Install all of the settings (commands, agents and skills)
/plugin install claude-code-settings

# Install nanobanana-skill only
/plugin install nanobanana-skill
```

#### 方式二：手动安装

1. 克隆仓库：

```bash
git clone https://github.com/augustVino/claude-code-settings.git
cd claude-code-settings
```

2. 配置 Claude Code 识别此仓库：

在项目根目录或用户目录的 `.claude` 配置中添加插件路径：

```json
{
  "plugins": [
    {
      "path": "/path/to/claude-code-settings"
    }
  ]
}
```

### 安装单个技能

如果只需要特定技能，可以单独安装：

```bash
# 方式一：复制到用户配置目录
cp -r skills/gitlab-mr-review ~/.claude/skills/

# 方式二：在项目中创建符号链接
ln -s /path/to/claude-code-settings/skills/pdf-skill .claude/skills/pdf-skill
```

## 命令使用指南

命令是通过 `/command-name` 调用的斜杠命令。

### `/commit` - Git 智能提交

自动创建符合约定式提交规范的 Git 提交。

**使用方法：**

```bash
# 快速提交（不运行检查）
/commit

# 完整提交流程（包括 lint、build、docs）
/commit --check
```

**功能特性：**

- 自动分析代码变更，生成规范的提交消息
- 智能判断是否需要拆分成多个提交
- 自动配上合适的表情符号和提交类型
- 可选的预提交检查（lint、build、generate:docs）

**提交类型示例：**

- ✨ feat: 添加用户认证系统
- 🐛 fix: 解决渲染过程中的内存泄漏
- 📝 docs: 更新 API 文档
- ♻️ refactor: 简化错误处理逻辑
- 🚚 refactor: 移动文件到新目录

**环境依赖：** 无

---

### `/translate` - 技术文章翻译

将英文或日文技术文章翻译成自然流畅的中文。

**使用方法：**

```bash
/translate [要翻译的文本]
```

**功能特性：**

- 保留 Markdown 格式
- 保持技术术语不翻译（AI、LLM、API 等）
- 三步翻译流程：直译 → 问题识别 → 意译优化
- 仅输出最终优化后的中文翻译

**示例：**

```bash
/translate "This article introduces the latest features in TypeScript 5.0"
```

**环境依赖：** 无

---

### `/create-command` - 创建自定义命令

创建新的 Claude Code 自定义命令。

**使用方法：**

```bash
/create-command [命令名称] [描述]
```

**功能特性：**

- 自动生成带有正确 frontmatter 的命令文件
- 包含完整的文档、示例和参数处理
- 验证命令语法和结构

**示例：**

```bash
/create-command review-pr "审查 GitHub PR 并提供反馈"
```

**环境依赖：** 无

---

### `/interview` - 前端面试准备

模拟前端技术面试，提供结构化回答。

**使用方法：**

```bash
# 直接进入面试模式
/interview
```

**功能特性：**

- 模拟真实前端技术面试场景
- 结构化表达：先结论、再原理、后案例
- 涵盖 React、Vue、性能优化、浏览器原理、TypeScript 等
- 使用 STAR 结构回答

**环境依赖：** 无

## 技能使用指南

技能是可调用的专业技能包。

### `gitlab-mr-review` - GitLab MR 代码审查

提供 GitLab Merge Request URL 时自动获取 MR 详情并进行代码审查。

**环境配置：**

配置以下环境变量：

```bash
export GITLAB_BASE_URL="https://gitlab.com"
export GITLAB_PRIVATE_TOKEN="your-gitlab-token"
```

**获取 GitLab Token：**

1. 登录 GitLab
2. 前往 User Settings → Access Tokens
3. 创建 Personal Access Token，选择权限：
   - `api` 或 `read_api` + `write_repository`
4. 复制 token 并设置环境变量

**使用方法：**

在对话中直接提供 GitLab MR URL，Claude 会自动调用此技能：

```
请审查这个 MR：https://gitlab.com/myproject/myrepo/-/merge_requests/123
```

**功能特性：**

- 自动提取 MR 信息和代码变更
- 分析代码质量、最佳实践、架构设计
- 生成结构化审查结果（critical/issue/suggestion）
- 自动发布审查评论到 GitLab

**依赖安装：**

```bash
cd skills/gitlab-mr-review
npm install
```

**脚本说明：**

- `scripts/fetch-mr.js` - 获取 MR 详情
- `scripts/post-review.js` - 发布审查结果

---

### `pdf-skill` - PDF 处理工具包

综合性 PDF 处理工具，支持提取文本/表格、创建 PDF、合并/拆分、填写表单等。

**环境配置：**

安装 Python 依赖：

```bash
cd skills/pdf-skill
pip install pypdf pdfplumber reportlab pytesseract pdf2image
```

可选（用于 OCR）：

```bash
# macOS
brew install tesseract poppler

# Ubuntu/Debian
sudo apt-get install tesseract-ocr poppler-utils

# CentOS/RHEL
sudo yum install tesseract poppler-utils
```

**使用方法：**

在对话中提及 PDF 相关任务，Claude 会自动调用此技能：

```
请帮我提取这个 PDF 中的所有表格
请填写这个 PDF 表单
请将这些 PDF 文件合并
```

**功能特性：**

- **提取文本**：使用 pdfplumber 提取文本和表格
- **创建 PDF**：使用 reportlab 创建新 PDF
- **合并/拆分**：使用 pypdf 操作 PDF 文件
- **填写表单**：支持填写可填充 PDF 表单
- **OCR 支持**：处理扫描版 PDF

**可用脚本：**

- `check_fillable_fields.py` - 检查 PDF 表单字段
- `extract_form_field_info.py` - 提取表单字段信息
- `fill_fillable_fields.py` - 填写 PDF 表单
- `convert_pdf_to_images.py` - 转换 PDF 为图片

**参考文档：**

- `SKILL.md` - 基础使用指南
- `forms.md` - 表单填写详细指南
- `reference.md` - 高级功能参考

---

### `update-claude-md` - 自动更新 CLAUDE.md

基于最近的代码变更自动更新项目的 CLAUDE.md 文件。

**环境配置：**

项目必须是 Git 仓库。

**使用方法：**

在对话中调用：

```
请更新 CLAUDE.md 文件
帮我根据最近的变更更新项目文档
```

**功能特性：**

- 分析最近 10 次提交的变更
- 识别新功能、API 变更、配置更新
- 智能更新 CLAUDE.md 各个章节
- 保留重要的现有内容

**分析内容：**

- Git 状态和最近提交
- 新增/删除/修改的文件
- Package.json、配置文件变更
- API/路由变更
- 数据库/模型变更

**环境依赖：** Git

---

### `typescript-advanced-types` - TypeScript 高级类型

TypeScript 高级类型系统的综合指南，包括泛型、条件类型、映射类型、模板字面量类型等。

**环境配置：** 无需特殊配置

**使用方法：**

在对话中提及 TypeScript 类型相关问题：

```
如何创建一个类型安全的事件发射器？
帮我设计一个 Builder 模式的类型
如何实现深度 Readonly 类型？
```

**涵盖内容：**

- 泛型（Generics）
- 条件类型（Conditional Types）
- 映射类型（Mapped Types）
- 模板字面量类型（Template Literal Types）
- 工具类型（Utility Types）
- 高级模式（Event Emitter、API Client、Builder Pattern 等）

**适用场景：**

- 构建类型安全的库或框架
- 创建可复用的泛型组件
- 实现复杂的类型推断逻辑
- 设计类型安全的 API 客户端
- 构建表单验证系统

**环境依赖：** 无

---

### `nanobanana-skill` - 图片生成

使用 Google Gemini API 生成或编辑图片。

**环境配置：**

1. 获取 Google Gemini API Key：

   - 访问 https://aistudio.google.com/apikey
   - 创建 API Key

2. 配置环境变量：

```bash
export GEMINI_API_KEY="your-api-key"
```

或创建配置文件：

```bash
echo "GEMINI_API_KEY=your-api-key" > ~/.nanobanana.env
```

3. 安装 Python 依赖：

```bash
cd skills/nanobanana-skill
pip install -r requirements.txt
```

**使用方法：**

```
请帮我生成一张山景图片
请生成一张 1024x1024 的科技公司 logo
请在这张图片的天空中添加彩虹
```

**支持的尺寸：**

- `1024x1024` (1:1) - 正方形
- `832x1248` (2:3) - 竖版
- `1248x832` (3:2) - 横版
- `768x1344` (9:16) - 竖版（默认）
- `1344x768` (16:9) - 横版
- `1536x672` (21:9) - 超宽屏

**支持的模型：**

- `gemini-3-pro-image-preview`（默认）- 更高质量
- `gemini-2.5-flash-image` - 更快速度

**分辨率选项：**

- `1K`（默认）
- `2K`
- `4K`

**环境依赖：**

- Python 3.x
- google-genai
- Pillow
- python-dotenv

## 代理说明

代理是专业领域的专家，通过 Task 工具自动调用。

### 可用代理

#### `typescript-architect`

**专长：** TypeScript 高级类型系统、泛型设计、企业级架构模式

**使用场景：**

- 复杂泛型约束的工具函数
- MobX store 实现的类型优化
- 受控/非受控模式的条件类型
- 深度合并工具函数的类型推断

**自动调用：** Claude 检测到复杂 TypeScript 类型问题时自动使用

---

#### `bash-script-master`

**专长：** 生产级 Bash 脚本、CI/CD 流水线、自动化任务

**使用场景：**

- 部署脚本编写
- CI/CD 流水线脚本
- 系统自动化任务
- 备份脚本审查

**自动调用：** Claude 需要编写或审查 Bash 脚本时自动使用

---

#### `codebase-doc-writer`

**专长：** 从代码库生成综合技术文档

**使用场景：**

- 系统架构指南
- 技术手册编写
- API 文档生成
- 新人入职文档

**自动调用：** Claude 需要生成详细文档时自动使用

---

#### `design-system-expert`

**专长：** 设计系统架构、无障碍访问审计、设计令牌实现

**使用场景：**

- 组件库可访问性审查
- 设计令牌系统建立
- UI 组件设计指导

**自动调用：** Claude 处理设计系统相关任务时自动使用

---

#### `prompt-engineering-expert`

**专长：** LLM 提示词设计和优化

**使用场景：**

- 设计或优化 LLM 提示词
- 审查和改进现有提示词
- 创建多代理提示词系统
- 调试问题提示词

**自动调用：** Claude 需要优化提示词时自动使用

## 开发指南

### 创建新命令

使用 `/create-command`：

```bash
/create-command my-command "我的命令描述"
```

或手动创建：

1. 在 `commands/` 目录下创建 `my-command.md`
2. 添加 YAML frontmatter：

```yaml
---
description: 简要描述
argument-hint: 期望的参数格式
allowed-tools: 所需工具列表
---
```

3. 编写命令逻辑，使用 `$ARGUMENTS` 访问参数

### 创建新技能

1. 在 `skills/` 目录下创建新目录：

```bash
mkdir skills/my-skill
```

2. 创建 `SKILL.md` 文件：

```yaml
---
name: my-skill
description: 此技能的功能
allowed-tools: 可选的工具限制
---
```

3. 添加技能逻辑和文档
4. 如需脚本，在 `scripts/` 目录下添加
5. 更新 `.claude-plugin/marketplace.json` 注册技能

### 创建新代理

1. 在 `agents/` 目录下创建 `my-agent.md`
2. 添加配置 frontmatter：

```yaml
---
name: my-agent
description: 何时使用此代理
model: sonnet|opus|haiku
color: cyan|purple|green|...
---
```

3. 编写详细的系统提示词和专业知识

### 版本管理

更新版本时需要同时修改：

- `.claude-plugin/plugin.json` - `version` 字段
- `.claude-plugin/marketplace.json` - `metadata.version` 字段

遵循语义化版本控制：

- `MAJOR.MINOR.PATCH`
- 破坏性变更：增加 MAJOR
- 新功能：增加 MINOR
- 错误修复：增加 PATCH

### 提交规范

使用 `/commit` 命令创建规范提交：

- 格式：`<emoji> <type>: <description>`
- 标题限制：70 字符以内
- 类型：feat、fix、docs、refactor、test、chore 等

## 故障排除

### GitLab MR Review 问题

**401 Unauthorized**

- 检查 `GITLAB_PRIVATE_TOKEN` 是否正确设置
- 验证 token 是否过期

**403 Forbidden**

- 确认 token 具有足够权限（api 或 read_api + write_repository）
- 检查项目访问权限

**404 Not Found**

- 验证 MR URL 格式是否正确
- 确认项目路径和 MR IID 正确

### PDF Skill 问题

**模块缺失**

```bash
pip install pypdf pdfplumber reportlab
```

**OCR 失败**

- macOS: `brew install tesseract poppler`
- Ubuntu: `sudo apt-get install tesseract-ocr poppler-utils`

**表单填充错误**

参考 `skills/pdf-skill/forms.md` 获取详细指导

### Nanobanana Skill 问题

**GEMINI_API_KEY 未设置**

```bash
export GEMINI_API_KEY="your-api-key"
```

或创建 `~/.nanobanana.env`：

```bash
echo "GEMINI_API_KEY=your-api-key" > ~/.nanobanana.env
```

**图片生成失败**

- 使图片描述更具体
- 尝试不同的分辨率（1K → 2K）
- 切换模型（gemini-3-pro-image-preview ↔ gemini-2.5-flash-image）

### 通用问题

**命令不可用**

- 确认仓库路径已添加到 Claude Code 配置
- 检查命令文件的 frontmatter 格式
- 验证 `allowed-tools` 权限设置

**技能不工作**

- 检查技能目录结构（必须有 `SKILL.md`）
- 验证 frontmatter 中的 `name` 字段
- 确认依赖已安装

**代理未被调用**

- 代理由 Claude 自动判断调用
- 确保任务描述清晰且匹配代理的使用场景
- 检查代理配置文件的 frontmatter

## 许可证

MIT License

## 贡献

欢迎提交 Issues 和 Pull Requests！

## 作者

**Vino** - [GitHub](https://github.com/augustVino)

## 相关链接

- [Claude Code 文档](https://docs.anthropic.com/claude/docs)
- [Claude Code Marketplace](https://marketplace.claude.ai)
- [问题反馈](https://github.com/augustVino/claude-code-settings/issues)

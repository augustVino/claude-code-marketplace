#!/usr/bin/env node

/**
 * GitLab Review Poster - 发布代码审查结果到 GitLab
 *
 * 用法: node post-review.js <gitlab-base-url> <project-path> <mr-iid> <review-json-file>
 *
 * 示例: node post-review.js https://gitlab.com my-group/my-project 123 review.json
 *
 * review.json 格式:
 * {
 *   "highLevelSummary": "...",
 *   "findings": [...],
 *   "testingGuidance": "...",
 *   "risks": [...]
 * }
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// 解析命令行参数
const [, , baseUrl, projectPath, mrIid, reviewJsonFile] = process.argv;

if (!baseUrl || !projectPath || !mrIid || !reviewJsonFile) {
  console.error('错误: 缺少必需参数');
  console.error(
    '用法: node post-review.js <gitlab-base-url> <project-path> <mr-iid> <review-json-file>'
  );
  console.error('示例: node post-review.js https://gitlab.com my-group/my-project 123 review.json');
  process.exit(1);
}

// 获取环境变量
const token = process.env.GITLAB_PRIVATE_TOKEN;
if (!token) {
  console.error('错误: 未设置 GITLAB_PRIVATE_TOKEN 环境变量');
  console.error('请设置: export GITLAB_PRIVATE_TOKEN="your-token"');
  process.exit(1);
}

// 读取审查结果
let reviewResult;
try {
  const content = fs.readFileSync(reviewJsonFile, 'utf8');
  reviewResult = JSON.parse(content);
} catch (error) {
  console.error('错误: 无法读取审查结果文件:', error.message);
  process.exit(1);
}

// URL 编码项目路径
const encodedProjectPath = encodeURIComponent(projectPath);

// Claude 审查标识
const CLAUDE_SIGNATURE = '由 Claude Code Review Skill 自动生成';

/**
 * 发起 GitLab API 请求
 */
function gitlabRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'PRIVATE-TOKEN': token,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : null);
          } catch (e) {
            resolve(null);
          }
        } else {
          reject(new Error(`GitLab API 请求失败 (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`网络请求失败: ${e.message}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * 检查是否已存在 Claude 审查评论
 */
async function checkExistingReview() {
  try {
    const discussionsPath = `/api/v4/projects/${encodedProjectPath}/merge_requests/${mrIid}/discussions?per_page=100`;
    const discussions = await gitlabRequest(discussionsPath);

    for (const discussion of discussions) {
      for (const note of discussion.notes) {
        if (note.body && note.body.includes(CLAUDE_SIGNATURE)) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    // 检查失败时继续发布
    console.error('警告: 检查已有评论失败，继续发布:', error.message);
    return false;
  }
}

/**
 * 构建总结评论 Markdown
 */
function buildSummaryComment(review) {
  const critical = review.findings.filter((f) => f.severity === 'critical').length;
  const issues = review.findings.filter((f) => f.severity === 'issue').length;
  const suggestions = review.findings.filter((f) => f.severity === 'suggestion').length;

  let markdown = `## 🤖 Code Review by Claude\n\n`;
  markdown += `### 总结\n\n${review.highLevelSummary}\n\n`;

  // 发现统计
  if (review.findings.length > 0) {
    markdown += `### 发现\n\n`;
    markdown += `- 🔴 严重问题: ${critical}\n`;
    markdown += `- 🟡 一般问题: ${issues}\n`;
    markdown += `- 🟢 建议: ${suggestions}\n\n`;

    // 详细发现列表
    markdown += `### 详细发现\n\n`;
    review.findings.forEach((finding, index) => {
      const severityIcon =
        finding.severity === 'critical' ? '🔴' : finding.severity === 'issue' ? '🟡' : '🟢';

      markdown += `#### ${severityIcon} ${index + 1}. ${finding.title}\n\n`;
      markdown += `**文件**: \`${finding.path}\``;

      if (finding.line) {
        markdown += `:${finding.line}`;
      }

      markdown += `\n\n**描述**: ${finding.summary}\n\n`;

      if (finding.suggestion) {
        markdown += `**建议**: ${finding.suggestion}\n\n`;
      }

      markdown += `---\n\n`;
    });
  } else {
    markdown += `### 发现\n\n✅ 未发现明显问题\n\n`;
  }

  // 测试指导
  if (review.testingGuidance) {
    markdown += `### 测试指导\n\n${review.testingGuidance}\n\n`;
  }

  // 风险
  if (review.risks && review.risks.length > 0) {
    markdown += `### 潜在风险\n\n`;
    review.risks.forEach((risk) => {
      markdown += `- ⚠️ ${risk}\n`;
    });
    markdown += `\n`;
  }

  markdown += `---\n*${CLAUDE_SIGNATURE}*`;

  return markdown;
}

/**
 * 构建行内评论 Markdown
 */
function buildInlineComment(finding) {
  const severityIcon =
    finding.severity === 'critical' ? '🔴' : finding.severity === 'issue' ? '🟡' : '🟢';
  const severityText =
    finding.severity === 'critical' ? '严重问题' : finding.severity === 'issue' ? '问题' : '建议';

  let markdown = `${severityIcon} **${severityText}**: ${finding.title}\n\n`;
  markdown += `**位置**: \`${finding.path}\``;

  if (finding.line) {
    markdown += `:${finding.line}`;
  }

  markdown += `\n\n${finding.summary}\n\n`;

  if (finding.suggestion) {
    markdown += `**建议**: ${finding.suggestion}\n`;
  }

  return markdown;
}

/**
 * 主函数
 */
async function main() {
  try {
    // 1. 获取 MR 详情（包含 diff_refs）
    console.log('获取 MR 详情...');
    const mrPath = `/api/v4/projects/${encodedProjectPath}/merge_requests/${mrIid}`;
    const mr = await gitlabRequest(mrPath);

    // 检查是否有 diff_refs（行内评论所需）
    if (!mr.diff_refs) {
      console.error('警告: MR 没有 diff_refs 信息，无法发布行内评论');
    }

    // 2. 检查是否已有审查评论
    console.log('检查是否已有 Claude 审查评论...');
    const hasExisting = await checkExistingReview();

    if (hasExisting) {
      console.log('✓ 已存在 Claude 审查评论，跳过发布避免重复');
      console.log(`MR URL: ${baseUrl}/${projectPath}/merge_requests/${mrIid}`);
      return;
    }

    // 3. 发布总结评论
    console.log('发布总结评论...');
    const summaryComment = buildSummaryComment(reviewResult);
    const discussionsPath = `/api/v4/projects/${encodedProjectPath}/merge_requests/${mrIid}/discussions`;

    const summaryDiscussion = await gitlabRequest(discussionsPath, 'POST', {
      body: summaryComment
    });

    const summaryUrl = `${baseUrl}/${projectPath}/merge_requests/${mrIid}#note_${summaryDiscussion.notes[0].id}`;
    console.log(`✓ 总结评论已发布: ${summaryUrl}`);

    // 4. 发布行内评论
    const inlineComments = reviewResult.findings.filter((f) => f.line && f.line > 0);

    if (inlineComments.length > 0 && mr.diff_refs) {
      console.log(`发布 ${inlineComments.length} 条行内评论...`);

      for (const finding of inlineComments) {
        const inlineComment = buildInlineComment(finding);

        // 构建 position 参数（这是行内评论的关键）
        const position = {
          position_type: 'text',
          base_sha: mr.diff_refs.base_sha,
          start_sha: mr.diff_refs.start_sha,
          head_sha: mr.diff_refs.head_sha,
          new_path: finding.path,
          new_line: finding.line
        };

        const discussion = await gitlabRequest(discussionsPath, 'POST', {
          body: inlineComment,
          position: position
        });

        const commentUrl = `${baseUrl}/${projectPath}/merge_requests/${mrIid}#note_${discussion.notes[0].id}`;
        console.log(`✓ 行内评论已发布 (${finding.path}:${finding.line}): ${commentUrl}`);
      }
    } else if (inlineComments.length > 0 && !mr.diff_refs) {
      console.log('⚠️  跳过行内评论（缺少 diff_refs 信息）');
    }

    // 5. 输出结果
    console.log('\n✅ 代码审查结果已成功发布到 GitLab!');
    console.log(`\n总结:`);
    console.log(`- 总评论数: ${1 + (mr.diff_refs ? inlineComments.length : 0)}`);
    console.log(`- 总结评论: 1`);
    console.log(`- 行内评论: ${mr.diff_refs ? inlineComments.length : 0}`);
    console.log(`\n查看审查结果: ${baseUrl}/${projectPath}/merge_requests/${mrIid}`);
  } catch (error) {
    console.error('错误:', error.message);

    // 提供有用的错误提示
    if (error.message.includes('401')) {
      console.error('\n提示: 认证失败，请检查 GITLAB_PRIVATE_TOKEN 是否正确');
    } else if (error.message.includes('403')) {
      console.error('\n提示: 权限不足，请检查令牌权限（需要 api 或 write_repository 权限）');
    } else if (error.message.includes('404')) {
      console.error('\n提示: MR 未找到，请检查项目路径和 MR IID 是否正确');
    } else if (error.message.includes('429')) {
      console.error('\n提示: API 请求频率超限，请稍后重试');
    }

    process.exit(1);
  }
}

main();

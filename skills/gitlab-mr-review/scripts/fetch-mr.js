#!/usr/bin/env node

/**
 * GitLab MR Fetcher - 获取 MR 详情和代码变更
 *
 * 用法: node fetch-mr.js <gitlab-base-url> <project-path> <mr-iid>
 *
 * 示例: node fetch-mr.js https://gitlab.com my-group/my-project 123
 *
 * 输出: JSON 格式的 MR 上下文
 */

const https = require('https');
const http = require('http');

// 解析命令行参数
const [, , baseUrl, projectPath, mrIid] = process.argv;

if (!baseUrl || !projectPath || !mrIid) {
  console.error('错误: 缺少必需参数');
  console.error('用法: node fetch-mr.js <gitlab-base-url> <project-path> <mr-iid>');
  console.error('示例: node fetch-mr.js https://gitlab.com my-group/my-project 123');
  process.exit(1);
}

// 获取环境变量
const token = process.env.GITLAB_PRIVATE_TOKEN;
if (!token) {
  console.error('错误: 未设置 GITLAB_PRIVATE_TOKEN 环境变量');
  console.error('请设置: export GITLAB_PRIVATE_TOKEN="your-token"');
  process.exit(1);
}

// URL 编码项目路径
const encodedProjectPath = encodeURIComponent(projectPath);

/**
 * 发起 GitLab API 请求
 */
function gitlabRequest(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'PRIVATE-TOKEN': token,
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
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`解析响应失败: ${e.message}`));
          }
        } else {
          reject(new Error(`GitLab API 请求失败 (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(new Error(`网络请求失败: ${e.message}`));
    });

    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  try {
    // 1. 获取 MR 详情
    const mrPath = `/api/v4/projects/${encodedProjectPath}/merge_requests/${mrIid}`;
    const mr = await gitlabRequest(mrPath);

    // 2. 获取 MR 变更（包含 diff）
    const changesPath = `/api/v4/projects/${encodedProjectPath}/merge_requests/${mrIid}/changes`;
    const changes = await gitlabRequest(changesPath);

    // 3. 统计 diff
    let additions = 0;
    let deletions = 0;

    changes.changes.forEach((change) => {
      const lines = change.diff.split('\n');
      lines.forEach((line) => {
        if (line.startsWith('+') && !line.startsWith('+++')) additions++;
        if (line.startsWith('-') && !line.startsWith('---')) deletions++;
      });
    });

    // 4. 构建 MR 上下文
    const context = {
      title: mr.title,
      description: mr.description || '',
      author: mr.author.username,
      sourceBranch: mr.source_branch,
      targetBranch: mr.target_branch,
      webUrl: mr.web_url,
      changes: changes.changes.map((c) => ({
        oldPath: c.old_path,
        newPath: c.new_path,
        diff: c.diff,
        newFile: c.new_file,
        deletedFile: c.deleted_file,
        renamedFile: c.renamed_file
      })),
      diffStats: {
        additions,
        deletions,
        totalFiles: changes.changes.length
      }
    };

    // 输出 JSON
    console.log(JSON.stringify(context, null, 2));
  } catch (error) {
    console.error('错误:', error.message);

    // 提供有用的错误提示
    if (error.message.includes('401')) {
      console.error('\n提示: 认证失败，请检查 GITLAB_PRIVATE_TOKEN 是否正确');
    } else if (error.message.includes('403')) {
      console.error('\n提示: 权限不足，请检查令牌权限（需要 api 或 read_api 权限）');
    } else if (error.message.includes('404')) {
      console.error('\n提示: MR 未找到，请检查项目路径和 MR IID 是否正确');
    } else if (error.message.includes('429')) {
      console.error('\n提示: API 请求频率超限，请稍后重试');
    }

    process.exit(1);
  }
}

main();

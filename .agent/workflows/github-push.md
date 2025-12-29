---
description: Push code to GitHub remote repository
---

# GitHub Push Workflow

This workflow pushes local commits to the GitHub remote repository.

## Prerequisites

- Git configured with user name and email
- GitHub token available in `.agent/config.secure.json`

## Steps

// turbo-all

1. **Read GitHub credentials**

```bash
cd /media/kayson/F0001DC5001D9426/Coding/Assignments/xiaoyuanbao
GITHUB_TOKEN=$(cat .agent/config.secure.json | grep -o '"github_token": "[^"]*"' | cut -d'"' -f4)
REMOTE_URL=$(cat .agent/config.secure.json | grep -o '"remote_url": "[^"]*"' | cut -d'"' -f4)
echo "Remote URL: $REMOTE_URL"
```

2. **Configure Git user (if not set)**

```bash
git config user.name "KaysonSear"
git config user.email "kaysonsear@163.com"
```

3. **Check current remote**

```bash
git remote -v
```

4. **Add or update remote origin with token**

```bash
# Remove existing origin if present
git remote remove origin 2>/dev/null || true

# Add remote with embedded token for authentication
GITHUB_TOKEN=$(cat .agent/config.secure.json | grep -o '"github_token": "[^"]*"' | cut -d'"' -f4)
git remote add origin "https://${GITHUB_TOKEN}@github.com/KaysonSear/xiaoyuanbao.git"
```

5. **Push to GitHub**

```bash
git push -u origin main
```

6. **Verify push**

```bash
git log --oneline -3
git remote -v
```

## Troubleshooting

- If push fails with 403, the token may have expired
- If push fails with 404, the repository may not exist on GitHub
- Create the repository at: https://github.com/new

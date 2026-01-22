# GitHub Environments & CI/CD Configuration

Configuration guide for GitHub Environments, secrets, and variables used in CI/CD pipelines.

## Overview

| Property | Value |
|----------|-------|
| Location | GitHub Repository Settings > Environments |
| Workflows | `.github/workflows/cd.yml`, `.github/workflows/ci.yml` |
| Purpose | Environment-specific deployment configuration |

## GitHub Environments

GitHub Environments provide isolated configuration for each deployment target. Secrets and variables are scoped to environments, automatically injected when a job declares `environment: <name>`.

### Required Environments

Create these environments in **Repository Settings > Environments**:

| Environment | Branch Restriction | Protection Rules |
|-------------|-------------------|------------------|
| `dev` | `develop` (optional) | None |
| `staging` | `staging` (optional) | Optional: require approval |
| `production` | `main` (recommended) | Recommended: require approval |

## Environment Secrets

Secrets are encrypted and only exposed to workflows running in the specified environment.

### Per-Environment Secrets

Each environment (`dev`, `staging`, `production`) needs these secrets:

| Secret | Description | Example |
|--------|-------------|---------|
| `FIREBASE_TOKEN` | Firebase CI token | `1//0eXXXX...` |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase service account JSON | `{"type": "service_account"...}` |
| `VERCEL_TOKEN` | Vercel deployment token (if using Vercel) | `xxx` |
| `VERCEL_ORG_ID` | Vercel organization ID | `xxx` |
| `VERCEL_PROJECT_ID` | Vercel project ID | `xxx` |

### Repository-Level Secrets (Shared)

These secrets are shared across all environments and should be configured at the repository level:

| Secret | Description | Required |
|--------|-------------|----------|
| `SLACK_WEBHOOK_URL` | Slack webhook for deployment notifications | Optional |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token | Optional |
| `TURBO_TOKEN` | Turborepo remote cache token | Optional |
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions | Auto |

## Environment Variables

Variables are not encrypted and can be used for non-sensitive configuration.

### Per-Environment Variables

Each environment needs these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `ENVIRONMENT_URL` | Base URL for the environment | `https://dev.echomodel.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `echomodel-dev` |

### Repository-Level Variables (Shared)

| Variable | Description | Example |
|----------|-------------|---------|
| `TURBO_TEAM` | Turborepo team name | `echomodel` |
| `SENTRY_ORG` | Sentry organization | `echomodel` |
| `SENTRY_PROJECT` | Sentry project name | `echomodel-dashboard` |

## Branch to Environment Mapping

The CD workflow automatically determines the target environment based on the branch:

| Branch | Environment | Trigger |
|--------|-------------|---------|
| `main` | `production` | Push |
| `staging` | `staging` | Push |
| `develop` | `dev` | Push |
| Manual | Any | `workflow_dispatch` |

## Setup Instructions

### 1. Create Environments

1. Go to **Repository Settings** > **Environments**
2. Click **New environment**
3. Create each environment: `dev`, `staging`, `production`

### 2. Configure Protection Rules (Production)

For `production`:

1. Click on the environment
2. Enable **Required reviewers** and add approvers
3. Enable **Restrict branches** and add `main`
4. Optionally enable **Wait timer** for deployment delays

### 3. Add Secrets to Each Environment

For each environment (`dev`, `staging`, `production`):

1. Click on the environment
2. Under **Environment secrets**, click **Add secret**
3. Add:
   - `FIREBASE_TOKEN`
   - `FIREBASE_SERVICE_ACCOUNT`
   - `VERCEL_TOKEN` (if using Vercel)
   - `VERCEL_ORG_ID` (if using Vercel)
   - `VERCEL_PROJECT_ID` (if using Vercel)

### 4. Add Variables to Each Environment

1. Under **Environment variables**, click **Add variable**
2. Add `ENVIRONMENT_URL` with the appropriate URL:
   - `dev`: `https://dev.echomodel.com`
   - `staging`: `https://staging.echomodel.com`
   - `production`: `https://echomodel.com`

### 5. Add Repository-Level Secrets

1. Go to **Repository Settings** > **Secrets and variables** > **Actions**
2. Under **Repository secrets**, add:
   - `SLACK_WEBHOOK_URL`
   - `SENTRY_AUTH_TOKEN`
   - `TURBO_TOKEN`

### 6. Add Repository-Level Variables

1. Under **Repository variables**, add:
   - `TURBO_TEAM`
   - `SENTRY_ORG`
   - `SENTRY_PROJECT`

## Firebase Setup

### Generate Firebase Token

```bash
# Login and generate CI token
firebase login:ci
```

### Generate Service Account

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings > Service accounts
3. Generate new private key
4. Copy the JSON content to `FIREBASE_SERVICE_ACCOUNT` secret

## Workflow Usage

### How Environments Are Used in CD Workflow

```yaml
deploy:
  environment:
    name: ${{ needs.pre-deployment.outputs.environment }}
    url: ${{ vars.ENVIRONMENT_URL }}
  steps:
    - name: Deploy to Firebase
      env:
        FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
      run: firebase deploy --project ${{ vars.FIREBASE_PROJECT_ID }}
```

### Manual Deployment

Trigger a manual deployment via GitHub Actions:

1. Go to **Actions** > **Continuous Deployment Pipeline**
2. Click **Run workflow**
3. Select:
   - **Target environment**: `dev`, `staging`, or `production`
   - **Force deployment**: Check to skip change detection

## Troubleshooting

### Secrets Not Found

If you see errors like `Error: Input required and not supplied`:

1. Verify the secret exists in the correct environment
2. Check the job has `environment: <name>` declared
3. Ensure the secret name matches exactly (case-sensitive)

### Environment Not Found

If deployment fails with environment errors:

1. Verify the environment exists in repository settings
2. Check branch protection rules allow the current branch
3. Verify required reviewers have approved (for protected environments)

### Firebase Deployment Fails

If Firebase deployment fails:

1. Verify `FIREBASE_TOKEN` is valid
2. Check Firebase project exists
3. Verify user has deployment permissions

## Security Best Practices

1. **Rotate credentials regularly**: Update Firebase tokens periodically
2. **Use environment protection**: Require approvals for production
3. **Limit branch access**: Restrict which branches can deploy to production
4. **Audit access**: Review who has access to modify secrets
5. **Separate projects**: Use different Firebase projects for each environment

## Related Documentation

- [Deployment Guide](./deployment.md)
- [Environment Variables (App)](../configuration/environment.md)

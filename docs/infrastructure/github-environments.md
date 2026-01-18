# GitHub Environments & CI/CD Configuration

Configuration guide for GitHub Environments, secrets, and variables used in CI/CD pipelines.

## Overview

| Property | Value |
|----------|-------|
| Location | GitHub Repository Settings > Environments |
| Workflows | `.github/workflows/cd.yml`, `.github/workflows/ci.yml` |
| Actions | `.github/actions/deploy/action.yml` |
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
| `dev-web` | `develop` (optional) | None |
| `staging-web` | `staging` (optional) | Optional: require approval |
| `production-web` | `main` (recommended) | Recommended: require approval |
| `dev-lambdas` | `develop` (optional) | None |
| `staging-lambdas` | `staging` (optional) | Optional: require approval |
| `production-lambdas` | `main` (recommended) | Recommended: require approval |

## Environment Secrets

Secrets are encrypted and only exposed to workflows running in the specified environment.

### Per-Environment Secrets

Each environment (`dev`, `staging`, `production` and their variants) needs these secrets:

| Secret | Description | Example |
|--------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_ACCOUNT_ID` | AWS account number | `123456789012` |
| `FIREBASE_TOKEN` | Firebase CI token (if using Firebase) | `1//0eXXXX...` |

### Repository-Level Secrets (Shared)

These secrets are shared across all environments and should be configured at the repository level:

| Secret | Description | Required |
|--------|-------------|----------|
| `SLACK_WEBHOOK_URL` | Slack webhook for deployment notifications | Optional |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token | Optional |
| `TURBO_TOKEN` | Turborepo remote cache token | Optional |
| `NPM_TOKEN` | NPM publish token (for releases) | Optional |
| `GITHUB_TOKEN` | Automatically provided by GitHub Actions | Auto |

## Environment Variables

Variables are not encrypted and can be used for non-sensitive configuration.

### Per-Environment Variables

Each environment needs these variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `ENVIRONMENT_URL` | Base URL for the environment | `https://dev.foundry.com` |

### Repository-Level Variables (Shared)

| Variable | Description | Example |
|----------|-------------|---------|
| `TURBO_TEAM` | Turborepo team name | `foundry` |
| `SENTRY_ORG` | Sentry organization | `foundry` |
| `SENTRY_PROJECT` | Sentry project name | `foundry-api` |

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
3. Create each environment: `dev`, `staging`, `production`, `dev-web`, `staging-web`, `production-web`, `dev-lambdas`, `staging-lambdas`, `production-lambdas`

### 2. Configure Protection Rules (Production)

For `production`, `production-web`, and `production-lambdas`:

1. Click on the environment
2. Enable **Required reviewers** and add approvers
3. Enable **Restrict branches** and add `main`
4. Optionally enable **Wait timer** for deployment delays

### 3. Add Secrets to Each Environment

For each environment (`dev`, `staging`, `production`):

1. Click on the environment
2. Under **Environment secrets**, click **Add secret**
3. Add:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_ACCOUNT_ID`
   - `FIREBASE_TOKEN` (if applicable)

### 4. Add Variables to Each Environment

1. Under **Environment variables**, click **Add variable**
2. Add `ENVIRONMENT_URL` with the appropriate URL:
   - `dev`: `https://dev.foundry.com`
   - `staging`: `https://staging.foundry.com`
   - `production`: `https://foundry.com`

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

## AWS IAM Requirements

Each environment's AWS credentials should have appropriate permissions:

### Dev Environment
- Full access to dev AWS account resources
- CDK deployment permissions
- Lambda management
- API Gateway management
- RDS/Database access

### Staging Environment
- Full access to staging AWS account resources
- Same as dev with staging account

### Production Environment
- Full access to production AWS account resources
- Same as dev with production account
- Consider using AWS IAM roles with OIDC for enhanced security

### Recommended IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "lambda:*",
        "apigateway:*",
        "iam:*",
        "s3:*",
        "logs:*",
        "rds:*",
        "ec2:*",
        "secretsmanager:*",
        "ssm:*"
      ],
      "Resource": "*"
    }
  ]
}
```

> **Note**: For production, consider using more restrictive policies based on the principle of least privilege.

## Workflow Usage

### How Environments Are Used in CD Workflow

```yaml
# Job declares the environment
deploy-infrastructure:
  environment:
    name: ${{ needs.pre-deployment.outputs.environment }}
    url: ${{ vars.ENVIRONMENT_URL }}
  steps:
    - name: Deploy
      uses: ./.github/actions/deploy
      with:
        # Secrets are automatically scoped to the environment
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-account-id: ${{ secrets.AWS_ACCOUNT_ID }}
        environment-url: ${{ vars.ENVIRONMENT_URL }}
```

### Manual Deployment

Trigger a manual deployment via GitHub Actions:

1. Go to **Actions** > **Continuous Deployment Pipeline**
2. Click **Run workflow**
3. Select:
   - **Target environment**: `dev`, `staging`, or `production`
   - **Component to deploy**: `all`, `web`, `lambdas`, or `infrastructure`
   - **Force deployment**: Check to skip change detection

## Troubleshooting

### Secrets Not Found

If you see errors like `Error: Input required and not supplied: aws-access-key-id`:

1. Verify the secret exists in the correct environment
2. Check the job has `environment: <name>` declared
3. Ensure the secret name matches exactly (case-sensitive)

### Environment Not Found

If deployment fails with environment errors:

1. Verify the environment exists in repository settings
2. Check branch protection rules allow the current branch
3. Verify required reviewers have approved (for protected environments)

### Permission Denied

If AWS operations fail:

1. Verify the AWS credentials are valid
2. Check IAM policy has required permissions
3. Verify the credentials belong to the correct AWS account

## Security Best Practices

1. **Rotate credentials regularly**: Update AWS access keys every 90 days
2. **Use environment protection**: Require approvals for production
3. **Limit branch access**: Restrict which branches can deploy to production
4. **Audit access**: Review who has access to modify secrets
5. **Consider OIDC**: Use AWS OIDC provider instead of long-lived credentials
6. **Separate accounts**: Use different AWS accounts for each environment

## Related Documentation

- [Deployment Guide](./deployment.md)
- [LocalStack Development](./localstack.md)
- [Environment Variables (App)](../configuration/environment.md)

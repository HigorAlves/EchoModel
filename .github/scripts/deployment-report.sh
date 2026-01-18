#!/usr/bin/env bash
# deployment-report.sh - Deployment pipeline report generator
# Generates standardized reports for deployment operations

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the report utilities
source "$SCRIPT_DIR/report-utils.sh"

# Default values
REPORT_DIR="${REPORT_DIR:-deployment-reports}"
ENVIRONMENT="${ENVIRONMENT:-staging}"
COMPONENT="${COMPONENT:-all}"

# P1: DR-2 - Validate required environment variables
_validate_deployment_env() {
    local env="${1:-$ENVIRONMENT}"
    case "$env" in
        production|staging|development|local) return 0 ;;
        *)
            log_warning "Unknown ENVIRONMENT '$env', defaulting to 'staging'"
            ENVIRONMENT="staging"
            return 0
            ;;
    esac
}

# P2: DR-3 - Deployment timing
declare -g _DEPLOYMENT_START_TIME=""
declare -g _DEPLOYMENT_END_TIME=""

# Start deployment timer
start_deployment_timer() {
    _DEPLOYMENT_START_TIME=$(date +%s)
}

# End deployment timer and get duration
end_deployment_timer() {
    _DEPLOYMENT_END_TIME=$(date +%s)
}

# Get deployment duration in human-readable format
get_deployment_duration() {
    if [ -z "$_DEPLOYMENT_START_TIME" ] || [ -z "$_DEPLOYMENT_END_TIME" ]; then
        echo "N/A"
        return
    fi
    local duration=$((_DEPLOYMENT_END_TIME - _DEPLOYMENT_START_TIME))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    echo "${minutes}m ${seconds}s"
}

# P2: DR-4 - Generate artifact links
get_artifact_url() {
    local artifact_name="$1"
    if [ -n "${GITHUB_RUN_ID:-}" ] && [ -n "${GITHUB_REPOSITORY:-}" ]; then
        echo "https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}#artifacts"
    else
        echo "N/A"
    fi
}

# Initialize deployment report
init_deployment_report() {
    local report_file="$REPORT_DIR/deployment-report.md"
    init_report "$report_file" "Deployment Report" "Continuous Deployment"

    echo "🚀 Deployment report initialized: $report_file"
}

# Add deployment component result
# Usage: add_component_deployment <component-name> <result> [details] [url]
add_component_deployment() {
    local component="$1"
    local result="$2"
    local details="${3:-}"
    local url="${4:-}"

    local status
    case "$result" in
        success)
            status="success"
            if [ -n "$url" ]; then
                details="$details (URL: $url)"
            fi
            ;;
        failure)
            status="failure"
            ;;
        skipped)
            status="skipped"
            ;;
        *)
            status="pending"
            ;;
    esac

    add_check "$component" "$status" "$details"
}

# Add pre-deployment checks section
# Usage: add_predeployment_checks <security-result> <quality-result> <changes-detected>
add_predeployment_checks() {
    local security="$1"
    local quality="$2"
    local changes="${3:-true}"

    local content=""

    if [ "$changes" = "false" ]; then
        content="⏭️ **No deployment-relevant changes detected**

The deployment was skipped because no changes were detected in monitored paths."
    else
        local sec_icon qual_icon
        sec_icon=$(result_to_icon "$security")
        qual_icon=$(result_to_icon "$quality")

        content="**Pre-deployment validation results:**

- $sec_icon Security Gate: $security
- $qual_icon Quality Gate: $quality

All pre-deployment checks must pass before deployment proceeds."
    fi

    add_section "Pre-deployment Validation" "$content"
}

# Add deployment configuration
# Usage: add_deployment_config <environment> <component> <branch> <commit>
add_deployment_config() {
    local environment="$1"
    local component="$2"
    local branch="$3"
    local commit="$4"

    local env_icon
    case "$environment" in
        production) env_icon="🌟" ;;
        staging) env_icon="🚧" ;;
        development) env_icon="🔧" ;;
        *) env_icon="📦" ;;
    esac

    local content="$env_icon **Environment:** $environment
📦 **Component:** $component
🌿 **Branch:** $branch
📝 **Commit:** \`${commit:0:7}\`"

    add_section "Deployment Configuration" "$content"
}

# Add deployment URLs
# Usage: add_deployment_urls <environment>
add_deployment_urls() {
    local environment="$1"

    local web_url api_url

    case "$environment" in
        production)
            web_url="https://bia.com"
            api_url="https://api.bia.com"
            ;;
        staging)
            web_url="https://staging.bia.com"
            api_url="https://api.staging.bia.com"
            ;;
        development)
            web_url="https://dev.bia.com"
            api_url="https://api.dev.bia.com"
            ;;
        *)
            web_url="N/A"
            api_url="N/A"
            ;;
    esac

    local content="🌐 **Web Application:** [$web_url]($web_url)
🔗 **API Endpoint:** [$api_url]($api_url)

> **Note:** URLs may take a few minutes to reflect the latest deployment."

    add_section "Deployment URLs" "$content"
}

# Add post-deployment tests summary
# Usage: add_postdeployment_tests <smoke-result> <integration-result>
add_postdeployment_tests() {
    local smoke="$1"
    local integration="${2:-skipped}"

    local smoke_icon int_icon
    smoke_icon=$(result_to_icon "$smoke")
    int_icon=$(result_to_icon "$integration")

    local content="**Post-deployment validation:**

- $smoke_icon Smoke Tests: $smoke
- $int_icon Integration Tests: $integration

These tests verify that the deployed components are functioning correctly."

    add_section "Post-deployment Tests" "$content"
}

# Add rollback information
# Usage: add_rollback_info <previous-version> <rollback-available>
add_rollback_info() {
    local previous_version="$1"
    local rollback_available="${2:-true}"

    local content
    if [ "$rollback_available" = "true" ]; then
        content="✅ **Rollback Available:** Yes
📌 **Previous Version:** $previous_version

In case of issues, you can rollback to the previous version using:
\`\`\`bash
# Rollback command (example)
git revert HEAD
# Or trigger rollback workflow
\`\`\`"
    else
        content="❌ **Rollback Available:** No

This is a first deployment or rollback is not supported for this component."
    fi

    add_section "Rollback Information" "$content"
}

# Add release information (for production)
# Usage: add_release_info <version> <release-notes-url>
add_release_info() {
    local version="$1"
    local release_url="${2:-}"

    local content="🏷️ **Version:** $version"

    if [ -n "$release_url" ]; then
        content="$content
📋 **Release Notes:** [$release_url]($release_url)"
    fi

    content="$content

**Monitoring:**
- [Sentry Dashboard](https://sentry.io)
- [CloudWatch Metrics](https://console.aws.amazon.com/cloudwatch)
- [Application Logs](https://console.aws.amazon.com/cloudwatch/home#logsV2:)"

    add_section "Release Information" "$content"
}

# P1: DR-1 - Deployment configuration struct (using associative array simulation)
# Usage: Set these before calling generate_deployment_report_v2
declare -g DEPLOY_ENVIRONMENT=""
declare -g DEPLOY_COMPONENT=""
declare -g DEPLOY_INFRASTRUCTURE=""
declare -g DEPLOY_LAMBDAS=""
declare -g DEPLOY_WEB=""
declare -g DEPLOY_API=""
declare -g DEPLOY_POST_TESTS=""
declare -g DEPLOY_SECURITY=""
declare -g DEPLOY_QUALITY=""

# Generate complete deployment report (legacy - 7+ positional params)
# Usage: generate_deployment_report <environment> <component> <infra-result> <lambda-result> <web-result> <api-result> <posttest-result> [security] [quality]
# P1: DR-1 - Fixed variable naming bug (was: lambdas defined twice)
generate_deployment_report() {
    local environment="${1:-staging}"
    local component="${2:-all}"
    local infrastructure="${3:-pending}"
    local lambdas="${4:-pending}"
    local web="${5:-pending}"
    local api="${6:-pending}"
    local post_tests="${7:-pending}"
    local security="${8:-success}"
    local quality="${9:-success}"

    # P1: DR-2 - Validate environment
    _validate_deployment_env "$environment"

    # P2: DR-3 - End timer if started
    if [ -n "$_DEPLOYMENT_START_TIME" ]; then
        end_deployment_timer
    fi

    init_deployment_report

    # Add deployment configuration
    add_deployment_config "$environment" "$component" "${GITHUB_REF_NAME:-main}" "${GITHUB_SHA:-unknown}"

    # Add pre-deployment checks
    add_predeployment_checks "$security" "$quality" "true"

    # Add component deployment results
    add_component_deployment "Infrastructure" "$infrastructure" "AWS CDK stack deployment"
    add_component_deployment "Lambda Functions" "$lambdas" "Serverless function deployment"
    add_component_deployment "Web Application" "$web" "Frontend application deployment"
    add_component_deployment "API" "$api" "Backend API deployment"
    add_component_deployment "Post-deployment Tests" "$post_tests" "Smoke and integration tests"

    # Add deployment URLs
    add_deployment_urls "$environment"

    # Add post-deployment tests summary
    add_postdeployment_tests "$post_tests" "skipped"

    # P2: DR-3 - Add deployment duration if available
    local duration
    duration=$(get_deployment_duration)
    if [ "$duration" != "N/A" ]; then
        add_section "Deployment Metrics" "| Metric | Value |
|--------|-------|
| Duration | $duration |
| Environment | $environment |
| Component | $component |"
    fi

    # P2: DR-4 - Add artifact links
    local artifact_url
    artifact_url=$(get_artifact_url "deployment")
    if [ "$artifact_url" != "N/A" ]; then
        add_section "Artifacts" "📦 [Download deployment artifacts]($artifact_url)"
    fi

    # Add rollback info
    local previous_commit
    previous_commit=$(git rev-parse HEAD~1 2>/dev/null || echo "unknown")
    add_rollback_info "${previous_commit:0:7}" "true"

    # Add release info for production
    if [ "$environment" = "production" ]; then
        local version
        version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
        add_release_info "$version"
    fi

    # Add recommendation
    if [ $REPORT_FAILED -eq 0 ]; then
        add_section "Status" "✅ **Deployment Successful!**

All components have been deployed successfully to **$environment**.

The application is now live and ready for use."
    else
        add_section "Status" "❌ **Deployment Failed**

Some components failed to deploy. Please review the logs and take appropriate action.

**Next Steps:**
1. Review the failed component logs
2. Identify and fix the issues
3. Consider rollback if necessary
4. Re-deploy after fixing"
    fi

    # Finalize the report
    finalize_report

    # Return appropriate exit code
    if [ $REPORT_FAILED -gt 0 ]; then
        return 1
    fi
    return 0
}

# Generate quick deployment summary
# Usage: generate_deployment_summary <environment> <component> <status>
generate_deployment_summary() {
    local environment="$1"
    local component="$2"
    local overall_status="$3"

    local status_icon
    if [ "$overall_status" = "success" ]; then
        status_icon="✅"
    else
        status_icon="❌"
    fi

    local env_icon
    case "$environment" in
        production) env_icon="🌟" ;;
        staging) env_icon="🚧" ;;
        *) env_icon="📦" ;;
    esac

    cat <<EOF
## 🚀 Deployment Summary

> $status_icon **Deployment Status:** ${overall_status^^}

$env_icon **Environment:** $environment
📦 **Component:** $component
🌿 **Branch:** ${GITHUB_REF_NAME:-unknown}
📝 **Commit:** \`${GITHUB_SHA:0:7}\`

---

**Deployed at:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')
**Triggered by:** @${GITHUB_ACTOR:-unknown}

EOF
}

# Helper: Convert result to icon
result_to_icon() {
    case "$1" in
        success) echo "✅" ;;
        failure) echo "❌" ;;
        skipped) echo "⏭️" ;;
        *) echo "🔄" ;;
    esac
}

# Export functions
export -f init_deployment_report
export -f add_component_deployment
export -f add_predeployment_checks
export -f add_deployment_config
export -f add_deployment_urls
export -f add_postdeployment_tests
export -f add_rollback_info
export -f add_release_info
export -f generate_deployment_report
export -f generate_deployment_summary
export -f result_to_icon

# Export new timing and artifact functions
export -f start_deployment_timer
export -f end_deployment_timer
export -f get_deployment_duration
export -f get_artifact_url

# If script is executed directly (not sourced), show usage
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    cat <<EOF
Usage: source deployment-report.sh

Functions available:
  - init_deployment_report
  - add_component_deployment <component> <result> [details] [url]
  - add_predeployment_checks <security> <quality> <changes-detected>
  - add_deployment_config <environment> <component> <branch> <commit>
  - add_deployment_urls <environment>
  - add_postdeployment_tests <smoke-result> <integration-result>
  - add_rollback_info <previous-version> <rollback-available>
  - add_release_info <version> [release-url]
  - generate_deployment_report <env> <component> <infra> <lambda> <web> <api> <posttest> [security] [quality]
  - generate_deployment_summary <environment> <component> <status>

Environment Variables:
  - REPORT_DIR: Directory for reports (default: deployment-reports)
  - ENVIRONMENT: Deployment environment (default: staging)
  - COMPONENT: Component being deployed (default: all)
  - GITHUB_REF_NAME: Branch name
  - GITHUB_SHA: Commit SHA
  - GITHUB_ACTOR: User who triggered deployment

Example:
  export REPORT_DIR=deployment-reports
  export ENVIRONMENT=production
  source deployment-report.sh
  generate_deployment_report production all success success success success success

Example Summary:
  source deployment-report.sh
  generate_deployment_summary production all success

EOF
fi

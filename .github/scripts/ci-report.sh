#!/usr/bin/env bash
# ci-report.sh - CI Pipeline report aggregator
# Generates a standardized report for the entire CI pipeline

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the report utilities
source "$SCRIPT_DIR/report-utils.sh"

# Default values
REPORT_DIR="${REPORT_DIR:-ci-reports}"

# Initialize CI pipeline report
init_ci_report() {
    local report_file="$REPORT_DIR/ci-pipeline-report.md"
    init_report "$report_file" "CI Pipeline Report" "Continuous Integration"

    echo "🚀 CI pipeline report initialized: $report_file"
}

# Add job result to the report
# Usage: add_job_result <job-name> <result> [details]
add_job_result() {
    local job_name="$1"
    local result="$2"
    local details="${3:-}"

    local status
    case "$result" in
        success)
            status="success"
            ;;
        failure)
            status="failure"
            ;;
        skipped)
            status="skipped"
            ;;
        cancelled)
            status="skipped"
            ;;
        *)
            status="pending"
            ;;
    esac

    add_check "$job_name" "$status" "$details"
}

# Add stage summary with multiple jobs
# Usage: add_stage_summary <stage-name> <job1-name> <job1-result> [job2-name] [job2-result] ...
add_stage_summary() {
    local stage_name="$1"
    shift

    local jobs_content=""
    local all_success=true
    local any_failed=false

    while [ $# -gt 0 ]; do
        local job_name="$1"
        local job_result="$2"
        shift 2

        local icon
        case "$job_result" in
            success)
                icon="✅"
                ;;
            failure)
                icon="❌"
                any_failed=true
                all_success=false
                ;;
            skipped|cancelled)
                icon="⏭️"
                all_success=false
                ;;
            *)
                icon="🔄"
                all_success=false
                ;;
        esac

        jobs_content="$jobs_content
- $icon **$job_name**: $job_result"
    done

    local stage_status
    if [ "$any_failed" = true ]; then
        stage_status="❌ Failed"
    elif [ "$all_success" = true ]; then
        stage_status="✅ Passed"
    else
        stage_status="⏭️ Partial"
    fi

    add_section "$stage_name" "**Status:** $stage_status
$jobs_content"
}

# Add PR links section
# Usage: add_pr_links <run-id> <repository>
add_pr_links() {
    local run_id="$1"
    local repository="$2"

    local links_content="- [🔍 View Security Reports](https://github.com/$repository/actions/runs/$run_id)
- [🧪 View Test Results](https://github.com/$repository/actions/runs/$run_id)
- [📊 View Quality Reports](https://github.com/$repository/actions/runs/$run_id)
- [📁 Download Artifacts](https://github.com/$repository/actions/runs/$run_id#artifacts)"

    add_section "Useful Links" "$links_content"
}

# Add workflow metrics
# Usage: add_workflow_metrics <duration-seconds> [parallel-jobs]
add_workflow_metrics() {
    local duration="$1"
    local parallel_jobs="${2:-N/A}"

    # Convert seconds to minutes:seconds
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))

    local metrics_content="| Metric | Value |
|--------|-------|
| Total Duration | ${minutes}m ${seconds}s |
| Parallel Jobs | $parallel_jobs |
| Pipeline Stage | Continuous Integration |"

    add_section "Pipeline Metrics" "$metrics_content"
}

# Generate complete CI pipeline report
# Usage: generate_ci_report <fast-checks-result> <quality-result> <security-result> <test-result> <lambda-result>
# P1: CI-2 - Added input validation for status arguments
generate_ci_report() {
    local fast_checks="${1:-pending}"
    local quality_gate="${2:-pending}"
    local security_scans="${3:-pending}"
    local test_suite="${4:-pending}"
    local lambda_tests="${5:-pending}"

    # Validate all status inputs
    _validate_status "$fast_checks"
    _validate_status "$quality_gate"
    _validate_status "$security_scans"
    _validate_status "$test_suite"
    _validate_status "$lambda_tests"

    init_ci_report

    # Add individual job results
    add_job_result "Fast Checks" "$fast_checks" "PR validation, dependency review, license check"
    add_job_result "Quality Gate" "$quality_gate" "Linting, type checking, build validation"
    add_job_result "Security Scans" "$security_scans" "CodeQL, dependency vulnerabilities, Trivy"
    add_job_result "Test Suite" "$test_suite" "Unit, integration, and E2E tests"
    add_job_result "Lambda Tests" "$lambda_tests" "Lambda function testing with LocalStack"

    # Add stage summaries
    add_stage_summary "Stage 1: Fast Fail Checks" \
        "PR Validation" "$fast_checks" \
        "Dependency Review" "$fast_checks" \
        "License Check" "$fast_checks"

    add_stage_summary "Stage 2: Quality & Security" \
        "Quality Gate" "$quality_gate" \
        "Security Scans" "$security_scans"

    add_stage_summary "Stage 3: Testing" \
        "Test Suite" "$test_suite" \
        "Lambda Tests" "$lambda_tests"

    # Add PR links if in GitHub Actions
    if [ -n "${GITHUB_RUN_ID:-}" ] && [ -n "${GITHUB_REPOSITORY:-}" ]; then
        add_pr_links "$GITHUB_RUN_ID" "$GITHUB_REPOSITORY"
    fi

    # Add recommendation based on results
    if [ $REPORT_FAILED -eq 0 ]; then
        add_section "Recommendation" "✅ **All checks passed!** Your PR is ready for review and merge."
    else
        add_section "Recommendation" "❌ **Some checks failed.** Please review the failed jobs and fix the issues before merging."
    fi

    # Finalize the report
    finalize_report

    # Return appropriate exit code
    if [ $REPORT_FAILED -gt 0 ]; then
        return 1
    fi
    return 0
}

# Generate quick summary for PR comments
# Usage: generate_pr_comment_summary <fast-checks> <quality> <security> <test> <lambda>
# P1: CI-2 - Added input validation for status arguments
generate_pr_comment_summary() {
    local fast_checks="${1:-pending}"
    local quality_gate="${2:-pending}"
    local security_scans="${3:-pending}"
    local test_suite="${4:-pending}"
    local lambda_tests="${5:-pending}"

    # Validate all status inputs
    _validate_status "$fast_checks"
    _validate_status "$quality_gate"
    _validate_status "$security_scans"
    _validate_status "$test_suite"
    _validate_status "$lambda_tests"

    # Map results to icons
    local fc_icon qg_icon ss_icon ts_icon lt_icon
    fc_icon=$(result_to_icon "$fast_checks")
    qg_icon=$(result_to_icon "$quality_gate")
    ss_icon=$(result_to_icon "$security_scans")
    ts_icon=$(result_to_icon "$test_suite")
    lt_icon=$(result_to_icon "$lambda_tests")

    # Determine overall status
    local overall_status overall_icon
    if [ "$fast_checks" = "success" ] && [ "$quality_gate" = "success" ] && \
       ([ "$security_scans" = "success" ] || [ "$security_scans" = "skipped" ]) && \
       ([ "$test_suite" = "success" ] || [ "$test_suite" = "skipped" ]) && \
       ([ "$lambda_tests" = "success" ] || [ "$lambda_tests" = "skipped" ]); then
        overall_status="All Checks Passed"
        overall_icon="✅"
    else
        overall_status="Some Checks Failed"
        overall_icon="❌"
    fi

    # Create compact summary
    cat <<EOF
## 🚀 CI Pipeline Summary

> $overall_icon **$overall_status**

### 📋 Job Results

| Stage | Status |
|-------|--------|
| $fc_icon Fast Checks | $fast_checks |
| $qg_icon Quality Gate | $quality_gate |
| $ss_icon Security Scans | $security_scans |
| $ts_icon Test Suite | $test_suite |
| $lt_icon Lambda Tests | $lambda_tests |

---

<details>
<summary>📊 View detailed reports</summary>

- [🔍 Security Reports](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID})
- [🧪 Test Results](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID})
- [📊 Quality Reports](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID})

</details>

---

**Branch:** \`${GITHUB_REF_NAME:-unknown}\` | **Commit:** \`${GITHUB_SHA:0:7}\` | **Run:** [#${GITHUB_RUN_NUMBER:-0}](https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID})
EOF
}

# Helper: Convert result to icon
result_to_icon() {
    case "$1" in
        success) echo "✅" ;;
        failure) echo "❌" ;;
        skipped|cancelled) echo "⏭️" ;;
        *) echo "🔄" ;;
    esac
}

# Export functions
export -f init_ci_report
export -f add_job_result
export -f add_stage_summary
export -f add_pr_links
export -f add_workflow_metrics
export -f generate_ci_report
export -f generate_pr_comment_summary
export -f result_to_icon

# If script is executed directly (not sourced), show usage
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    cat <<EOF
Usage: source ci-report.sh

Functions available:
  - init_ci_report
  - add_job_result <job-name> <result> [details]
  - add_stage_summary <stage-name> <job1-name> <job1-result> ...
  - add_pr_links <run-id> <repository>
  - add_workflow_metrics <duration-seconds> [parallel-jobs]
  - generate_ci_report <fast-checks> <quality> <security> <test> <lambda>
  - generate_pr_comment_summary <fast-checks> <quality> <security> <test> <lambda>

Environment Variables:
  - REPORT_DIR: Directory for reports (default: ci-reports)
  - GITHUB_RUN_ID: GitHub Actions run ID
  - GITHUB_REPOSITORY: GitHub repository (owner/repo)
  - GITHUB_REF_NAME: Branch name
  - GITHUB_SHA: Commit SHA
  - GITHUB_RUN_NUMBER: Run number

Example:
  export REPORT_DIR=ci-reports
  source ci-report.sh
  generate_ci_report success success success success skipped

Example PR Comment:
  source ci-report.sh
  generate_pr_comment_summary success success success success skipped > pr-comment.md

EOF
fi

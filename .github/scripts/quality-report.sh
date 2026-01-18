#!/usr/bin/env bash
# quality-report.sh - Quality gate report generator
# Generates a standardized report for code quality checks

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the report utilities
source "$SCRIPT_DIR/report-utils.sh"

# Default values
REPORT_DIR="${REPORT_DIR:-quality-reports}"
ENVIRONMENT="${ENVIRONMENT:-development}"

# Initialize quality gate report
init_quality_report() {
    local report_file="$REPORT_DIR/quality-gate-report.md"
    init_report "$report_file" "Code Quality Gate Report" "Quality"

    echo "📋 Quality gate report initialized: $report_file"
}

# Add commitlint check result
add_commitlint_check() {
    local status="$1"
    local log_file="${2:-}"

    if [ "$status" = "skipped" ]; then
        add_check "Commit Message Validation" "skipped" "Skipped by configuration"
    elif [ -n "$log_file" ] && [ -f "$log_file" ]; then
        if grep -q "0 problems" "$log_file" 2>/dev/null; then
            add_check "Commit Message Validation" "success" "All commit messages follow conventional commits format"
        else
            local issue_count
            issue_count=$(grep -o "[0-9]* problems" "$log_file" | head -1 | awk '{print $1}' || echo "unknown")
            add_check "Commit Message Validation" "failure" "Found $issue_count commit message issues" "$log_file"
        fi
    else
        add_check "Commit Message Validation" "$status" "" "$log_file"
    fi
}

# Add linting check result
add_lint_check() {
    local status="$1"
    local log_file="${2:-}"

    if [ "$status" = "skipped" ]; then
        add_check "Code Linting" "skipped" "Skipped by configuration"
    elif [ "$status" = "success" ]; then
        add_check "Code Linting" "success" "No linting errors found"
    else
        local error_count="unknown"
        if [ -f "$log_file" ]; then
            # Try to extract error count from Biome output
            error_count=$(grep -o "[0-9]* error" "$log_file" | head -1 | awk '{print $1}' || echo "unknown")
        fi
        add_check "Code Linting" "failure" "Found $error_count linting errors" "$log_file"
    fi
}

# Add build check result
# P1: QR-1 - Added skipped status handling
add_build_check() {
    local status="$1"
    local log_file="${2:-}"

    case "$status" in
        success)
            add_check "Project Build" "success" "Build completed successfully"
            ;;
        skipped)
            add_check "Project Build" "skipped" "Skipped by configuration"
            ;;
        *)
            add_check "Project Build" "failure" "Build failed - check logs for details" "$log_file"
            ;;
    esac
}

# Add typecheck result
add_typecheck_check() {
    local status="$1"
    local log_file="${2:-}"

    if [ "$status" = "skipped" ]; then
        add_check "Type Checking" "skipped" "Skipped by configuration"
    elif [ "$status" = "success" ]; then
        add_check "Type Checking" "success" "No type errors found"
    else
        local error_count="unknown"
        if [ -f "$log_file" ]; then
            # Try to extract error count from TypeScript output
            error_count=$(grep -c "error TS" "$log_file" 2>/dev/null || echo "unknown")
        fi
        add_check "Type Checking" "failure" "Found $error_count type errors" "$log_file"
    fi
}

# Add dependency validation result
# P1: QR-1 - Added skipped status handling
add_dependency_check() {
    local status="$1"
    local security_log="${2:-}"
    local unused_log="${3:-}"

    case "$status" in
        success)
            add_check "Dependency Validation" "success" "No security vulnerabilities or unused dependencies found"
            ;;
        skipped)
            add_check "Dependency Validation" "skipped" "Skipped by configuration"
            ;;
        *)
            local details=""
            if [ -f "$security_log" ]; then
                details="Security issues detected"
            fi
            if [ -f "$unused_log" ]; then
                if [ -n "$details" ]; then
                    details="$details, unused dependencies found"
                else
                    details="Unused dependencies detected"
                fi
            fi
            add_check "Dependency Validation" "$status" "$details" "$security_log"
            ;;
    esac
}

# Add code complexity analysis
add_code_stats() {
    local stats_file="${1:-$REPORT_DIR/code-stats.txt}"

    if [ ! -f "$stats_file" ]; then
        return 0
    fi

    local content
    content=$(cat "$stats_file")

    add_section "Code Statistics" "\`\`\`
$content
\`\`\`"
}

# Generate complete quality report
# P1: QR-2 - Added input validation for status arguments
generate_quality_report() {
    local commitlint_status="${1:-skipped}"
    local lint_status="${2:-skipped}"
    local build_status="${3:-pending}"
    local typecheck_status="${4:-skipped}"
    local dependency_status="${5:-success}"

    # Validate all status inputs
    _validate_status "$commitlint_status"
    _validate_status "$lint_status"
    _validate_status "$build_status"
    _validate_status "$typecheck_status"
    _validate_status "$dependency_status"

    init_quality_report

    # Add all checks
    add_commitlint_check "$commitlint_status" "$REPORT_DIR/commitlint.log"
    add_lint_check "$lint_status" "$REPORT_DIR/lint.log"
    add_build_check "$build_status" "$REPORT_DIR/build.log"
    add_typecheck_check "$typecheck_status" "$REPORT_DIR/typecheck.log"
    add_dependency_check "$dependency_status" "$REPORT_DIR/dependency-security.log" "$REPORT_DIR/unused-dependencies.json"

    # Add code statistics if available
    add_code_stats

    # Finalize the report
    finalize_report

    # Return appropriate exit code
    if [ $REPORT_FAILED -gt 0 ]; then
        return 1
    fi
    return 0
}

# Export functions
export -f init_quality_report
export -f add_commitlint_check
export -f add_lint_check
export -f add_build_check
export -f add_typecheck_check
export -f add_dependency_check
export -f add_code_stats
export -f generate_quality_report

# If script is executed directly (not sourced), show usage
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    cat <<EOF
Usage: source quality-report.sh

Functions available:
  - init_quality_report
  - add_commitlint_check <status> [log-file]
  - add_lint_check <status> [log-file]
  - add_build_check <status> [log-file]
  - add_typecheck_check <status> [log-file]
  - add_dependency_check <status> [security-log] [unused-log]
  - add_code_stats [stats-file]
  - generate_quality_report <commitlint> <lint> <build> <typecheck> <dependency>

Example:
  source quality-report.sh
  generate_quality_report success success success success success

EOF
fi

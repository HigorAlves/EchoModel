#!/usr/bin/env bash
# test-report.sh - Test suite report generator
# Generates a standardized report for test execution

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the report utilities
source "$SCRIPT_DIR/report-utils.sh"

# Default values
REPORT_DIR="${REPORT_DIR:-test-reports}"
ENVIRONMENT="${ENVIRONMENT:-development}"

# P1: TR-1 - Extract coverage percentage from test output logs
# Supports Vitest, Jest, and c8 output formats
_extract_coverage_from_log() {
    local log_file="$1"
    local default="${2:-N/A}"

    if [ ! -f "$log_file" ]; then
        echo "$default"
        return
    fi

    # Try different coverage output formats
    local coverage

    # Vitest/c8 format: "All files |   80.5 |   75.2 |   90.1 |   82.3 |"
    coverage=$(grep -E "All files\s*\|" "$log_file" 2>/dev/null | awk -F'|' '{gsub(/[[:space:]]/,"",$2); print $2}' | head -1)
    if [ -n "$coverage" ] && [[ "$coverage" =~ ^[0-9.]+$ ]]; then
        echo "$coverage"
        return
    fi

    # Jest format: "All files |   80.5 |   75.2 |   90.1 |   82.3"
    coverage=$(grep -E "^All files" "$log_file" 2>/dev/null | awk '{print $4}' | head -1)
    if [ -n "$coverage" ] && [[ "$coverage" =~ ^[0-9.]+$ ]]; then
        echo "$coverage"
        return
    fi

    # Coverage percentage in text: "Coverage: 80.5%"
    coverage=$(grep -oE "Coverage:\s*[0-9.]+" "$log_file" 2>/dev/null | awk '{print $2}' | head -1)
    if [ -n "$coverage" ] && [[ "$coverage" =~ ^[0-9.]+$ ]]; then
        echo "$coverage"
        return
    fi

    echo "$default"
}

# P1: TR-3 - Extract test counts from test output logs
# Returns: passed failed skipped total (space-separated)
_extract_test_counts() {
    local log_file="$1"

    if [ ! -f "$log_file" ]; then
        echo "0 0 0 0"
        return
    fi

    local passed=0 failed=0 skipped=0 total=0

    # Vitest format: "Tests  42 passed | 2 failed | 3 skipped (47)"
    local vitest_line
    vitest_line=$(grep -E "Tests\s+[0-9]+" "$log_file" 2>/dev/null | tail -1)
    if [ -n "$vitest_line" ]; then
        passed=$(echo "$vitest_line" | grep -oE "[0-9]+ passed" | awk '{print $1}' || echo 0)
        failed=$(echo "$vitest_line" | grep -oE "[0-9]+ failed" | awk '{print $1}' || echo 0)
        skipped=$(echo "$vitest_line" | grep -oE "[0-9]+ skipped" | awk '{print $1}' || echo 0)
        [ -z "$passed" ] && passed=0
        [ -z "$failed" ] && failed=0
        [ -z "$skipped" ] && skipped=0
        total=$((passed + failed + skipped))
        echo "$passed $failed $skipped $total"
        return
    fi

    # Jest format: "Tests:       42 passed, 2 failed, 44 total"
    local jest_line
    jest_line=$(grep -E "Tests:\s+[0-9]+" "$log_file" 2>/dev/null | tail -1)
    if [ -n "$jest_line" ]; then
        passed=$(echo "$jest_line" | grep -oE "[0-9]+ passed" | awk '{print $1}' || echo 0)
        failed=$(echo "$jest_line" | grep -oE "[0-9]+ failed" | awk '{print $1}' || echo 0)
        skipped=$(echo "$jest_line" | grep -oE "[0-9]+ skipped" | awk '{print $1}' || echo 0)
        total=$(echo "$jest_line" | grep -oE "[0-9]+ total" | awk '{print $1}' || echo 0)
        [ -z "$passed" ] && passed=0
        [ -z "$failed" ] && failed=0
        [ -z "$skipped" ] && skipped=0
        [ -z "$total" ] && total=$((passed + failed + skipped))
        echo "$passed $failed $skipped $total"
        return
    fi

    echo "0 0 0 0"
}

# Initialize test suite report
init_test_report() {
    local report_file="$REPORT_DIR/test-suite-report.md"
    init_report "$report_file" "Test Suite Report" "Testing"

    echo "🧪 Test suite report initialized: $report_file"
}

# Add build check result (required before tests)
add_test_build_check() {
    local status="$1"
    local log_file="${2:-}"

    if [ "$status" = "success" ]; then
        add_check "Build for Tests" "success" "Project built successfully for testing"
    else
        add_check "Build for Tests" "failure" "Build failed - tests cannot run" "$log_file"
    fi
}

# Add unit test result
# P1: TR-1 - Enhanced coverage extraction with log fallback
# P2: TR-2 - Explicit default handling documented
add_unit_test_check() {
    local status="${1:-pending}"  # Explicit default: pending
    local coverage_dir="${2:-}"
    local test_log="${3:-$REPORT_DIR/test-output.log}"

    case "$status" in
        success)
            local coverage_summary=""
            local coverage_pct="N/A"

            # Try JSON first (more accurate)
            if [ -d "$coverage_dir" ] && [ -f "$coverage_dir/coverage-summary.json" ]; then
                coverage_pct=$(jq -r '.total.lines.pct // "N/A"' "$coverage_dir/coverage-summary.json" 2>/dev/null || echo "N/A")
            fi

            # Fallback to log extraction if JSON not available
            if [ "$coverage_pct" = "N/A" ] && [ -f "$test_log" ]; then
                coverage_pct=$(_extract_coverage_from_log "$test_log" "N/A")
            fi

            if [ "$coverage_pct" != "N/A" ]; then
                coverage_summary=" - Coverage: ${coverage_pct}%"
            fi

            add_check "Unit Tests" "success" "All unit tests passed${coverage_summary}"
            ;;
        skipped)
            add_check "Unit Tests" "skipped" "Unit tests skipped by configuration"
            ;;
        failure)
            add_check "Unit Tests" "failure" "Unit tests failed - check test results"
            ;;
        *)
            add_check "Unit Tests" "pending" "Unit tests pending"
            ;;
    esac
}

# Add E2E test result
add_e2e_test_check() {
    local status="$1"
    local results_dir="${2:-}"

    if [ "$status" = "success" ]; then
        add_check "E2E Tests" "success" "All end-to-end tests passed"
    elif [ "$status" = "skipped" ]; then
        add_check "E2E Tests" "skipped" "E2E tests not configured or skipped"
    else
        add_check "E2E Tests" "failure" "E2E tests failed - check test results"
    fi
}

# Add test coverage summary
add_coverage_summary() {
    local coverage_dir="${1:-coverage}"

    if [ ! -d "$coverage_dir" ]; then
        return 0
    fi

    # Try to find coverage summary files
    local summary_files
    summary_files=$(find "$coverage_dir" -name "coverage-summary.json" 2>/dev/null || echo "")

    if [ -z "$summary_files" ]; then
        return 0
    fi

    local content="| Metric | Coverage |
|--------|----------|"

    # Read first coverage summary found
    local first_summary
    first_summary=$(echo "$summary_files" | head -1)

    if [ -f "$first_summary" ]; then
        local lines branches functions statements
        lines=$(jq -r '.total.lines.pct // "N/A"' "$first_summary" 2>/dev/null || echo "N/A")
        branches=$(jq -r '.total.branches.pct // "N/A"' "$first_summary" 2>/dev/null || echo "N/A")
        functions=$(jq -r '.total.functions.pct // "N/A"' "$first_summary" 2>/dev/null || echo "N/A")
        statements=$(jq -r '.total.statements.pct // "N/A"' "$first_summary" 2>/dev/null || echo "N/A")

        content="$content
| Lines | ${lines}% |
| Branches | ${branches}% |
| Functions | ${functions}% |
| Statements | ${statements}% |"
    fi

    add_section "Coverage Summary" "$content"
}

# Add test statistics
add_test_statistics() {
    local test_results_dir="${1:-test-results}"

    if [ ! -d "$test_results_dir" ]; then
        return 0
    fi

    # Try to find test result files (Jest, Vitest, etc.)
    local result_files
    result_files=$(find "$test_results_dir" -name "*.xml" -o -name "*.json" 2>/dev/null | head -5)

    if [ -z "$result_files" ]; then
        return 0
    fi

    local content="Test result artifacts found in \`$test_results_dir\`

<details>
<summary>View test artifacts</summary>

\`\`\`
$(find "$test_results_dir" -type f | head -20)
\`\`\`

</details>"

    add_section "Test Artifacts" "$content"
}

# P1: TR-3 - Add test counts summary
add_test_counts_summary() {
    local test_log="${1:-$REPORT_DIR/test-output.log}"

    if [ ! -f "$test_log" ]; then
        return 0
    fi

    local counts
    counts=$(_extract_test_counts "$test_log")

    local passed failed skipped total
    read -r passed failed skipped total <<< "$counts"

    # Only show if we have actual counts
    if [ "$total" -eq 0 ]; then
        return 0
    fi

    local pass_icon="✅" fail_icon="⏭️" skip_icon="⏭️"
    [ "$passed" -gt 0 ] && pass_icon="✅"
    [ "$failed" -gt 0 ] && fail_icon="❌"
    [ "$skipped" -gt 0 ] && skip_icon="⏭️"

    local content="| Metric | Count |
|--------|-------|
| $pass_icon Passed | $passed |
| $fail_icon Failed | $failed |
| $skip_icon Skipped | $skipped |
| **Total** | **$total** |"

    add_section "Test Counts" "$content"
}

# Add failed test details
add_failed_test_details() {
    local test_log="${1:-}"

    if [ ! -f "$test_log" ]; then
        return 0
    fi

    # Extract failed test information (works with Jest/Vitest output)
    local failed_tests
    failed_tests=$(grep -A 2 "FAIL\|✕" "$test_log" 2>/dev/null | head -50 || echo "")

    if [ -n "$failed_tests" ]; then
        add_section "Failed Test Details" "<details>
<summary>View failed tests</summary>

\`\`\`
$failed_tests
\`\`\`

</details>"
    fi
}

# Generate complete test report
# P2: TR-2 - Defaults documented: build=success, unit=pending, e2e=skipped
generate_test_report() {
    local build_status="${1:-success}"
    local unit_status="${2:-pending}"
    local e2e_status="${3:-skipped}"

    # Validate status inputs
    _validate_status "$build_status"
    _validate_status "$unit_status"
    _validate_status "$e2e_status"

    init_test_report

    # Add all checks
    add_test_build_check "$build_status"
    add_unit_test_check "$unit_status"
    add_e2e_test_check "$e2e_status"

    # Add additional sections
    add_coverage_summary
    add_test_counts_summary "$REPORT_DIR/test-output.log"
    add_test_statistics

    # Add failed test details if any tests failed
    if [ "$unit_status" = "failure" ] || [ "$e2e_status" = "failure" ]; then
        add_failed_test_details "$REPORT_DIR/test-output.log"
    fi

    # Finalize the report
    finalize_report

    # Return appropriate exit code
    if [ $REPORT_FAILED -gt 0 ]; then
        return 1
    fi
    return 0
}

# Export functions
export -f init_test_report
export -f add_test_build_check
export -f add_unit_test_check
export -f add_e2e_test_check
export -f add_coverage_summary
export -f add_test_statistics
export -f add_test_counts_summary
export -f add_failed_test_details
export -f generate_test_report

# If script is executed directly (not sourced), show usage
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    cat <<EOF
Usage: source test-report.sh

Functions available:
  - init_test_report
  - add_test_build_check <status> [log-file]
  - add_unit_test_check <status> [coverage-dir]
  - add_e2e_test_check <status> [results-dir]
  - add_coverage_summary [coverage-dir]
  - add_test_statistics [test-results-dir]
  - add_failed_test_details [test-log]
  - generate_test_report <build> <unit> <e2e>

Environment Variables:
  - REPORT_DIR: Directory for reports (default: test-reports)
  - ENVIRONMENT: Test environment (default: development)

Example:
  export REPORT_DIR=test-reports
  source test-report.sh
  generate_test_report success success success

EOF
fi

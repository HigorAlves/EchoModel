#!/usr/bin/env bash
# dependency-review-report.sh - Dependency review report generator
# Generates standardized reports for dependency reviews
#
# ============================================================================
# DEPRECATION NOTICE (P1: DEP-1)
# ============================================================================
# This script is NOT currently used by any workflow or action.
# The security-gate action uses security-report.sh instead, which has
# overlapping functionality.
#
# STATUS: DEPRECATED / DEAD CODE
#
# Options:
# 1. Integrate this into security-gate/action.yml if the features are needed
# 2. Remove this script if the functionality is adequately covered elsewhere
#
# This notice was added during CI/CD review - see plan for details.
# ============================================================================

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the report utilities
source "$SCRIPT_DIR/report-utils.sh"

# Default values
REPORT_DIR="${REPORT_DIR:-dependency-reports}"
FAIL_ON_SEVERITY="${FAIL_ON_SEVERITY:-moderate}"

# Initialize dependency review report
init_dependency_report() {
    local report_file="$REPORT_DIR/dependency-review-report.md"
    init_report "$report_file" "Dependency Review Report" "Dependencies"

    echo "🔒 Dependency review report initialized: $report_file"
}

# Add vulnerability check result
# Usage: add_vulnerability_check <result> <count> [severity-breakdown]
add_vulnerability_check() {
    local result="$1"
    local count="${2:-0}"
    local breakdown="${3:-}"

    if [ "$result" = "success" ] || [ "$count" -eq 0 ]; then
        add_check "Vulnerability Scan" "success" "No security vulnerabilities found"
    else
        local details="Found $count vulnerabilities"
        if [ -n "$breakdown" ]; then
            details="$details ($breakdown)"
        fi
        add_check "Vulnerability Scan" "failure" "$details"
    fi
}

# Add license check result
# Usage: add_license_check <result> <issues-count>
add_license_check() {
    local result="$1"
    local issues="${2:-0}"

    if [ "$result" = "success" ] || [ "$issues" -eq 0 ]; then
        add_check "License Compliance" "success" "All licenses are compatible"
    else
        add_check "License Compliance" "failure" "Found $issues license compatibility issues"
    fi
}

# Add supply chain check result
# Usage: add_supply_chain_check <result> <risks-count>
add_supply_chain_check() {
    local result="$1"
    local risks="${2:-0}"

    if [ "$result" = "success" ] || [ "$risks" -eq 0 ]; then
        add_check "Supply Chain Security" "success" "No suspicious packages detected"
    else
        add_check "Supply Chain Security" "failure" "Found $risks potential supply chain risks"
    fi
}

# Add dependency changes summary
# Usage: add_dependency_changes <added> <removed> <updated>
add_dependency_changes() {
    local added="$1"
    local removed="$2"
    local updated="$3"

    local content="| Change Type | Count |
|-------------|-------|
| ➕ Added | $added |
| ➖ Removed | $removed |
| 🔄 Updated | $updated |
| **Total Changes** | **$((added + removed + updated))** |"

    add_section "Dependency Changes" "$content"
}

# Add vulnerability breakdown
# Usage: add_vulnerability_breakdown <critical> <high> <moderate> <low>
add_vulnerability_breakdown() {
    local critical="$1"
    local high="$2"
    local moderate="$3"
    local low="$4"

    local crit_icon high_icon mod_icon low_icon
    crit_icon=$([ "$critical" -eq 0 ] && echo "✅" || echo "🔴")
    high_icon=$([ "$high" -eq 0 ] && echo "✅" || echo "🟠")
    mod_icon=$([ "$moderate" -eq 0 ] && echo "✅" || echo "🟡")
    low_icon=$([ "$low" -eq 0 ] && echo "✅" || echo "🔵")

    local content="| Severity | Count | Status |
|----------|-------|--------|
| Critical | $critical | $crit_icon |
| High | $high | $high_icon |
| Moderate | $moderate | $mod_icon |
| Low | $low | $low_icon |

**Severity Threshold:** $FAIL_ON_SEVERITY"

    add_section "Vulnerability Breakdown" "$content"
}

# Add allowed/denied licenses
# Usage: add_license_policy
add_license_policy() {
    local allowed="MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC, 0BSD, Unlicense, WTFPL, CC0-1.0, CC-BY-4.0, Python-2.0"
    local denied="GPL-2.0, GPL-3.0, AGPL-1.0, AGPL-3.0, LGPL-2.0, LGPL-2.1, LGPL-3.0"

    local content="**Allowed Licenses (license-checker):**
\`\`\`
$allowed
\`\`\`

**Denied Licenses (dependency-review):**
\`\`\`
$denied
\`\`\`

> Copyleft licenses (GPL/AGPL/LGPL) will cause the build to fail.
> All other permissive and attribution-only licenses are allowed by default."

    add_section "License Policy" "$content"
}

# Add problematic dependencies
# Usage: add_problematic_dependencies <dependencies-json>
add_problematic_dependencies() {
    local deps_json="$1"

    if [ ! -f "$deps_json" ]; then
        return 0
    fi

    # Try to parse and format problematic dependencies
    local deps_list
    deps_list=$(jq -r '.[] | "- **\(.name)@\(.version)**: \(.issue)"' "$deps_json" 2>/dev/null || echo "")

    if [ -n "$deps_list" ]; then
        local content="The following dependencies have issues:

$deps_list

Please review and address these dependencies before merging."

        add_section "Problematic Dependencies" "$content"
    fi
}

# Generate complete dependency review report
# Usage: generate_dependency_review_report <vuln-result> <license-result> <supply-chain-result>
generate_dependency_review_report() {
    local vuln_result="$1"
    local license_result="$2"
    local supply_chain_result="$3"
    local vuln_count="${4:-0}"
    local license_issues="${5:-0}"
    local supply_chain_risks="${6:-0}"

    init_dependency_report

    # Add check results
    add_vulnerability_check "$vuln_result" "$vuln_count"
    add_license_check "$license_result" "$license_issues"
    add_supply_chain_check "$supply_chain_result" "$supply_chain_risks"

    # Add license policy
    add_license_policy

    # Add recommendation
    if [ $REPORT_FAILED -eq 0 ]; then
        add_section "Recommendation" "✅ **All dependency checks passed!**

Your dependency changes are safe to merge."
    else
        add_section "Recommendation" "❌ **Dependency issues detected**

Please address the following before merging:
1. Fix or update vulnerable dependencies
2. Replace dependencies with incompatible licenses
3. Review and address supply chain risks"
    fi

    # Finalize the report
    finalize_report

    # Return appropriate exit code
    if [ $REPORT_FAILED -gt 0 ]; then
        return 1
    fi
    return 0
}

# Generate PR comment for dependency review
# Usage: generate_dependency_pr_comment <vuln-count> <license-issues> <supply-chain-risks> <total-changes>
generate_dependency_pr_comment() {
    local vuln_count="${1:-0}"
    local license_issues="${2:-0}"
    local supply_chain_risks="${3:-0}"
    local total_changes="${4:-0}"

    local overall_status overall_icon
    if [ "$vuln_count" -eq 0 ] && [ "$license_issues" -eq 0 ] && [ "$supply_chain_risks" -eq 0 ]; then
        overall_status="All Checks Passed"
        overall_icon="✅"
    else
        overall_status="Issues Detected"
        overall_icon="❌"
    fi

    local vuln_icon lic_icon sc_icon
    vuln_icon=$([ "$vuln_count" -eq 0 ] && echo "✅" || echo "❌")
    lic_icon=$([ "$license_issues" -eq 0 ] && echo "✅" || echo "❌")
    sc_icon=$([ "$supply_chain_risks" -eq 0 ] && echo "✅" || echo "✅")

    cat <<EOF
## 🔒 Dependency Review Summary

> $overall_icon **$overall_status**

### 📊 Review Results

| Check | Status | Details |
|-------|--------|---------|
| $vuln_icon Security Vulnerabilities | $([ "$vuln_count" -eq 0 ] && echo "PASS" || echo "FAIL") | $vuln_count vulnerabilities found |
| $lic_icon License Compliance | $([ "$license_issues" -eq 0 ] && echo "PASS" || echo "FAIL") | $license_issues license issues |
| $sc_icon Supply Chain Security | $([ "$supply_chain_risks" -eq 0 ] && echo "PASS" || echo "PASS") | No suspicious packages |

**Total Dependency Changes:** $total_changes

---

<details>
<summary>📋 Severity Threshold</summary>

Failing on vulnerabilities with severity: **$FAIL_ON_SEVERITY** or higher

</details>

---

**Reviewed at:** $(date -u '+%Y-%m-%d %H:%M:%S UTC')
EOF
}

# Export functions
export -f init_dependency_report
export -f add_vulnerability_check
export -f add_license_check
export -f add_supply_chain_check
export -f add_dependency_changes
export -f add_vulnerability_breakdown
export -f add_license_policy
export -f add_problematic_dependencies
export -f generate_dependency_review_report
export -f generate_dependency_pr_comment

# If script is executed directly (not sourced), show usage
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    cat <<EOF
Usage: source dependency-review-report.sh

Functions available:
  - init_dependency_report
  - add_vulnerability_check <result> <count> [severity-breakdown]
  - add_license_check <result> <issues-count>
  - add_supply_chain_check <result> <risks-count>
  - add_dependency_changes <added> <removed> <updated>
  - add_vulnerability_breakdown <critical> <high> <moderate> <low>
  - add_license_policy
  - add_problematic_dependencies <dependencies-json>
  - generate_dependency_review_report <vuln> <license> <supply-chain> [vuln-count] [license-issues] [sc-risks]
  - generate_dependency_pr_comment <vuln-count> <license-issues> <sc-risks> <total-changes>

Environment Variables:
  - REPORT_DIR: Directory for reports (default: dependency-reports)
  - FAIL_ON_SEVERITY: Minimum severity to fail (default: moderate)

Example:
  export REPORT_DIR=dependency-reports
  export FAIL_ON_SEVERITY=moderate
  source dependency-review-report.sh
  generate_dependency_review_report success success success 0 0 0

Example PR Comment:
  source dependency-review-report.sh
  generate_dependency_pr_comment 0 0 0 5 > pr-comment.md

EOF
fi

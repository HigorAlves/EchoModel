#!/usr/bin/env bash
# example-report.sh - Example demonstrating the reporting utilities
# This script shows how to use the reporting system

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "  Reporting Utilities - Example Demo"
echo "=========================================="
echo ""

# Create example reports directory
EXAMPLE_DIR="$SCRIPT_DIR/example-output"
mkdir -p "$EXAMPLE_DIR"

echo "📁 Reports will be saved to: $EXAMPLE_DIR"
echo ""

# ==========================================
# Example 1: Quality Gate Report
# ==========================================

echo "1️⃣  Generating Quality Gate Report..."
source "$SCRIPT_DIR/quality-report.sh"
export REPORT_DIR="$EXAMPLE_DIR"

generate_quality_report "success" "success" "success" "success" "success"

echo ""
echo "✅ Quality report generated!"
echo ""

# ==========================================
# Example 2: Security Gate Report (with failures)
# ==========================================

echo "2️⃣  Generating Security Gate Report (with some failures)..."
source "$SCRIPT_DIR/security-report.sh"
export REPORT_DIR="$EXAMPLE_DIR"
export FAIL_ON_SEVERITY="high"

# Create mock npm audit file for demonstration
cat > "$EXAMPLE_DIR/npm-audit.json" <<'EOF'
{
  "metadata": {
    "vulnerabilities": {
      "critical": 1,
      "high": 2,
      "moderate": 5,
      "low": 3,
      "info": 0
    }
  }
}
EOF

generate_security_report "success" "failure" "success" "success" || true

echo ""
echo "✅ Security report generated (with failures)!"
echo ""

# ==========================================
# Example 3: Test Suite Report
# ==========================================

echo "3️⃣  Generating Test Suite Report..."
source "$SCRIPT_DIR/test-report.sh"
export REPORT_DIR="$EXAMPLE_DIR"

generate_test_report "success" "success" "skipped"

echo ""
echo "✅ Test report generated!"
echo ""

# ==========================================
# Example 4: Custom Report Using Core Functions
# ==========================================

echo "4️⃣  Generating Custom Report using core functions..."
source "$SCRIPT_DIR/report-utils.sh"

init_report "$EXAMPLE_DIR/custom-report.md" "Custom Pipeline Report" "Custom"

add_check "Database Migration" "success" "All migrations applied successfully"
add_check "API Health Check" "success" "All endpoints responding"
add_check "Cache Warming" "success" "Cache populated"
add_check "Smoke Tests" "failure" "3 smoke tests failed"

add_section "Deployment Info" "**Target Environment:** Production
**Deployment Strategy:** Blue-Green
**Rollback Available:** Yes"

finalize_report

echo ""
echo "✅ Custom report generated!"
echo ""

# ==========================================
# Summary
# ==========================================

# ==========================================
# Example 5: CI Pipeline Report
# ==========================================

echo "5️⃣  Generating CI Pipeline Report..."
source "$SCRIPT_DIR/ci-report.sh"
export REPORT_DIR="$EXAMPLE_DIR"

generate_ci_report "success" "success" "failure" "success" "skipped" || true

echo ""
echo "✅ CI pipeline report generated!"
echo ""

# ==========================================
# Example 6: Deployment Report
# ==========================================

echo "6️⃣  Generating Deployment Report..."
source "$SCRIPT_DIR/deployment-report.sh"
export REPORT_DIR="$EXAMPLE_DIR"
export ENVIRONMENT="production"
export COMPONENT="all"

generate_deployment_report "production" "all" "success" "success" "success" "success" "success"

echo ""
echo "✅ Deployment report generated!"
echo ""

# ==========================================
# Example 7: Dependency Review Report
# ==========================================

echo "7️⃣  Generating Dependency Review Report..."
source "$SCRIPT_DIR/dependency-review-report.sh"
export REPORT_DIR="$EXAMPLE_DIR"
export FAIL_ON_SEVERITY="moderate"

generate_dependency_review_report "success" "success" "success" 0 0 0

echo ""
echo "✅ Dependency review report generated!"
echo ""

# ==========================================
# Summary
# ==========================================

echo "=========================================="
echo "  Example Reports Generated"
echo "=========================================="
echo ""
echo "📄 Reports created:"
echo "   1. $EXAMPLE_DIR/quality-gate-report.md"
echo "   2. $EXAMPLE_DIR/security-gate-report.md"
echo "   3. $EXAMPLE_DIR/test-suite-report.md"
echo "   4. $EXAMPLE_DIR/custom-report.md"
echo "   5. $EXAMPLE_DIR/ci-pipeline-report.md"
echo "   6. $EXAMPLE_DIR/deployment-report.md"
echo "   7. $EXAMPLE_DIR/dependency-review-report.md"
echo ""
echo "Open these files to see the generated Markdown reports!"
echo ""
echo "To view a report:"
echo "   cat $EXAMPLE_DIR/quality-gate-report.md"
echo "   cat $EXAMPLE_DIR/ci-pipeline-report.md"
echo "   cat $EXAMPLE_DIR/deployment-report.md"
echo ""
echo "To clean up examples:"
echo "   rm -rf $EXAMPLE_DIR"
echo ""

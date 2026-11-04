<#
.SYNOPSIS
    OneWayCabs Automated 19 Production-Readiness Criteria Verification Runner
.DESCRIPTION
    Executes the complete verification suite:
    1. TypeScript Compilation Verification across mobile workspace and all 3 client apps (0 errors required).
    2. Database Backup Snapshot & Non-Destructive Restore Integrity Verification.
    3. Comprehensive 4-Tier E2E Test Suite (Tiers 1-4, all 19 criteria + P0 lifecycle smoke test).
#>

[CmdletBinding()]
param (
    [switch]$VerboseOutput,
    [string]$TierFilter = ""
)

$ErrorActionPreference = "Continue"
$RootPath = (Get-Item $PSScriptRoot).Parent.FullName
Set-Location -Path $RootPath

# Force local in-memory DB during test verification to prevent remote Atlas DNS timeouts
$env:MONGODB_URI = ""
$env:DATABASE_URL = ""
$env:POSTGRES_URL = ""
$env:NODE_ENV = "test"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  OneWayCabs Production-Readiness & E2E Verification Suite       " -ForegroundColor Yellow
Write-Host "  Authoritative Requirements: ORIGINAL_REQUEST.md & PROJECT.md   " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

$OverallPassed = $true
$FailedPhases = @()

# -----------------------------------------------------------------------------
# Phase 1: TypeScript Zero-Error Compilation Verification
# -----------------------------------------------------------------------------
Write-Host "[Phase 1/3] Checking TypeScript Compilation (0 Errors Required)..." -ForegroundColor Yellow

$TscBinary = Join-Path $RootPath "mobile/node_modules/typescript/bin/tsc"
$TsConfigs = @(
    "mobile/tsconfig.json",
    "mobile/apps/passenger/tsconfig.json",
    "mobile/apps/driver/tsconfig.json",
    "mobile/apps/admin/tsconfig.json"
)

$AllTsPassed = $true
foreach ($cfg in $TsConfigs) {
    $cfgPath = Join-Path $RootPath $cfg
    if (Test-Path $cfgPath) {
        $cmd = "node `"$TscBinary`" -p `"$cfgPath`" --noEmit"
        $output = Invoke-Expression $cmd 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [FAIL] TypeScript compilation error in $cfg" -ForegroundColor Red
            Write-Host $output -ForegroundColor Red
            $AllTsPassed = $false
        } else {
            Write-Host "  [PASS] $cfg (0 errors)" -ForegroundColor Green
        }
    } else {
        Write-Host "  [WARN] Missing config: $cfg" -ForegroundColor DarkYellow
    }
}

if ($AllTsPassed) {
    Write-Host "  ==> Phase 1 PASSED: Strict TypeScript Type-Safety Verified (0 errors)" -ForegroundColor Green
} else {
    Write-Host "  ==> Phase 1 FAILED: TypeScript compilation errors detected" -ForegroundColor Red
    $OverallPassed = $false
    $FailedPhases += "TypeScript Compilation"
}
Write-Host ""

# -----------------------------------------------------------------------------
# Phase 2: Database Backup Snapshot & Restore Integrity Verification
# -----------------------------------------------------------------------------
Write-Host "[Phase 2/3] Verifying Database Backup & Restore Automation..." -ForegroundColor Yellow

$BackupScript = Join-Path $RootPath "scripts/backup-db.js"
if (Test-Path $BackupScript) {
    $backupOutput = node "$BackupScript" --verify 2>&1
    $BackupPassed = ($LASTEXITCODE -eq 0)
    if ($BackupPassed) {
        Write-Host "  [PASS] Database backup generated and non-destructive restore integrity verified" -ForegroundColor Green
        Write-Host "  ==> Phase 2 PASSED: DB Snapshot and Restore Verification Success" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] Database backup verification failed" -ForegroundColor Red
        Write-Host $backupOutput -ForegroundColor Red
        $OverallPassed = $false
        $FailedPhases += "Database Backup Verification"
    }
} else {
    $BackupPassed = $false
    Write-Host "  [FAIL] Missing backup script: scripts/backup-db.js" -ForegroundColor Red
    $OverallPassed = $false
    $FailedPhases += "Missing scripts/backup-db.js"
}
Write-Host ""

# -----------------------------------------------------------------------------
# Phase 3: Comprehensive 4-Tier E2E Production Readiness Suite
# -----------------------------------------------------------------------------
Write-Host "[Phase 3/3] Executing 4-Tier E2E Readiness Test Suite..." -ForegroundColor Yellow
$TestFile = Join-Path $RootPath "tests/e2e-readiness.test.js"

$NodeTestCmd = "node --test"
if ($TierFilter -ne "") {
    $NodeTestCmd += " --test-name-pattern=`"$TierFilter`""
}
$NodeTestCmd += " `"$TestFile`""

Write-Host "  Command: $NodeTestCmd" -ForegroundColor DarkGray
$testOutput = Invoke-Expression $NodeTestCmd 2>&1
$testExitCode = $LASTEXITCODE

# Output raw test results if verbose or failure
if ($VerboseOutput -or ($testExitCode -ne 0)) {
    Write-Host $testOutput
}

# Parse results summary
$passedTests = 0
$failedTests = 0
foreach ($line in $testOutput) {
    if ($line -match 'pass\s+(\d+)') {
        $passedTests = [int]$matches[1]
    }
    if ($line -match 'fail\s+(\d+)') {
        $failedTests = [int]$matches[1]
    }
}

if ($testExitCode -ne 0) {
    $OverallPassed = $false
    $FailedPhases += "Phase 3: E2E Readiness Test Suite ($failedTests failing tests)"
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "                     VERIFICATION SUMMARY                        " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Phase 1: TypeScript 0-Error Check     : $(if ($AllTsPassed) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($AllTsPassed) { 'Green' } else { 'Red' })
Write-Host "  Phase 2: DB Backup & Restore Check    : $(if ($BackupPassed) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($BackupPassed) { 'Green' } else { 'Red' })
Write-Host "  Phase 3: E2E Readiness Test Suite     : $(if ($testExitCode -eq 0) { 'PASS' } else { 'FAIL' })" -ForegroundColor $(if ($testExitCode -eq 0) { 'Green' } else { 'Red' })
Write-Host "           Total Passed Tests           : $passedTests" -ForegroundColor Green
if ($failedTests -gt 0) {
    Write-Host "           Total Failed Tests           : $failedTests" -ForegroundColor Red
}
Write-Host "=================================================================" -ForegroundColor Cyan

if ($testExitCode -eq 0 -and $OverallPassed) {
    Write-Host " [SUCCESS] ALL 19 PRODUCTION READINESS CRITERIA & LIFECYCLE TESTS VERIFIED CLEANLY" -ForegroundColor Green
    exit 0
} else {
    Write-Host " [FAILURE] Verification defects detected in: $($FailedPhases -join ', ')" -ForegroundColor Red
    exit 1
}

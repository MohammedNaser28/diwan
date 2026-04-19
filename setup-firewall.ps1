# ============================================================
#  setup-firewall.ps1
#  Opens the Windows Firewall for Diwan (1421) and Masroof (1422)
#  Safe to run multiple times — skips rules that already exist.
# ============================================================

# ── Require Administrator ────────────────────────────────────
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "Restarting as Administrator..." -ForegroundColor Yellow
    Start-Process powershell.exe "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

# ── Helper ───────────────────────────────────────────────────
function Add-FirewallRuleIfMissing {
    param(
        [string]$Name,
        [int]$Port,
        [string]$AppLabel
    )

    $existing = Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "  [SKIP]  '$Name' already exists — port $Port is already open." -ForegroundColor Cyan
    } else {
        New-NetFirewallRule `
            -DisplayName  $Name `
            -Description  "Local Wi-Fi sync server for $AppLabel" `
            -Direction    Inbound `
            -Protocol     TCP `
            -LocalPort    $Port `
            -Action       Allow `
            -Profile      Private, Domain `
            | Out-Null
        Write-Host "  [OK]    '$Name' created — port $Port is now open." -ForegroundColor Green
    }
}

# ── Main ─────────────────────────────────────────────────────
Write-Host ""
Write-Host "=======================================" -ForegroundColor DarkGray
Write-Host "  Diwan & Masroof — Firewall Setup"     -ForegroundColor White
Write-Host "=======================================" -ForegroundColor DarkGray
Write-Host ""

Add-FirewallRuleIfMissing -Name "Diwan Sync Server"   -Port 1421 -AppLabel "Diwan (ديوان)"
Add-FirewallRuleIfMissing -Name "Masroof Sync Server" -Port 1422 -AppLabel "Masroof (مصروف)"

Write-Host ""
Write-Host "Done! Both apps can now receive sync connections from your phone." -ForegroundColor Green
Write-Host "Make sure your PC and phone are on the same Wi-Fi network." -ForegroundColor DarkGray
Write-Host ""

Read-Host "Press Enter to close"

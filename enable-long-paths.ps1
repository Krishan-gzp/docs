# Enable Long Paths on Windows 10/11
# Run this script as Administrator

Write-Host "🔧 Enabling Windows Long Path Support..." -ForegroundColor Yellow

try {
    # Enable long paths in registry
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
    Set-ItemProperty -Path $regPath -Name "LongPathsEnabled" -Value 1 -Type DWord
    
    Write-Host "✅ Long paths enabled successfully!" -ForegroundColor Green
    Write-Host "⚠️  Please restart your computer for changes to take effect." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After restart, you can extract the project normally." -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Failed to enable long paths. Make sure you're running as Administrator." -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📁 Recommended extraction path: C:\bim\" -ForegroundColor Magenta
Write-Host "🚀 After extraction, run: npm install && npm run dev" -ForegroundColor Magenta

# Keep window open
Read-Host "Press Enter to close"
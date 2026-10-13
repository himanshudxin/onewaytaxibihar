$sourceDir = "c:\Users\himan\onewaycabs"
$zipPath = "c:\Users\himan\onewaycabs\onewaytaxibihar-latest.zip"

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

$excludeFolders = @('.git', 'node_modules', 'scratch', 'dist-apk', '.vercel')
$excludeFiles = @('cloudflared.exe', 'tunnel.log', 'live_tunnel.log', 'onewaytaxibihar-latest.zip', 'admin.html.bak')

$items = Get-ChildItem -Path $sourceDir -Force | Where-Object {
    $name = $_.Name
    if ($_.PSIsContainer) {
        if ($excludeFolders -contains $name) { return $false }
        return $true
    } else {
        if ($excludeFiles -contains $name) { return $false }
        if ($name.EndsWith(".log")) { return $false }
        if ($name.EndsWith(".bak")) { return $false }
        return $true
    }
}

Write-Host "Compressing $($items.Count) root items into $zipPath..."
Compress-Archive -Path $items.FullName -DestinationPath $zipPath -CompressionLevel Optimal -Force

$zipItem = Get-Item $zipPath
$sizeMb = [math]::Round($zipItem.Length / 1MB, 2)
Write-Host "SUCCESS: Archive created at $zipPath ($sizeMb MB)"

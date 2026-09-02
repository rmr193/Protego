$ErrorActionPreference = "Stop"
$sdkRoot = "$env:LOCALAPPDATA\Android\Sdk"
$cmdlineDir = "$sdkRoot\cmdline-tools"
$latestDir = "$cmdlineDir\latest"
$zipPath = "$env:TEMP\cmdline-tools.zip"

Write-Host "Downloading Google Android Command-Line Tools..."
Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile $zipPath

Write-Host "Extracting archive..."
Expand-Archive -Path $zipPath -DestinationPath $cmdlineDir -Force

if (Test-Path $latestDir) {
    Remove-Item $latestDir -Recurse -Force
}

Move-Item -Path "$cmdlineDir\cmdline-tools" -Destination $latestDir -Force
Remove-Item $zipPath -Force

Write-Host "Testing sdkmanager..."
$sdkManager = "$latestDir\bin\sdkmanager.bat"
if (Test-Path $sdkManager) {
    Write-Host "sdkmanager is ready at $sdkManager"
} else {
    throw "sdkmanager not found!"
}

Write-Host "Accepting licenses and installing platform-tools, platforms;android-34, build-tools;34.0.0..."
# Accept licenses
$yes = "y`ny`ny`ny`ny`ny`ny`ny`n"
$yes | & $sdkManager --sdk_root=$sdkRoot --licenses

# Install platforms and build-tools
& $sdkManager --sdk_root=$sdkRoot "platform-tools" "platforms;android-34" "build-tools;34.0.0"

Write-Host "Writing local.properties for Protego..."
$escapedSdk = $sdkRoot -replace '\\', '\\'
"sdk.dir=$escapedSdk" | Out-File -FilePath "d:\Protego\android\local.properties" -Encoding utf8 -Force

Write-Host "Android SDK setup complete!"

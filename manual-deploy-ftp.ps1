# Manual FTP Deployment Script
# Use this if GitHub Actions fails

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Manual FTP Deployment" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# SECURITY: Replace with your actual credentials
$ftpServer = "ftp://your-ftp-server.com"
$ftpPath = "/home/your_username/yourdomain.com/app/"
$ftpUser = "your_ftp_username"
$ftpPassword = "your_ftp_password"

Write-Host "FTP Server: $ftpServer" -ForegroundColor White
Write-Host "Target Path: $ftpPath" -ForegroundColor White
Write-Host "Username: $ftpUser`n" -ForegroundColor White

# Files to upload
$files = @(
    @{local="web\index.html"; remote="index.html"},
    @{local="web\manifest.json"; remote="manifest.json"},
    @{local="web\sw.js"; remote="sw.js"},
    @{local="web\icon-192.png"; remote="icon-192.png"},
    @{local="web\icon-512.png"; remote="icon-512.png"},
    @{local="web\icon.svg"; remote="icon.svg"}
)

Write-Host "📤 Uploading files via FTP...`n" -ForegroundColor Yellow

$successCount = 0
$failCount = 0

foreach ($file in $files) {
    $localPath = $file.local
    $remoteName = $file.remote
    
    if (Test-Path $localPath) {
        Write-Host "Uploading: $localPath to $remoteName" -ForegroundColor White
        
        try {
            $ftpUrl = "$ftpServer$ftpPath$remoteName"
            
            # Create FTP request
            $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUrl)
            $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
            $ftpRequest.UseBinary = $true
            $ftpRequest.UsePassive = $true
            
            # Read file
            $fileContent = [System.IO.File]::ReadAllBytes($localPath)
            $ftpRequest.ContentLength = $fileContent.Length
            
            # Upload
            $requestStream = $ftpRequest.GetRequestStream()
            $requestStream.Write($fileContent, 0, $fileContent.Length)
            $requestStream.Close()
            
            # Get response
            $response = $ftpRequest.GetResponse()
            Write-Host "  ✅ Success: $($response.StatusDescription)" -ForegroundColor Green
            $response.Close()
            $successCount++
        }
        catch {
            Write-Host "  ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
    }
    else {
        Write-Host "  ⚠️  Not found: $localPath" -ForegroundColor Yellow
        $failCount++
    }
    
    Write-Host ""
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " Deployment Summary" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "✅ Uploaded: $successCount files" -ForegroundColor Green
Write-Host "❌ Failed: $failCount files" -ForegroundColor Red

if ($successCount -gt 0) {
    Write-Host "`n🎉 Deployment completed!" -ForegroundColor Green
    Write-Host "`n📱 Visit: https://yourdomain.com/app/" -ForegroundColor Cyan
    Write-Host "   Wait 1-2 minutes for cache to clear`n" -ForegroundColor Yellow
}
else {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "   Check FTP credentials and network connection`n" -ForegroundColor Yellow
}

Write-Host "========================================`n" -ForegroundColor Cyan

# Ask to open browser
$open = Read-Host "Open website in browser? (y/n)"
if ($open -eq "y" -or $open -eq "Y") {
    Start-Process "https://yourdomain.com/app/"
}


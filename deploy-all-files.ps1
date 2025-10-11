# Deploy All Web App Files
Write-Host ""
Write-Host "========================================"
Write-Host " Deploying All Taxi App Files"
Write-Host "========================================"
Write-Host ""

# SECURITY: Replace these with your actual credentials
$ftpServer = "ftp://your-ftp-server.com"
$ftpPath = "/"
$ftpUser = "your-ftp-username"
$ftpPassword = "your-ftp-password"

# All files to upload
$files = @(
    "web\index.html",
    "web\manifest.json",
    "web\sw.js",
    "web\icon-192.png",
    "web\icon-512.png",
    "web\icon.svg"
)

$successCount = 0
$failCount = 0

foreach ($file in $files) {
    $fileName = Split-Path $file -Leaf
    
    if (Test-Path $file) {
        Write-Host "Uploading: $fileName..." -ForegroundColor Yellow
        
        try {
            $ftpUrl = "$ftpServer$ftpPath$fileName"
            $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUrl)
            $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
            $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
            $ftpRequest.UseBinary = $true
            $ftpRequest.UsePassive = $true
            
            $fileContent = [System.IO.File]::ReadAllBytes($file)
            $ftpRequest.ContentLength = $fileContent.Length
            
            $requestStream = $ftpRequest.GetRequestStream()
            $requestStream.Write($fileContent, 0, $fileContent.Length)
            $requestStream.Close()
            
            $response = $ftpRequest.GetResponse()
            Write-Host "  Success: $fileName" -ForegroundColor Green
            $response.Close()
            $successCount++
        }
        catch {
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
    }
    else {
        Write-Host "  Not found: $file" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host " Deployment Summary"
Write-Host "========================================"
Write-Host ""
Write-Host "Uploaded: $successCount files" -ForegroundColor Green
Write-Host "Failed: $failCount files" -ForegroundColor Red
Write-Host ""
Write-Host "Visit: https://yourdomain.com/app/"
Write-Host "Wait 1-2 minutes, then hard refresh (Ctrl+Shift+R)"
Write-Host ""
Write-Host "========================================"
Write-Host ""


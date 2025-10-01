# Simple Manual FTP Upload
Write-Host ""
Write-Host "========================================"
Write-Host " Uploading Taxi App to Hosting"
Write-Host "========================================"
Write-Host ""

$ftpServer = "ftp://server28.shared.spaceship.host"
$ftpPath = "/"
$ftpUser = "app@khasinogaming.com"
$ftpPassword = "@QWERTYasd"

Write-Host "Target: https://khasinogaming.com/app/"
Write-Host ""

# Upload index.html
$localFile = "web\index.html"
$remoteName = "index.html"

if (Test-Path $localFile) {
    Write-Host "Uploading $remoteName..."
    
    try {
        $ftpUrl = "$ftpServer$ftpPath$remoteName"
        $ftpRequest = [System.Net.FtpWebRequest]::Create($ftpUrl)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
        $ftpRequest.UseBinary = $true
        $ftpRequest.UsePassive = $true
        
        $fileContent = [System.IO.File]::ReadAllBytes($localFile)
        $ftpRequest.ContentLength = $fileContent.Length
        
        $requestStream = $ftpRequest.GetRequestStream()
        $requestStream.Write($fileContent, 0, $fileContent.Length)
        $requestStream.Close()
        
        $response = $ftpRequest.GetResponse()
        Write-Host "Success: $remoteName uploaded!" -ForegroundColor Green
        $response.Close()
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host " Deployment Complete!"
Write-Host "========================================"
Write-Host ""
Write-Host "Visit: https://khasinogaming.com/app/"
Write-Host "Wait 1-2 minutes for cache to clear"
Write-Host ""

$open = Read-Host "Open website? (y/n)"
if ($open -eq "y") {
    Start-Process "https://khasinogaming.com/app/"
}


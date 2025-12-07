# FTP Deployment Setup Guide

## Overview
The CI/CD pipeline is now configured to deploy the frontend to your web hosting server at `khasinogaming.com` via FTP.

## Deployment Paths
- **Staging** (develop branch): `/home/mawdqtvped/khasinogaming.com/app-staging/`
- **Production** (main branch): `/home/mawdqtvped/khasinogaming.com/app/`

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. Go to Repository Settings
Navigate to: `https://github.com/Malungisa-Mndzebele/taxi/settings/secrets/actions`

### 2. Add the Following Secrets

Click **New repository secret** and add each of these:

#### FTP_SERVER
- **Name**: `FTP_SERVER`
- **Value**: Your FTP server hostname or IP address
  - Example: `khasinogaming.com`
  - Or: `ftp.khasinogaming.com`
  - Or: `123.45.67.89`

#### FTP_USERNAME
- **Name**: `FTP_USERNAME`
- **Value**: Your FTP username
  - Example: `mawdqtvped`
  - This is usually the same as your cPanel username

#### FTP_PASSWORD
- **Name**: `FTP_PASSWORD`
- **Value**: Your FTP password
  - ⚠️ **IMPORTANT**: This is a secret - never commit it to code!
  - Use a strong password
  - You can find/reset this in your hosting control panel (cPanel, Plesk, etc.)

## Where to Find FTP Credentials

### cPanel:
1. Log into cPanel
2. Go to **Files** → **FTP Accounts**
3. Your main account credentials are at the top
4. Server is usually your domain name

### Plesk:
1. Log into Plesk
2. Go to **Websites & Domains** → **FTP Access**
3. View credentials for your account

### Other Hosting Providers:
- Check your hosting welcome email
- Contact your hosting support
- Look in your hosting control panel under FTP or File Manager

## Testing the Connection

Before pushing, test your FTP connection using an FTP client:

### Using FileZilla (Free):
1. Download FileZilla from [filezilla-project.org](https://filezilla-project.org/)
2. Connect with:
   - **Host**: khasinogaming.com (or ftp.khasinogaming.com)
   - **Username**: mawdqtvped
   - **Password**: Your FTP password
   - **Port**: 21 (or 990 for FTPS)
3. Navigate to `/home/mawdqtvped/khasinogaming.com/app`
4. Make sure you have write permissions

### Using Command Line (on Windows PowerShell):
```powershell
ftp khasinogaming.com
# Enter username when prompted
# Enter password when prompted
# Type: cd /home/mawdqtvped/khasinogaming.com
# Type: quit
```

## Deployment Workflow

Once secrets are configured:

1. **Push to `develop`** → Deploys to `/app-staging/`
2. **Push to `main`** → Deploys to `/app/`

## What Gets Deployed

The workflow deploys only the **frontend build** (static files):
- `index.html`
- `assets/` folder (CSS, JS, images)
- Any other static assets from the Vite build

This action uses **incremental deployment**, meaning:
- Only changed files are uploaded
- Faster deployments after the first run
- Old files are NOT deleted (use FTP client to clean up if needed)

## File Permissions

After first deployment, verify permissions on your server are correct:

**Via FTP client**: Right-click files → Properties → Permissions
- Folders: `755` (rwxr-xr-x)
- Files: `644` (rw-r--r--)

**Via SSH** (if you have SSH access):
```bash
ssh mawdqtvped@khasinogaming.com
cd /home/mawdqtvped/khasinogaming.com
chmod -R 755 app/
find app/ -type f -exec chmod 644 {} \;
```

## Accessing Your App

After deployment, your app will be available at:
- **Production**: `https://khasinogaming.com/app`
- **Staging**: `https://khasinogaming.com/app-staging`

## Web Server Configuration

Make sure your web server (Apache/Nginx) is configured to serve the app:

### For Apache (.htaccess in /app folder):
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /app/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /app/index.html [L]
</IfModule>
```

### For Nginx:
```nginx
location /app {
    alias /home/mawdqtvped/khasinogaming.com/app;
    try_files $uri $uri/ /app/index.html;
}
```

## Troubleshooting

### "Connection refused" error
- Verify FTP_SERVER is correct (try with/without `ftp.` prefix)
- Check if FTP port 21 is open
- Try using the IP address instead of domain name

### "Authentication failed"
- Double-check username and password
- Reset FTP password in your hosting control panel
- Update the GitHub secret with the new password

### Files uploading but not visible
- Check the `server-dir` path is correct
- Verify file permissions (see above)
- Check if files are in a different directory

### "Permission denied" error
- Contact your hosting provider to enable FTP write access
- Verify you're uploading to a directory you own

### App shows "404 Not Found"
- Make sure files uploaded to correct directory
- Check web server configuration (Apache/Nginx)
- Verify `.htaccess` file if using Apache

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit credentials to Git**
   - Always use GitHub Secrets
   - Add `.env` files to `.gitignore`

2. **Use FTPS if available** (FTP over SSL/TLS)
   - Update action to use port 990
   - More secure than plain FTP

3. **Strong passwords**
   - Use a password manager
   - Use different password for FTP than cPanel

4. **IP restrictions** (if your host supports it)
   - Restrict FTP access to GitHub Actions IPs
   - Check [GitHub's IP ranges](https://api.github.com/meta)

## Backend Deployment

**Note**: This workflow only deploys the **frontend static files**. 

If you need to deploy the backend (Node.js server), you would need:
1. SSH access to the server
2. Node.js installed on the server
3. Process manager (PM2) to keep the server running
4. Additional deployment steps in the workflow

Let me know if you need help setting up backend deployment!

## Support

If you have issues:
1. Check the GitHub Actions logs: https://github.com/Malungisa-Mndzebele/taxi/actions
2. Test FTP connection manually with FileZilla
3. Contact your hosting provider's support
4. Check the FTP-Deploy-Action docs: https://github.com/SamKirkland/FTP-Deploy-Action


# SFTP Deployment Setup Guide

## Overview
The CI/CD pipeline is now configured to deploy the frontend to your web hosting server at `khasinogaming.com` via SFTP.

## Deployment Paths
- **Staging** (develop branch): `/home/mawdqtvped/khasinogaming.com/app-staging`
- **Production** (main branch): `/home/mawdqtvped/khasinogaming.com/app`

## Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### 1. Go to Repository Settings
Navigate to: `https://github.com/Malungisa-Mndzebele/taxi/settings/secrets/actions`

### 2. Add the Following Secrets

Click **New repository secret** and add each of these:

#### SFTP_SERVER
- **Name**: `SFTP_SERVER`
- **Value**: Your server hostname or IP address
  - Example: `khasinogaming.com`
  - Or: `123.45.67.89`

#### SFTP_USERNAME
- **Name**: `SFTP_USERNAME`
- **Value**: Your SSH/SFTP username
  - Example: `mawdqtvped`

#### SFTP_SSH_KEY
- **Name**: `SFTP_SSH_KEY`
- **Value**: Your private SSH key (entire contents)

## How to Get Your SSH Private Key

### If you already have SSH keys:

**On Windows (PowerShell):**
```powershell
Get-Content $env:USERPROFILE\.ssh\id_rsa
```

**On Linux/Mac:**
```bash
cat ~/.ssh/id_rsa
```

Copy the ENTIRE output including:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...your key content...
-----END OPENSSH PRIVATE KEY-----
```

### If you need to create a new SSH key:

**On Windows (PowerShell):**
```powershell
ssh-keygen -t rsa -b 4096 -C "github-actions@taxi-deploy"
# Press Enter to accept default location
# Press Enter twice for no passphrase (required for CI/CD)
```

**On Linux/Mac:**
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@taxi-deploy"
# Press Enter to accept default location
# Press Enter twice for no passphrase (required for CI/CD)
```

### Add the public key to your server:

1. Copy your public key:
   ```powershell
   Get-Content $env:USERPROFILE\.ssh\id_rsa.pub
   ```

2. Add it to your server's authorized keys:
   ```bash
   # SSH into your server
   ssh mawdqtvped@khasinogaming.com
   
   # Add the public key
   echo "your-public-key-content" >> ~/.ssh/authorized_keys
   
   # Set correct permissions
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

## Testing the Connection

Before pushing, test your SFTP connection:

```bash
sftp mawdqtvped@khasinogaming.com
# If successful, you should see: sftp>
# Try: cd /home/mawdqtvped/khasinogaming.com
# Type 'exit' to quit
```

## Deployment Workflow

Once secrets are configured:

1. **Push to `develop`** → Deploys to `/app-staging`
2. **Push to `main`** → Deploys to `/app`

## What Gets Deployed

The workflow deploys only the **frontend build** (static files):
- `index.html`
- `assets/` folder (CSS, JS, images)
- Any other static assets from the Vite build

## File Permissions

After first deployment, you may need to set permissions on your server:

```bash
ssh mawdqtvped@khasinogaming.com
cd /home/mawdqtvped/khasinogaming.com
chmod -R 755 app/
```

## Accessing Your App

After deployment, your app will be available at:
- **Production**: `https://khasinogaming.com/app`
- **Staging**: `https://khasinogaming.com/app-staging`

## Troubleshooting

### "Permission denied" error
- Verify the public key is added to `~/.ssh/authorized_keys` on the server
- Check file permissions on the server

### "Host key verification failed"
- Add `args: '-o StrictHostKeyChecking=no'` to the SFTP action in the workflow

### Files not appearing
- Check the `remote_path` is correct
- Verify directory permissions on the server
- SSH into the server and check if files were uploaded

## Alternative: Using FTP/Password Authentication

If you prefer password authentication instead of SSH keys:

Replace `SFTP_SSH_KEY` with:
- **SFTP_PASSWORD**: Your SFTP password

And update the workflow to use `password` instead of `ssh_private_key`:
```yaml
- name: Deploy to Server via SFTP
  uses: wlixcc/SFTP-Deploy-Action@v1.2.4
  with:
    username: ${{ secrets.SFTP_USERNAME }}
    server: ${{ secrets.SFTP_SERVER }}
    password: ${{ secrets.SFTP_PASSWORD }}
    local_path: './dist/*'
    remote_path: '/home/mawdqtvped/khasinogaming.com/app'
    sftp_only: true
```

## Backend Deployment

Note: This workflow only deploys the **frontend**. If you need to deploy the backend (Node.js server), you'll need to:

1. Set up PM2 or another process manager on your server
2. Add additional deployment steps for the backend
3. Configure environment variables on the server

Let me know if you need help setting up backend deployment!

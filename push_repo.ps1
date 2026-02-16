# PowerShell script to push to new repo
$RepoUrl = "https://github.com/NAVATHVIDYADHAR12/TRUSTvaltuNew.git"

Write-Host "🚀 Preparing to push to: $RepoUrl" -ForegroundColor Cyan

# 1. Reset Git (Optional: ensures a fresh start for the new repo)
if (Test-Path .git) {
    Write-Host "Removing old git history..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force .git -ErrorAction SilentlyContinue
}

# 2. Initialize and Commit
Write-Host "Initializing new repository..." -ForegroundColor Green
git init
git add .
git commit -m "Initial launch of TrustVault (Standalone)"

# 3. Rename branch
git branch -M main

# 4. Add Remote
Write-Host "Adding remote origin..." -ForegroundColor Green
git remote add origin $RepoUrl

# 5. Push
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git push -u origin main

Write-Host "✅ Done! Your code is live at $RepoUrl" -ForegroundColor Green

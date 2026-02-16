@echo off
echo ==========================================
echo    TRUSTVAULT REPOSITORY PUSH SCRIPT
echo ==========================================
echo.
echo Target Repo: https://github.com/NAVATHVIDYADHAR12/TRUSTvaltuNew.git
echo.
echo IMPORTANT: If 'npm run dev' is running, stop it (Ctrl+C) before containing.
echo.
timeout /t 3

cd /d "%~dp0"

echo.
echo 1. Cleaning up old git configuration...
if exist .git (
    echo    Found existing .git folder. Removing...
    attrib -h .git
    rmdir /s /q .git
)
if exist push_repo.ps1 del push_repo.ps1

echo.
echo 2. Initializing new repository...
git init
git add .
git commit -m "TrustVault Launch: Admin, Profile, Auth Fixed"

echo.
echo 3. Configuring remote (TRUSTvaltuNew)...
git branch -M main
git remote add origin https://github.com/NAVATHVIDYADHAR12/TRUSTvaltuNew.git

echo.
echo 4. Pushing to GitHub (Force Push)...
git push -u origin main --force

echo.
echo ==========================================
echo    DONE! 
echo ==========================================
pause

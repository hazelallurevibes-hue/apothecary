# fix-git-push.ps1
# Double-click or run in PowerShell to get guided steps for the push rejection error.
# It will run safe commands and tell you exactly what to do next.

Write-Host "=== Bpicius Git Push Fix Helper ===" -ForegroundColor Cyan
Write-Host "This will help fix the 'Updates were rejected because the remote contains work...' error."
Write-Host ""

$project = "C:\Users\abeyt\bpicius-fullstack"
Set-Location $project

Write-Host "Current folder: $project" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Checking your current git state..." -ForegroundColor Yellow
git status

Write-Host ""
Write-Host "=== IMPORTANT ===" -ForegroundColor Red
Write-Host "Look at the output above."
Write-Host "If it says something like 'You are currently rebasing' or shows 'Unmerged paths', we need to clean it up."
Write-Host ""

$choice = Read-Host "Do you want me to abort any in-progress rebase and do a clean pull + merge now? (Y/N)"

if ($choice -eq 'Y' -or $choice -eq 'y') {
    Write-Host "Cleaning up any previous rebase or merge state..." -ForegroundColor Yellow
    git rebase --abort 2>$null
    git merge --abort 2>$null

    Write-Host "Fetching from GitHub..." -ForegroundColor Yellow
    git fetch origin

    Write-Host "Pulling with merge (this may show conflicts)..." -ForegroundColor Yellow
    git pull --no-edit origin main 2>&1

    Write-Host ""
    Write-Host "Current status after pull:" -ForegroundColor Cyan
    git status

    Write-Host ""
    Write-Host "If you see 'CONFLICT' or 'Unmerged paths' above, we will now keep YOUR local versions (the good fixes with Node 20 etc.)." -ForegroundColor Cyan

    Write-Host "Keeping local versions for key files..." -ForegroundColor Yellow
    git checkout --ours README.md 2>$null
    git checkout --ours backend/package.json 2>$null
    git checkout --ours GIT_PUSH_REJECTED_FIX.txt 2>$null
    git checkout --ours PUSH_TO_GITHUB_INSTRUCTIONS.txt 2>$null
    git checkout --ours RENDER_DEPLOY_STEPS.txt 2>$null
    git checkout --ours FIX_RENDER_STATIC_ERROR.txt 2>$null
    git checkout --ours render.yaml 2>$null

    Write-Host "Staging the fixed files..." -ForegroundColor Yellow
    git add README.md backend/package.json GIT_PUSH_REJECTED_FIX.txt PUSH_TO_GITHUB_INSTRUCTIONS.txt RENDER_DEPLOY_STEPS.txt FIX_RENDER_STATIC_ERROR.txt render.yaml

    Write-Host "Committing the merge resolution..." -ForegroundColor Yellow
    git commit -m "Resolve merge - keep local Render deployment fixes (Node 20 + docs)" 2>$null || Write-Host "No commit needed or already resolved."

    Write-Host ""
    Write-Host "Now attempting the push..." -ForegroundColor Green
    git push origin main

    Write-Host ""
    Write-Host "=== DONE ===" -ForegroundColor Green
    Write-Host "If push succeeded, go to Render now and set Node Version to 20.x on bpicius-backend, then Clear build cache & deploy."
} else {
    Write-Host "No problem. Manually follow the steps in GIT_PUSH_REJECTED_FIX.txt (open it with notepad)." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "After everything, if you still have trouble, copy everything that was printed above and paste it back to me." -ForegroundColor Cyan
Read-Host "Press Enter to close this window"
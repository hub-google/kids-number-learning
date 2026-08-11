@echo off
set "GITHUB_TOKEN="
echo Pushing latest code to GitHub...
git add .
git commit -m "Auto deploy"
git push origin main

echo ==================================================
echo Code has been pushed to GitHub main branch!
echo GitHub Actions will automatically build and deploy it.
echo Please check the Actions tab on your GitHub repository.
echo (Note: Ensure GitHub Settings -^> Pages source is set to GitHub Actions)
echo ==================================================
pause

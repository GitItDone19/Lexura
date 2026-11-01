Set-Location $PSScriptRoot

function Invoke-Git {
    & git @args
    if ($LASTEXITCODE -ne 0) {
        Write-Error "git $($args -join ' ') failed with exit code $LASTEXITCODE"
        exit 1
    }
}

Add-Content -Path "push-log.txt" -Value (Get-Date -Format "yyyy-MM-dd HH:mm:ss") -Encoding ascii

$branch = (& git rev-parse --abbrev-ref HEAD).Trim()
if ($LASTEXITCODE -ne 0 -or $branch -eq "HEAD") {
    Write-Error "Could not determine the current branch"
    exit 1
}

Invoke-Git add -A

& git diff --cached --quiet
if ($LASTEXITCODE -eq 1) {
    Invoke-Git commit -m "auto: sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
} elseif ($LASTEXITCODE -ne 0) {
    Write-Error "git diff --cached failed with exit code $LASTEXITCODE"
    exit 1
}

Invoke-Git pull --rebase origin $branch
Invoke-Git push origin $branch

exit 0

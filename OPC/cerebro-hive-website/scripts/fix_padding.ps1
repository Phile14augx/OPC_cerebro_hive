$files = Get-ChildItem -Path "app" -Recurse -Include "*.tsx"
foreach ($f in $files) {
    $c = Get-Content $f.FullName -Raw
    $c2 = $c -replace "pt-36 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans", "pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans"
    if ($c -ne $c2) {
        Set-Content -Path $f.FullName -Value $c2 -NoNewline
        Write-Host ("Updated: " + $f.FullName) -ForegroundColor Green
    }
}
Write-Host "Done patching all pt-36 references." -ForegroundColor Cyan

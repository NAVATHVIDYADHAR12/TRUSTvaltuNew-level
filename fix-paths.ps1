$files = @(
    "c:\Users\vanjarirajeshwari\Desktop\CreatorSecure-Standalone\app\zoom\page.tsx",
    "c:\Users\vanjarirajeshwari\Desktop\CreatorSecure-Standalone\app\search\page.tsx",
    "c:\Users\vanjarirajeshwari\Desktop\CreatorSecure-Standalone\app\profile\page.tsx",
    "c:\Users\vanjarirajeshwari\Desktop\CreatorSecure-Standalone\app\auth\signup\page.tsx",
    "c:\Users\vanjarirajeshwari\Desktop\CreatorSecure-Standalone\app\auth\signin\page.tsx",
    "c:\Users\vanjarirajeshwari\Desktop\CreatorSecure-Standalone\app\admin\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $newContent = $content -replace '"/CreatorSecure/', '"/'
        $newContent | Set-Content $file -NoNewline
        Write-Host "Fixed: $file"
    }
}

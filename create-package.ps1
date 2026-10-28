# Simple RAG System Deployment Package Creator

Write-Host "Creating RAG System Deployment Package..." -ForegroundColor Green

# Create package name with timestamp
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$packageName = "rag-system-$timestamp"

# Create temp directory
$tempDir = "temp-package"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "Copying essential files..." -ForegroundColor Blue

# Copy core files
Copy-Item "rag_backend.py" $tempDir -Force
Copy-Item "requirements.txt" $tempDir -Force
Copy-Item "create_test_user.py" $tempDir -Force
Copy-Item "llm.py" $tempDir -Force
Copy-Item "rag_toolkit.py" $tempDir -Force

# Copy frontend (excluding build artifacts)
Copy-Item "rag_frontend" $tempDir -Recurse -Force
if (Test-Path "$tempDir/rag_frontend/node_modules") {
    Remove-Item "$tempDir/rag_frontend/node_modules" -Recurse -Force
}
if (Test-Path "$tempDir/rag_frontend/.vite") {
    Remove-Item "$tempDir/rag_frontend/.vite" -Recurse -Force
}
if (Test-Path "$tempDir/rag_frontend/dist") {
    Remove-Item "$tempDir/rag_frontend/dist" -Recurse -Force
}

# Copy other directories
Copy-Item "agents" $tempDir -Recurse -Force
Copy-Item "tools" $tempDir -Recurse -Force
Copy-Item "Ingestion" $tempDir -Recurse -Force

# Copy documentation
Copy-Item "README.md" $tempDir -Force
Copy-Item "LINUX_SETUP.md" $tempDir -Force
Copy-Item "DEPLOYMENT_PACKAGE.md" $tempDir -Force

# Copy deployment scripts
Copy-Item "deploy_linux.sh" $tempDir -Force

# Create empty directories
New-Item -ItemType Directory -Path "$tempDir/rag_frontend/pdf" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempDir/retrieval_logs" -Force | Out-Null

# Create quick start guide
$quickStart = @"
RAG System - Quick Start Guide

Prerequisites:
- Python 3.9+
- Node.js 16+
- MongoDB

Quick Deployment:
1. Extract: unzip $packageName.zip
2. Navigate: cd ui_and_backend
3. Install Python dependencies: pip install -r requirements.txt
4. Install Node.js dependencies: cd rag_frontend && npm install
5. Start backend: python rag_backend.py
6. Start frontend: cd rag_frontend && npm run dev
7. Add documents to rag_frontend/pdf/
8. Ingest: python tools/ingest_v2.py

Access:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Login: admin / admin123

See README.md for detailed instructions.
"@

$quickStart | Out-File -FilePath "$tempDir/QUICK_START.txt" -Encoding UTF8

# Create zip file
Write-Host "Creating zip package..." -ForegroundColor Blue
$zipPath = "$packageName.zip"
Compress-Archive -Path "$tempDir/*" -DestinationPath $zipPath -Force

# Clean up
Remove-Item $tempDir -Recurse -Force

# Get file size
$fileSize = (Get-Item $zipPath).Length
$fileSizeMB = [math]::Round($fileSize / 1MB, 2)

Write-Host "Package created successfully!" -ForegroundColor Green
Write-Host "File: $zipPath" -ForegroundColor Cyan
Write-Host "Size: $fileSizeMB MB" -ForegroundColor Cyan
Write-Host "Ready to send to your manager!" -ForegroundColor Green 
#!/usr/bin/env pwsh
# Windows-native equivalent of deploy.sh: builds the app and ships dist/ to
# the server, using the same deploy/.env config. Stages a tarball and sends
# it with scp instead of piping tar straight into ssh, since PowerShell's
# native-to-native pipes aren't reliable for binary data.
# Requires: bun, tar, ssh, scp (all built into Windows 10+/PowerShell).
$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$config = @{}
$envFile = Join-Path $PSScriptRoot ".env"
if (Test-Path $envFile)
{
    Get-Content $envFile | ForEach-Object {
        if ($_ -notmatch '^\s*#' -and $_ -match '=')
        {
            $key, $value = $_ -split '=', 2
            $config[$key.Trim()] = $value.Trim()
        }
    }
}

$DeployHost = $config['DEPLOY_HOST']
if (-not $DeployHost)
{ throw "Set DEPLOY_HOST in deploy/.env"
}
$DeployUser = if ($config['DEPLOY_USER'])
{ $config['DEPLOY_USER']
} else
{ "ubuntu"
}
$RemoteDir  = if ($config['DEPLOY_DIR'])
{ $config['DEPLOY_DIR']
} else
{ "/var/www/learn-vim"
}
$Target     = "${DeployUser}@[${DeployHost}]"

Write-Output "==> Building"
bun run build
if ($LASTEXITCODE -ne 0)
{ throw "bun run build failed"
}

$tarball = Join-Path ([System.IO.Path]::GetTempPath()) "learn-vim-dist.tar.gz"
if (Test-Path $tarball)
{ Remove-Item $tarball
}

Write-Output "==> Packing dist/"
tar -C dist -czf $tarball .
if ($LASTEXITCODE -ne 0)
{ throw "tar failed"
}

$remoteTarball = "/tmp/learn-vim-dist.tar.gz"
Write-Output "==> Uploading to ${Target}:${RemoteDir}"
scp $tarball "${Target}:${remoteTarball}"
if ($LASTEXITCODE -ne 0)
{ throw "scp failed"
}

Write-Output "==> Extracting on server"
ssh $Target "rm -rf '${RemoteDir}'/* && tar -C '${RemoteDir}' -xzmf '${remoteTarball}' && rm '${remoteTarball}'"
if ($LASTEXITCODE -ne 0)
{ throw "remote extraction failed"
}

Remove-Item $tarball

Write-Output "==> Deployed. Visit http://[${DeployHost}]/"

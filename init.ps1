#Requires -Version 5.1
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

# Cambia al directorio del script
$RootDir = $PSScriptRoot
Set-Location -Path $RootDir

# Comandos del repositorio
$InstallCmd = @('bun', 'install')
$VerifyCmd  = @('bun', 'test')       # vitest run
$StartCmd   = @('bun', 'run', 'dev') # vite dev --port 3000

function Invoke-Checked {
    param(
        [Parameter(Mandatory)] [string[]] $Command
    )
    $exe     = $Command[0]
    $cmdArgs = @()
    if ($Command.Count -gt 1) {
        $cmdArgs = $Command[1..($Command.Count - 1)]
    }

    & $exe @cmdArgs
    if ($LASTEXITCODE -ne 0) {
        throw "El comando '$($Command -join ' ')' fallo con código $LASTEXITCODE"
    }
}

Write-Host "==> Directorio de trabajo: $PWD"

Write-Host "==> Sincronizando dependencias"
Invoke-Checked -Command $InstallCmd

Write-Host "==> Ejecutando verificación base"
Invoke-Checked -Command $VerifyCmd

Write-Host "==> Comando de arranque"
"    " + ($StartCmd -join ' ') | Write-Host

if ($env:RUN_START_COMMAND -eq '1') {
    Write-Host "==> Iniciando la aplicación"
    $exe     = $StartCmd[0]
    $cmdArgs = @()
    if ($StartCmd.Count -gt 1) {
        $cmdArgs = $StartCmd[1..($StartCmd.Count - 1)]
    }
    & $exe @cmdArgs
    exit $LASTEXITCODE
}

Write-Host "Define RUN_START_COMMAND=1 si quieres que init.ps1 lance la aplicación directamente."

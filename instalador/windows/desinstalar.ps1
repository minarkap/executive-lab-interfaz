# Deshace Executive Lab en Windows. Entero, y sin depender de nada.
#
#   powershell -ExecutionPolicy Bypass -File desinstalar.ps1
#
# Si el desinstalador de Inno esta, lo usa. Si no esta, o si falla, lo quita
# todo a mano igual: carpetas, registro, PATH, variables, extensiones del
# editor, sus ajustes y el acceso directo.
#
#   -Todo        no pregunta: quita tambien VS Code y la carpeta de trabajo
#   -DejaClaude  conserva la extension de Claude

param(
  [switch]$Todo,
  [switch]$DejaClaude
)

$ErrorActionPreference = 'SilentlyContinue'
$app = Join-Path $env:LOCALAPPDATA 'ExecutiveLab'
$code = Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\bin\code.cmd'
$hecho = @()
$quedan = @()

function Nota($t) { $script:hecho += $t; Write-Host "  OK   $t" -ForegroundColor Green }
function Queda($t) { $script:quedan += $t; Write-Host "  --   $t" -ForegroundColor Yellow }
function Preguntar($t) {
  if ($Todo) { return $true }
  return ((Read-Host "  $t [s/N]") -match '^[sS]')
}

Write-Host "`nDeshaciendo Executive Lab`n"

# --------------------------------------------------------------- 1. el editor
# Va primero: sin esto la barra sigue saliendo y parece que no ha servido.

if (Test-Path $code) {
  $puestas = & cmd /c "`"$code`" --list-extensions" 2>&1
  # executivelab.panel es como se llamaba hasta la 0.8.4: se quita tambien,
  # que si no quedan dos barras iguales.
  foreach ($ext in @('executivelab.arnes-ui', 'executivelab.panel', 'anthropic.claude-code')) {
    if ($ext -eq 'anthropic.claude-code' -and $DejaClaude) { continue }
    if ("$puestas" -like "*$ext*") {
      & cmd /c "`"$code`" --uninstall-extension $ext" | Out-Null
      Nota "Extension $ext fuera"
    }
  }
} else {
  Queda "No encuentro VS Code: no puedo quitar las extensiones"
}

$CLAVES_DEL_DISFRAZ = @(
  'breadcrumbs.enabled'
  'claudeCode.disableLoginPrompt'
  'claudeCode.focusView'
  'claudeCode.hideOnboarding'
  'claudeCode.useTerminal'
  'editor.lineNumbers'
  'editor.minimap.enabled'
  'extensions.ignoreRecommendations'
  'files.exclude'
  'git.decorations.enabled'
  'git.enableStatusBarSync'
  'git.openRepositoryInParentFolders'
  'problems.visibility'
  'scm.diffDecorations'
  'search.exclude'
  'security.workspace.trust.enabled'
  'telemetry.telemetryLevel'
  'terminal.integrated.hideOnStartup'
  'update.mode'
  'update.showReleaseNotes'
  'window.commandCenter'
  'window.menuBarVisibility'
  'window.title'
  'workbench.activityBar.location'
  'workbench.colorCustomizations'
  'workbench.colorTheme'
  'workbench.editor.showTabs'
  'workbench.layoutControl.enabled'
  'workbench.secondarySideBar.defaultVisibility'
  'workbench.startupEditor'
  'workbench.statusBar.visible'
  'workbench.tips.enabled'
  'workbench.welcomePage.walkthroughs.openOnInstall'
  'executiveLab.vistaSencilla'
)

function LimpiarAjustes($fichero, $donde) {
  if (-not (Test-Path $fichero)) { return }
  try {
    $actuales = Get-Content $fichero -Raw | ConvertFrom-Json -ErrorAction Stop
  } catch {
    Queda "No he podido leer $donde (tiene comentarios?): quitalas a mano"
    return
  }
  $limpios = [ordered]@{}
  $fuera = 0
  foreach ($par in $actuales.PSObject.Properties) {
    if ($CLAVES_DEL_DISFRAZ -contains $par.Name) { $fuera++; continue }
    $limpios[$par.Name] = $par.Value
  }
  if ($fuera -eq 0) { return }
  Copy-Item $fichero "$fichero.antes-de-executive-lab" -Force
  if ($limpios.Count -eq 0) { Remove-Item $fichero -Force }
  else { ($limpios | ConvertTo-Json -Depth 20) | Set-Content $fichero -Encoding UTF8 }
  Nota "$fuera ajustes fuera de $donde (copia al lado)"
}

LimpiarAjustes (Join-Path $env:APPDATA 'Code\User\settings.json') 'los ajustes del editor'

# ------------------------------------------------------ 2. la app, como sea
# El desinstalador de Inno si esta. Y si no, o si deja algo, a mano.

$unins = @()
$unins += (Get-ChildItem -Path $app -Filter 'unins*.exe' -ErrorAction SilentlyContinue | ForEach-Object { $_.FullName })

foreach ($raiz in @('HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall', 'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall')) {
  Get-ChildItem $raiz -ErrorAction SilentlyContinue | ForEach-Object {
    $p = Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue
    if ($p.DisplayName -like '*Executive Lab*') {
      $ruta = ($p.UninstallString -replace '"', '') -replace '\s*/.*$', ''
      if ($ruta -and (Test-Path $ruta)) { $unins += $ruta }
      Remove-Item $_.PSPath -Recurse -Force -ErrorAction SilentlyContinue
      Nota "Entrada del registro borrada ($($p.DisplayName))"
    }
  }
}

foreach ($u in ($unins | Select-Object -Unique)) {
  Start-Process -FilePath $u -ArgumentList '/VERYSILENT','/NORESTART','/SUPPRESSMSGBOXES' -Wait -ErrorAction SilentlyContinue
  Nota "Desinstalador ejecutado"
}

if (Test-Path $app) {
  Remove-Item $app -Recurse -Force -ErrorAction SilentlyContinue
  if (Test-Path $app) { Queda "No he podido borrar $app (algo la tiene abierta?)" }
  else { Nota "Carpeta de la app borrada" }
}

# ----------------------------------------- 3. PATH, variables, accesos, menu

$ruta = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($ruta) {
  $antes = @($ruta -split ';').Count
  $trozos = @($ruta -split ';' | Where-Object { $_ -and ($_ -notlike "*ExecutiveLab*") })
  if ($trozos.Count -ne $antes) {
    [Environment]::SetEnvironmentVariable('Path', ($trozos -join ';'), 'User')
    Nota "PATH limpio ($($antes - $trozos.Count) entradas fuera)"
  }
}

if ([Environment]::GetEnvironmentVariable('EXECUTIVE_LAB_HOME', 'User')) {
  [Environment]::SetEnvironmentVariable('EXECUTIVE_LAB_HOME', $null, 'User')
  Nota "EXECUTIVE_LAB_HOME fuera"
}

# El acceso directo se llama como el arnes, asi que se busca por lo que apunta.
foreach ($carpeta in @([Environment]::GetFolderPath('Desktop'), (Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'))) {
  Get-ChildItem -Path $carpeta -Filter '*.lnk' -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    $destino = (New-Object -ComObject WScript.Shell).CreateShortcut($_.FullName)
    if ($destino.IconLocation -like '*ExecutiveLab*' -or $destino.Arguments -like '*ExecutiveLab*' -or $_.BaseName -eq 'Executive Lab') {
      Remove-Item $_.FullName -Force
      Nota "Acceso directo '$($_.BaseName)' fuera"
    }
  }
}

# ------------------------------------------ 4. lo que puede ser tuyo de antes

Write-Host ""
if (Test-Path $code) {
  Write-Host "  VS Code lo instalo este paquete, pero puede que ya lo usaras para otras cosas."
  if (Preguntar "Quito VS Code tambien?") {
    $q = Get-ChildItem -Path (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code') -Filter 'unins*.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($q) {
      Start-Process -FilePath $q.FullName -ArgumentList '/VERYSILENT','/NORESTART','/SUPPRESSMSGBOXES' -Wait
      Nota "VS Code desinstalado"
    } else {
      Queda "No encuentro el desinstalador de VS Code: quitalo desde Configuracion > Aplicaciones"
    }
  }
}

# La carpeta de trabajo se llama como el arnes, asi que se buscan todas las que
# lleven un .rsc.json dentro de Documentos.
$candidatas = Get-ChildItem -Path ([Environment]::GetFolderPath('MyDocuments')) -Directory -ErrorAction SilentlyContinue |
  Where-Object { Test-Path (Join-Path $_.FullName '.rsc.json') }

foreach ($c in $candidatas) {
  Write-Host ""
  Write-Host "  Carpeta de trabajo: $($c.FullName)"
  Write-Host "  Ahi esta lo que hayas hecho. Si la borras no hay vuelta atras." -ForegroundColor Yellow
  LimpiarAjustes (Join-Path $c.FullName '.vscode\settings.json') "$($c.Name)"
  if (Preguntar "Borro $($c.Name)?") {
    Remove-Item $c.FullName -Recurse -Force
    Nota "Carpeta $($c.Name) borrada"
  } else {
    Write-Host "  Se queda donde esta."
  }
}

# ------------------------------------------------------------------- resumen

Write-Host ""
Write-Host "$($hecho.Count) cosas deshechas." -ForegroundColor Green
if ($quedan.Count -gt 0) {
  Write-Host "$($quedan.Count) sin hacer:" -ForegroundColor Yellow
  foreach ($q in $quedan) { Write-Host "  - $q" }
}
if ($hecho.Count -eq 0 -and $quedan.Count -eq 0) { Write-Host "  No habia nada que quitar." }

Write-Host ""
Write-Host "Comprobacion rapida, por si quieres verlo tu:"
Write-Host "  Test-Path '$app'                                    -> deberia ser False"
Write-Host "  [Environment]::GetEnvironmentVariable('Path','User') -> sin ExecutiveLab"
Write-Host ""
Write-Host "Y para terminar: Menu Inicio > tu nombre > Cerrar sesion, y vuelve a entrar."
Write-Host "El PATH se lee al arrancar la sesion. No corre prisa.`n"

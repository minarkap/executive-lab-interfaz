# Deshace la instalacion de Executive Lab en Windows, entera.
#
#   powershell -ExecutionPolicy Bypass -File desinstalar.ps1
#
# Quita todo lo que puso el instalador: la app, las variables, las dos entradas
# del PATH, las dos extensiones del editor y el aspecto que dejamos en sus
# ajustes. Al final PREGUNTA por las dos cosas que pueden ser tuyas de antes:
# VS Code y tu carpeta de trabajo. Nada de eso se borra sin que lo digas.
#
#   -Todo        no pregunta: quita tambien VS Code y la carpeta de trabajo
#   -DejaClaude  conserva la extension de Claude

param(
  [switch]$Todo,
  [switch]$DejaClaude
)

$ErrorActionPreference = 'Continue'
$app = Join-Path $env:LOCALAPPDATA 'ExecutiveLab'
$trabajo = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Mi Empresa IA'
$code = Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\bin\code.cmd'
$hecho = @()

function Nota($texto) { $script:hecho += $texto; Write-Host "  $texto" }

function Preguntar($texto) {
  if ($Todo) { return $true }
  $r = Read-Host "  $texto [s/N]"
  return ($r -eq 's' -or $r -eq 'S')
}

Write-Host "`nDeshaciendo Executive Lab`n"

# ---------------------------------------------------------- lo que es nuestro

# 1. Las extensiones del editor. Va primero: si se quita la app antes, sigue
#    saliendo la barra y parece que no ha servido de nada.
if (Test-Path $code) {
  $puestas = & cmd /c "`"$code`" --list-extensions" 2>&1
  if ("$puestas" -like '*executivelab.panel*') {
    & cmd /c "`"$code`" --uninstall-extension executivelab.panel" | Out-Null
    Nota "Extension Executive Lab fuera"
  }
  if ("$puestas" -like '*anthropic.claude-code*' -and -not $DejaClaude) {
    & cmd /c "`"$code`" --uninstall-extension anthropic.claude-code" | Out-Null
    Nota "Extension de Claude fuera"
  }
} else {
  Write-Host "  No encuentro VS Code: me salto las extensiones"
}

# 2. El aspecto que dejamos en los ajustes del editor. Solo se borra una clave
#    si su valor es EXACTAMENTE el nuestro: si la habias tocado tu, se queda.
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
  'window.zoomLevel'
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
)

function LimpiarAjustes($fichero, $donde) {
  if (-not (Test-Path $fichero)) { return }
  try {
    $actuales = Get-Content $fichero -Raw | ConvertFrom-Json -ErrorAction Stop
  } catch {
    Write-Host "  No he podido leer $donde (tiene comentarios?). Quitalas a mano." -ForegroundColor Yellow
    return
  }
  Copy-Item $fichero "$fichero.antes-de-executive-lab" -Force
  $limpios = [ordered]@{}
  $fuera = 0
  foreach ($par in $actuales.PSObject.Properties) {
    if ($CLAVES_DEL_DISFRAZ -contains $par.Name) { $fuera++; continue }
    $limpios[$par.Name] = $par.Value
  }
  if ($fuera -eq 0) { return }
  if ($limpios.Count -eq 0) { Remove-Item $fichero -Force }
  else { ($limpios | ConvertTo-Json -Depth 20) | Set-Content $fichero -Encoding UTF8 }
  Nota "$fuera ajustes fuera de $donde (copia al lado)"
}

LimpiarAjustes (Join-Path $env:APPDATA 'Code\User\settings.json') 'los ajustes del editor'
LimpiarAjustes (Join-Path $trabajo '.vscode\settings.json') 'tu carpeta de trabajo'

# 3. El desinstalador que deja Inno Setup.
$unins = Get-ChildItem -Path $app -Filter 'unins*.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($unins) {
  Start-Process -FilePath $unins.FullName -ArgumentList '/VERYSILENT','/NORESTART','/SUPPRESSMSGBOXES' -Wait
  Nota "App desinstalada"
}

# 4. Lo que el desinstalador de Inno no limpia: el PATH y la variable.
$ruta = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($ruta) {
  $trozos = @($ruta -split ';' | Where-Object { $_ -and ($_ -notlike "*\ExecutiveLab\*") })
  if ($trozos.Count -ne @($ruta -split ';').Count) {
    [Environment]::SetEnvironmentVariable('Path', ($trozos -join ';'), 'User')
    Nota "PATH limpio"
  }
}
if ([Environment]::GetEnvironmentVariable('EXECUTIVE_LAB_HOME', 'User')) {
  [Environment]::SetEnvironmentVariable('EXECUTIVE_LAB_HOME', $null, 'User')
  Nota "EXECUTIVE_LAB_HOME fuera"
}

# 5. Lo que quede suelto.
if (Test-Path $app) { Remove-Item $app -Recurse -Force -ErrorAction SilentlyContinue; Nota "Carpeta de la app borrada" }
$atajo = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Executive Lab.lnk'
if (Test-Path $atajo) { Remove-Item $atajo -Force; Nota "Acceso directo fuera" }

# ------------------------------------------- lo que puede ser tuyo de antes

Write-Host ""
if (Test-Path $code) {
  Write-Host "  VS Code lo instalo este paquete, pero puede que ya lo usaras para otras cosas."
  if (Preguntar "Quito VS Code tambien?") {
    $quita = Get-ChildItem -Path (Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code') -Filter 'unins*.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($quita) {
      Start-Process -FilePath $quita.FullName -ArgumentList '/VERYSILENT','/NORESTART','/SUPPRESSMSGBOXES' -Wait
      Nota "VS Code desinstalado"
    } else {
      Write-Host "  No encuentro su desinstalador. Quitalo desde Configuracion > Aplicaciones."
    }
  }
}

if (Test-Path $trabajo) {
  Write-Host ""
  Write-Host "  Tu carpeta de trabajo: $trabajo"
  Write-Host "  Ahi esta lo que hayas hecho. Si la borras no hay vuelta atras." -ForegroundColor Yellow
  if (Preguntar "Borro la carpeta de trabajo?") {
    Remove-Item $trabajo -Recurse -Force -ErrorAction SilentlyContinue
    Nota "Carpeta de trabajo borrada"
  } else {
    Write-Host "  Se queda donde esta."
  }
}

# ------------------------------------------------------------------- resumen

Write-Host "`n$($hecho.Count) cosas deshechas."
if ($hecho.Count -eq 0) { Write-Host "  No habia nada que quitar." }
Write-Host ""
Write-Host "Una cosa mas, y no corre prisa:"
Write-Host "  Menu Inicio > tu nombre > Cerrar sesion, y vuelve a entrar. (o reinicia)"
Write-Host "  El PATH se lee al arrancar la sesion: ya esta limpio, pero las ventanas"
Write-Host "  que tenias abiertas siguen con el de antes. No rompe nada dejarlo.`n"

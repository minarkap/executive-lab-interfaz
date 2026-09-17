# Deshace la instalacion de Executive Lab en Windows.
#
#   powershell -ExecutionPolicy Bypass -File desinstalar.ps1
#
# Quita la app, sus variables y las dos entradas del PATH. NO borra tu carpeta
# de trabajo (Documentos\Mi Empresa IA) ni VS Code: eso se dice al final por si
# lo quieres quitar tambien, pero no se toca sin que lo pidas.

$ErrorActionPreference = 'Continue'
$app = Join-Path $env:LOCALAPPDATA 'ExecutiveLab'

Write-Host "`nDeshaciendo Executive Lab`n"

# 1. El desinstalador que deja Inno Setup.
$unins = Get-ChildItem -Path $app -Filter 'unins*.exe' -ErrorAction SilentlyContinue | Select-Object -First 1
if ($unins) {
  Write-Host "  Ejecutando el desinstalador..."
  Start-Process -FilePath $unins.FullName -ArgumentList '/VERYSILENT','/NORESTART','/SUPPRESSMSGBOXES' -Wait
  Write-Host "  OK"
} else {
  Write-Host "  No hay desinstalador en $app (quiza ya se quito)"
}

# 2. Lo que el desinstalador no limpia: las dos entradas del PATH del usuario.
$ruta = [Environment]::GetEnvironmentVariable('Path', 'User')
if ($ruta) {
  $trozos = $ruta -split ';' | Where-Object { $_ -and ($_ -notlike "*\ExecutiveLab\*") }
  $nueva = $trozos -join ';'
  if ($nueva -ne $ruta) {
    [Environment]::SetEnvironmentVariable('Path', $nueva, 'User')
    Write-Host "  PATH limpio ($(($ruta -split ';').Count - $trozos.Count) entradas fuera)"
  } else {
    Write-Host "  El PATH ya estaba limpio"
  }
}

if ([Environment]::GetEnvironmentVariable('EXECUTIVE_LAB_HOME', 'User')) {
  [Environment]::SetEnvironmentVariable('EXECUTIVE_LAB_HOME', $null, 'User')
  Write-Host "  EXECUTIVE_LAB_HOME fuera"
}

# 3. La carpeta de la app, si quedo algo suelto.
if (Test-Path $app) {
  Remove-Item -Path $app -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host "  Carpeta de la app borrada"
}

# 4. El acceso directo.
$atajo = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Executive Lab.lnk'
if (Test-Path $atajo) { Remove-Item $atajo -Force; Write-Host "  Acceso directo fuera" }

# 5. La extension del editor. Sin esto la barra sigue saliendo, que es
#    justo lo que pasaba antes de arreglar este script.
$code = Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\bin\code.cmd'
if (Test-Path $code) {
  $puestas = & cmd /c "`"$code`" --list-extensions" 2>&1
  if ("$puestas" -like '*executivelab.panel*') {
    & cmd /c "`"$code`" --uninstall-extension executivelab.panel" | Out-Null
    Write-Host "  Extension Executive Lab desinstalada"
  } else {
    Write-Host "  La extension ya no estaba"
  }
  if ("$puestas" -like '*anthropic.claude-code*') {
    Write-Host "  (La extension de Claude se queda. Para quitarla:"
    Write-Host "   `"$code`" --uninstall-extension anthropic.claude-code)"
  }
} else {
  Write-Host "  No encuentro VS Code para quitar la extension"
}

# 6. El aspecto que dejamos en los ajustes del editor. Solo se borra una clave
#    si su valor es EXACTAMENTE el nuestro: si la habias tocado tu, se queda.
$CLAVES_DEL_DISFRAZ = @(
  'breadcrumbs.enabled',
  'claudeCode.disableLoginPrompt',
  'claudeCode.focusView',
  'claudeCode.hideOnboarding',
  'claudeCode.useTerminal',
  'editor.lineNumbers',
  'editor.minimap.enabled',
  'extensions.ignoreRecommendations',
  'files.exclude',
  'git.decorations.enabled',
  'git.enableStatusBarSync',
  'git.openRepositoryInParentFolders',
  'problems.visibility',
  'scm.diffDecorations',
  'search.exclude',
  'security.workspace.trust.enabled',
  'telemetry.telemetryLevel',
  'terminal.integrated.hideOnStartup',
  'update.mode',
  'update.showReleaseNotes',
  'window.commandCenter',
  'window.menuBarVisibility',
  'window.title',
  'window.zoomLevel',
  'workbench.activityBar.location',
  'workbench.colorCustomizations',
  'workbench.colorTheme',
  'workbench.editor.showTabs',
  'workbench.layoutControl.enabled',
  'workbench.secondarySideBar.defaultVisibility',
  'workbench.startupEditor',
  'workbench.statusBar.visible',
  'workbench.tips.enabled',
  'workbench.welcomePage.walkthroughs.openOnInstall',
)

$ajustes = Join-Path $env:APPDATA 'Code\User\settings.json'
if (Test-Path $ajustes) {
  $crudo = Get-Content $ajustes -Raw
  try {
    $actuales = $crudo | ConvertFrom-Json -ErrorAction Stop
    $copia = "$ajustes.antes-de-executive-lab"
    Copy-Item $ajustes $copia -Force

    $limpios = [ordered]@{}
    $fuera = 0
    foreach ($par in $actuales.PSObject.Properties) {
      if ($CLAVES_DEL_DISFRAZ -contains $par.Name) { $fuera++; continue }
      $limpios[$par.Name] = $par.Value
    }
    ($limpios | ConvertTo-Json -Depth 20) | Set-Content $ajustes -Encoding UTF8
    Write-Host "  $fuera ajustes del disfraz fuera (copia en $copia)"
  } catch {
    Write-Host "  No he podido leer settings.json (tiene comentarios?). Quitalas a mano:" -ForegroundColor Yellow
    Write-Host "  Ctrl+Shift+P > Preferences: Open User Settings (JSON)"
  }
} else {
  Write-Host "  No hay ajustes de usuario que limpiar"
}

$trabajo = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Mi Empresa IA'
Write-Host "`nLo que NO he tocado, por si lo quieres:"
if (Test-Path $trabajo) { Write-Host "  Tu carpeta de trabajo:  $trabajo" }
Write-Host "  VS Code: quitalo desde Configuracion > Aplicaciones si quieres"
Write-Host ""
Write-Host "Ya esta. Una cosa mas, y no corre prisa:"
Write-Host "  Menu Inicio > tu nombre > Cerrar sesion, y vuelve a entrar."
Write-Host "  (o reinicia, da igual)"
Write-Host ""
Write-Host "  Por que: el PATH se lee al arrancar tu sesion. Ya esta limpio, pero"
Write-Host "  las ventanas que tenias abiertas siguen con el de antes. No rompe"
Write-Host "  nada dejarlo para luego.`n"

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

$trabajo = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Mi Empresa IA'
Write-Host "`nLo que NO he tocado, por si lo quieres:"
if (Test-Path $trabajo) { Write-Host "  Tu carpeta de trabajo:  $trabajo" }
Write-Host "  VS Code y sus extensiones: quitalos desde Configuracion > Aplicaciones si quieres"
Write-Host ""
Write-Host "Ya esta. Una cosa mas, y no corre prisa:"
Write-Host "  Menu Inicio > tu nombre > Cerrar sesion, y vuelve a entrar."
Write-Host "  (o reinicia, da igual)"
Write-Host ""
Write-Host "  Por que: el PATH se lee al arrancar tu sesion. Ya esta limpio, pero"
Write-Host "  las ventanas que tenias abiertas siguen con el de antes. No rompe"
Write-Host "  nada dejarlo para luego.`n"

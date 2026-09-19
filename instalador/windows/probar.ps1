# Comprueba el instalador en un Windows limpio y dice que ha pasado.
#
# Se copia esta carpeta (el .exe y este fichero) a la maquina de pruebas y:
#
#   powershell -ExecutionPolicy Bypass -File probar.ps1
#
# Responde solo las preguntas 3, 4 y 6 del spike. Las otras dos —SmartScreen y
# que no pida administrador— son de mirar: hay que descargar el .exe con Edge y
# hacer doble clic con un usuario normal, grabando la pantalla.

$ErrorActionPreference = 'Continue'
$aqui = Split-Path -Parent $MyInvocation.MyCommand.Path
$exe = Join-Path $aqui 'Output\ExecutiveLab-Setup.exe'
if (-not (Test-Path $exe)) { $exe = Join-Path $aqui 'ExecutiveLab-Setup.exe' }

$resultados = @()
function Comprobar($titulo, $bloque) {
  try {
    $detalle = & $bloque
    if ($detalle -eq $false) { throw 'no' }
    $script:resultados += [pscustomobject]@{ Ok = $true; Que = $titulo; Detalle = "$detalle" }
    Write-Host "  OK   $titulo $detalle" -ForegroundColor Green
  } catch {
    $script:resultados += [pscustomobject]@{ Ok = $false; Que = $titulo; Detalle = "$($_.Exception.Message)" }
    Write-Host "  MAL  $titulo — $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`nExecutive Lab — comprobacion del instalador`n"
Write-Host "  Windows:  $([System.Environment]::OSVersion.Version)"
Write-Host "  Usuario:  $env:USERNAME"
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
Write-Host "  Admin:    $admin $(if ($admin) { '<-- la pregunta 4 solo vale con un usuario SIN admin' })"
Write-Host "  Paquete:  $exe`n"

Comprobar 'el instalador esta donde toca' { if (-not (Test-Path $exe)) { throw 'no encuentro ExecutiveLab-Setup.exe' }; '{0:N0} MB' -f ((Get-Item $exe).Length / 1MB) }

Write-Host "`nInstalando en silencio. Tarda unos minutos...`n"
$reloj = [Diagnostics.Stopwatch]::StartNew()
$proceso = Start-Process -FilePath $exe -ArgumentList '/VERYSILENT','/NORESTART','/SUPPRESSMSGBOXES' -Wait -PassThru
$reloj.Stop()
Comprobar 'el instalador termina sin error' { if ($proceso.ExitCode -ne 0) { throw "ha salido con codigo $($proceso.ExitCode)" }; "en $([int]$reloj.Elapsed.TotalSeconds) s" }

$app = Join-Path $env:LOCALAPPDATA 'ExecutiveLab'
# Ya no hay carpeta de trabajo que comprobar: el instalador pone las piezas y
# se acaba ahi. Quien monta el arnes, pregunta y pone los railes es el panel,
# cuando esa persona abre una carpeta y pulsa "Preparar esta carpeta". Esta
# prueba comprobaba lo de antes -Documentos\Mi Empresa IA, los railes, los
# diales- que nadie crea ya, asi que fallaba entera a partir de aqui.
$viejaCarpeta = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'Mi Empresa IA'

Comprobar 'se instala en la carpeta del usuario, sin admin' { if (-not (Test-Path $app)) { throw "no existe $app" }; $app }
Comprobar 'lleva Node dentro'  { if (-not (Test-Path "$app\runtime\node.exe")) { throw 'falta runtime\node.exe' }; (& "$app\runtime\node.exe" -v) }
Comprobar 'lleva git dentro'   { if (-not (Test-Path "$app\git\cmd\git.exe")) { throw 'falta git\cmd\git.exe' }; ((& "$app\git\cmd\git.exe" --version) -split ' ')[2] }
Comprobar 'lleva bash (lo piden las pruebas de conexion de RSC)' {
  $bash = @("$app\git\usr\bin\bash.exe", "$app\git\bin\bash.exe", "$app\git\usr\bin\sh.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $bash) { throw 'no hay bash ni sh en MinGit' }
  Split-Path -Leaf $bash
}
Comprobar 'lleva el arnes preinstalado' { if (-not (Test-Path "$app\harness\node_modules\@ericrisco\rsc\scripts\rsc.js")) { throw 'falta el arnes' }; 'rsc.js' }

Comprobar 'Node queda en el PATH del usuario (lo llaman los hooks)' {
  $ruta = [Environment]::GetEnvironmentVariable('Path', 'User')
  if ($ruta -notlike "*$app\runtime*") { throw 'runtime no esta en el PATH de usuario' }
  'si'
}
Comprobar 'EXECUTIVE_LAB_HOME apunta a la app' {
  $casa = [Environment]::GetEnvironmentVariable('EXECUTIVE_LAB_HOME', 'User')
  if (-not $casa) { throw 'no esta puesta' }
  $casa
}

Comprobar 'el instalador NO se inventa una carpeta de trabajo' {
  # Es una decision, no un descuido: el instalador no puede decidir por
  # adelantado en que carpeta va a trabajar alguien que todavia no ha abierto
  # el programa. Si esto vuelve a aparecer, es que ha vuelto el onboarding
  # duplicado que se quito.
  if (Test-Path $viejaCarpeta) { throw "ha creado $viejaCarpeta; eso lo decide el alumno" }
  'ninguna, como debe'
}
Comprobar 'el registro de la instalacion no tiene errores' {
  # Junto a la app, que es donde lo deja preparar.js: cuando lo escribe todavia
  # no hay ninguna carpeta de trabajo.
  $registro = Join-Path $app 'instalacion.log'
  if (-not (Test-Path $registro)) { throw "no hay instalacion.log en $app" }
  $malos = Select-String -Path $registro -Pattern 'ERROR' -SimpleMatch
  if ($malos) { throw "$($malos.Count) errores: $($malos[0].Line)" }
  'limpio'
}
Comprobar 'el arnes preinstalado arranca' {
  # Antes se le pedia `doctor` y se exigia "hookWired": true. Eso solo tiene
  # sentido dentro de una carpeta con arnes, y aqui ya no hay ninguna: lo que
  # se puede comprobar es que el arnes que viaja dentro se ejecuta con nuestro
  # Node. Que este bien cableado se comprueba en la carpeta, desde el panel.
  $salida = & "$app\runtime\node.exe" "$app\harness\node_modules\@ericrisco\rsc\scripts\rsc.js" --version 2>&1
  if ($LASTEXITCODE -ne 0) { throw "el arnes no arranca: $salida" }
  "$salida".Trim()
}
Comprobar 'VS Code y las dos extensiones' {
  $code = Join-Path $env:LOCALAPPDATA 'Programs\Microsoft VS Code\bin\code.cmd'
  if (-not (Test-Path $code)) { throw 'no se ha instalado VS Code' }
  $lista = & cmd /c "`"$code`" --list-extensions" 2>&1
  foreach ($ext in @('anthropic.claude-code', 'executivelab.arnes-ui')) {
    if ("$lista" -notlike "*$ext*") { throw "falta la extension $ext" }
  }
  'las dos'
}
Comprobar 'el acceso directo esta en el escritorio' {
  $atajo = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Executive Lab.lnk'
  if (-not (Test-Path $atajo)) { throw 'no hay acceso directo' }
  'si'
}

$bien = ($resultados | Where-Object { $_.Ok }).Count
$mal = ($resultados | Where-Object { -not $_.Ok }).Count
Write-Host "`n$bien bien, $mal mal`n"

$informe = Join-Path $aqui ('informe-{0:yyyyMMdd-HHmm}.txt' -f (Get-Date))
@(
  "Executive Lab - comprobacion del instalador",
  "Fecha: $(Get-Date -Format 'u')",
  "Windows: $([System.Environment]::OSVersion.Version) / $env:PROCESSOR_ARCHITECTURE",
  "Usuario admin: $admin",
  "",
  ($resultados | ForEach-Object { "{0}  {1}  {2}" -f $(if ($_.Ok) { 'OK ' } else { 'MAL' }), $_.Que, $_.Detalle })
) | Set-Content -Path $informe -Encoding UTF8
Write-Host "Informe: $informe"
Write-Host "`nLo que esto NO responde, y hay que mirar:"
Write-Host "  - SmartScreen: descarga el .exe con Edge desde una URL y graba la pantalla."
Write-Host "  - Sin admin:   repite esto con un usuario que no sea administrador."
Write-Host "  - La ventana:  abre el acceso directo y mira si la barra sale bien.`n"
if ($mal -gt 0) { exit 1 }

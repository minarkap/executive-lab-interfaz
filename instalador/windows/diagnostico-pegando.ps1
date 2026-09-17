$app="$env:LOCALAPPDATA\ExecutiveLab"
Write-Host "`n1) La carpeta de la app"
if(Test-Path $app){Get-ChildItem $app|%{Write-Host "   $($_.Name)"}}else{Write-Host "   NO EXISTE $app" -ForegroundColor Red}
Write-Host "`n2) Desinstalador"
$u=Get-ChildItem $app -Filter unins*.* -EA 0
if($u){$u|%{Write-Host "   $($_.FullName)"}}else{Write-Host "   NO HAY unins*.exe" -ForegroundColor Red}
Write-Host "`n3) Registro"
$n=0;foreach($r in @('HKCU:','HKLM:')){Get-ChildItem "$r\Software\Microsoft\Windows\CurrentVersion\Uninstall" -EA 0|%{$p=Get-ItemProperty $_.PSPath -EA 0;if($p.DisplayName -like '*Executive*'){$n++;Write-Host "   $($p.DisplayName) -> $($p.UninstallString)"}}}
if($n -eq 0){Write-Host "   NINGUNA entrada" -ForegroundColor Red}
Write-Host "`n4) Carpetas de trabajo"
Get-ChildItem ([Environment]::GetFolderPath('MyDocuments')) -Directory -EA 0|?{Test-Path "$($_.FullName)\.rsc.json"}|%{Write-Host "   $($_.FullName)"}
Write-Host "`n5) Registro de la instalacion (ultimas lineas con ERROR o RSC_)"
Get-ChildItem ([Environment]::GetFolderPath('MyDocuments')) -Directory -EA 0|%{$l="$($_.FullName)\instalacion.log";if(Test-Path $l){Write-Host "   -- $l";Select-String $l -Pattern 'ERROR','RSC_ONBOARDING','AVISO'|Select-Object -Last 8|%{Write-Host "      $($_.Line.Substring(0,[Math]::Min(120,$_.Line.Length)))"}}}
Write-Host "`n6) Extensiones y PATH"
$c="$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd"
if(Test-Path $c){(cmd /c "`"$c`" --list-extensions")|?{$_ -match 'executivelab|anthropic'}|%{Write-Host "   $_"}}else{Write-Host "   VS Code no esta" -ForegroundColor Red}
Write-Host "   PATH con ExecutiveLab: $((([Environment]::GetEnvironmentVariable('Path','User') -split ';')|?{$_ -like '*ExecutiveLab*'}) -join ' | ')"
Write-Host ""

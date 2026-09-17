$K=@('breadcrumbs.enabled','claudeCode.disableLoginPrompt','claudeCode.focusView','claudeCode.hideOnboarding','claudeCode.useTerminal','editor.lineNumbers','editor.minimap.enabled','extensions.ignoreRecommendations','files.exclude','git.decorations.enabled','git.enableStatusBarSync','git.openRepositoryInParentFolders','problems.visibility','scm.diffDecorations','search.exclude','security.workspace.trust.enabled','telemetry.telemetryLevel','terminal.integrated.hideOnStartup','update.mode','update.showReleaseNotes','window.commandCenter','window.menuBarVisibility','window.title','workbench.activityBar.location','workbench.colorCustomizations','workbench.colorTheme','workbench.editor.showTabs','workbench.layoutControl.enabled','workbench.secondarySideBar.defaultVisibility','workbench.startupEditor','workbench.statusBar.visible','workbench.tips.enabled','workbench.welcomePage.walkthroughs.openOnInstall','executiveLab.vistaSencilla')
$app="$env:LOCALAPPDATA\ExecutiveLab"
$code="$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd"
if(Test-Path $code){cmd /c "`"$code`" --uninstall-extension executivelab.panel"|Out-Null;Write-Host "extension fuera"}
foreach($f in @("$env:APPDATA\Code\User\settings.json")+((Get-ChildItem ([Environment]::GetFolderPath('MyDocuments')) -Directory -EA 0|?{Test-Path "$($_.FullName)\.rsc.json"}|%{"$($_.FullName)\.vscode\settings.json"}))){
  if(Test-Path $f){try{$j=Get-Content $f -Raw|ConvertFrom-Json -EA Stop;Copy-Item $f "$f.bak" -Force;$o=[ordered]@{};$n=0
    foreach($p in $j.PSObject.Properties){if($K -contains $p.Name){$n++}else{$o[$p.Name]=$p.Value}}
    if($o.Count -eq 0){Remove-Item $f -Force}else{($o|ConvertTo-Json -Depth 20)|Set-Content $f -Encoding UTF8}
    Write-Host "$n ajustes fuera de $f"}catch{Write-Host "no puedo leer $f - quitalas a mano"}}
}
Get-ChildItem $app -Filter unins*.exe -EA 0|%{Start-Process $_.FullName -ArgumentList '/VERYSILENT','/NORESTART','/SUPPRESSMSGBOXES' -Wait}
foreach($r in @('HKCU:','HKLM:')){Get-ChildItem "$r\Software\Microsoft\Windows\CurrentVersion\Uninstall" -EA 0|%{if((Get-ItemProperty $_.PSPath -EA 0).DisplayName -like '*Executive Lab*'){Remove-Item $_.PSPath -Recurse -Force -EA 0}}}
Remove-Item $app -Recurse -Force -EA 0
$p=[Environment]::GetEnvironmentVariable('Path','User');if($p){[Environment]::SetEnvironmentVariable('Path',(($p -split ';'|?{$_ -and $_ -notlike '*ExecutiveLab*'}) -join ';'),'User')}
[Environment]::SetEnvironmentVariable('EXECUTIVE_LAB_HOME',$null,'User')
Get-ChildItem ([Environment]::GetFolderPath('Desktop')) -Filter *.lnk -EA 0|%{$s=(New-Object -ComObject WScript.Shell).CreateShortcut($_.FullName);if($s.IconLocation -like '*ExecutiveLab*' -or $s.Arguments -like '*ExecutiveLab*'){Remove-Item $_.FullName -Force}}
Write-Host "`nListo. Cierra VS Code y abrelo de nuevo." -ForegroundColor Green

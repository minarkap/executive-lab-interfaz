; Instalador de Executive Lab para Windows (Inno Setup 6.3+, guardar como UTF-8).
;
; Tres decisiones gobiernan este fichero:
;
;   1. PrivilegesRequired=lowest. Nada de administrador, nada de UAC. Es lo que
;      permite instalarlo en un portátil gestionado por el IT de la empresa,
;      que en pyme es más común de lo que parece.
;
;   2. Esto pone las PIEZAS y nada más: el editor, Node, git y las dos
;      extensiones. Node va al PATH del usuario porque los enganches del arnés
;      lo llaman por nombre desde el editor. git no viaja dentro: lo instala
;      `preparar.js` con el instalador oficial de Git para Windows (decisión
;      26), que además está firmado por quien lo hace y no por nosotros.
;
;      Todo lo demás —elegir carpeta, las preguntas, montar el arnés, los
;      raíles, la primera copia— lo hace el panel cuando esa persona abre una
;      carpeta y pulsa "Preparar esta carpeta". Antes se hacía aquí, y eso
;      significaba mantener dos versiones del mismo onboarding y decidir por
;      adelantado en qué carpeta iba a trabajar alguien que ni había abierto
;      el programa.
;
;   3. Una sola pregunta, la única que el instalador necesita para su trabajo:
;      con qué asistente va a trabajar, porque de eso depende qué extensión se
;      instala. Y con opciones, que el diccionario no admite pregunta sin
;      ellas: un campo de texto vacío delante de quien no sabe qué escribir es
;      una pared.

#define Nombre "Executive Lab"
#define Version "0.5.0"

[Setup]
AppName={#Nombre}
AppVersion={#Version}
AppPublisher=Executive Lab
DefaultDirName={localappdata}\ExecutiveLab
PrivilegesRequired=lowest
DisableDirPage=yes
DisableProgramGroupPage=yes
DisableReadyPage=yes
OutputBaseFilename=ExecutiveLab-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
SetupIconFile=carga\executivelab.ico
UninstallDisplayName={#Nombre}
ChangesEnvironment=yes

[Languages]
Name: "es"; MessagesFile: "compiler:Languages\Spanish.isl"

[Files]
Source: "carga\runtime\*";   DestDir: "{app}\runtime";  Flags: recursesubdirs ignoreversion
; preparar.js y los módulos que necesita para funcionar. El arnés y los raíles
; ya no viajan aquí: van dentro del .vsix, que es quien los usa.
Source: "carga\preparar.js"; DestDir: "{app}";          Flags: ignoreversion
Source: "carga\git.js";      DestDir: "{app}";          Flags: ignoreversion
Source: "carga\ajustes.js";  DestDir: "{app}";          Flags: ignoreversion
Source: "carga\executive-lab.vsix"; DestDir: "{app}";   Flags: ignoreversion
Source: "carga\executivelab.ico";   DestDir: "{app}";   Flags: ignoreversion
Source: "carga\disfraz.json";       DestDir: "{app}";   Flags: ignoreversion
; VS Code, instalación por usuario. El .exe se descarta al terminar.
Source: "carga\VSCodeUserSetup-x64.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Registry]
; Para que la extensión encuentre la app aunque cambie la carpeta por defecto.
Root: HKCU; Subkey: "Environment"; ValueType: string; ValueName: "EXECUTIVE_LAB_HOME"; ValueData: "{app}"; Flags: uninsdeletevalue

[Run]
; VS Code en silencio. !runcode evita que se abra solo al acabar.
Filename: "{tmp}\VSCodeUserSetup-x64.exe"; \
  Parameters: "/VERYSILENT /NORESTART /SUPPRESSMSGBOXES /MERGETASKS=!runcode"; \
  StatusMsg: "Instalando el editor..."; Flags: waituntilterminated

; git (si no está) y las dos extensiones. git se descarga, así que este paso
; necesita red y puede tardar un par de minutos.
Filename: "{app}\runtime\node.exe"; \
  Parameters: """{app}\preparar.js"" --asistente ""{code:AsistenteElegido}"""; \
  StatusMsg: "Poniendo las piezas que faltan. Esto tarda un par de minutos..."; \
  Flags: waituntilterminated runhidden

[Icons]
; Abre el editor, sin carpeta: la elige esa persona la primera vez, y el panel
; la prepara. El disfraz lo pone la extensión cuando se enciende.
Name: "{autodesktop}\{#Nombre}"; \
  Filename: "{localappdata}\Programs\Microsoft VS Code\Code.exe"; \
  IconFilename: "{app}\executivelab.ico"; \
  Comment: "Abre Executive Lab"

[Code]
var
  PaginaAsistente: TInputOptionWizardPage;

procedure InitializeWizard;
begin
  PaginaAsistente := CreateInputOptionPage(wpWelcome,
    'Tu asistente', '¿Con cuál vas a trabajar?',
    'Los dos hacen lo mismo aquí. Si en clase te han dicho uno, elige ese. Si no lo sabes, deja Claude.',
    True, False);
  PaginaAsistente.Add('Claude');
  PaginaAsistente.Add('Codex');
  PaginaAsistente.SelectedValueIndex := 0;
end;

function AsistenteElegido(Param: String): String;
begin
  if PaginaAsistente.SelectedValueIndex = 1 then
    Result := 'codex'
  else
    Result := 'claude';
end;

// El PATH del usuario. Los enganches del arnés llaman a node por nombre desde
// el editor, y esa persona no tiene Node en el sistema. git no se añade: lo
// pone su propio instalador, donde le corresponda.
procedure AnadirAlPath(Carpeta: String);
var
  Actual: String;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', Actual) then
    Actual := '';
  if Pos(';' + Uppercase(Carpeta) + ';', ';' + Uppercase(Actual) + ';') > 0 then
    Exit;
  if Actual = '' then
    Actual := Carpeta
  else
    Actual := Actual + ';' + Carpeta;
  RegWriteExpandStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', Actual);
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssPostInstall then
    AnadirAlPath(ExpandConstant('{app}') + '\runtime');
end;

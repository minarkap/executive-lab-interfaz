; Instalador de Executive Lab para Windows (Inno Setup 6.3+, guardar como UTF-8).
;
; Tres decisiones gobiernan este fichero:
;
;   1. PrivilegesRequired=lowest. Nada de administrador, nada de UAC. Es lo que
;      permite instalarlo en un portátil gestionado por el IT de la empresa,
;      que en pyme es más común de lo que parece.
;
;   2. Todo va dentro: Node, git (MinGit) y el arnés ya instalado con la
;      versión fijada. El alumno no tiene nada en el sistema y no hace falta
;      red hacia npm. Node y git se añaden al PATH del usuario porque los hooks
;      del arnés los llaman por nombre desde el editor.
;
;   3. Una sola pregunta, y con opciones. El diccionario dice que no hay
;      pregunta sin opciones: un campo de texto vacío delante de alguien que no
;      sabe qué escribir es una pared.

#define Nombre "Executive Lab"
#define Version "0.1.0"

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
Source: "carga\git\*";       DestDir: "{app}\git";      Flags: recursesubdirs ignoreversion
Source: "carga\harness\*";   DestDir: "{app}\harness";  Flags: recursesubdirs ignoreversion
Source: "carga\skills\*";    DestDir: "{app}\skills";   Flags: recursesubdirs ignoreversion
Source: "carga\preparar.js"; DestDir: "{app}";          Flags: ignoreversion
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
  StatusMsg: "Preparando tu espacio de trabajo..."; Flags: waituntilterminated

; El resto lo hace preparar.js: carpeta, arnés, raíles y extensiones.
Filename: "{app}\runtime\node.exe"; \
  Parameters: """{app}\preparar.js"" --destino ""{code:CarpetaDeTrabajo}"" --objetivo ""{code:ObjetivoElegido}"" --asistente claude"; \
  StatusMsg: "Montando el arnés de tu empresa. Esto tarda unos minutos..."; \
  Flags: waituntilterminated runhidden

[Icons]
; Sin perfil: el disfraz lo pone la extensión en el primer arranque.
Name: "{autodesktop}\{#Nombre}"; \
  Filename: "{localappdata}\Programs\Microsoft VS Code\Code.exe"; \
  Parameters: """{code:CarpetaDeTrabajo}"""; \
  IconFilename: "{app}\executivelab.ico"; \
  Comment: "Abre tu empresa"

[Code]
var
  PaginaObjetivo: TInputOptionWizardPage;

// Pascal Script no admite constantes de tipo array; se sirven por índice.
function Objetivo(Indice: Integer): String;
begin
  case Indice of
    0: Result := 'Poner orden en mis facturas';
    1: Result := 'Atender mejor a mis clientes';
    2: Result := 'Organizar los documentos de la empresa';
    3: Result := 'Vender más y hacer seguimiento';
    4: Result := 'Quitarme tareas repetitivas de encima';
    5: Result := 'Todavía no lo sé: que me lo enseñe';
  else
    Result := 'llevar mi empresa con ayuda de la IA';
  end;
end;

procedure InitializeWizard;
var
  i: Integer;
begin
  PaginaObjetivo := CreateInputOptionPage(wpWelcome,
    'Para empezar', '¿Qué te gustaría resolver primero?',
    'Da igual si luego cambias de idea. Esto solo sirve para que tu asistente empiece por algo útil.',
    True, False);

  for i := 0 to 5 do
    PaginaObjetivo.Add(Objetivo(i));

  PaginaObjetivo.SelectedValueIndex := 0;
end;

function ObjetivoElegido(Param: String): String;
begin
  Result := Objetivo(PaginaObjetivo.SelectedValueIndex);
end;

// La carpeta real de Documentos, que solo Windows sabe dónde está. Se le pasa
// a preparar.js para que el acceso directo y el trabajo apunten al mismo sitio.
function CarpetaDeTrabajo(Param: String): String;
begin
  Result := ExpandConstant('{userdocs}') + '\Mi Empresa IA';
end;

// El PATH del usuario. Los hooks del arnés llaman a node por nombre desde el
// editor, y el alumno no tiene Node en el sistema.
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
  begin
    AnadirAlPath(ExpandConstant('{app}') + '\runtime');
    AnadirAlPath(ExpandConstant('{app}') + '\git\cmd');
  end;
end;

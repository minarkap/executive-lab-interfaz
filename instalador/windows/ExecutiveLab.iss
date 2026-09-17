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
  Parameters: """{app}\preparar.js"" --destino ""{code:CarpetaDeTrabajo}"" --objetivo ""{code:ObjetivoElegido}"" --arnes ""{code:NombreDelArnes}"" --empresa ""{code:NombreDeLaEmpresa}"" --asistente ""{code:AsistenteElegido}"" --tipo ""{code:TipoDeProyecto}"" --nivel ""{code:NivelTecnico}"" --acompanamiento ""{code:Acompanamiento}"""; \
  StatusMsg: "Montando el arnés de tu empresa. Esto tarda unos minutos..."; \
  Flags: waituntilterminated runhidden

[Icons]
; Sin perfil: el disfraz lo pone la extensión en el primer arranque.
Name: "{autodesktop}\{code:NombreDelArnes}"; \
  Filename: "{localappdata}\Programs\Microsoft VS Code\Code.exe"; \
  Parameters: """{code:CarpetaDeTrabajo}"""; \
  IconFilename: "{app}\executivelab.ico"; \
  Comment: "Abre tu empresa"

[Code]
var
  PaginaObjetivo: TInputOptionWizardPage;
  PaginaNombres: TInputQueryWizardPage;
  PaginaAsistente: TInputOptionWizardPage;
  PaginaDeQueVa: TInputOptionWizardPage;
  PaginaManejo: TInputOptionWizardPage;
  PaginaExplico: TInputOptionWizardPage;

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

// Lo que el alumno escriba se convierte en el nombre de una carpeta, asi que
// fuera lo que Windows no admite. Si no queda nada, un nombre por defecto.
function NombreDeCarpeta(Texto: String): String;
var
  i: Integer;
  c: Char;
begin
  Result := '';
  for i := 1 to Length(Texto) do
  begin
    c := Texto[i];
    if Pos(c, '\/:*?"<>|') = 0 then
      Result := Result + c;
  end;
  Result := Trim(Result);
  while (Length(Result) > 0) and (Result[Length(Result)] = '.') do
    Result := Copy(Result, 1, Length(Result) - 1);
  if Result = '' then
    Result := 'Mi trabajo';
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

  PaginaNombres := CreateInputQueryPage(PaginaObjetivo.ID,
    'Ponle nombre', '¿Cómo llamamos a esto?',
    'El primero es el nombre que verás arriba cada vez que lo abras, y el de la carpeta donde se guarda todo. El segundo es para saber de quién es.');
  PaginaNombres.Add('Esto es para...  (Contabilidad, Personal, Marketing, Clientes...)', False);
  PaginaNombres.Add('Y tu empresa se llama...  (puedes dejarlo en blanco)', False);
  PaginaNombres.Values[0] := 'Mi trabajo';

  PaginaAsistente := CreateInputOptionPage(PaginaNombres.ID,
    'Tu asistente', '¿Con cuál vas a trabajar?',
    'Los dos hacen lo mismo aquí. Si en clase te han dicho uno, elige ese. Si no lo sabes, deja Claude.',
    True, False);
  PaginaAsistente.Add('Claude');
  PaginaAsistente.Add('Codex');
  PaginaAsistente.SelectedValueIndex := 0;

  PaginaDeQueVa := CreateInputOptionPage(PaginaAsistente.ID,
    'Para empezar', '¿De qué va esto?',
    'De aquí sale lo que se te instala. Si te equivocas no pasa nada: se puede cambiar después.',
    True, False);
  PaginaDeQueVa.Add('Llevar el día a día — facturas, clientes, papeleo');
  PaginaDeQueVa.Add('Crear cosas — textos, vídeos, redes');
  PaginaDeQueVa.Add('Construir algo — una web, una automatización');
  PaginaDeQueVa.Add('Estudiar un tema a fondo');
  PaginaDeQueVa.Add('Un poco de todo');
  PaginaDeQueVa.SelectedValueIndex := 0;

  PaginaManejo := CreateInputOptionPage(PaginaDeQueVa.ID,
    'Sobre ti', '¿Qué tal te manejas con el ordenador?',
    'No hay respuesta mala. Sirve para saber con qué palabras hablarte.',
    True, False);
  PaginaManejo.Add('Lo justo — el correo, Word y poco más');
  PaginaManejo.Add('Me defiendo — me apaño con casi todo, pero no programo');
  PaginaManejo.Add('Programo, o he programado');
  PaginaManejo.SelectedValueIndex := 0;

  PaginaExplico := CreateInputOptionPage(PaginaManejo.ID,
    'Sobre ti', '¿Cuánto quieres que te explique?',
    'Se puede cambiar cuando quieras: basta con decírselo.',
    True, False);
  PaginaExplico.Add('Todo, paso a paso');
  PaginaExplico.Add('Lo normal');
  PaginaExplico.Add('Poco — ya preguntaré yo');
  PaginaExplico.SelectedValueIndex := 0;
end;

function TipoDeProyecto(Param: String): String;
begin
  case PaginaDeQueVa.SelectedValueIndex of
    1: Result := 'content';
    2: Result := 'software';
    3: Result := 'research';
    4: Result := 'mixed';
  else
    Result := 'operations';
  end;
end;

function NivelTecnico(Param: String): String;
begin
  case PaginaManejo.SelectedValueIndex of
    1: Result := 'mixed';
    2: Result := 'technical';
  else
    Result := 'non-technical';
  end;
end;

function Acompanamiento(Param: String): String;
begin
  case PaginaExplico.SelectedValueIndex of
    1: Result := 'L2';
    2: Result := 'L1';
  else
    Result := 'L3';
  end;
end;

function AsistenteElegido(Param: String): String;
begin
  if PaginaAsistente.SelectedValueIndex = 1 then
    Result := 'codex'
  else
    Result := 'claude';
end;

// No se deja pasar de la pagina de nombres sin al menos el primero.
function NextButtonClick(CurPageID: Integer): Boolean;
begin
  Result := True;
  if (PaginaNombres <> nil) and (CurPageID = PaginaNombres.ID) then
    if Trim(PaginaNombres.Values[0]) = '' then
    begin
      MsgBox('Ponle un nombre, aunque sea provisional. Luego se puede cambiar.', mbInformation, MB_OK);
      Result := False;
    end;
end;

function NombreDelArnes(Param: String): String;
begin
  Result := NombreDeCarpeta(PaginaNombres.Values[0]);
end;

function NombreDeLaEmpresa(Param: String): String;
begin
  Result := Trim(PaginaNombres.Values[1]);
end;

function ObjetivoElegido(Param: String): String;
begin
  Result := Objetivo(PaginaObjetivo.SelectedValueIndex);
end;

// La carpeta real de Documentos, que solo Windows sabe dónde está, y dentro el
// nombre que haya puesto el alumno. Se le pasa a preparar.js para que el acceso
// directo y el trabajo apunten al mismo sitio.
function CarpetaDeTrabajo(Param: String): String;
begin
  Result := ExpandConstant('{userdocs}') + '\' + NombreDeCarpeta(PaginaNombres.Values[0]);
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

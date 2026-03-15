# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Cambia entre varios perfiles Git con un solo clic. Gestiona múltiples cuentas de GitHub, claves SSH y firmas GPG, y <b>aplica automáticamente los perfiles a los submódulos Git</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/attestations"><img src="https://img.shields.io/badge/SLSA-Level_3-green" alt="SLSA 3"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions#supply-chain-security"><img src="https://img.shields.io/badge/Sigstore-Cosign_Signed-blue?logo=sigstore" alt="Sigstore"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions#supply-chain-security"><img src="https://img.shields.io/badge/SBOM-CycloneDX-brightgreen" alt="SBOM"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml/badge.svg" alt="Security"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/%20-Win%20%7C%20Mac%20%7C%20Linux-blue?labelColor=555&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMSAySDNjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoN3YySDh2Mmg4di0yaC0ydi0yaDdjMS4xIDAgMi0uOSAyLTJWNGMwLTEuMS0uOS0yLTItMnptMCAxNEgzVjRoMTh2MTJ6Ii8+PC9zdmc+" alt="Platform"></a>
      <a href="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions"><img src="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions/graph/badge.svg" alt="codecov"></a>
      <a href="https://sonarcloud.io/summary/new_code?id=nullvariant_nullvariant-vscode-extensions"><img src="https://sonarcloud.io/api/project_badges/measure?project=nullvariant_nullvariant-vscode-extensions&metric=alert_status" alt="Quality Gate Status"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <b>🇪🇸</b> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/es/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 ¿Por qué Git ID Switcher?

Existen muchas herramientas para cambiar perfiles Git, pero **Git ID Switcher** resuelve problemas complejos que otras herramientas suelen pasar por alto:

1. **La pesadilla de los submódulos**: Cuando trabajas con repositorios que contienen submódulos (temas de Hugo, bibliotecas vendor, etc.), normalmente necesitas configurar `git config user.name` manualmente para _cada_ submódulo. Esta extensión lo resuelve elegantemente aplicando recursivamente el perfil a todos los submódulos activos.
2. **Gestión de SSH y GPG**: No solo cambia tu nombre — también intercambia tus claves SSH en ssh-agent y configura la firma GPG, evitando que hagas commits con la firma incorrecta.

## Funcionalidades

- **UI de gestión de perfiles**: Añade, edita, elimina y reordena perfiles sin editar settings.json
- **Cambio de perfil con un clic**: Cambia Git user.name y user.email instantáneamente
- **Integración en la barra de estado**: Consulta tu perfil actual de un vistazo en todo momento
- **Soporte de submódulos**: Propaga automáticamente el perfil a los submódulos Git
- **Gestión de claves SSH**: Cambia automáticamente las claves SSH en ssh-agent
- **Soporte de firma GPG**: Configura la clave GPG para firmar commits (opcional)
- **Tooltips enriquecidos**: Información detallada del perfil, incluyendo descripción y host SSH
- **Multiplataforma**: Funciona en macOS, Linux y Windows
- **Multilingüe**: Soporta 17 idiomas

## 🌏 Nuestro compromiso con el multilingüismo

> **Valoro la existencia de las minorías.**
> No quiero descartarlas solo porque sean pocas.
> Aunque las traducciones no sean perfectas, espero que puedas sentir nuestra intención de comprender y mostrar respeto por las lenguas minoritarias.

Esta extensión es compatible con los 17 idiomas que soporta VS Code. Además, para la documentación README, nos hemos atrevido a traducir a lenguas minoritarias e incluso a lenguas humorísticas.

Esto no es simplemente «soporte global» — es «respeto por la diversidad lingüística». Y me alegraría que esto se convirtiera en una infraestructura donde commits que mejoran el mundo vengan de desarrolladores de todas partes, trascendiendo las barreras del idioma.

---

## Inicio rápido

Una configuración típica para alternar entre una cuenta personal y una cuenta corporativa (Enterprise Managed User).

### Paso 1: Preparar las claves SSH

Primero, crea claves SSH para cada cuenta (omite este paso si ya las tienes):

```bash
# Personal
ssh-keygen -t ed25519 -C "alex@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Trabajo
ssh-keygen -t ed25519 -C "alex.garcia@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Registra la **clave pública** (archivo `.pub`) de cada clave SSH en la cuenta de GitHub correspondiente.

> **Nota**: Lo que registras en GitHub es `id_ed25519_personal.pub` (clave pública). `id_ed25519_personal` (sin extensión) es la clave privada — nunca la compartas ni la subas a ningún sitio.

### Paso 2: Configurar SSH config

Edita `~/.ssh/config`:

```ssh-config
# Cuenta personal de GitHub (predeterminada)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Cuenta de trabajo de GitHub
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Paso 3: Configurar la extensión

Al instalar la extensión, se incluyen perfiles de ejemplo.
Sigue la guía a continuación para editarlos a tu medida.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/es/first-ux.webp" width="600" alt="Configuración inicial (13 pasos): abrir la gestión de perfiles desde la barra de estado, editar y crear nuevos perfiles" loading="lazy">

> **Los archivos de claves no se envían**: Al configurar las rutas de claves SSH, solo se registra la ruta (ubicación) del archivo. El contenido del archivo de claves nunca se sube ni se transmite al exterior.

> **Si usas firma GPG**: También puedes configurar `gpgKeyId` en la pantalla de edición del perfil.
> Para encontrar tu ID de clave GPG, consulta «[Solución de problemas](#la-firma-gpg-no-funciona)».

> **Consejo**: También puedes configurar directamente desde settings.json.
> Abre los ajustes de la extensión (`Cmd+,` / `Ctrl+,`) → busca «Git ID Switcher» → haz clic en «Editar en settings.json».
> Para ejemplos de configuración en formato JSON, consulta «[Ejemplo completo](#ejemplo-completo-5-cuentas-con-ssh--gpg)».

---

## Ejemplo completo: 5 cuentas con SSH + GPG

Un ejemplo completo combinando todas las funcionalidades:

### Configuración SSH (`~/.ssh/config`)

```ssh-config
# Cuenta personal (predeterminada)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Cuenta de trabajo (Enterprise Managed User emitido por la empresa)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Cliente A – trabajo por contrato (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Cliente B – proyecto en sitio (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# Contribuciones OSS (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Ajustes de la extensión

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Alex García",
      "email": "alex@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Proyectos personales",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Alex García",
      "email": "alex.garcia@techcorp.example.com",
      "service": "GitHub Trabajo",
      "icon": "💼",
      "description": "TechCorp empleo principal",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Alex García",
      "email": "alex@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA contrato",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "A.García",
      "email": "a.garcia@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB presencial",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "alex-dev",
      "email": "alex.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "Contribuciones OSS",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Nota: El 4.º perfil (`client-b`) usa un nombre abreviado y el 5.º (`oss`) un alias de desarrollador. Puedes establecer nombres de visualización diferentes para cada perfil, incluso para la misma persona.

---

## Gestión de perfiles

Haz clic en la barra de estado → selecciona «Gestión de perfiles» en la parte inferior de la lista para abrir la pantalla de gestión.
Puedes añadir, editar, eliminar y reordenar perfiles directamente desde la interfaz.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/es/identity-management.webp" width="600" alt="Gestión de perfiles: guía de eliminación y reordenación" loading="lazy">

También puedes eliminar un perfil desde la paleta de comandos con `Git ID Switcher: Delete Identity`.

---

## Comandos

| Comando                                  | Descripción                           |
| ---------------------------------------- | ------------------------------------- |
| `Git ID Switcher: Select Identity`       | Abrir el selector de perfiles         |
| `Git ID Switcher: Delete Identity`       | Eliminar un perfil                    |
| `Git ID Switcher: Show Current Identity` | Mostrar información del perfil actual |
| `Git ID Switcher: Show Documentation`    | Mostrar documentación                 |

---

## Referencia de configuración

### Propiedades del perfil

| Propiedad     | Requerido | Descripción                                                                |
| ------------- | --------- | -------------------------------------------------------------------------- |
| `id`          | ✅        | Identificador único (ej.: `"personal"`, `"work"`)                          |
| `name`        | ✅        | Git user.name — se muestra en los commits                                  |
| `email`       | ✅        | Git user.email — se muestra en los commits                                 |
| `icon`        |           | Emoji en la barra de estado (ej.: `"🏠"`). Solo un emoji                   |
| `service`     |           | Nombre del servicio (ej.: `"GitHub"`, `"GitLab"`). Se usa para la interfaz |
| `description` |           | Descripción breve en el selector y el tooltip                              |
| `sshKeyPath`  |           | Ruta a la clave SSH privada (ej.: `"~/.ssh/id_ed25519_work"`)              |
| `sshHost`     |           | Alias de host SSH (ej.: `"github-work"`)                                   |
| `gpgKeyId`    |           | ID de clave GPG para firmar commits                                        |

#### Limitaciones de visualización

- **Barra de estado**: El texto que exceda ~25 caracteres se truncará con `...`
- **`icon`**: Solo se permite un emoji (clúster de grafemas). No se admiten múltiples emojis ni cadenas largas

### Ajustes globales

| Ajuste                                     | Predeterminado | Descripción                                                                                                   |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Ver ejemplos   | Lista de configuraciones de perfiles                                                                          |
| `gitIdSwitcher.defaultIdentity`            | Ver ejemplos   | ID del perfil predeterminado                                                                                  |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`         | Cambiar automáticamente la clave SSH al cambiar de perfil                                                     |
| `gitIdSwitcher.showNotifications`          | `true`         | Mostrar notificaciones al cambiar de perfil                                                                   |
| `gitIdSwitcher.applyToSubmodules`          | `true`         | Propagar el perfil a los submódulos Git                                                                       |
| `gitIdSwitcher.submoduleDepth`             | `1`            | Profundidad máxima para submódulos anidados (1-5)                                                             |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`        | Incluir el emoji del icono en `user.name` de Git config                                                       |
| `gitIdSwitcher.logging.fileEnabled`        | `false`        | Guardar registro de auditoría en archivo (cambios de perfil, operaciones SSH, etc.)                           |
| `gitIdSwitcher.logging.filePath`           | `""`           | Ruta del archivo de registro (ej.: `~/.git-id-switcher/security.log`). Vacío = ubicación predeterminada       |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`     | Tamaño máximo del archivo antes de rotación (bytes, 1 MB–100 MB)                                              |
| `gitIdSwitcher.logging.maxFiles`           | `5`            | Número máximo de archivos de registro en rotación (1-20)                                                      |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`        | Cuando está activado, todos los valores se enmascaran en los registros (máxima privacidad)                    |
| `gitIdSwitcher.logging.level`              | `"INFO"`       | Nivel de registro (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Registra el nivel seleccionado y superiores |
| `gitIdSwitcher.commandTimeouts`            | `{}`           | Tiempo de espera personalizado por comando (ms, 1 s–5 min). Ej.: `{"git": 15000, "ssh-add": 10000}`           |

#### Acerca de `includeIconInGitConfig`

Controla el comportamiento cuando el campo `icon` está configurado:

| Valor                    | Comportamiento                                                                         |
| ------------------------ | -------------------------------------------------------------------------------------- |
| `false` (predeterminado) | `icon` solo se muestra en la interfaz del editor. Solo `name` se escribe en Git config |
| `true`                   | `icon + name` se escribe en Git config. El emoji aparece en el historial de commits    |

Ejemplo: `icon: "👤"`, `name: "Alex García"`

| includeIconInGitConfig | Git config `user.name` | Firma de commit          |
| ---------------------- | ---------------------- | ------------------------ |
| `false`                | `Alex García`          | `Alex García <email>`    |
| `true`                 | `👤 Alex García`       | `👤 Alex García <email>` |

---

## Cómo funciona

### Estructura de capas de Git config

La configuración de Git tiene tres capas, donde cada capa inferior sobrescribe a la superior:

```text
Sistema (/etc/gitconfig)
    ↓ sobrescribe
Global (~/.gitconfig)
    ↓ sobrescribe
Local (.git/config)  ← máxima prioridad
```

**Git ID Switcher escribe en `--local` (local al repositorio).**

Esto significa:

- El perfil se guarda en el `.git/config` de cada repositorio
- Se pueden mantener diferentes perfiles por repositorio
- La configuración global (`~/.gitconfig`) no se modifica

### Comportamiento al cambiar de perfil

Al cambiar de perfil, la extensión ejecuta (en orden):

1. **Git Config** (siempre): Establece `git config --local user.name` y `user.email`
2. **Clave SSH** (si `sshKeyPath` está configurado): Elimina otras claves de ssh-agent y añade la seleccionada
3. **Clave GPG** (si `gpgKeyId` está configurado): Establece `git config --local user.signingkey` y activa la firma
4. **Submódulos** (si está activado): Propaga la configuración a todos los submódulos (predeterminado: profundidad 1)

### Propagación a submódulos

La configuración local es por repositorio, por lo que no se aplica automáticamente a los submódulos.
Por eso, esta extensión proporciona la funcionalidad de propagación a submódulos (consulta «Avanzado: Soporte de submódulos» para más detalles).

### Gestión de claves SSH en detalle

Git ID Switcher gestiona las claves SSH a través de `ssh-agent`:

| Operación      | Comando ejecutado      |
| -------------- | ---------------------- |
| Añadir clave   | `ssh-add <keyPath>`    |
| Eliminar clave | `ssh-add -d <keyPath>` |
| Listar claves  | `ssh-add -l`           |

**Importante:** Esta extensión **no modifica** `~/.ssh/config`. La configuración SSH debe realizarse manualmente (consulta el paso 2 de «Inicio rápido»).

### Interacción con la configuración SSH existente

Si ya tienes una configuración SSH, Git ID Switcher funciona en coexistencia:

| Tu configuración                          | Comportamiento de Git ID Switcher                                |
| ----------------------------------------- | ---------------------------------------------------------------- |
| `~/.ssh/config` con `IdentityFile`        | Ambas son utilizables; `IdentitiesOnly yes` evita conflictos     |
| Variable de entorno `GIT_SSH_COMMAND`     | Se usa tu comando SSH personalizado; ssh-agent sigue funcionando |
| `git config core.sshCommand`              | Igual que arriba                                                 |
| direnv con variables relacionadas con SSH | Coexistencia posible; ssh-agent funciona independientemente      |

**Recomendado:** Configura siempre `IdentitiesOnly yes` en tu configuración SSH. Esto evita que SSH intente múltiples claves.

### ¿Por qué `IdentitiesOnly yes`?

Sin esta configuración, SSH puede intentar las claves en este orden:

1. Claves cargadas en ssh-agent (gestionadas por Git ID Switcher)
2. Claves especificadas en `~/.ssh/config`
3. Claves predeterminadas (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, etc.)

Esto puede provocar fallos de autenticación o el uso involuntario de una clave incorrecta.

Con `IdentitiesOnly yes`, SSH utiliza **únicamente la clave especificada**. Esto garantiza que la clave configurada en Git ID Switcher se use de forma fiable.

```ssh-config
# Configuración recomendada
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Esta línea es importante
```

Con esta configuración, al conectarse al host `github-work`, solo se utiliza `~/.ssh/id_ed25519_work` y no se intenta ninguna otra clave.

---

## Avanzado: Soporte de submódulos

En repositorios complejos con submódulos Git, la gestión de perfiles suele ser problemática. Al hacer commit en un submódulo, Git utiliza la configuración local de ese submódulo, que puede recurrir a la configuración global (¡dirección de correo incorrecta!) si no se ha configurado explícitamente.

**Git ID Switcher** detecta automáticamente los submódulos y aplica el perfil seleccionado.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Activa/desactiva esta funcionalidad
- `submoduleDepth`: ¿Hasta qué profundidad aplicar?
  - `1`: Solo submódulos directos (lo más común)
  - `2+`: Submódulos anidados (submódulos dentro de submódulos)

Esto garantiza que tu perfil siempre sea correcto, ya sea que hagas commit en el repositorio principal o en una biblioteca vendor.

---

## Solución de problemas

### ¿La clave SSH no cambia?

1. Asegúrate de que `ssh-agent` esté en ejecución:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Verifica que la ruta de la clave sea correcta:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. En macOS, añádela al llavero una vez:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### ¿Perfil incorrecto al hacer push?

**Al clonar un repositorio nuevo:**

Al clonar repositorios de trabajo, usa el alias de host configurado en SSH config:

```bash
# Trabajo (usa el alias github-work)
git clone git@github-work:company/repo.git

# Personal (usa github.com predeterminado)
git clone git@github.com:yourname/repo.git
```

**Para repositorios existentes:**

1. Verifica que la URL remota use el alias de host correcto:

   ```bash
   git remote -v
   # Debería mostrar git@github-work:... para repos de trabajo
   ```

2. Actualiza si es necesario:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### ¿La firma GPG no funciona?

1. Busca tu ID de clave GPG:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Prueba la firma:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Asegúrate de que la dirección de correo en tu perfil coincida con la de la clave GPG

### ¿Perfil no detectado?

- Asegúrate de estar dentro de un repositorio Git
- Verifica que `settings.json` no tenga errores de sintaxis
- Recarga la ventana de VS Code (`Cmd+Shift+P` → «Recargar ventana»)

### ¿Error con el campo `name`?

Los siguientes caracteres en el campo `name` causarán un error:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Si quieres incluir información del servicio, usa el campo `service`.

```jsonc
// NG
"name": "Alex García (Personal)"

// OK
"name": "Alex García",
"service": "GitHub"
```

### ¿Los nuevos ajustes no aparecen?

Después de actualizar la extensión, los nuevos ajustes pueden no aparecer en la interfaz de configuración.

**Solución:** Reinicia tu máquina completamente.

Los editores basados en VS Code cachean el esquema de configuración en memoria, y «Recargar ventana» o reinstalar la extensión puede no ser suficiente para actualizarlo.

### ¿Los valores predeterminados (identities, etc.) están vacíos?

Si los ajustes de ejemplo no aparecen incluso después de una instalación nueva, **Settings Sync** puede ser la causa.

Si previamente guardaste ajustes vacíos, estos pueden haberse sincronizado a la nube y estar sobrescribiendo los valores predeterminados en nuevas instalaciones.

**Solución:**

1. Busca el ajuste en la interfaz de configuración
2. Haz clic en el icono del engranaje → «Restablecer configuración»
3. Sincroniza con Settings Sync (esto elimina los ajustes antiguos de la nube)

---

## Filosofía de diseño

> **Cambiar «Quién soy»** — La única pregunta que responde esta extensión

Diseñada con la **arquitectura Karesansui**: un núcleo simple (100 líneas).
Por eso, el resto puede dedicarse a la calidad (90 % de cobertura, registro, timeouts)
y a restricciones deliberadas (sin API de GitHub, sin gestión de tokens).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Leer la filosofía completa](../../DESIGN_PHILOSOPHY.md)

---

## Contribuir

¡Las contribuciones son bienvenidas! Consulta [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licencia

Licencia MIT — consulta [LICENSE](../../../LICENSE).

## Créditos

Creado por [Null;Variant](https://github.com/nullvariant)

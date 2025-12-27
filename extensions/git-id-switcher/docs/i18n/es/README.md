# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/git-id-switcher/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Cambia entre múltiples identidades Git con un clic. Gestiona múltiples cuentas de GitHub, claves SSH, firma GPG y <b>aplica automáticamente la identidad a los submódulos Git</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Idiomas: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <b>🇪🇸</b> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/git-id-switcher/demo-es.png" width="600" alt="Demo">

## Características

- **Cambio de identidad con un clic**: Cambia Git user.name y user.email instantáneamente
- **Gestión de claves SSH**: Cambia automáticamente las claves SSH en ssh-agent
- **Soporte de firma GPG**: Configura la clave GPG para firmar commits (opcional)
- **Soporte de submódulos**: Propaga automáticamente la identidad a los submódulos Git
- **Integración en barra de estado**: Ve siempre tu identidad actual de un vistazo
- **Tooltips enriquecidos**: Información detallada con descripción y host SSH
- **Multiplataforma**: Funciona en macOS, Linux y Windows
- **Multilingüe**: Soporta 17 idiomas

## 🚀 ¿Por qué esta extensión?

Aunque existen muchos cambiadores de identidad Git, **Git ID Switcher** resuelve problemas complejos que otros suelen ignorar:

1. **La pesadilla de los submódulos**: Al trabajar con repositorios que tienen submódulos (temas de Hugo, bibliotecas vendor, etc.), normalmente hay que configurar `git config user.name` manualmente para *cada* submódulo. Esta extensión lo maneja elegantemente aplicando tu identidad recursivamente a todos los submódulos activos.
2. **Manejo de SSH y GPG**: No solo cambia tu nombre; también intercambia tus claves SSH en el agente y configura la firma GPG para que nunca hagas commit con la firma incorrecta.

## 🌏 Una nota sobre el soporte multilingüe

> **Valoro la existencia de las minorías.**
> No quiero descartarlas solo porque son pocas en número.
> Incluso si las traducciones no son perfectas, espero que puedas sentir nuestra intención de comprender y mostrar respeto por las lenguas minoritarias.

Esta extensión soporta los 17 idiomas que soporta VSCode. Además, para la documentación README, nos desafiamos a traducir a lenguas minoritarias e incluso lenguas humorísticas.

Esto no es solo "soporte global" - es "respeto por la diversidad lingüística". Y me alegraría si esto se convierte en infraestructura donde commits que mejoran el mundo vengan de desarrolladores de todas partes, trascendiendo las barreras del idioma.

---

## Inicio rápido

Una configuración típica para gestionar una cuenta personal y una cuenta de trabajo (Enterprise Managed User).

### Paso 1: Preparar las claves SSH

Primero, crea claves SSH para cada cuenta (sáltalo si ya las tienes):

```bash
# Personal
ssh-keygen -t ed25519 -C "alex.garcia@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Trabajo
ssh-keygen -t ed25519 -C "alex.garcia@company.example.com" -f ~/.ssh/id_ed25519_work
```

Registra la **clave pública** (archivo `.pub`) de cada clave en la cuenta de GitHub correspondiente.

> **Nota**: Registra `id_ed25519_personal.pub` (clave pública) en GitHub. `id_ed25519_personal` (sin extensión) es la clave privada - nunca la compartas ni la subas a ningún lugar.

### Paso 2: Configurar SSH

Edita `~/.ssh/config`:

```ssh-config
# Cuenta personal de GitHub (predeterminada)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Cuenta de trabajo de GitHub (Enterprise Managed User proporcionado por la empresa)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Paso 3: Configurar la extensión

Abre la configuración de la extensión (`Cmd+,` / `Ctrl+,`) → busca "Git ID Switcher" → haz clic en "Editar en settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex García",
      "email": "alex.garcia@personal.example.com",
      "service": "GitHub",
      "description": "Proyectos personales",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex García",
      "email": "alex.garcia@company.example.com",
      "service": "GitHub Trabajo",
      "description": "Cuenta de trabajo",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Paso 4: Usar

1. Haz clic en el icono de identidad en la barra de estado (abajo a la derecha)
2. Selecciona una identidad
3. ¡Listo! La configuración de Git y la clave SSH ya están cambiadas.

### Usar alias de host SSH

Al clonar repos, usa el host que corresponde a tu identidad:

```bash
# Para identidad de trabajo (usa el alias github-work)
git clone git@github-work:company/repo.git

# Para identidad personal (usa github.com predeterminado)
git clone git@github.com:agarcia/repo.git
```

---

## Opcional: Firma GPG

Si firmas commits con GPG:

### Paso 1: Encontrar tu ID de clave GPG

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Ejemplo de salida:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Alex García <alex.garcia@personal.example.com>
```

El ID de clave es `ABCD1234`.

### Paso 2: Añadir clave GPG a la identidad

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex García",
      "email": "alex.garcia@personal.example.com",
      "service": "GitHub",
      "description": "Proyectos personales",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Al cambiar a esta identidad, la extensión configura:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Ejemplo completo: 4 cuentas con SSH + GPG

Aquí un ejemplo completo combinando todo:

### Configuración SSH (`~/.ssh/config`)

```ssh-config
# Cuenta personal (predeterminada)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Cuenta de trabajo (Enterprise Managed User proporcionado por la empresa)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Cuenta Bitbucket
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Configuración de la extensión

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex García",
      "email": "alex.garcia@personal.example.com",
      "service": "GitHub",
      "description": "Proyectos personales",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex García",
      "email": "alex.garcia@company.example.com",
      "service": "GitHub Trabajo",
      "description": "Cuenta de trabajo",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "agarcia-bb",
      "email": "agarcia.bb@example.com",
      "service": "Bitbucket",
      "description": "Proyectos Bitbucket",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex García",
      "email": "alex.garcia@freelance.example.com",
      "service": "GitLab",
      "description": "Proyectos freelance"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Nota: La última identidad (`freelance`) no tiene SSH — solo cambia la configuración de Git. Esto es útil cuando usas diferente información de committer con la misma cuenta de GitHub.

---

## Referencia de configuración

### Propiedades de identidad

| Propiedad     | Requerido | Descripción                                                |
| ------------- | --------- | ---------------------------------------------------------- |
| `id`          | ✅        | Identificador único (ej: `"work"`, `"personal"`)           |
| `name`        | ✅        | Git user.name - mostrado en commits                        |
| `email`       | ✅        | Git user.email - mostrado en commits                       |
| `icon`        |           | Emoji mostrado en la barra de estado (solo un emoji)       |
| `service`     |           | Nombre del servicio (ej: `"GitHub"`, `"GitLab"`). Usado para la visualización UI |
| `description` |           | Descripción corta mostrada en el selector y tooltip        |
| `sshKeyPath`  |           | Ruta a la clave SSH privada (ej: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |           | Alias de host SSH (ej: `"github-work"`)                    |
| `gpgKeyId`    |           | ID de clave GPG para firmar commits                        |

#### Limitaciones de visualización

- **Barra de estado**: El texto que exceda ~25 caracteres será truncado con `...`
- **`icon`**: Solo se permite un emoji (clúster de grafemas). No se soportan múltiples emojis o cadenas largas

### Configuración global

| Configuración                          | Predeterminado | Descripción                                    |
| -------------------------------------- | -------------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`             | Ver ejemplo    | Lista de configuraciones de identidad          |
| `gitIdSwitcher.defaultIdentity`        | Ver ejemplo    | ID de la identidad predeterminada              |
| `gitIdSwitcher.autoSwitchSshKey`       | `true`         | Cambiar automáticamente la clave SSH           |
| `gitIdSwitcher.showNotifications`      | `true`         | Mostrar notificación al cambiar identidad      |
| `gitIdSwitcher.applyToSubmodules`      | `true`         | Propagar identidad a submódulos Git            |
| `gitIdSwitcher.submoduleDepth`         | `1`            | Profundidad máx. para submódulos anidados (1-5) |
| `gitIdSwitcher.includeIconInGitConfig` | `false`        | Incluir emoji del icono en Git config `user.name` |

#### Acerca de `includeIconInGitConfig`

Controla el comportamiento cuando el campo `icon` está definido:

| Valor | Comportamiento |
|-------|----------------|
| `false` (predeterminado) | `icon` se muestra solo en la interfaz del editor. Solo `name` se escribe en Git config |
| `true` | `icon + name` se escribe en Git config. El emoji aparece en el historial de commits |

Ejemplo: `icon: "👤"`, `name: "Alex García"`

| includeIconInGitConfig | Git config `user.name` | Firma de commit |
|------------------------|------------------------|-----------------|
| `false` | `Alex García` | `Alex García <email>` |
| `true` | `👤 Alex García` | `👤 Alex García <email>` |

### Nota: Configuración básica (sin SSH)

Si no necesitas cambiar claves SSH (ej: usando diferente info de committer con una sola cuenta de GitHub), puedes usar una configuración mínima:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex García",
      "email": "alex.garcia@personal.example.com",
      "description": "Proyectos personales"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex García",
      "email": "alex.garcia@company.example.com",
      "description": "Cuenta de trabajo"
    }
  ]
}
```

Esta configuración solo cambia `git config user.name` y `user.email`.

---

## Cómo funciona

### Estructura de capas de Git Config

La configuración de Git tiene tres capas, donde las capas inferiores sobrescriben a las superiores:

```text
Sistema (/etc/gitconfig)
    ↓ sobrescribe
Global (~/.gitconfig)
    ↓ sobrescribe
Local (.git/config)  ← máxima prioridad
```

**Git ID Switcher escribe en `--local` (local al repositorio).**

Esto significa:

- La identidad se guarda en el `.git/config` de cada repositorio
- Se pueden mantener diferentes identidades por repositorio
- La configuración global (`~/.gitconfig`) no se modifica

### Al cambiar de identidad

Al cambiar de identidad, la extensión hace (en orden):

1. **Configuración Git** (siempre): Establece `git config --local user.name` y `user.email`
2. **Clave SSH** (si `sshKeyPath` está configurado): Elimina otras claves de ssh-agent, añade la seleccionada
3. **Clave GPG** (si `gpgKeyId` está configurado): Establece `git config --local user.signingkey` y activa la firma
4. **Submódulos** (si está habilitado): Propaga la configuración a todos los submódulos (predeterminado: profundidad 1)

### Cómo funciona la propagación a submódulos

La configuración local es por repositorio, por lo que no se aplica automáticamente a los submódulos.
Por eso esta extensión proporciona propagación a submódulos (ver "Avanzado: Soporte de submódulos" para más detalles).

---

## Avanzado: Soporte de submódulos

Para repositorios complejos con submódulos Git, la gestión de identidades suele ser un dolor. Si haces commit en un submódulo, Git usa la configuración local de ese submódulo, que puede recurrir a tu configuración global (¡email incorrecto!) si no está explícitamente configurada.

**Git ID Switcher** detecta automáticamente los submódulos y les aplica la identidad seleccionada.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Habilitar/deshabilitar esta función
- `submoduleDepth`: ¿Qué tan profundo ir?
  - `1`: Solo submódulos directos (más común)
  - `2+`: Submódulos anidados (submódulos dentro de submódulos)

Esto asegura que tu identidad siempre sea correcta, ya sea que hagas commit en el repo principal o en una biblioteca vendor.

---

## Solución de problemas

### ¿La clave SSH no cambia?

1. Asegúrate de que `ssh-agent` está corriendo:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Verifica que la ruta de la clave es correcta:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. En macOS, añade al llavero una vez:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### ¿Identidad incorrecta al hacer push?

1. Verifica que la URL remota usa el alias de host correcto:

   ```bash
   git remote -v
   # Debería mostrar git@github-work:... para repos de trabajo
   ```

2. Actualiza si es necesario:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### ¿La firma GPG no funciona?

1. Encuentra tu ID de clave GPG:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Prueba la firma:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Asegúrate de que el email en tu identidad coincide con el email de la clave GPG.

### ¿Identidad no detectada?

- Asegúrate de estar en un repositorio Git
- Verifica que `settings.json` no tiene errores de sintaxis
- Recarga la ventana de VS Code (`Cmd+Shift+P` → "Recargar ventana")

### ¿Error con el campo `name`?

Los siguientes caracteres en el campo `name` causarán un error:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Usa el campo `service` si quieres incluir información del servicio.

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

Los editores basados en VS Code almacenan en caché el esquema de configuración en memoria, y "Recargar ventana" o reinstalar la extensión puede no ser suficiente para actualizarlo.

### ¿Los valores predeterminados están vacíos?

Si los ajustes de ejemplo no aparecen incluso después de una instalación limpia, **Settings Sync** puede ser la causa.

Si guardaste ajustes vacíos anteriormente, pueden haberse sincronizado a la nube y estar sobrescribiendo los valores predeterminados en nuevas instalaciones.

**Solución:**

1. Encuentra el ajuste en la interfaz de configuración
2. Haz clic en el icono de engranaje → "Restablecer configuración"
3. Sincroniza con Settings Sync (esto elimina los ajustes antiguos de la nube)

---

## Comandos

| Comando                         | Descripción                    |
| ------------------------------- | ------------------------------ |
| `Git ID: Select Identity`       | Abrir el selector de identidad |
| `Git ID: Show Current Identity` | Mostrar información de identidad actual |

---

## Contribuir

¡Las contribuciones son bienvenidas! Ver [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licencia

Licencia MIT - ver [LICENSE](../../../LICENSE).

## Créditos

Creado por [Null;Variant](https://github.com/nullvariant)

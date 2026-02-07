# Git ID Switcher 🌍

> **Esperanto** estas internacia lingvo kreita en 1887 de L. L. Zamenhof.
> Ĝia celo estas faciligi komunikadon inter homoj de diversaj landoj.

---

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Ŝanĝu inter pluraj Git-profiloj per unu klako. Administru plurajn GitHub-kontojn, SSH-ŝlosilojn, GPG-subskribon, kaj <b>aŭtomate apliku profilon al Git-submoduloj</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/attestations"><img src="https://img.shields.io/badge/SLSA-Level_3-green" alt="SLSA 3"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml/badge.svg" alt="Security"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://img.shields.io/badge/%20-Win%20%7C%20Mac%20%7C%20Linux-blue?labelColor=555&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0yMSAySDNjLTEuMSAwLTIgLjktMiAydjEyYzAgMS4xLjkgMiAyIDJoN3YySDh2Mmg4di0yaC0ydi0yaDdjMS4xIDAgMi0uOSAyLTJWNGMwLTEuMS0uOS0yLTItMnptMCAxNEgzVjRoMTh2MTJ6Ii8+PC9zdmc+" alt="Platform"></a>
      <a href="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions"><img src="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions/graph/badge.svg" alt="codecov"></a>
      <a href="https://sonarcloud.io/summary/new_code?id=nullvariant_nullvariant-vscode-extensions"><img src="https://sonarcloud.io/api/project_badges/measure?project=nullvariant_nullvariant-vscode-extensions&metric=alert_status" alt="Quality Gate Status"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <b>🌍</b> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/eo/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Kial Git ID Switcher?

Kvankam multaj Git-profilo-ŝanĝiloj ekzistas, **Git ID Switcher** solvas kompleksajn problemojn kiujn aliaj ignoras:

1. **Submodula Koŝmaro**: Laborante kun deponejoj havantaj submodulojn (ekz: Hugo-temoj, vendoraj bibliotekoj), oni kutime devas mane agordi `git config user.name` por _ĉiu_ submodulo. Ĉi tiu etendo traktas ĝin elegante, rekursie aplikante vian profilon al ĉiuj aktivaj submoduloj.
2. **SSH & GPG Traktado**: Ĝi ne nur ŝanĝas vian nomon; ĝi interŝanĝas viajn SSH-ŝlosilojn en la ssh-agent kaj agordas GPG-subskribon, por ke vi neniam faru commit kun malĝusta subskribo.

## Funkcioj

- **Profila Administra UI**: Aldonu, redaktu, forigu kaj reordigu profilojn sen redakti settings.json
- **Unu-klaka Profilo-Ŝanĝo**: Ŝanĝu vian Git user.name kaj user.email tuj
- **Statusbreto-Integriĝo**: Ĉiam vidu vian nunan profilon per unu rigardo
- **Submodula Subteno**: Aŭtomate disvastigu vian profilon al Git-submoduloj
- **SSH-Ŝlosila Administrado**: Aŭtomate ŝanĝu SSH-ŝlosilojn en ssh-agent
- **GPG-Subskriba Subteno**: Agordu vian GPG-ŝlosilon por commit-subskribo (laŭvola)
- **Riĉaj Konsiletoj**: Detalaj profilo-informoj kun priskribo kaj SSH-gastigo
- **Plurplatforma**: Funkcias sur macOS, Linux, kaj Windows
- **Lokalizita**: Subtenas 17 lingvojn

## 🌏 Noto pri Plurlingva Subteno

> **Mi valoras la ekziston de minoritatoj.**
> Mi ne volas forĵeti ilin nur ĉar ili estas malmultaj.
> Eĉ se tradukoj ne estas perfektaj, mi esperas ke vi povas senti nian intencon montri respekton.

Ĉi tiu etendo subtenas ĉiujn 17 lingvojn subtenatajn de VS Code. Krome, por README-dokumentado, ni provas traduki ankaŭ al minoritataj lingvoj kaj ŝercaj lingvoj.

Ĉi tio ne estas simple "tutmonda subteno", sed "respekto al lingva diverseco". Kaj super la lingvoj, mi esperas ke ĝi fariĝos infrastrukturo kie evoluigistoj ĉie kontribuas komitojn por plibonigi la mondon.

---

## Rapida Komenco

Tipa agordo por administri personan konton kaj kompanian konton (Enterprise Managed User).

### Paŝo 1: Preparu Viajn SSH-Ŝlosilojn

Unue, generu SSH-ŝlosilojn por ĉiu konto (preterpasu se vi jam havas):

```bash
# Persona konto
ssh-keygen -t ed25519 -C "zamenhof@persona.example.com" -f ~/.ssh/id_ed25519_persona

# Labora konto
ssh-keygen -t ed25519 -C "zamenhof@laboro.example.com" -f ~/.ssh/id_ed25519_laboro
```

Registru la **publikan ŝlosilon** (`.pub` dosiero) de ĉiu ŝlosilo al la responda GitHub-konto.

> **Noto**: Al GitHub oni registras `id_ed25519_persona.pub` (publika ŝlosilo). `id_ed25519_persona` (sen etendo) estas la privata ŝlosilo—neniam dividu aŭ alŝutu ĝin ien ajn.

### Paŝo 2: Agordu SSH

Redaktu `~/.ssh/config`:

```ssh-config
# Persona GitHub-konto (defaŭlta)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_persona
    IdentitiesOnly yes

# Labora GitHub-konto
Host github-laboro
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_laboro
    IdentitiesOnly yes
```

### Paŝo 3: Agordu la Etendon

Tuj post instalado, ekzemplaj profiloj estas pretigitaj.
Laŭ la suba gvidilo, redaktu ilin por via propra uzo.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/eo/first-ux.webp" width="600" alt="Unua agordo-proceduro (13 paŝoj): malfermu profilan administradon el statusbreto, redaktu kaj kreu novajn profilojn" loading="lazy">

> **Ŝlosilaj dosieroj ne estas senditaj**: Kiam vi agordas SSH-ŝlosilan vojon, nur la dosiera vojo (loko) estas registrita. La enhavo de la ŝlosila dosiero neniam estas alŝutita aŭ sendata ekstere.

> **Se vi uzas GPG-subskribon**: Vi ankaŭ povas agordi `gpgKeyId` en la profila redakta ekrano.
> Por kiel trovi vian GPG-ŝlosilan ID, vidu "[GPG-subskribo ne funkcias?](#gpg-subskribo-ne-funkcias)".

> **Konsilo**: Vi ankaŭ povas agordi rekte el settings.json.
> Malfermu etendo-agordojn (`Cmd+,` / `Ctrl+,`) → Serĉu "Git ID Switcher" → Klaku "Redakti en settings.json".
> Por JSON-agordo-ekzemploj, vidu "[Plena Ekzemplo: 4 Kontoj kun SSH + GPG](#plena-ekzemplo-4-kontoj-kun-ssh--gpg)".

---

## Plena Ekzemplo: 4 Kontoj kun SSH + GPG

Plena ekzemplo kiu kombinas ĉion:

### SSH-Agordo (`~/.ssh/config`)

```ssh-config
# Persona konto (defaŭlta)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_persona
    IdentitiesOnly yes

# Labora konto (kompania Enterprise Managed User)
Host github-laboro
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_laboro
    IdentitiesOnly yes

# Bitbucket-konto
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Etendo-Agordoj

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "persona",
      "name": "Ludoviko Zamenhof",
      "email": "zamenhof@persona.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Personaj projektoj",
      "sshKeyPath": "~/.ssh/id_ed25519_persona",
      "gpgKeyId": "PERSONA1"
    },
    {
      "id": "laboro",
      "name": "Ludoviko Zamenhof",
      "email": "zamenhof@laboro.example.com",
      "service": "GitHub Laboro",
      "icon": "💼",
      "description": "Labora konto",
      "sshKeyPath": "~/.ssh/id_ed25519_laboro",
      "sshHost": "github-laboro",
      "gpgKeyId": "LABORO12"
    },
    {
      "id": "bitbucket",
      "name": "Ludoviko Zamenhof",
      "email": "zamenhof@bitbucket.example.com",
      "service": "Bitbucket",
      "icon": "🪣",
      "description": "Bitbucket-projektoj",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "liberprofesia",
      "name": "Ludoviko Zamenhof",
      "email": "zamenhof@liberprofesia.example.com",
      "service": "GitLab",
      "icon": "🎯",
      "description": "Liberprofesiaj projektoj"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "persona",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Noto: La lasta profilo (`liberprofesia`) ne havas SSH—ĝi nur ŝanĝas Git-agordon. Utile kiam oni uzas la saman GitHub-konton kun malsamaj commit-informoj.

---

## Profila Administrado

Klaku statusbreton → Malfermu "Profila Administrado" ĉe la fundo de la listo.
Ĉiuj profilo-operacioj—aldoni, redakti, forigi, reordigi—estas rekte alireblaj el la UI.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/eo/identity-management.webp" width="600" alt="Profila administrado: gvidilo pri forigo kaj reordigado" loading="lazy">

Vi ankaŭ povas forigi profilon el komand-paleto per `Git ID Switcher: Delete Identity`.

---

## Komandoj

| Komando                                  | Priskribo                     |
| ---------------------------------------- | ----------------------------- |
| `Git ID Switcher: Select Identity`       | Malfermu la profilo-elektilon |
| `Git ID Switcher: Delete Identity`       | Forigu profilon               |
| `Git ID Switcher: Show Current Identity` | Montru nunan profilo-informon |
| `Git ID Switcher: Show Documentation`    | Montri dokumentaron           |

---

## Agorda Referenco

### Profilo-Propraĵoj

| Propraĵo      | Deviga | Priskribo                                                       |
| ------------- | ------ | --------------------------------------------------------------- |
| `id`          | ✅     | Unika identigilo (ekz: `"persona"`, `"laboro"`)                 |
| `name`        | ✅     | Git user.name — montrita en commit-oj                           |
| `email`       | ✅     | Git user.email — montrita en commit-oj                          |
| `icon`        |        | Emoji montrita en statusbreto (ekz: `"🏠"`). Nur unu emoji      |
| `service`     |        | Serva nomo (ekz: `"GitHub"`, `"GitLab"`). Por UI                |
| `description` |        | Mallonga priskribo por elektilo kaj konsileto                   |
| `sshKeyPath`  |        | Vojo al privata SSH-ŝlosilo (ekz: `"~/.ssh/id_ed25519_laboro"`) |
| `sshHost`     |        | SSH-agordo gastiga kaŝnomo (ekz: `"github-laboro"`)             |
| `gpgKeyId`    |        | GPG-ŝlosila ID por commit-subskribo                             |

#### Montraj Limigoj

- **Statusbreto**: Teksto pli longa ol ~25 signoj estos mallongigita per `...`
- **`icon`**: Nur unu emoji (grapheme cluster) permesata. Multaj emojioj aŭ longa teksto ne funkcias

### Ĝeneralaj Agordoj

| Agordo                                     | Defaŭlto     | Priskribo                                                                       |
| ------------------------------------------ | ------------ | ------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Ekzemplo ref | Listo de profilo-agordoj                                                        |
| `gitIdSwitcher.defaultIdentity`            | Ekzemplo ref | Defaŭlta profilo ID                                                             |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`       | Aŭtomate ŝanĝu SSH-ŝlosilon                                                     |
| `gitIdSwitcher.showNotifications`          | `true`       | Montru sciigon kiam ŝanĝante profilon                                           |
| `gitIdSwitcher.applyToSubmodules`          | `true`       | Apliku profilon al Git-submoduloj                                               |
| `gitIdSwitcher.submoduleDepth`             | `1`          | Maks. profundeco por nestitaj submoduloj (1-5)                                  |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`      | Skribu emoji-ikonon al Git-agordo `user.name`                                   |
| `gitIdSwitcher.logging.fileEnabled`        | `false`      | Konservu reviziajn protokolojn en dosiero (ID-ŝanĝoj, SSH-operacioj ktp.)       |
| `gitIdSwitcher.logging.filePath`           | `""`         | Protokol-dosiera vojo (ekz: `~/.git-id-switcher/security.log`). Malplena = def  |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`   | Maks. dosiera grandeco antaŭ rotacio (bajtoj, 1MB-100MB)                        |
| `gitIdSwitcher.logging.maxFiles`           | `5`          | Nombro de protokol-dosieroj por konservi (1-20)                                 |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`      | Kiam ebligita, ĉiuj valoroj estas maskitaj en protokoloj (maks. privateco)      |
| `gitIdSwitcher.logging.level`              | `"INFO"`     | Protokolado-nivelo (DEBUG/INFO/WARN/ERROR/SECURITY). Registras elektitan+supre  |
| `gitIdSwitcher.commandTimeouts`            | `{}`         | Persona tempolimo por komandoj (ms, 1s-5min) ekz: `{"git":15000,"ssh-add":...}` |

#### Pri `includeIconInGitConfig`

Kontrolas konduton kiam `icon`-kampo estas agordita:

| Valoro             | Konduto                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `false` (defaŭlto) | `icon` montriĝas nur en redaktilo-UI. Nur `name` estas skribita al Git-agordo |
| `true`             | `icon + name` estas skribita al Git-agordo. Emoji restas en commit-historio   |

Ekzemplo: `icon: "👤"`, `name: "Ludoviko Zamenhof"`

| includeIconInGitConfig | Git-agordo `user.name` | Commit-subskribo                  |
| ---------------------- | ---------------------- | --------------------------------- |
| `false`                | `Ludoviko Zamenhof`    | `Ludoviko Zamenhof <retpoŝto>`    |
| `true`                 | `👤 Ludoviko Zamenhof` | `👤 Ludoviko Zamenhof <retpoŝto>` |

---

## Kiel Ĝi Funkcias

### Git-Agordo Tavola Strukturo

Git-agordo havas tri tavolojn; pli malaltaj tavoloj superskribas pli altajn:

```text
Sistemo (/etc/gitconfig)
    ↓ superskribas
Ĝenerala (~/.gitconfig)
    ↓ superskribas
Loka (.git/config)  ← plej alta prioritato
```

**Git ID Switcher skribas al `--local` (deponeja loka) nivelo.**

Tio signifas:

- Profilo estas konservita en la `.git/config`-dosiero de ĉiu deponejo
- Malsamaj profiloj povas esti konservitaj por ĉiu deponejo
- Ĝeneralaj agordoj (`~/.gitconfig`) ne estas modifitaj

### Profilo-Ŝanĝa Konduto

Kiam vi ŝanĝas profilon, la etendo plenumas (en ordo):

1. **Git-Agordo** (ĉiam): Agordas `git config --local user.name` kaj `user.email`
2. **SSH-Ŝlosilo** (se `sshKeyPath` agordita): Forigas aliajn ŝlosilojn el ssh-agent, aldonas la elektitan
3. **GPG-Ŝlosilo** (se `gpgKeyId` agordita): Agordas `git config --local user.signingkey` kaj ebligas subskribon
4. **Submoduloj** (se ebligita): Disvastigas agordon al ĉiuj submoduloj (defaŭlte: profundeco 1)

### Submodula Disvastiga Mekanismo

Ĉar loka agordo funkcias sur deponeja nivelo, ĝi ne aŭtomate aplikiĝas al submoduloj.
Tial ĉi tiu etendo provizas submodulan disvastigan funkcion (vidu "Altnivela: Submodula Subteno" por detaloj).

### SSH-Ŝlosila Administrada Detaloj

Git ID Switcher administras SSH-ŝlosilojn per `ssh-agent`:

| Operacio        | Plenumita komando      |
| --------------- | ---------------------- |
| Aldonu ŝlosilon | `ssh-add <keyPath>`    |
| Forigu ŝlosilon | `ssh-add -d <keyPath>` |
| Listo ŝlosilojn | `ssh-add -l`           |

**Grava**: Ĉi tiu etendo **ne modifas** `~/.ssh/config`. Vi devas mane agordi SSH config (vidu Paŝo 2 en "Rapida Komenco").

### Interagado kun Ekzistantaj SSH-Agordoj

Se vi jam havas SSH-agordojn, Git ID Switcher funkcias jene:

| Via Agordo                            | Git ID Switcher Konduto                                   |
| ------------------------------------- | --------------------------------------------------------- |
| `~/.ssh/config` kun `IdentityFile`    | Ambaŭ uzeblas; `IdentitiesOnly yes` malhelpas konfliktojn |
| Mediovariablo `GIT_SSH_COMMAND`       | Uzas propran SSH-komandon; ssh-agent ankoraŭ funkcias     |
| `git config core.sshCommand`          | Same kiel supre                                           |
| direnv kun SSH-rilataj mediovariabloj | Povas kunekzisti; ssh-agent funkcias sendepende           |

**Rekomendo**: Ĉiam uzu `IdentitiesOnly yes` en SSH config. Ĉi tio malhelpas SSH provi plurajn ŝlosilojn.

### Kial `IdentitiesOnly yes`?

Sen ĉi tiu agordo, SSH eble provas ŝlosilojn en ĉi tiu ordo:

1. Ŝlosiloj ŝarĝitaj en ssh-agent (administritaj de Git ID Switcher)
2. Ŝlosiloj specifitaj en `~/.ssh/config`
3. Defaŭltaj ŝlosiloj (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` ktp.)

Ĉi tio povas kaŭzi aŭtentikig-malsukceson aŭ uzon de neintencita ŝlosilo.

Kun `IdentitiesOnly yes`, SSH uzas **nur la specifitan ŝlosilon**. Ĉi tio certigas ke via Git ID Switcher-agordita ŝlosilo estas uzata.

```ssh-config
# Rekomendita agordo
Host github-laboro
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_laboro
    IdentitiesOnly yes  # ← Ĉi tiu linio estas grava
```

Kun ĉi tiu agordo, kiam vi konektas al la gastigo `github-laboro`, nur `~/.ssh/id_ed25519_laboro` estos uzata, kaj neniuj aliaj ŝlosiloj estos provitaj.

---

## Altnivela: Submodula Subteno

Por kompleksaj deponejoj kun Git-submoduloj, profila administrado ofte malfacilas. Se vi faras commit en submodulo, Git uzas la lokan agordon de tiu submodulo; se ne eksplicite agordita, ĝi povas reveni al la ĝenerala agordo (malĝusta retpoŝto!).

**Git ID Switcher** aŭtomate detektas submodulojn kaj aplikas la elektitan profilon al ili.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Ebligi/malebligi ĉi tiun funkcion
- `submoduleDepth`: Kiom profunde iri?
  - `1`: Nur rektaj submoduloj (plej ofta)
  - `2+`: Nestitaj submoduloj (submoduloj ene de submoduloj)

Ĉi tio certigas ke via profilo ĉiam estas ĝusta, ĉu vi faras commit en la ĉefa deponejo aŭ en vendora biblioteko.

---

## Problemsolvado

### SSH-ŝlosilo ne ŝanĝiĝas?

1. Certigu ke `ssh-agent` funkcias:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Kontrolu ke la ŝlosila vojo estas ĝusta:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. Sur macOS, aldonu al Keychain unufoje:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_laboro
   ```

### Malĝusta profilo ĉe push?

**Por novaj klonoj:**

Kiam vi klonas laboran deponejon, uzu la gastigon-kaŝnomon el via SSH config:

```bash
# Por labora profilo (uzas github-laboro kaŝnomon)
git clone git@github-laboro:kompanio/repo.git

# Por persona profilo (uzas defaŭltan github.com)
git clone git@github.com:via-nomo/repo.git
```

**Por ekzistantaj deponejoj:**

1. Kontrolu ke la fora URL uzas la ĝustan gastigan kaŝnomon:

   ```bash
   git remote -v
   # Por laboraj deponejoj devus montri git@github-laboro:...
   ```

2. Ĝisdatigu se necese:

   ```bash
   git remote set-url origin git@github-laboro:kompanio/repo.git
   ```

### GPG-subskribo ne funkcias?

1. Trovu vian GPG-ŝlosilan ID:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Testu subskribon:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Certigu ke la retpoŝto en via profilo kongruas kun la retpoŝto de la GPG-ŝlosilo.

### Profilo ne detektita?

- Certigu ke vi estas en Git-deponejo
- Kontrolu sintaksan eraron en `settings.json`
- Reŝargu VS Code fenestron (`Cmd+Shift+P` → "Reŝargi Fenestron")

### Eraro en `name`-kampo?

Se la `name`-kampo enhavas la jenajn signojn, eraro okazas:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Se vi volas inkluzivi servan nomon, uzu la `service`-kampon.

```jsonc
// MALĜUSTA
"name": "Ludoviko Zamenhof (Persona)"

// ĜUSTA
"name": "Ludoviko Zamenhof",
"service": "GitHub"
```

### Novaj agordoj ne aperas?

Eĉ post ĝisdatigo de la etendo, novaj agordoj eble ne aperos en la agord-ekrano.

**Solvo:** Restartigi vian maŝinon tute.

Redaktiloj kiel VS Code konservas agord-skemon en memoro, kaj "Reŝargi Fenestron" aŭ reinstali la etendon eble ne sufiĉas.

### Defaŭltaj valoroj (identities ktp.) malplenaj?

Se ekzemplaj agordoj ne aperas eĉ ĉe nova instalado, la kaŭzo eble estas **Settings Sync**.

Se vi antaŭe konservis malplenajn agordojn, ili estis sinkronigitaj al la nubo kaj eble superskribus defaŭltajn valorojn ĉe nova instalado.

**Solvo:**

1. Trovu la rilatan agordon en agord-ekrano
2. Dentrado-ikono → Elektu "Restarigi Agordon"
3. Sinkronigu per Settings Sync (malnovaj agordoj estos forigitaj el la nubo)

---

## Pri Esperanto 📚

| Esperanto  | English    | Priskribo                 |
| ---------- | ---------- | ------------------------- |
| Saluton!   | Hello!     | Ĝenerala saluto           |
| Dankon!    | Thank you! | Esprimi dankon            |
| Bonvolu    | Please     | Ĝentile peti              |
| Ĝis revido | Goodbye    | Ĝis ni renkontiĝos denove |

### Lerni Esperanton

- [Lernu.net](https://lernu.net/) - Senpaga Esperanto-lernejo
- [Duolingo Esperanto](https://www.duolingo.com/course/eo/en/Learn-Esperanto)
- [Vikipedio en Esperanto](https://eo.wikipedia.org/)

---

## Dezajna Filozofio

> **"Kiu mi estas?"** — La sola demando, kiun ĉi tiu etendaĵo respondas.

Konstruita sur **Karesansui-Arkitekturo**: simpla kerno (100 linioj),
ĉirkaŭita de intenca kvalito (90% kovrado, protokolado, tempolimoj)
kaj konsciaj limigoj (sen GitHub API, sen ĵetonoadministrado).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Legu la plenan filozofion](../../DESIGN_PHILOSOPHY.md)

---

## Kontribuado

Ni bonvenigas kontribuojn! Vidu [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Permesilo

MIT-Permesilo - Vidu [LICENSE](../../../LICENSE).

## Kreditoj

Kreita de [Null;Variant](https://github.com/nullvariant)

---

🌍 **La espero - La mondo apartenas al ĉiuj!** 🌍

_(Hope - The world belongs to everyone!)_

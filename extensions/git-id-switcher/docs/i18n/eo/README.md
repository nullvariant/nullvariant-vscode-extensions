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
      Ŝanĝu inter pluraj Git-identecoj per unu klako. Administru plurajn GitHub-kontojn, SSH-ŝlosilojn, GPG-subskribon, kaj <b>aŭtomate apliku identecon al Git-submoduloj</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <br>
      🌐 Lingvoj: <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 pli</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-eo.png" width="600" alt="Demo">

## 🎯 Kial Ĉi Tiu Etendo?

Kvankam multaj Git-identeco-ŝanĝiloj ekzistas, **Git ID Switcher** solvas la kompleksajn problemojn kiujn aliaj ignoras:

1. **Submodula Koŝmaro**: Laborante kun deponejoj havantaj submodulojn, oni kutime devas mane agordi `git config user.name` por *ĉiu* submodulo. Ĉi tiu etendo traktas ĝin elegante, rekursie aplikante vian identecon al ĉiuj aktivaj submoduloj.
2. **SSH & GPG Traktado**: Ĝi ne nur ŝanĝas vian nomon; ĝi interŝanĝas viajn SSH-ŝlosilojn en la agento kaj agordas GPG-subskribon, por ke vi neniam faru commit kun malĝusta subskribo.

## Funkcioj

- **Submodula Subteno**: Aŭtomate disvastigu vian identecon al Git-submoduloj
- **SSH-Ŝlosila Administrado**: Aŭtomate ŝanĝu SSH-ŝlosilojn en ssh-agent
- **GPG-Subskriba Subteno**: Agordu vian GPG-ŝlosilon por commit-subskribo (laŭvola)
- **Unu-klaka Identeco-Ŝanĝo**: Ŝanĝu vian Git user.name kaj user.email tuj
- **Statusbreto-Integriĝo**: Ĉiam vidu vian nunan identecon per unu rigardo
- **Riĉaj Konsiletoj**: Detalaj identeco-informoj kun priskribo kaj SSH-gastigo
- **Plurplatforma**: Funkcias sur macOS, Linux, kaj Windows
- **Lokalizita**: Subtenas 17 lingvojn

## 🌏 Noto pri Plurlingva Subteno

> **Mi valoras la ekziston de minoritatoj.**
> Mi ne volas forĵeti ilin nur ĉar ili estas malmultaj.
> Eĉ se tradukoj ne estas perfektaj, mi esperas ke vi povas senti nian intencon montri respekton.

Esperanto mem naskiĝis el la ideo de lingva egaleco—ke ĉiu homo meritas voĉon, sendepende de sia denaska lingvo. Ĉi tiu etendo portas la saman spiriton.

---

## Rapida Komenco

Tipa agordo por administri personan konton kaj entrepranan konton (Enterprise Managed User).

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
# Persona Konto
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_persona
    IdentitiesOnly yes

# Labora Konto
Host github-laboro
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_laboro
    IdentitiesOnly yes
```

### Paŝo 3: Agordu la Etendon

Malfermu etendo-agordojn (`Cmd+,` / `Ctrl+,`) → Serĉu "Git ID Switcher" → Klaku "Redakti en settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "persona",
      "icon": "🏠",
      "name": "Ludoviko Zamenhof",
      "service": "GitHub",
      "email": "zamenhof@persona.example.com",
      "description": "Personaj projektoj",
      "sshKeyPath": "~/.ssh/id_ed25519_persona"
    },
    {
      "id": "laboro",
      "icon": "💼",
      "name": "Ludoviko Zamenhof",
      "service": "GitHub Laboro",
      "email": "zamenhof@laboro.example.com",
      "description": "Labora evoluo",
      "sshKeyPath": "~/.ssh/id_ed25519_laboro",
      "sshHost": "github-laboro"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "persona",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Paŝo 4: Uzu!

1. Klaku la identeco-ikonon en la statusbreto (malsupra dekstra)
2. Elektu vian identecon
3. Farite! Via Git-agordo kaj SSH-ŝlosilo estas ŝanĝitaj.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-eo.png" width="600" alt="Quick Pick">

### Uzi SSH-Gastigajn Kaŝnomojn

Klonante deponejojn, uzu la gastigon kiu respondas al via identeco:

```bash
# Por labora identeco (uzas github-laboro kaŝnomon)
git clone git@github-laboro:kompanio/repo.git

# Por persona identeco (uzas defaŭltan github.com)
git clone git@github.com:zamenhof/repo.git
```

---

## Laŭvola: GPG-Subskribo

Se vi subskribas commit-ojn per GPG:

### Paŝo 1: Trovu Vian GPG-Ŝlosilan ID

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Ekzempla eligo:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Ludoviko Zamenhof <zamenhof@persona.example.com>
```

La ŝlosila ID estas `ABCD1234`.

### Paŝo 2: Aldonu GPG-Ŝlosilon al la Identeco

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "persona",
      "icon": "🏠",
      "name": "Ludoviko Zamenhof",
      "service": "GitHub",
      "email": "zamenhof@persona.example.com",
      "description": "Personaj projektoj",
      "sshKeyPath": "~/.ssh/id_ed25519_persona",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Kiam vi ŝanĝas al ĉi tiu identeco, la etendo agordas:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

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

# Labora konto
Host github-laboro
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_laboro
    IdentitiesOnly yes

# Bitbucket konto
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
      "icon": "🏠",
      "name": "Ludoviko Zamenhof",
      "service": "GitHub",
      "email": "zamenhof@persona.example.com",
      "description": "Personaj projektoj",
      "sshKeyPath": "~/.ssh/id_ed25519_persona",
      "gpgKeyId": "PERSONA1"
    },
    {
      "id": "laboro",
      "icon": "💼",
      "name": "Ludoviko Zamenhof",
      "service": "GitHub Laboro",
      "email": "zamenhof@laboro.example.com",
      "description": "Labora konto",
      "sshKeyPath": "~/.ssh/id_ed25519_laboro",
      "sshHost": "github-laboro",
      "gpgKeyId": "LABORO12"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "Ludoviko Zamenhof",
      "service": "Bitbucket",
      "email": "zamenhof@bitbucket.example.com",
      "description": "Bitbucket-projektoj",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "liberprofesia",
      "icon": "🎯",
      "name": "Ludoviko Zamenhof",
      "service": "GitLab",
      "email": "zamenhof@liberprofesia.example.com",
      "description": "Liberprofesiaj projektoj"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "persona",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Noto: La lasta identeco (`liberprofesia`) ne havas SSH—ĝi nur ŝanĝas Git-agordon. Utile kiam oni uzas la saman GitLab-konton kun malsamaj commit-informoj.

---

## Agorda Referenco

### Identeco-Propraĵoj

| Propraĵo      | Deviga | Priskribo                                                  |
| ------------- | ------ | ---------------------------------------------------------- |
| `id`          | ✅     | Unika identigilo (ekz: `"laboro"`, `"persona"`)            |
| `name`        | ✅     | Git user.name — montrita en commit-oj                      |
| `email`       | ✅     | Git user.email — montrita en commit-oj                     |
| `icon`        |        | Emoji montrita en statusbreto (ekz: `"🏠"`). Nur unu emoji |
| `service`     |        | Serva nomo (ekz: `"GitHub"`, `"GitLab"`). Por UI           |
| `description` |        | Mallonga priskribo por elektilo kaj konsileto              |
| `sshKeyPath`  |        | Vojo al privata SSH-ŝlosilo (ekz: `"~/.ssh/id_ed25519_laboro"`) |
| `sshHost`     |        | SSH-agordo gastiga kaŝnomo (ekz: `"github-laboro"`)        |
| `gpgKeyId`    |        | GPG-ŝlosila ID por commit-subskribo                        |

#### Montraj Limigoj

- **Statusbreto**: Teksto pli longa ol ~25 signoj estos mallongigita per `...`
- **`icon`**: Nur unu emoji (grapheme cluster) permesata. Multaj emojioj aŭ longa teksto ne funkcias

### Ĝeneralaj Agordoj

| Agordo                              | Defaŭlto   | Priskribo                                      |
| ----------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`          | Vidu ekz.  | Listo de identeco-agordoj                      |
| `gitIdSwitcher.defaultIdentity`     | Vidu ekz.  | Defaŭlta identeco ID                           |
| `gitIdSwitcher.autoSwitchSshKey`    | `true`     | Aŭtomate ŝanĝu SSH-ŝlosilon                    |
| `gitIdSwitcher.showNotifications`   | `true`     | Montru sciigon kiam ŝanĝante                   |
| `gitIdSwitcher.applyToSubmodules`   | `true`     | Apliku identecon al Git-submoduloj             |
| `gitIdSwitcher.submoduleDepth`      | `1`        | Maks. profundeco por nestitaj submoduloj (1-5) |
| `gitIdSwitcher.includeIconInGitConfig` | `false` | Skribu emoji-ikonon al Git-agordo `user.name`  |
| `gitIdSwitcher.logging.fileEnabled` | `false`    | Ebligi protokoladon al dosiero por revizio     |
| `gitIdSwitcher.logging.filePath`    | `""`       | Persona protokol-dosiera vojo                  |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Maks. dosiera grandeco antaŭ rotacio (bajtoj, 1MB-100MB) |
| `gitIdSwitcher.logging.maxFiles`    | `5`        | Nombro de protokol-dosieroj por konservi (1-20) |
| `gitIdSwitcher.logging.level`       | `"INFO"`   | Protokolado-nivelo (DEBUG/INFO/WARN/ERROR/SECURITY) |
| `gitIdSwitcher.commandTimeouts`     | `{}`       | Tempolimo por eksteraj komandoj (ms, 1s-5min)  |

#### Pri `includeIconInGitConfig`

Kontrolas konduton kiam `icon`-kampo estas agordita:

| Valoro | Konduto |
|--------|---------|
| `false` (defaŭlto) | `icon` montriĝas nur en redaktilo-UI. Nur `name` estas skribita al Git-agordo |
| `true` | `icon + name` estas skribita al Git-agordo. Emoji restas en commit-historio |

Ekzemplo: `icon: "👤"`, `name: "Ludoviko Zamenhof"`

| includeIconInGitConfig | Git-agordo `user.name` | Commit-subskribo |
|------------------------|------------------------|------------------|
| `false` | `Ludoviko Zamenhof` | `Ludoviko Zamenhof <retpoŝto>` |
| `true` | `👤 Ludoviko Zamenhof` | `👤 Ludoviko Zamenhof <retpoŝto>` |

### Noto: Baza Agordo (Sen SSH)

Se vi ne bezonas SSH-ŝlosilan ŝanĝon (ekz., uzante la saman GitHub-konton kun malsamaj commit-informoj), vi povas uzi minimuman agordon:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "persona",
      "icon": "🏠",
      "name": "Ludoviko Zamenhof",
      "email": "zamenhof@persona.example.com",
      "description": "Personaj projektoj"
    },
    {
      "id": "laboro",
      "icon": "💼",
      "name": "Ludoviko Zamenhof",
      "email": "zamenhof@laboro.example.com",
      "description": "Labora konto"
    }
  ]
}
```

Ĉi tiu agordo nur ŝanĝas `git config user.name` kaj `user.email`.

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

- Identeco estas konservita en la `.git/config`-dosiero de ĉiu deponejo
- Malsamaj identecoj povas esti konservitaj por ĉiu deponejo
- Ĝeneralaj agordoj (`~/.gitconfig`) ne estas modifitaj

### Identeco-Ŝanĝa Konduto

Kiam vi ŝanĝas identecon, la etendo plenumas (en ordo):

1. **Git-Agordo** (ĉiam): Agordas `git config --local user.name` kaj `user.email`
2. **SSH-Ŝlosilo** (se `sshKeyPath` agordita): Forigas aliajn ŝlosilojn el ssh-agent, aldonas la elektitan
3. **GPG-Ŝlosilo** (se `gpgKeyId` agordita): Agordas `git config --local user.signingkey` kaj ebligas subskribon
4. **Submoduloj** (se ebligita): Disvastigas agordon al ĉiuj submoduloj (defaŭlte: profundeco 1)

### Submodula Disvastiga Mekanismo

Ĉar loka agordo funkcias sur deponeja nivelo, ĝi ne aŭtomate aplikiĝas al submoduloj.
Tial ĉi tiu etendo provizas submodulan disvastigan funkcion (vidu "Altnivela: Submodula Subteno" por detaloj).

---

## Altnivela: Submodula Subteno

Por kompleksaj deponejoj kun Git-submoduloj, identeco-administrado ofte malfacilas. Se vi faras commit en submodulo, Git uzas la lokan agordon de tiu submodulo; se ne eksplicite agordita, ĝi povas reveni al la ĝenerala agordo (malĝusta retpoŝto!).

**Git ID Switcher** aŭtomate detektas submodulojn kaj aplikas la elektitan identecon al ili.

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

Ĉi tio certigas ke via identeco ĉiam estas ĝusta, ĉu vi faras commit en la ĉefa deponejo aŭ en vendora biblioteko.

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

### Malĝusta identeco ĉe push?

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

3. Certigu ke la retpoŝto en via identeco kongruas kun la retpoŝto de la GPG-ŝlosilo.

### Identeco ne detektita?

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

| Esperanto | English | Priskribo |
|-----------|---------|-----------|
| Saluton! | Hello! | Ĝenerala saluto |
| Dankon! | Thank you! | Esprimi dankon |
| Bonvolu | Please | Ĝentile peti |
| Ĝis revido | Goodbye | Ĝis ni renkontiĝos denove |

### Lerni Esperanton

- [Lernu.net](https://lernu.net/) - Senpaga Esperanto-lernejo
- [Duolingo Esperanto](https://www.duolingo.com/course/eo/en/Learn-Esperanto)
- [Vikipedio en Esperanto](https://eo.wikipedia.org/)

---

## Komandoj

| Komando                         | Priskribo                      |
| ------------------------------- | ------------------------------ |
| `Git ID: Select Identity`       | Malfermu la identeco-elektilon |
| `Git ID: Show Current Identity` | Montru nunan identeco-informon |

---

## Kontribuado

Ni bonvenigas kontribuojn! Vidu [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Permesilo

MIT-Permesilo - Vidu [LICENSE](../../../LICENSE).

## Kreditoj

Kreita de [Null;Variant](https://github.com/nullvariant)

---

🌍 **La espero - La mondo apartenas al ĉiuj!** 🌍

*(Hope - The world belongs to everyone!)*

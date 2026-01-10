# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Passa tra più identità Git con un clic. Gestisci più account GitHub, chiavi SSH, firma GPG e <b>applica automaticamente l'identità ai sottomoduli Git</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <a href="https://securityscorecards.dev/viewer/?uri=github.com/nullvariant/nullvariant-vscode-extensions"><img src="https://api.securityscorecards.dev/projects/github.com/nullvariant/nullvariant-vscode-extensions/badge" alt="OpenSSF Scorecard"></a>
      <a href="https://www.bestpractices.dev/projects/11709"><img src="https://www.bestpractices.dev/projects/11709/badge" alt="OpenSSF Best Practices"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/attestations"><img src="https://img.shields.io/badge/SLSA-Level_3-green" alt="SLSA 3"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/security.yml/badge.svg" alt="Security"></a>
      <a href="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml"><img src="https://github.com/nullvariant/nullvariant-vscode-extensions/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
      <a href="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions"><img src="https://codecov.io/gh/nullvariant/nullvariant-vscode-extensions/graph/badge.svg" alt="codecov"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <b>🇮🇹</b> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-it.png" width="600" alt="Demo">

## 🎯 Perché Git ID Switcher?

Sebbene esistano molti strumenti per cambiare identità Git, **Git ID Switcher** risolve problemi complessi che altri spesso ignorano:

1. **L'incubo dei sottomoduli**: Quando si lavora con repository che hanno sottomoduli (temi Hugo, librerie vendor, ecc.), di solito bisogna configurare `git config user.name` manualmente per *ogni* sottomodulo. Questa estensione lo gestisce elegantemente applicando ricorsivamente la tua identità a tutti i sottomoduli attivi.
2. **Gestione SSH e GPG**: Non cambia solo il tuo nome; scambia anche le tue chiavi SSH nell'agent e configura la firma GPG in modo che tu non faccia mai commit con la firma sbagliata.

## Funzionalità

- **Supporto sottomoduli**: Propaga automaticamente l'identità ai sottomoduli Git
- **Gestione chiavi SSH**: Cambia automaticamente le chiavi SSH in ssh-agent
- **Supporto firma GPG**: Configura la chiave GPG per firmare i commit (opzionale)
- **Cambio identità con un clic**: Cambia Git user.name e user.email istantaneamente
- **Integrazione barra di stato**: Visualizza sempre la tua identità corrente a colpo d'occhio
- **Tooltip dettagliati**: Informazioni complete con descrizione e host SSH
- **Multipiattaforma**: Funziona su macOS, Linux e Windows
- **Multilingue**: Supporta 17 lingue

## 🌏 Una nota sul supporto multilingue

> **Valorizzo l'esistenza delle minoranze.**
> Non voglio scartarle solo perché sono poche di numero.
> Anche se le traduzioni non sono perfette, spero che possiate percepire la nostra intenzione di comprendere e mostrare rispetto per le lingue minoritarie.

Questa estensione supporta tutte le 17 lingue supportate da VSCode. Inoltre, per la documentazione README, ci stiamo sfidando a tradurre in lingue minoritarie e persino lingue umoristiche.

Questo non è solo "supporto globale" - è "rispetto per la diversità linguistica". E sarei felice se questo diventasse un'infrastruttura dove commit che migliorano il mondo provengono da sviluppatori ovunque, trascendendo le barriere linguistiche.

---

## Avvio rapido

Una configurazione tipica per gestire un account personale e un account di lavoro (Enterprise Managed User).

### Passo 1: Preparare le chiavi SSH

Prima, crea le chiavi SSH per ogni account (salta se le hai già):

```bash
# Personale
ssh-keygen -t ed25519 -C "andrea.rossi@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Lavoro
ssh-keygen -t ed25519 -C "andrea.rossi@company.example.com" -f ~/.ssh/id_ed25519_work
```

Registra la **chiave pubblica** (file `.pub`) di ogni chiave sull'account GitHub corrispondente.

> **Nota**: Su GitHub registra `id_ed25519_personal.pub` (chiave pubblica). `id_ed25519_personal` (senza estensione) è la chiave privata - non condividerla mai e non caricarla da nessuna parte.

### Passo 2: Configurare SSH

Modifica `~/.ssh/config`:

```ssh-config
# Account GitHub personale (predefinito)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Account GitHub di lavoro (Enterprise Managed User fornito dall'azienda)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Passo 3: Configurare l'estensione

Apri le impostazioni dell'estensione (`Cmd+,` / `Ctrl+,`) → cerca "Git ID Switcher" → clicca su "Modifica in settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@personal.example.com",
      "service": "GitHub",
      "description": "Progetti personali",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@company.example.com",
      "service": "GitHub Lavoro",
      "description": "Account di lavoro",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Passo 4: Usare

1. Clicca sull'icona dell'identità nella barra di stato (in basso a destra)
2. Seleziona un'identità
3. Fatto! La configurazione Git e la chiave SSH sono ora cambiate.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-it.png" width="600" alt="Quick Pick">

### Usare gli alias host SSH

Quando cloni i repository, usa l'host che corrisponde alla tua identità:

```bash
# Per l'identità di lavoro (usa l'alias github-work)
git clone git@github-work:company/repo.git

# Per l'identità personale (usa github.com predefinito)
git clone git@github.com:arossi/repo.git
```

---

## Opzionale: Firma GPG

Se firmi i commit con GPG:

### Passo 1: Trovare il tuo ID chiave GPG

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Esempio di output:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Andrea Rossi <andrea.rossi@personal.example.com>
```

L'ID della chiave è `ABCD1234`.

### Passo 2: Aggiungere la chiave GPG all'identità

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@personal.example.com",
      "service": "GitHub",
      "description": "Progetti personali",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Quando passi a questa identità, l'estensione configura:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Esempio completo: 4 account con SSH + GPG

Ecco un esempio completo che combina tutto:

### Configurazione SSH (`~/.ssh/config`)

```ssh-config
# Account personale (predefinito)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Account di lavoro (Enterprise Managed User fornito dall'azienda)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Account Bitbucket
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Impostazioni dell'estensione

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@personal.example.com",
      "service": "GitHub",
      "description": "Progetti personali",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@company.example.com",
      "service": "GitHub Lavoro",
      "description": "Account di lavoro",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "arossi-bb",
      "email": "arossi.bb@example.com",
      "service": "Bitbucket",
      "description": "Progetti Bitbucket",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@freelance.example.com",
      "service": "GitLab",
      "description": "Progetti freelance"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Nota: L'ultima identità (`freelance`) non ha SSH — cambia solo la configurazione Git. Questo è utile quando usi informazioni committer diverse con lo stesso account GitHub.

---

## Riferimento configurazione

### Proprietà identità

| Proprietà     | Richiesto | Descrizione                                                |
| ------------- | --------- | ---------------------------------------------------------- |
| `id`          | ✅        | Identificatore unico (es: `"work"`, `"personal"`)          |
| `name`        | ✅        | Git user.name - mostrato nei commit                        |
| `email`       | ✅        | Git user.email - mostrato nei commit                       |
| `icon`        |           | Emoji mostrato nella barra di stato (es.: `"🏠"`). Solo un emoji |
| `service`     |           | Nome del servizio (es: `"GitHub"`, `"GitLab"`). Usato per la visualizzazione UI |
| `description` |           | Breve descrizione mostrata nel selettore e tooltip         |
| `sshKeyPath`  |           | Percorso della chiave SSH privata (es: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |           | Alias host SSH (es: `"github-work"`)                       |
| `gpgKeyId`    |           | ID chiave GPG per firmare i commit                         |

#### Limitazioni di visualizzazione

- **Barra di stato**: Il testo che supera ~25 caratteri verrà troncato con `...`
- **`icon`**: È consentito solo un singolo emoji (cluster di grafemi). Non sono supportati emoji multipli o stringhe lunghe

### Impostazioni globali

| Impostazione                           | Predefinito  | Descrizione                                    |
| -------------------------------------- | ------------ | ---------------------------------------------- |
| `gitIdSwitcher.identities`             | Vedi esempio | Lista delle configurazioni identità            |
| `gitIdSwitcher.defaultIdentity`        | Vedi esempio | ID dell'identità predefinita                   |
| `gitIdSwitcher.autoSwitchSshKey`       | `true`       | Cambia automaticamente la chiave SSH           |
| `gitIdSwitcher.showNotifications`      | `true`       | Mostra notifica al cambio identità             |
| `gitIdSwitcher.applyToSubmodules`      | `true`       | Propaga identità ai sottomoduli Git            |
| `gitIdSwitcher.submoduleDepth`         | `1`          | Profondità max per sottomoduli annidati (1-5)  |
| `gitIdSwitcher.includeIconInGitConfig` | `false`      | Includi emoji icona nel Git config `user.name` |
| `gitIdSwitcher.logging.fileEnabled` | `false` | Abilita log di audit (cambio identità, operazioni SSH, ecc.) |
| `gitIdSwitcher.logging.filePath` | `""` | Percorso file di log (es.: `~/.git-id-switcher/security.log`). Vuoto = posizione predefinita |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Dimensione max file prima della rotazione (byte, 1MB-100MB) |
| `gitIdSwitcher.logging.maxFiles` | `5` | Num. max file di log in rotazione (1-20) |
| `gitIdSwitcher.logging.level` | `"INFO"` | Livello log: `DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`. Registra il livello selezionato e superiori |
| `gitIdSwitcher.commandTimeouts` | `{}` | Timeout personalizzato per comando (ms, 1sec-5min). Es.: `{"git": 15000, "ssh-add": 10000}` |

#### Informazioni su `includeIconInGitConfig`

Controlla il comportamento quando il campo `icon` è impostato:

| Valore | Comportamento |
|--------|---------------|
| `false` (predefinito) | `icon` viene mostrato solo nell'interfaccia dell'editor. Solo `name` viene scritto nella config Git |
| `true` | `icon + name` viene scritto nella config Git. L'emoji appare nella cronologia dei commit |

Esempio: `icon: "👤"`, `name: "Andrea Rossi"`

| includeIconInGitConfig | Git config `user.name` | Firma del commit |
|------------------------|------------------------|------------------|
| `false` | `Andrea Rossi` | `Andrea Rossi <email>` |
| `true` | `👤 Andrea Rossi` | `👤 Andrea Rossi <email>` |

### Nota: Configurazione base (senza SSH)

Se non hai bisogno di cambiare chiavi SSH (es: usando informazioni committer diverse con un singolo account GitHub), puoi usare una configurazione minima:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@personal.example.com",
      "description": "Progetti personali"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@company.example.com",
      "description": "Account di lavoro"
    }
  ]
}
```

Questa configurazione cambia solo `git config user.name` e `user.email`.

---

## Come funziona

### Struttura dei livelli Git Config

La configurazione Git ha tre livelli, dove i livelli inferiori sovrascrivono quelli superiori:

```text
Sistema (/etc/gitconfig)
    ↓ sovrascrive
Globale (~/.gitconfig)
    ↓ sovrascrive
Locale (.git/config)  ← massima priorità
```

**Git ID Switcher scrive in `--local` (locale al repository).**

Questo significa:

- L'identità viene salvata nel `.git/config` di ogni repository
- Si possono mantenere identità diverse per ogni repository
- Le impostazioni globali (`~/.gitconfig`) non vengono modificate

### Quando cambi identità

Quando cambi identità, l'estensione esegue (in ordine):

1. **Configurazione Git** (sempre): Imposta `git config --local user.name` e `user.email`
2. **Chiave SSH** (se `sshKeyPath` impostato): Rimuove altre chiavi da ssh-agent, aggiunge quella selezionata
3. **Chiave GPG** (se `gpgKeyId` impostato): Imposta `git config --local user.signingkey` e abilita la firma
4. **Sottomoduli** (se abilitato): Propaga la configurazione a tutti i sottomoduli (predefinito: profondità 1)

### Come funziona la propagazione ai sottomoduli

Le impostazioni locali sono per repository, quindi non si applicano automaticamente ai sottomoduli.
Ecco perché questa estensione fornisce la propagazione ai sottomoduli (vedi "Avanzato: Supporto sottomoduli" per i dettagli).

---

## Avanzato: Supporto sottomoduli

Per repository complessi che usano sottomoduli Git, la gestione dell'identità è spesso problematica. Se fai commit in un sottomodulo, Git usa la configurazione locale di quel sottomodulo, che potrebbe usare la configurazione globale (email sbagliata!) se non impostata esplicitamente.

**Git ID Switcher** rileva automaticamente i sottomoduli e applica loro l'identità selezionata.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Abilita/disabilita questa funzione
- `submoduleDepth`: Quanto in profondità andare?
  - `1`: Solo sottomoduli diretti (più comune)
  - `2+`: Sottomoduli annidati (sottomoduli dentro sottomoduli)

Questo assicura che la tua identità sia sempre corretta, sia che tu faccia commit nel repo principale che in una libreria vendor.

---

## Risoluzione problemi

### La chiave SSH non cambia?

1. Assicurati che `ssh-agent` sia in esecuzione:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Verifica che il percorso della chiave sia corretto:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. Su macOS, aggiungi al Portachiavi una volta:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Identità sbagliata al push?

1. Verifica che l'URL remoto usi l'alias host corretto:

   ```bash
   git remote -v
   # Dovrebbe mostrare git@github-work:... per i repo di lavoro
   ```

2. Aggiorna se necessario:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### La firma GPG non funziona?

1. Trova il tuo ID chiave GPG:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Testa la firma:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Assicurati che l'email nella tua identità corrisponda all'email della chiave GPG.

### Identità non rilevata?

- Assicurati di essere in un repository Git
- Verifica che `settings.json` non abbia errori di sintassi
- Ricarica la finestra di VS Code (`Cmd+Shift+P` → "Ricarica finestra")

### Errore con il campo `name`?

I seguenti caratteri nel campo `name` causeranno un errore:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Usa il campo `service` se vuoi includere informazioni sul servizio.

```jsonc
// NG
"name": "Andrea Rossi (Personale)"

// OK
"name": "Andrea Rossi",
"service": "GitHub"
```

### Le nuove impostazioni non appaiono?

Dopo l'aggiornamento dell'estensione, le nuove impostazioni potrebbero non apparire nell'interfaccia delle impostazioni.

**Soluzione:** Riavvia completamente il computer.

Gli editor basati su VS Code memorizzano nella cache lo schema delle impostazioni in memoria, e "Ricarica finestra" o reinstallare l'estensione potrebbe non essere sufficiente per aggiornarlo.

### I valori predefiniti sono vuoti?

Se le impostazioni di esempio non appaiono anche dopo una nuova installazione, **Settings Sync** potrebbe essere la causa.

Se in precedenza hai salvato impostazioni vuote, potrebbero essersi sincronizzate sul cloud e stanno sovrascrivendo i valori predefiniti nelle nuove installazioni.

**Soluzione:**

1. Trova l'impostazione nell'interfaccia delle impostazioni
2. Clicca sull'icona dell'ingranaggio → "Reimposta impostazione"
3. Sincronizza con Settings Sync (questo rimuove le vecchie impostazioni dal cloud)

---

## Comandi

| Comando                         | Descrizione                      |
| ------------------------------- | -------------------------------- |
| `Git ID: Select Identity`       | Apri il selettore di identità    |
| `Git ID: Show Current Identity` | Mostra info sull'identità attuale |

---

## Filosofia di design

> "Chi sono io?" — L'unica domanda a cui risponde questa estensione.

Costruita sull'**Architettura Karesansui**: un nucleo semplice (100 righe),
circondato da qualità deliberata (90% copertura, logging, timeout)
e vincoli intenzionali (nessuna API GitHub, nessuna gestione token).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Leggi la filosofia completa](../../DESIGN_PHILOSOPHY.md)

---

## Contribuire

I contributi sono benvenuti! Vedi [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licenza

Licenza MIT - vedi [LICENSE](../../../LICENSE).

## Crediti

Creato da [Null;Variant](https://github.com/nullvariant)

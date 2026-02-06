# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Passa tra più profili Git con un clic. Gestisci più account GitHub, chiavi SSH, firma GPG e <b>applica automaticamente il profilo ai sottomoduli Git</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <b>🇮🇹</b> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/it/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Perché Git ID Switcher?

Esistono molti strumenti per cambiare profilo Git, ma **Git ID Switcher** risolve problemi complessi che altri spesso trascurano:

1. **L'incubo dei sottomoduli**: Quando lavori con repository che hanno sottomoduli (temi Hugo, librerie vendor, ecc.), di solito devi configurare `git config user.name` manualmente per _ogni_ sottomodulo. Questa estensione lo gestisce elegantemente applicando ricorsivamente il profilo a tutti i sottomoduli attivi.
2. **Gestione SSH e GPG**: Non cambia solo il nome; scambia anche le chiavi SSH nell'ssh-agent e configura la firma GPG, così non farai mai commit con la firma sbagliata.

## Funzionalità

- **UI Gestione Profili**: Aggiungi, modifica, elimina e riordina i profili senza modificare settings.json
- **Cambio profilo con un clic**: Modifica Git user.name e user.email istantaneamente
- **Integrazione barra di stato**: Visualizza sempre il profilo corrente a colpo d'occhio
- **Supporto sottomoduli**: Propaga automaticamente il profilo ai sottomoduli Git
- **Gestione chiavi SSH**: Cambia automaticamente le chiavi SSH in ssh-agent
- **Supporto firma GPG**: Configura la chiave GPG per firmare i commit (opzionale)
- **Tooltip dettagliati**: Informazioni complete sul profilo con descrizione e host SSH
- **Multipiattaforma**: Funziona su macOS, Linux e Windows
- **Multilingue**: Supporta 17 lingue

## 🌏 Una nota sul supporto multilingue

> **Valorizzo l'esistenza delle minoranze.**
> Non voglio scartarle solo perché sono poche.
> Anche se le traduzioni non sono perfette, spero che possiate percepire la nostra intenzione di comprendere e mostrare rispetto per le lingue minoritarie.

Questa estensione supporta tutte le 17 lingue supportate da VS Code. Inoltre, per la documentazione README, ci stiamo sfidando a tradurre in lingue minoritarie e persino lingue umoristiche.

Questo non è solo "supporto globale" — è "rispetto per la diversità linguistica". E sarei felice se questo diventasse un'infrastruttura dove commit che migliorano il mondo provengono da sviluppatori ovunque, trascendendo le barriere linguistiche.

---

## Avvio Rapido

Una configurazione tipica per gestire un account personale e un account aziendale (Enterprise Managed User).

### Passo 1: Preparare le chiavi SSH

Prima, crea le chiavi SSH per ogni account (salta se le hai già):

```bash
# Personale
ssh-keygen -t ed25519 -C "andrea.rossi@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Lavoro
ssh-keygen -t ed25519 -C "andrea.rossi@company.example.com" -f ~/.ssh/id_ed25519_work
```

Registra la **chiave pubblica** (file `.pub`) di ogni chiave SSH sul rispettivo account GitHub.

> **Nota**: Su GitHub registra `id_ed25519_personal.pub` (chiave pubblica). `id_ed25519_personal` (senza estensione) è la chiave privata — non condividerla mai né caricarla da nessuna parte.

### Passo 2: Configurare SSH

Modifica `~/.ssh/config`:

```ssh-config
# Account GitHub personale (predefinito)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Account GitHub aziendale
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Passo 3: Configurare l'estensione

Dopo l'installazione, sono disponibili profili di esempio.
Segui la guida qui sotto per modificarli secondo le tue esigenze.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/it/first-ux.webp" width="600" alt="Guida alla configurazione iniziale (13 passi): apri la gestione profili dalla barra di stato, modifica e crea nuovi profili" loading="lazy">

> **I file delle chiavi non vengono inviati**: Quando imposti il percorso della chiave SSH, viene registrato solo il percorso (posizione) del file della chiave. Il contenuto del file della chiave non viene mai caricato né inviato esternamente.

> **Se usi la firma GPG**: Puoi anche impostare `gpgKeyId` nella schermata di modifica del profilo.
> Per sapere come trovare il tuo ID chiave GPG, consulta "[Risoluzione Problemi](#la-firma-gpg-non-funziona)".

> **Suggerimento**: Puoi anche configurare direttamente da settings.json.
> Apri le impostazioni dell'estensione (`Cmd+,` / `Ctrl+,`) → cerca "Git ID Switcher" → clicca "Modifica in settings.json".
> Per un esempio di configurazione JSON, consulta "[Esempio Completo](#esempio-completo-4-account-con-ssh--gpg)".

---

## Esempio Completo: 4 Account con SSH + GPG

Un esempio completo che combina tutto:

### Configurazione SSH (`~/.ssh/config`)

```ssh-config
# Account personale (predefinito)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Account aziendale (Enterprise Managed User)
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
      "name": "Andrea Rossi",
      "email": "andrea.rossi@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Progetti personali",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@company.example.com",
      "service": "GitHub Lavoro",
      "icon": "💼",
      "description": "Account aziendale",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@bitbucket.example.com",
      "service": "Bitbucket",
      "icon": "🪣",
      "description": "Progetti Bitbucket",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "name": "Andrea Rossi",
      "email": "andrea.rossi@freelance.example.com",
      "service": "GitLab",
      "icon": "🎯",
      "description": "Progetti freelance"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Nota: L'ultimo profilo (`freelance`) non ha SSH. Quando usi informazioni committer diverse con lo stesso account GitHub, puoi cambiare solo la configurazione Git.

---

## Gestione Profili

Clicca sulla barra di stato → "Gestione Profili" in fondo alla lista per aprire la schermata di gestione.
Puoi aggiungere, modificare, eliminare e riordinare i profili direttamente dall'interfaccia.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/it/identity-management.webp" width="600" alt="Gestione Profili: guida alle operazioni di eliminazione e riordino" loading="lazy">

Puoi anche eliminare profili dalla palette comandi con `Git ID Switcher: Delete Identity`.

---

## Comandi

| Comando                                  | Descrizione                             |
| ---------------------------------------- | --------------------------------------- |
| `Git ID Switcher: Select Identity`       | Apri il selettore profili               |
| `Git ID Switcher: Delete Identity`       | Elimina un profilo                      |
| `Git ID Switcher: Show Current Identity` | Mostra informazioni sul profilo attuale |
| `Git ID Switcher: Show Documentation`    | Mostra la documentazione                |

---

## Riferimento Configurazione

### Proprietà del Profilo

| Proprietà     | Richiesto | Descrizione                                                                     |
| ------------- | --------- | ------------------------------------------------------------------------------- |
| `id`          | ✅        | Identificatore unico (es: `"personal"`, `"work"`)                               |
| `name`        | ✅        | Git user.name — mostrato nei commit                                             |
| `email`       | ✅        | Git user.email — mostrato nei commit                                            |
| `icon`        |           | Emoji mostrato nella barra di stato (es: `"🏠"`). Solo un singolo emoji         |
| `service`     |           | Nome del servizio (es: `"GitHub"`, `"GitLab"`). Usato per la visualizzazione UI |
| `description` |           | Breve descrizione mostrata nel selettore e tooltip                              |
| `sshKeyPath`  |           | Percorso della chiave SSH privata (es: `"~/.ssh/id_ed25519_work"`)              |
| `sshHost`     |           | Alias host dalla configurazione SSH (es: `"github-work"`)                       |
| `gpgKeyId`    |           | ID chiave GPG per la firma dei commit                                           |

#### Limitazioni di Visualizzazione

- **Barra di stato**: Il testo che supera ~25 caratteri verrà troncato con `...`
- **`icon`**: È consentito solo un singolo emoji (cluster di grafemi). Emoji multipli o stringhe lunghe non sono supportati

### Impostazioni Globali

| Impostazione                               | Predefinito  | Descrizione                                                                                                          |
| ------------------------------------------ | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Vedi esempio | Lista delle configurazioni profilo                                                                                   |
| `gitIdSwitcher.defaultIdentity`            | Vedi esempio | ID del profilo predefinito da usare                                                                                  |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`       | Cambia automaticamente la chiave SSH al cambio profilo                                                               |
| `gitIdSwitcher.showNotifications`          | `true`       | Mostra notifica al cambio profilo                                                                                    |
| `gitIdSwitcher.applyToSubmodules`          | `true`       | Propaga il profilo ai sottomoduli Git                                                                                |
| `gitIdSwitcher.submoduleDepth`             | `1`          | Profondità massima per i sottomoduli annidati (1-5)                                                                  |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`      | Includi l'emoji icona nel Git config `user.name`                                                                     |
| `gitIdSwitcher.logging.fileEnabled`        | `false`      | Salva log di audit su file (cambio profilo, operazioni chiavi SSH, ecc.)                                             |
| `gitIdSwitcher.logging.filePath`           | `""`         | Percorso file di log (es: `~/.git-id-switcher/security.log`). Vuoto = posizione predefinita                          |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`   | Dimensione massima file prima della rotazione (byte, 1MB-100MB)                                                      |
| `gitIdSwitcher.logging.maxFiles`           | `5`          | Numero massimo di file di log ruotati da mantenere (1-20)                                                            |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`      | Quando abilitato, maschera tutti i valori nei log (modalità massima privacy)                                         |
| `gitIdSwitcher.logging.level`              | `"INFO"`     | Livello di verbosità log (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Registra il livello selezionato e superiori |
| `gitIdSwitcher.commandTimeouts`            | `{}`         | Timeout personalizzato per comando (ms, 1sec-5min). Es: `{"git": 15000, "ssh-add": 10000}`                           |

#### Informazioni su `includeIconInGitConfig`

Controlla il comportamento quando il campo `icon` è impostato:

| Valore                | Comportamento                                                                               |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `false` (predefinito) | `icon` viene mostrato solo nell'interfaccia editor. Solo `name` viene scritto in Git config |
| `true`                | `icon + name` viene scritto in Git config. L'emoji appare nella cronologia dei commit       |

Esempio: `icon: "👤"`, `name: "Andrea Rossi"`

| includeIconInGitConfig | Git config `user.name` | Firma del commit          |
| ---------------------- | ---------------------- | ------------------------- |
| `false`                | `Andrea Rossi`         | `Andrea Rossi <email>`    |
| `true`                 | `👤 Andrea Rossi`      | `👤 Andrea Rossi <email>` |

---

## Come Funziona

### Struttura a Livelli di Git Config

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

- Salva il profilo nel `.git/config` di ogni repository
- Puoi mantenere profili diversi per ogni repository
- Le impostazioni globali (`~/.gitconfig`) non vengono modificate

### Quando Cambi Profilo

Quando cambi profilo, l'estensione esegue (in ordine):

1. **Git Config** (sempre): Imposta `git config --local user.name` e `user.email`
2. **Chiave SSH** (se `sshKeyPath` impostato): Rimuove altre chiavi da ssh-agent, aggiunge quella selezionata
3. **Chiave GPG** (se `gpgKeyId` impostato): Imposta `git config --local user.signingkey` e abilita la firma
4. **Sottomoduli** (se abilitato): Propaga la configurazione a tutti i sottomoduli (predefinito: profondità 1)

### Come Funziona la Propagazione ai Sottomoduli

Le impostazioni locali sono per repository, quindi non si applicano automaticamente ai sottomoduli.
Ecco perché questa estensione fornisce la propagazione ai sottomoduli (vedi "Avanzato: Supporto Sottomoduli" per i dettagli).

### Dettagli sulla Gestione delle Chiavi SSH

Git ID Switcher gestisce le chiavi SSH tramite `ssh-agent`:

| Operazione      | Comando eseguito       |
| --------------- | ---------------------- |
| Aggiungi chiave | `ssh-add <keyPath>`    |
| Rimuovi chiave  | `ssh-add -d <keyPath>` |
| Lista chiavi    | `ssh-add -l`           |

**Importante:** Questa estensione **non modifica** `~/.ssh/config`. Devi configurare SSH manualmente (vedi Passo 2 in "Avvio Rapido").

### Interazione con Configurazioni SSH Esistenti

Se hai già configurazioni SSH, Git ID Switcher funziona così:

| La tua configurazione                    | Comportamento di Git ID Switcher                                |
| ---------------------------------------- | --------------------------------------------------------------- |
| `~/.ssh/config` specifica `IdentityFile` | Entrambi utilizzabili; `IdentitiesOnly yes` previene conflitti  |
| Variabile d'ambiente `GIT_SSH_COMMAND`   | Usa comando SSH personalizzato; ssh-agent continua a funzionare |
| `git config core.sshCommand` impostato   | Come sopra                                                      |
| direnv imposta variabili d'ambiente SSH  | Coesistono; ssh-agent funziona indipendentemente                |

**Raccomandazione:** Imposta sempre `IdentitiesOnly yes` nella tua configurazione SSH. Questo impedisce a SSH di provare più chiavi.

### Perché `IdentitiesOnly yes`?

Senza questa impostazione, SSH potrebbe provare le chiavi in questo ordine:

1. Chiavi caricate in ssh-agent (gestite da Git ID Switcher)
2. Chiavi specificate in `~/.ssh/config`
3. Chiavi predefinite (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, ecc.)

Questo può causare errori di autenticazione o l'uso involontario della chiave sbagliata.

Con `IdentitiesOnly yes`, SSH usa **solo la chiave specificata**. Questo assicura che venga usata la chiave impostata da Git ID Switcher.

```ssh-config
# Configurazione raccomandata
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Questa riga è importante
```

Con questa configurazione, quando ti connetti all'host `github-work`, verrà usata solo `~/.ssh/id_ed25519_work`, e nessun'altra chiave verrà provata.

---

## Avanzato: Supporto Sottomoduli

Per repository complessi che usano sottomoduli Git, la gestione dei profili è spesso problematica. Quando fai commit in un sottomodulo, Git usa la configurazione locale di quel sottomodulo, che potrebbe usare la configurazione globale (email sbagliata!) se non impostata esplicitamente.

**Git ID Switcher** rileva automaticamente i sottomoduli e applica il profilo selezionato.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Abilita/disabilita questa funzionalità
- `submoduleDepth`: Fino a che profondità applicare?
  - `1`: Solo sottomoduli diretti (più comune)
  - `2+`: Sottomoduli annidati (sottomoduli dentro sottomoduli)

Questo assicura che il tuo profilo sia sempre corretto, sia che tu faccia commit nel repository principale che in una libreria vendor.

---

## Risoluzione Problemi

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

### Profilo sbagliato durante il push?

**Per nuovi clone:**

Quando cloni repository di lavoro, usa l'alias host configurato in SSH config:

```bash
# Lavoro (usa alias github-work)
git clone git@github-work:company/repo.git

# Personale (usa github.com predefinito)
git clone git@github.com:tuoutente/repo.git
```

**Per repository esistenti:**

1. Verifica che l'URL remoto usi l'alias host corretto:

   ```bash
   git remote -v
   # Per repository di lavoro dovrebbe mostrare git@github-work:...
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

3. Assicurati che l'email nel profilo corrisponda all'email della chiave GPG

### Profilo non rilevato?

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

Editor come VS Code memorizzano lo schema delle impostazioni in memoria, e "Ricarica finestra" o reinstallare l'estensione potrebbe non essere sufficiente per aggiornarlo.

### I valori predefiniti (identities, ecc.) sono vuoti?

Se le impostazioni di esempio non appaiono neanche dopo una nuova installazione, **Settings Sync** potrebbe essere la causa.

Se in precedenza hai salvato impostazioni vuote, potrebbero essersi sincronizzate sul cloud e stanno sovrascrivendo i valori predefiniti nelle nuove installazioni.

**Soluzione:**

1. Trova l'impostazione nell'interfaccia delle impostazioni
2. Clicca sull'icona dell'ingranaggio → "Reimposta impostazione"
3. Sincronizza con Settings Sync (questo rimuove le vecchie impostazioni dal cloud)

---

## Filosofia di Design

> **"Chi sono io"** — L'unica domanda a cui risponde questa estensione

Costruita sull'**Architettura Karesansui**. Il nucleo può essere scritto in 100 righe.
Ecco perché il resto può essere dedicato alla qualità (90% test, logging, timeout)
e a vincoli intenzionali (nessuna integrazione API GitHub, nessuna gestione token).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Leggi la filosofia di design completa](../../DESIGN_PHILOSOPHY.md)

---

## Contribuire

I contributi sono benvenuti! Consulta [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licenza

Licenza MIT — vedi [LICENSE](../../../LICENSE).

## Crediti

Creato da [Null;Variant](https://github.com/nullvariant)

# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Wechseln Sie mit einem Klick zwischen mehreren Git-Identitäten. Verwalten Sie mehrere GitHub-Konten, SSH-Schlüssel, GPG-Signierung und <b>wenden Sie Identitäten automatisch auf Git-Submodule an</b>.
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
      <a href="https://sonarcloud.io/summary/new_code?id=nullvariant_nullvariant-vscode-extensions"><img src="https://sonarcloud.io/api/project_badges/measure?project=nullvariant_nullvariant-vscode-extensions&metric=alert_status" alt="Quality Gate Status"></a>
      <a href="https://github.com/step-security/harden-runner"><img src="https://img.shields.io/badge/Harden--Runner-enabled-7037F5" alt="Harden-Runner"></a>
      <a href="../../DESIGN_PHILOSOPHY.md"><img src="https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568" alt="Karesansui Architecture"></a>
      <br>
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <b>🇩🇪</b> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-de.png" width="600" alt="Demo">

## 🎯 Warum Git ID Switcher?

Obwohl es viele Git-Identitätswechsler gibt, löst **Git ID Switcher** komplexe Probleme, die andere oft ignorieren:

1. **Das Submodul-Problem**: Bei der Arbeit mit Repositories mit Submodulen (z.B. Hugo-Themes, Vendor-Bibliotheken) muss man normalerweise `git config user.name` für *jedes* Submodul manuell setzen. Diese Erweiterung löst das elegant, indem sie Ihre Identität rekursiv auf alle aktiven Submodule anwendet.
2. **SSH- und GPG-Handling**: Es ändert nicht nur Ihren Namen; es tauscht Ihre SSH-Schlüssel im Agent aus und konfiguriert die GPG-Signierung, damit Sie nie mit der falschen Signatur committen.

## Funktionen

- **Submodul-Unterstützung**: Identität automatisch auf Git-Submodule übertragen
- **SSH-Schlüsselverwaltung**: SSH-Schlüssel automatisch im ssh-agent wechseln
- **GPG-Signierungsunterstützung**: GPG-Schlüssel für Commit-Signierung konfigurieren (optional)
- **Ein-Klick-Identitätswechsel**: Git user.name und user.email sofort ändern
- **Statusleisten-Integration**: Aktuelle Identität immer im Blick
- **Reichhaltige Tooltips**: Detaillierte Identitätsinformationen mit Beschreibung und SSH-Host
- **Plattformübergreifend**: Funktioniert auf macOS, Linux und Windows
- **Mehrsprachig**: Unterstützt 17 Sprachen

## 🌏 Ein Wort zur Mehrsprachigkeit

> **Ich schätze die Existenz von Minderheiten.**
> Ich möchte sie nicht verwerfen, nur weil sie zahlenmäßig klein sind.
> Auch wenn Übersetzungen nicht perfekt sind, hoffe ich, dass Sie unsere Absicht spüren können, Minderheitensprachen zu verstehen und zu respektieren.

Diese Erweiterung unterstützt alle 17 Sprachen, die VSCode unterstützt. Zusätzlich versuchen wir bei der README-Dokumentation, in Minderheitensprachen und sogar Scherzsprachen zu übersetzen.

Das ist nicht nur "globale Unterstützung" - es ist "Respekt für sprachliche Vielfalt". Und ich würde mich freuen, wenn dies zur Infrastruktur wird, in der Commits, die die Welt verbessern, von Entwicklern überall auf der Welt kommen, Sprachbarrieren überwindend.

---

## Schnellstart

Eine typische Einrichtung für die Verwaltung von persönlichen und Firmenkonten (Enterprise Managed User).

### Schritt 1: SSH-Schlüssel vorbereiten

Erstellen Sie zunächst SSH-Schlüssel für jedes Konto (überspringen Sie dies, wenn Sie bereits welche haben):

```bash
# Persönlich
ssh-keygen -t ed25519 -C "alex.mueller@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Arbeit
ssh-keygen -t ed25519 -C "alex.mueller@company.example.com" -f ~/.ssh/id_ed25519_work
```

Registrieren Sie den **öffentlichen Schlüssel** (`.pub`-Datei) jedes Schlüssels beim entsprechenden GitHub-Konto.

> **Hinweis**: Bei GitHub registrieren Sie `id_ed25519_personal.pub` (öffentlicher Schlüssel). `id_ed25519_personal` (ohne Erweiterung) ist der private Schlüssel - teilen Sie ihn niemals mit anderen und laden Sie ihn nirgendwo hoch.

### Schritt 2: SSH konfigurieren

Bearbeiten Sie `~/.ssh/config`:

```ssh-config
# Persönliches GitHub-Konto (Standard)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Arbeits-GitHub-Konto
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Schritt 3: Erweiterung konfigurieren

Öffnen Sie die Erweiterungseinstellungen (`Cmd+,` / `Strg+,`) → suchen Sie "Git ID Switcher" → klicken Sie auf "In settings.json bearbeiten":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Müller",
      "service": "GitHub",
      "email": "alex.mueller@personal.example.com",
      "description": "Persönliche Projekte",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Müller",
      "service": "GitHub Arbeit",
      "email": "alex.mueller@company.example.com",
      "description": "Firmenkonto (Enterprise Managed User)",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Schritt 4: Verwenden

1. Klicken Sie auf das Identitätssymbol in der Statusleiste (unten rechts)
2. Wählen Sie eine Identität
3. Fertig! Git-Konfiguration und SSH-Schlüssel sind jetzt gewechselt.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-de.png" width="600" alt="Quick Pick">

### SSH-Host-Aliase verwenden

Verwenden Sie beim Klonen von Repos den Host, der Ihrer Identität entspricht:

```bash
# Für Arbeitsidentität (verwendet github-work Alias)
git clone git@github-work:company/repo.git

# Für persönliche Identität (verwendet Standard github.com)
git clone git@github.com:amueller/repo.git
```

---

## Optional: GPG-Signierung

Wenn Sie Commits mit GPG signieren:

### Schritt 1: GPG-Schlüssel-ID finden

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Beispielausgabe:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Alex Müller <alex.mueller@personal.example.com>
```

Die Schlüssel-ID ist `ABCD1234`.

### Schritt 2: GPG-Schlüssel zur Identität hinzufügen

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Müller",
      "service": "GitHub",
      "email": "alex.mueller@personal.example.com",
      "description": "Persönliche Projekte",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Beim Wechsel zu dieser Identität setzt die Erweiterung:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Vollständiges Beispiel: 4 Konten mit SSH + GPG

Hier ein vollständiges Beispiel, das alles kombiniert:

### SSH-Konfiguration (`~/.ssh/config`)

```ssh-config
# Persönliches Konto (Standard)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Arbeitskonto (Firmenausgestellter Enterprise Managed User)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Bitbucket-Konto
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Erweiterungseinstellungen

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Müller",
      "service": "GitHub",
      "email": "alex.mueller@personal.example.com",
      "description": "Persönliche Projekte",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Müller",
      "service": "GitHub Arbeit",
      "email": "alex.mueller@company.example.com",
      "description": "Firmenkonto (Enterprise Managed User)",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "Alex Müller",
      "service": "Bitbucket",
      "email": "amueller@bitbucket.example.com",
      "description": "Bitbucket-Projekte",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Müller",
      "service": "GitLab",
      "email": "alex.mueller@freelance.example.com",
      "description": "Freiberufliche Projekte"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Hinweis: Die letzte Identität (`freelance`) hat kein SSH — sie wechselt nur die Git-Konfiguration. Dies ist nützlich, wenn Sie verschiedene Committer-Informationen mit demselben GitHub-Konto verwenden.

---

## Konfigurationsreferenz

### Identitätseigenschaften

| Eigenschaft   | Erforderlich | Beschreibung                                               |
| ------------- | ------------ | ---------------------------------------------------------- |
| `id`          | ✅           | Eindeutige Kennung (z.B. `"work"`, `"personal"`)           |
| `name`        | ✅           | Git user.name - wird in Commits angezeigt                  |
| `email`       | ✅           | Git user.email - wird in Commits angezeigt                 |
| `icon`        |              | Emoji in der Statusleiste (z.B. `"💼"`). Nur einzelnes Emoji |
| `service`     |              | Dienstname (z.B. `"GitHub"`, `"GitLab"`). Für UI-Anzeige   |
| `description` |              | Kurze Beschreibung in Auswahl und Tooltip                  |
| `sshKeyPath`  |              | Pfad zum privaten SSH-Schlüssel (z.B. `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |              | SSH-Config-Host-Alias (z.B. `"github-work"`)               |
| `gpgKeyId`    |              | GPG-Schlüssel-ID für Commit-Signierung                     |

#### Anzeigenbeschränkungen

- **Statusleiste**: Text über ~25 Zeichen wird mit `...` abgeschnitten
- **`icon`**: Nur ein einzelnes Emoji (Graphem-Cluster) erlaubt. Mehrere Emojis oder lange Zeichenketten werden nicht unterstützt

### Globale Einstellungen

| Einstellung                            | Standard       | Beschreibung                                           |
| -------------------------------------- | -------------- | ------------------------------------------------------ |
| `gitIdSwitcher.identities`             | Siehe Beispiel | Liste der Identitätskonfigurationen                    |
| `gitIdSwitcher.defaultIdentity`        | Siehe Beispiel | ID der Standardidentität                               |
| `gitIdSwitcher.autoSwitchSshKey`       | `true`         | SSH-Schlüssel beim Identitätswechsel automatisch wechseln |
| `gitIdSwitcher.showNotifications`      | `true`         | Benachrichtigung beim Identitätswechsel anzeigen       |
| `gitIdSwitcher.applyToSubmodules`      | `true`         | Identität auf Git-Submodule übertragen                 |
| `gitIdSwitcher.submoduleDepth`         | `1`            | Maximale Tiefe für verschachtelte Submodul-Konfiguration (1-5) |
| `gitIdSwitcher.includeIconInGitConfig` | `false`        | Icon-Emoji in Git config `user.name` einschließen      |
| `gitIdSwitcher.logging.fileEnabled` | `false` | Audit-Protokollierung aktivieren (Identitätswechsel, SSH-Operationen usw.) |
| `gitIdSwitcher.logging.filePath` | `""` | Protokolldateipfad (z.B. `~/.git-id-switcher/security.log`). Leer = Standardort |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Maximale Dateigröße vor Rotation (Bytes, 1MB-100MB) |
| `gitIdSwitcher.logging.maxFiles` | `5` | Maximale Anzahl rotierter Protokolldateien (1-20) |
| `gitIdSwitcher.logging.level` | `"INFO"` | Protokollebene: `DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`. Zeichnet ausgewählte Ebene und höher auf |
| `gitIdSwitcher.commandTimeouts` | `{}` | Benutzerdefiniertes Timeout pro Befehl (ms, 1Sek-5Min). Z.B. `{"git": 15000, "ssh-add": 10000}` |

#### Über `includeIconInGitConfig`

Steuert das Verhalten, wenn das `icon`-Feld gesetzt ist:

| Wert | Verhalten |
|------|-----------|
| `false` (Standard) | `icon` wird nur in der Editor-UI angezeigt. Nur `name` wird in Git config geschrieben |
| `true` | `icon + name` wird in Git config geschrieben. Emoji erscheint im Commit-Verlauf |

Beispiel: `icon: "👤"`, `name: "Alex Müller"`

| includeIconInGitConfig | Git config `user.name` | Commit-Signatur |
|------------------------|------------------------|-----------------|
| `false` | `Alex Müller` | `Alex Müller <email>` |
| `true` | `👤 Alex Müller` | `👤 Alex Müller <email>` |

### Hinweis: Grundeinrichtung (ohne SSH)

Wenn Sie keinen SSH-Schlüsselwechsel benötigen (z.B. bei Verwendung verschiedener Committer-Infos mit einem einzigen GitHub-Konto), können Sie eine minimale Konfiguration verwenden:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Müller",
      "email": "alex.mueller@personal.example.com",
      "description": "Persönliche Projekte"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Müller",
      "email": "alex.mueller@company.example.com",
      "description": "Arbeitskonto"
    }
  ]
}
```

Diese Einrichtung wechselt nur `git config user.name` und `user.email`.

---

## Funktionsweise

### Git-Konfigurationsschichten

Git-Konfiguration hat drei Schichten, wobei untere Schichten obere überschreiben:

```text
System (/etc/gitconfig)
    ↓ überschreibt
Global (~/.gitconfig)
    ↓ überschreibt
Lokal (.git/config)  ← höchste Priorität
```

**Git ID Switcher schreibt in `--local` (Repository-lokal).**

Das bedeutet:

- Identität wird in `.git/config` jedes Repositories gespeichert
- Verschiedene Identitäten können pro Repository beibehalten werden
- Globale Einstellungen (`~/.gitconfig`) werden nicht verändert

### Beim Identitätswechsel

Beim Wechsel der Identität führt die Erweiterung folgendes aus (in dieser Reihenfolge):

1. **Git-Konfiguration** (immer): Setzt `git config --local user.name` und `user.email`
2. **SSH-Schlüssel** (wenn `sshKeyPath` gesetzt): Entfernt andere Schlüssel aus ssh-agent, fügt den ausgewählten hinzu
3. **GPG-Schlüssel** (wenn `gpgKeyId` gesetzt): Setzt `git config --local user.signingkey` und aktiviert Signierung
4. **Submodule** (wenn aktiviert): Überträgt Konfiguration auf alle Submodule (Standard: Tiefe 1)

### Wie die Submodul-Übertragung funktioniert

Lokale Einstellungen sind pro Repository, daher werden sie nicht automatisch auf Submodule angewendet.
Deshalb bietet diese Erweiterung eine Submodul-Übertragungsfunktion (siehe "Erweitert: Submodul-Unterstützung" für Details).

---

## Erweitert: Submodul-Unterstützung

Bei komplexen Repositories mit Git-Submodulen ist die Identitätsverwaltung oft mühsam. Wenn Sie in einem Submodul committen, verwendet Git die lokale Konfiguration dieses Submoduls, die möglicherweise auf Ihre globale Konfiguration zurückfällt (falsche E-Mail!), wenn sie nicht explizit gesetzt ist.

**Git ID Switcher** erkennt Submodule automatisch und wendet die ausgewählte Identität auf sie an.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Aktivieren/Deaktivieren dieser Funktion
- `submoduleDepth`: Wie tief soll es gehen?
  - `1`: Nur direkte Submodule (am häufigsten)
  - `2+`: Verschachtelte Submodule (Submodule in Submodulen)

Dies stellt sicher, dass Ihre Identität immer korrekt ist, egal ob Sie im Haupt-Repository oder in einer Vendor-Bibliothek committen.

---

## Fehlerbehebung

### SSH-Schlüssel wird nicht gewechselt?

1. Stellen Sie sicher, dass `ssh-agent` läuft:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Überprüfen Sie, ob der Schlüsselpfad korrekt ist:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. Auf macOS einmalig zum Schlüsselbund hinzufügen:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Falsche Identität beim Push?

1. Prüfen Sie, ob die Remote-URL den richtigen Host-Alias verwendet:

   ```bash
   git remote -v
   # Sollte für Arbeits-Repos git@github-work:... anzeigen
   ```

2. Bei Bedarf aktualisieren:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG-Signierung funktioniert nicht?

1. Finden Sie Ihre GPG-Schlüssel-ID:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Testen Sie die Signierung:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Stellen Sie sicher, dass die E-Mail in Ihrer Identität mit der E-Mail des GPG-Schlüssels übereinstimmt.

### Identität wird nicht erkannt?

- Stellen Sie sicher, dass Sie sich in einem Git-Repository befinden
- Prüfen Sie `settings.json` auf Syntaxfehler
- Laden Sie das VS Code-Fenster neu (`Cmd+Shift+P` → "Fenster neu laden")

### Fehler im `name`-Feld?

Folgende Zeichen im `name`-Feld verursachen einen Fehler:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Verwenden Sie das `service`-Feld, wenn Sie Dienstinformationen einschließen möchten.

```jsonc
// NG
"name": "Alex Müller (Persönlich)"

// OK
"name": "Alex Müller",
"service": "GitHub"
```

### Neue Einstellungen werden nicht angezeigt?

Nach dem Aktualisieren der Erweiterung werden neue Einstellungen möglicherweise nicht in der Einstellungs-UI angezeigt.

**Lösung:** Starten Sie Ihren Computer vollständig neu.

VS Code-basierte Editoren cachen das Einstellungsschema im Speicher, und "Fenster neu laden" oder Neuinstallation der Erweiterung reicht möglicherweise nicht aus, um es zu aktualisieren.

### Standardwerte leer?

Wenn Beispieleinstellungen auch nach einer Neuinstallation nicht erscheinen, könnte **Settings Sync** die Ursache sein.

Wenn Sie zuvor leere Einstellungen gespeichert haben, wurden sie möglicherweise in die Cloud synchronisiert und überschreiben bei Neuinstallationen die Standardwerte.

**Lösung:**

1. Finden Sie die Einstellung in der Einstellungs-UI
2. Klicken Sie auf das Zahnrad-Symbol → "Einstellung zurücksetzen"
3. Mit Settings Sync synchronisieren (dies entfernt die alten Einstellungen aus der Cloud)

---

## Befehle

| Befehl                          | Beschreibung                |
| ------------------------------- | --------------------------- |
| `Git ID: Select Identity`       | Identitätsauswahl öffnen    |
| `Git ID: Show Current Identity` | Aktuelle Identität anzeigen |

---

## Designphilosophie

> „Wer bin ich?" — Die einzige Frage, die diese Erweiterung beantwortet.

Entwickelt nach der **Karesansui-Architektur**: ein einfacher Kern (100 Zeilen),
umgeben von gezielter Qualität (90% Abdeckung, Logging, Timeouts)
und bewussten Einschränkungen (keine GitHub API, keine Token-Verwaltung).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Die vollständige Philosophie lesen](../../DESIGN_PHILOSOPHY.md)

---

## Mitwirken

Beiträge willkommen! Siehe [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Lizenz

MIT-Lizenz - siehe [LICENSE](../../../LICENSE).

## Credits

Erstellt von [Null;Variant](https://github.com/nullvariant)

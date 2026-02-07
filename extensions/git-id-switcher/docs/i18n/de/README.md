# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Wechseln Sie mit einem Klick zwischen mehreren Git-Profilen. Verwalten Sie mehrere GitHub-Konten, SSH-Schlüssel, GPG-Signierung und <b>wenden Sie Profile automatisch auf Git-Submodule an</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <b>🇩🇪</b> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/de/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Warum Git ID Switcher?

Es gibt viele Tools zum Wechseln von Git-Profilen, aber **Git ID Switcher** löst komplexe Probleme, die andere oft übersehen:

1. **Das Submodul-Problem**: Bei der Arbeit mit Repositories mit Submodulen (z. B. Hugo-Themes, Vendor-Bibliotheken) müssen Sie normalerweise `git config user.name` für _jedes_ Submodul manuell setzen. Diese Erweiterung löst das elegant, indem sie Ihr Profil rekursiv auf alle aktiven Submodule anwendet.
2. **SSH- und GPG-Handling**: Es ändert nicht nur Ihren Namen — es tauscht SSH-Schlüssel im ssh-agent aus und konfiguriert die GPG-Signierung, damit Sie nie mit der falschen Signatur committen.

## Funktionen

- **Profilverwaltungs-UI**: Profile hinzufügen, bearbeiten, löschen und umordnen — ohne settings.json zu bearbeiten
- **Ein-Klick-Profilwechsel**: Git user.name und user.email sofort ändern
- **Statusleisten-Integration**: Aktuelles Profil immer auf einen Blick sehen
- **Submodul-Unterstützung**: Profil automatisch auf Git-Submodule übertragen
- **SSH-Schlüsselverwaltung**: SSH-Schlüssel im ssh-agent automatisch wechseln
- **GPG-Signierungsunterstützung**: GPG-Schlüssel für Commit-Signierung konfigurieren (optional)
- **Reichhaltige Tooltips**: Detaillierte Profilinformationen mit Beschreibung und SSH-Host
- **Plattformübergreifend**: Funktioniert auf macOS, Linux und Windows
- **Mehrsprachig**: Unterstützt 17 Sprachen

## 🌏 Ein Wort zur Mehrsprachigkeit

> **Ich schätze die Existenz von Minderheiten.**
> Ich möchte sie nicht verwerfen, nur weil sie zahlenmäßig klein sind.
> Auch wenn Übersetzungen nicht perfekt sein mögen, hoffe ich, dass Sie unsere Absicht spüren, Minderheitensprachen zu verstehen und zu respektieren.

Diese Erweiterung unterstützt alle 17 Sprachen, die VS Code unterstützt. Darüber hinaus versuchen wir bei der README-Dokumentation, auch in Minderheitensprachen und sogar Scherzsprachen zu übersetzen.

Das ist nicht nur „globale Unterstützung" — es ist „Respekt für sprachliche Vielfalt". Und ich würde mich freuen, wenn dies zur Infrastruktur wird, über die Entwickler auf der ganzen Welt, Sprachbarrieren überwindend, Commits senden, die die Welt verbessern.

---

## Schnellstart

Ein typisches Setup für die Verwendung von persönlichem Konto und Firmenkonto (Enterprise Managed User).

### Schritt 1: SSH-Schlüssel vorbereiten

Erstellen Sie zunächst SSH-Schlüssel für jedes Konto (überspringen Sie dies, wenn Sie bereits welche haben):

```bash
# Persönlich
ssh-keygen -t ed25519 -C "alex@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Arbeit
ssh-keygen -t ed25519 -C "alex.mueller@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Registrieren Sie den **öffentlichen Schlüssel** (`.pub`-Datei) jedes SSH-Schlüssels beim entsprechenden GitHub-Konto.

> **Hinweis**: Bei GitHub registrieren Sie `id_ed25519_personal.pub` (öffentlicher Schlüssel). `id_ed25519_personal` (ohne Erweiterung) ist der private Schlüssel — teilen Sie ihn niemals mit anderen und laden Sie ihn nirgendwo hoch.

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

Direkt nach der Installation stehen Beispielprofile bereit.
Folgen Sie der Anleitung unten, um diese für Ihren Gebrauch zu bearbeiten.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/de/first-ux.webp" width="600" alt="Ersteinrichtung: Profilverwaltung über die Statusleiste öffnen, dann bearbeiten und neue Profile erstellen" loading="lazy">

> **Schlüsseldateien werden nicht gesendet**: Beim Festlegen von SSH-Schlüsselpfaden wird nur der Dateipfad (Speicherort) gespeichert. Der Inhalt der Schlüsseldatei wird niemals hochgeladen oder extern übertragen.

> **Bei Verwendung von GPG-Signierung**: Sie können auch `gpgKeyId` im Profilbearbeitungsbildschirm festlegen.
> Wie Sie Ihre GPG-Schlüssel-ID finden, erfahren Sie unter „[Fehlerbehebung](#gpg-signierung-funktioniert-nicht)".

> **Hinweis**: Sie können auch direkt über settings.json konfigurieren.
> Öffnen Sie die Erweiterungseinstellungen (`Cmd+,` / `Strg+,`) → suchen Sie „Git ID Switcher" → klicken Sie auf „In settings.json bearbeiten".
> JSON-Konfigurationsbeispiele finden Sie unter „[Vollständiges Beispiel](#vollständiges-beispiel-5-konten-mit-ssh--gpg)".

---

## Vollständiges Beispiel: 5 Konten mit SSH + GPG

Ein vollständiges Beispiel, das alles kombiniert:

### SSH-Konfiguration (`~/.ssh/config`)

```ssh-config
# Persönliches Konto (Standard)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Arbeitskonto (vom Unternehmen ausgestellter Enterprise Managed User)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Kunde A – Auftragsprojekt (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Kunde B – Vor-Ort-Projekt (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS-Beiträge (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Erweiterungseinstellungen

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Alex Müller",
      "email": "alex@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Persönliche Projekte",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Alex Müller",
      "email": "alex.mueller@techcorp.example.com",
      "service": "GitHub Arbeit",
      "icon": "💼",
      "description": "TechCorp Hauptjob",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Alex Müller",
      "email": "alex@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA Auftrag",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "A.Müller",
      "email": "a.mueller@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB Vor-Ort",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "alex-dev",
      "email": "alex.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "OSS-Beiträge",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Hinweis: Das 4. Profil (`client-b`) verwendet einen Kurznamen und das 5. (`oss`) ein Entwickler-Handle. Sie können für jedes Profil einen anderen Anzeigenamen festlegen, auch für dieselbe Person.

---

## Profilverwaltung

Klicken Sie auf die Statusleiste → wählen Sie „Profilverwaltung" am Ende der Liste, um die Verwaltungsoberfläche zu öffnen.
Profile hinzufügen, bearbeiten, löschen und umordnen — alles direkt über die Benutzeroberfläche.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/de/identity-management.webp" width="600" alt="Profilverwaltung: Anleitung zum Löschen und Umordnen" loading="lazy">

Sie können ein Profil auch über die Befehlspalette mit `Git ID Switcher: Delete Identity` löschen.

---

## Befehle

| Befehl                                   | Beschreibung              |
| ---------------------------------------- | ------------------------- |
| `Git ID Switcher: Select Identity`       | Profilauswahl öffnen      |
| `Git ID Switcher: Delete Identity`       | Profil löschen            |
| `Git ID Switcher: Show Current Identity` | Aktuelles Profil anzeigen |
| `Git ID Switcher: Show Documentation`    | Dokumentation anzeigen    |

---

## Konfigurationsreferenz

### Profileigenschaften

| Eigenschaft   | Erforderlich | Beschreibung                                                       |
| ------------- | ------------ | ------------------------------------------------------------------ |
| `id`          | ✅           | Eindeutige Kennung (z. B. `"personal"`, `"work"`)                  |
| `name`        | ✅           | Git user.name — wird in Commits angezeigt                          |
| `email`       | ✅           | Git user.email — wird in Commits angezeigt                         |
| `icon`        |              | Emoji in der Statusleiste (z. B. `"🏠"`). Nur einzelnes Emoji      |
| `service`     |              | Dienstname (z. B. `"GitHub"`, `"GitLab"`). Für UI-Anzeige          |
| `description` |              | Kurze Beschreibung in Auswahl und Tooltip                          |
| `sshKeyPath`  |              | Pfad zum privaten SSH-Schlüssel (z. B. `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |              | SSH-Config-Host-Alias (z. B. `"github-work"`)                      |
| `gpgKeyId`    |              | GPG-Schlüssel-ID für Commit-Signierung                             |

#### Anzeigenbeschränkungen

- **Statusleiste**: Text über ca. 25 Zeichen wird mit `...` abgeschnitten
- **`icon`**: Nur ein einzelnes Emoji (Graphem-Cluster) erlaubt. Mehrere Emojis oder lange Zeichenketten werden nicht unterstützt

### Globale Einstellungen

| Einstellung                                | Standard       | Beschreibung                                                                                            |
| ------------------------------------------ | -------------- | ------------------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Siehe Beispiel | Liste der Profilkonfigurationen                                                                         |
| `gitIdSwitcher.defaultIdentity`            | Siehe Beispiel | ID des zu verwendenden Standardprofils                                                                  |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`         | SSH-Schlüssel beim Profilwechsel automatisch wechseln                                                   |
| `gitIdSwitcher.showNotifications`          | `true`         | Benachrichtigung beim Profilwechsel anzeigen                                                            |
| `gitIdSwitcher.applyToSubmodules`          | `true`         | Profil auf Git-Submodule übertragen                                                                     |
| `gitIdSwitcher.submoduleDepth`             | `1`            | Maximale Tiefe für verschachtelte Submodul-Konfiguration (1-5)                                          |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`        | Icon-Emoji in Git config `user.name` einschließen                                                       |
| `gitIdSwitcher.logging.fileEnabled`        | `false`        | Audit-Protokoll in Datei speichern (Profilwechsel, SSH-Schlüsseloperationen usw.)                       |
| `gitIdSwitcher.logging.filePath`           | `""`           | Protokolldateipfad (z. B. `~/.git-id-switcher/security.log`). Leer = Standardort                        |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`     | Maximale Dateigröße vor Rotation (Bytes, 1 MB–100 MB)                                                   |
| `gitIdSwitcher.logging.maxFiles`           | `5`            | Maximale Anzahl rotierter Protokolldateien (1-20)                                                       |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`        | Wenn aktiviert, werden alle Werte in Protokollen maskiert (maximaler Datenschutz)                       |
| `gitIdSwitcher.logging.level`              | `"INFO"`       | Protokollebene (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Zeichnet ausgewählte Ebene und höher auf |
| `gitIdSwitcher.commandTimeouts`            | `{}`           | Benutzerdefiniertes Timeout pro Befehl (ms, 1 Sek.–5 Min.). Z. B. `{"git": 15000, "ssh-add": 10000}`    |

#### Über `includeIconInGitConfig`

Steuert das Verhalten, wenn das `icon`-Feld gesetzt ist:

| Wert               | Verhalten                                                                             |
| ------------------ | ------------------------------------------------------------------------------------- |
| `false` (Standard) | `icon` wird nur in der Editor-UI angezeigt. Nur `name` wird in Git config geschrieben |
| `true`             | `icon + name` wird in Git config geschrieben. Emoji erscheint im Commit-Verlauf       |

Beispiel: `icon: "👤"`, `name: "Alex Müller"`

| includeIconInGitConfig | Git config `user.name` | Commit-Signatur          |
| ---------------------- | ---------------------- | ------------------------ |
| `false`                | `Alex Müller`          | `Alex Müller <email>`    |
| `true`                 | `👤 Alex Müller`       | `👤 Alex Müller <email>` |

---

## Funktionsweise

### Git-Config-Schichtstruktur

Git-Konfiguration hat drei Schichten, wobei höhere Schichten die niedrigeren überschreiben:

```text
System (/etc/gitconfig)
    ↓ überschrieben durch
Global (~/.gitconfig)
    ↓ überschrieben durch
Lokal (.git/config)  ← höchste Priorität
```

**Git ID Switcher schreibt in `--local` (Repository-lokal).**

Das bedeutet:

- Profile werden in `.git/config` jedes Repositories gespeichert
- Verschiedene Profile können pro Repository beibehalten werden
- Globale Einstellungen (`~/.gitconfig`) werden nicht verändert

### Verhalten beim Profilwechsel

Beim Wechsel des Profils führt die Erweiterung folgendes aus (in dieser Reihenfolge):

1. **Git Config** (immer): Setzt `git config --local user.name` und `user.email`
2. **SSH-Schlüssel** (wenn `sshKeyPath` gesetzt): Entfernt andere Schlüssel aus ssh-agent und fügt den ausgewählten hinzu
3. **GPG-Schlüssel** (wenn `gpgKeyId` gesetzt): Setzt `git config --local user.signingkey` und aktiviert Signierung
4. **Submodule** (wenn aktiviert): Überträgt Konfiguration auf alle Submodule (Standard: Tiefe 1)

### Wie die Submodul-Übertragung funktioniert

Lokale Einstellungen sind pro Repository, daher werden sie nicht automatisch auf Submodule angewendet.
Deshalb bietet diese Erweiterung eine Submodul-Übertragungsfunktion (siehe „Fortgeschritten: Submodul-Unterstützung" für Details).

### SSH-Schlüsselverwaltung im Detail

Git ID Switcher verwaltet SSH-Schlüssel über `ssh-agent`:

| Operation            | Befehl                 |
| -------------------- | ---------------------- |
| Schlüssel hinzufügen | `ssh-add <keyPath>`    |
| Schlüssel entfernen  | `ssh-add -d <keyPath>` |
| Schlüssel auflisten  | `ssh-add -l`           |

**Wichtig:** Diese Erweiterung ändert `~/.ssh/config` **nicht**. Die SSH-Config-Einrichtung muss manuell erfolgen (siehe Schritt 2 unter „Schnellstart").

### Zusammenspiel mit bestehender SSH-Konfiguration

Wenn Sie bereits eine SSH-Konfiguration haben, arbeitet Git ID Switcher damit zusammen:

| Ihre Konfiguration                          | Verhalten von Git ID Switcher                            |
| ------------------------------------------- | -------------------------------------------------------- |
| `~/.ssh/config` mit `IdentityFile`          | Beide nutzbar; `IdentitiesOnly yes` verhindert Konflikte |
| Umgebungsvariable `GIT_SSH_COMMAND`         | Ihr SSH-Befehl wird verwendet; ssh-agent arbeitet weiter |
| `git config core.sshCommand`                | Wie oben                                                 |
| direnv mit SSH-bezogenen Umgebungsvariablen | Koexistenz möglich; ssh-agent arbeitet unabhängig        |

**Empfohlen:** Setzen Sie in Ihrer SSH-Config immer `IdentitiesOnly yes`. Dies verhindert, dass SSH mehrere Schlüssel ausprobiert.

### Warum `IdentitiesOnly yes`?

Ohne diese Einstellung versucht SSH möglicherweise Schlüssel in dieser Reihenfolge:

1. Im ssh-agent geladene Schlüssel (von Git ID Switcher verwaltet)
2. In `~/.ssh/config` angegebene Schlüssel
3. Standardschlüssel (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` usw.)

Dies kann zu Authentifizierungsfehlern oder unbeabsichtigter Schlüsselverwendung führen.

Mit `IdentitiesOnly yes` verwendet SSH **nur den angegebenen Schlüssel**. Damit wird sichergestellt, dass der in Git ID Switcher konfigurierte Schlüssel zuverlässig verwendet wird.

```ssh-config
# Empfohlene Konfiguration
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Diese Zeile ist wichtig
```

Mit dieser Konfiguration wird bei Verbindungen zum `github-work`-Host nur `~/.ssh/id_ed25519_work` verwendet, und es werden keine anderen Schlüssel ausprobiert.

---

## Fortgeschritten: Submodul-Unterstützung

Bei komplexen Repositories mit Git-Submodulen ist die Profilverwaltung oft mühsam. Beim Committen in einem Submodul verwendet Git die lokale Konfiguration dieses Submoduls, die möglicherweise auf die globale Konfiguration zurückfällt (falsche E-Mail!), wenn sie nicht explizit gesetzt ist.

**Git ID Switcher** erkennt Submodule automatisch und wendet das ausgewählte Profil an.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Aktivieren/Deaktivieren dieser Funktion
- `submoduleDepth`: Wie tief soll angewendet werden?
  - `1`: Nur direkte Submodule (am häufigsten)
  - `2+`: Verschachtelte Submodule (Submodule in Submodulen)

Damit ist Ihr Profil immer korrekt, egal ob Sie im Haupt-Repository oder in einer Vendor-Bibliothek committen.

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

### Falsches Profil beim Pushen?

**Beim neuen Klonen:**

Verwenden Sie beim Klonen von Arbeits-Repositories den in der SSH-Config eingerichteten Host-Alias:

```bash
# Arbeit (github-work-Alias verwenden)
git clone git@github-work:company/repo.git

# Persönlich (Standard github.com verwenden)
git clone git@github.com:yourname/repo.git
```

**Bei bestehenden Repositories:**

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

1. GPG-Schlüssel-ID ermitteln:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Signierung testen:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Stellen Sie sicher, dass die E-Mail-Adresse in Ihrem Profil mit der E-Mail des GPG-Schlüssels übereinstimmt

### Profil wird nicht erkannt?

- Stellen Sie sicher, dass Sie sich in einem Git-Repository befinden
- Prüfen Sie `settings.json` auf Syntaxfehler
- Laden Sie das VS Code-Fenster neu (`Cmd+Shift+P` → „Fenster neu laden")

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

VS-Code-basierte Editoren cachen das Einstellungsschema im Speicher, und „Fenster neu laden" oder Neuinstallation der Erweiterung reicht möglicherweise nicht aus, um es zu aktualisieren.

### Standardwerte (identities usw.) leer?

Wenn Beispieleinstellungen auch nach einer Neuinstallation nicht erscheinen, könnte **Settings Sync** die Ursache sein.

Wenn Sie zuvor leere Einstellungen gespeichert haben, wurden sie möglicherweise in die Cloud synchronisiert und überschreiben bei Neuinstallationen die Standardwerte.

**Lösung:**

1. Finden Sie die Einstellung in der Einstellungs-UI
2. Klicken Sie auf das Zahnrad-Symbol → „Einstellung zurücksetzen"
3. Mit Settings Sync synchronisieren (dies entfernt die alten Einstellungen aus der Cloud)

---

## Designphilosophie

> **„Wer bin ich?" wechseln** — Die einzige Frage, die diese Erweiterung beantwortet

Entwickelt nach der **Karesansui-Architektur**: Ein einfacher Kern (100 Zeilen).
Deshalb kann der Rest in Qualität (90 % Tests, Logging, Timeouts) und
bewusste Einschränkungen (keine GitHub-API, keine Token-Verwaltung) investiert werden.

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Die vollständige Philosophie lesen](../../DESIGN_PHILOSOPHY.md)

---

## Mitwirken

Beiträge willkommen! Siehe [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Lizenz

MIT-Lizenz — siehe [LICENSE](../../../LICENSE).

## Credits

Erstellt von [Null;Variant](https://github.com/nullvariant)

# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Wechseln Sie mit einem Klick zwischen mehreren Git-Identitäten. Verwalten Sie mehrere GitHub-Konten, SSH-Schlüssel, GPG-Signierung und <b>wenden Sie Identitäten automatisch auf Git-Submodule an</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Sprachen: <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <b>🇩🇪</b> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> ... <a href="../../LANGUAGES.md">+20 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/docs/i18n/de/demo.png" width="600" alt="Demo">

## Funktionen

- **Ein-Klick-Identitätswechsel**: Git user.name und user.email sofort ändern
- **SSH-Schlüsselverwaltung**: SSH-Schlüssel automatisch im ssh-agent wechseln
- **GPG-Signierungsunterstützung**: GPG-Schlüssel für Commit-Signierung konfigurieren (optional)
- **Submodul-Unterstützung**: Identität automatisch auf Git-Submodule übertragen
- **Statusleisten-Integration**: Aktuelle Identität immer im Blick
- **Reichhaltige Tooltips**: Detaillierte Identitätsinformationen mit Beschreibung und SSH-Host
- **Plattformübergreifend**: Funktioniert auf macOS, Linux und Windows
- **Mehrsprachig**: Unterstützt 17 Sprachen

## 🚀 Warum diese Erweiterung?

Obwohl es viele Git-Identitätswechsler gibt, löst **Git ID Switcher** komplexe Probleme, die andere oft ignorieren:

1. **Das Submodul-Problem**: Bei der Arbeit mit Repositories mit Submodulen (z.B. Hugo-Themes, Vendor-Bibliotheken) muss man normalerweise `git config user.name` für *jedes* Submodul manuell setzen. Diese Erweiterung löst das elegant, indem sie Ihre Identität rekursiv auf alle aktiven Submodule anwendet.
2. **SSH- und GPG-Handling**: Es ändert nicht nur Ihren Namen; es tauscht Ihre SSH-Schlüssel im Agent aus und konfiguriert die GPG-Signierung, damit Sie nie mit der falschen Signatur committen.

## 🌏 Ein Wort zur Mehrsprachigkeit

> **Ich schätze die Existenz von Minderheiten.**
> Ich möchte sie nicht verwerfen, nur weil sie zahlenmäßig klein sind.
> Auch wenn Übersetzungen nicht perfekt sind, hoffe ich, dass Sie unsere Absicht spüren können, Minderheitensprachen zu verstehen und zu respektieren.

Diese Erweiterung unterstützt alle 17 Sprachen, die VSCode unterstützt. Zusätzlich versuchen wir bei der README-Dokumentation, in Minderheitensprachen und sogar Scherzsprachen zu übersetzen.

Das ist nicht nur "globale Unterstützung" - es ist "Respekt für sprachliche Vielfalt". Und ich würde mich freuen, wenn dies zur Infrastruktur wird, in der Commits, die die Welt verbessern, von Entwicklern überall auf der Welt kommen, Sprachbarrieren überwindend.

---

## Schnellstart

Eine typische Einrichtung für die Verwaltung mehrerer GitHub-Konten.

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

Öffnen Sie VS Code Einstellungen (`Cmd+,` / `Strg+,`) → suchen Sie "Git ID Switcher" → klicken Sie auf "In settings.json bearbeiten":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Müller",
      "email": "alex.mueller@personal.example.com",
      "description": "Persönliche Projekte",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Müller",
      "email": "alex.mueller@company.example.com",
      "description": "Arbeitskonto",
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

# Arbeitskonto
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Open-Source-Persona
Host github-oss
    HostName github.com
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
      "icon": "🏠",
      "name": "Alex Müller",
      "email": "alex.mueller@personal.example.com",
      "description": "Persönliche Projekte",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Müller",
      "email": "alex.mueller@company.example.com",
      "description": "Arbeitskonto",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "oss",
      "icon": "🌟",
      "name": "amueller-oss",
      "email": "amueller.oss@example.com",
      "description": "Open-Source-Beiträge",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "github-oss"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Müller",
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
| `icon`        |              | Emoji in der Statusleiste (z.B. `"💼"`)                     |
| `description` |              | Kurze Beschreibung in Auswahl und Tooltip                  |
| `sshKeyPath`  |              | Pfad zum privaten SSH-Schlüssel (z.B. `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |              | SSH-Config-Host-Alias (z.B. `"github-work"`)               |
| `gpgKeyId`    |              | GPG-Schlüssel-ID für Commit-Signierung                     |

### Globale Einstellungen

| Einstellung                       | Standard   | Beschreibung                                   |
| --------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`        | Siehe Beispiel | Liste der Identitätskonfigurationen        |
| `gitIdSwitcher.defaultIdentity`   | Siehe Beispiel | ID der Standardidentität                   |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`     | SSH-Schlüssel beim Identitätswechsel automatisch wechseln |
| `gitIdSwitcher.showNotifications` | `true`     | Benachrichtigung beim Identitätswechsel anzeigen |
| `gitIdSwitcher.applyToSubmodules` | `true`     | Identität auf Git-Submodule übertragen         |
| `gitIdSwitcher.submoduleDepth`    | `1`        | Maximale Tiefe für verschachtelte Submodul-Konfiguration (1-5) |

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

Beim Wechsel der Identität führt die Erweiterung folgendes aus (in dieser Reihenfolge):

1. **Git-Konfiguration** (immer): Setzt `git config --local user.name` und `user.email`
2. **SSH-Schlüssel** (wenn `sshKeyPath` gesetzt): Entfernt andere Schlüssel aus ssh-agent, fügt den ausgewählten hinzu
3. **GPG-Schlüssel** (wenn `gpgKeyId` gesetzt): Setzt `git config --local user.signingkey` und aktiviert Signierung
4. **Submodule** (wenn aktiviert): Überträgt Konfiguration auf alle Submodule (Standard: Tiefe 1)

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

---

## Befehle

| Befehl                          | Beschreibung                |
| ------------------------------- | --------------------------- |
| `Git ID: Select Identity`       | Identitätsauswahl öffnen    |
| `Git ID: Show Current Identity` | Aktuelle Identität anzeigen |

---

## Mitwirken

Beiträge willkommen! Siehe [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Lizenz

MIT-Lizenz - siehe [LICENSE](../../LICENSE).

## Credits

Erstellt von [Null;Variant](https://github.com/nullvariant)

# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Basculez entre plusieurs profils Git en un clic. Gérez plusieurs comptes GitHub, clés SSH, signature GPG et <b>appliquez automatiquement les profils aux sous-modules Git</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <b>🇫🇷</b> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/fr/demo.webp" width="600" alt="Démo" loading="lazy">

## 🎯 Pourquoi Git ID Switcher ?

Il existe de nombreux outils de changement de profil Git, mais **Git ID Switcher** résout les problèmes complexes que les autres ignorent souvent :

1. **Le cauchemar des sous-modules** : Lorsque vous travaillez avec des dépôts contenant des sous-modules (thèmes Hugo, bibliothèques vendor, etc.), vous devez généralement définir `git config user.name` manuellement pour _chaque_ sous-module. Cette extension résout cela élégamment en appliquant récursivement votre profil à tous les sous-modules actifs.
2. **Gestion SSH et GPG** : Elle ne fait pas que changer votre nom — elle échange vos clés SSH dans l'agent et configure la signature GPG pour que vous ne committiez jamais avec la mauvaise signature.

## Fonctionnalités

- **UI de gestion des profils** : Ajoutez, modifiez, supprimez et réorganisez les profils sans éditer settings.json
- **Changement de profil en un clic** : Modifiez instantanément Git user.name et user.email
- **Intégration à la barre d'état** : Voyez toujours votre profil actuel d'un coup d'œil
- **Sync Check** : Détection en temps réel des écarts entre le profil et la configuration git, avec avertissement dans la barre d'état
- **Support des sous-modules** : Propagez automatiquement le profil aux sous-modules Git
- **Gestion des clés SSH** : Basculez automatiquement les clés SSH dans ssh-agent
- **Support de signature GPG** : Configurez la clé GPG pour signer les commits (optionnel)
- **Info-bulles enrichies** : Informations détaillées avec description et hôte SSH
- **Multi-plateforme** : Fonctionne sur macOS, Linux et Windows
- **Multilingue** : Supporte 17 langues

## 🌏 Notre engagement pour le multilinguisme

> **Je valorise l'existence des minorités.**
> Je ne veux pas les écarter simplement parce qu'elles sont peu nombreuses.
> Même si les traductions ne sont pas parfaites, j'espère que vous ressentirez notre intention de comprendre et de respecter les langues minoritaires.

Cette extension prend en charge les 17 langues supportées par VS Code. De plus, pour la documentation README, nous nous efforçons de traduire vers des langues minoritaires et même des langues humoristiques.

Ce n'est pas simplement du « support global » — c'est du « respect pour la diversité linguistique ». Et je serais heureux si cela devenait une infrastructure où des commits qui améliorent le monde viennent de développeurs de partout, transcendant les barrières linguistiques.

---

## Démarrage rapide

Une configuration typique pour gérer un compte personnel et un compte professionnel (Enterprise Managed User).

### Étape 1 : Préparer les clés SSH

D'abord, créez des clés SSH pour chaque compte (passez cette étape si vous en avez déjà) :

```bash
# Personnel
ssh-keygen -t ed25519 -C "camille@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Travail
ssh-keygen -t ed25519 -C "camille.dupont@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Enregistrez la **clé publique** (fichier `.pub`) de chaque clé SSH sur le compte GitHub correspondant.

> **Note** : Enregistrez `id_ed25519_personal.pub` (clé publique) sur GitHub. `id_ed25519_personal` (sans extension) est la clé privée — ne la partagez jamais et ne la téléversez nulle part.

### Étape 2 : Configurer SSH

Éditez `~/.ssh/config` :

```ssh-config
# Compte GitHub personnel (par défaut)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Compte GitHub professionnel
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Étape 3 : Configurer l'extension

Dès l'installation, des exemples de profils sont fournis.
Suivez le guide ci-dessous pour les adapter à votre usage.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/fr/first-ux.webp" width="600" alt="Configuration initiale : ouvrir la gestion des profils depuis la barre d'état, puis modifier et créer de nouveaux profils" loading="lazy">

> **Les fichiers de clés ne sont pas transmis** : Lors de la configuration des chemins de clés SSH, seul le chemin du fichier (emplacement) est enregistré. Le contenu du fichier de clé n'est jamais téléversé ni transmis à l'extérieur.

> **Pour utiliser la signature GPG** : Vous pouvez également configurer `gpgKeyId` dans l'écran d'édition du profil.
> Pour trouver votre ID de clé GPG, consultez « [Dépannage](#la-signature-gpg-ne-fonctionne-pas-) ».

> **Astuce** : Vous pouvez également configurer directement via settings.json.
> Ouvrez les paramètres de l'extension (`Cmd+,` / `Ctrl+,`) → recherchez « Git ID Switcher » → cliquez sur « Modifier dans settings.json ».
> Pour des exemples de configuration JSON, consultez « [Exemple complet](#exemple-complet--5-comptes-avec-ssh--gpg) ».

---

## Exemple complet : 5 comptes avec SSH + GPG

Un exemple complet combinant toutes les fonctionnalités :

### Configuration SSH (`~/.ssh/config`)

```ssh-config
# Compte personnel (par défaut)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Compte professionnel (Enterprise Managed User fourni par l'entreprise)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Client A – prestation (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Client B – projet sur site (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# Contributions OSS (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Paramètres de l'extension

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Camille Dupont",
      "email": "camille@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Projets personnels",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Camille Dupont",
      "email": "camille.dupont@techcorp.example.com",
      "service": "GitHub Travail",
      "icon": "💼",
      "description": "TechCorp emploi principal",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Camille Dupont",
      "email": "camille@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA mission",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "C.Dupont",
      "email": "c.dupont@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB sur site",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "camille-dev",
      "email": "camille.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "Contributions OSS",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Remarque : Le 4e profil (`client-b`) utilise un nom abrégé et le 5e (`oss`) un pseudo de développeur. Vous pouvez définir un nom d'affichage différent pour chaque profil, même pour la même personne.

---

## Gestion des profils

Cliquez sur la barre d'état → sélectionnez « Gestion des profils » en bas de la liste pour ouvrir l'interface de gestion.
Vous pouvez ajouter, modifier, supprimer et réorganiser les profils directement depuis l'interface.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/fr/identity-management.webp" width="600" alt="Gestion des profils : guide de suppression et de réorganisation" loading="lazy">

Vous pouvez également supprimer un profil via la palette de commandes avec `Git ID Switcher: Delete Identity`.

---

## Commandes

| Commande                                 | Description                    |
| ---------------------------------------- | ------------------------------ |
| `Git ID Switcher: Select Identity`       | Ouvrir le sélecteur de profils |
| `Git ID Switcher: Delete Identity`       | Supprimer un profil            |
| `Git ID Switcher: Show Current Identity` | Afficher le profil actuel      |
| `Git ID Switcher: Show Documentation`    | Afficher la documentation      |

---

## Référence de configuration

### Propriétés du profil

| Propriété     | Requis | Description                                                            |
| ------------- | ------ | ---------------------------------------------------------------------- |
| `id`          | ✅     | Identifiant unique (ex : `"personal"`, `"work"`)                       |
| `name`        | ✅     | Git user.name — affiché dans les commits                               |
| `email`       | ✅     | Git user.email — affiché dans les commits                              |
| `icon`        |        | Emoji affiché dans la barre d'état (ex : `"🏠"`). Un seul emoji        |
| `service`     |        | Nom du service (ex : `"GitHub"`, `"GitLab"`). Utilisé pour l'affichage |
| `description` |        | Courte description affichée dans le sélecteur et l'info-bulle          |
| `sshKeyPath`  |        | Chemin vers la clé SSH privée (ex : `"~/.ssh/id_ed25519_work"`)        |
| `sshHost`     |        | Alias d'hôte SSH (ex : `"github-work"`)                                |
| `gpgKeyId`    |        | ID de clé GPG pour la signature des commits                            |

#### Limitations d'affichage

- **Barre d'état** : Le texte dépassant environ 25 caractères sera tronqué avec `...`
- **`icon`** : Un seul emoji (cluster de graphèmes) est autorisé. Les emojis multiples ou les chaînes longues ne sont pas supportés

### Paramètres globaux

| Paramètre                                  | Par défaut    | Description                                                                                              |
| ------------------------------------------ | ------------- | -------------------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Voir exemples | Liste des configurations de profils                                                                      |
| `gitIdSwitcher.defaultIdentity`            | Voir exemples | ID du profil par défaut                                                                                  |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`        | Changer automatiquement la clé SSH lors du changement de profil                                          |
| `gitIdSwitcher.showNotifications`          | `true`        | Afficher une notification lors du changement de profil                                                   |
| `gitIdSwitcher.applyToSubmodules`          | `true`        | Propager le profil aux sous-modules Git                                                                  |
| `gitIdSwitcher.submoduleDepth`             | `1`           | Profondeur max pour les sous-modules imbriqués (1-5)                                                     |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`       | Inclure l'emoji icône dans le Git config `user.name`                                                     |
| `gitIdSwitcher.syncCheck.enabled`          | `true`        | Vérifier si le profil sélectionné correspond à la configuration git réelle                               |
| `gitIdSwitcher.syncCheck.onFocusReturn`    | `true`        | Exécuter le sync check lorsque la fenêtre de l'éditeur retrouve le focus                                 |
| `gitIdSwitcher.logging.fileEnabled`        | `false`       | Enregistrer le journal d'audit dans un fichier (changements de profil, opérations SSH, etc.)             |
| `gitIdSwitcher.logging.filePath`           | `""`          | Chemin du fichier journal (ex : `~/.git-id-switcher/security.log`). Vide = emplacement par défaut        |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`    | Taille max du fichier avant rotation (octets, 1 Mo–100 Mo)                                               |
| `gitIdSwitcher.logging.maxFiles`           | `5`           | Nombre max de fichiers journaux en rotation (1-20)                                                       |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`       | Lorsqu'activé, toutes les valeurs sont masquées dans les journaux (confidentialité maximale)             |
| `gitIdSwitcher.logging.level`              | `"INFO"`      | Niveau de journalisation (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Enregistre le niveau et au-delà |
| `gitIdSwitcher.commandTimeouts`            | `{}`          | Timeout personnalisé par commande (ms, 1 s–5 min). Ex : `{"git": 15000, "ssh-add": 10000}`               |

#### À propos de `includeIconInGitConfig`

Contrôle le comportement lorsque le champ `icon` est défini :

| Valeur               | Comportement                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| `false` (par défaut) | `icon` est affiché uniquement dans l'interface de l'éditeur. Seul `name` est écrit dans Git config |
| `true`               | `icon + name` est écrit dans Git config. L'emoji apparaît dans l'historique des commits            |

Exemple : `icon: "👤"`, `name: "Camille Dupont"`

| includeIconInGitConfig | Git config `user.name` | Signature de commit         |
| ---------------------- | ---------------------- | --------------------------- |
| `false`                | `Camille Dupont`       | `Camille Dupont <email>`    |
| `true`                 | `👤 Camille Dupont`    | `👤 Camille Dupont <email>` |

---

## Fonctionnement

### Structure des couches Git config

La configuration Git comporte trois couches, où les couches de priorité supérieure remplacent les inférieures :

```text
Système (/etc/gitconfig)
    ↓ remplacé par
Global (~/.gitconfig)
    ↓ remplacé par
Local (.git/config)  ← priorité la plus élevée
```

**Git ID Switcher écrit en `--local` (local au dépôt).**

Cela signifie :

- Le profil est sauvegardé dans le `.git/config` de chaque dépôt
- Différents profils peuvent être maintenus par dépôt
- Les paramètres globaux (`~/.gitconfig`) ne sont pas modifiés

### Comportement lors du changement de profil

Lors du changement de profil, l'extension effectue (dans l'ordre) :

1. **Git Config** (toujours) : Définit `git config --local user.name` et `user.email`
2. **Clé SSH** (si `sshKeyPath` défini) : Supprime les autres clés de ssh-agent, ajoute celle sélectionnée
3. **Clé GPG** (si `gpgKeyId` défini) : Définit `git config --local user.signingkey` et active la signature
4. **Sous-modules** (si activé) : Propage la configuration à tous les sous-modules (par défaut : profondeur 1)
5. **Sync Check** : Vérifie que le profil appliqué correspond à la configuration git réelle

### Sync Check

Compare le profil sélectionné aux valeurs réelles de `git config --local` (`user.name`, `user.email`, `user.signingkey`) et affiche un avertissement dans la barre d'état lorsqu'un écart est détecté.

**Quand les vérifications s'exécutent :**

- Immédiatement après l'application du profil
- Lors du changement de dossier de l'espace de travail
- Lors d'un changement de configuration
- Lorsque la fenêtre de l'éditeur retrouve le focus (temporisé 500 ms)

**Lorsqu'un écart est détecté :**

- La barre d'état affiche une icône ⚠️ avec une couleur de fond d'avertissement
- L'info-bulle affiche un tableau montrant les champs en écart (champ, valeur attendue, valeur réelle)
- Cliquer sur la barre d'état présente les options de résolution :
  - **Réappliquer le profil** — Réappliquer le profil actuel à la configuration git
  - **Sélectionner un autre profil** — Ouvrir le sélecteur de profils
  - **Ignorer** — Supprimer l'avertissement jusqu'à la prochaine vérification

**Pour désactiver :**

Définissez `gitIdSwitcher.syncCheck.enabled` sur `false` pour désactiver toutes les vérifications de synchronisation.
Pour désactiver uniquement la vérification au retour du focus, définissez `gitIdSwitcher.syncCheck.onFocusReturn` sur `false`.

### Fonctionnement de la propagation aux sous-modules

Les paramètres locaux sont par dépôt, ils ne s'appliquent donc pas automatiquement aux sous-modules.
C'est pourquoi cette extension fournit la propagation aux sous-modules (voir « Avancé : Support des sous-modules » pour les détails).

### Gestion des clés SSH en détail

Git ID Switcher gère les clés SSH via `ssh-agent` :

| Opération         | Commande exécutée      |
| ----------------- | ---------------------- |
| Ajouter une clé   | `ssh-add <keyPath>`    |
| Supprimer une clé | `ssh-add -d <keyPath>` |
| Lister les clés   | `ssh-add -l`           |

**Important :** Cette extension ne modifie **pas** `~/.ssh/config`. La configuration SSH doit être effectuée manuellement (voir l'étape 2 du « Démarrage rapide »).

### Interaction avec la configuration SSH existante

Si vous avez déjà une configuration SSH, Git ID Switcher fonctionne en coexistence :

| Votre configuration                        | Comportement de Git ID Switcher                                     |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `~/.ssh/config` avec `IdentityFile`        | Les deux sont utilisables ; `IdentitiesOnly yes` évite les conflits |
| Variable d'environnement `GIT_SSH_COMMAND` | Votre commande SSH est utilisée ; ssh-agent continue de fonctionner |
| `git config core.sshCommand`               | Idem                                                                |
| direnv avec des variables liées à SSH      | Coexistence possible ; ssh-agent fonctionne indépendamment          |

**Recommandé :** Définissez toujours `IdentitiesOnly yes` dans votre configuration SSH. Cela empêche SSH d'essayer plusieurs clés.

### Pourquoi `IdentitiesOnly yes` ?

Sans cette configuration, SSH peut essayer les clés dans cet ordre :

1. Les clés chargées dans ssh-agent (gérées par Git ID Switcher)
2. Les clés spécifiées dans `~/.ssh/config`
3. Les clés par défaut (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, etc.)

Cela peut entraîner des échecs d'authentification ou l'utilisation involontaire d'une mauvaise clé.

Avec `IdentitiesOnly yes`, SSH utilise **uniquement la clé spécifiée**. Cela garantit que la clé configurée dans Git ID Switcher est utilisée de manière fiable.

```ssh-config
# Configuration recommandée
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Cette ligne est importante
```

Avec cette configuration, lors de la connexion à l'hôte `github-work`, seul `~/.ssh/id_ed25519_work` est utilisé, et aucune autre clé n'est essayée.

---

## Avancé : Support des sous-modules

Pour les dépôts complexes utilisant des sous-modules Git, la gestion des profils est souvent pénible. Si vous committez dans un sous-module, Git utilise la configuration locale de ce sous-module, qui peut revenir à votre configuration globale (mauvaise adresse e-mail !) si elle n'est pas explicitement définie.

**Git ID Switcher** détecte automatiquement les sous-modules et leur applique le profil sélectionné.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules` : Activer/désactiver cette fonctionnalité
- `submoduleDepth` : Jusqu'à quelle profondeur ?
  - `1` : Sous-modules directs uniquement (le plus courant)
  - `2+` : Sous-modules imbriqués (sous-modules dans des sous-modules)

Cela garantit que votre profil est toujours correct, que vous committiez dans le dépôt principal ou dans une bibliothèque vendor.

---

## Dépannage

### La clé SSH ne change pas ?

1. Assurez-vous que `ssh-agent` est en cours d'exécution :

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Vérifiez que le chemin de la clé est correct :

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. Sur macOS, ajoutez au trousseau une fois :

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Mauvais profil lors du push ?

**Lors d'un nouveau clonage :**

Lors du clonage de dépôts professionnels, utilisez l'alias d'hôte configuré dans SSH config :

```bash
# Professionnel (utilise l'alias github-work)
git clone git@github-work:company/repo.git

# Personnel (utilise github.com par défaut)
git clone git@github.com:yourname/repo.git
```

**Pour les dépôts existants :**

1. Vérifiez que l'URL distante utilise le bon alias d'hôte :

   ```bash
   git remote -v
   # Devrait afficher git@github-work:... pour les dépôts professionnels
   ```

2. Mettez à jour si nécessaire :

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### La signature GPG ne fonctionne pas ?

1. Trouvez votre ID de clé GPG :

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Testez la signature :

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Assurez-vous que l'adresse e-mail dans votre profil correspond à l'adresse de la clé GPG

### Profil non détecté ?

- Assurez-vous d'être dans un dépôt Git
- Vérifiez que `settings.json` n'a pas d'erreurs de syntaxe
- Rechargez la fenêtre VS Code (`Cmd+Shift+P` → « Recharger la fenêtre »)

### Erreur avec le champ `name` ?

Les caractères suivants dans le champ `name` causeront une erreur :

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Utilisez le champ `service` si vous souhaitez inclure des informations de service.

```jsonc
// NG
"name": "Camille Dupont (Perso)"

// OK
"name": "Camille Dupont",
"service": "GitHub"
```

### Les nouveaux paramètres n'apparaissent pas ?

Après la mise à jour de l'extension, les nouveaux paramètres peuvent ne pas apparaître dans l'interface des paramètres.

**Solution :** Redémarrez complètement votre machine.

Les éditeurs basés sur VS Code mettent en cache le schéma des paramètres en mémoire, et « Recharger la fenêtre » ou réinstaller l'extension peut ne pas suffire à le rafraîchir.

### Les valeurs par défaut (identities, etc.) sont vides ?

Si les exemples de paramètres n'apparaissent pas même après une nouvelle installation, **Settings Sync** peut en être la cause.

Si vous avez précédemment sauvegardé des paramètres vides, ils ont pu être synchronisés sur le cloud et écraser les valeurs par défaut lors des nouvelles installations.

**Solution :**

1. Trouvez le paramètre dans l'interface des paramètres
2. Cliquez sur l'icône d'engrenage → « Réinitialiser le paramètre »
3. Synchronisez avec Settings Sync (cela supprime les anciens paramètres du cloud)

---

## Philosophie de conception

> **Changer de « Qui suis-je »** — La seule question à laquelle cette extension répond

Conçue selon l'**architecture Karesansui** : un noyau simple (100 lignes).
C'est pourquoi le reste peut être consacré à la qualité (90 % de couverture, journalisation, timeouts)
et aux contraintes délibérées (pas d'API GitHub, pas de gestion de tokens).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Lire la philosophie complète](../../DESIGN_PHILOSOPHY.md)

---

## Contribuer

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licence

Licence MIT — voir [LICENSE](../../../LICENSE).

## Crédits

Créé par [Null;Variant](https://github.com/nullvariant)

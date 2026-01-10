# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Basculez entre plusieurs identités Git en un clic. Gérez plusieurs comptes GitHub, clés SSH, signature GPG et <b>appliquez automatiquement l'identité aux sous-modules Git</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <b>🇫🇷</b> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-fr.png" width="600" alt="Démo">

## 🎯 Pourquoi Git ID Switcher ?

Bien qu'il existe de nombreux outils de changement d'identité Git, **Git ID Switcher** résout les problèmes complexes que les autres ignorent souvent :

1. **Le cauchemar des sous-modules** : Lorsque vous travaillez avec des dépôts contenant des sous-modules (thèmes Hugo, bibliothèques vendor, etc.), vous devez généralement définir `git config user.name` manuellement pour *chaque* sous-module. Cette extension gère cela élégamment en appliquant récursivement votre identité à tous les sous-modules actifs.
2. **Gestion SSH et GPG** : Elle ne fait pas que changer votre nom ; elle échange vos clés SSH dans l'agent et configure la signature GPG pour que vous ne committiez jamais avec la mauvaise signature.

## Fonctionnalités

- **Support des sous-modules** : Propagez automatiquement l'identité aux sous-modules Git
- **Gestion des clés SSH** : Basculez automatiquement les clés SSH dans ssh-agent
- **Support de signature GPG** : Configurez la clé GPG pour signer les commits (optionnel)
- **Changement d'identité en un clic** : Modifiez instantanément Git user.name et user.email
- **Intégration à la barre d'état** : Voyez toujours votre identité actuelle d'un coup d'œil
- **Info-bulles enrichies** : Informations détaillées avec description et hôte SSH
- **Multi-plateforme** : Fonctionne sur macOS, Linux et Windows
- **Multilingue** : Supporte 17 langues

## 🌏 Un mot sur le support multilingue

> **Je valorise l'existence des minorités.**
> Je ne veux pas les écarter simplement parce qu'elles sont peu nombreuses.
> Même si les traductions ne sont pas parfaites, j'espère que vous ressentirez notre intention de comprendre et de respecter les langues minoritaires.

Cette extension supporte les 17 langues supportées par VSCode. De plus, pour la documentation README, nous nous efforçons de traduire vers des langues minoritaires et même des langues humoristiques.

Ce n'est pas seulement du « support global » — c'est du « respect pour la diversité linguistique ». Et je serais heureux si cela devient une infrastructure où des commits qui améliorent le monde viennent de développeurs partout, transcendant les barrières linguistiques.

---

## Démarrage rapide

Une configuration typique pour gérer un compte personnel et un compte professionnel (Enterprise Managed User).

### Étape 1 : Préparer les clés SSH

D'abord, créez des clés SSH pour chaque compte (sautez si vous en avez déjà) :

```bash
# Personnel
ssh-keygen -t ed25519 -C "camille.dupont@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Travail
ssh-keygen -t ed25519 -C "camille.dupont@company.example.com" -f ~/.ssh/id_ed25519_work
```

Enregistrez la **clé publique** (fichier `.pub`) de chaque clé sur le compte GitHub correspondant.

> **Note** : Enregistrez `id_ed25519_personal.pub` (clé publique) sur GitHub. `id_ed25519_personal` (sans extension) est la clé privée - ne la partagez jamais et ne la téléchargez nulle part.

### Étape 2 : Configurer SSH

Éditez `~/.ssh/config` :

```ssh-config
# Compte GitHub personnel (par défaut)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Compte GitHub travail (Enterprise Managed User fourni par l'entreprise)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Étape 3 : Configurer l'extension

Ouvrez les paramètres de l'extension (`Cmd+,` / `Ctrl+,`) → recherchez "Git ID Switcher" → cliquez sur "Modifier dans settings.json" :

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Camille Dupont",
      "email": "camille.dupont@personal.example.com",
      "service": "GitHub",
      "description": "Projets personnels",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Camille Dupont",
      "email": "camille.dupont@company.example.com",
      "service": "GitHub Pro",
      "description": "Compte professionnel",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Étape 4 : Utiliser

1. Cliquez sur l'icône d'identité dans la barre d'état (en bas à droite)
2. Sélectionnez une identité
3. C'est fait ! La configuration Git et la clé SSH sont maintenant changées.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-fr.png" width="600" alt="Quick Pick">

### Utiliser les alias d'hôtes SSH

Lors du clonage de dépôts, utilisez l'hôte correspondant à votre identité :

```bash
# Pour l'identité travail (utilise l'alias github-work)
git clone git@github-work:company/repo.git

# Pour l'identité personnelle (utilise github.com par défaut)
git clone git@github.com:cdupont/repo.git
```

---

## Optionnel : Signature GPG

Si vous signez vos commits avec GPG :

### Étape 1 : Trouver votre ID de clé GPG

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Exemple de sortie :

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Camille Dupont <camille.dupont@personal.example.com>
```

L'ID de clé est `ABCD1234`.

### Étape 2 : Ajouter la clé GPG à l'identité

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Camille Dupont",
      "email": "camille.dupont@personal.example.com",
      "service": "GitHub",
      "description": "Projets personnels",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Lorsque vous passez à cette identité, l'extension configure :

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Exemple complet : 4 comptes avec SSH + GPG

Voici un exemple complet combinant tout :

### Configuration SSH (`~/.ssh/config`)

```ssh-config
# Compte personnel (par défaut)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Compte travail (Enterprise Managed User fourni par l'entreprise)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Compte Bitbucket
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Paramètres de l'extension

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Camille Dupont",
      "email": "camille.dupont@personal.example.com",
      "service": "GitHub",
      "description": "Projets personnels",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Camille Dupont",
      "email": "camille.dupont@company.example.com",
      "service": "GitHub Pro",
      "description": "Compte professionnel",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "cdupont-bb",
      "email": "cdupont.bb@example.com",
      "service": "Bitbucket",
      "description": "Projets Bitbucket",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Camille Dupont",
      "email": "camille.dupont@freelance.example.com",
      "service": "GitLab",
      "description": "Projets freelance"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Note : La dernière identité (`freelance`) n'a pas de SSH — elle ne change que la configuration Git. C'est utile pour utiliser différentes informations de commit avec le même compte GitHub.

---

## Référence de configuration

### Propriétés d'identité

| Propriété     | Requis | Description                                                |
| ------------- | ------ | ---------------------------------------------------------- |
| `id`          | ✅     | Identifiant unique (ex: `"work"`, `"personal"`)            |
| `name`        | ✅     | Git user.name - affiché dans les commits                   |
| `email`       | ✅     | Git user.email - affiché dans les commits                  |
| `icon`        |        | Emoji affiché dans la barre d'état (ex. : `"🏠"`). Un seul emoji |
| `service`     |        | Nom du service (ex: `"GitHub"`, `"GitLab"`). Utilisé pour l'affichage UI |
| `description` |        | Courte description affichée dans le sélecteur et l'info-bulle |
| `sshKeyPath`  |        | Chemin vers la clé SSH privée (ex: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |        | Alias d'hôte SSH (ex: `"github-work"`)                     |
| `gpgKeyId`    |        | ID de clé GPG pour la signature des commits                |

#### Limitations d'affichage

- **Barre d'état** : Le texte dépassant ~25 caractères sera tronqué avec `...`
- **`icon`** : Un seul emoji (cluster de graphèmes) est autorisé. Les emojis multiples ou les chaînes longues ne sont pas supportés

### Paramètres globaux

| Paramètre                              | Par défaut   | Description                                    |
| -------------------------------------- | ------------ | ---------------------------------------------- |
| `gitIdSwitcher.identities`             | Voir exemple | Liste des configurations d'identités           |
| `gitIdSwitcher.defaultIdentity`        | Voir exemple | ID de l'identité par défaut                    |
| `gitIdSwitcher.autoSwitchSshKey`       | `true`       | Changer automatiquement la clé SSH             |
| `gitIdSwitcher.showNotifications`      | `true`       | Afficher une notification lors du changement   |
| `gitIdSwitcher.applyToSubmodules`      | `true`       | Propager l'identité aux sous-modules Git       |
| `gitIdSwitcher.submoduleDepth`         | `1`          | Profondeur max pour les sous-modules imbriqués (1-5) |
| `gitIdSwitcher.includeIconInGitConfig` | `false`      | Inclure l'emoji icône dans le Git config `user.name` |
| `gitIdSwitcher.logging.fileEnabled` | `false` | Activer la journalisation d'audit (changements d'identité, opérations SSH, etc.) |
| `gitIdSwitcher.logging.filePath` | `""` | Chemin du fichier journal (ex : `~/.git-id-switcher/security.log`). Vide = emplacement par défaut |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Taille max du fichier avant rotation (octets, 1Mo-100Mo) |
| `gitIdSwitcher.logging.maxFiles` | `5` | Nombre max de fichiers journaux en rotation (1-20) |
| `gitIdSwitcher.logging.level` | `"INFO"` | Niveau de log : `DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`. Enregistre le niveau sélectionné et supérieur |
| `gitIdSwitcher.commandTimeouts` | `{}` | Timeout personnalisé par commande (ms, 1sec-5min). Ex : `{"git": 15000, "ssh-add": 10000}` |

#### À propos de `includeIconInGitConfig`

Contrôle le comportement lorsque le champ `icon` est défini :

| Valeur | Comportement |
|--------|--------------|
| `false` (par défaut) | `icon` est affiché uniquement dans l'interface de l'éditeur. Seul `name` est écrit dans Git config |
| `true` | `icon + name` est écrit dans Git config. L'emoji apparaît dans l'historique des commits |

Exemple : `icon: "👤"`, `name: "Camille Dupont"`

| includeIconInGitConfig | Git config `user.name` | Signature de commit |
|------------------------|------------------------|---------------------|
| `false` | `Camille Dupont` | `Camille Dupont <email>` |
| `true` | `👤 Camille Dupont` | `👤 Camille Dupont <email>` |

### Note : Configuration basique (sans SSH)

Si vous n'avez pas besoin de changer de clé SSH (ex: utilisation de différentes infos de commit avec un seul compte GitHub), vous pouvez utiliser une configuration minimale :

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Camille Dupont",
      "email": "camille.dupont@personal.example.com",
      "description": "Projets personnels"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Camille Dupont",
      "email": "camille.dupont@company.example.com",
      "description": "Compte professionnel"
    }
  ]
}
```

Cette configuration ne change que `git config user.name` et `user.email`.

---

## Fonctionnement

### Structure des couches Git Config

La configuration Git a trois couches, où les couches inférieures remplacent les couches supérieures :

```text
Système (/etc/gitconfig)
    ↓ remplace
Global (~/.gitconfig)
    ↓ remplace
Local (.git/config)  ← priorité la plus élevée
```

**Git ID Switcher écrit en `--local` (local au dépôt).**

Cela signifie :

- L'identité est sauvegardée dans le `.git/config` de chaque dépôt
- Différentes identités peuvent être maintenues par dépôt
- Les paramètres globaux (`~/.gitconfig`) ne sont pas modifiés

### Lors du changement d'identité

Lors du changement d'identité, l'extension effectue (dans l'ordre) :

1. **Configuration Git** (toujours) : Définit `git config --local user.name` et `user.email`
2. **Clé SSH** (si `sshKeyPath` défini) : Supprime les autres clés de ssh-agent, ajoute celle sélectionnée
3. **Clé GPG** (si `gpgKeyId` défini) : Définit `git config --local user.signingkey` et active la signature
4. **Sous-modules** (si activé) : Propage la configuration à tous les sous-modules (par défaut : profondeur 1)

### Fonctionnement de la propagation aux sous-modules

Les paramètres locaux sont par dépôt, ils ne s'appliquent donc pas automatiquement aux sous-modules.
C'est pourquoi cette extension fournit la propagation aux sous-modules (voir « Avancé : Support des sous-modules » pour les détails).

---

## Avancé : Support des sous-modules

Pour les dépôts complexes utilisant des sous-modules Git, la gestion des identités est souvent pénible. Si vous commitez dans un sous-module, Git utilise la configuration locale de ce sous-module, qui peut revenir à votre configuration globale (mauvais email !) si elle n'est pas explicitement définie.

**Git ID Switcher** détecte automatiquement les sous-modules et leur applique l'identité sélectionnée.

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

Cela garantit que votre identité est toujours correcte, que vous commitiez dans le dépôt principal ou dans une bibliothèque vendor.

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

### Mauvaise identité lors du push ?

1. Vérifiez que l'URL distante utilise le bon alias d'hôte :

   ```bash
   git remote -v
   # Devrait afficher git@github-work:... pour les dépôts de travail
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

3. Assurez-vous que l'email dans votre identité correspond à l'email de la clé GPG.

### Identité non détectée ?

- Assurez-vous d'être dans un dépôt Git
- Vérifiez que `settings.json` n'a pas d'erreurs de syntaxe
- Rechargez la fenêtre VS Code (`Cmd+Shift+P` → "Recharger la fenêtre")

### Erreur avec le champ `name` ?

Les caractères suivants dans le champ `name` causeront une erreur :

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Utilisez le champ `service` si vous voulez inclure des informations de service.

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

### Les valeurs par défaut sont vides ?

Si les exemples de paramètres n'apparaissent pas même après une nouvelle installation, **Settings Sync** peut en être la cause.

Si vous avez précédemment sauvegardé des paramètres vides, ils peuvent avoir été synchronisés sur le cloud et écraser les valeurs par défaut lors des nouvelles installations.

**Solution :**

1. Trouvez le paramètre dans l'interface des paramètres
2. Cliquez sur l'icône d'engrenage → « Réinitialiser le paramètre »
3. Synchronisez avec Settings Sync (cela supprime les anciens paramètres du cloud)

---

## Commandes

| Commande                        | Description                    |
| ------------------------------- | ------------------------------ |
| `Git ID: Select Identity`       | Ouvrir le sélecteur d'identité |
| `Git ID: Show Current Identity` | Afficher l'identité actuelle   |

---

## Philosophie de conception

> « Qui suis-je ? » — La seule question à laquelle cette extension répond.

Construite sur l'**Architecture Karesansui** : un noyau simple (100 lignes),
entouré d'une qualité délibérée (90% de couverture, journalisation, timeouts)
et de contraintes intentionnelles (pas d'API GitHub, pas de gestion de tokens).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Lire la philosophie complète](../../DESIGN_PHILOSOPHY.md)

---

## Contribuer

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licence

Licence MIT - voir [LICENSE](../../../LICENSE).

## Crédits

Créé par [Null;Variant](https://github.com/nullvariant)

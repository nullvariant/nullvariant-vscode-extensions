# Git ID Switcher

<table>
  <tr>
    <td align="center" width="150">
      <img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Basculez entre plusieurs identités Git en un clic. Gérez plusieurs comptes GitHub, clés SSH, signature GPG et <b>appliquez automatiquement l'identité aux sous-modules Git</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Langues : <a href="../../../README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <b>🇫🇷</b> <a href="../es/README.md">🇪🇸</a> ... <a href="../../LANGUAGES.md">+20 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://raw.githubusercontent.com/nullvariant/nullvariant-vscode-extensions/main/extensions/git-id-switcher/docs/i18n/fr/demo.png" width="600" alt="Démo">

## Fonctionnalités

- **Changement d'identité en un clic** : Modifiez instantanément Git user.name et user.email
- **Gestion des clés SSH** : Basculez automatiquement les clés SSH dans ssh-agent
- **Support de signature GPG** : Configurez la clé GPG pour signer les commits (optionnel)
- **Support des sous-modules** : Propagez automatiquement l'identité aux sous-modules Git
- **Intégration à la barre d'état** : Voyez toujours votre identité actuelle d'un coup d'œil
- **Info-bulles enrichies** : Informations détaillées avec description et hôte SSH
- **Multi-plateforme** : Fonctionne sur macOS, Linux et Windows
- **Multilingue** : Supporte 17 langues

## 🚀 Pourquoi cette extension ?

Bien qu'il existe de nombreux outils de changement d'identité Git, **Git ID Switcher** résout les problèmes complexes que les autres ignorent souvent :

1. **Le cauchemar des sous-modules** : Lorsque vous travaillez avec des dépôts contenant des sous-modules (thèmes Hugo, bibliothèques vendor, etc.), vous devez généralement définir `git config user.name` manuellement pour *chaque* sous-module. Cette extension gère cela élégamment en appliquant récursivement votre identité à tous les sous-modules actifs.
2. **Gestion SSH et GPG** : Elle ne fait pas que changer votre nom ; elle échange vos clés SSH dans l'agent et configure la signature GPG pour que vous ne committiez jamais avec la mauvaise signature.

## 🌏 Un mot sur le support multilingue

> **Je valorise l'existence des minorités.**
> Je ne veux pas les écarter simplement parce qu'elles sont peu nombreuses.
> Même si les traductions ne sont pas parfaites, j'espère que vous ressentirez notre intention de comprendre et de respecter les langues minoritaires.

Cette extension supporte les 17 langues supportées par VSCode. De plus, pour la documentation README, nous nous efforçons de traduire vers des langues minoritaires et même des langues humoristiques.

Ce n'est pas seulement du « support global » — c'est du « respect pour la diversité linguistique ». Et je serais heureux si cela devient une infrastructure où des commits qui améliorent le monde viennent de développeurs partout, transcendant les barrières linguistiques.

---

## Démarrage rapide

Une configuration typique pour gérer plusieurs comptes GitHub.

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

# Compte GitHub travail
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Étape 3 : Configurer l'extension

Ouvrez les paramètres VS Code (`Cmd+,` / `Ctrl+,`) → recherchez "Git ID Switcher" → cliquez sur "Modifier dans settings.json" :

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Camille Dupont",
      "email": "camille.dupont@personal.example.com",
      "description": "Projets personnels",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Camille Dupont",
      "email": "camille.dupont@company.example.com",
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

# Compte travail
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Persona open source
Host github-oss
    HostName github.com
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
      "icon": "🏠",
      "name": "Camille Dupont",
      "email": "camille.dupont@personal.example.com",
      "description": "Projets personnels",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Camille Dupont",
      "email": "camille.dupont@company.example.com",
      "description": "Compte professionnel",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "oss",
      "icon": "🌟",
      "name": "cdupont-oss",
      "email": "cdupont.oss@example.com",
      "description": "Contributions open source",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "github-oss"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Camille Dupont",
      "email": "camille.dupont@freelance.example.com",
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
| `icon`        |        | Emoji affiché dans la barre d'état (ex: `"💼"`)             |
| `description` |        | Courte description affichée dans le sélecteur et l'info-bulle |
| `sshKeyPath`  |        | Chemin vers la clé SSH privée (ex: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |        | Alias d'hôte SSH (ex: `"github-work"`)                     |
| `gpgKeyId`    |        | ID de clé GPG pour la signature des commits                |

### Paramètres globaux

| Paramètre                         | Par défaut | Description                                    |
| --------------------------------- | ---------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`        | Voir exemple | Liste des configurations d'identités         |
| `gitIdSwitcher.defaultIdentity`   | Voir exemple | ID de l'identité par défaut                  |
| `gitIdSwitcher.autoSwitchSshKey`  | `true`     | Changer automatiquement la clé SSH            |
| `gitIdSwitcher.showNotifications` | `true`     | Afficher une notification lors du changement  |
| `gitIdSwitcher.applyToSubmodules` | `true`     | Propager l'identité aux sous-modules Git      |
| `gitIdSwitcher.submoduleDepth`    | `1`        | Profondeur max pour les sous-modules imbriqués (1-5) |

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

Lors du changement d'identité, l'extension effectue (dans l'ordre) :

1. **Configuration Git** (toujours) : Définit `git config --local user.name` et `user.email`
2. **Clé SSH** (si `sshKeyPath` défini) : Supprime les autres clés de ssh-agent, ajoute celle sélectionnée
3. **Clé GPG** (si `gpgKeyId` défini) : Définit `git config --local user.signingkey` et active la signature
4. **Sous-modules** (si activé) : Propage la configuration à tous les sous-modules (par défaut : profondeur 1)

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

---

## Commandes

| Commande                        | Description                    |
| ------------------------------- | ------------------------------ |
| `Git ID: Select Identity`       | Ouvrir le sélecteur d'identité |
| `Git ID: Show Current Identity` | Afficher l'identité actuelle   |

---

## Contribuer

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licence

Licence MIT - voir [LICENSE](../../LICENSE).

## Crédits

Créé par [Null;Variant](https://github.com/nullvariant)

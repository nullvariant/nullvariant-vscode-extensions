# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Alterne entre múltiplas identidades Git com um clique. Gerencie múltiplas contas GitHub, chaves SSH, assinatura GPG e <b>aplique automaticamente a identidade aos submódulos Git</b>.
      <br><br>
      <a href="https://marketplace.visualstudio.com/items?itemName=nullvariant.git-id-switcher"><img src="https://img.shields.io/visual-studio-marketplace/v/nullvariant.git-id-switcher" alt="VS Code Marketplace"></a>
      <a href="https://open-vsx.org/extension/nullvariant/git-id-switcher"><img src="https://img.shields.io/open-vsx/v/nullvariant/git-id-switcher" alt="Open VSX Registry"></a>
      <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
      <br>
      🌐 Idiomas: <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <b>🇧🇷</b> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> ... <a href="../../LANGUAGES.md">+8 more</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/demo-pt-BR.png" width="600" alt="Demo">

## 🎯 Por que Git ID Switcher?

Embora existam muitos alternadores de identidade Git, o **Git ID Switcher** resolve problemas complexos que outros frequentemente ignoram:

1. **O pesadelo dos submódulos**: Ao trabalhar com repositórios que têm submódulos (temas Hugo, bibliotecas vendor, etc.), normalmente é preciso configurar `git config user.name` manualmente para *cada* submódulo. Esta extensão resolve isso elegantemente aplicando sua identidade recursivamente a todos os submódulos ativos.
2. **Tratamento de SSH e GPG**: Ela não apenas muda seu nome; também troca suas chaves SSH no agent e configura a assinatura GPG para que você nunca faça commit com a assinatura errada.

## Recursos

- **Suporte a submódulos**: Propague automaticamente a identidade para submódulos Git
- **Gerenciamento de chaves SSH**: Alterne automaticamente as chaves SSH no ssh-agent
- **Suporte a assinatura GPG**: Configure a chave GPG para assinar commits (opcional)
- **Troca de identidade com um clique**: Mude Git user.name e user.email instantaneamente
- **Integração na barra de status**: Sempre veja sua identidade atual de relance
- **Tooltips detalhados**: Informações completas com descrição e host SSH
- **Multiplataforma**: Funciona no macOS, Linux e Windows
- **Multilíngue**: Suporta 17 idiomas

## 🌏 Uma nota sobre suporte multilíngue

> **Eu valorizo a existência das minorias.**
> Não quero descartá-las apenas porque são poucas em número.
> Mesmo que as traduções não sejam perfeitas, espero que você possa sentir nossa intenção de entender e mostrar respeito pelas línguas minoritárias.

Esta extensão suporta todos os 17 idiomas que o VSCode suporta. Além disso, para a documentação README, estamos nos desafiando a traduzir para línguas minoritárias e até línguas humorísticas.

Isso não é apenas "suporte global" - é "respeito pela diversidade linguística". E ficaria feliz se isso se tornasse uma infraestrutura onde commits que melhoram o mundo venham de desenvolvedores de todos os lugares, transcendendo barreiras linguísticas.

---

## Início rápido

Uma configuração típica para gerenciar uma conta pessoal e uma conta de trabalho (Enterprise Managed User).

### Passo 1: Preparar chaves SSH

Primeiro, crie chaves SSH para cada conta (pule se já tiver):

```bash
# Pessoal
ssh-keygen -t ed25519 -C "alex.silva@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Trabalho
ssh-keygen -t ed25519 -C "alex.silva@company.example.com" -f ~/.ssh/id_ed25519_work
```

Registre a **chave pública** (arquivo `.pub`) de cada chave na conta GitHub correspondente.

> **Nota**: Registre `id_ed25519_personal.pub` (chave pública) no GitHub. `id_ed25519_personal` (sem extensão) é a chave privada - nunca compartilhe nem faça upload em lugar nenhum.

### Passo 2: Configurar SSH

Edite `~/.ssh/config`:

```ssh-config
# Conta GitHub pessoal (padrão)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Conta GitHub de trabalho (Enterprise Managed User fornecido pela empresa)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Passo 3: Configurar a extensão

Abra as configurações da extensão (`Cmd+,` / `Ctrl+,`) → pesquise "Git ID Switcher" → clique em "Editar em settings.json":

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Silva",
      "email": "alex.silva@personal.example.com",
      "service": "GitHub",
      "description": "Projetos pessoais",
      "sshKeyPath": "~/.ssh/id_ed25519_personal"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Silva",
      "email": "alex.silva@company.example.com",
      "service": "GitHub Trabalho",
      "description": "Conta de trabalho",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

### Passo 4: Usar

1. Clique no ícone de identidade na barra de status (canto inferior direito)
2. Selecione uma identidade
3. Pronto! A configuração Git e a chave SSH foram trocadas.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/quickpick-pt-BR.png" width="600" alt="Quick Pick">

### Usando aliases de host SSH

Ao clonar repos, use o host que corresponde à sua identidade:

```bash
# Para identidade de trabalho (usa o alias github-work)
git clone git@github-work:company/repo.git

# Para identidade pessoal (usa github.com padrão)
git clone git@github.com:asilva/repo.git
```

---

## Opcional: Assinatura GPG

Se você assina commits com GPG:

### Passo 1: Encontrar seu ID de chave GPG

```bash
gpg --list-secret-keys --keyid-format SHORT
```

Exemplo de saída:

```text
sec   ed25519/ABCD1234 2024-01-01 [SC]
      ...
uid         [ultimate] Alex Silva <alex.silva@personal.example.com>
```

O ID da chave é `ABCD1234`.

### Passo 2: Adicionar chave GPG à identidade

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Silva",
      "email": "alex.silva@personal.example.com",
      "service": "GitHub",
      "description": "Projetos pessoais",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "ABCD1234"
    }
  ]
}
```

Ao trocar para esta identidade, a extensão configura:

- `git config user.signingkey ABCD1234`
- `git config commit.gpgsign true`

---

## Exemplo completo: 4 contas com SSH + GPG

Aqui está um exemplo completo combinando tudo:

### Configuração SSH (`~/.ssh/config`)

```ssh-config
# Conta pessoal (padrão)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Conta de trabalho (Enterprise Managed User fornecido pela empresa)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Conta Bitbucket
Host bitbucket.org
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_bitbucket
    IdentitiesOnly yes
```

### Configurações da extensão

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Silva",
      "email": "alex.silva@personal.example.com",
      "service": "GitHub",
      "description": "Projetos pessoais",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "gpgKeyId": "PERSONAL1"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Silva",
      "email": "alex.silva@company.example.com",
      "service": "GitHub Trabalho",
      "description": "Conta de trabalho",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "WORK1234"
    },
    {
      "id": "bitbucket",
      "icon": "🪣",
      "name": "asilva-bb",
      "email": "asilva.bb@example.com",
      "service": "Bitbucket",
      "description": "Projetos Bitbucket",
      "sshKeyPath": "~/.ssh/id_ed25519_bitbucket",
      "sshHost": "bitbucket.org"
    },
    {
      "id": "freelance",
      "icon": "🎯",
      "name": "Alex Silva",
      "email": "alex.silva@freelance.example.com",
      "service": "GitLab",
      "description": "Projetos freelance"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Nota: A última identidade (`freelance`) não tem SSH — ela apenas troca a configuração Git. Isso é útil quando você usa informações de committer diferentes com a mesma conta GitHub.

---

## Referência de configuração

### Propriedades de identidade

| Propriedade   | Obrigatório | Descrição                                                  |
| ------------- | ----------- | ---------------------------------------------------------- |
| `id`          | ✅          | Identificador único (ex: `"work"`, `"personal"`)           |
| `name`        | ✅          | Git user.name - mostrado nos commits                       |
| `email`       | ✅          | Git user.email - mostrado nos commits                      |
| `icon`        |             | Emoji mostrado na barra de status (ex.: `"🏠"`). Apenas um emoji |
| `service`     |             | Nome do serviço (ex: `"GitHub"`, `"GitLab"`). Usado para exibição na UI |
| `description` |             | Descrição curta mostrada no seletor e tooltip              |
| `sshKeyPath`  |             | Caminho para a chave SSH privada (ex: `"~/.ssh/id_ed25519_work"`) |
| `sshHost`     |             | Alias de host SSH (ex: `"github-work"`)                    |
| `gpgKeyId`    |             | ID da chave GPG para assinar commits                       |

#### Limitações de exibição

- **Barra de status**: Texto que exceda ~25 caracteres será truncado com `...`
- **`icon`**: Apenas um único emoji (cluster de grafemas) é permitido. Múltiplos emojis ou strings longas não são suportados

### Configurações globais

| Configuração                           | Padrão      | Descrição                                      |
| -------------------------------------- | ----------- | ---------------------------------------------- |
| `gitIdSwitcher.identities`             | Ver exemplo | Lista de configurações de identidade           |
| `gitIdSwitcher.defaultIdentity`        | Ver exemplo | ID da identidade padrão                        |
| `gitIdSwitcher.autoSwitchSshKey`       | `true`      | Trocar automaticamente a chave SSH             |
| `gitIdSwitcher.showNotifications`      | `true`      | Mostrar notificação ao trocar identidade       |
| `gitIdSwitcher.applyToSubmodules`      | `true`      | Propagar identidade para submódulos Git        |
| `gitIdSwitcher.submoduleDepth`         | `1`         | Profundidade máx. para submódulos aninhados (1-5) |
| `gitIdSwitcher.includeIconInGitConfig` | `false`     | Incluir emoji do ícone no Git config `user.name` |
| `gitIdSwitcher.logging.fileEnabled` | `false` | Habilitar log de auditoria (mudanças de identidade, operações SSH, etc.) |
| `gitIdSwitcher.logging.filePath` | `""` | Caminho do arquivo de log (ex.: `~/.git-id-switcher/security.log`). Vazio = local padrão |
| `gitIdSwitcher.logging.maxFileSize` | `10485760` | Tamanho máx. do arquivo antes da rotação (bytes, 1MB-100MB) |
| `gitIdSwitcher.logging.maxFiles` | `5` | Núm. máx. de arquivos de log em rotação (1-20) |
| `gitIdSwitcher.logging.level` | `"INFO"` | Nível de log: `DEBUG`/`INFO`/`WARN`/`ERROR`/`SECURITY`. Registra o nível selecionado e superiores |
| `gitIdSwitcher.commandTimeouts` | `{}` | Timeout personalizado por comando (ms, 1seg-5min). Ex.: `{"git": 15000, "ssh-add": 10000}` |

#### Sobre `includeIconInGitConfig`

Controla o comportamento quando o campo `icon` está definido:

| Valor | Comportamento |
|-------|---------------|
| `false` (padrão) | `icon` é mostrado apenas na interface do editor. Apenas `name` é gravado na config Git |
| `true` | `icon + name` é gravado na config Git. O emoji aparece no histórico de commits |

Exemplo: `icon: "👤"`, `name: "Alex Silva"`

| includeIconInGitConfig | Git config `user.name` | Assinatura do commit |
|------------------------|------------------------|----------------------|
| `false` | `Alex Silva` | `Alex Silva <email>` |
| `true` | `👤 Alex Silva` | `👤 Alex Silva <email>` |

### Nota: Configuração básica (sem SSH)

Se você não precisa trocar chaves SSH (ex: usando informações de committer diferentes com uma única conta GitHub), você pode usar uma configuração mínima:

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "icon": "🏠",
      "name": "Alex Silva",
      "email": "alex.silva@personal.example.com",
      "description": "Projetos pessoais"
    },
    {
      "id": "work",
      "icon": "💼",
      "name": "Alex Silva",
      "email": "alex.silva@company.example.com",
      "description": "Conta de trabalho"
    }
  ]
}
```

Esta configuração apenas troca `git config user.name` e `user.email`.

---

## Como funciona

### Estrutura de camadas do Git Config

A configuração Git tem três camadas, onde as camadas inferiores sobrescrevem as superiores:

```text
Sistema (/etc/gitconfig)
    ↓ sobrescreve
Global (~/.gitconfig)
    ↓ sobrescreve
Local (.git/config)  ← maior prioridade
```

**Git ID Switcher grava em `--local` (local ao repositório).**

Isso significa:

- A identidade é salva no `.git/config` de cada repositório
- Diferentes identidades podem ser mantidas por repositório
- As configurações globais (`~/.gitconfig`) não são modificadas

### Ao trocar de identidade

Ao trocar de identidade, a extensão faz (em ordem):

1. **Configuração Git** (sempre): Define `git config --local user.name` e `user.email`
2. **Chave SSH** (se `sshKeyPath` definido): Remove outras chaves do ssh-agent, adiciona a selecionada
3. **Chave GPG** (se `gpgKeyId` definido): Define `git config --local user.signingkey` e habilita assinatura
4. **Submódulos** (se habilitado): Propaga configuração para todos os submódulos (padrão: profundidade 1)

### Como funciona a propagação para submódulos

As configurações locais são por repositório, então não se aplicam automaticamente aos submódulos.
Por isso esta extensão fornece propagação para submódulos (veja "Avançado: Suporte a submódulos" para detalhes).

---

## Avançado: Suporte a submódulos

Para repositórios complexos usando submódulos Git, o gerenciamento de identidade geralmente é trabalhoso. Se você faz commit em um submódulo, o Git usa a configuração local desse submódulo, que pode usar a configuração global (email errado!) se não estiver explicitamente definida.

**Git ID Switcher** detecta automaticamente submódulos e aplica a identidade selecionada a eles.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Habilitar/desabilitar este recurso
- `submoduleDepth`: Quão profundo ir?
  - `1`: Apenas submódulos diretos (mais comum)
  - `2+`: Submódulos aninhados (submódulos dentro de submódulos)

Isso garante que sua identidade esteja sempre correta, seja fazendo commit no repo principal ou em uma biblioteca vendor.

---

## Solução de problemas

### Chave SSH não está trocando?

1. Certifique-se de que o `ssh-agent` está rodando:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Verifique se o caminho da chave está correto:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. No macOS, adicione ao Keychain uma vez:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Identidade errada no push?

1. Verifique se a URL remota usa o alias de host correto:

   ```bash
   git remote -v
   # Deve mostrar git@github-work:... para repos de trabalho
   ```

2. Atualize se necessário:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### Assinatura GPG não funciona?

1. Encontre seu ID de chave GPG:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. Teste a assinatura:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Certifique-se de que o email na sua identidade corresponde ao email da chave GPG.

### Identidade não detectada?

- Certifique-se de estar em um repositório Git
- Verifique se `settings.json` não tem erros de sintaxe
- Recarregue a janela do VS Code (`Cmd+Shift+P` → "Recarregar Janela")

### Erro com o campo `name`?

Os seguintes caracteres no campo `name` causarão um erro:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Use o campo `service` se quiser incluir informações do serviço.

```jsonc
// NG
"name": "Alex Silva (Pessoal)"

// OK
"name": "Alex Silva",
"service": "GitHub"
```

### Novas configurações não aparecem?

Após atualizar a extensão, novas configurações podem não aparecer na interface de configurações.

**Solução:** Reinicie completamente sua máquina.

Editores baseados em VS Code armazenam em cache o schema de configurações na memória, e "Recarregar Janela" ou reinstalar a extensão pode não ser suficiente para atualizá-lo.

### Valores padrão estão vazios?

Se as configurações de exemplo não aparecem mesmo após uma instalação limpa, o **Settings Sync** pode ser a causa.

Se você salvou anteriormente configurações vazias, elas podem ter sido sincronizadas para a nuvem e estão sobrescrevendo os valores padrão em novas instalações.

**Solução:**

1. Encontre a configuração na interface de configurações
2. Clique no ícone de engrenagem → "Redefinir Configuração"
3. Sincronize com Settings Sync (isso remove as configurações antigas da nuvem)

---

## Comandos

| Comando                         | Descrição                      |
| ------------------------------- | ------------------------------ |
| `Git ID: Select Identity`       | Abrir o seletor de identidade  |
| `Git ID: Show Current Identity` | Mostrar informações da identidade atual |

---

## Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licença

Licença MIT - veja [LICENSE](../../../LICENSE).

## Créditos

Criado por [Null;Variant](https://github.com/nullvariant)

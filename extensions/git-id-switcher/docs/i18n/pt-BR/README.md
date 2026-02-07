# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Alterne entre vários perfis Git com um clique. Gerencie múltiplas contas GitHub, chaves SSH e assinaturas GPG, e <b>aplique automaticamente os perfis aos submódulos Git</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <b>🇧🇷</b> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <a href="../tr/README.md">🇹🇷</a> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/pt-BR/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Por que Git ID Switcher?

Existem muitas ferramentas para alternar perfis Git, mas o **Git ID Switcher** resolve problemas complexos que outras ferramentas costumam ignorar:

1. **O pesadelo dos submódulos**: Ao trabalhar com repositórios que possuem submódulos (temas Hugo, bibliotecas vendor, etc.), normalmente é necessário configurar `git config user.name` manualmente para _cada_ submódulo. Esta extensão resolve isso elegantemente, aplicando recursivamente o perfil a todos os submódulos ativos.
2. **Gestão de SSH e GPG**: Não apenas muda seu nome — também troca suas chaves SSH no ssh-agent e configura a assinatura GPG, evitando que você faça commits com a assinatura errada.

## Funcionalidades

- **UI de gerenciamento de perfis**: Adicione, edite, exclua e reordene perfis sem editar o settings.json
- **Troca de perfil com um clique**: Altere Git user.name e user.email instantaneamente
- **Integração na barra de status**: Veja seu perfil atual de relance a qualquer momento
- **Suporte a submódulos**: Propague automaticamente o perfil aos submódulos Git
- **Gerenciamento de chaves SSH**: Alterne automaticamente as chaves SSH no ssh-agent
- **Suporte a assinatura GPG**: Configure a chave GPG para assinar commits (opcional)
- **Tooltips detalhados**: Informações completas do perfil, incluindo descrição e host SSH
- **Multiplataforma**: Funciona no macOS, Linux e Windows
- **Multilíngue**: Suporta 17 idiomas

## 🌏 Nosso compromisso com o multilinguismo

> **Eu valorizo a existência das minorias.**
> Não quero descartá-las apenas porque são poucas.
> Mesmo que as traduções não sejam perfeitas, espero que você possa sentir nossa intenção de compreender e mostrar respeito pelas línguas minoritárias.

Esta extensão é compatível com todos os 17 idiomas suportados pelo VS Code. Além disso, para a documentação README, nos desafiamos a traduzir para línguas minoritárias e até para línguas humorísticas.

Isso não é simplesmente «suporte global» — é «respeito pela diversidade linguística». E ficaria feliz se isso se tornasse uma infraestrutura onde commits que melhoram o mundo venham de desenvolvedores de todos os lugares, transcendendo as barreiras do idioma.

---

## Início rápido

Uma configuração típica para alternar entre uma conta pessoal e uma conta corporativa (Enterprise Managed User).

### Passo 1: Preparar as chaves SSH

Primeiro, crie chaves SSH para cada conta (pule se já tiver):

```bash
# Pessoal
ssh-keygen -t ed25519 -C "alex.silva@personal.example.com" -f ~/.ssh/id_ed25519_personal

# Trabalho
ssh-keygen -t ed25519 -C "alex.silva@company.example.com" -f ~/.ssh/id_ed25519_work
```

Registre a **chave pública** (arquivo `.pub`) de cada chave SSH na conta GitHub correspondente.

> **Nota**: O que se registra no GitHub é `id_ed25519_personal.pub` (chave pública). `id_ed25519_personal` (sem extensão) é a chave privada — nunca compartilhe nem faça upload em lugar nenhum.

### Passo 2: Configurar o SSH config

Edite `~/.ssh/config`:

```ssh-config
# Conta GitHub pessoal (padrão)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Conta GitHub de trabalho
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Passo 3: Configurar a extensão

Ao instalar a extensão, perfis de exemplo são disponibilizados.
Siga o guia abaixo para editá-los conforme suas necessidades.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/pt-BR/first-ux.webp" width="600" alt="Configuração inicial (13 passos): abrir o gerenciamento de perfis pela barra de status, editar e criar novos perfis" loading="lazy">

> **Os arquivos de chave não são enviados**: Ao configurar caminhos de chaves SSH, apenas o caminho (localização) do arquivo é registrado. O conteúdo do arquivo de chave nunca é carregado ou transmitido externamente.

> **Se usar assinatura GPG**: Também é possível configurar `gpgKeyId` na tela de edição do perfil.
> Para encontrar seu ID de chave GPG, consulte «[Solução de problemas](#assinatura-gpg-não-funciona)».

> **Dica**: Também é possível configurar diretamente pelo settings.json.
> Abra as configurações da extensão (`Cmd+,` / `Ctrl+,`) → pesquise «Git ID Switcher» → clique em «Editar em settings.json».
> Para exemplos de configuração em formato JSON, consulte «[Exemplo completo](#exemplo-completo-5-contas-com-ssh--gpg)».

---

## Exemplo completo: 5 contas com SSH + GPG

Um exemplo completo combinando todas as funcionalidades:

### Configuração SSH (`~/.ssh/config`)

```ssh-config
# Conta pessoal (padrão)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# Conta de trabalho (Enterprise Managed User emitido pela empresa)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Cliente A – trabalho sob contrato (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Cliente B – projeto presencial (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# Contribuições OSS (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Configurações da extensão

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Alex Silva",
      "email": "alex@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Projetos pessoais",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Alex Silva",
      "email": "alex.silva@techcorp.example.com",
      "service": "GitHub Trabalho",
      "icon": "💼",
      "description": "TechCorp trabalho principal",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Alex Silva",
      "email": "alex@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA contrato",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "A.Silva",
      "email": "a.silva@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB presencial",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "alex-dev",
      "email": "alex.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "Contribuições OSS",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Nota: O 4º perfil (`client-b`) usa um nome abreviado e o 5º (`oss`) usa um handle de desenvolvedor. Você pode definir nomes de exibição diferentes para cada perfil, mesmo para a mesma pessoa.

---

## Gerenciamento de perfis

Clique na barra de status → selecione «Gerenciamento de perfis» na parte inferior da lista para abrir a tela de gerenciamento.
A adição, edição, exclusão e reordenação de perfis podem ser feitas diretamente pela interface.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/pt-BR/identity-management.webp" width="600" alt="Gerenciamento de perfis: guia de exclusão e reordenação" loading="lazy">

Também é possível excluir um perfil pela paleta de comandos com `Git ID Switcher: Delete Identity`.

---

## Comandos

| Comando                                  | Descrição                           |
| ---------------------------------------- | ----------------------------------- |
| `Git ID Switcher: Select Identity`       | Abrir o seletor de perfis           |
| `Git ID Switcher: Delete Identity`       | Excluir um perfil                   |
| `Git ID Switcher: Show Current Identity` | Mostrar informações do perfil atual |
| `Git ID Switcher: Show Documentation`    | Mostrar documentação                |

---

## Referência de configuração

### Propriedades do perfil

| Propriedade   | Obrigatório | Descrição                                                                |
| ------------- | ----------- | ------------------------------------------------------------------------ |
| `id`          | ✅          | Identificador único (ex.: `"personal"`, `"work"`)                        |
| `name`        | ✅          | Git user.name — exibido nos commits                                      |
| `email`       | ✅          | Git user.email — exibido nos commits                                     |
| `icon`        |             | Emoji na barra de status (ex.: `"🏠"`). Apenas um emoji                  |
| `service`     |             | Nome do serviço (ex.: `"GitHub"`, `"GitLab"`). Usado para exibição na UI |
| `description` |             | Descrição breve exibida no seletor e no tooltip                          |
| `sshKeyPath`  |             | Caminho para a chave SSH privada (ex.: `"~/.ssh/id_ed25519_work"`)       |
| `sshHost`     |             | Alias de host SSH (ex.: `"github-work"`)                                 |
| `gpgKeyId`    |             | ID da chave GPG para assinar commits                                     |

#### Limitações de exibição

- **Barra de status**: Texto que exceda ~25 caracteres será truncado com `...`
- **`icon`**: Apenas um emoji (cluster de grafemas) é permitido. Múltiplos emojis ou strings longas não são suportados

### Configurações globais

| Configuração                               | Padrão       | Descrição                                                                                              |
| ------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------ |
| `gitIdSwitcher.identities`                 | Ver exemplos | Lista de configurações de perfis                                                                       |
| `gitIdSwitcher.defaultIdentity`            | Ver exemplos | ID do perfil padrão a ser usado                                                                        |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`       | Trocar automaticamente a chave SSH ao mudar de perfil                                                  |
| `gitIdSwitcher.showNotifications`          | `true`       | Mostrar notificação ao trocar de perfil                                                                |
| `gitIdSwitcher.applyToSubmodules`          | `true`       | Propagar o perfil aos submódulos Git                                                                   |
| `gitIdSwitcher.submoduleDepth`             | `1`          | Profundidade máxima para submódulos aninhados (1-5)                                                    |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`      | Incluir o emoji do ícone no `user.name` do Git config                                                  |
| `gitIdSwitcher.logging.fileEnabled`        | `false`      | Salvar log de auditoria em arquivo (mudanças de perfil, operações SSH, etc.)                           |
| `gitIdSwitcher.logging.filePath`           | `""`         | Caminho do arquivo de log (ex.: `~/.git-id-switcher/security.log`). Vazio = local padrão               |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760`   | Tamanho máximo do arquivo antes da rotação (bytes, 1 MB–100 MB)                                        |
| `gitIdSwitcher.logging.maxFiles`           | `5`          | Número máximo de arquivos de log em rotação (1-20)                                                     |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`      | Quando ativado, todos os valores são mascarados nos logs (máxima privacidade)                          |
| `gitIdSwitcher.logging.level`              | `"INFO"`     | Nível de log (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Registra o nível selecionado e superiores |
| `gitIdSwitcher.commandTimeouts`            | `{}`         | Timeout personalizado por comando (ms, 1 s–5 min). Ex.: `{"git": 15000, "ssh-add": 10000}`             |

#### Sobre `includeIconInGitConfig`

Controla o comportamento quando o campo `icon` está configurado:

| Valor            | Comportamento                                                                         |
| ---------------- | ------------------------------------------------------------------------------------- |
| `false` (padrão) | `icon` é exibido apenas na interface do editor. Apenas `name` é gravado no Git config |
| `true`           | `icon + name` é gravado no Git config. O emoji aparece no histórico de commits        |

Exemplo: `icon: "👤"`, `name: "Alex Silva"`

| includeIconInGitConfig | Git config `user.name` | Assinatura do commit    |
| ---------------------- | ---------------------- | ----------------------- |
| `false`                | `Alex Silva`           | `Alex Silva <email>`    |
| `true`                 | `👤 Alex Silva`        | `👤 Alex Silva <email>` |

---

## Como funciona

### Estrutura de camadas do Git config

A configuração do Git possui três camadas, onde as camadas inferiores sobrescrevem as superiores:

```text
Sistema (/etc/gitconfig)
    ↓ sobrescreve
Global (~/.gitconfig)
    ↓ sobrescreve
Local (.git/config)  ← maior prioridade
```

**Git ID Switcher grava em `--local` (local ao repositório).**

Isso significa:

- O perfil é salvo no `.git/config` de cada repositório
- Diferentes perfis podem ser mantidos por repositório
- As configurações globais (`~/.gitconfig`) não são modificadas

### Comportamento ao trocar de perfil

Ao trocar de perfil, a extensão executa (em ordem):

1. **Git Config** (sempre): Define `git config --local user.name` e `user.email`
2. **Chave SSH** (se `sshKeyPath` configurado): Remove outras chaves do ssh-agent e adiciona a selecionada
3. **Chave GPG** (se `gpgKeyId` configurado): Define `git config --local user.signingkey` e ativa a assinatura
4. **Submódulos** (se ativado): Propaga a configuração para todos os submódulos (padrão: profundidade 1)

### Propagação para submódulos

A configuração local é por repositório, portanto não se aplica automaticamente aos submódulos.
Por isso, esta extensão fornece a funcionalidade de propagação para submódulos (consulte «Avançado: Suporte a submódulos» para mais detalhes).

### Gerenciamento de chaves SSH em detalhes

Git ID Switcher gerencia as chaves SSH por meio do `ssh-agent`:

| Operação        | Comando executado      |
| --------------- | ---------------------- |
| Adicionar chave | `ssh-add <keyPath>`    |
| Remover chave   | `ssh-add -d <keyPath>` |
| Listar chaves   | `ssh-add -l`           |

**Importante:** Esta extensão **não modifica** `~/.ssh/config`. A configuração SSH deve ser feita manualmente (consulte o passo 2 de «Início rápido»).

### Interação com a configuração SSH existente

Se você já possui uma configuração SSH, o Git ID Switcher funciona em coexistência:

| Sua configuração                        | Comportamento do Git ID Switcher                                |
| --------------------------------------- | --------------------------------------------------------------- |
| `~/.ssh/config` com `IdentityFile`      | Ambas são utilizáveis; `IdentitiesOnly yes` evita conflitos     |
| Variável de ambiente `GIT_SSH_COMMAND`  | Seu comando SSH personalizado é usado; ssh-agent continua ativo |
| `git config core.sshCommand`            | Igual ao anterior                                               |
| direnv com variáveis relacionadas a SSH | Coexistência possível; ssh-agent funciona independentemente     |

**Recomendado:** Sempre configure `IdentitiesOnly yes` no seu SSH config. Isso evita que o SSH tente múltiplas chaves.

### Por que `IdentitiesOnly yes`?

Sem essa configuração, o SSH pode tentar as chaves na seguinte ordem:

1. Chaves carregadas no ssh-agent (gerenciadas pelo Git ID Switcher)
2. Chaves especificadas em `~/.ssh/config`
3. Chaves padrão (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519`, etc.)

Isso pode causar falhas de autenticação ou o uso involuntário de uma chave incorreta.

Com `IdentitiesOnly yes`, o SSH utiliza **apenas a chave especificada**. Isso garante que a chave configurada no Git ID Switcher seja usada de forma confiável.

```ssh-config
# Configuração recomendada
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Esta linha é importante
```

Com essa configuração, ao conectar ao host `github-work`, apenas `~/.ssh/id_ed25519_work` é utilizada e nenhuma outra chave é tentada.

---

## Avançado: Suporte a submódulos

Em repositórios complexos com submódulos Git, o gerenciamento de perfis costuma ser problemático. Ao fazer commit em um submódulo, o Git utiliza a configuração local desse submódulo, que pode recorrer à configuração global (e-mail errado!) caso não tenha sido configurada explicitamente.

**Git ID Switcher** detecta automaticamente os submódulos e aplica o perfil selecionado.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Ativa/desativa esta funcionalidade
- `submoduleDepth`: Até que profundidade aplicar?
  - `1`: Apenas submódulos diretos (mais comum)
  - `2+`: Submódulos aninhados (submódulos dentro de submódulos)

Isso garante que seu perfil esteja sempre correto, seja fazendo commit no repositório principal ou em uma biblioteca vendor.

---

## Solução de problemas

### A chave SSH não muda?

1. Certifique-se de que o `ssh-agent` está em execução:

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

### Perfil incorreto ao fazer push?

**Ao clonar um repositório novo:**

Ao clonar repositórios de trabalho, use o alias de host configurado no SSH config:

```bash
# Trabalho (usa o alias github-work)
git clone git@github-work:company/repo.git

# Pessoal (usa github.com padrão)
git clone git@github.com:yourname/repo.git
```

**Para repositórios existentes:**

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

3. Certifique-se de que o e-mail no seu perfil corresponda ao e-mail da chave GPG

### Perfil não detectado?

- Certifique-se de estar dentro de um repositório Git
- Verifique se o `settings.json` não possui erros de sintaxe
- Recarregue a janela do VS Code (`Cmd+Shift+P` → «Recarregar Janela»)

### Erro com o campo `name`?

Os seguintes caracteres no campo `name` causarão um erro:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Se deseja incluir informações do serviço, use o campo `service`.

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

Editores baseados em VS Code armazenam em cache o schema de configurações na memória, e «Recarregar Janela» ou reinstalar a extensão pode não ser suficiente para atualizá-lo.

### Valores padrão (identities, etc.) estão vazios?

Se as configurações de exemplo não aparecem mesmo após uma instalação limpa, o **Settings Sync** pode ser a causa.

Se você salvou anteriormente configurações vazias, elas podem ter sido sincronizadas para a nuvem e estão sobrescrevendo os valores padrão em novas instalações.

**Solução:**

1. Encontre a configuração na interface de configurações
2. Clique no ícone de engrenagem → «Redefinir Configuração»
3. Sincronize com Settings Sync (isso remove as configurações antigas da nuvem)

---

## Filosofia de design

> **Mudar «Quem sou eu»** — A única pergunta que esta extensão responde

Projetada com a **arquitetura Karesansui**: um núcleo simples (100 linhas).
Por isso, o restante pode ser dedicado à qualidade (90% de cobertura, logging, timeouts)
e a restrições deliberadas (sem API do GitHub, sem gerenciamento de tokens).

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Leia a filosofia completa](../../DESIGN_PHILOSOPHY.md)

---

## Contribuindo

Contribuições são bem-vindas! Consulte [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Licença

Licença MIT — consulte [LICENSE](../../../LICENSE).

## Créditos

Criado por [Null;Variant](https://github.com/nullvariant)

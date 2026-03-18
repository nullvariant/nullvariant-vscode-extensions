# Git ID Switcher

<table>
  <tr>
    <td align="center" valign="top" width="150">
      <img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/icon.png" width="128" alt="Git ID Switcher">
    </td>
    <td>
      Tek tıklamayla birden fazla Git profili arasında geçiş yapın. Birden fazla GitHub hesabını, SSH anahtarlarını, GPG imzalamayı yönetin ve <b>profili Git alt modüllerine otomatik olarak uygulayın</b>.
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
      <a href="../../LANGUAGES.md"><img src="https://img.shields.io/badge/🌐_Languages-17+9_more-blue" alt="26 Languages"></a> <a href="../en/README.md">🇺🇸</a> <a href="../ja/README.md">🇯🇵</a> <a href="../zh-CN/README.md">🇨🇳</a> <a href="../zh-TW/README.md">🇹🇼</a> <a href="../ko/README.md">🇰🇷</a> <a href="../de/README.md">🇩🇪</a> <a href="../fr/README.md">🇫🇷</a> <a href="../es/README.md">🇪🇸</a> <a href="../pt-BR/README.md">🇧🇷</a> <a href="../it/README.md">🇮🇹</a> <a href="../ru/README.md">🇷🇺</a> <a href="../pl/README.md">🇵🇱</a> <b>🇹🇷</b> <a href="../cs/README.md">🇨🇿</a> <a href="../hu/README.md">🇭🇺</a> <a href="../bg/README.md">🇧🇬</a> <a href="../uk/README.md">🇺🇦</a> <a href="../eo/README.md">🌍</a> <a href="../haw/README.md">🌺</a> <a href="../ain/README.md">🐻</a> <a href="../ryu/README.md">🐉</a> <a href="../tok/README.md">✨</a> <a href="../tlh/README.md">🖖</a> <a href="../x-lolcat/README.md">🐱</a> <a href="../x-pirate/README.md">🏴‍☠️</a> <a href="../x-shakespeare/README.md">🎭</a>
    </td>
  </tr>
</table>

<br>

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tr/demo.webp" width="600" alt="Demo" loading="lazy">

## 🎯 Neden Git ID Switcher?

Birçok Git profil değiştirici olmasına rağmen, **Git ID Switcher** diğerlerinin genellikle görmezden geldiği karmaşık sorunları çözer:

1. **Alt Modül Kabusu**: Alt modülleri olan depolarla (Hugo temaları, vendor kütüphaneleri vb.) çalışırken, genellikle _her_ alt modül için `git config user.name`'i manuel olarak ayarlamanız gerekir. Bu eklenti, profilinizi tüm aktif alt modüllere özyinelemeli olarak uygulayarak bunu zarif bir şekilde çözer.
2. **SSH ve GPG İşleme**: Sadece adınızı değiştirmez; aynı zamanda ssh-agent'taki SSH anahtarlarınızı değiştirir ve GPG imzalamayı yapılandırır, böylece asla yanlış imzayla commit yapmazsınız.

## Özellikler

- **Profil Yönetimi UI**: settings.json'ı düzenlemeden profil ekleme, düzenleme, silme ve sıralama
- **Tek Tıkla Profil Değiştirme**: Git user.name ve user.email'i anında değiştirin
- **Durum Çubuğu Entegrasyonu**: Mevcut profilinizi her zaman bir bakışta görün
- **Senkronizasyon Kontrolü**: Profil ile git config arasındaki uyumsuzlukları gerçek zamanlı tespit eder ve durum çubuğunda uyarı gösterir
- **Alt Modül Desteği**: Profili Git alt modüllerine otomatik olarak yayın
- **SSH Anahtar Yönetimi**: ssh-agent'ta SSH anahtarlarını otomatik olarak değiştirin
- **GPG İmzalama Desteği**: Commit imzalamak için GPG anahtarını yapılandırın (isteğe bağlı)
- **Zengin Araç İpuçları**: Açıklama ve SSH hostu içeren ayrıntılı profil bilgileri
- **Çapraz Platform**: macOS, Linux ve Windows'ta çalışır
- **Çok Dilli**: 17 dili destekler

## 🌏 Çok Dilli Destek Hakkında Bir Not

> **Azınlıkların varlığına değer veriyorum.**
> Sadece sayıca az oldukları için onları bir kenara atmak istemiyorum.
> Çeviriler mükemmel olmasa bile, azınlık dillerini anlama ve saygı gösterme niyetimizi hissedeceğinizi umuyorum.

Bu eklenti, VS Code'un desteklediği 17 dilin tamamını destekler. Ayrıca README belgeleri için azınlık dillerine ve hatta şaka dillerine çeviri yapmaya kendimizi zorluyoruz.

Bu sadece "küresel destek" değil — "dilsel çeşitliliğe saygı"dır. Ve bu, dil engellerini aşarak dünyanın her yerinden geliştiricilerin dünyayı daha iyi yapan commitleri yaptığı bir altyapı haline gelirse mutlu olurum.

---

## Hızlı Başlangıç

Kişisel hesap ve kurumsal hesap (Enterprise Managed User) yönetmek için tipik bir kurulum.

### Adım 1: SSH Anahtarlarını Hazırlayın

Önce her hesap için SSH anahtarları oluşturun (zaten varsa atlayın):

```bash
# Kişisel
ssh-keygen -t ed25519 -C "deniz@personal.example.com" -f ~/.ssh/id_ed25519_personal

# İş
ssh-keygen -t ed25519 -C "deniz.yilmaz@techcorp.example.com" -f ~/.ssh/id_ed25519_work
```

Her anahtarın **genel anahtarını** (`.pub` dosyası) ilgili GitHub hesabına kaydedin.

> **Not**: GitHub'a `id_ed25519_personal.pub` (genel anahtar) kaydedilir. `id_ed25519_personal` (uzantısız) özel anahtardır — asla kimseyle paylaşmayın veya hiçbir yere yüklemeyin.

### Adım 2: SSH'ı Yapılandırın

`~/.ssh/config` dosyasını düzenleyin:

```ssh-config
# Kişisel GitHub hesabı (varsayılan)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# İş GitHub hesabı
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes
```

### Adım 3: Eklentiyi Yapılandırın

Kurulumdan hemen sonra örnek profiller hazır olarak gelir.
Aşağıdaki kılavuzu izleyerek bunları kendi kullanımınıza göre düzenleyin.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tr/first-ux.webp" width="600" alt="İlk kurulum adımları (13 adım): Durum çubuğundan profil yönetimini açın, düzenleyin ve yeni profil oluşturun" loading="lazy">

> **Anahtar dosyası gönderilmez**: SSH anahtar yolu ayarlandığında, sadece anahtar dosyasının yolu (konumu) kaydedilir. Anahtar dosyasının içeriği asla yüklenmez veya harici bir yere gönderilmez.

> **GPG imzalama kullanıyorsanız**: Profil düzenleme ekranında `gpgKeyId` de ayarlayabilirsiniz.
> GPG anahtar ID'nizi bulmak için "[Sorun Giderme](#gpg-imzalama-çalışmıyor-mu)" bölümüne bakın.

> **İpucu**: Doğrudan settings.json'dan da yapılandırabilirsiniz.
> Eklenti ayarlarını açın (`Cmd+,` / `Ctrl+,`) → "Git ID Switcher" arayın → "settings.json'da Düzenle"ye tıklayın.
> JSON formatında örnek için "[Tam Örnek](#tam-örnek-5-hesap-ve-ssh--gpg)" bölümüne bakın.

---

## Tam Örnek: 5 Hesap ve SSH + GPG

Her şeyi birleştiren tam bir örnek:

### SSH Yapılandırması (`~/.ssh/config`)

```ssh-config
# Kişisel hesap (varsayılan)
Host github-personal
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_personal
    IdentitiesOnly yes

# İş hesabı (şirket tarafından verilen Enterprise Managed User)
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes

# Müşteri A – sözleşmeli iş (Bitbucket)
Host bitbucket-clienta
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clienta
    IdentitiesOnly yes

# Müşteri B – yerinde proje (Bitbucket)
Host bitbucket-clientb
    HostName bitbucket.org
    User git
    IdentityFile ~/.ssh/id_ed25519_clientb
    IdentitiesOnly yes

# OSS katkıları (GitLab)
Host gitlab-oss
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519_oss
    IdentitiesOnly yes
```

### Eklenti Ayarları

```json
{
  "gitIdSwitcher.identities": [
    {
      "id": "personal",
      "name": "Deniz Yılmaz",
      "email": "deniz@personal.example.com",
      "service": "GitHub",
      "icon": "🏠",
      "description": "Kişisel projeler",
      "sshKeyPath": "~/.ssh/id_ed25519_personal",
      "sshHost": "github-personal",
      "gpgKeyId": "ABCD1234EF567890"
    },
    {
      "id": "work-main",
      "name": "Deniz Yılmaz",
      "email": "deniz.yilmaz@techcorp.example.com",
      "service": "GitHub İş",
      "icon": "💼",
      "description": "TechCorp ana iş",
      "sshKeyPath": "~/.ssh/id_ed25519_work",
      "sshHost": "github-work",
      "gpgKeyId": "9876543210FEDCBA"
    },
    {
      "id": "client-a",
      "name": "Deniz Yılmaz",
      "email": "deniz@clienta.example.com",
      "service": "Bitbucket",
      "icon": "🏢",
      "description": "ClientA sözleşme",
      "sshKeyPath": "~/.ssh/id_ed25519_clienta",
      "sshHost": "bitbucket-clienta"
    },
    {
      "id": "client-b",
      "name": "D.Yılmaz",
      "email": "d.yilmaz@clientb.example.com",
      "service": "Bitbucket",
      "icon": "🏭",
      "description": "ClientB yerinde",
      "sshKeyPath": "~/.ssh/id_ed25519_clientb",
      "sshHost": "bitbucket-clientb"
    },
    {
      "id": "oss",
      "name": "deniz-dev",
      "email": "deniz.dev@example.com",
      "service": "GitLab",
      "icon": "🌟",
      "description": "OSS katkıları",
      "sshKeyPath": "~/.ssh/id_ed25519_oss",
      "sshHost": "gitlab-oss"
    }
  ],
  "gitIdSwitcher.defaultIdentity": "personal",
  "gitIdSwitcher.autoSwitchSshKey": true,
  "gitIdSwitcher.applyToSubmodules": true
}
```

Not: 4. profil (`client-b`) kısaltılmış ad, 5. profil (`oss`) geliştirici takma adı kullanır. Aynı kişi için bile her profile farklı görünen ad ayarlayabilirsiniz.

---

## Profil Yönetimi

Durum çubuğuna tıklayın → Listenin altındaki "Profil Yönetimi"ni seçerek yönetim ekranını açın.
Profil ekleme, düzenleme, silme ve sıralama işlemlerinin tümü doğrudan UI'dan yapılabilir.

<img src="https://assets.nullvariant.com/nullvariant-vscode-extensions/extensions/git-id-switcher/images/tr/identity-management.webp" width="600" alt="Profil Yönetimi: Silme ve sıralama işlemleri kılavuzu" loading="lazy">

Profilleri silmek için Komut Paleti'nden `Git ID Switcher: Delete Identity` komutunu da kullanabilirsiniz.

---

## Komutlar

| Komut                                    | Açıklama                       |
| ---------------------------------------- | ------------------------------ |
| `Git ID Switcher: Select Identity`       | Profil seçiciyi aç             |
| `Git ID Switcher: Delete Identity`       | Profil sil                     |
| `Git ID Switcher: Show Current Identity` | Mevcut profil bilgisini göster |
| `Git ID Switcher: Show Documentation`    | Belgeleri göster               |

---

## Yapılandırma Referansı

### Profil Özellikleri

| Özellik       | Gerekli | Açıklama                                                         |
| ------------- | ------- | ---------------------------------------------------------------- |
| `id`          | ✅      | Benzersiz tanımlayıcı (örn: `"personal"`, `"work"`)              |
| `name`        | ✅      | Git user.name — commitlerde gösterilir                           |
| `email`       | ✅      | Git user.email — commitlerde gösterilir                          |
| `icon`        |         | Durum çubuğunda gösterilen emoji (örn: `"🏠"`). Sadece tek emoji |
| `service`     |         | Hizmet adı (örn: `"GitHub"`, `"GitLab"`). UI için                |
| `description` |         | Seçici ve araç ipucunda gösterilen kısa açıklama                 |
| `sshKeyPath`  |         | Özel SSH anahtarının yolu (örn: `"~/.ssh/id_ed25519_work"`)      |
| `sshHost`     |         | SSH yapılandırma host takma adı (örn: `"github-work"`)           |
| `gpgKeyId`    |         | Commit imzalamak için GPG anahtar ID'si                          |

#### Görüntüleme Sınırlamaları

- **Durum çubuğu**: ~25 karakterden uzun metinler `...` ile kısaltılır
- **`icon`**: Sadece tek emoji (grapheme cluster) kullanılabilir. Birden fazla emoji veya uzun metin kullanılamaz

### Genel Ayarlar

| Ayar                                       | Varsayılan | Açıklama                                                                                       |
| ------------------------------------------ | ---------- | ---------------------------------------------------------------------------------------------- |
| `gitIdSwitcher.identities`                 | Örneğe bak | Profil yapılandırmaları listesi                                                                |
| `gitIdSwitcher.defaultIdentity`            | Örneğe bak | Varsayılan profil ID'si                                                                        |
| `gitIdSwitcher.autoSwitchSshKey`           | `true`     | Profil değiştirildiğinde SSH anahtarını otomatik değiştir                                      |
| `gitIdSwitcher.showNotifications`          | `true`     | Profil değiştirildiğinde bildirim göster                                                       |
| `gitIdSwitcher.applyToSubmodules`          | `true`     | Profili Git alt modüllerine uygula                                                             |
| `gitIdSwitcher.submoduleDepth`             | `1`        | İç içe alt modüller için maks. derinlik (1-5)                                                  |
| `gitIdSwitcher.includeIconInGitConfig`     | `false`    | Emoji ikonunu Git config `user.name`'e yaz                                                     |
| `gitIdSwitcher.syncCheck.enabled`          | `true`     | Seçilen profilin gerçek git config ile eşleşip eşleşmediğini kontrol et                        |
| `gitIdSwitcher.syncCheck.onFocusReturn`    | `true`     | Editör penceresi odağı geri aldığında senkronizasyon kontrolü çalıştır                         |
| `gitIdSwitcher.logging.fileEnabled`        | `false`    | Denetim günlüğünü dosyaya kaydet (profil değişiklikleri, SSH işlemleri vb.)                    |
| `gitIdSwitcher.logging.filePath`           | `""`       | Günlük dosyası yolu (örn.: `~/.git-id-switcher/security.log`). Boş = varsayılan konum          |
| `gitIdSwitcher.logging.maxFileSize`        | `10485760` | Döndürmeden önce maks. dosya boyutu (bayt, 1MB-100MB)                                          |
| `gitIdSwitcher.logging.maxFiles`           | `5`        | Döndürülen günlük dosyası maks. sayısı (1-20)                                                  |
| `gitIdSwitcher.logging.redactAllSensitive` | `false`    | Etkinleştirildiğinde, günlüklerdeki tüm değerler maskelenir (maksimum gizlilik)                |
| `gitIdSwitcher.logging.level`              | `"INFO"`   | Günlük düzeyi (`DEBUG`, `INFO`, `WARN`, `ERROR`, `SECURITY`). Seçilen düzey ve üstünü kaydeder |
| `gitIdSwitcher.commandTimeouts`            | `{}`       | Komut başına özel zaman aşımı (ms, 1sn-5dk). Örn.: `{"git": 15000, "ssh-add": 10000}`          |

#### `includeIconInGitConfig` Hakkında

`icon` alanı ayarlandığında davranışı kontrol eder:

| Değer                | Davranış                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| `false` (varsayılan) | `icon` sadece editör UI'da gösterilir. Git config'e sadece `name` yazılır |
| `true`               | Git config'e `icon + name` yazılır. Emoji commit geçmişinde kalır         |

Örnek: `icon: "👤"`, `name: "Deniz Yılmaz"`

| includeIconInGitConfig | Git config `user.name` | Commit imzası             |
| ---------------------- | ---------------------- | ------------------------- |
| `false`                | `Deniz Yılmaz`         | `Deniz Yılmaz <email>`    |
| `true`                 | `👤 Deniz Yılmaz`      | `👤 Deniz Yılmaz <email>` |

---

## Nasıl Çalışır

### Git Config Katman Yapısı

Git yapılandırmasının üç katmanı vardır; alt katmanlar üst katmanlar tarafından geçersiz kılınır:

```text
Sistem (/etc/gitconfig)
    ↓ geçersiz kılar
Global (~/.gitconfig)
    ↓ geçersiz kılar
Yerel (.git/config)  ← en yüksek öncelik
```

**Git ID Switcher `--local` (depo yerel) seviyesine yazar.**

Bu şu anlama gelir:

- Profili her deponun `.git/config` dosyasına kaydeder
- Her depo için farklı profiller tutulabilir
- Global ayarlar (`~/.gitconfig`) değiştirilmez

### Profil Değiştirme Davranışı

Profil değiştirirken, eklenti şunları yapar (sırayla):

1. **Git Yapılandırması** (her zaman): `git config --local user.name` ve `user.email`'i ayarlar
2. **SSH Anahtarı** (`sshKeyPath` ayarlanmışsa): Diğer anahtarları ssh-agent'tan kaldırır, seçileni ekler
3. **GPG Anahtarı** (`gpgKeyId` ayarlanmışsa): `git config --local user.signingkey`'i ayarlar ve imzalamayı etkinleştirir
4. **Alt Modüller** (etkinse): Yapılandırmayı tüm alt modüllere yayar (varsayılan: derinlik 1)
5. **Senkronizasyon Kontrolü**: Uygulanan profilin gerçek git config ile eşleştiğini doğrular

### Senkronizasyon Kontrolü

Seçilen profili gerçek `git config --local` değerleriyle (`user.name`, `user.email`, `user.signingkey`) karşılaştırır ve uyumsuzluk tespit edildiğinde durum çubuğunda uyarı gösterir.

**Kontroller ne zaman çalışır:**

- Profil uygulandıktan hemen sonra
- Çalışma alanı klasörü değiştiğinde
- Yapılandırma değiştiğinde
- Editör penceresi odağı geri aldığında (debounce 500ms)

**Uyumsuzluk tespit edildiğinde:**

- Durum çubuğu uyarı arka plan rengiyle ⚠️ ikonu gösterir
- Araç ipucu uyumsuz alanları gösteren bir tablo görüntüler (alan, beklenen değer, gerçek değer)
- Durum çubuğuna tıklamak çözüm seçeneklerini gösterir:
  - **Profili yeniden uygula** — Mevcut profili git config'e yeniden uygula
  - **Farklı profil seç** — Profil seçiciyi aç
  - **Yoksay** — Bir sonraki kontrole kadar uyarıyı gizle

**Devre dışı bırakma:**

Tüm senkronizasyon kontrollerini devre dışı bırakmak için `gitIdSwitcher.syncCheck.enabled` değerini `false` olarak ayarlayın.
Yalnızca odak dönüşü kontrolünü devre dışı bırakmak için `gitIdSwitcher.syncCheck.onFocusReturn` değerini `false` olarak ayarlayın.

### Alt Modüllere Yayılım Mekanizması

Yerel yapılandırma depo seviyesinde çalıştığından, alt modüllere otomatik olarak uygulanmaz.
Bu nedenle bu eklenti alt modüllere yayılım özelliği sağlar (detaylar için "Gelişmiş: Alt Modül Desteği"ne bakın).

### SSH Anahtar Yönetimi Detayları

Git ID Switcher, SSH anahtarlarını `ssh-agent` aracılığıyla yönetir:

| İşlem           | Çalıştırılan Komut     |
| --------------- | ---------------------- |
| Anahtar ekle    | `ssh-add <keyPath>`    |
| Anahtar sil     | `ssh-add -d <keyPath>` |
| Anahtar listele | `ssh-add -l`           |

**Önemli:** Bu eklenti `~/.ssh/config`'i **değiştirmez**. SSH yapılandırmasını manuel olarak ayarlamanız gerekir ("Hızlı Başlangıç" Adım 2'ye bakın).

### Mevcut SSH Ayarlarıyla Etkileşim

Zaten SSH ayarlarınız varsa, Git ID Switcher şu şekilde davranır:

| Ayarlarınız                                 | Git ID Switcher Davranışı                                             |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `~/.ssh/config`'de `IdentityFile` belirtili | Her ikisi de kullanılabilir; `IdentitiesOnly yes` ile çakışma önlenir |
| `GIT_SSH_COMMAND` ortam değişkeni ayarlı    | Özel SSH komutu kullanılır; ssh-agent çalışmaya devam eder            |
| `git config core.sshCommand` ayarlı         | Yukarıdakiyle aynı                                                    |
| direnv ile SSH ortam değişkenleri ayarlı    | Birlikte çalışabilir; ssh-agent bağımsız çalışır                      |

**Öneri:** SSH config'de her zaman `IdentitiesOnly yes` ayarlayın. Bu, SSH'ın birden fazla anahtar denemesini önler.

### Neden `IdentitiesOnly yes`?

Bu ayar olmadan, SSH şu sırayla anahtar deneyebilir:

1. ssh-agent'a yüklenmiş anahtarlar (Git ID Switcher yönetir)
2. `~/.ssh/config`'de belirtilen anahtarlar
3. Varsayılan anahtarlar (`~/.ssh/id_rsa`, `~/.ssh/id_ed25519` vb.)

Bu, kimlik doğrulama hatalarına veya istenmeyen anahtar kullanımına yol açabilir.

`IdentitiesOnly yes` ayarlandığında, SSH **sadece belirtilen anahtarı** kullanır. Bu, Git ID Switcher'da ayarlanan anahtarın kesinlikle kullanılmasını sağlar.

```ssh-config
# Önerilen yapılandırma
Host github-work
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_work
    IdentitiesOnly yes  # ← Bu satır önemli
```

Bu yapılandırmayla, `github-work` hostuna bağlanırken sadece `~/.ssh/id_ed25519_work` kullanılır ve diğer anahtarlar denenmez.

---

## Gelişmiş: Alt Modül Desteği

Git alt modülleri kullanan karmaşık depolar için profil yönetimi genellikle zahmetlidir. Bir alt modülde commit yaparsanız, Git o alt modülün yerel yapılandırmasını kullanır; açıkça ayarlanmamışsa global yapılandırmaya (yanlış e-posta!) geri dönebilir.

**Git ID Switcher** alt modülleri otomatik olarak algılar ve seçilen profili onlara uygular.

```json
{
  "gitIdSwitcher.applyToSubmodules": true,
  "gitIdSwitcher.submoduleDepth": 1
}
```

- `applyToSubmodules`: Bu özelliği etkinleştir/devre dışı bırak
- `submoduleDepth`: Ne kadar derine gidilsin?
  - `1`: Sadece doğrudan alt modüller (en yaygın)
  - `2+`: İç içe alt modüller (alt modüller içindeki alt modüller)

Bu, ana depoda veya vendor kütüphanesinde commit yapsanız da profilinizin her zaman doğru olmasını sağlar.

---

## Sorun Giderme

### SSH anahtarı değişmiyor mu?

1. `ssh-agent`'ın çalıştığından emin olun:

   ```bash
   eval "$(ssh-agent -s)"
   ```

2. Anahtar yolunun doğru olduğunu kontrol edin:

   ```bash
   ls -la ~/.ssh/id_ed25519_*
   ```

3. macOS'ta Anahtar Zinciri'ne bir kez ekleyin:

   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_work
   ```

### Push'ta yanlış profil mi?

**Yeni klonlama:**

İş depolarını klonlarken, SSH config'de ayarlanan host takma adını kullanın:

```bash
# İş için (github-work takma adını kullanır)
git clone git@github-work:company/repo.git

# Kişisel için (varsayılan github.com kullanır)
git clone git@github.com:yourname/repo.git
```

**Mevcut depolar için:**

1. Uzak URL'nin doğru host takma adını kullandığını kontrol edin:

   ```bash
   git remote -v
   # İş depoları için git@github-work:... göstermeli
   ```

2. Gerekirse güncelleyin:

   ```bash
   git remote set-url origin git@github-work:company/repo.git
   ```

### GPG imzalama çalışmıyor mu?

1. GPG anahtar ID'nizi bulun:

   ```bash
   gpg --list-secret-keys --keyid-format SHORT
   ```

2. İmzalamayı test edin:

   ```bash
   echo "test" | gpg --clearsign
   ```

3. Profilinizdeki e-postanın GPG anahtarının e-postasıyla eşleştiğinden emin olun

### Profil algılanmadı mı?

- Bir Git deposunda olduğunuzdan emin olun
- `settings.json`'da sözdizimi hatası olup olmadığını kontrol edin
- VS Code penceresini yeniden yükleyin (`Cmd+Shift+P` → "Pencereyi Yeniden Yükle")

### `name` alanında hata mı?

`name` alanında aşağıdaki karakterler bulunursa hata oluşur:

`` ` `` `$` `(` `)` `{` `}` `|` `&` `<` `>`

Hizmet adını eklemek istiyorsanız `service` alanını kullanın.

```jsonc
// YANLIŞ
"name": "Deniz Yılmaz (Kişisel)"

// DOĞRU
"name": "Deniz Yılmaz",
"service": "GitHub"
```

### Yeni ayarlar görünmüyor mu?

Eklentiyi güncelledikten sonra bile yeni ayarlar ayarlar ekranında görünmeyebilir.

**Çözüm:** Makinenizi tamamen yeniden başlatın.

VS Code gibi editörler ayar şemasını bellekte önbelleğe alır ve "Pencereyi Yeniden Yükle" veya eklentiyi yeniden yüklemek yeterli olmayabilir.

### Varsayılan değerler (identities vb.) boş mu?

Yeni kurulumda bile örnek ayarlar görünmüyorsa, **Settings Sync** nedeniyle olabilir.

Geçmişte boş ayarlar kaydettiyseniz, bu ayarlar buluta senkronize edilmiş ve yeni kurulumda varsayılan değerleri geçersiz kılmış olabilir.

**Çözüm:**

1. Ayarlar ekranında ilgili ayar öğesini bulun
2. Dişli simgesi → "Ayarı Sıfırla" seçin
3. Settings Sync ile senkronize edin (eski ayarlar buluttan silinir)

---

## Tasarım Felsefesi

> **"Ben kimim"i değiştirmek** — Bu eklentinin yanıtladığı tek soru

**Karesansui Mimarisi** üzerine inşa edilmiştir. Çekirdek 100 satırda yazılabilecek kadar basittir.
Bu sayede geriye kalan kısım kaliteye (90% test, günlükleme, zaman aşımları) ve
bilinçli kısıtlamalara (GitHub API yok, token yönetimi yok) ayrılabilir.

[![Karesansui Architecture](https://img.shields.io/badge/🪨_Karesansui-Architecture-4a5568)](../../DESIGN_PHILOSOPHY.md)

[Tam tasarım felsefesini oku](../../DESIGN_PHILOSOPHY.md)

---

## Katkıda Bulunma

Katkılar memnuniyetle karşılanır! [CONTRIBUTING.md](../../CONTRIBUTING.md)'ye bakın.

## Lisans

MIT Lisansı — [LICENSE](../../../LICENSE)'a bakın.

## Teşekkürler

[Null;Variant](https://github.com/nullvariant) tarafından oluşturuldu

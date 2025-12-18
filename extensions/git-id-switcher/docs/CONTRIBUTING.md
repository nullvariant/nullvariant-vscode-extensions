# Contributing to Git ID Switcher

> **Note**: This is the contribution guide for the Git ID Switcher extension specifically.
> For general repository information, see the [Repository README](../../../README.md).

Thank you for your interest in contributing to Git ID Switcher! This document provides guidelines for translation contributions and new language requests.

## Translation Contributions

### Quality Standards

1. **Accuracy**: Translations should accurately convey the meaning of the original English text
2. **Natural Language**: Use natural, idiomatic expressions in the target language
3. **Consistency**: Maintain consistent terminology throughout the translation
4. **Cultural Adaptation**: Adapt examples to be culturally appropriate (see [Localized Examples](#localized-examples))

### Localized Examples

When translating identity examples in README files, use culturally appropriate names:

| Language | Example Name | Notes |
|----------|--------------|-------|
| English | Alex Smith | Gender-neutral (Alex = Alexander/Alexandra) |
| Japanese | Takahashi Kaoru | Gender-neutral (Kaoru is unisex) |
| Chinese (Simplified) | Zhang Yu | Gender-neutral |
| Chinese (Traditional) | Chen Yu | Gender-neutral |
| Korean | Kim Min | Gender-neutral |
| European languages | Alex + locale surname | e.g., Alex Schmidt (DE), Alex Martin (FR) |

### File Structure

```
docs/
  i18n/
    {language-code}/
      README.md      # Translated README
      demo.png       # Copy from docs/demo.png
```

Language codes follow ISO 639 standards:
- `ja` (Japanese), `de` (German), `fr` (French), etc.
- Special codes: `x-pirate`, `x-lolcat`, `x-shakespeare` (joke languages)

### PR Submission Process

1. **Fork** the repository
2. **Create a branch**: `docs/i18n-{language-code}`
3. **Create your translation** in `docs/i18n/{language-code}/README.md`
4. **Copy demo.png** to your language directory
5. **Update LANGUAGES.md** to add your language
6. **Submit PR** with the title: `docs(i18n): add {Language Name} README`

### Good Translation Examples

Here are examples of well-translated READMEs:

- **Japanese (ja)**: [README.md](i18n/ja/README.md) - Uses natural Japanese with appropriate honorifics
- **German (de)**: [README.md](i18n/de/README.md) - Formal "Sie" style, accurate technical terms
- **French (fr)**: [README.md](i18n/fr/README.md) - Natural French with proper accents
- **Korean (ko)**: [README.md](i18n/ko/README.md) - Appropriate formality level

### Translation Checklist

- [ ] All sections translated
- [ ] Technical terms consistent with VSCode's official translations
- [ ] Identity examples use culturally appropriate names
- [ ] Links to other language READMEs work correctly
- [ ] demo.png copied to language directory
- [ ] LANGUAGES.md updated

---

## New Language Requests

### Requesting a New Language

1. **Open an Issue** with the title: `[i18n] Request: {Language Name}`
2. **Include**:
   - Language name (native and English)
   - ISO 639 language code
   - Whether you can contribute the translation yourself
   - Any cultural considerations

### Language Addition Flow

```
1. Request Issue Created
         |
         v
2. Maintainer Review
   - Is there demand?
   - Is a translator available?
         |
         v
3. Translation Created
   - Follow quality standards
   - Use culturally appropriate examples
         |
         v
4. PR Review & Merge
         |
         v
5. LANGUAGES.md Updated
         |
         v
6. Next Release Includes New Language
```

### Priority Languages

We prioritize languages in this order:

1. **Tier 1**: VSCode-supported languages (17 languages) - Already complete
2. **Tier 2**: Languages with active translator volunteers
3. **Tier 3**: Minority/endangered languages with cultural significance

### Minority Language Guidelines

For minority or endangered languages, we require:

1. **Disclaimer**: A note about translation accuracy (see [Hawaiian README](i18n/haw/README.md))
2. **Cultural Links**: Links to language revitalization resources
3. **Respectful Approach**: No mockery or stereotyping

---

## Code Contributions

For code contributions (not translations), please:

1. Open an issue first to discuss the change
2. Follow the existing code style
3. Include tests if applicable
4. Update documentation as needed

## Questions?

Open an issue with the `question` label or reach out to the maintainers.

---

*Thank you for helping make Git ID Switcher accessible to more people around the world!*

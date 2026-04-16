# Governance

## The Gardener

This garden has one gardener: **Null;Variant**.

All design decisions, feature direction, release timing, and quality standards
are determined by the gardener alone. There is no committee, no vote, no
consensus process. The gardener places every stone.

## The Sekimori-ishi

A [sekimori-ishi](https://www.seattlejapanesegarden.org/blog/tomeishi-stop) is a small
stone tied with rope, placed on a garden path to say: _do not pass beyond here._
In a traditional garden, this is a silent agreement. In this digital garden,
the stones have teeth.

This garden is guarded by several such stones:

| Name                     | What it guards                                             |
| ------------------------ | ---------------------------------------------------------- |
| **CI / Build Check**     | No broken stone enters the garden                          |
| **Branch Protection**    | The main path cannot be altered without passing the gate   |
| **Signed Commits**       | Every placed stone bears the mason's mark                  |
| **Automated Publishing** | When a release tag is placed, the garden opens its gate    |
| **AI Review Agents**     | Tireless apprentices that rake sand patterns day and night |

The AI review agents deserve special mention. They are not gardeners — they
cannot place stones or choose where paths lead. They are **apprentices bound by
[AGENTS.md](AGENTS.md)**: they check sand patterns (lint, types, coverage),
verify stone placement (code review), and report to the gardener. The gardener
makes the final call.

> _Six apprentices live in the gardener's head. They have been taught to rake,_
> _but not to dream._

## Decision Process

1. The gardener decides what to build
2. The apprentices verify it was built correctly
3. The gardener approves and merges

For external contributions:

1. Open an issue or pull request
2. The apprentices will review mechanically
3. The gardener will review aesthetically
4. The gardener merges, or explains why the stone does not belong

## Quality Standard

This garden follows the principle in our [Code of Conduct](CODE_OF_CONDUCT.md):

> _"If it works, it's fine"_ is not welcome here.

Code must be correct, secure, tested, and — yes — beautiful. Every stone follows
the [Karesansui Architecture](extensions/git-id-switcher/docs/DESIGN_PHILOSOPHY.md)
— intentional richness that appears minimal.

## Bus Factor

The bus factor is 1. This is a personal garden, not a public park.

The garden is open source (MIT License), so anyone may fork it and start their
own. But this particular arrangement of stones reflects one person's vision,
and that is by design.

## Contact

To reach the gardener: open an issue on this repository, or see
[SECURITY.md](SECURITY.md) for security-related matters.

## See Also

- [README.md](README.md) — Project overview and quick start
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) — Garden etiquette
- [CONTRIBUTING.md](CONTRIBUTING.md) — How to contribute
- [SECURITY.md](SECURITY.md) — Security policy and vulnerability reporting
- [AGENTS.md](AGENTS.md) — Constraints for AI-assisted contributions

# ArcMenu

This is [@tiagosantosvdl's fork](https://github.com/tiagosantosvdl/ArcMenu) of [upstream ArcMenu](https://gitlab.com/arcmenu/ArcMenu), a GNOME Shell application menu. This fork is maintained by Codex and provides its own extension packages, with integration for the [Dash to Panel fork](https://github.com/tiagosantosvdl/dash-to-panel).

ArcMenu offers multiple menu layouts, application search, pinned applications, system shortcuts, and multi-monitor support. This fork handles delayed Dash to Panel initialization and does not display thank-you, donation, or release notifications.

- Extension UUID: `arcmenu@tiagosantosvdl.github.com`
- Dash to Panel integration UUID: `dash-to-panel@tiagosantosvdl.github.com`
- Supported GNOME Shell versions: **45–51**, as declared in [metadata.json](metadata.json).
- Settings schema: `org.gnome.shell.extensions.arcmenu`, preserving existing preferences.

## Installation

Download the packages from this repository's [GitHub Releases](https://github.com/tiagosantosvdl/ArcMenu/releases). Each release includes an extension ZIP, a Debian package, and `SHA256SUMS`.

Disable any other ArcMenu extension before enabling this fork. Choose one installation method: a per-user extension takes precedence over a system-wide extension with the same UUID.

### Debian / Ubuntu package

For release `70.0.3`, install the downloaded package:

```sh
sudo apt install ./gnome-shell-extension-arcmenu-tiagosantosvdl_70.0.3_all.deb
```

The package declares dependencies on GNOME Shell 45–51, `gir1.2-adw-1`, `gir1.2-gmenu-3.0`, and `libgnome-menu-3-0`. It installs under `/usr/share/gnome-shell/extensions/arcmenu@tiagosantosvdl.github.com/`.

Log out and back in after installation or an upgrade to load the installed code. Enable the extension with:

```sh
gnome-extensions enable arcmenu@tiagosantosvdl.github.com
```

### Per-user ZIP

Install the downloaded ZIP:

```sh
gnome-extensions install --force ./arcmenu@tiagosantosvdl.github.com-70.0.3.zip
```

Install the runtime libraries listed above using your distribution's package manager. Log out and back in, then enable the extension using the same command as for the Debian package.

### Verify downloads

Place `SHA256SUMS` and both release packages in the same directory, then run:

```sh
sha256sum -c SHA256SUMS
```

## Build from source

On Debian / Ubuntu, install the build tools and clone this repository:

```sh
sudo apt install git gettext libglib2.0-bin libglib2.0-dev-bin libxml2-utils make python3 dpkg-dev
git clone https://github.com/tiagosantosvdl/ArcMenu.git
cd ArcMenu
make release VERSION=70.0.3
```

Use the `version-name` in `metadata.json` when setting `VERSION`. Building packages does not install or activate the extension.

For version `70.0.3`, the output is:

- `dist/arcmenu@tiagosantosvdl.github.com-70.0.3.zip`
- `dist/gnome-shell-extension-arcmenu-tiagosantosvdl_70.0.3_all.deb`
- `dist/SHA256SUMS`

To install the local Debian build:

```sh
sudo apt install ./dist/gnome-shell-extension-arcmenu-tiagosantosvdl_70.0.3_all.deb
```

## Development and verification

Source files live in `src/`, menu layouts in `src/menulayouts/`, preferences in `src/settings/`, and tests in `tests/`. Packaging is handled by the [Makefile](Makefile) and [scripts/package-release.py](scripts/package-release.py). Agent guidance is in [AGENTS.md](AGENTS.md).

Run the checks relevant to your change:

```sh
node tests/panel_startup_test.js
python3 -m unittest discover -s tests -p '*test.py'
glib-compile-schemas --strict --dry-run schemas
git diff --check
```

Use `node --check <file>` for changed JavaScript files. If npm is available, install development dependencies with `npm ci` and run `npm run lint:ci`; `npm run lint` applies automatic fixes.

Startup tests use mocked Shell dependencies. Validate desktop behavior separately, including delayed panel creation, both extension enable orders, multiple monitors, and opening the menu with Super.

## Releases

Update `version-name` and increment the integer `version` in `metadata.json`, update version examples in this README, and add notes to [RELEASENOTES.md](RELEASENOTES.md). Release tags must match `version-name`, such as `v70.0.3`.

The [release workflow](.github/workflows/release.yml) validates the source, builds packages, and publishes them when a matching version tag is pushed or a GitHub Release is published. The manual **Run workflow** option builds downloadable artifacts without publishing a release.

Prerelease tags such as `v70.0.3-rc.1` use `version-name` `70.0.3 rc.1`, ZIP version `70.0.3-rc.1`, and Debian version `70.0.3~rc.1`.

## Issues and contributions

Report bugs and request features in this repository's [issue tracker](https://github.com/tiagosantosvdl/ArcMenu/issues). Include your distribution, GNOME Shell version, ArcMenu version, relevant panel extensions and their versions, reproduction steps, and any Shell error logs.

Submit changes through [pull requests](https://github.com/tiagosantosvdl/ArcMenu/pulls), with a description of the behavior changed and verification performed.

## Credits and licensing

This fork builds on ArcMenu by Andrew Zaech, AndyC, Alexander Rüedlinger, and the contributors and translators credited below. AndyC founded ArcMenu in 2017 and created its logo and other icon assets. The ArcMenu layout was inspired by the Zorin OS menu extension, and the code incorporates work from GNOME Shell and GNOME Shell extensions.

- Extension code: GPL-2.0; see [LICENSE](LICENSE).
- ArcMenu logo and icon assets by AndyC: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Fallback category icons include [Ubuntu Yaru](https://github.com/ubuntu/yaru), licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), and [MoreWaita](https://github.com/somepaulo/MoreWaita), licensed under [GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html).

### Contributors

**@Thomas Ingvarsson** | **@[fishears](https://github.com/fishears)** | **@[JasonLG1979](https://github.com/JasonLG1979)** | **@[itmitica](https://github.com/itmitica)** | **@vikaig** | **@MagneFire**

**@tognee** | **@hlechner** | **@vanillajonathan** | **@epskampie** | **@GnomeBook**

**@[charlesg99](https://github.com/charlesg99)** | **@harshadgavali** | **@O. Giesmann ** | **@aleayr **

**@[JasonLG1979](https://github.com/JasonLG1979)**  | **@[lexruee](https://github.com/lexruee)** | **@aleayr** | **@osmancoskun**

**@Balló György**

**@RunasSudo** | **@innovisus** | **@morgan9e**

**@ymt200120**

-----

### Translators

| Language | Translators |
| ------ | ------ |
| **Belarusian** | **@Latgardi** |
| **Brazilian Portuguese** | **@frnogueira, @Z Bed, @perry.werneck** |
| **Catalan** | **@jordim** |
| **Chinese (Taiwan)** | **@plesry** |
| **Czech** | **@jiri.doubravsky, @panmourovaty, @Amerey ** |
| **Danish** | **@cbsvitzer** |
| **Dutch** | **@Vistaus, @vinno97** |
| **Estonian** | **@rimasx** |
| **Finnish** | **@artnay** |
| **French** | **@Nilvus, @steve.kossouho, @D_PETER** |
| **Georgian** | **@papava.e**|
| **German** | **@Etamuk, @daPhipz, @RaceTheMaSe**|
| **Hebrew** | **@omeritzics** |
| **Hungarian** | **@stevendobay, @Balázs Meskó** |
| **Italian** | **@Vombato, @matguidi, @Nicola C.** |
| **Japanese** | **@Hayao0819, @Umoxfo** |
| **Korean** | **@HyeonWol** |
| **Norwegian** | **@sigbjokj, @sssandum** |
| **Occitan** | **@Mejans, @Quentin** |
| **Polish** | **@alex4401, @Karpfly, @Piotr Strebski, @Adam Lewicki** |
| **Russian** | **@Ivan, @Ser82-png, @innovisus** |
| **Silesian** | **@gkkulik** |
| **Simplified Chinese** | **@skygmin, @doufu3344, @wxtewx, @Anduin2017** |
| **Sinhalese** | **@sayuri, @helabasa** |
| **Slovak** | **@prescott66** |
| **Spanish** | **@juanlucer, @pjunyent, @Sergio, @Luis Zurro** |
| **Swedish** | **@MorganAntonsson** |
| **Turkish** | **@aylinux, @Sabri Ünal** |
| **Ukrainian** | **@vikaig, @Denys Nykula** |

-----

### Distribution icons and trademarks

Legal disclaimer for brand icons and trademarks:

*All brand icons are trademarks of their respective owners. The use of these trademarks does not indicate endorsement of the trademark holder by ArcMenu project, nor vice versa. Please do not use brand logos for any purpose except to represent the company, product, or service to which they refer.*

<details>
<summary><b>Read More...</b></summary>


* **UBUNTU ©** - Ubuntu name and Ubuntu logo is a trademark of Canonical © Ltd.

* **FEDORA ©** - Fedora and the Infinity design logo are trademarks of Red Hat, Inc.

* **DEBIAN ©** - is a registered trademark owned by Software in the Public Interest, Inc. Debian trademark is a registered United States trademark of Software in the Public Interest, Inc., managed by the Debian project.

* **MANJARO ©** - (logo) and name is a trademark of Manjaro GmbH & Co. KG

* **POP_OS! ©** - Name and (logo) is a trademark of system 76 © Inc.

* **ARCH LINUX ©** - The stylized Arch Linux logo are recognised trademarks of Arch Linux, copyright 2002-2017 Judd Vinet and Aaron Griffin

* **SOLUS** - name and logo is Copyright © 2014-2018 by Solus Project

* **KALI LINUX** - logo and name is part of © OffSec Services Limited 2020

* **PUREOS** - name and logo is developed by members of the Purism community

* **RASPBERRY PI** © - Logo and name is part of Raspberry Pi Foundation
UK Registered Charity 1129409

* **Gentoo Authors©** 2001–2020
Gentoo is a trademark of the Gentoo Foundation, Inc.

* **Voyager © Linux**
(name) and (logo)

* **MXLinux©** 2020 -
Linux - is the registered trademark of Linus Torvalds in the U.S. and other countries.

* **Red Hat, Inc.©** Copyright 2020
(name) and (logo)

* **ZORIN OS** - The "Z" logomark is a registered trademark of Zorin Technology Group Ltd. Copyright © 2019 - 2021 Zorin Technology Group Ltd

* **Pardus** - Pardus is a trademark of the TUBITAK ULAKBIM. Copyright © 2003–2023 TUBITAK ULAKBIM

* **NixOS** - The logo is made available under a <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY license</a>. Logo designed by Tim Cuthbertson.


</details>

-----

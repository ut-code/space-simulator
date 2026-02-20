# Space Simulator

## 前提条件

[mise](https://mise.jdx.dev/getting-started.html) をインストールしてください。

```sh
curl https://mise.run | sh

echo 'eval "$(~/.local/bin/mise activate bash)"' >> ~/.bashrc # bash
echo 'eval "$(~/.local/bin/mise activate zsh)"' >> ~/.zshrc # zsh
echo '~/.local/bin/mise activate fish | source' >> ~/.config/fish/config.fish # fish
```

設定後、シェルを再起動してください。

## セットアップ

```sh
mise trust
mise install # install command line tools
npm install
```

## 開発

```sh
npm run dev
```

## コマンド集

### Mise

```sh
mise use node@25 # add a program with a version
mise install # install all progarms listed in mise.toml with version in mise.lock

# https://mise.jdx.dev/dev-tools/mise-lock.html
mise upgrade # upgrade packages
mise lock # generate lockfile
```

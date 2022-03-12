# beako-cli
Build tools

## Install

```shell
deno install -fA https://deno.land/x/beako-cli/beako.ts
```

## Usage

Output a single file.

```shell
beako build mod.ts -o script.js
```

Output splitted files.

```shell
beako build script.ts --outdir=public
```

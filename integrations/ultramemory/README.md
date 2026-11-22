# PlatFormula.One UltraMemory adapter

Upstream: https://github.com/win4r/UltraMemory

This is a Python REST adapter, not the memory engine and not a ChatGPT plugin. The upstream service must be installed and running.

Start and test on a machine with Node.js, npm, and Python 3:

```sh
bash integrations/ultramemory/start-and-verify.sh
```

Or run the upstream separately:

```sh
npx @ultramemory/server serve --http --port 1933
python3 integrations/ultramemory/verify_live.py
```

The acceptance test writes a unique marker and verifies immediate retrieval. A pass does not establish restart persistence, multi-agent authorization, or Android deployment.

Set `ULTRAMEMORY_URL` and optionally `ULTRAMEMORY_TOKEN` in the environment. Never expose an unauthenticated local REST service publicly.

**Acceptance status:** adapter source delivered; upstream write/readback and restart persistence are not verified.

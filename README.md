# Free Image to Video skill for Claude and other agents

Free image to video AI with no daily cap: start with no sign-up, keep going on a free account. Every video comes with sound and no watermark. This is the official agent skill for [Free Image to Video](https://freeimagetovideo.ai/?utm_source=github&utm_medium=package): it teaches Claude (and any agent that reads `SKILL.md` skills) to turn a prompt or a photo into a video clip with your own API key.

- Prompt only: [free text to video AI](https://freeimagetovideo.ai/video/free-text-to-video-ai).
- With a public photo URL: [animate a photo](https://freeimagetovideo.ai/video/animate-photo-ai), the photo becomes the first frame.
- Every clip is [image to video AI with sound](https://freeimagetovideo.ai/video/image-to-video-ai-with-sound), on MiniMax H3.

The skill is in [`skills/free-image-to-video/`](skills/free-image-to-video/SKILL.md): a `SKILL.md` plus one zero-dependency Node script (`scripts/fitv.mjs`: `credits`, `submit`, `status`, `wait`). It checks the balance, proposes the run and waits for your yes before it spends anything.

## Install

**Claude Code** (as a plugin):

```bash
claude plugin marketplace add hanshs474/fitv-skill
claude plugin install free-image-to-video@freeimagetovideo
```

**Claude Code / Claude Agent SDK** (copy the folder):

```bash
git clone https://github.com/hanshs474/fitv-skill
cp -r fitv-skill/skills/free-image-to-video ~/.claude/skills/
```

**Claude.ai / Claude Desktop**: zip `skills/free-image-to-video` and upload it under Settings → Capabilities → Skills.

Then set your key: `export FREEIMAGETOVIDEO_API_KEY=sk-...` (create one at [freeimagetovideo.ai/settings/apikeys](https://freeimagetovideo.ai/settings/apikeys)). API runs need a paid plan: each run draws on the plan's daily full-speed allowance, then waits in the relaxed queue ([pricing](https://freeimagetovideo.ai/pricing)).

## Prefer MCP?

The same tools as an MCP server: `npx -y freeimagetovideo-mcp`, or the hosted endpoint `https://freeimagetovideo.ai/api/mcp` with your key as `Authorization: Bearer sk-...`.

## Test

```bash
node --test test/fitv.test.mjs   # mocked API, no network
```

MIT licensed. Made by [Free Image to Video](https://freeimagetovideo.ai/?utm_source=github&utm_medium=package).

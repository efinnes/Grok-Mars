# GrokMars (Unity)

Interactive Juno plus Mars tours. This is the first slice of the colony / terraforming game: fly the globe, listen to Juno, ask her questions. No colony, no combat, no shared dynamo yet.

## Run

1. Double-click `OPEN_PROJECT.bat` (Unity **6000.5.7f1**, same as Alien Forest).
2. First open downloads UniVRM and imports the 8k texture. Wait until the console is quiet.
3. If `Assets/Scenes/GrokMars.unity` is missing: menu **GrokMars → Build Mission Control Scene**.
4. Press Play.

- Right-drag or left-drag empty sky to orbit. Scroll to zoom.
- **Grand / Volcanoes / Landers / Basins** start scripted tours.
- Type `go to Gale`, `tour volcanoes`, or ask a question.
- **Here** repeats the briefing for the current site. **Stop** cancels speech and the tour.

Ollama is optional for buttons and `go to …`. It is required for free-form questions.

## Brain and voice

`Assets/StreamingAssets/config.json` chooses the provider. Default is local and free:

```json
{
  "mode": "local",
  "ollamaUrl": "http://localhost:11434",
  "ollamaModel": "llama3.2",
  "grokModel": "grok-4.6",
  "grokVoiceId": "eve",
  "xaiBaseUrl": "https://api.x.ai/v1"
}
```

| Mode | Brain | Voice |
|---|---|---|
| `"local"` (develop) | Ollama `llama3.2` | Windows SAPI (Zira if installed) |
| `"grok"` (demo) | `grok-4.6` at `https://api.x.ai/v1` | Eve via `POST /v1/tts` |

For demo mode set `mode` to `"grok"` and set the **environment variable** `XAI_API_KEY`. Do not put the key in this repo. If the key is missing, the app falls back to local.

Tours do not need a model. Site coordinates come from the gazetteer, never from the language model.

## Layout

- `Assets/Scripts/Mars` — ellipsoid, sites, camera
- `Assets/Scripts/Tour` — scripted itineraries
- `Assets/Scripts/Juno` — avatar, brain, voice
- `Assets/Scripts/Config` — local vs Grok switch
- `Assets/StreamingAssets/Juno.vrm` — Juno
- `Assets/Textures/8k_mars.jpg` — globe

The old Python viewer is `../GrokMars20.py`.

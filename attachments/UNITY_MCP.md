# Unity MCP for GrokMars

Grok is already configured to talk to Unity at `http://127.0.0.1:8080/mcp`.
This project now includes the same **MCP for Unity** package as Alien Forest.

## Turn it on

1. Let Unity finish importing (`com.coplaydev.unity-mcp`). The spinner in the lower-right must stop.
2. In the Unity menu: **Window → MCP for Unity**
3. Complete the wizard if it appears (Python/uv are already installed from Alien Forest).
4. Click **Start Server** / **Start Bridge**. Status should say connected.
5. Confirm it is listening on **port 8080**.
6. Tell Grok “MCP is running” (or start a new Grok chat and type `/mcps` then **r** to refresh).

Only one Unity project can own port 8080. Close Alien Forest’s MCP window if it is still serving.

## If Start Server is grey / fails

- Keep this Editor open. MCP does not work against a closed project.
- Window → MCP for Unity → Advanced: check the HTTP URL is `http://127.0.0.1:8080/mcp`
- Restart Grok after the server is green.

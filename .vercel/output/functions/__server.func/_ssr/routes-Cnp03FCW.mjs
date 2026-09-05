import { i as __toESM } from "../_runtime.mjs";
import { d as require_react, u as require_jsx_runtime } from "../_libs/@react-three/drei+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cnp03FCW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var gameMod = typeof window !== "undefined" ? import("./game-UKfOZyzo.mjs") : null;
function Home() {
	const [App, setApp] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		gameMod?.then((m) => setApp(() => m.Game));
	}, []);
	if (!App) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex h-dvh flex-col justify-end bg-bg p-6 text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[10px] tracking-[0.28em] text-accent uppercase",
				children: "GrokMars"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl font-semibold",
				children: "Pick the ground"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-md text-sm text-muted",
				children: "Juno flies the planet. You pick a capitol, then keep the bots alive through dust."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-sm text-accent",
				children: "Begin recon"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {});
}
//#endregion
export { Home as component };

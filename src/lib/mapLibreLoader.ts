import mapLibrePackage from "maplibre-gl/package.json";

export type MapLibreEngine = typeof import("maplibre-gl");

const basePath = `/maplibre/${mapLibrePackage.version}`;
const modulePath = `${basePath}/maplibre-gl.mjs`;
let pendingEngine: Promise<MapLibreEngine> | undefined;

// Keep the official ESM files together so the page and module worker can reuse
// the same shared dependency, rather than embedding another copy in a chunk.
export function loadMapLibre(): Promise<MapLibreEngine> {
  if (!pendingEngine) {
    // Start the dependency alongside the engine after the map component loads.
    // The native import then reuses it instead of adding another network wait.
    const shared = document.createElement("link");
    shared.rel = "modulepreload";
    shared.href = `${basePath}/maplibre-gl-shared.mjs`;
    document.head.appendChild(shared);
    pendingEngine = import(/* webpackIgnore: true */ modulePath)
      .then((engine: MapLibreEngine) => {
        engine.setWorkerUrl(`${basePath}/maplibre-gl-worker.mjs`);
        return engine;
      })
      .catch((error: unknown) => {
        pendingEngine = undefined;
        throw error;
      });
  }
  return pendingEngine;
}

import { decodeTimelineData, TIMELINE_INDEX_PATH, type DecodedTimelineData } from "./timelineTransport";

declare global {
  interface Window {
    __bcTimelineIndex?: { path: string; request: Promise<unknown> };
  }
}

// Run while the document is parsed, before hydration. Sharing the actual
// promise avoids a second download in browsers that cannot reuse fetch preloads.
export const TIMELINE_INDEX_BOOTSTRAP = `(function(){var request=fetch(${JSON.stringify(TIMELINE_INDEX_PATH)},{priority:"low"}).then(function(response){if(!response.ok)throw new Error("Timeline request failed");return response.json();});request.catch(function(){});window.__bcTimelineIndex={path:${JSON.stringify(TIMELINE_INDEX_PATH)},request:request};})();`;

let pendingIndex: Promise<DecodedTimelineData> | undefined;

export function loadTimelineIndex(): Promise<DecodedTimelineData> {
  if (!pendingIndex) {
    const early = window.__bcTimelineIndex;
    const request = early?.path === TIMELINE_INDEX_PATH
      ? early.request
      : fetch(TIMELINE_INDEX_PATH).then((response) => {
        if (!response.ok) throw new Error("Timeline request failed");
        return response.json();
      });
    pendingIndex = request.then(decodeTimelineData).catch((error) => {
      pendingIndex = undefined;
      if (window.__bcTimelineIndex?.request === request) delete window.__bcTimelineIndex;
      throw error;
    });
  }
  return pendingIndex;
}

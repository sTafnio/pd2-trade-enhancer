import { unlockSound } from "../notifications/sound";
import { probeBridge } from "../pd2/vue-bridge";
import { createRunMarker } from "../livesearch/poll";
import { clockTime, errorMessage, isMarketPath } from "../utils";
import { onApiMarketPageMounted, runApiLivesearch } from "./api-livesearch";
import { setStatus, showStartButton, showStopButton } from "./livesearch-ui";
import type { StatusTone } from "./livesearch-ui";

const LOG = "[pd2-trade-enhancer]";

const marker = createRunMarker("pd2te-livesearch-running", "Livesearch", "Start");

interface Run {
  controller: AbortController;
  finalStatus: [string, StatusTone] | null; // why it stopped; stays in the status line until the next Start
}

let run: Run | null = null;

export const isLivesearchRunning = () => run !== null;

export const onStartButtonPress = () => {
  if (run) return;

  unlockSound(); // user gesture: loads the alert sound so the first hit plays right away
  const current: Run = { controller: new AbortController(), finalStatus: null };
  run = current;
  marker.set(true);
  showStopButton();
  setStatus("Starting...");
  void livesearch(current);
};

// Also called by the filter column: a Search, Clear or Load while running stops the livesearch, so it never
// silently switches to filters the user hasn't looked at
export const stopLivesearch = (reason: string) => {
  if (!run) return;
  run.finalStatus ??= [reason, "info"];
  run.controller.abort(); // every wait resolves on abort; livesearch()'s finally cleans up
  showStartButton();
};

export const onStopButtonPress = () => stopLivesearch(`Stopped at ${clockTime()}`);

// Livesearch runs only while /market is open: leaving it (another market tab, any other page of the site)
// stops it, so nothing keeps running unseen. A background browser tab still counts as open.
export const stopLivesearchOffPage = () => {
  if (run && !isMarketPath()) stopLivesearch(`Stopped at ${clockTime()}: you left the Trade page`);
};

// Called by tradeOnLoad on every /market mount (including coming back via SPA navigation)
export const onMarketPageMounted = () => {
  if (run) {
    onApiMarketPageMounted();
    return;
  }
  marker.reportLost(setStatus);
};

const livesearch = async (current: Run) => {
  const { controller } = current;
  const { signal } = controller;

  try {
    const problem = probeBridge();
    if (problem !== null) {
      console.warn(`${LOG} Livesearch can't start: ${problem}.`);
      current.finalStatus ??= ["Can't start: the site's app isn't reachable (see console)", "error"];
      return;
    }

    console.info(`${LOG} Livesearch started.`);
    if ((await runApiLivesearch(signal)) === "unavailable" && !signal.aborted) {
      console.warn(`${LOG} Livesearch stopped: the page's search never reached the site's API client.`);
      current.finalStatus ??= ["Stopped: couldn't capture the page's search (see console)", "error"];
    }
  } catch (error) {
    console.error(`${LOG} Livesearch stopped after an error:`, error);
    current.finalStatus ??= [`Stopped: ${errorMessage(error)} (see console)`, "error"];
  } finally {
    controller.abort();
    if (run === current) {
      run = null;
      marker.set(false);
      showStartButton();
      setStatus(...(current.finalStatus ?? ["Stopped", "info"]));
    }
    console.info(`${LOG} Livesearch stopped.`);
  }
};

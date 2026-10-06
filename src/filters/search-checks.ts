// The page's own market searches that the server can't answer alone, changed before they go out: sums
// (sum-search.ts, which also covers "Ignore socketed jewels/runes" when both are on) and that checkbox on its
// own (socketed-search.ts). Every other search goes out untouched.
import { setPageQueryRewriter } from "../pd2/vue-bridge";
import { socketedRewrite } from "./socketed-search";
import { sumRewrite } from "./sum-search";

const LOG = "[pd2-trade-enhancer]";

// Called on every /market mount
export const installSearchChecks = () => {
  if (!setPageQueryRewriter((query) => sumRewrite(query) ?? socketedRewrite(query))) {
    console.warn(`${LOG} Couldn't hook the page's search: sums and "Ignore socketed jewels/runes" won't narrow the results.`);
  }
};

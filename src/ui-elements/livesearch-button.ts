import { html } from "../utils";

// Start Button
export const startButton = html<HTMLButtonElement>(/*html*/ `
<button id="lsStartButton" class="ls-btn start-btn" type="button">
    <span id="startButtonSpan">Start</span>
</button>
`);

// Stop Button
export const stopButton = html<HTMLButtonElement>(/*html*/ `
<button id="lsStopButton" class="ls-btn stop-btn" type="button"
    title="Stop livesearch. Leaving this page stops it too.">
    <span id="stopButtonSpan">Stop</span>
</button>
`);

// Status line: last check, next check, errors, why it stopped. Empty it keeps its line, so the panel
// below doesn't jump when the first status arrives
export const statusLine = html(/*html*/ `<div id="lsStatus" class="ls-status pd2te-holds-line"></div>`);

// Holds whichever button is showing, with the status line under it
export const controls = html(/*html*/ `<div id="lsControls" class="ls-controls pd2te-own"></div>`);
controls.append(statusLine);

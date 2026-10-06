import { html } from "../utils";

// Settings Panel
export const settingsPanel = html(/*html*/ `
<div class="settings-panel pd2te-own">
    <div id="lsSettingsHeader" class="settings-panel-header">
        <h2 class="settings-panel-heading">
            Settings</h2>
        <svg id="openSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            class="settings-panel-svg">
            <path fill-rule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clip-rule="evenodd">
            </path>
        </svg>
        <svg id="closeSVG" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
            class="settings-panel-svg pd2te-hidden">
            <path fill-rule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path>
        </svg>
    </div>
    <div id="lsSettingsPanel" class="settings-content pd2te-hidden">
        <div class="name-container">
            <input id="searchName" class="name-input" type="text" placeholder="Rename Tab" autocomplete="new-password"
                maxlength="30">
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Delay</h2>
            <div class="settings-option-input-container"> <input id="delayInput" class="settings-option-input"
                    type="number" step="1">
            </div>
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Volume</h2>
            <div class="settings-option-input-container"> <input id="volumeInput" class="settings-option-input"
                    type="range">
            </div>
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Results per page</h2>
            <div class="settings-option-input-container"> <input id="pageSizeInput" class="settings-option-input"
                    type="number" step="10" title="Listings per results page on /market (the site's own is 10)">
            </div>
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Compact cards</h2>
            <div class="settings-option-input-container"> <input id="compactCardsInput"
                    class="settings-option-checkbox" type="checkbox" title="The site's compact card layout">
            </div>
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Card timestamps</h2>
            <div class="settings-option-input-container"> <input id="cardTimesInput"
                    class="settings-option-checkbox" type="checkbox"
                    title="Show when a listing was listed and last edited, when that differs from its bump time">
            </div>
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Show query</h2>
            <div class="settings-option-input-container"> <input id="showQueryInput"
                    class="settings-option-checkbox" type="checkbox" title="Show the query the filters compile to, under Search">
            </div>
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Sort filters A-Z</h2>
            <div class="settings-option-input-container"> <input id="autoSortFiltersInput"
                    class="settings-option-checkbox" type="checkbox"
                    title="Keep your saved filters in name order on the server, so every list of them (here, the Filters page, the site's own panel) shows them A-Z. New and renamed filters go straight to their place; filters out of place are moved when this page or the Filters page opens">
            </div>
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Enhanced filters</h2>
            <div class="settings-option-input-container"> <input id="enhancedFiltersInput"
                    class="settings-option-checkbox" type="checkbox"
                    title="Replace the site's filter panels with the script's own. Off: the site's panels, as a fallback if something breaks">
            </div>
        </div>
        <div class="settings-option-container">
            <h2 class="settings-option-header">
                Desktop alerts</h2>
            <div class="settings-option-input-container"> <input id="desktopNotificationsInput"
                    class="settings-option-checkbox" type="checkbox"
                    title="Show a desktop notification for new listings while this tab isn't in view">
            </div>
        </div>
    </div>
    <div id="lsRecentHits" class="recent-hits pd2te-hidden">
        <div class="recent-hits-header">
            <h2 class="settings-option-header">
                Recent Hits</h2>
            <button id="lsClearHits" class="recent-hits-clear" type="button">Clear</button>
        </div>
        <ol id="lsRecentHitsList" class="recent-hits-list"></ol>
    </div>
</div>
`);

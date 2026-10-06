// ==UserScript==
// @name         pd2-trade-enhancer
// @namespace    https://github.com/sTafnio/pd2-trade-enhancer
// @version      1.0.0
// @author       sTafnio
// @description  Userscript to enhance the Project Diablo 2 trade website
// @icon         https://projectdiablo2.com/image/portal.png
// @downloadURL  https://raw.githubusercontent.com/sTafnio/pd2-trade-enhancer/main/dist/pd2-trade-enhancer.user.js
// @match        https://www.projectdiablo2.com/*
// @match        https://projectdiablo2.com/*
// @sandbox      raw
// @grant        GM_addStyle
// @grant        GM_notification
// @grant        window.focus
// @inject-into  auto
// @noframes
// ==/UserScript==

(function() {
	"use strict";
	var s = new Set();
	var _css = async (t) => {
		if (s.has(t)) return;
		s.add(t);
		((c) => {
			if (typeof GM_addStyle === "function") GM_addStyle(c);
			else (document.head || document.documentElement).appendChild(document.createElement("style")).append(c);
		})(t);
	};
	_css(".filters:has(>#filters){max-width:380px}#filters.pd2te-replaced>:not(.pd2te-own){display:none!important}.ls-btn{cursor:pointer;color:#000000bf;text-shadow:1px 1px #ffffff26;text-transform:uppercase;-webkit-text-stroke-color:#0f0f0f;-webkit-text-stroke-width:1px;border-bottom:3px solid #00000040;border-right:2px solid #00000040;border-radius:4px;justify-content:center;align-items:center;height:34px;margin-bottom:.5rem;padding:4px 8px;font-family:Diablo;font-size:20px;display:flex;position:relative;box-shadow:inset 1px 3px #ffffff1a}.start-btn{background-color:#0d8727}.start-btn:hover{background-color:#0d6e23}.stop-btn{background-color:#aa2800}.stop-btn:hover{background-color:#862000}.ls-controls{flex-direction:column;display:flex}.ls-status{color:#9ca3af;overflow-wrap:anywhere;text-align:center;margin:-.25rem 0 .75rem;font-size:13px;line-height:1.3}.ls-status[data-tone=warn]{color:#d4af37}.ls-status[data-tone=error]{color:#f87171}.pd2te-create-panel{flex-direction:column;gap:.5rem;margin-bottom:1rem;display:flex}.pd2te-create-row{align-items:center;gap:.5rem;display:flex}.pd2te-create-btn{min-width:120px;margin-bottom:0;font-size:16px}.pd2te-create-btn:disabled{cursor:not-allowed;opacity:.5}.pd2te-price-input{flex:.5 1 0;min-width:0;height:34px}.pd2te-create-panel .pd2te-create-status{text-align:left;flex:1;margin:0}.bump-button-container.pd2te-busy{opacity:.4;pointer-events:none}.settings-panel{color:#ffffffa6;background:#000000a6;border:2px solid #646464;margin-bottom:1.5rem;box-shadow:1px 3px 8px 2px #000000a6}.settings-panel-header{cursor:pointer;background-color:#00000059;justify-content:space-between;padding:6px 12px;display:flex}.settings-panel-heading{color:#ffffffbf;text-transform:uppercase;margin-right:.5rem;font-family:Diablo;font-size:20px;line-height:22px}.opened{border-bottom:2px solid #646464}.pd2te-hidden{display:none!important}.pd2te-invisible{visibility:hidden}.pd2te-holds-line:empty:before{content:\"\xA0\"}.settings-panel-svg{--tw-text-opacity:1;color:#9ca3af;width:1.5rem;margin-top:-.25rem}.settings-content{color:#d1d5db;flex-direction:column;gap:.5rem;padding:10px 12px;font-size:14px;display:flex}.name-container{text-align:center;flex-direction:column;margin-bottom:0;display:flex}.name-input{color:#d1d5db;text-align:center;background-color:#191919;border:1px solid #4b4b4b;border-radius:4px;padding:3px 6px;font-size:14px}.settings-option-container{align-items:center;display:flex}.settings-option-header{color:#9ca3af;letter-spacing:.02em;text-transform:uppercase;text-align:left;width:60%;font-family:Diablo;font-size:13px}.settings-option-input-container{text-align:center;flex-direction:column;width:40%;display:flex}.settings-option-input{appearance:none;color:#d1d5db;text-align:center;background-color:#191919;border:1px solid #4b4b4b;border-radius:4px;padding:3px 6px;font-size:14px}.settings-option-checkbox{cursor:pointer;align-self:center;width:15px;height:15px}.pd2te-gone .item,.pd2te-gone .meta>.flex:first-child{opacity:.45}.pd2te-gone-badge{color:#f87171;text-transform:uppercase;margin-left:.75rem;font-family:Diablo;font-size:13px}.pd2te-exchange-live{align-items:center;gap:.75rem;margin:.75rem 0 0 .5rem;display:flex}.pd2te-exchange-btn{min-width:140px;margin-bottom:0}.pd2te-exchange-info{flex-direction:column;min-width:0;font-size:13px;display:flex}.pd2te-exchange-watched{color:#d1d5db;overflow-wrap:anywhere}.pd2te-exchange-live .ls-status{text-align:left;margin:0}.recent-hits{border-top:2px solid #646464;padding:8px 12px;font-size:13px}.recent-hits-header{justify-content:space-between;align-items:center;display:flex}.recent-hits-clear{color:#9ca3af;cursor:pointer;text-transform:uppercase;font-size:14px}.recent-hits-clear:hover{color:#ffffffbf}.recent-hits-list{max-height:180px;font-size:14px;overflow-y:auto}.recent-hits-list a{color:#60a5fa;text-overflow:ellipsis;white-space:nowrap;display:block;overflow:hidden}.recent-hits-list a:hover{color:#2563eb}.bump-button-container{border:12px solid #0000;margin:-12px;display:inline-block}.bump-svg{--tw-text-opacity:1;color:#60a5fa;cursor:pointer;stroke-width:2px;stroke:currentColor;fill:none;width:1.5rem;margin-right:.5rem}.bump-svg:hover{color:#2563eb}.pd2te-filters{color:#d1d5db;flex-direction:column;gap:.5rem;font-size:14px;display:flex}.pd2te-toolbar{flex-direction:column;gap:.35rem;display:flex}.pd2te-toolbar .pd2te-row>.ls-btn{flex:1;margin-bottom:0}.pd2te-toolbar .pd2te-row>.pd2te-link-btn{color:#d1d5db;background-color:#3a3a3a;flex:none;width:42px;padding:0}.pd2te-toolbar .pd2te-row>.pd2te-link-btn:hover{color:#fff;background-color:#4b4b4b}.pd2te-link-btn svg{width:20px;height:20px}.pd2te-gold-btn{background-color:#b8860b}.pd2te-gold-btn:hover{background-color:#9a7009}.pd2te-panel{background:#000000a6;border:2px solid #646464;box-shadow:1px 3px 8px 2px #000000a6}.pd2te-panel-header{cursor:pointer;-webkit-user-select:none;user-select:none;background-color:#00000059;align-items:center;gap:.5rem;padding:6px 12px;display:flex}.pd2te-panel-header.open{border-bottom:2px solid #646464}.pd2te-panel-title{color:#ffffffbf;text-transform:uppercase;flex:1;font-family:Diablo;font-size:20px;line-height:22px}.pd2te-panel-toggle{color:#9ca3af;font-size:20px;line-height:1}.pd2te-panel-body{flex-direction:column;gap:.5rem;padding:10px 12px;display:flex}.pd2te-field{flex-direction:column;gap:.25rem;min-width:0;display:flex}.pd2te-label{color:#9ca3af;letter-spacing:.02em;text-align:center;text-transform:uppercase;font-family:Diablo;font-size:13px}.pd2te-row{align-items:center;gap:.35rem;display:flex}.pd2te-row>.pd2te-input{flex:1;min-width:0}.pd2te-grid2{grid-template-columns:repeat(2,minmax(0,1fr));gap:.35rem .5rem;display:grid}.pd2te-grid2>.pd2te-btn{grid-column:1/-1}.pd2te-input{color:#d1d5db;background-color:#191919;border:1px solid #4b4b4b;border-radius:4px;width:100%;padding:3px 6px;font-size:14px}.pd2te-input:focus{border-color:#9ca3af;outline:none}.pd2te-input.pd2te-invalid{border-color:#f87171}.pd2te-number{appearance:textfield;text-align:center}select.pd2te-input{cursor:pointer}textarea.pd2te-input{resize:vertical;min-height:90px;font-family:monospace;font-size:12px}.pd2te-btn{color:#d1d5db;cursor:pointer;white-space:nowrap;background-color:#2b2b2b;border:1px solid #4b4b4b;border-radius:4px;padding:3px 10px;font-size:14px}.pd2te-btn:hover{color:#fff;background-color:#3a3a3a}.pd2te-btn:disabled{cursor:default;opacity:.5}.pd2te-btn-small{padding:2px 8px}.pd2te-btn-danger{color:#f87171}.pd2te-check-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:.15rem .5rem;display:grid}.pd2te-check{cursor:pointer;text-overflow:ellipsis;white-space:nowrap;align-items:center;gap:.35rem;min-width:0;display:flex;overflow:hidden}.pd2te-checkbox{cursor:pointer;flex:none;width:15px;height:15px}.pd2te-multi{flex-direction:column;gap:.35rem;display:flex}.pd2te-chips{flex-wrap:wrap;gap:.25rem;display:flex}.pd2te-chips:empty{display:none}.pd2te-chip{background-color:#1f2937;border:1px solid #374151;border-radius:999px;align-items:center;gap:.25rem;max-width:100%;padding:1px 4px 1px 8px;font-size:13px;display:inline-flex}.pd2te-chip-text{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.pd2te-chip-remove{color:#9ca3af;cursor:pointer;padding:0 3px;font-size:15px;line-height:1}.pd2te-chip-remove:hover{color:#f87171}.pd2te-picker{gap:.35rem;display:flex}.pd2te-picker-input{flex:1;min-width:0}.pd2te-mod{border:1px solid #374151;border-radius:4px;flex-direction:column;gap:.3rem;padding:6px;display:flex}.pd2te-mod-head{align-items:center;gap:.35rem;display:flex}.pd2te-mod-name{text-overflow:ellipsis;white-space:nowrap;flex:1;font-size:13px;overflow:hidden}.pd2te-group{border:1px solid #4b5563;border-radius:4px;flex-direction:column;gap:.4rem;padding:8px;display:flex}.pd2te-group-head{flex-wrap:wrap;align-items:center;gap:.35rem;display:flex}.pd2te-group-head select{width:auto}.pd2te-sum-total{flex:1;min-width:0}.pd2te-sum-term{border:1px solid #374151;border-radius:4px;align-items:center;gap:.35rem;padding:4px 6px;display:flex}.pd2te-sum-times{color:#9ca3af;font-size:13px}.pd2te-input.pd2te-sum-weight{flex:0 0 4.5rem;width:4.5rem}.pd2te-spacer{flex:1}.pd2te-hint{color:#9ca3af;text-align:center;font-size:12px}.pd2te-preview{color:#9ca3af;white-space:pre-wrap;word-break:break-all;background-color:#0f0f0f;border:1px solid #4b4b4b;border-radius:4px;max-height:260px;margin:0;padding:6px;font-size:11px;overflow:auto}.pd2te-card-btn{margin-right:.5rem}.pd2te-item-filter{color:#d1d5db;background:#0000008c;border-top:2px solid #646464;flex-direction:column;gap:.5rem;padding:8px 12px;font-size:13px;display:flex}.pd2te-item-filter-head{justify-content:space-between;align-items:center;display:flex}.pd2te-item-filter-title{color:#ffffffbf;text-transform:uppercase;font-family:Diablo;font-size:18px}.pd2te-item-section{flex-direction:column;gap:.2rem;display:flex}.pd2te-item-row{align-items:center;gap:.5rem;display:flex}.pd2te-item-row .pd2te-check{white-space:normal;flex:1}.pd2te-item-row .pd2te-number{flex:none;width:72px}.pd2te-item-actions{flex-wrap:wrap;justify-content:flex-end}.pd2te-picker{position:relative}.pd2te-dropdown{z-index:60;background-color:#111;border:1px solid #4b4b4b;border-radius:4px;max-height:240px;font-size:13px;position:absolute;top:calc(100% + 2px);left:0;right:0;overflow-y:auto;box-shadow:0 6px 16px #0009}.pd2te-dropdown-row{cursor:pointer;text-overflow:ellipsis;white-space:nowrap;padding:3px 8px;overflow:hidden}.pd2te-dropdown-row:hover,.pd2te-dropdown-row.active{color:#fff;background-color:#374151}.pd2te-dropdown-note{color:#9ca3af;padding:3px 8px;font-size:12px}.pd2te-dropdown-row.pd2te-current{color:#d4af37}.pd2te-row>.pd2te-picker{flex:1;min-width:0}.pd2te-unsaved{color:#d4af37;white-space:nowrap;font-size:12px}.pd2te-filters-bar{color:#d1d5db;flex-wrap:wrap;align-items:center;gap:.5rem 1rem;margin-bottom:1rem;font-size:14px;display:flex}.pd2te-filters-bar .ls-status{text-align:left;margin:0}.pd2te-autosort .drag-handle{display:none!important}.pd2te-card-times{color:#9ca3af;flex-wrap:wrap;align-items:center;gap:.25rem .75rem;font-size:13px;display:inline-flex}.pd2te-card-time:before{content:\"· \";color:#6b7280}.pd2te-socket-note{color:#9ca3af;white-space:nowrap;margin-left:.4rem;font-size:12px}.pd2te-sum-line{color:#e5c07b;margin-top:.35rem;font-size:13px}.property:has(>.pd2te-socket-only)>span:first-child{color:#6b7280}.pd2te-live-note{margin:-.25rem 0 .25rem}");
	var all = (selector, root = document) => [...root.querySelectorAll(selector)];
	var IMPORTANT_ELEMENTS = [{
		id: "filters",
		find: () => all("div.filters > div")
	}];
	var sleep = (ms, ...signals) => new Promise((resolve) => {
		const active = signals.filter((signal) => signal !== void 0);
		if (active.some((signal) => signal.aborted)) return resolve();
		const finish = () => {
			clearTimeout(timeoutId);
			active.forEach((signal) => signal.removeEventListener("abort", finish));
			resolve();
		};
		const timeoutId = setTimeout(finish, Math.max(0, ms));
		active.forEach((signal) => signal.addEventListener("abort", finish, { once: true }));
	});
	var isMarketPath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market";
	var isCreatePath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market/create";
	var isManagePath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market/manage";
	var isExchangePath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market/exchange";
	var isFiltersPath = (path = window.location.pathname) => path.replace(/\/+$/, "") === "/market/filters";
	var clockTime = (ms = Date.now()) => new Date(ms).toLocaleTimeString();
	var sortKeys = (value) => {
		if (Array.isArray(value)) return value.map(sortKeys);
		if (value === null || typeof value !== "object" || value instanceof Date) return value;
		const record = value;
		return Object.fromEntries(Object.keys(record).sort().map((key) => [key, sortKeys(record[key])]));
	};
	var stableStringify = (value) => JSON.stringify(sortKeys(value)) ?? "";
	var html = (markup) => {
		const template = document.createElement("template");
		template.innerHTML = markup.trim();
		return template.content.firstElementChild;
	};
	var errorMessage = (error) => {
		if (error instanceof Error) return error.message;
		if (typeof error === "object" && error !== null && "message" in error) return String(error.message);
		return String(error);
	};
	var errorCode = (error) => typeof error === "object" && error !== null && "code" in error ? Number(error.code) : NaN;
	var isRateLimitError = (error) => errorCode(error) === 429 || /rate.?limit/i.test(errorMessage(error));
	var startButton = html(`
<button id="lsStartButton" class="ls-btn start-btn" type="button">
    <span id="startButtonSpan">Start</span>
</button>
`);
	var stopButton$1 = html(`
<button id="lsStopButton" class="ls-btn stop-btn" type="button"
    title="Stop livesearch. Leaving this page stops it too.">
    <span id="stopButtonSpan">Stop</span>
</button>
`);
	var statusLine$2 = html(`<div id="lsStatus" class="ls-status pd2te-holds-line"></div>`);
	var controls$1 = html(`<div id="lsControls" class="ls-controls pd2te-own"></div>`);
	controls$1.append(statusLine$2);
	var settingsPanel = html(`
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
	var STORAGE_KEY = "pd2-trade-enhancer-settings";
	var Settings = class Settings {
		static DEFAULT_SETTINGS = {
			delay: 25,
			volume: 10,
			pageSize: 10,
			desktopNotifications: false,
			enhancedFilters: true,
			cardTimes: true,
			compactCards: false,
			showQuery: false,
			autoSortFilters: false
		};
		static LIMITS = {
			delay: {
				min: 5,
				max: 300
			},
			volume: {
				min: 0,
				max: 100
			},
			pageSize: {
				min: 10,
				max: 100
			}
		};
		static sanitize(key, value, fallback = Settings.DEFAULT_SETTINGS[key]) {
			const number = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
			if (!Number.isFinite(number)) return fallback;
			const { min, max } = Settings.LIMITS[key];
			return Math.min(max, Math.max(min, number));
		}
		static sanitizeAll(raw) {
			const flag = (key) => {
				const value = raw?.[key];
				return typeof value === "boolean" ? value : Settings.DEFAULT_SETTINGS[key];
			};
			return {
				delay: Settings.sanitize("delay", raw?.delay),
				volume: Settings.sanitize("volume", raw?.volume),
				pageSize: Settings.sanitize("pageSize", raw?.pageSize),
				desktopNotifications: flag("desktopNotifications"),
				enhancedFilters: flag("enhancedFilters"),
				cardTimes: flag("cardTimes"),
				compactCards: flag("compactCards"),
				showQuery: flag("showQuery"),
				autoSortFilters: flag("autoSortFilters")
			};
		}
		static getSettings() {
			try {
				const storedSettings = localStorage.getItem(STORAGE_KEY);
				const parsed = storedSettings ? JSON.parse(storedSettings) : null;
				return Settings.sanitizeAll(typeof parsed === "object" ? parsed : null);
			} catch (error) {
				console.error("Error getting settings from localStorage:", error);
				return { ...Settings.DEFAULT_SETTINGS };
			}
		}
		static saveSettings(settings) {
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(Settings.sanitizeAll(settings)));
			} catch (error) {
				console.error("Error saving settings to localStorage:", error);
			}
		}
	};
	var SOUND_FILE = "https://web.poecdn.com/audio/trade/pulse.mp3";
	var audioInstance = null;
	var getAudio = () => {
		audioInstance ??= new Audio(SOUND_FILE);
		return audioInstance;
	};
	var unlockSound = () => {
		try {
			getAudio();
		} catch (error) {
			console.error("Error loading new item sound:", error);
		}
	};
	var playNewItemSound = () => {
		try {
			const audio = getAudio();
			audio.volume = Settings.getSettings().volume / 100;
			audio.currentTime = 0;
			audio.play().catch((error) => console.error("Error playing new item sound:", error));
		} catch (error) {
			console.error("Error playing new item sound:", error);
		}
	};
	var ITEM_FOUND_FAVICON = "data:image/svg+xml," + encodeURIComponent("<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 32 32\"><circle cx=\"16\" cy=\"16\" r=\"16\" fill=\"#e0201b\"/><rect x=\"13.5\" y=\"5\" width=\"5\" height=\"14\" rx=\"2.5\" fill=\"#fff\"/><circle cx=\"16\" cy=\"24.5\" r=\"3\" fill=\"#fff\"/></svg>");
	var TITLE_COUNT = /^\(\d+\) /;
	var unseenHits = 0;
	var savedFavicon = null;
	var isUserWatchingTab = () => !document.hidden && document.hasFocus();
	var renderTabTitle = () => {
		const baseTitle = document.title.replace(TITLE_COUNT, "");
		const title = unseenHits > 0 ? `(${unseenHits}) ${baseTitle}` : baseTitle;
		if (document.title !== title) document.title = title;
	};
	var showAlertFavicon = () => {
		if (savedFavicon) return;
		const link = document.querySelector("link#favicon, link[rel~=\"icon\"]");
		if (!link) return;
		savedFavicon = {
			link,
			href: link.getAttribute("href")
		};
		link.setAttribute("href", ITEM_FOUND_FAVICON);
	};
	var restoreFavicon = () => {
		if (!savedFavicon) return;
		const { link, href } = savedFavicon;
		savedFavicon = null;
		if (href === null) link.removeAttribute("href");
		else link.setAttribute("href", href);
	};
	var notifyTabOfHits = (count) => {
		if (isUserWatchingTab()) return;
		unseenHits += count;
		renderTabTitle();
		showAlertFavicon();
	};
	var clearUnseenHits = () => {
		if (document.hidden || unseenHits === 0 && !savedFavicon) return;
		unseenHits = 0;
		renderTabTitle();
		restoreFavicon();
	};
	document.addEventListener("visibilitychange", clearUnseenHits);
	window.addEventListener("focus", clearUnseenHits);
	var LOG$16 = "[pd2-trade-enhancer]";
	var MARKET_ROUTE = "market.shop";
	var DEFAULT_RESOLVE = { user: { in_game_account: true } };
	var getRoot = () => document.getElementById("app");
	var getGlobals = () => getRoot()?.__vue_app__?.config?.globalProperties;
	var getApi = () => {
		const api = getGlobals()?.$api;
		return api && typeof api.service === "function" ? api : null;
	};
	var getListingService = () => {
		try {
			const service = getApi()?.service("market/listing");
			return service && typeof service.find === "function" && typeof service.hooks === "function" ? service : null;
		} catch {
			return null;
		}
	};
	var getSocket = () => {
		const api = getApi();
		const socket = api?.io ?? api?.socket;
		return socket && typeof socket.on === "function" && typeof socket.off === "function" ? socket : null;
	};
	var getMyUserId = () => getGlobals()?.$store?.state?.security?.user?._id ?? null;
	var hasFunctions = (target, ...names) => typeof target === "object" && target !== null && names.every((name) => typeof target[name] === "function");
	var isObject = (value) => typeof value === "object" && value !== null;
	var isMarketPage = (proxy) => isObject(proxy) && Array.isArray(proxy.listings) && typeof proxy.noFilters === "boolean" && hasFunctions(proxy, "fetch", "handleFilterChange", "$watch");
	var isMarketFilters = (proxy) => isObject(proxy) && isObject(proxy.filters) && isObject(proxy.sort) && hasFunctions(proxy, "search", "$watch");
	var isAlive = (proxy) => isObject(proxy) && !proxy.$?.isUnmounted;
	var nameOf = (instance) => instance.type?.name ?? instance.type?.__name;
	var walkInstances = (root, match, all) => {
		const stack = [root];
		const visited = new Set();
		while (stack.length > 0) {
			const node = stack.pop();
			if (!isObject(node) || visited.has(node)) continue;
			visited.add(node);
			const vnode = node;
			const instance = vnode.component;
			if (instance) {
				if (!instance.isUnmounted && match(instance)) {
					if (!all) return instance;
					all.push(instance);
				}
				stack.push(instance.subTree);
				continue;
			}
			if (vnode.suspense) stack.push(vnode.suspense.activeBranch);
			if (Array.isArray(vnode.children)) for (let i = vnode.children.length - 1; i >= 0; i--) stack.push(vnode.children[i]);
		}
		return null;
	};
	var findInstance = (root, match) => walkInstances(root, match, null);
	var findAllComponents = (root, name, hasShape) => {
		const all = [];
		walkInstances(root, (candidate) => nameOf(candidate) === name && hasShape(candidate.proxy), all);
		return all.map((instance) => instance.proxy);
	};
	var findComponent = (root, name, hasShape) => {
		const instance = findInstance(root, (candidate) => nameOf(candidate) === name && hasShape(candidate.proxy)) ?? findInstance(root, (candidate) => hasShape(candidate.proxy));
		return instance ? instance.proxy : null;
	};
	var getRouteComponent = (routeName, componentName, hasShape) => {
		const route = getGlobals()?.$router?.currentRoute?.value;
		const record = route?.matched?.find((match) => match.name === routeName);
		if (route?.matched && !record) return null;
		const fromRoute = record?.instances?.default;
		if (isAlive(fromRoute) && hasShape(fromRoute)) return fromRoute;
		return findComponent(getRoot()?._vnode, componentName, hasShape);
	};
	var loadRouteComponent = async (routeName) => {
		let component = (getGlobals()?.$router?.getRoutes?.().find((route) => route.name === routeName))?.components?.default;
		if (typeof component === "function") {
			const loaded = await component();
			component = isObject(loaded) && "default" in loaded ? loaded.default : loaded;
		}
		return isObject(component) ? component : null;
	};
	var getMarketPage = () => getRouteComponent(MARKET_ROUTE, "PageGameMarket", isMarketPage);
	var getMarketFilters = (page = getMarketPage()) => page ? findComponent(page.$.subTree, "GameMarketFilters", isMarketFilters) : null;
	var probeBridge = () => {
		const root = getRoot();
		if (!root) return "#app element not found";
		if (!root.__vue_app__) return "#app.__vue_app__ is not visible. The userscript is probably running in an isolated (content) world, which Violentmonkey uses when the script's @inject-into is overridden to content, or with auto when the site's CSP blocks page scripts";
		if (!getApi()) return "the site's API client (app.config.globalProperties.$api) was not found";
		if (!getListingService()) return "$api.service('market/listing') has no find()/hooks()";
		const page = getMarketPage();
		if (!page) return "the PageGameMarket component was not found";
		if (!getMarketFilters(page)) return "the GameMarketFilters component was not found";
		return null;
	};
	var watchState = (component, key, callback, options) => {
		try {
			const stop = component.$watch(key, callback, options);
			return () => {
				try {
					stop();
				} catch {}
			};
		} catch (error) {
			console.warn(LOG$16, `Could not watch "${key}" on the market page.`, error);
			return () => {};
		}
	};
	var pageRewriter = null;
	var findListeners = new WeakMap();
	var dispatch = (subscribers, stage) => (context) => {
		const params = context?.params;
		if (!params || params.pd2 || !isObject(params.query)) return context;
		const query = params.query;
		subscribers.forEach((listener) => {
			try {
				if (stage === "found") listener.found(query, params);
				else listener.failed(query, params, context.error);
			} catch (error) {
				console.error(LOG$16, `find ${stage} listener failed`, error);
			}
		});
		return context;
	};
	var rewrite = (context) => {
		const params = context?.params;
		const rewriter = pageRewriter;
		if (!rewriter || !params || params.pd2 || !isObject(params.query)) return context;
		const failed = (error) => {
			console.error(LOG$16, "Changing the page's search failed; it goes out as the page built it.", error);
			return context;
		};
		try {
			const pending = rewriter(params.query);
			if (!pending) return context;
			return pending.then((answer) => {
				if (answer) context.result = answer.result;
				return context;
			}, failed);
		} catch (error) {
			return failed(error);
		}
	};
	var findHooksOf = (service) => {
		const installed = findListeners.get(service);
		if (installed) return installed;
		const subscribers = new Set();
		try {
			service.hooks({
				before: { find: [dispatch(subscribers, "found"), rewrite] },
				error: { find: [dispatch(subscribers, "failed")] }
			});
		} catch (error) {
			console.warn(LOG$16, "Could not install the market/listing find hooks.", error);
			return null;
		}
		findListeners.set(service, subscribers);
		return subscribers;
	};
	var onPageFind = (listener) => {
		const service = getListingService();
		const listeners = service ? findHooksOf(service) : null;
		if (!listeners) return null;
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	};
	var setPageQueryRewriter = (rewriter) => {
		pageRewriter = rewriter;
		const service = getListingService();
		return service !== null && findHooksOf(service) !== null;
	};
	var isMarketSearchQuery = (query) => query.type === "item" && "accepted_offer_id" in query;
	var queryBuilder = null;
	var getQueryBuilder = () => queryBuilder ??= findQueryBuilder();
	var findQueryBuilder = async () => {
		if (!getGlobals()) return null;
		try {
			const importModule = new Function("url", "return import(url)");
			for (const script of document.querySelectorAll("script[type=\"module\"][src]")) {
				const found = Object.values(await importModule(script.src)).filter((value) => typeof value === "function" && Function.prototype.toString.call(value).includes("_shared_stash_page_"));
				if (found.length === 1 && found[0]({ quality: "Unique" }, "item.")["item.quality.name"] === "Unique") return found[0];
			}
		} catch (error) {
			console.warn(LOG$16, "Could not load the site's query builder.", error);
		}
		return null;
	};
	var marketSearchQuery = (build, filters) => ({
		type: "item",
		accepted_offer_id: null,
		...build(JSON.parse(JSON.stringify(filters)), "item.")
	});
	var snapshotForm = (filters) => {
		try {
			return JSON.parse(JSON.stringify({
				filters: filters.filters,
				sort: filters.sort
			}));
		} catch {
			return null;
		}
	};
	var adoptForm = (page, filters) => {
		page.filters = filters.filters;
		page.sort = filters.sort;
	};
	var setSort = (filters, field, direction) => {
		filters.sort.field = field;
		filters.sort.direction = direction;
	};
	var _GM_notification = (() => typeof GM_notification != "undefined" ? GM_notification : void 0)();
	var showDesktopNotification = (hits) => {
		if (hits.length === 0 || isUserWatchingTab()) return;
		try {
			const lines = hits.slice(0, 3).map((hit) => hit.price ? `${hit.name} - ${hit.price}` : hit.name);
			_GM_notification({
				title: hits.length === 1 ? "New listing" : `${hits.length} new listings`,
				text: lines.join("\n") + (hits.length > 3 ? "\n..." : ""),
				silent: true,
				timeout: 15e3,
				onclick: () => window.focus()
			});
		} catch (error) {
			console.error("Error showing desktop notification:", error);
		}
	};
	var LOG$15 = "[pd2-trade-enhancer]";
	var listingPath = (id) => `/market/listing/${id}`;
	var listingIdFromHref = (href) => href?.match(/^\/market\/listing\/([^/?#]+)/)?.[1] ?? null;
	var safely = (label, fn) => {
		try {
			fn();
		} catch (error) {
			console.error(LOG$15, `${label} failed`, error);
		}
	};
	var reportHits = (hits, { recent = true } = {}) => {
		if (hits.length === 0) return;
		const time = new Date().toLocaleTimeString();
		hits.forEach((hit) => {
			const saved = hit.savedAt ? `(saved ${new Date(hit.savedAt).toLocaleTimeString()})` : "";
			console.log(`${LOG$15} ${time} new listing:`, hit.name, hit.price ?? "", `${location.origin}${listingPath(hit.id)}`, saved);
		});
		playNewItemSound();
		if (recent) safely("Recent hits", () => addRecentHits(hits));
		safely("Tab alert", () => notifyTabOfHits(hits.length));
		if (Settings.getSettings().desktopNotifications) showDesktopNotification(hits);
	};
	var LOG$14 = "[pd2-trade-enhancer]";
	var FIRST_PAGE_LIMIT = 50;
	var MAX_PAGES = 5;
	var OVERLAP_MS = 15e3;
	var REQUEST_TIMEOUT_MS$1 = 15e3;
	var BACKOFF_BASE_MS = 5e3;
	var BACKOFF_MAX_MS = 6e4;
	var RATE_LIMIT_PAUSE_MS = 6e4;
	var RECONNECT_WAIT_MS$1 = 6e4;
	var MIN_REQUEST_GAP_MS = 2e3;
	var GONE_CHECK_MS = 6e4;
	var MAX_START_LAG_MS = 6e5;
	var VOLATILE_KEYS = [
		"$limit",
		"$skip",
		"$sort",
		"$select",
		"$resolve",
		"updated_at",
		"bumped_at"
	];
	var searchBaseOf = (query, prune) => {
		const base = JSON.parse(JSON.stringify(query));
		prune?.(base);
		VOLATILE_KEYS.forEach((key) => delete base[key]);
		return base;
	};
	var timeOf = (listing) => Date.parse(listing.updated_at ?? "") || 0;
	var saveKey = (listing) => `${listing._id}|${listing.updated_at ?? ""}`;
	var isListing = (row) => typeof row === "object" && row !== null && typeof row._id === "string";
	var newestFirst = (a, b) => timeOf(b) - timeOf(a) || (a._id < b._id ? 1 : a._id > b._id ? -1 : 0);
	var findOnce = (service, query, signal) => new Promise((resolve) => {
		if (signal.aborted) return resolve({
			ok: false,
			aborted: true,
			error: null
		});
		let settled = false;
		const finish = (outcome) => {
			if (settled) return;
			settled = true;
			clearTimeout(timeoutId);
			signal.removeEventListener("abort", onAbort);
			resolve(outcome);
		};
		const onAbort = () => finish({
			ok: false,
			aborted: true,
			error: null
		});
		const timeoutId = setTimeout(() => {
			finish({
				ok: false,
				aborted: false,
				error: {
					name: "Timeout",
					code: 408,
					message: `no answer after ${REQUEST_TIMEOUT_MS$1 / 1e3}s`
				}
			});
		}, REQUEST_TIMEOUT_MS$1);
		signal.addEventListener("abort", onAbort, { once: true });
		try {
			service.find({
				query,
				pd2: true
			}).then((result) => finish({
				ok: true,
				result
			}), (error) => finish({
				ok: false,
				aborted: false,
				error
			}));
		} catch (error) {
			finish({
				ok: false,
				aborted: false,
				error
			});
		}
	});
	var fetchStartTime = async (service, signal) => {
		const outcome = await findOnce(service, {
			type: "item",
			accepted_offer_id: null,
			$sort: {
				updated_at: -1,
				_id: -1
			},
			$limit: 1,
			$select: ["_id", "updated_at"]
		}, signal);
		if (!outcome.ok) return outcome;
		const newest = (outcome.result.data ?? []).find(isListing);
		const serverTime = newest ? timeOf(newest) : 0;
		const floor = Date.now() - MAX_START_LAG_MS;
		if (serverTime >= floor) {
			console.info(LOG$14, `Watching saves after ${new Date(serverTime).toISOString()} (newest save on the market).`);
			return {
				ok: true,
				time: serverTime
			};
		}
		const found = serverTime > 0 ? `was saved at ${new Date(serverTime).toISOString()}` : "could not be read";
		console.warn(LOG$14, `The newest save on the market ${found}, more than ${MAX_START_LAG_MS / 6e4} min before this computer's clock (${new Date().toISOString()}). Watching saves after ${new Date(floor).toISOString()} instead. (A quiet market does this too; if listings keep showing up late, reload the page.)`);
		return {
			ok: true,
			time: floor
		};
	};
	var createRunMarker = (storageKey, label, resumeButton) => ({
		set: (running) => {
			try {
				if (running) sessionStorage.setItem(storageKey, String(Date.now()));
				else sessionStorage.removeItem(storageKey);
			} catch {}
		},
		reportLost: (status) => {
			let value = null;
			try {
				value = sessionStorage.getItem(storageKey);
				if (value !== null) sessionStorage.removeItem(storageKey);
			} catch {
				return;
			}
			if (value === null) return;
			const startedAt = Number(value) || 0;
			const since = startedAt > 0 ? ` (started ${clockTime(startedAt)})` : "";
			console.warn(`${LOG$14} ${label}${since} ended when this page reloaded: a reload, or Firefox unloading the background tab to save memory (pinned tabs are unloaded last; about:config browser.tabs.unloadOnLowMemory turns it off).`);
			status(`Not running: the page reloaded while livesearch was on${since}. Press ${resumeButton} to resume`, "warn");
		}
	});
	var createPollLoop = (config) => {
		const { signal, service, tracker, label, status } = config;
		let current = null;
		let pending = null;
		let startedAt = null;
		let cursor = 0;
		const recent = new Map();
		let failures = 0;
		let pausedUntil = 0;
		let lastRequestAt = 0;
		let lastGoneCheckAt = 0;
		let hitCount = 0;
		let wake = new AbortController();
		const nextWait = () => {
			const delay = Settings.getSettings().delay * 1e3;
			const base = failures > 0 ? Math.max(delay, Math.min(BACKOFF_MAX_MS, BACKOFF_BASE_MS * 2 ** (failures - 1))) : startedAt === null ? 0 : delay;
			const now = Date.now();
			return Math.max(base, lastRequestAt + MIN_REQUEST_GAP_MS - now, pausedUntil - now);
		};
		const nextCheckText = () => `next ~${clockTime(Date.now() + nextWait())}`;
		const onRateLimit = () => {
			pausedUntil = Date.now() + RATE_LIMIT_PAUSE_MS;
			console.warn(LOG$14, `The site reported a rate limit; pausing ${label.toLowerCase()} requests for 60 s.`);
			status(`Rate limited by the site: paused until ${clockTime(pausedUntil)}`, "warn");
		};
		const socket = getSocket();
		socket?.on("error.rate-limit", onRateLimit);
		const find = (query) => {
			lastRequestAt = Date.now();
			return findOnce(service, query, signal);
		};
		const waitForConnection = async () => {
			const currentSocket = getSocket();
			if (!currentSocket || currentSocket.connected !== false) return true;
			status("Disconnected from the site: waiting for it to reconnect", "warn");
			await new Promise((resolve) => {
				const done = () => {
					clearTimeout(timeoutId);
					currentSocket.off("connect", done);
					signal.removeEventListener("abort", done);
					resolve();
				};
				const timeoutId = setTimeout(done, RECONNECT_WAIT_MS$1);
				currentSocket.on("connect", done);
				signal.addEventListener("abort", done, { once: true });
			});
			return !signal.aborted && currentSocket.connected !== false;
		};
		const fetchRows = async (search, since) => {
			const rows = [];
			const ids = new Set();
			let skip = 0;
			let limit = FIRST_PAGE_LIMIT;
			for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
				const outcome = await config.findPage(find, search, since, skip, limit);
				if (!outcome.ok) return outcome;
				const raw = outcome.result.data ?? [];
				raw.filter(isListing).forEach((row) => {
					if (ids.has(row._id)) return;
					ids.add(row._id);
					rows.push(row);
				});
				const pageSize = Math.min(limit, outcome.result.limit ?? limit);
				if (raw.length === 0 || raw.length < pageSize) return {
					ok: true,
					rows,
					truncated: false
				};
				skip += raw.length;
				limit = 250;
			}
			return {
				ok: true,
				rows,
				truncated: true
			};
		};
		const findGoneListings = async (ids) => {
			const gone = [];
			for (let i = 0; i < ids.length; i += 250) {
				const batch = ids.slice(i, i + 250);
				const query = {
					type: config.goneType,
					accepted_offer_id: null,
					_id: { $in: batch },
					$select: ["_id"],
					$limit: batch.length
				};
				const outcome = await find(query);
				if (!outcome.ok) return [];
				const present = new Set((outcome.result.data ?? []).filter(isListing).map((row) => row._id));
				batch.forEach((id) => {
					if (!present.has(id)) gone.push(id);
				});
			}
			return gone;
		};
		const absorb = (rows, since) => {
			const me = getMyUserId();
			const fresh = [];
			rows.forEach((row) => {
				const time = timeOf(row);
				if (time <= since) return;
				cursor = Math.max(cursor, time);
				const key = saveKey(row);
				if (recent.has(key)) return;
				recent.set(key, time);
				if (!(me && row.user_id === me)) fresh.push(row);
			});
			recent.forEach((time, key) => {
				if (time <= cursor - OVERLAP_MS) recent.delete(key);
			});
			return fresh;
		};
		const reportFailure = (error) => {
			if (isRateLimitError(error)) pausedUntil = Math.max(pausedUntil, Date.now() + RATE_LIMIT_PAUSE_MS);
			const message = errorMessage(error);
			const wait = nextWait();
			console.warn(LOG$14, `${label} check failed (${failures}x): ${message}. Retrying in ${Math.round(wait / 1e3)}s.`);
			status(`Check failed (${failures}x): ${message} - retry ~${clockTime(Date.now() + wait)}`, "error");
		};
		const run = async () => {
			while (!signal.aborted) {
				if (pending) {
					current = pending;
					pending = null;
					startedAt = null;
					recent.clear();
					failures = 0;
					hitCount = 0;
					config.onSwitch?.(current);
				}
				const search = current;
				if (!search) break;
				const wait = nextWait();
				if (wait > 0) {
					wake = new AbortController();
					await sleep(wait, signal, wake.signal);
					if (signal.aborted) break;
					if (pending || Date.now() < pausedUntil) continue;
				}
				if (!await waitForConnection() || pending) continue;
				if (startedAt === null) {
					lastRequestAt = Date.now();
					const start = await fetchStartTime(service, signal);
					if (signal.aborted) break;
					if (pending) continue;
					if (!start.ok) {
						failures++;
						reportFailure(start.error);
						continue;
					}
					failures = 0;
					startedAt = start.time;
					cursor = start.time;
					tracker.startFeed();
					status(`Live since ${clockTime(startedAt)} - waiting for new listings - ${nextCheckText()}`);
					continue;
				}
				const since = Math.max(startedAt, cursor - OVERLAP_MS);
				const outcome = await fetchRows(search, since);
				if (signal.aborted) break;
				if (pending) continue;
				if (!outcome.ok) {
					failures++;
					reportFailure(outcome.error);
					continue;
				}
				failures = 0;
				const fresh = absorb(outcome.rows, since).filter((row) => config.keep?.(search, row) ?? true);
				if (outcome.truncated) console.warn(LOG$14, `More than ${outcome.rows.length} listings were saved since the last check; older ones may be missed.`);
				if (fresh.length > 0) {
					hitCount += fresh.length;
					const saved = fresh.map(timeOf);
					console.info(LOG$14, `${label} check after ${new Date(since).toISOString()}: ${fresh.length} new, saved ${new Date(Math.min(...saved)).toISOString()} .. ${new Date(Math.max(...saved)).toISOString()}.`);
					fresh.sort(newestFirst);
					reportHits(fresh.map(config.toHit), { recent: config.recentHits });
					tracker.addToFeed(await config.feedRows(find, search, fresh));
					if (signal.aborted) break;
				}
				if (Date.now() - lastGoneCheckAt >= GONE_CHECK_MS) {
					const liveIds = tracker.liveFeedIds();
					if (liveIds.length > 0) {
						lastGoneCheckAt = Date.now();
						const gone = await findGoneListings(liveIds);
						if (signal.aborted) break;
						if (pending) continue;
						if (gone.length > 0) tracker.markGone(gone);
					}
				}
				tracker.sync();
				status(`Live since ${clockTime(startedAt)}: checked ${clockTime()} - ${hitCount} new - ${nextCheckText()}`);
			}
		};
		return {
			propose: (next) => {
				if (next.signature === (pending ?? current)?.signature) return "same";
				if (next.signature === current?.signature) {
					pending = null;
					return "reverted";
				}
				pending = next;
				wake.abort();
				return "queued";
			},
			currentSearch: () => current,
			hasPending: () => pending !== null,
			find,
			waitForConnection,
			waitForSearch: async (ms) => {
				if (!pending) {
					wake = new AbortController();
					await sleep(ms, signal, wake.signal);
				}
				return pending !== null;
			},
			run,
			release: () => {
				socket?.off("error.rate-limit", onRateLimit);
				wake.abort();
			}
		};
	};
	var LOG$13 = "[pd2-trade-enhancer]";
	var STUCK_MS = 12e3;
	var FEED_MAX = 50;
	var EMPTY_RESULTS_TEXT = "no items match query";
	var EMPTY_FEED_TEXT = "Waiting for new listings...";
	var GONE_BADGE_TEXT = "Gone: sold or removed";
	var relabelEmptyResults = (page) => {
		const root = page.$.subTree?.el;
		if (!(root instanceof Element)) return;
		root.querySelectorAll("h1, h2, h3, p, div").forEach((element) => {
			if (element.childElementCount === 0 && element.textContent?.trim().toLowerCase() === EMPTY_RESULTS_TEXT) element.textContent = EMPTY_FEED_TEXT;
		});
	};
	var markGoneCards = (page, gone) => {
		const root = page.$.subTree?.el;
		if (!(root instanceof Element)) return;
		root.querySelectorAll(".listing").forEach((card) => {
			const id = listingIdFromHref(card.querySelector("a[href^=\"/market/listing/\"]")?.getAttribute("href") ?? null);
			if (!id) return;
			const marked = card.classList.contains("pd2te-gone");
			if (gone.has(id) && !marked) {
				card.classList.add("pd2te-gone");
				const badge = document.createElement("span");
				badge.className = "pd2te-gone-badge pd2te-own";
				badge.textContent = GONE_BADGE_TEXT;
				(card.querySelector(".meta .time .flex-grow") ?? card.querySelector(".meta") ?? card).append(badge);
			} else if (!gone.has(id) && marked) {
				card.classList.remove("pd2te-gone");
				card.querySelector(".pd2te-gone-badge")?.remove();
			}
		});
	};
	var createFeedTracker = (config) => {
		const { signal, what, rowsKey } = config;
		let attached = null;
		let searchedForm = null;
		let lastCall = 0;
		const calls = new WeakMap();
		let feed = null;
		const gone = new Set();
		const showFeed = () => {
			if (!feed || signal.aborted) return;
			const page = sync();
			if (!page || page.loading || !config.showsWatchedSearch(page)) return;
			page[rowsKey] = [...feed];
			page.total = Math.min(feed.length, 10);
		};
		const armWatchdog = (entry) => {
			clearTimeout(entry.stuckTimer);
			entry.stuckTimer = setTimeout(() => recover(entry, null), STUCK_MS);
		};
		const recover = (entry, error) => {
			const { page } = entry;
			if (attached !== entry || page.$.isUnmounted || !page.loading) return;
			clearTimeout(entry.stuckTimer);
			const reason = error === null ? `no answer after ${STUCK_MS / 1e3}s` : errorMessage(error);
			if (!entry.retried && !isRateLimitError(error) && getSocket()?.connected !== false && !config.hasUnsearchedEdits(page, searchedForm)) {
				entry.retried = true;
				console.warn(LOG$13, `The ${what} page's search failed (${reason}); searching again.`);
				config.status(`The page's search failed (${reason}): searching again`, "warn");
				entry.recovering = true;
				try {
					config.refetch(page);
				} catch (fetchError) {
					console.warn(LOG$13, `Retrying the ${what} page's search failed.`, fetchError);
				} finally {
					entry.recovering = false;
				}
				armWatchdog(entry);
				return;
			}
			console.warn(LOG$13, `The ${what} page's search failed (${reason}); showing the previous results.`);
			config.status(`The page's search failed (${reason}): showing the previous results`, "warn");
			page.loading = false;
		};
		const detach = () => {
			if (!attached) return;
			clearTimeout(attached.stuckTimer);
			attached.unwatch.forEach((stop) => stop());
			attached = null;
		};
		const sync = () => {
			const page = config.getPage();
			if (attached?.page === page) return page;
			detach();
			if (!page) return null;
			const entry = {
				page,
				unwatch: [],
				retried: false,
				recovering: false,
				loadingSince: 0
			};
			attached = entry;
			entry.unwatch.push(watchState(page, "loading", (loading) => {
				clearTimeout(entry.stuckTimer);
				if (loading) {
					entry.loadingSince = Date.now();
					armWatchdog(entry);
				} else {
					entry.loadingSince = 0;
					entry.retried = false;
					showFeed();
				}
			}, { immediate: true }), watchState(page, rowsKey, () => {
				if (!feed) return;
				if (feed.length === 0) relabelEmptyResults(page);
				markGoneCards(page, gone);
			}, { flush: "post" }));
			return page;
		};
		return {
			sync,
			pageSearched: (call, formSignature) => {
				calls.set(call, ++lastCall);
				searchedForm = formSignature;
				const entry = attached;
				if (entry && !entry.recovering && entry.page.loading) {
					entry.retried = false;
					entry.loadingSince = Date.now();
					armWatchdog(entry);
				}
			},
			pageSearchFailed: (call, error) => {
				const seq = calls.get(call);
				if (seq !== void 0 && seq < lastCall) return;
				sync();
				if (attached) recover(attached, error);
			},
			startFeed: () => {
				feed = [];
				gone.clear();
				config.onStartFeed?.(sync());
				showFeed();
			},
			addToFeed: (listings) => {
				if (!feed || listings.length === 0) return;
				const ids = new Set(listings.map((listing) => listing._id));
				ids.forEach((id) => gone.delete(id));
				feed = [...listings, ...feed.filter((listing) => !ids.has(listing._id))].slice(0, FEED_MAX);
				showFeed();
			},
			liveFeedIds: () => (feed ?? []).map((listing) => listing._id).filter((id) => !gone.has(id)),
			markGone: (ids) => {
				ids.forEach((id) => gone.add(id));
				const page = sync();
				if (page) markGoneCards(page, gone);
			},
			release: () => {
				feed = null;
				const entry = attached;
				if (entry && entry.page.loading && entry.loadingSince > 0 && Date.now() - entry.loadingSince > STUCK_MS) entry.page.loading = false;
				detach();
			}
		};
	};
	var OWN_MARKER = "pd2te_ignore_socketed";
	var ownMarkerValue = () => ({ $exists: false });
	var isOwnMarkerValue = (value) => stableStringify(value) === stableStringify(ownMarkerValue());
	var isOwnSearch = (query) => isOwnMarkerValue(query[OWN_MARKER]);
	var isRecord$2 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
	var ONE_PARAMETER = new Set([
		"item_addclassskills",
		"item_addskill_tab",
		"item_singleskill",
		"item_nonclassskill",
		"item_aura",
		"item_skillonequip",
		"item_reanimate"
	]);
	var layoutOf = (name) => {
		if (name.startsWith("item_skillon") && name !== "item_skillonequip" || name === "item_charged_skill") return {
			identity: [0, 1],
			amount: 2
		};
		if (ONE_PARAMETER.has(name) || name.startsWith("item_elemskill_")) return {
			identity: [0],
			amount: 1
		};
		return {
			identity: [],
			amount: 0
		};
	};
	var DAMAGE_RANGES = new Set([
		"firedam",
		"lightdam",
		"lightmindam",
		"colddam",
		"magicmindam"
	]);
	var POISON = "poisonmindam";
	var PSEUDO = {
		all_resist: [
			"fireresist",
			"lightresist",
			"coldresist",
			"poisonresist"
		],
		all_attributes: [
			"strength",
			"dexterity",
			"vitality",
			"energy"
		]
	};
	var numbers = (modifier) => Array.isArray(modifier.values) ? modifier.values.map((value) => typeof value === "number" ? value : Number(value)) : [];
	var identityKey = (name, values) => `${name}|${layoutOf(name).identity.map((index) => values[index]).join(",")}`;
	var socketedAdds = (item) => {
		const adds = new Map();
		const add = (key, amount, max) => {
			const entry = adds.get(key) ?? {
				amount: 0,
				max: 0
			};
			entry.amount += amount;
			entry.max += max;
			adds.set(key, entry);
		};
		(item.socketed ?? []).forEach((socketed) => (socketed?.modifiers ?? []).forEach((modifier) => {
			const name = modifier.name;
			if (typeof name !== "string") return;
			const values = numbers(modifier);
			const amount = values[layoutOf(name).amount];
			if (!Number.isFinite(amount)) return;
			const parts = PSEUDO[name];
			if (parts) parts.forEach((part) => add(identityKey(part, []), amount, 0));
			else add(identityKey(name, values), amount, DAMAGE_RANGES.has(name) && Number.isFinite(values[1]) ? values[1] : 0);
		}));
		return adds;
	};
	var socketShares = (item) => {
		if (!item.socketed?.length) return [];
		const adds = socketedAdds(item);
		if (adds.size === 0) return [];
		const shares = [];
		(item.modifiers ?? []).forEach((modifier) => {
			const name = modifier.name;
			if (typeof name !== "string") return;
			const values = numbers(modifier);
			const parts = PSEUDO[name];
			if (parts) {
				const amount = values[0];
				if (!Number.isFinite(amount)) return;
				const split = parts.map((part) => {
					const added = adds.get(identityKey(part, []))?.amount ?? 0;
					return {
						name: part,
						own: amount - added,
						added
					};
				});
				if (split.every((part) => part.added === 0)) return;
				const even = split.every((part) => part.added === split[0].added);
				shares.push({
					modifier,
					own: split[0].own,
					added: split[0].added,
					parts: even ? void 0 : split
				});
				return;
			}
			const added = adds.get(identityKey(name, values));
			const amount = values[layoutOf(name).amount];
			if (!added || added.amount === 0 || !Number.isFinite(amount)) return;
			const share = {
				modifier,
				own: amount - added.amount,
				added: added.amount
			};
			if (DAMAGE_RANGES.has(name)) {
				share.addedMax = added.max;
				share.ownMax = share.own !== 0 && Number.isFinite(values[1]) ? values[1] : 0;
			}
			shares.push(share);
		});
		return shares;
	};
	var ownModifiers = (item) => {
		const merged = item.modifiers ?? [];
		if (item.is_runeword) return merged;
		const shares = new Map(socketShares(item).map((share) => [share.modifier, share]));
		if (shares.size === 0) return merged;
		const own = [];
		merged.forEach((modifier) => {
			const share = shares.get(modifier);
			if (!share) {
				own.push(modifier);
				return;
			}
			if (share.parts) {
				share.parts.forEach((part) => {
					if (part.own === 0) return;
					const flags = {};
					if (modifier.corrupted) flags.corrupted = true;
					if (modifier.desecrated) flags.desecrated = true;
					own.push({
						...flags,
						name: part.name,
						values: [part.own]
					});
				});
				return;
			}
			if (share.own === 0) return;
			const values = [...modifier.values ?? []];
			values[layoutOf(modifier.name ?? "").amount] = share.own;
			own.push({
				...modifier,
				values
			});
		});
		return own;
	};
	var shownAmount = (modifier, amount) => {
		if (modifier.name !== POISON) return amount;
		const frames = numbers(modifier)[2];
		return Number.isFinite(frames) ? Math.round(amount * frames / 256) : amount;
	};
	var Unsupported = class extends Error {};
	var isOperators = (value) => isRecord$2(value) && Object.keys(value).length > 0 && Object.keys(value).every((key) => key.startsWith("$"));
	var reach = (value, path) => {
		if (path.length === 0) return value === void 0 ? [] : [value];
		const [head, ...rest] = path;
		if (Array.isArray(value)) {
			if (/^\d+$/.test(head)) return Number(head) < value.length ? reach(value[Number(head)], rest) : [];
			return value.flatMap((element) => isRecord$2(element) ? reach(element, path) : []);
		}
		return isRecord$2(value) && head in value ? reach(value[head], rest) : [];
	};
	var candidates = (values) => values.flatMap((value) => Array.isArray(value) ? [value, ...value] : [value]);
	var same = (a, b) => typeof a === "object" || typeof b === "object" ? stableStringify(a) === stableStringify(b) : a === b;
	var equals = (values, expected) => expected === null ? values.length === 0 || candidates(values).some((value) => value === null) : candidates(values).some((value) => same(value, expected));
	var compare = (values, bound, test) => candidates(values).some((value) => (typeof value === "number" && typeof bound === "number" || typeof value === "string" && typeof bound === "string") && test(value < bound ? -1 : value > bound ? 1 : 0));
	var regexMatch = (values, pattern, options) => {
		const flags = typeof options === "string" ? options : "";
		if (typeof pattern !== "string" || !/^[imsu]*$/.test(flags)) throw new Unsupported("$regex");
		let regex;
		try {
			regex = new RegExp(pattern, flags);
		} catch {
			throw new Unsupported("$regex");
		}
		return candidates(values).some((value) => typeof value === "string" && regex.test(value));
	};
	var elemMatch = (values, condition) => values.some((value) => Array.isArray(value) && value.some((element) => isOperators(condition) ? matchOperators([element], condition) : isRecord$2(element) && matchDocument(element, condition)));
	var matchOperators = (values, operators) => Object.entries(operators).every(([operator, argument]) => {
		switch (operator) {
			case "$in":
				if (!Array.isArray(argument)) throw new Unsupported(operator);
				return argument.some((item) => equals(values, item));
			case "$nin":
				if (!Array.isArray(argument)) throw new Unsupported(operator);
				return !argument.some((item) => equals(values, item));
			case "$ne": return !equals(values, argument);
			case "$gt": return compare(values, argument, (order) => order > 0);
			case "$gte": return compare(values, argument, (order) => order >= 0);
			case "$lt": return compare(values, argument, (order) => order < 0);
			case "$lte": return compare(values, argument, (order) => order <= 0);
			case "$exists": return values.length > 0 === Boolean(argument);
			case "$regex": return regexMatch(values, argument, operators.$options);
			case "$options": return true;
			case "$all":
				if (!Array.isArray(argument)) throw new Unsupported(operator);
				return argument.length > 0 && argument.every((item) => isRecord$2(item) && Object.keys(item).length === 1 && isRecord$2(item.$elemMatch) ? elemMatch(values, item.$elemMatch) : equals(values, item));
			case "$elemMatch":
				if (!isRecord$2(argument)) throw new Unsupported(operator);
				return elemMatch(values, argument);
			default: throw new Unsupported(operator);
		}
	});
	var matchField = (doc, path, condition) => {
		const values = reach(doc, path.split("."));
		return isOperators(condition) ? matchOperators(values, condition) : equals(values, condition);
	};
	var matchDocument = (doc, query) => Object.entries(query).every(([key, condition]) => {
		if (key === "$or") return Array.isArray(condition) && condition.some((branch) => isRecord$2(branch) && matchDocument(doc, branch));
		if (key.startsWith("$")) throw new Unsupported(key);
		return matchField(doc, key, condition);
	});
	var readsMods = (key) => key === "item.modifiers" || key.startsWith("item.modifiers.");
	var ownStillMatches = (listing, query) => {
		const item = listing.item;
		if (!isRecord$2(item) || !Array.isArray(item.modifiers)) return true;
		const own = ownModifiers(item);
		if (own === item.modifiers) return true;
		const ownListing = {
			...listing,
			item: {
				...item,
				modifiers: own
			}
		};
		try {
			return Object.entries(query).every(([key, condition]) => {
				if (key === "$or") return Array.isArray(condition) && condition.some((branch) => isRecord$2(branch) && matchDocument(ownListing, branch));
				return readsMods(key) ? matchField(ownListing, key, condition) : true;
			});
		} catch (error) {
			if (error instanceof Unsupported) return true;
			throw error;
		}
	};
	var namesInElemMatch = (match) => {
		if (!isRecord$2(match)) return null;
		const { name } = match;
		if (typeof name === "string") return [name];
		if (isRecord$2(name) && Array.isArray(name.$in)) return name.$in.filter((item) => typeof item === "string");
		if (Array.isArray(match.$or)) {
			const names = match.$or.map((part) => isRecord$2(part) && typeof part.name === "string" ? part.name : null);
			if (names.every((part) => part !== null)) return names;
		}
		return null;
	};
	var RELATED = Object.entries(PSEUDO).map(([name, parts]) => [name, ...parts]);
	var modNamesIn = (query) => {
		const names = new Set();
		let unknown = false;
		const collect = (list) => {
			if (list) list.forEach((name) => names.add(name));
			else unknown = true;
		};
		const visit = (part) => Object.entries(part).forEach(([key, value]) => {
			if (key === "$or") {
				if (Array.isArray(value)) value.filter(isRecord$2).forEach(visit);
			} else if (key === "item.modifiers") {
				if (isRecord$2(value) && Array.isArray(value.$all)) value.$all.forEach((entry) => collect(isRecord$2(entry) ? namesInElemMatch(entry.$elemMatch) : null));
				else collect(isRecord$2(value) ? namesInElemMatch(value.$elemMatch) : null);
			} else if (key === "item.modifiers.name") {
				if (typeof value === "string") collect([value]);
				else if (isRecord$2(value)) {
					const lists = [
						value.$in,
						value.$nin,
						value.$all
					].filter(Array.isArray);
					collect(lists.length > 0 ? lists.flat().filter((item) => typeof item === "string") : null);
				} else collect(null);
			} else if (readsMods(key)) collect(null);
		});
		visit(query);
		if (unknown) return null;
		RELATED.forEach((group) => {
			if (group.some((name) => names.has(name))) group.forEach((name) => names.add(name));
		});
		return [...names];
	};
	var pathsIn = (value) => {
		if (Array.isArray(value)) return value.flatMap(pathsIn);
		if (!isRecord$2(value)) return [];
		return Object.entries(value).flatMap(([key, inner]) => {
			if (key === "$or") return pathsIn(inner);
			if (key.startsWith("$")) return [];
			const segments = key.split(".");
			const index = segments.findIndex((segment) => /^\d+$/.test(segment));
			return [index < 0 ? key : segments.slice(0, index).join(".")].filter((path) => path !== "");
		});
	};
	var ownCheckFields = (query) => [
		"item.is_runeword",
		"item.modifiers",
		"item.socketed.modifiers",
		...pathsIn(query.$or)
	];
	var selectPaths = (paths) => {
		const unique = [...new Set(paths)].sort();
		return unique.filter((path) => !unique.some((other) => other !== path && path.startsWith(`${other}.`)));
	};
	var SUMS_MARKER = "pd2te_sums";
	var SUM_SORT_FIELD = "pd2te_sum";
	var isRecord$1 = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
	var isNumber = (value) => typeof value === "number" && Number.isFinite(value);
	var BRACE = /^(\w+)\{([\d,]+)\}$/;
	var slotOf = (key, weight) => {
		if (key.includes("|")) return null;
		const brace = key.match(BRACE);
		const name = brace ? brace[1] : key;
		const fixed = brace ? brace[2].split(",").map(Number) : [];
		const layout = layoutOf(name);
		if (!name.startsWith("item_elemskill_") && fixed.length < layout.identity.length) return null;
		return {
			name,
			fixed,
			amount: brace ? fixed.length : layout.amount,
			weight
		};
	};
	var isSummable = (key) => !(key in PSEUDO) && slotOf(key, 1) !== null;
	var slotsOf = (spec) => {
		const weights = new Map();
		spec.terms.forEach(({ key, weight }) => {
			if (!isNumber(weight)) return;
			(PSEUDO[key] ?? [key]).forEach((part) => weights.set(part, (weights.get(part) ?? 0) + weight));
		});
		return [...weights].flatMap(([key, weight]) => {
			const slot = weight === 0 ? null : slotOf(key, weight);
			return slot ? [slot] : [];
		});
	};
	var sumOf = (modifiers, spec) => {
		const slots = slotsOf(spec);
		const parts = [];
		let total = 0;
		modifiers.forEach((modifier) => {
			const { name } = modifier;
			if (typeof name !== "string" || !Array.isArray(modifier.values)) return;
			const values = modifier.values.map((value) => typeof value === "number" ? value : Number(value));
			const names = PSEUDO[name] ?? [name];
			let weight = 0;
			let amount = NaN;
			slots.forEach((slot) => {
				if (!names.includes(slot.name) || slot.fixed.some((value, index) => values[index] !== value)) return;
				const value = PSEUDO[name] ? values[0] : values[slot.amount];
				if (!isNumber(value)) return;
				weight += slot.weight;
				amount = value;
			});
			if (weight === 0 || !isNumber(amount)) return;
			total += weight * amount;
			const label = modifier.label && modifier.label !== "undefined" ? modifier.label : void 0;
			parts.push(label ? {
				name,
				label,
				amount,
				weight
			} : {
				name,
				amount,
				weight
			});
		});
		return {
			total,
			parts
		};
	};
	var EPSILON = 1e-9;
	var reaches = (spec, total) => (spec.min === void 0 || total >= spec.min - EPSILON) && (spec.max === void 0 || total <= spec.max + EPSILON);
	var itemSums = (item, sums, own) => {
		const modifiers = own ? ownModifiers(item) : item.modifiers ?? [];
		return sums.map((spec) => sumOf(modifiers, spec));
	};
	var reachesAll = (sums, results) => results.every((result, index) => reaches(sums[index], result.total));
	var formatAmount = (value) => String(Math.round(value * 100) / 100);
	var describeParts = (parts, labelOf) => parts.map((part) => {
		return `${part.label ?? labelOf(part.name).replace(/\bX\b/, formatAmount(part.amount))}${part.weight === 1 ? "" : ` ×${formatAmount(part.weight)}`}`;
	}).join(", ");
	var sumCandidates = (spec) => {
		const slots = slotsOf(spec);
		if (slots.length === 0 || spec.min === void 0 || !(spec.min > 0)) return null;
		const share = spec.min / slots.length;
		const bound = (weight) => weight > 0 ? { $gte: share / weight } : { $lte: share / weight };
		const branch = (match) => ({ "item.modifiers": { $all: [{ $elemMatch: match }] } });
		const branches = slots.map((slot) => {
			const match = { name: slot.name };
			slot.fixed.forEach((value, index) => {
				match[`values.${index}`] = value;
			});
			match[`values.${slot.amount}`] = bound(slot.weight);
			return branch(match);
		});
		Object.entries(PSEUDO).forEach(([pseudo, stats]) => {
			const weight = slots.filter((slot) => stats.includes(slot.name)).reduce((total, slot) => total + slot.weight, 0);
			if (weight !== 0) branches.push(branch({
				name: pseudo,
				"values.0": bound(weight)
			}));
		});
		return branches;
	};
	var encode = (spec) => JSON.stringify({
		min: spec.min,
		max: spec.max,
		terms: spec.terms.map((term) => [term.key, term.weight])
	});
	var decode = (text) => {
		if (typeof text !== "string") return null;
		try {
			const raw = JSON.parse(text);
			if (!isRecord$1(raw) || !Array.isArray(raw.terms)) return null;
			const terms = [];
			for (const term of raw.terms) {
				if (!Array.isArray(term) || typeof term[0] !== "string" || !isNumber(term[1])) return null;
				terms.push({
					key: term[0],
					weight: term[1]
				});
			}
			const spec = { terms };
			if (isNumber(raw.min)) spec.min = raw.min;
			if (isNumber(raw.max)) spec.max = raw.max;
			return spec;
		} catch {
			return null;
		}
	};
	var sumsMarkerValue = (sums) => ({ $nin: sums.map(encode) });
	var sumsFromMarker = (value) => {
		if (!isRecord$1(value) || Object.keys(value).length !== 1 || !Array.isArray(value.$nin) || value.$nin.length === 0) return null;
		const sums = value.$nin.map(decode);
		return sums.every((spec) => spec !== null) ? sums : null;
	};
	var sumsOf = (query) => sumsFromMarker(query["pd2te_sums"]) ?? [];
	var sanitizeSum = (raw) => {
		if (!isRecord$1(raw) || !Array.isArray(raw.terms)) return null;
		const spec = { terms: raw.terms.filter(isRecord$1).filter((term) => typeof term.key === "string" && isNumber(term.weight)).map((term) => ({
			key: term.key,
			weight: term.weight
		})) };
		if (isNumber(raw.min)) spec.min = raw.min;
		if (isNumber(raw.max)) spec.max = raw.max;
		return spec;
	};
	var LOG$12 = "[pd2-trade-enhancer]";
	var LIVESEARCH_CHANGED_EVENT = "pd2te:livesearch-changed";
	var watchedFilters = null;
	var getWatchedFilters = () => watchedFilters;
	var setWatched = (filters) => {
		watchedFilters = filters;
		document.dispatchEvent(new Event(LIVESEARCH_CHANGED_EVENT));
	};
	var RESPONSE_SHAPES = [
		{
			select: [
				"_id",
				"updated_at",
				"user_id",
				"price",
				"hr_price",
				"item.name"
			],
			resolve: false
		},
		{
			select: [
				"_id",
				"updated_at",
				"user_id",
				"price",
				"hr_price",
				"item"
			],
			resolve: false
		},
		{
			select: null,
			resolve: true
		}
	];
	var PRICE_SORT_FILTER = stableStringify({ $gt: 0 });
	var readsOwnStats = (base) => isOwnSearch(base) && modNamesIn(base)?.length !== 0;
	var isQueryShapeError = (error) => [400, 500].includes(errorCode(error));
	var toHit$1 = (listing) => ({
		id: listing._id,
		name: listing.item?.name?.trim() || listing.item?.base?.name?.trim() || "Unnamed item",
		price: `${listing.hr_price ? `${listing.hr_price} HR ` : ""}${listing.price ?? ""}`.trim() || void 0,
		savedAt: timeOf(listing) || void 0
	});
	var marketSearchBase = (query) => searchBaseOf(query, (base) => {
		const sort = base.$sort;
		if (typeof sort === "object" && sort !== null && "hr_price" in sort && stableStringify(base.hr_price) === PRICE_SORT_FILTER) delete base.hr_price;
	});
	var buildQuery = (search, since, skip, limit, shapeIndex) => {
		const shape = RESPONSE_SHAPES[shapeIndex];
		const query = {
			...search.base,
			updated_at: { $gt: new Date(since).toISOString() },
			$sort: {
				updated_at: -1,
				_id: -1
			},
			$skip: skip,
			$limit: limit
		};
		if (shape.select) {
			const own = search.ownStats || search.sums.length > 0 && isOwnSearch(search.base) ? ownCheckFields(search.base) : [];
			const mods = search.sums.length > 0 ? ["item.modifiers"] : [];
			query.$select = own.length + mods.length > 0 ? selectPaths([
				...shape.select,
				...mods,
				...own
			]) : shape.select;
		}
		if (shape.resolve) query.$resolve = search.resolve ?? DEFAULT_RESOLVE;
		return query;
	};
	var passesOwnStats = (search, listing) => {
		if (!search.ownStats || ownStillMatches(listing, search.base)) return true;
		console.info(LOG$12, `Livesearch left out ${toHit$1(listing).name} (${location.origin}${listingPath(listing._id)}): it meets the search only with its socketed items' stats.`);
		return false;
	};
	var passesSums = (search, listing) => {
		if (search.sums.length === 0 || !listing.item) return true;
		const results = itemSums(listing.item, search.sums, isOwnSearch(search.base));
		if (reachesAll(search.sums, results)) return true;
		const totals = results.map((result) => formatAmount(result.total)).join(", ");
		console.info(LOG$12, `Livesearch left out ${toHit$1(listing).name} (${location.origin}${listingPath(listing._id)}): its sum comes to ${totals}.`);
		return false;
	};
	var formSignatureOf = (form) => form ? stableStringify(form) : null;
	var activePageSync = null;
	var onApiMarketPageMounted = () => activePageSync?.();
	var runApiLivesearch = async (signal) => {
		const service = getListingService();
		if (!service) return "unavailable";
		let pageSignature = null;
		let shapeIndex = 0;
		let shapeConfirmed = false;
		let loop;
		const tracker = createFeedTracker({
			signal,
			what: "market",
			rowsKey: "listings",
			getPage: () => getMarketPage(),
			showsWatchedSearch: () => {
				const current = loop.currentSearch();
				return !loop.hasPending() && current !== null && pageSignature === current.signature;
			},
			refetch: (page) => {
				const pageNo = Number(page.page) || 1;
				page.fetch(pageNo, 10, (pageNo - 1) * 10);
			},
			hasUnsearchedEdits: (page, searchedForm) => {
				const filters = getMarketFilters(page);
				if (!filters) return false;
				const now = formSignatureOf(snapshotForm(filters));
				return now === null || now !== searchedForm;
			},
			status: setStatus$2,
			onStartFeed: (page) => {
				clearRecentHits();
				if (page?.noFilters) page.noFilters = false;
			}
		});
		const findPage = async (find, search, since, skip, limit) => {
			for (;;) {
				const outcome = await find(buildQuery(search, since, skip, limit, shapeIndex));
				if (outcome.ok) {
					const rows = outcome.result.data ?? [];
					if (shapeIndex === 0 && rows.some((row) => isListing(row) && !row.item)) {
						shapeIndex = 1;
						console.warn(LOG$12, "The trimmed $select returned no item names; selecting whole items instead.");
						continue;
					}
					shapeConfirmed = true;
					return outcome;
				}
				const canStepDown = !shapeConfirmed && shapeIndex < RESPONSE_SHAPES.length - 1;
				if (outcome.aborted || !canStepDown || !isQueryShapeError(outcome.error)) return outcome;
				shapeIndex++;
				console.warn(LOG$12, `The site rejected the trimmed query (${errorMessage(outcome.error)}); retrying with a fuller one.`);
			}
		};
		const feedRows = async (find, search, hits) => {
			const byId = new Map();
			for (let i = 0; i < hits.length; i += 250) {
				const ids = hits.slice(i, i + 250).map((hit) => hit._id);
				const wanted = new Set(ids);
				const outcome = await find({
					...search.base,
					_id: { $in: ids },
					$resolve: search.resolve ?? DEFAULT_RESOLVE,
					$limit: ids.length
				});
				if (!outcome.ok) {
					if (!outcome.aborted) console.warn(LOG$12, `Could not load the new listings for the feed: ${errorMessage(outcome.error)}`);
					break;
				}
				const rows = (outcome.result.data ?? []).filter(isListing);
				const unasked = rows.filter((row) => !wanted.has(row._id)).length;
				if (unasked > 0) console.warn(LOG$12, `Asked the site for ${ids.length} listings by id and got ${unasked} others; leaving those out of the feed.`);
				rows.forEach((row) => {
					if (wanted.has(row._id)) byId.set(row._id, row);
				});
			}
			const full = hits.map((hit) => byId.get(hit._id)).filter((row) => row !== void 0);
			if (full.length < hits.length) console.warn(LOG$12, `${hits.length - full.length} of ${hits.length} new listings could not be loaded for the feed (see Recent Hits).`);
			return full;
		};
		loop = createPollLoop({
			signal,
			service,
			tracker,
			label: "Livesearch",
			goneType: "item",
			recentHits: true,
			status: setStatus$2,
			findPage,
			toHit: toHit$1,
			keep: (search, listing) => passesOwnStats(search, listing) && passesSums(search, listing),
			feedRows
		});
		const watchSearch = (query, call, form) => {
			tracker.pageSearched(call, formSignatureOf(form));
			const base = marketSearchBase(query);
			const signature = stableStringify(base);
			pageSignature = signature;
			const outcome = loop.propose({
				base,
				resolve: query.$resolve,
				signature,
				form,
				ownStats: readsOwnStats(base),
				sums: sumsOf(base)
			});
			if (outcome === "reverted") setWatched(loop.currentSearch()?.form?.filters ?? null);
			else if (outcome === "queued") setWatched(form?.filters ?? null);
		};
		const onFind = (query, call) => {
			const page = getMarketPage();
			if (!page || page.loading !== true || !isMarketSearchQuery(query)) return;
			const filters = getMarketFilters(page);
			watchSearch(query, call, filters ? snapshotForm(filters) : null);
		};
		const onFindFailed = (query, call, error) => {
			const page = getMarketPage();
			if (!page || page.loading !== true || !isMarketSearchQuery(query)) return;
			tracker.pageSearchFailed(call, error);
		};
		const startFromPanel = async () => {
			const build = await getQueryBuilder();
			const page = getMarketPage();
			const filters = getMarketFilters(page);
			if (!build || !page || !filters || signal.aborted) return false;
			const form = snapshotForm(filters);
			if (!form) return false;
			watchSearch(marketSearchQuery(build, form.filters), {}, form);
			adoptForm(page, filters);
			return true;
		};
		const captureSearch = async () => {
			let attempt = 0;
			while (attempt < 2 && !signal.aborted) {
				if (!await loop.waitForConnection()) continue;
				attempt++;
				const filters = getMarketFilters();
				if (!filters) return false;
				setStatus$2("Searching...");
				try {
					filters.search();
				} catch (error) {
					console.warn(LOG$12, "Calling the page's search() failed.", error);
					return false;
				}
				if (await loop.waitForSearch(8e3)) return true;
			}
			if (!signal.aborted) console.warn(LOG$12, "The page's search never reached the market/listing find hook.");
			return false;
		};
		const offFind = onPageFind({
			found: onFind,
			failed: onFindFailed
		});
		if (!offFind) {
			tracker.release();
			loop.release();
			return "unavailable";
		}
		const pageSync = () => {
			tracker.sync();
		};
		try {
			activePageSync = pageSync;
			tracker.sync();
			if (!await startFromPanel() && !await captureSearch()) return signal.aborted ? "stopped" : "unavailable";
			await loop.run();
			return "stopped";
		} finally {
			offFind();
			setWatched(null);
			if (activePageSync === pageSync) activePageSync = null;
			tracker.release();
			loop.release();
		}
	};
	var LOG$11 = "[pd2-trade-enhancer]";
	var marker$1 = createRunMarker("pd2te-livesearch-running", "Livesearch", "Start");
	var run = null;
	var isLivesearchRunning = () => run !== null;
	var onStartButtonPress = () => {
		if (run) return;
		unlockSound();
		const current = {
			controller: new AbortController(),
			finalStatus: null
		};
		run = current;
		marker$1.set(true);
		showStopButton();
		setStatus$2("Starting...");
		livesearch$1(current);
	};
	var stopLivesearch = (reason) => {
		if (!run) return;
		run.finalStatus ??= [reason, "info"];
		run.controller.abort();
		showStartButton();
	};
	var onStopButtonPress = () => stopLivesearch(`Stopped at ${clockTime()}`);
	var stopLivesearchOffPage = () => {
		if (run && !isMarketPath()) stopLivesearch(`Stopped at ${clockTime()}: you left the Trade page`);
	};
	var onMarketPageMounted = () => {
		if (run) {
			onApiMarketPageMounted();
			return;
		}
		marker$1.reportLost(setStatus$2);
	};
	var livesearch$1 = async (current) => {
		const { controller } = current;
		const { signal } = controller;
		try {
			const problem = probeBridge();
			if (problem !== null) {
				console.warn(`${LOG$11} Livesearch can't start: ${problem}.`);
				current.finalStatus ??= ["Can't start: the site's app isn't reachable (see console)", "error"];
				return;
			}
			console.info(`${LOG$11} Livesearch started.`);
			if (await runApiLivesearch(signal) === "unavailable" && !signal.aborted) {
				console.warn(`${LOG$11} Livesearch stopped: the page's search never reached the site's API client.`);
				current.finalStatus ??= ["Stopped: couldn't capture the page's search (see console)", "error"];
			}
		} catch (error) {
			console.error(`${LOG$11} Livesearch stopped after an error:`, error);
			current.finalStatus ??= [`Stopped: ${errorMessage(error)} (see console)`, "error"];
		} finally {
			controller.abort();
			if (run === current) {
				run = null;
				marker$1.set(false);
				showStartButton();
				setStatus$2(...current.finalStatus ?? ["Stopped", "info"]);
			}
			console.info(`${LOG$11} Livesearch stopped.`);
		}
	};
	var MAX_RECENT_HITS = 50;
	var DEFAULT_TITLE = "Project Diablo 2";
	var inPanel = (selector) => settingsPanel.querySelector(selector);
	var settingsHeader = inPanel("#lsSettingsHeader");
	var searchNameInput = inPanel("#searchName");
	var delayInput = inPanel("#delayInput");
	var volumeInput = inPanel("#volumeInput");
	var pageSizeInput = inPanel("#pageSizeInput");
	var checkboxes = [
		[inPanel("#desktopNotificationsInput"), "desktopNotifications"],
		[inPanel("#enhancedFiltersInput"), "enhancedFilters"],
		[inPanel("#compactCardsInput"), "compactCards"],
		[inPanel("#cardTimesInput"), "cardTimes"],
		[inPanel("#showQueryInput"), "showQuery"],
		[inPanel("#autoSortFiltersInput"), "autoSortFilters"]
	];
	var SETTINGS_CHANGED_EVENT = "pd2te:settings-changed";
	var announceSettingsChanged = () => document.dispatchEvent(new Event(SETTINGS_CHANGED_EVENT));
	var recentHitsSection = inPanel("#lsRecentHits");
	var recentHitsList = inPanel("#lsRecentHitsList");
	var clearHitsButton = inPanel("#lsClearHits");
	var recentHits = [];
	var mountLivesearchUi = () => {
		const filters = document.getElementById("filters");
		if (!filters) return;
		showStoredSettings();
		const toolbar = filters.querySelector(":scope > .pd2te-toolbar-host");
		if (toolbar) toolbar.after(controls$1, settingsPanel);
		else filters.prepend(controls$1, settingsPanel);
		if (isLivesearchRunning()) showStopButton();
		else showStartButton();
	};
	var showStartButton = () => {
		stopButton$1.remove();
		controls$1.prepend(startButton);
	};
	var showStopButton = () => {
		startButton.remove();
		controls$1.prepend(stopButton$1);
	};
	var setStatus$2 = (text, tone = "info") => {
		statusLine$2.textContent = text;
		statusLine$2.dataset.tone = tone;
	};
	var setTabName = (name) => {
		searchNameInput.value = name;
		updateTabTitle(name);
	};
	var clearTabName = () => {
		if (searchNameInput.value !== "") setTabName("");
	};
	var showStoredSettings = () => {
		const settings = Settings.getSettings();
		delayInput.value = String(settings.delay);
		volumeInput.value = String(settings.volume);
		pageSizeInput.value = String(settings.pageSize);
		checkboxes.forEach(([input, key]) => {
			input.checked = settings[key];
		});
	};
	var toggleSettingsPanel = () => {
		settingsPanel.querySelectorAll("#lsSettingsPanel, #openSVG, #closeSVG").forEach((element) => element.classList.toggle("pd2te-hidden"));
		settingsHeader.classList.toggle("opened");
	};
	var saveNumberInput = (input, key) => {
		const settings = Settings.getSettings();
		settings[key] = Settings.sanitize(key, input.value, settings[key]);
		input.value = String(settings[key]);
		Settings.saveSettings(settings);
		announceSettingsChanged();
	};
	var saveBooleanSetting = (key, value) => {
		const settings = Settings.getSettings();
		settings[key] = value;
		Settings.saveSettings(settings);
		announceSettingsChanged();
	};
	var saveCheckbox = (input, key) => saveBooleanSetting(key, input.checked);
	var updateTabTitle = (searchName) => {
		document.title = searchName.trim() || DEFAULT_TITLE;
		renderTabTitle();
	};
	var clearRecentHits = () => {
		recentHits = [];
		renderRecentHits();
	};
	var addRecentHits = (hits) => {
		const time = clockTime();
		const ids = new Set(hits.map((hit) => hit.id));
		const kept = recentHits.filter((hit) => !ids.has(hit.id));
		recentHits = [...hits.map((hit) => ({
			...hit,
			time
		})), ...kept].slice(0, MAX_RECENT_HITS);
		renderRecentHits();
	};
	var renderRecentHits = () => {
		recentHitsList.replaceChildren(...recentHits.map((hit) => {
			const label = `${hit.time} ${hit.name}${hit.price ? ` - ${hit.price}` : ""}`;
			const link = Object.assign(document.createElement("a"), {
				href: listingPath(hit.id),
				target: "_blank",
				rel: "noopener",
				title: label,
				textContent: label
			});
			const item = document.createElement("li");
			item.append(link);
			return item;
		}));
		recentHitsSection.classList.toggle("pd2te-hidden", recentHits.length === 0);
	};
	var setLimits = (input, key) => {
		const { min, max } = Settings.LIMITS[key];
		input.min = String(min);
		input.max = String(max);
	};
	setLimits(delayInput, "delay");
	setLimits(volumeInput, "volume");
	setLimits(pageSizeInput, "pageSize");
	startButton.addEventListener("click", () => onStartButtonPress());
	stopButton$1.addEventListener("click", () => onStopButtonPress());
	settingsHeader.addEventListener("click", toggleSettingsPanel);
	searchNameInput.addEventListener("input", () => updateTabTitle(searchNameInput.value));
	delayInput.addEventListener("change", () => saveNumberInput(delayInput, "delay"));
	pageSizeInput.addEventListener("change", () => saveNumberInput(pageSizeInput, "pageSize"));
	volumeInput.addEventListener("change", () => {
		saveNumberInput(volumeInput, "volume");
		playNewItemSound();
	});
	checkboxes.forEach(([input, key]) => input.addEventListener("change", () => saveCheckbox(input, key)));
	clearHitsButton.addEventListener("click", () => {
		recentHits = [];
		renderRecentHits();
	});
	var DEFAULT_SORT = {
		field: "bumped_at",
		direction: -1
	};
	var MAX_BRANCHES = 64;
	var STALE_FLOOR = "2000-01-01T00:00:00.000Z";
	var RECENT_WINDOW_MS = 2592e5;
	var emptyModel = () => ({
		names: [],
		nameContains: "",
		price: "",
		priceExclude: "",
		hrPrice: {},
		types: [],
		bases: [],
		qualities: [],
		ethereal: "any",
		corrupted: "any",
		desecrated: "any",
		identified: "any",
		socketValues: [],
		socketRange: {},
		itemLevel: {},
		defense: {},
		mods: [],
		ignoreSocketed: false,
		excludeMods: [],
		groups: [],
		sums: [],
		corruptionOutcomes: [],
		corruptionAtLeast: 1,
		online: "any",
		inGame: "any",
		includeStale: true,
		classes: [],
		level: {},
		strength: {},
		dexterity: {},
		sort: { ...DEFAULT_SORT },
		custom: ""
	});
	var cloneModel = (model) => JSON.parse(JSON.stringify(model));
	var isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
	var toNumber = (value) => {
		if (typeof value === "number") return Number.isFinite(value) ? value : void 0;
		if (typeof value === "string" && value.trim() !== "") {
			const number = Number(value);
			return Number.isFinite(number) ? number : void 0;
		}
	};
	var toBool = (value) => value === true || value === "true" ? true : value === false || value === "false" ? false : void 0;
	var triOf = (value) => value === void 0 ? "any" : value ? "yes" : "no";
	var strings = (value) => Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
	var clean = (object) => {
		const record = object;
		Object.keys(record).forEach((key) => {
			if (record[key] === void 0) delete record[key];
		});
		return object;
	};
	var hasRange = (range) => range.min !== void 0 || range.max !== void 0;
	var rangeQuery = (range) => {
		const query = {};
		if (range.min !== void 0) query.$gte = range.min;
		if (range.max !== void 0) query.$lte = range.max;
		return Object.keys(query).length > 0 ? query : void 0;
	};
	var rangeOf = (query) => {
		if (!isRecord(query)) return void 0;
		const range = clean({
			min: toNumber(query.$gte),
			max: toNumber(query.$lte)
		});
		return hasRange(range) ? range : void 0;
	};
	var escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	var unescapeRegex = (text) => text.replace(/\\([.*+?^${}()|[\]\\])/g, "$1");
	var excludeLookahead = (exclude) => `^(?![\\s\\S]*(?:${exclude}))`;
	var priceRegex = (contains, exclude) => exclude === "" ? contains : `${excludeLookahead(exclude)}[\\s\\S]*(?:${contains})`;
	var PRICE_REGEX = /^\^\(\?!\[\\s\\S\]\*\(\?:([\s\S]*?)\)\)(?:\[\\s\\S\]\*\(\?:([\s\S]*)\))?$/;
	var splitPriceRegex = (text) => {
		const match = text.match(PRICE_REGEX);
		return match ? {
			exclude: match[1],
			contains: match[2] ?? ""
		} : {
			contains: text,
			exclude: ""
		};
	};
	var excludeBranches = (exclude) => [{ price: {
		$regex: excludeLookahead(exclude),
		$options: "i"
	} }, { price: null }];
	var excludeFromBranches = (branches) => {
		if (branches.length !== 2 || !branches.some((branch) => stableStringify(branch) === stableStringify({ price: null }))) return null;
		const other = branches.find((branch) => stableStringify(branch) !== stableStringify({ price: null }));
		if (!isRecord(other) || Object.keys(other).length !== 1 || !isRecord(other.price)) return null;
		const { $regex, $options } = other.price;
		if (typeof $regex !== "string" || $options !== "i" || Object.keys(other.price).length !== 2) return null;
		const split = splitPriceRegex($regex);
		return split.exclude !== "" && split.contains === "" && excludeLookahead(split.exclude) === $regex ? split.exclude : null;
	};
	var codesInString = (code) => {
		if (!code.trim().startsWith("{")) return null;
		try {
			const parsed = JSON.parse(code);
			return isRecord(parsed) && Array.isArray(parsed.$in) ? strings(parsed.$in) : null;
		} catch {
			return null;
		}
	};
	var flattenCodes = (codes) => {
		const out = [];
		codes.forEach((code) => (codesInString(code) ?? [code]).forEach((item) => {
			if (!out.includes(item)) out.push(item);
		}));
		return out;
	};
	var combinations = (items, size) => {
		if (size <= 0) return [[]];
		if (size > items.length) return [];
		const out = [];
		const walk = (start, picked) => {
			if (picked.length === size) {
				out.push([...picked]);
				return;
			}
			for (let i = start; i <= items.length - (size - picked.length); i++) {
				picked.push(items[i]);
				walk(i + 1, picked);
				picked.pop();
			}
		};
		walk(0, []);
		return out;
	};
	var ROLLED_FLAGS = () => [{ corrupted: true }, { desecrated: true }];
	var ROLL_LISTS = ["item.corruptions", "item.desecrations"];
	var isRolledFlags = (value) => Array.isArray(value) && value.length === 2 && value.some((part) => isRecord(part) && Object.keys(part).length === 1 && part.corrupted === true) && value.some((part) => isRecord(part) && Object.keys(part).length === 1 && part.desecrated === true);
	var modElemMatch = (condition) => {
		const match = {};
		let name = condition.key;
		let valueIndex = 0;
		const brace = condition.key.match(/^([\w_]+)\{([\d,]+)\}$/);
		if (brace) {
			name = brace[1];
			const fixed = brace[2].split(",");
			valueIndex = fixed.length;
			fixed.forEach((value, index) => {
				match[`values.${index}`] = parseInt(value, 10);
			});
		}
		if (condition.skill !== void 0) {
			valueIndex = 2;
			match["values.1"] = condition.skill;
		}
		const level = rangeQuery({
			min: condition.skillLevelMin,
			max: condition.skillLevelMax
		});
		if (level) match["values.0"] = level;
		if (condition.aura !== void 0) {
			valueIndex = 1;
			match["values.0"] = condition.aura;
		}
		if (name.includes("item_elemskill_")) valueIndex = 1;
		const value = rangeQuery({
			min: condition.min,
			max: condition.max
		});
		if (value) match[`values.${valueIndex}`] = value;
		if (!name.includes("|")) match.name = name;
		else if (condition.corrupted) match.name = { $in: name.split("|") };
		else match.$or = name.split("|").map((part) => ({ name: part }));
		if (condition.corrupted) match.$or = ROLLED_FLAGS();
		return { $elemMatch: match };
	};
	var conditionFromElemMatch = (value, vocab) => {
		if (!isRecord(value) || !isRecord(value.$elemMatch)) return null;
		const match = value.$elemMatch;
		const rolled = match.corrupted === true || isRolledFlags(match.$or);
		const orNames = Array.isArray(match.$or) && !isRolledFlags(match.$or) ? match.$or.map((part) => isRecord(part) && typeof part.name === "string" ? part.name : null) : null;
		const inList = isRecord(match.name) && Array.isArray(match.name.$in) ? match.name.$in : null;
		const name = typeof match.name === "string" ? match.name : inList && inList.length > 0 && inList.every((part) => typeof part === "string") ? inList.join("|") : orNames && orNames.every((part) => part !== null) ? orNames.join("|") : null;
		if (!name) return null;
		const literal = (index) => {
			const slot = match[`values.${index}`];
			return typeof slot === "number" ? slot : void 0;
		};
		const range = (index) => rangeOf(match[`values.${index}`]);
		const flagged = (condition) => rolled ? {
			...condition,
			corrupted: true
		} : condition;
		const withValue = (condition, index) => {
			const value = range(index);
			return flagged(clean({
				...condition,
				min: value?.min,
				max: value?.max
			}));
		};
		if (vocab.skillProperties.has(name)) {
			const level = range(0);
			return withValue(clean({
				key: name,
				skill: literal(1),
				skillLevelMin: level?.min,
				skillLevelMax: level?.max
			}), 2);
		}
		if (name === "item_aura") return withValue(clean({
			key: name,
			aura: literal(0)
		}), 1);
		if (name.includes("item_elemskill_")) return withValue({ key: name }, 1);
		const fixed = [];
		for (let index = 0; literal(index) !== void 0; index++) fixed.push(literal(index));
		if (fixed.length > 0) {
			const braced = `${name}{${fixed.join(",")}}`;
			if (vocab.propertyByKey.has(braced)) return withValue({ key: braced }, fixed.length);
			return null;
		}
		return withValue({ key: name }, 0);
	};
	var unflag = (condition) => {
		const copy = { ...condition };
		delete copy.corrupted;
		return copy;
	};
	var isOps = (value) => isRecord(value) && Object.keys(value).every((key) => key.startsWith("$"));
	var mergeOps = (a, b) => {
		const out = { ...a };
		for (const [op, value] of Object.entries(b)) {
			const previous = out[op];
			if (previous === void 0) {
				out[op] = value;
				continue;
			}
			if (stableStringify(previous) === stableStringify(value)) continue;
			const comparable = typeof previous === "number" && typeof value === "number" || typeof previous === "string" && typeof value === "string";
			if ((op === "$gte" || op === "$gt") && comparable) out[op] = previous < value ? value : previous;
			else if ((op === "$lte" || op === "$lt") && comparable) out[op] = previous > value ? value : previous;
			else if (op === "$all" && Array.isArray(previous) && Array.isArray(value)) out[op] = [...previous, ...value];
			else if (op === "$in" && Array.isArray(previous) && Array.isArray(value)) out[op] = previous.filter((item) => value.some((other) => stableStringify(item) === stableStringify(other)));
			else return null;
		}
		return out;
	};
	var mergeBranch = (a, b) => {
		const out = { ...a };
		let impossible = false;
		for (const [key, value] of Object.entries(b)) {
			const previous = out[key];
			if (previous === void 0) {
				out[key] = value;
				continue;
			}
			if (stableStringify(previous) === stableStringify(value)) continue;
			if (isOps(previous) && isOps(value)) {
				const merged = mergeOps(previous, value);
				if (merged === null) return {
					ok: false,
					key
				};
				if (Array.isArray(merged.$in) && merged.$in.length === 0) impossible = true;
				out[key] = merged;
				continue;
			}
			const plain = isOps(previous) ? value : previous;
			const ops = isOps(previous) ? previous : value;
			if (!isRecord(plain) && isOps(ops) && Object.keys(ops).length === 1 && Array.isArray(ops.$in)) {
				if (!ops.$in.includes(plain)) impossible = true;
				out[key] = plain;
				continue;
			}
			if (!isRecord(previous) && !isRecord(value)) {
				impossible = true;
				out[key] = value;
				continue;
			}
			return {
				ok: false,
				key
			};
		}
		return {
			ok: true,
			value: out,
			impossible
		};
	};
	var conflictError = (key) => ({
		ok: false,
		error: `Two parts of the search constrain "${key}" in ways one query can't hold (the server rejects $and); change one of them`
	});
	var parseCustom = (text) => {
		if (text.trim() === "") return {
			ok: true,
			value: {}
		};
		try {
			const parsed = JSON.parse(text);
			if (!isRecord(parsed)) return {
				ok: false,
				error: "The custom query must be a JSON object"
			};
			return {
				ok: true,
				value: parsed
			};
		} catch (error) {
			return {
				ok: false,
				error: `The custom query is not valid JSON: ${error instanceof Error ? error.message : String(error)}`
			};
		}
	};
	var rolledNameBranches = (names, need) => {
		if (need === 1) return ROLL_LISTS.map((list) => ({ [list]: { $in: names } }));
		return combinations(names, need).flatMap((set) => Array.from({ length: 2 ** set.length }, (_, mask) => {
			const branch = {};
			ROLL_LISTS.forEach((list, side) => {
				const part = set.filter((_, index) => (mask >> index & 1) === side);
				if (part.length > 0) branch[list] = { $all: part };
			});
			return branch;
		}));
	};
	var compile = (model) => {
		const form = { properties: {} };
		const dimensions = [];
		if (model.hardcore !== void 0) form.is_hardcore = model.hardcore;
		if (model.ladder !== void 0) form.is_ladder = model.ladder;
		const contains = model.nameContains.trim();
		if (contains !== "") form["item.name"] = {
			$regex: escapeRegex(contains),
			$options: "i"
		};
		else if (model.names.length === 1) form.name = model.names[0];
		else if (model.names.length > 1) form["item.name"] = { $in: [...model.names] };
		const priceContains = model.price.trim();
		const priceExclude = model.priceExclude.trim();
		if (priceExclude !== "") try {
			new RegExp(priceExclude);
		} catch {
			return {
				ok: false,
				error: "The price text to exclude isn't a valid pattern (Item)"
			};
		}
		if (priceContains !== "") form.price = priceRegex(priceContains, priceExclude);
		else if (priceExclude !== "") dimensions.push(excludeBranches(priceExclude));
		const hrPrice = rangeQuery(model.hrPrice);
		if (hrPrice) form.hr_price = hrPrice;
		if (model.types.length > 0) form["item.base.type_code"] = { $in: flattenCodes(model.types) };
		if (model.bases.length > 0) form["item.base_code"] = { $in: flattenCodes(model.bases) };
		const qualities = [...new Set(model.qualities)];
		const others = qualities.filter((quality) => quality !== "Runeword");
		if (qualities.includes("Runeword") && others.length > 0) dimensions.push([{ "item.quality.name": { $in: others } }, { "item.is_runeword": true }]);
		else if (qualities.includes("Runeword")) form["item.is_runeword"] = true;
		else if (others.length > 0) form["item.quality.name"] = { $in: others };
		const tri = (key, value) => {
			if (value !== "any") form[key] = value === "yes";
		};
		tri("item.is_ethereal", model.ethereal);
		tri("item.corrupted", model.corrupted);
		tri("item.desecrated", model.desecrated);
		tri("item.is_identified", model.identified);
		const sockets = { ...rangeQuery(model.socketRange) ?? {} };
		if (model.socketValues.length > 0) sockets.$in = [...new Set(model.socketValues)].sort((a, b) => a - b);
		if (Object.keys(sockets).length > 0) form["item.socket_count"] = sockets;
		const range = (key, value) => {
			const query = rangeQuery(value);
			if (query) form[key] = query;
		};
		range("item.item_level", model.itemLevel);
		range("item.defense.total", model.defense);
		const all = model.mods.map(modElemMatch);
		const outcomes = model.corruptionOutcomes.filter((outcome) => outcome.key !== "");
		if (outcomes.length > 0) {
			const names = [...new Set(outcomes.map((outcome) => outcome.key))];
			const need = Math.min(Math.max(1, Math.floor(model.corruptionAtLeast)), names.length);
			if (!outcomes.some((outcome) => hasRange(outcome))) dimensions.push(rolledNameBranches(names, need));
			else {
				const flagged = outcomes.map((outcome) => ({
					...outcome,
					corrupted: true
				}));
				if (need === flagged.length) all.push(...flagged.map(modElemMatch));
				else dimensions.push(combinations(flagged, need).map((set) => ({ "item.modifiers": { $all: set.map(modElemMatch) } })));
			}
		}
		if (all.length > 0) form["item.modifiers"] = { $all: all };
		if (model.excludeMods.length > 0) form["item.modifiers.name"] = { $nin: [...new Set(model.excludeMods)] };
		if (model.ignoreSocketed) form[OWN_MARKER] = ownMarkerValue();
		model.groups.forEach((group) => {
			if (group.mods.length === 0) return;
			const size = Math.min(Math.max(1, Math.floor(group.atLeast)), group.mods.length);
			dimensions.push(combinations(group.mods, size).map((set) => ({ "item.modifiers": { $all: set.map(modElemMatch) } })));
		});
		const sums = model.sums.filter((sum) => sum.terms.length > 0);
		if (sums.some((sum) => sum.min === void 0 || !(sum.min > 0))) return {
			ok: false,
			error: "Each sum needs a Min above 0 (Weighted Sums)"
		};
		if (sums.some((sum) => sum.max !== void 0 && sum.min !== void 0 && sum.max < sum.min)) return {
			ok: false,
			error: "A sum's Max is below its Min (Weighted Sums)"
		};
		if (sums.length > 0) form[SUMS_MARKER] = sumsMarkerValue(sums);
		if (model.sort.field === "pd2te_sum" && sums.length === 0) return {
			ok: false,
			error: "Sorting by sum needs a sum with mods in it (Weighted Sums)"
		};
		tri("online", model.online);
		tri("in_game", model.inGame);
		if (model.seller) form.user_id = model.seller.id;
		form.updated_at = { $gte: model.includeStale ? STALE_FLOOR : new Date(Date.now() - RECENT_WINDOW_MS).toISOString() };
		if (model.classes.length > 0) form["item.class_specifics"] = { $in: [...model.classes] };
		range("item.requirements.level", model.level);
		range("item.requirements.strength", model.strength);
		range("item.requirements.dexterity", model.dexterity);
		const custom = parseCustom(model.custom);
		if (!custom.ok) return custom;
		for (const [key, value] of Object.entries(custom.value)) {
			if (key === "$or" && Array.isArray(value)) {
				dimensions.push(value.filter(isRecord));
				continue;
			}
			const merged = mergeBranch(form[key] === void 0 ? {} : { [key]: form[key] }, { [key]: value });
			if (!merged.ok) return conflictError(merged.key);
			if (merged.impossible) return {
				ok: false,
				error: `The custom query and the filters contradict each other on "${key}": nothing can match both`
			};
			Object.assign(form, merged.value);
		}
		let branches = [];
		if (dimensions.length > 0) {
			branches = [{}];
			for (const dimension of dimensions) {
				if (dimension.length === 0) continue;
				const next = [];
				for (const branch of branches) for (const alternative of dimension) {
					const merged = mergeBranch(branch, alternative);
					if (!merged.ok) return conflictError(merged.key);
					if (!merged.impossible) next.push(merged.value);
				}
				branches = next;
				if (branches.length > MAX_BRANCHES) return {
					ok: false,
					error: `The OR groups expand to more than ${MAX_BRANCHES} combinations; use fewer or smaller groups`
				};
			}
			if (branches.length === 0) return {
				ok: false,
				error: "The OR groups contradict each other: no combination can match"
			};
			if (branches.length === 1) {
				const merged = mergeBranch(form, branches[0]);
				if (!merged.ok) return conflictError(merged.key);
				if (merged.impossible) return {
					ok: false,
					error: "The OR groups and the filters contradict each other: nothing can match both"
				};
				Object.assign(form, merged.value);
			} else form.$or = branches;
		}
		return {
			ok: true,
			value: {
				form,
				branches: branches.length > 1 ? branches.length : 0
			}
		};
	};
	var withOrDimensions = (query, dimensions) => {
		let branches = Array.isArray(query.$or) ? query.$or.filter(isRecord) : [{}];
		for (const dimension of dimensions) {
			const next = [];
			for (const branch of branches) for (const alternative of dimension) {
				const merged = mergeBranch(branch, alternative);
				if (!merged.ok) return null;
				if (!merged.impossible) next.push(merged.value);
			}
			branches = next;
			if (branches.length === 0 || branches.length > MAX_BRANCHES) return null;
		}
		return {
			...query,
			$or: branches
		};
	};
	var entriesFor = (codes, entries) => {
		const remaining = new Set(codes);
		const picked = [];
		[...entries].sort((a, b) => b.codes.length - a.codes.length).forEach((entry) => {
			if (entry.codes.length > 0 && !picked.includes(entry.key) && entry.codes.every((code) => remaining.has(code))) {
				picked.push(entry.key);
				entry.codes.forEach((code) => remaining.delete(code));
			}
		});
		remaining.forEach((code) => picked.push(code));
		return picked;
	};
	var codesOf = (value) => typeof value === "string" ? codesInString(value) ?? [value] : isRecord(value) ? strings(value.$in) : [];
	var isEveryCombination = (sets) => {
		if (sets.length === 0) return false;
		const size = sets[0].length;
		if (size === 0 || sets.some((set) => set.length !== size)) return false;
		const union = new Set(sets.flat());
		return new Set(sets.map((set) => stableStringify([...set].sort()))).size === sets.length && combinations([...union], size).length === sets.length;
	};
	var groupFromBranches = (branches, vocab) => {
		const sets = [];
		for (const branch of branches) {
			if (!isRecord(branch) || Object.keys(branch).length !== 1) return null;
			const modifiers = branch["item.modifiers"];
			if (!isRecord(modifiers) || !Array.isArray(modifiers.$all) || modifiers.$all.length === 0) return null;
			const conditions = [];
			for (const entry of modifiers.$all) {
				const condition = conditionFromElemMatch(entry, vocab);
				if (!condition) return null;
				conditions.push(condition);
			}
			sets.push(conditions);
		}
		const bySignature = new Map();
		sets.flat().forEach((condition) => bySignature.set(stableStringify(condition), condition));
		if (!isEveryCombination(sets.map((set) => set.map((condition) => stableStringify(condition))))) return null;
		return {
			atLeast: sets[0].length,
			mods: [...bySignature.values()]
		};
	};
	var rollListNames = (branch, list, op) => {
		const value = branch[list];
		if (value === void 0) return [];
		if (!isRecord(value) || Object.keys(value).length !== 1) return null;
		const raw = value[op];
		if (!Array.isArray(raw)) return null;
		const names = strings(raw);
		return names.length > 0 && names.length === raw.length ? names : null;
	};
	var rolledNamesFromBranches = (branches) => {
		if (branches.length === 0) return null;
		const usesRollListsOnly = (branch) => isRecord(branch) && Object.keys(branch).length > 0 && Object.keys(branch).every((key) => ROLL_LISTS.includes(key));
		if (!branches.every(usesRollListsOnly)) return null;
		const records = branches;
		if (records.length === 2 && records.every((branch) => Object.keys(branch).length === 1)) {
			const lists = records.map((branch) => Object.keys(branch)[0]);
			const [a, b] = records.map((branch, index) => rollListNames(branch, lists[index], "$in"));
			if (lists[0] !== lists[1] && a && b && a.length === b.length && a.every((name) => b.includes(name))) return {
				names: a,
				atLeast: 1
			};
		}
		const splits = [];
		for (const branch of records) {
			const split = ROLL_LISTS.map((list) => rollListNames(branch, list, "$all"));
			if (split.some((names) => names === null)) return null;
			const [first, second] = split;
			if (first.some((name) => second.includes(name))) return null;
			splits.push([first, second]);
		}
		const size = splits[0][0].length + splits[0][1].length;
		const ways = new Map();
		for (const [first, second] of splits) {
			const set = stableStringify([...first, ...second].sort());
			const seen = ways.get(set) ?? new Set();
			seen.add(stableStringify([[...first].sort(), [...second].sort()]));
			ways.set(set, seen);
		}
		if (splits.length !== ways.size * 2 ** size || [...ways.values()].some((seen) => seen.size !== 2 ** size)) return null;
		if (!isEveryCombination([...ways.keys()].map((set) => JSON.parse(set)))) return null;
		return {
			names: [...new Set(splits.flatMap(([first, second]) => [...first, ...second]))],
			atLeast: size
		};
	};
	var parse = (input, vocab) => {
		const model = emptyModel();
		const rest = JSON.parse(JSON.stringify(input));
		const take = (key) => {
			const value = rest[key];
			delete rest[key];
			return value;
		};
		const leave = (key, value) => {
			if (value !== void 0) rest[key] = value;
		};
		const addOutcomes = (conditions, atLeast) => {
			conditions.forEach((condition) => {
				if (!model.corruptionOutcomes.some((outcome) => outcome.key === condition.key)) model.corruptionOutcomes.push(condition);
			});
			model.corruptionAtLeast = atLeast;
		};
		const properties = take("properties");
		if (isRecord(properties)) Object.entries(properties).forEach(([key, spec]) => {
			if (!isRecord(spec)) return;
			model.mods.push(clean({
				key,
				min: toNumber(spec.min),
				max: toNumber(spec.max),
				skill: toNumber(isRecord(spec.skill) ? spec.skill.value : spec.skill),
				skillLevelMin: toNumber(spec.skillLevelMin),
				skillLevelMax: toNumber(spec.skillLevelMax),
				aura: toNumber(isRecord(spec.aura) ? spec.aura.value : spec.aura)
			}));
		});
		model.hardcore = toBool(take("is_hardcore"));
		model.ladder = toBool(take("is_ladder"));
		clean(model);
		const name = take("name");
		if (typeof name === "string" && name.trim() !== "") model.names.push(name);
		const itemName = take("item.name");
		if (typeof itemName === "string") model.names.push(itemName);
		else if (isRecord(itemName)) {
			model.names.push(...strings(itemName.$in));
			if (typeof itemName.$regex === "string") model.nameContains = unescapeRegex(itemName.$regex);
		} else leave("item.name", itemName);
		const price = take("price");
		if (typeof price === "string") {
			const split = splitPriceRegex(price);
			model.price = split.contains;
			model.priceExclude = split.exclude;
		} else leave("price", price);
		const takeRange = (key) => {
			const value = take(key);
			const range = rangeOf(value);
			if (range) return range;
			leave(key, value);
			return {};
		};
		model.hrPrice = takeRange("hr_price");
		const typeCodes = [...codesOf(take("type")), ...codesOf(take("item.base.type_code"))];
		if (typeCodes.length > 0) model.types = entriesFor(typeCodes, vocab.types.map((type) => ({
			key: type.code,
			codes: flattenCodes([type.code])
		})));
		const baseCodes = [...codesOf(take("base")), ...codesOf(take("item.base_code"))];
		if (baseCodes.length > 0) model.bases = entriesFor(baseCodes, vocab.bases.map((base) => ({
			key: base.code,
			codes: flattenCodes([base.code])
		})));
		const quality = take("quality");
		if (typeof quality === "string" && quality !== "") model.qualities.push(quality);
		const qualityName = take("item.quality.name");
		if (typeof qualityName === "string") model.qualities.push(qualityName);
		else if (isRecord(qualityName)) model.qualities.push(...strings(qualityName.$in));
		else leave("item.quality.name", qualityName);
		const runeword = take("item.is_runeword");
		if (runeword === true) model.qualities.push("Runeword");
		else leave("item.is_runeword", runeword);
		model.qualities = [...new Set(model.qualities)];
		const tri = (siteKey, path) => {
			const siteValue = toBool(take(siteKey));
			return triOf(toBool(take(path)) ?? siteValue);
		};
		model.ethereal = tri("ethereal", "item.is_ethereal");
		model.corrupted = tri("corrupted", "item.corrupted");
		model.desecrated = tri("desecrated", "item.desecrated");
		model.identified = tri("is_identified", "item.is_identified");
		model.socketRange = clean({
			min: toNumber(take("sockets_min")),
			max: toNumber(take("sockets_max"))
		});
		const socketCount = take("item.socket_count");
		if (typeof socketCount === "number") model.socketValues.push(socketCount);
		else if (isRecord(socketCount)) {
			if (Array.isArray(socketCount.$in)) model.socketValues.push(...socketCount.$in.map(toNumber).filter((count) => count !== void 0));
			const socketRange = rangeOf(socketCount);
			if (socketRange) model.socketRange = {
				...model.socketRange,
				...socketRange
			};
		} else leave("item.socket_count", socketCount);
		const socketed = take("item.is_socketed");
		if (socketed === false) model.socketValues.push(0);
		else leave("item.is_socketed", socketed);
		model.itemLevel = takeRange("item.item_level");
		model.defense = takeRange("item.defense.total");
		const modifiers = take("item.modifiers");
		if (isRecord(modifiers)) {
			const entries = Array.isArray(modifiers.$all) ? modifiers.$all : [modifiers];
			const unparsed = [];
			const flaggedOutcomes = [];
			entries.forEach((entry) => {
				const condition = conditionFromElemMatch(entry, vocab);
				if (!condition) unparsed.push(entry);
				else if (condition.corrupted) flaggedOutcomes.push(unflag(condition));
				else model.mods.push(condition);
			});
			if (flaggedOutcomes.length > 0) addOutcomes(flaggedOutcomes, flaggedOutcomes.length);
			if (unparsed.length > 0) rest["item.modifiers"] = { $all: unparsed };
		} else leave("item.modifiers", modifiers);
		const modifierNames = take("item.modifiers.name");
		if (typeof modifierNames === "string") model.mods.push({ key: modifierNames });
		else if (isRecord(modifierNames)) {
			model.excludeMods.push(...strings(modifierNames.$nin));
			const anyOf = strings(modifierNames.$in);
			if (anyOf.length > 0) model.groups.push({
				atLeast: 1,
				mods: anyOf.map((key) => ({ key }))
			});
		} else leave("item.modifiers.name", modifierNames);
		const ownStats = take(OWN_MARKER);
		if (isOwnMarkerValue(ownStats)) model.ignoreSocketed = true;
		else leave(OWN_MARKER, ownStats);
		const sumsMarker = take(SUMS_MARKER);
		const sums = sumsFromMarker(sumsMarker);
		if (sums) model.sums = sums;
		else leave(SUMS_MARKER, sumsMarker);
		model.online = triOf(toBool(take("online")));
		model.inGame = triOf(toBool(take("in_game")));
		const userId = take("user_id");
		if (typeof userId === "string" && userId !== "") model.seller = { id: userId };
		else leave("user_id", userId);
		const updatedAt = take("updated_at");
		if (updatedAt !== void 0) {
			const floor = isRecord(updatedAt) && typeof updatedAt.$gte === "string" ? Date.parse(updatedAt.$gte) : NaN;
			if (Number.isFinite(floor)) model.includeStale = floor < Date.now() - 2592e6;
			else leave("updated_at", updatedAt);
		}
		const classReq = take("class_req");
		if (typeof classReq === "string" && classReq !== "") model.classes.push(classReq);
		const classes = take("item.class_specifics");
		if (typeof classes === "string") model.classes.push(classes);
		else if (isRecord(classes)) model.classes.push(...strings(classes.$in));
		else leave("item.class_specifics", classes);
		const requirement = (minKey, maxKey, path) => {
			return {
				...clean({
					min: toNumber(take(minKey)),
					max: toNumber(take(maxKey))
				}),
				...takeRange(path)
			};
		};
		model.level = requirement("level_req_min", "level_req_max", "item.requirements.level");
		model.strength = requirement("strength_req_min", "strength_req_max", "item.requirements.strength");
		model.dexterity = requirement("dexterity_req_min", "dexterity_req_max", "item.requirements.dexterity");
		const or = take("$or");
		if (Array.isArray(or)) {
			const group = groupFromBranches(or, vocab);
			const byName = group ? null : rolledNamesFromBranches(or);
			const priceExclude = group || byName ? null : excludeFromBranches(or);
			if (group && group.mods.every((mod) => mod.corrupted)) addOutcomes(group.mods.map(unflag), group.atLeast);
			else if (group) model.groups.push(group);
			else if (byName) addOutcomes(byName.names.map((key) => ({ key })), byName.atLeast);
			else if (priceExclude !== null) model.priceExclude = priceExclude;
			else rest.$or = or;
		} else leave("$or", or);
		if (Object.keys(rest).length > 0) model.custom = JSON.stringify(rest, null, 2);
		return model;
	};
	var sanitizeModel = (raw) => {
		if (!isRecord(raw)) return null;
		const model = emptyModel();
		const tri = (value) => value === "yes" || value === "no" ? value : "any";
		const range = (value) => isRecord(value) ? clean({
			min: toNumber(value.min),
			max: toNumber(value.max)
		}) : {};
		const numbers = (value) => Array.isArray(value) ? value.map(toNumber).filter((item) => item !== void 0) : [];
		const condition = (value) => isRecord(value) && typeof value.key === "string" ? clean({
			key: value.key,
			min: toNumber(value.min),
			max: toNumber(value.max),
			skill: toNumber(value.skill),
			skillLevelMin: toNumber(value.skillLevelMin),
			skillLevelMax: toNumber(value.skillLevelMax),
			aura: toNumber(value.aura),
			corrupted: value.corrupted === true ? true : void 0
		}) : null;
		const conditions = (value) => Array.isArray(value) ? value.map(condition).filter((item) => item !== null) : [];
		model.hardcore = toBool(raw.hardcore);
		model.ladder = toBool(raw.ladder);
		clean(model);
		model.names = strings(raw.names);
		model.nameContains = typeof raw.nameContains === "string" ? raw.nameContains : "";
		model.price = typeof raw.price === "string" ? raw.price : "";
		model.priceExclude = typeof raw.priceExclude === "string" ? raw.priceExclude : "";
		model.hrPrice = range(raw.hrPrice);
		model.types = strings(raw.types);
		model.bases = strings(raw.bases);
		model.qualities = strings(raw.qualities);
		model.ethereal = tri(raw.ethereal);
		model.corrupted = tri(raw.corrupted);
		model.desecrated = tri(raw.desecrated);
		model.identified = tri(raw.identified);
		model.socketValues = numbers(raw.socketValues);
		model.socketRange = range(raw.socketRange);
		model.itemLevel = range(raw.itemLevel);
		model.defense = range(raw.defense);
		model.mods = conditions(raw.mods);
		model.ignoreSocketed = raw.ignoreSocketed === true;
		model.excludeMods = strings(raw.excludeMods);
		model.groups = Array.isArray(raw.groups) ? raw.groups.filter(isRecord).map((group) => ({
			atLeast: Math.max(1, Math.floor(toNumber(group.atLeast) ?? 1)),
			mods: conditions(group.mods)
		})) : [];
		model.sums = Array.isArray(raw.sums) ? raw.sums.map(sanitizeSum).filter((sum) => sum !== null) : [];
		model.corruptionOutcomes = conditions(raw.corruptionOutcomes).map(unflag);
		model.corruptionAtLeast = Math.max(1, Math.floor(toNumber(raw.corruptionAtLeast) ?? 1));
		model.online = tri(raw.online);
		model.inGame = tri(raw.inGame);
		if (isRecord(raw.seller) && typeof raw.seller.id === "string") model.seller = clean({
			id: raw.seller.id,
			name: typeof raw.seller.name === "string" ? raw.seller.name : void 0
		});
		model.includeStale = raw.includeStale !== false;
		model.classes = strings(raw.classes);
		model.level = range(raw.level);
		model.strength = range(raw.strength);
		model.dexterity = range(raw.dexterity);
		model.sort = isRecord(raw.sort) && typeof raw.sort.field === "string" && raw.sort.field !== "" ? {
			field: raw.sort.field,
			direction: raw.sort.direction === 1 ? 1 : -1
		} : { ...DEFAULT_SORT };
		model.custom = typeof raw.custom === "string" ? raw.custom : "";
		return model;
	};
	var isVocabSource = (value) => isObject(value) && Array.isArray(value.propertyOptions) && Array.isArray(value.skillOptions) && Array.isArray(value.auraOptions) && Array.isArray(value.skillProperties) && Array.isArray(value.allItemNames) && isObject(value.itemTypes);
	var isSiteFilters = (proxy) => isVocabSource(proxy) && hasFunctions(proxy, "clearFilters", "loadFilter");
	var isSitePage = (page) => Array.isArray(page.savedFilters);
	var getSiteFilters = (page) => {
		const filters = getMarketFilters(page);
		return filters && isSiteFilters(filters) ? filters : null;
	};
	var getFilterService = () => {
		try {
			const service = getApi()?.service("market/filter");
			return hasFunctions(service, "find", "create", "patch", "remove") ? service : null;
		} catch {
			return null;
		}
	};
	var requireFilterService = () => {
		const service = getFilterService();
		if (!service) throw new Error("the site's saved-filter service was not found");
		return service;
	};
	var fetchAllSavedFilters = async (service) => {
		const rows = [];
		for (;;) {
			const result = await service.find({ query: {
				$limit: 250,
				$skip: rows.length,
				$sort: {
					order: 1,
					_id: 1
				}
			} });
			const page = result.data ?? [];
			rows.push(...page);
			if (page.length === 0 || rows.length >= (result.total ?? rows.length)) return rows;
		}
	};
	var readVocab = (site) => {
		const clone = (value) => JSON.parse(JSON.stringify(value));
		const properties = clone(site.propertyOptions).filter((option) => typeof option.key === "string");
		const types = Object.values(clone(site.itemTypes)).filter((type) => type.display).sort((a, b) => a.display.localeCompare(b.display));
		const bases = [];
		types.forEach((type) => type.bases.forEach((base) => {
			if (base.display) bases.push({
				code: base.code,
				display: base.display,
				typeCode: type.code
			});
		}));
		return {
			properties,
			propertyByKey: new Map(properties.map((option) => [option.key, option])),
			skills: clone(site.skillOptions),
			auras: clone(site.auraOptions),
			skillProperties: new Set(site.skillProperties),
			types,
			bases,
			names: clone(site.allItemNames).filter((name) => typeof name === "string")
		};
	};
	var vocabLoad = null;
	var loadVocab = () => {
		vocabLoad ??= (async () => {
			const page = await loadRouteComponent(MARKET_ROUTE);
			const filters = (isObject(page?.components) ? Object.values(page.components) : []).find((component) => isObject(component) && component.name === "GameMarketFilters");
			const data = isObject(filters) && typeof filters.data === "function" ? filters.data() : null;
			if (!isVocabSource(data)) throw new Error("the site's market filter lists were not found");
			return readVocab(data);
		})().catch((error) => {
			vocabLoad = null;
			throw error;
		});
		return vocabLoad;
	};
	var displayLabel = (label) => label.replace(/\{X\}/g, "X").replace(/%d%%/g, "X%").replace(/%d/g, "X").replace(/%s/g, "skill").replace(/\s+/g, " ").trim();
	var SOCKETS_ROLL = "item_numsockets";
	var propertyLabel = (vocab, key) => {
		if (key === "item_numsockets") return "Sockets";
		const exact = vocab.propertyByKey.get(key);
		if (exact) return displayLabel(exact.label);
		const parts = key.split("|");
		const match = vocab.properties.find((option) => parts.includes(option.key));
		return match ? displayLabel(match.label) : key;
	};
	var QUALITIES = [
		"Normal",
		"Superior",
		"Magic",
		"Rare",
		"Crafted",
		"Set",
		"Unique",
		"Runeword"
	];
	var CLASSES = [
		{
			value: "amazon",
			label: "Amazon"
		},
		{
			value: "assassin",
			label: "Assassin"
		},
		{
			value: "barbarian",
			label: "Barbarian"
		},
		{
			value: "druid",
			label: "Druid"
		},
		{
			value: "necromancer",
			label: "Necromancer"
		},
		{
			value: "paladin",
			label: "Paladin"
		},
		{
			value: "sorceress",
			label: "Sorceress"
		}
	];
	var SORT_FIELDS = [
		{
			value: "bumped_at",
			label: "Last bumped"
		},
		{
			value: "updated_at",
			label: "Last saved (bump, price or any edit)"
		},
		{
			value: "created_at",
			label: "Listed"
		},
		{
			value: "user_last_online",
			label: "Seller last online (site)"
		},
		{
			value: "user_last_ingame",
			label: "Seller last in game"
		}
	];
	var findUserByName = async (name) => {
		const service = getApi()?.service("security/user");
		if (!service || typeof service.find !== "function") throw new Error("the site's user service was not found");
		const exact = {
			$regex: `^${escapeRegex(name.trim())}$`,
			$options: "i"
		};
		for (const query of [{ username: exact }, { "game.accounts": exact }]) {
			const user = ((await service.find({ query: {
				...query,
				$limit: 1
			} })).data ?? []).find((row) => typeof row._id === "string");
			if (user) return user;
		}
		return null;
	};
	var h = (tag, attrs = {}, ...children) => {
		const node = document.createElement(tag);
		Object.entries(attrs).forEach(([key, value]) => {
			if (value === void 0 || value === false) return;
			if (key === "class") node.className = String(value);
			else if (key === "text") node.textContent = String(value);
			else if (value === true) node.setAttribute(key, "");
			else node.setAttribute(key, String(value));
		});
		children.forEach((child) => {
			if (child !== null && child !== void 0 && child !== false) node.append(child);
		});
		return node;
	};
	var field = (label, ...controls) => h("div", { class: "pd2te-field" }, h("div", {
		class: "pd2te-label",
		text: label
	}), ...controls);
	var row = (...children) => h("div", { class: "pd2te-row" }, ...children);
	var button$1 = (label, onClick, className = "") => {
		const node = h("button", {
			type: "button",
			class: `pd2te-btn ${className}`.trim(),
			text: label
		});
		node.addEventListener("click", onClick);
		return node;
	};
	var numberInput = (value, placeholder, onChange) => {
		const input = h("input", {
			class: "pd2te-input pd2te-number",
			type: "number",
			placeholder,
			autocomplete: "off"
		});
		if (value !== void 0) input.value = String(value);
		input.addEventListener("change", () => onChange(toNumber(input.value)));
		return input;
	};
	var textInput = (value, placeholder, onChange, maxLength) => {
		const input = h("input", {
			class: "pd2te-input",
			type: "text",
			placeholder,
			autocomplete: "off",
			maxlength: maxLength
		});
		input.value = value;
		input.addEventListener("change", () => onChange(input.value));
		return input;
	};
	var selectInput = (options, value, onChange) => {
		const select = h("select", { class: "pd2te-input" });
		options.forEach((option) => {
			const node = h("option", {
				value: option.value,
				text: option.label
			});
			if (option.value === value) node.selected = true;
			select.append(node);
		});
		select.addEventListener("change", () => onChange(select.value));
		return select;
	};
	var triSelect = (value, labels, onChange) => selectInput([
		{
			value: "any",
			label: labels[0]
		},
		{
			value: "yes",
			label: labels[1]
		},
		{
			value: "no",
			label: labels[2]
		}
	], value, onChange);
	var rangeInputs = (range, onChange, labels = ["Min", "Max"]) => {
		const current = { ...range };
		const emit = () => {
			const next = {};
			if (current.min !== void 0) next.min = current.min;
			if (current.max !== void 0) next.max = current.max;
			onChange(next);
		};
		return row(numberInput(range.min, labels[0], (min) => {
			current.min = min;
			emit();
		}), numberInput(range.max, labels[1], (max) => {
			current.max = max;
			emit();
		}));
	};
	var checkbox = (label, checked, onChange, title) => {
		const input = h("input", {
			type: "checkbox",
			class: "pd2te-checkbox"
		});
		input.checked = checked;
		input.addEventListener("change", () => onChange(input.checked));
		return h("label", {
			class: "pd2te-check",
			title
		}, input, h("span", { text: label }));
	};
	var chips = (items, onRemove) => h("div", { class: "pd2te-chips" }, ...items.map((item) => {
		const remove = h("button", {
			type: "button",
			class: "pd2te-chip-remove",
			title: "Remove",
			text: "×"
		});
		remove.addEventListener("click", () => onRemove(item.value));
		return h("span", {
			class: "pd2te-chip",
			title: item.label
		}, h("span", {
			class: "pd2te-chip-text",
			text: item.label
		}), remove);
	}));
	var uniqueLabels = (options) => {
		const counts = new Map();
		options.forEach((option) => counts.set(option.label, (counts.get(option.label) ?? 0) + 1));
		const byLabel = new Map();
		options.forEach((option) => {
			const label = (counts.get(option.label) ?? 0) > 1 ? `${option.label} [${option.value}]` : option.label;
			if (!byLabel.has(label)) byLabel.set(label, option.value);
		});
		return byLabel;
	};
	var MAX_DROPDOWN_ROWS = 80;
	var typeahead = ({ options, placeholder, onPick, current }) => {
		const single = current !== void 0;
		const entries = [...uniqueLabels(options).entries()].map(([label, value]) => ({
			label,
			value,
			lower: label.toLowerCase(),
			lowerValue: value.toLowerCase()
		}));
		let chosen = entries.find((entry) => single && entry.value === current) ?? null;
		const input = h("input", {
			class: "pd2te-input pd2te-picker-input",
			type: "text",
			placeholder,
			autocomplete: "off",
			role: "combobox",
			"aria-expanded": "false"
		});
		input.value = chosen?.label ?? "";
		const list = h("div", {
			class: "pd2te-dropdown pd2te-hidden",
			role: "listbox"
		});
		let shown = [];
		let active = -1;
		let navigated = false;
		const matching = () => {
			const text = input.value.trim().toLowerCase();
			if (text === "") return entries;
			const starts = [];
			const contains = [];
			entries.forEach((entry) => {
				if (entry.lower.startsWith(text)) starts.push(entry);
				else if (entry.lower.includes(text) || entry.lowerValue === text) contains.push(entry);
			});
			return [...starts, ...contains];
		};
		const close = () => {
			list.classList.add("pd2te-hidden");
			input.setAttribute("aria-expanded", "false");
			active = -1;
			navigated = false;
		};
		const restore = () => {
			input.value = chosen?.label ?? "";
			input.placeholder = placeholder;
			input.classList.remove("pd2te-invalid");
		};
		const choose = (entry) => {
			if (single) chosen = entry;
			input.value = single ? entry.label : "";
			input.classList.remove("pd2te-invalid");
			close();
			if (single) input.blur();
			onPick(entry.value);
		};
		const highlight = () => {
			[...list.children].forEach((row, index) => row.classList.toggle("active", index === active));
			if (active >= 0) list.children[active]?.scrollIntoView({ block: "nearest" });
		};
		const open = () => {
			const matches = matching();
			shown = single ? matches : matches.slice(0, MAX_DROPDOWN_ROWS);
			active = input.value.trim() !== "" && shown.length > 0 ? 0 : chosen ? shown.indexOf(chosen) : -1;
			list.replaceChildren(...shown.map((entry) => {
				const row = h("div", {
					class: entry === chosen ? "pd2te-dropdown-row pd2te-current" : "pd2te-dropdown-row",
					role: "option",
					text: entry.label,
					title: single ? entry.label : entry.value
				});
				row.addEventListener("mousedown", (event) => {
					event.preventDefault();
					choose(entry);
				});
				return row;
			}), matches.length > shown.length ? h("div", {
				class: "pd2te-dropdown-note",
				text: `${matches.length - shown.length} more, keep typing`
			}) : "", matches.length === 0 ? h("div", {
				class: "pd2te-dropdown-note",
				text: "No matches"
			}) : "");
			highlight();
			list.classList.remove("pd2te-hidden");
			input.setAttribute("aria-expanded", "true");
		};
		const add = () => {
			const text = input.value.trim();
			if (active >= 0 && shown[active] && (text !== "" || navigated)) {
				choose(shown[active]);
				return;
			}
			if (text === "") {
				close();
				return;
			}
			const lower = text.toLowerCase();
			const entry = entries.find((item) => item.lower === lower) ?? entries.find((item) => item.lowerValue === lower);
			if (!entry) {
				input.classList.add("pd2te-invalid");
				return;
			}
			choose(entry);
		};
		input.addEventListener("focus", () => {
			if (single) {
				input.placeholder = chosen?.label ?? placeholder;
				input.value = "";
			}
			open();
		});
		input.addEventListener("input", () => {
			input.classList.remove("pd2te-invalid");
			navigated = false;
			open();
		});
		input.addEventListener("blur", () => {
			close();
			if (single) restore();
		});
		input.addEventListener("keydown", (event) => {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				if (list.classList.contains("pd2te-hidden")) open();
				if (shown.length === 0) return;
				active = event.key === "ArrowDown" ? (active + 1) % shown.length : (active - 1 + shown.length) % shown.length;
				navigated = true;
				highlight();
			} else if (event.key === "Enter") {
				event.preventDefault();
				add();
			} else if (event.key === "Escape") {
				close();
				if (single) input.blur();
			}
		});
		return {
			input,
			list
		};
	};
	var picker = (options, placeholder, onPick) => {
		const { input, list } = typeahead({
			options,
			placeholder,
			onPick
		});
		return h("div", { class: "pd2te-picker" }, input, list);
	};
	var combo = (options, current, placeholder, onPick) => {
		const { input, list } = typeahead({
			options,
			placeholder,
			onPick,
			current
		});
		return h("div", { class: "pd2te-picker" }, input, list);
	};
	var multiPicker = ({ options, selected, placeholder, onChange, inline, columns }) => {
		const current = [...selected];
		const toggle = (value, on) => {
			const index = current.indexOf(value);
			if (on === index >= 0) return;
			if (on) current.push(value);
			else current.splice(index, 1);
			onChange([...current]);
		};
		if (inline ?? options.length <= 12) {
			const grid = h("div", { class: "pd2te-check-grid" }, ...options.map((option) => checkbox(option.label, current.includes(option.value), (checked) => toggle(option.value, checked))));
			if (columns) grid.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
			return grid;
		}
		const labelOf = (value) => options.find((option) => option.value === value)?.label ?? value;
		return h("div", { class: "pd2te-multi" }, chips(current.map((value) => ({
			value,
			label: labelOf(value)
		})), (value) => toggle(value, false)), picker(options, placeholder, (value) => toggle(value, true)));
	};
	var PANEL_STATE_KEY = "pd2te-filter-panels";
	var readPanelState = () => {
		try {
			const parsed = JSON.parse(localStorage.getItem(PANEL_STATE_KEY) ?? "{}");
			return typeof parsed === "object" && parsed !== null ? parsed : {};
		} catch {
			return {};
		}
	};
	var savePanelState = (id, open) => {
		try {
			localStorage.setItem(PANEL_STATE_KEY, JSON.stringify({
				...readPanelState(),
				[id]: open
			}));
		} catch {}
	};
	var panel$1 = (id, title, body, defaultOpen, extra) => {
		let open = readPanelState()[id] ?? defaultOpen;
		const toggle = h("span", {
			class: "pd2te-panel-toggle",
			text: open ? "−" : "+"
		});
		const header = h("div", { class: `pd2te-panel-header${open ? " open" : ""}` }, h("h2", {
			class: "pd2te-panel-title",
			text: title
		}), extra, toggle);
		body.classList.add("pd2te-panel-body");
		body.classList.toggle("pd2te-hidden", !open);
		header.addEventListener("click", (event) => {
			if (extra && extra.contains(event.target)) return;
			open = !open;
			body.classList.toggle("pd2te-hidden", !open);
			header.classList.toggle("open", open);
			toggle.textContent = open ? "−" : "+";
			savePanelState(id, open);
		});
		return h("div", { class: "pd2te-panel" }, header, body);
	};
	var makeSection = (build) => {
		let el;
		const refresh = () => {
			if (!el.isConnected) return;
			const next = build(refresh);
			el.replaceWith(next);
			el = next;
		};
		el = build(refresh);
		return {
			get el() {
				return el;
			},
			refresh
		};
	};
	var SKIPPED_MODIFIERS = new Set([
		"corrupted",
		"desecrated",
		"desecrator",
		"item_shiny_appearance",
		"item_splashonhit"
	]);
	var typeCodeFor = (item, vocab) => {
		const code = item.base?.type_code;
		return code ? vocab.types.find((type) => flattenCodes([type.code]).includes(code)) : void 0;
	};
	var baseCodeFor = (item, vocab) => {
		const code = item.base_code;
		return code ? vocab.bases.find((base) => flattenCodes([base.code]).includes(code)) : void 0;
	};
	var modChoice = (modifier, vocab) => {
		const name = modifier.name;
		if (!name || SKIPPED_MODIFIERS.has(name)) return null;
		const label = modifier.label && modifier.label !== "undefined" ? modifier.label : propertyLabel(vocab, name);
		const values = Array.isArray(modifier.values) ? modifier.values.map(toNumber) : [];
		const at = (index) => values[index];
		if (vocab.skillProperties.has(name)) {
			const condition = { key: name };
			if (at(1) !== void 0) condition.skill = at(1);
			if (at(0) !== void 0) condition.skillLevelMin = at(0);
			return {
				condition,
				value: at(2),
				label
			};
		}
		if (name === "item_aura") {
			const condition = { key: name };
			if (at(0) !== void 0) condition.aura = at(0);
			return {
				condition,
				value: at(1),
				label
			};
		}
		if (name.includes("item_elemskill_")) return {
			condition: { key: name },
			value: at(1),
			label
		};
		if (at(0) !== void 0 && vocab.propertyByKey.has(`${name}{${at(0)}}`)) return {
			condition: { key: `${name}{${at(0)}}` },
			value: at(1),
			label
		};
		return {
			condition: { key: name },
			value: at(0),
			label
		};
	};
	var buildItemPanel = (item, { vocab, ownStats, actions }) => {
		const choices = [];
		const rows = [];
		const option = (label, checked, apply) => {
			const choice = {
				checked,
				apply
			};
			choices.push(choice);
			rows.push(h("div", { class: "pd2te-item-row" }, checkbox(label, checked, (value) => {
				choice.checked = value;
			})));
		};
		const name = item.name;
		if (name && name !== item.base?.name && vocab.names.includes(name)) option(`Name: ${name}`, true, (model) => addUnique(model.names, name));
		const type = typeCodeFor(item, vocab);
		if (type) option(`Type: ${type.display}`, true, (model) => addUnique(model.types, type.code));
		const base = baseCodeFor(item, vocab);
		if (base) option(`Base: ${base.display}`, false, (model) => addUnique(model.bases, base.code));
		const quality = item.is_runeword ? "Runeword" : item.quality?.name;
		if (quality) option(`Rarity: ${quality}`, true, (model) => addUnique(model.qualities, quality));
		if (typeof item.is_ethereal === "boolean") option(item.is_ethereal ? "Ethereal" : "Not ethereal", false, (model) => {
			model.ethereal = item.is_ethereal ? "yes" : "no";
		});
		if (typeof item.corrupted === "boolean") option(item.corrupted ? "Corrupted" : "Not corrupted", false, (model) => {
			model.corrupted = item.corrupted ? "yes" : "no";
		});
		if (typeof item.socket_count === "number") {
			const sockets = item.socket_count;
			option(`Sockets: ${sockets}`, false, (model) => addUnique(model.socketValues, sockets));
		}
		const rolledLists = [...item.corruptions ?? [], ...item.desecrations ?? []];
		const rolled = [...new Set([...(item.modifiers ?? []).filter((modifier) => modifier.corrupted || modifier.desecrated).map((modifier) => modifier.name), ...rolledLists.includes("item_numsockets") ? [SOCKETS_ROLL] : []])].filter((name) => typeof name === "string" && name !== "");
		if (rolled.length > 0) option(`Corruption rolled: ${rolled.map((name) => propertyLabel(vocab, name)).join(", ")}`, false, (model) => {
			model.corruptionOutcomes = rolled.map((name) => ({ key: name }));
			model.corruptionAtLeast = rolled.length;
		});
		const merged = item.modifiers ?? [];
		const modRows = [];
		(ownStats ? ownModifiers(item) : merged).forEach((modifier) => {
			const choice = modChoice(modifier, vocab);
			if (!choice) return;
			if (!merged.includes(modifier) && choice.value !== void 0) choice.label += ` · own ${choice.value}`;
			let minimum = choice.value;
			const entry = {
				checked: false,
				apply: (model) => {
					const condition = { ...choice.condition };
					if (minimum !== void 0) condition.min = minimum;
					const existing = model.mods.find((mod) => mod.key === condition.key);
					if (existing) Object.assign(existing, condition);
					else model.mods.push(condition);
				}
			};
			choices.push(entry);
			const tick = checkbox(choice.label, false, (value) => {
				entry.checked = value;
			});
			const min = numberInput(minimum, "Min", (value) => {
				minimum = value;
				entry.checked = true;
				tick.querySelector("input").checked = true;
			});
			min.title = "Minimum for this mod; empty: just needs the mod";
			modRows.push(h("div", { class: "pd2te-item-row" }, tick, min));
		});
		const panel = h("div", { class: "pd2te-item-filter pd2te-own" });
		const close = () => panel.remove();
		const applyPicked = (model) => choices.filter((choice) => choice.checked).forEach((choice) => choice.apply(model));
		const buttons = actions.map((action) => {
			const node = button$1(action.label, () => {
				action.run(applyPicked);
				close();
			});
			node.title = action.title;
			return node;
		});
		panel.append(h("div", { class: "pd2te-item-filter-head" }, h("span", {
			class: "pd2te-item-filter-title",
			text: "Filter from this item"
		}), button$1("×", close, "pd2te-btn-small pd2te-btn-danger")), h("div", { class: "pd2te-item-section" }, ...rows), modRows.length > 0 ? h("div", { class: "pd2te-item-section" }, h("div", {
			class: "pd2te-hint",
			text: ownStats ? "Mods, without what socketed items add: tick the ones the item must have; the number is the minimum" : "Mods: tick the ones the item must have; the number is the minimum"
		}), ...modRows) : h("div", {
			class: "pd2te-hint",
			text: "No mods on this item"
		}), h("div", { class: "pd2te-row pd2te-item-actions" }, ...buttons));
		return panel;
	};
	var addUnique = (list, value) => {
		if (!list.includes(value)) list.push(value);
	};
	var hooks = null;
	var observer = null;
	var frame = 0;
	var mountCardControls = (cardHooks) => {
		unmountCardControls();
		hooks = cardHooks;
		const pageRoot = getMarketPage()?.$.subTree?.el;
		if (pageRoot instanceof Element) {
			observer = new MutationObserver(schedule);
			observer.observe(pageRoot, {
				childList: true,
				subtree: true
			});
		}
		decorate();
	};
	var unmountCardControls = () => {
		observer?.disconnect();
		observer = null;
		hooks = null;
		if (frame) cancelAnimationFrame(frame);
		frame = 0;
		document.querySelectorAll(".pd2te-card-btn, .pd2te-item-filter, .pd2te-card-times, .pd2te-socket-note, .pd2te-sum-line").forEach((element) => element.remove());
	};
	var schedule = () => {
		if (frame) return;
		frame = requestAnimationFrame(() => {
			frame = 0;
			decorate();
		});
	};
	var decorate = () => {
		if (!hooks) return;
		const withTimes = Settings.getSettings().cardTimes;
		document.querySelectorAll(".listing").forEach((card) => {
			if (card.closest(".settings-panel")) return;
			const id = listingIdFromHref(card.querySelector("a[href^=\"/market/listing/\"]")?.getAttribute("href") ?? null);
			if (!id) return;
			if (!card.querySelector(".pd2te-card-btn")) {
				const filterButton = button$1("Filter", () => togglePanel$1(card, id), "pd2te-btn-small pd2te-card-btn");
				filterButton.title = "Use this item's mods, base and rarity as filters";
				const offer = card.querySelector(".meta .flex > button.button");
				if (offer) offer.before(filterButton);
				else (card.querySelector(".meta") ?? card).append(filterButton);
			}
			if (withTimes && !card.querySelector(".pd2te-card-times")) decorateTimes(card, id);
			decorateSockets(card, id);
			decorateSums(card, id);
		});
	};
	var refreshCards = () => {
		if (hooks) decorate();
	};
	var decorateSums = (card, id) => {
		const sums = hooks?.sums() ?? [];
		const item = sums.length > 0 ? findListing(id)?.item : null;
		const own = hooks?.ownStats() ?? false;
		const vocab = hooks?.vocab;
		const lines = item && vocab ? itemSums(item, sums, own).map((result, index) => {
			const name = sums.length > 1 ? `Sum ${index + 1}` : "Sum";
			const parts = describeParts(result.parts, (key) => propertyLabel(vocab, key));
			return `${name}: ${formatAmount(result.total)}${parts ? ` = ${parts}` : ""}`;
		}) : [];
		const text = lines.join(" | ");
		const current = card.querySelector(".pd2te-sum-line");
		if ((current?.dataset.text ?? "") === text) return;
		current?.remove();
		const mods = card.querySelector(".details > .properties");
		if (text === "" || !mods) return;
		const line = h("div", {
			class: "pd2te-sum-line pd2te-own",
			title: own ? "The filter column's sums, on the item's own stats (socketed jewels/runes left out)" : "The filter column's sums on this item"
		});
		lines.forEach((part) => line.append(h("div", { text: part })));
		line.dataset.text = text;
		mods.after(line);
	};
	var MOD_LINES = ".properties:not(.socketed) > div > p.property";
	var lineLabel = (line) => line.firstElementChild?.firstChild?.textContent?.trim() ?? "";
	var SHORT_NAMES = {
		fireresist: "Fire",
		lightresist: "Light",
		coldresist: "Cold",
		poisonresist: "Poison",
		strength: "Str",
		dexterity: "Dex",
		vitality: "Vit",
		energy: "Energy"
	};
	var shareText = (share, runeword) => {
		const { modifier } = share;
		if (share.parts) {
			const own = share.parts.map((part) => `${SHORT_NAMES[part.name] ?? part.name} ${part.own}`).join(", ");
			return runeword ? "" : `(own: ${own})`;
		}
		if (share.own === 0) return runeword ? "" : "(socketed)";
		const own = shownAmount(modifier, share.own);
		const added = shownAmount(modifier, share.added);
		const [ownPart, addedPart] = share.addedMax === void 0 ? [`${own}`, `${added}`] : [`${own}-${share.ownMax}`, `${added}-${share.addedMax}`];
		return runeword ? `(${ownPart} + ${addedPart} from runes)` : `(${ownPart} own + ${addedPart} socketed)`;
	};
	var decorateSockets = (card, id) => {
		const item = findListing(id)?.item;
		const shares = item?.socketed?.length ? socketShares(item) : [];
		if (shares.length === 0 && !card.querySelector(".pd2te-socket-note")) return;
		const runeword = Boolean(item?.is_runeword);
		const byLabel = new Map();
		shares.forEach((share) => {
			const label = share.modifier.label?.trim();
			if (label) byLabel.set(label, [...byLabel.get(label) ?? [], share]);
		});
		card.querySelectorAll(MOD_LINES).forEach((line) => {
			const share = byLabel.get(lineLabel(line))?.shift();
			const text = share ? shareText(share, runeword) : "";
			const note = line.querySelector(":scope > .pd2te-socket-note");
			if ((note?.dataset.text ?? "") === text) return;
			note?.remove();
			if (!share || text === "") return;
			const only = share.own === 0 && !share.parts && !runeword;
			const added = h("span", {
				class: `pd2te-socket-note pd2te-own${only ? " pd2te-socket-only" : ""}`,
				text,
				title: runeword ? "The runeword's own roll, and what its runes add" : only ? "Only the socketed jewels, runes or gems give this; the item itself doesn't have it" : "What the item has itself, and what its socketed jewels, runes and gems add"
			});
			added.dataset.text = text;
			line.append(added);
		});
	};
	var MINUTE_MS = 6e4;
	var relativeTime = (ms) => {
		const age = Date.now() - ms;
		if (age < MINUTE_MS) return "just now";
		if (age < 36e5) return `${Math.round(age / MINUTE_MS)} min ago`;
		if (age < 864e5) return `${Math.round(age / 36e5)} h ago`;
		if (age < 6048e5) return `${Math.round(age / 864e5)} d ago`;
		return new Date(ms).toLocaleDateString(void 0, {
			day: "numeric",
			month: "short"
		});
	};
	var decorateTimes = (card, id) => {
		const listing = findListing(id);
		const slot = card.querySelector(".meta .time .flex-grow") ?? card.querySelector(".meta .time");
		if (!listing || !slot) return;
		const created = Date.parse(listing.created_at ?? "");
		const bumped = Date.parse(listing.bumped_at ?? "") || Date.parse(listing.updated_at ?? "");
		const updated = Date.parse(listing.updated_at ?? "");
		const differs = (a, b) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) > MINUTE_MS;
		const stamps = [];
		if (differs(created, bumped)) stamps.push(["Listed", created]);
		if (differs(updated, bumped) && differs(updated, created)) stamps.push(["Edited", updated]);
		if (stamps.length === 0) return;
		slot.append(h("span", { class: "pd2te-card-times pd2te-own" }, ...stamps.map(([label, ms]) => h("span", {
			class: "pd2te-card-time",
			title: `${label} ${new Date(ms).toLocaleString()}`,
			text: `${label} ${relativeTime(ms)}`
		}))));
	};
	document.addEventListener(SETTINGS_CHANGED_EVENT, () => {
		document.querySelectorAll(".pd2te-card-times").forEach((element) => element.remove());
		if (hooks) decorate();
	});
	var findListing = (id) => {
		const listing = getMarketPage()?.listings.find((row) => isObject(row) && row._id === id);
		return isObject(listing) && isObject(listing.item) ? listing : null;
	};
	var togglePanel$1 = (card, id) => {
		const open = card.querySelector(".pd2te-item-filter");
		document.querySelectorAll(".pd2te-item-filter").forEach((element) => element.remove());
		if (open || !hooks) return;
		const listing = findListing(id);
		if (!listing?.item) return;
		card.append(cardPanel(listing, listing.item, hooks));
	};
	var cardPanel = (listing, item, cardHooks) => {
		const sellerId = typeof listing.user_id === "string" ? listing.user_id : null;
		const name = typeof listing.user?.username === "string" ? listing.user.username : void 0;
		return buildItemPanel(item, {
			vocab: cardHooks.vocab,
			ownStats: cardHooks.ownStats(),
			actions: [
				{
					label: "Search",
					title: "Open a new tab that searches for the ticked ones",
					run: (apply) => cardHooks.openSearch((model) => {
						resetSearch(model);
						apply(model);
					})
				},
				{
					label: "Add to filters",
					title: "Add the ticked ones to the current filters (no search)",
					run: (apply) => cardHooks.apply(apply)
				},
				...sellerId ? [{
					label: "Only this seller",
					title: "Open a new tab with every listing of this seller",
					run: () => cardHooks.openSearch((model) => {
						resetSearch(model);
						model.seller = name ? {
							id: sellerId,
							name
						} : { id: sellerId };
					})
				}] : []
			]
		});
	};
	var resetSearch = (model) => {
		const { hardcore, ladder, sort, ignoreSocketed } = model;
		const fresh = emptyModel();
		fresh.sort = sort.field === "pd2te_sum" ? { ...DEFAULT_SORT } : sort;
		fresh.ignoreSocketed = ignoreSocketed;
		if (hardcore !== void 0) fresh.hardcore = hardcore;
		if (ladder !== void 0) fresh.ladder = ladder;
		Object.keys(model).forEach((key) => delete model[key]);
		Object.assign(model, fresh);
	};
	var LOG$10 = "[pd2-trade-enhancer]";
	var ZERO = 48;
	var DIGITS = 75;
	var PATCH_GAP_MS = 200;
	var RATE_LIMIT_WAIT_MS$1 = 3e4;
	var MAX_ATTEMPTS = 3;
	var digit = (value) => String.fromCharCode(ZERO + value);
	var midpoint = (low, high) => {
		if (high === "") return null;
		if (high !== null) {
			let common = 0;
			while (common < high.length && (low.charCodeAt(common) || ZERO) === high.charCodeAt(common)) common++;
			if (common > 0) {
				const rest = midpoint(low.slice(common), high.slice(common));
				return rest === null ? null : high.slice(0, common) + rest;
			}
		}
		const a = low === "" ? 0 : low.charCodeAt(0) - ZERO;
		const b = high === null ? DIGITS : high.charCodeAt(0) - ZERO;
		if (b - a > 1) return digit(Math.round((a + b) / 2));
		if (high !== null && high.length > 1) return high.slice(0, 1);
		const rest = midpoint(low.slice(1), null);
		return rest === null ? null : digit(a) + rest;
	};
	var CEILING = "z";
	var keyBetween = (before = "", after = CEILING) => {
		if (before >= after) return null;
		const key = midpoint(before, after);
		return key !== null && key > before && key < after ? key : null;
	};
	var keysBetween = (before, after, count) => {
		if (count <= 0) return [];
		const middle = keyBetween(before, after);
		if (middle === null) return null;
		const leftCount = Math.floor((count - 1) / 2);
		const left = keysBetween(before, middle, leftCount);
		const right = keysBetween(middle, after, count - 1 - leftCount);
		return left && right ? [
			...left,
			middle,
			...right
		] : null;
	};
	var isKey = (key) => typeof key === "string" && key !== "" && key < CEILING && [...key].every((char) => char >= "0" && char <= "z");
	var collator = new Intl.Collator(void 0, {
		numeric: true,
		sensitivity: "base"
	});
	var compareNames = (a, b) => collator.compare(a.name.trim(), b.name.trim()) || (a._id < b._id ? -1 : a._id > b._id ? 1 : 0);
	var risingKeys = (keys) => {
		const length = keys.map(() => 0);
		const previous = keys.map(() => -1);
		let best = -1;
		keys.forEach((key, i) => {
			if (!isKey(key)) return;
			length[i] = 1;
			for (let j = 0; j < i; j++) {
				const other = keys[j];
				if (isKey(other) && other < key && length[j] + 1 > length[i]) {
					length[i] = length[j] + 1;
					previous[i] = j;
				}
			}
			if (best < 0 || length[i] > length[best]) best = i;
		});
		const kept = new Set();
		for (let i = best; i >= 0; i = previous[i]) kept.add(i);
		return kept;
	};
	var fillGaps = (keys, kept) => {
		const out = [];
		let waiting = [];
		let before;
		const flush = (after) => {
			const made = keysBetween(before, after, waiting.length);
			if (!made) return false;
			waiting.forEach((index, n) => out[index] = made[n]);
			waiting = [];
			return true;
		};
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			if (!kept.has(i) || !isKey(key)) {
				waiting.push(i);
				continue;
			}
			if (!flush(key)) return null;
			out[i] = key;
			before = key;
		}
		return flush(void 0) ? out : null;
	};
	var planSort = (filters) => {
		const target = [...filters].sort(compareNames);
		const keys = target.map((filter) => filter.order);
		const kept = risingKeys(keys);
		const fresh = (kept.size * 2 >= target.length ? fillGaps(keys, kept) : null) ?? keysBetween(void 0, void 0, target.length);
		if (!fresh) throw new Error("no order keys left");
		return target.flatMap((filter, index) => fresh[index] === filter.order ? [] : [{
			id: filter._id,
			order: fresh[index]
		}]);
	};
	var keyForNew = (filters, name, sorted) => {
		if (!sorted) return keyBetween(void 0, filters.find((filter) => isKey(filter.order))?.order) ?? void 0;
		const probe = {
			_id: "~",
			name
		};
		const index = filters.findIndex((filter) => compareNames(probe, filter) < 0);
		const before = index < 0 ? filters[filters.length - 1] : filters[index - 1];
		const after = index < 0 ? void 0 : filters[index];
		return keyBetween(before?.order, after?.order) ?? void 0;
	};
	var retryable = (error) => isRateLimitError(error) || errorCode(error) === 408;
	var patchOrder = async (service, patch, signal) => {
		for (let attempt = 1;; attempt++) try {
			await service.patch(patch.id, { order: patch.order });
			return;
		} catch (error) {
			if (attempt >= MAX_ATTEMPTS || signal.aborted || !retryable(error)) throw error;
			if (isRateLimitError(error)) {
				console.warn(LOG$10, `Rate limited while sorting the saved filters; waiting ${RATE_LIMIT_WAIT_MS$1 / 1e3}s.`);
				await sleep(RATE_LIMIT_WAIT_MS$1, signal);
				if (signal.aborted) throw new Error("stopped while waiting out a rate limit: you left the page");
			}
		}
	};
	var pagePath = () => window.location.pathname.replace(/\/+$/, "");
	var running$1 = null;
	var sortSavedFilters = (onProgress) => {
		if (running$1 && running$1.path === pagePath() && !running$1.controller.signal.aborted) return running$1.promise;
		const previous = running$1?.promise;
		const controller = new AbortController();
		const promise = (async () => {
			if (previous) await previous.catch(() => {});
			if (controller.signal.aborted) throw new Error("stopped: you left the page");
			const service = requireFilterService();
			const filters = await fetchAllSavedFilters(service);
			const patches = planSort(filters);
			for (const [index, patch] of patches.entries()) {
				if (controller.signal.aborted) throw new Error(`stopped after ${index} of ${patches.length}: you left the page`);
				await patchOrder(service, patch, controller.signal);
				onProgress?.(index + 1, patches.length);
				if (index < patches.length - 1) await sleep(PATCH_GAP_MS, controller.signal);
			}
			return {
				moved: patches.length,
				total: filters.length
			};
		})().finally(() => {
			if (running$1?.controller === controller) running$1 = null;
		});
		running$1 = {
			promise,
			controller,
			path: pagePath()
		};
		return promise;
	};
	var stopFilterSortOffPage = () => {
		if (running$1 && pagePath() !== running$1.path) running$1.controller.abort();
	};
	var LOG$9 = "[pd2-trade-enhancer]";
	var METADATA_VERSION = 1;
	var metadataOf = (saved) => {
		const meta = saved.pd2te;
		if (!isObject(meta) || meta.v !== METADATA_VERSION) return null;
		return sanitizeModel(meta.model);
	};
	var snapshot = (value) => JSON.parse(JSON.stringify(value));
	var sortOf = (sort) => ({
		field: typeof sort.field === "string" && sort.field !== "" ? sort.field : "bumped_at",
		direction: Number(sort.direction) === 1 ? 1 : -1
	});
	var comparable = (model) => {
		const result = compile(model);
		if (!result.ok) return `invalid: ${result.error}`;
		return stableStringify({
			form: {
				...result.value.form,
				updated_at: model.includeStale
			},
			sort: model.sort
		});
	};
	var FilterController = class {
		site;
		page;
		vocab;
		onModel = null;
		onSavedFilters = null;
		onSearched = null;
		model;
		applying = false;
		renderQueued = false;
		released = false;
		siteLoaded = false;
		knownCount = 0;
		unwatch = [];
		constructor(site, page) {
			this.site = site;
			this.page = page;
			this.vocab = readVocab(site);
			this.model = this.readModel();
			this.searchIfSiteLoaded();
			this.unwatch.push(watchState(site, "filters", () => this.external(), {
				deep: true,
				flush: "sync"
			}), watchState(site, "sort", () => this.external(), {
				deep: true,
				flush: "sync"
			}), watchState(page, "savedFilters", () => this.savedFiltersChanged(), { deep: true }), watchState(site, "selectedFilterId", () => this.onSavedFilters?.()), watchState(page, "noFilters", () => this.onSearched?.()));
		}
		get current() {
			return this.model;
		}
		savedFilters() {
			return [...this.page.savedFilters];
		}
		loadedFilter() {
			const id = this.site.selectedFilterId;
			return id && this.page.savedFilters.find((filter) => filter._id === id) || null;
		}
		isModified() {
			const saved = this.loadedFilter();
			if (!saved) return false;
			return comparable(this.model) !== comparable(metadataOf(saved) ?? this.siteSavedModel(saved));
		}
		hasSearched() {
			return !this.page.noFilters;
		}
		findByName(name, exceptId) {
			const lower = name.trim().toLowerCase();
			return this.page.savedFilters.find((filter) => filter._id !== exceptId && filter.name.toLowerCase() === lower) ?? null;
		}
		saveAction(rawName) {
			const name = rawName.trim();
			if (name === "") return {
				kind: "invalid",
				message: "Give the filter a name first"
			};
			const loaded = this.loadedFilter();
			const other = this.findByName(name, loaded?._id);
			if (other) return {
				kind: "overwrite",
				target: other,
				name: other.name
			};
			if (loaded) return {
				kind: "overwrite",
				target: loaded,
				name
			};
			return {
				kind: "create",
				name
			};
		}
		update(mutate) {
			mutate(this.model);
			return this.apply(false);
		}
		apply(search) {
			const result = compile(this.model);
			if (!result.ok) return result;
			this.write(result.value.form, this.model.sort);
			if (search) this.site.search();
			return result;
		}
		search() {
			return this.apply(true);
		}
		replaceModel(model, search) {
			this.model = model;
			return this.apply(search);
		}
		async clear() {
			await this.site.clearFilters();
		}
		load(id) {
			const saved = this.page.savedFilters.find((filter) => filter._id === id);
			if (!saved) return;
			this.site.selectedFilterId = id;
			this.model = metadataOf(saved) ?? this.siteSavedModel(saved);
			this.apply(true);
			this.onModel?.();
		}
		async save(rawName) {
			const action = this.saveAction(rawName);
			if (action.kind === "invalid") throw new Error(action.message);
			return action.kind === "create" ? { saved: await this.create(action.name) } : this.overwrite(action.target, action.name);
		}
		async saveAsNew(rawName) {
			const name = rawName.trim();
			if (name === "") throw new Error("Give the new filter a name first");
			const taken = this.findByName(name);
			if (taken) throw new Error(`"${taken.name}" already exists: give the new filter another name`);
			return { saved: await this.create(name) };
		}
		async remove(id) {
			await requireFilterService().remove(id);
			const index = this.page.savedFilters.findIndex((filter) => filter._id === id);
			if (index >= 0) {
				this.knownCount = Math.max(0, this.knownCount - 1);
				this.page.savedFilters.splice(index, 1);
			}
			if (this.site.selectedFilterId === id) this.site.selectedFilterId = void 0;
		}
		async loadAllSavedFilters() {
			if (!getFilterService()) return;
			try {
				await this.refreshSavedFilters();
			} catch (error) {
				console.warn(LOG$9, "Could not load all saved filters.", error);
			}
		}
		async sortIfWanted() {
			if (!Settings.getSettings().autoSortFilters) return 0;
			const { moved } = await sortSavedFilters();
			if (moved > 0) await this.refreshSavedFilters();
			return moved;
		}
		release() {
			this.released = true;
			this.unwatch.forEach((stop) => stop());
			this.unwatch.length = 0;
		}
		async refreshSavedFilters() {
			const rows = await fetchAllSavedFilters(requireFilterService());
			if (this.page.$.isUnmounted) return;
			this.knownCount = rows.length;
			this.page.savedFilters = rows;
		}
		savedFiltersChanged() {
			if (this.page.savedFilters.length < this.knownCount) {
				this.knownCount = 0;
				this.loadAllSavedFilters();
			}
			this.onSavedFilters?.();
		}
		siteSavedModel(saved) {
			return {
				...parse(snapshot(saved.filters), this.vocab),
				sort: { ...DEFAULT_SORT }
			};
		}
		saveData(name) {
			const result = this.apply(false);
			if (!result.ok) throw new Error(result.error);
			const metadata = {
				v: METADATA_VERSION,
				model: cloneModel(this.model)
			};
			return {
				name,
				filters: snapshot(this.site.filters),
				pd2te: metadata
			};
		}
		async create(name) {
			const data = this.saveData(name);
			const list = this.page.savedFilters;
			const order = keyForNew(list, name, Settings.getSettings().autoSortFilters && planSort(list).length === 0);
			const saved = await requireFilterService().create(order === void 0 ? data : {
				...data,
				order
			});
			return this.afterSave(saved);
		}
		async overwrite(target, name) {
			const service = requireFilterService();
			const data = this.saveData(name);
			if (stableStringify(data.filters) === stableStringify(target.filters)) return { saved: await this.afterSave(await service.patch(target._id, {
				name: data.name,
				pd2te: data.pd2te
			})) };
			const kept = {
				...target.order !== void 0 ? { order: target.order } : {},
				...target.notify ? { notify: true } : {}
			};
			const replacement = await service.create({
				...data,
				...kept
			});
			let note;
			try {
				await service.remove(target._id);
			} catch (error) {
				console.warn(LOG$9, `Saved "${name}" as a new filter; the old one could not be deleted.`, error);
				note = `the old "${target.name}" could not be deleted: ${errorMessage(error)}`;
			}
			return {
				saved: await this.afterSave(replacement),
				note
			};
		}
		async afterSave(saved) {
			this.site.selectedFilterId = saved._id;
			try {
				await this.refreshSavedFilters();
				await this.sortIfWanted();
			} catch (error) {
				console.warn(LOG$9, "Saved, but the saved filters could not be reloaded or sorted.", error);
			}
			return saved;
		}
		write(form, sort) {
			this.applying = true;
			try {
				if (this.page.savedFilters.some((filter) => filter.filters === this.site.filters)) this.site.filters = snapshot(this.site.filters);
				const target = this.site.filters;
				Object.keys(target).forEach((key) => {
					if (!(key in form)) delete target[key];
				});
				Object.entries(form).forEach(([key, value]) => {
					target[key] = snapshot(value);
				});
				this.site.sort.field = sort.field;
				this.site.sort.direction = sort.direction;
			} finally {
				this.applying = false;
			}
		}
		external() {
			if (this.applying || this.renderQueued) return;
			this.renderQueued = true;
			queueMicrotask(() => {
				this.renderQueued = false;
				if (this.released) return;
				this.model = this.readModel();
				this.searchIfSiteLoaded();
				this.onModel?.();
			});
		}
		searchIfSiteLoaded() {
			if (!this.siteLoaded) return;
			this.siteLoaded = false;
			this.apply(true);
		}
		readModel() {
			const { site } = this;
			const form = snapshot(site.filters);
			const saved = this.loadedFilter();
			if (saved && !metadataOf(saved) && saved.filters === site.filters) {
				this.siteLoaded = true;
				return this.siteSavedModel(saved);
			}
			if (saved) {
				const meta = metadataOf(saved);
				if (meta && stableStringify(saved.filters) === stableStringify(form)) {
					const sort = sortOf(site.sort);
					if (sort.field !== meta.sort.field || sort.direction !== meta.sort.direction || !meta.includeStale) this.siteLoaded = true;
					return meta;
				}
			}
			const model = parse(form, this.vocab);
			model.sort = sortOf(site.sort);
			return model;
		}
	};
	var HASH_KEY = "pd2te";
	var toBase64Url = (text) => {
		const bytes = new TextEncoder().encode(text);
		let binary = "";
		bytes.forEach((byte) => {
			binary += String.fromCharCode(byte);
		});
		return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
	};
	var fromBase64Url = (text) => {
		try {
			const base64 = text.replace(/-/g, "+").replace(/_/g, "/");
			const binary = atob(base64 + "=".repeat((4 - base64.length % 4) % 4));
			return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
		} catch {
			return null;
		}
	};
	var searchLink = (model, withMode = true) => {
		const defaults = emptyModel();
		const fields = {};
		Object.entries(cloneModel(model)).forEach(([key, value]) => {
			if (key !== "hardcore" && key !== "ladder" && stableStringify(value) !== stableStringify(defaults[key])) fields[key] = value;
		});
		if (withMode) {
			fields.hardcore = model.hardcore ?? null;
			fields.ladder = model.ladder ?? null;
		}
		return `${location.origin}/market#${HASH_KEY}=${toBase64Url(JSON.stringify(fields))}`;
	};
	var takeLinkedSearch = () => {
		const match = location.hash.match(new RegExp(`^#${HASH_KEY}=([A-Za-z0-9_-]+)$`));
		if (!match) return null;
		history.replaceState(history.state, "", location.pathname + location.search);
		const json = fromBase64Url(match[1]);
		if (json === null) return "invalid";
		try {
			const raw = JSON.parse(json);
			const model = sanitizeModel(raw);
			if (!model) return "invalid";
			return {
				model,
				viewerMode: typeof raw === "object" && raw !== null && !("hardcore" in raw) && !("ladder" in raw)
			};
		} catch {
			return "invalid";
		}
	};
	var PAGER_LIMIT = 10;
	var installed = null;
	var adjusting = false;
	var lastSize = 0;
	var pageSize = () => Settings.getSettings().pageSize;
	var pagerTotal = (real, size) => Math.ceil(real / size) * PAGER_LIMIT;
	var installPaging = (page) => {
		uninstallPaging();
		const original = page.fetch;
		lastSize = pageSize();
		page.fetch = (pageNumber = 1) => {
			const size = pageSize();
			return original.call(page, pageNumber, size, (pageNumber - 1) * size);
		};
		installed = {
			page,
			original,
			unwatch: watchState(page, "total", (value) => {
				if (adjusting || typeof value !== "number") return;
				const size = pageSize();
				if (size === PAGER_LIMIT) return;
				const adjusted = pagerTotal(value, size);
				if (adjusted === value) return;
				adjusting = true;
				try {
					page.total = adjusted;
				} finally {
					adjusting = false;
				}
			}, { flush: "sync" })
		};
	};
	var uninstallPaging = () => {
		if (!installed) return;
		const { page, original, unwatch } = installed;
		unwatch();
		if (!page.$.isUnmounted) page.fetch = original;
		installed = null;
	};
	document.addEventListener(SETTINGS_CHANGED_EVENT, () => {
		const size = pageSize();
		if (size === lastSize) return;
		lastSize = size;
		const page = installed?.page;
		if (page && !page.$.isUnmounted && !page.noFilters && !page.loading) page.fetch();
	});
	var LOG$8 = "[pd2-trade-enhancer]";
	var SOCKETED_CHECK_EVENT = "pd2te:socketed-check";
	var HASH = "item.hash";
	var PER_REQUEST$1 = new Set([
		"$skip",
		"$limit",
		"$sort",
		"$select",
		"$resolve"
	]);
	var REUSE_MS$1 = 12e4;
	var CHECK_TIMEOUT_MS = 8e3;
	var MAX_CANDIDATES$1 = 1500;
	var last$1 = null;
	var shortListings = async (search, signal) => {
		const names = modNamesIn(search);
		if (names !== null && names.length === 0) return {
			hashes: [],
			checked: 0,
			excluded: 0
		};
		const service = getListingService();
		if (!service) throw new Error("the site's listing service wasn't found");
		const candidates = { ...search };
		if (names && !("item.socketed.modifiers.name" in candidates)) candidates["item.socketed.modifiers.name"] = { $in: names };
		else if (!("item.socketed.0" in candidates)) candidates["item.socketed.0"] = { $exists: true };
		const select = selectPaths([
			"_id",
			HASH,
			...ownCheckFields(search)
		]);
		const hashes = new Set();
		let checked = 0;
		let excluded = 0;
		for (let skip = 0;; skip += 250) {
			const outcome = await findOnce(service, {
				...candidates,
				$select: select,
				$sort: { _id: 1 },
				$skip: skip,
				$limit: 250
			}, signal);
			if (!outcome.ok) throw outcome.aborted ? new Error(`no answer after ${CHECK_TIMEOUT_MS / 1e3} s`) : outcome.error;
			const total = outcome.result.total ?? 0;
			if (total > MAX_CANDIDATES$1) throw new Error(`${total} listings with socketed items to re-check; narrow the search`);
			const rows = outcome.result.data ?? [];
			rows.forEach((row) => {
				if (!isObject(row)) return;
				checked++;
				const { item } = row;
				if (ownStillMatches(row, search) || !isObject(item) || typeof item.hash !== "string") return;
				hashes.add(item.hash);
				excluded++;
			});
			if (rows.length === 0 || skip + rows.length >= total) return {
				hashes: [...hashes],
				checked,
				excluded
			};
		}
	};
	var check = (search) => {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
		return shortListings(search, controller.signal).finally(() => clearTimeout(timer));
	};
	var leaveOut = (query, hashes) => {
		const current = query[HASH];
		if (current === void 0) {
			query[HASH] = { $nin: hashes };
			return true;
		}
		if (!isObject(current) || Array.isArray(current) || !Object.keys(current).every((key) => key.startsWith("$"))) return false;
		const nin = current.$nin ?? [];
		if (!Array.isArray(nin)) return false;
		query[HASH] = {
			...current,
			$nin: [...nin, ...hashes]
		};
		return true;
	};
	var report$1 = (detail) => document.dispatchEvent(new CustomEvent(SOCKETED_CHECK_EVENT, { detail }));
	var socketedRewrite = (query) => {
		if (!isOwnSearch(query) || !isMarketSearchQuery(query)) return void 0;
		const search = Object.fromEntries(Object.entries(query).filter(([key]) => !PER_REQUEST$1.has(key)));
		const key = stableStringify(search);
		const reused = last$1 !== null && last$1.key === key && Date.now() - last$1.at < REUSE_MS$1;
		const current = reused && last$1 ? last$1 : {
			key,
			at: Date.now(),
			result: check(search)
		};
		last$1 = current;
		return current.result.then(({ hashes, checked, excluded }) => {
			if (hashes.length > 0 && !leaveOut(query, hashes)) console.warn(LOG$8, "The search asks for one item hash already: listings that fall short without their socketed items stay in.");
			if (!reused) report$1({
				checked,
				excluded
			});
		}, (error) => {
			if (last$1 === current) last$1 = null;
			console.warn(LOG$8, `Couldn't re-check the listings with socketed items (${errorMessage(error)}); searching without leaving any out.`);
			if (!reused) report$1({
				checked: 0,
				excluded: 0,
				error: errorMessage(error)
			});
		});
	};
	var LOG$7 = "[pd2-trade-enhancer]";
	var SUMS_CHECK_EVENT = "pd2te:sums-check";
	var PER_REQUEST = new Set([
		"$skip",
		"$limit",
		"$sort",
		"$select",
		"$resolve"
	]);
	var REUSE_MS = 12e4;
	var SCAN_TIMEOUT_MS = 15e3;
	var PAGE_TIMEOUT_MS = 8e3;
	var MAX_CANDIDATES = 3e3;
	var PARALLEL = 3;
	var last = null;
	var timed = (ms, task) => {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), ms);
		return task(controller.signal).finally(() => clearTimeout(timer));
	};
	var requireService = () => {
		const service = getListingService();
		if (!service) throw new Error("the site's listing service wasn't found");
		return service;
	};
	var candidatesQuery = (search, sums) => {
		return withOrDimensions(search, sums.map(sumCandidates).filter((branches) => branches !== null)) ?? search;
	};
	var scan = async (search, sums, signal) => {
		const service = requireService();
		const own = isOwnSearch(search);
		const query = candidatesQuery(search, sums);
		const select = selectPaths([
			"_id",
			"bumped_at",
			"item.modifiers",
			...own ? ownCheckFields(search) : []
		]);
		const page = async (skip) => {
			const outcome = await findOnce(service, {
				...query,
				$select: select,
				$sort: { _id: 1 },
				$skip: skip,
				$limit: 250
			}, signal);
			if (!outcome.ok) throw outcome.aborted ? new Error(`no answer after ${SCAN_TIMEOUT_MS / 1e3} s`) : outcome.error;
			return outcome.result;
		};
		const first = await page(0);
		const total = first.total ?? 0;
		if (total > MAX_CANDIDATES) throw new Error(`${total} listings could reach the sum, more than ${MAX_CANDIDATES}: narrow the search (type, rarity, price)`);
		const rows = [...first.data ?? []];
		const skips = [];
		for (let skip = 250; skip < total; skip += 250) skips.push(skip);
		for (let i = 0; i < skips.length; i += PARALLEL) (await Promise.all(skips.slice(i, i + PARALLEL).map(page))).forEach((result) => rows.push(...result.data ?? []));
		const seen = new Set();
		const ranked = [];
		rows.forEach((row) => {
			if (!isObject(row) || typeof row._id !== "string" || seen.has(row._id) || !isObject(row.item)) return;
			seen.add(row._id);
			const results = itemSums(row.item, sums, own);
			if (!reachesAll(sums, results) || own && !ownStillMatches(row, search)) return;
			ranked.push({
				id: row._id,
				sum: results[0].total,
				bumped: typeof row.bumped_at === "string" ? row.bumped_at : ""
			});
		});
		ranked.sort((a, b) => b.sum - a.sum || (a.bumped < b.bumped ? 1 : a.bumped > b.bumped ? -1 : 0));
		return {
			ranked,
			candidates: seen.size
		};
	};
	var onlyIds = (query, ids) => {
		const current = query._id;
		if (current === void 0) query._id = { $in: ids };
		else if (typeof current === "string") query._id = { $in: ids.includes(current) ? [current] : [] };
		else if (isObject(current) && !Array.isArray(current) && Object.keys(current).every((key) => key.startsWith("$"))) {
			const within = Array.isArray(current.$in) ? ids.filter((id) => current.$in.includes(id)) : ids;
			query._id = {
				...current,
				$in: within
			};
		} else query._id = { $in: [] };
	};
	var sumDirection = (query) => {
		const sort = query.$sort;
		if (!isObject(sort) || !("pd2te_sum" in sort)) return null;
		return Number(sort["pd2te_sum"]) === 1 ? 1 : -1;
	};
	var sortedPage = async (query, search, scanned, direction) => {
		const skip = Math.max(0, Number(query.$skip) || 0);
		const limit = Math.max(1, Number(query.$limit) || 10);
		const ids = (direction === -1 ? scanned.ranked : [...scanned.ranked].sort((a, b) => a.sum - b.sum || (a.bumped < b.bumped ? 1 : a.bumped > b.bumped ? -1 : 0))).slice(skip, skip + limit).map((entry) => entry.id);
		const total = scanned.ranked.length;
		if (ids.length === 0) return { result: {
			total,
			limit,
			skip,
			data: []
		} };
		const pageQuery = {
			...search,
			_id: { $in: ids },
			$limit: ids.length
		};
		if (query.$resolve !== void 0) pageQuery.$resolve = query.$resolve;
		if (query.$select !== void 0) pageQuery.$select = query.$select;
		const outcome = await timed(PAGE_TIMEOUT_MS, (signal) => findOnce(requireService(), pageQuery, signal));
		if (!outcome.ok) {
			console.warn(LOG$7, `Couldn't load this page in sum order (${errorMessage(outcome.error)}); showing it in the server's order.`);
			return null;
		}
		const byId = new Map((outcome.result.data ?? []).map((row) => [row._id, row]));
		return { result: {
			total,
			limit,
			skip,
			data: ids.map((id) => byId.get(id)).filter((row) => row !== void 0)
		} };
	};
	var report = (detail) => document.dispatchEvent(new CustomEvent(SUMS_CHECK_EVENT, { detail }));
	var sumRewrite = (query) => {
		const sums = sumsOf(query);
		if (sums.length === 0 || !isMarketSearchQuery(query)) return void 0;
		const search = Object.fromEntries(Object.entries(query).filter(([key]) => !PER_REQUEST.has(key)));
		const key = stableStringify(search);
		const reused = last !== null && last.key === key && Date.now() - last.at < REUSE_MS;
		const current = reused && last ? last : {
			key,
			at: Date.now(),
			result: timed(SCAN_TIMEOUT_MS, (signal) => scan(search, sums, signal))
		};
		last = current;
		return current.result.then(async (scanned) => {
			if (!reused) report({
				candidates: scanned.candidates,
				matched: scanned.ranked.length
			});
			const direction = sumDirection(query);
			const answer = direction === null ? null : await sortedPage(query, search, scanned, direction).catch(() => null);
			if (answer) return answer;
			onlyIds(query, scanned.ranked.map((entry) => entry.id));
		}, (error) => {
			if (last === current) last = null;
			console.warn(LOG$7, `Couldn't add up the sums (${errorMessage(error)}); the search shows nothing.`);
			if (!reused) report({
				candidates: 0,
				matched: 0,
				error: errorMessage(error)
			});
			onlyIds(query, []);
		});
	};
	var LOG$6 = "[pd2-trade-enhancer]";
	var SOCKET_COUNTS = [
		"0",
		"1",
		"2",
		"3",
		"4",
		"5",
		"6"
	];
	var controller$1 = null;
	var root = null;
	var toolbarRoot = null;
	var statusLine$1 = null;
	var liveNote = null;
	var socketNote = null;
	var sumNote = null;
	var preview = null;
	var savedMarker = null;
	var setOptional = (mod, key, value) => {
		if (value === void 0) delete mod[key];
		else mod[key] = value;
	};
	var triOfBool = (value) => value === void 0 ? "any" : value ? "yes" : "no";
	var lastStatus = {
		text: "",
		tone: "info"
	};
	var setStatus$1 = (text, tone = "info") => {
		lastStatus = {
			text,
			tone
		};
		if (!statusLine$1) return;
		statusLine$1.textContent = text;
		statusLine$1.dataset.tone = tone;
	};
	var boolOfTri = (value) => value === "any" ? void 0 : value === "yes";
	var updateSavedMarker = (ctrl) => {
		savedMarker?.classList.toggle("pd2te-invisible", !ctrl.isModified());
	};
	var mountFilterColumn = () => {
		if (!Settings.getSettings().enhancedFilters) return "disabled";
		const column = document.getElementById("filters");
		const page = getMarketPage();
		const site = getSiteFilters(page);
		if (!column || !page || !site || !isSitePage(page)) return "failed";
		if (controller$1 && controller$1.site === site && root?.isConnected) return "mounted";
		unmountFilterColumn();
		try {
			const ctrl = new FilterController(site, page);
			controller$1 = ctrl;
			root = h("div", { class: "pd2te-filters pd2te-own" });
			toolbarRoot = h("div", { class: "pd2te-filters pd2te-own pd2te-toolbar-host" });
			ctrl.onModel = () => renderAll(ctrl);
			renderSections(ctrl);
			column.prepend(toolbarRoot);
			column.append(root);
			column.classList.add("pd2te-replaced");
			mountCardControls({
				vocab: ctrl.vocab,
				apply: (mutate) => {
					const result = ctrl.update(mutate);
					renderAll(ctrl);
					setStatus$1(result.ok ? "Added to the filters; press Search to run them" : result.error, result.ok ? "info" : "error");
				},
				openSearch: (mutate) => {
					const model = cloneModel(ctrl.current);
					mutate(model);
					window.open(searchLink(model), "_blank", "noopener");
				},
				ownStats: () => ctrl.current.ignoreSocketed,
				sums: () => activeSums(ctrl.current.sums)
			});
			installPaging(page);
			applyDisplaySettings(ctrl);
			ctrl.loadAllSavedFilters().then(() => sortSavedIfWanted(ctrl));
			applyLinkedSearch(ctrl);
			console.info(`${LOG$6} Filter column mounted: ${ctrl.vocab.properties.length} properties, ${ctrl.vocab.types.length} item types.`);
			return "mounted";
		} catch (error) {
			console.error(`${LOG$6} The filter column failed to build; the site's own panels stay. Turn "Enhanced filters" off in Settings to stop trying.`, error);
			unmountFilterColumn();
			return "failed";
		}
	};
	var unmountFilterColumn = () => {
		unmountCardControls();
		uninstallPaging();
		controller$1?.release();
		controller$1 = null;
		root?.remove();
		root = null;
		toolbarRoot?.remove();
		toolbarRoot = null;
		statusLine$1 = null;
		liveNote = null;
		socketNote = null;
		sumNote = null;
		preview = null;
		savedMarker = null;
		lastStatus = {
			text: "",
			tone: "info"
		};
		document.getElementById("filters")?.classList.remove("pd2te-replaced");
	};
	var applyLinkedSearch = (ctrl) => {
		const linked = takeLinkedSearch();
		if (linked === null) return;
		if (linked === "invalid") {
			console.warn(`${LOG$6} The #pd2te= link in the URL couldn't be read; it was probably cut short when copied.`);
			setStatus$1("The shared search link couldn't be read (cut short when copied?)", "error");
			return;
		}
		stopLivesearchFor("a linked search was opened");
		const { model } = linked;
		if (linked.viewerMode && ctrl.current.hardcore !== void 0) model.hardcore = ctrl.current.hardcore;
		if (linked.viewerMode && ctrl.current.ladder !== void 0) model.ladder = ctrl.current.ladder;
		const result = ctrl.replaceModel(model, true);
		renderAll(ctrl);
		setStatus$1(result.ok ? `Searching the linked filters (${clockTime()})` : result.error, result.ok ? "info" : "error");
	};
	window.addEventListener("hashchange", () => {
		if (controller$1 && root?.isConnected) applyLinkedSearch(controller$1);
	});
	var VOLATILE_FORM_KEYS = ["updated_at"];
	var comparableForm = (filters) => {
		const copy = JSON.parse(JSON.stringify(filters));
		VOLATILE_FORM_KEYS.forEach((key) => delete copy[key]);
		return stableStringify(copy);
	};
	var updateLiveNote = (ctrl) => {
		if (!liveNote) return;
		const watched = getWatchedFilters();
		const differs = isLivesearchRunning() && watched !== null && comparableForm(watched) !== comparableForm(ctrl.site.filters);
		liveNote.classList.toggle("pd2te-hidden", !differs);
	};
	document.addEventListener(LIVESEARCH_CHANGED_EVENT, () => {
		if (controller$1) updateLiveNote(controller$1);
	});
	var lastSocketCheck = null;
	var plural$1 = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
	var updateSocketNote = (ctrl) => {
		if (!socketNote) return;
		const check = lastSocketCheck;
		const shown = ctrl.current.ignoreSocketed && activeSums(ctrl.current.sums).length === 0 && check !== null && (check.error !== void 0 || check.checked > 0);
		socketNote.classList.toggle("pd2te-hidden", !shown);
		if (!shown) return;
		socketNote.dataset.tone = check.error === void 0 ? "info" : "warn";
		socketNote.textContent = check.error !== void 0 ? `Couldn't re-check the socketed listings (${check.error}): these results may include some that pass only with their jewels/runes` : check.excluded > 0 ? `Left out ${check.excluded} of ${plural$1(check.checked, "socketed listing")}: they pass only with their jewels/runes` : `All ${plural$1(check.checked, "socketed listing")} pass on their own stats`;
	};
	document.addEventListener(SOCKETED_CHECK_EVENT, (event) => {
		lastSocketCheck = event.detail;
		if (controller$1) updateSocketNote(controller$1);
	});
	var activeSums = (sums) => sums.filter((sum) => sum.terms.length > 0);
	var lastSumsCheck = null;
	var updateSumNote = (ctrl) => {
		if (!sumNote) return;
		const check = lastSumsCheck;
		const shown = activeSums(ctrl.current.sums).length > 0 && check !== null;
		sumNote.classList.toggle("pd2te-hidden", !shown);
		if (!shown) return;
		sumNote.dataset.tone = check.error === void 0 ? "info" : "warn";
		sumNote.textContent = check.error !== void 0 ? `Couldn't add up the sums, so nothing is shown: ${check.error}` : `${plural$1(check.matched, "listing")} of ${check.candidates} that could reach the sums do`;
	};
	document.addEventListener(SUMS_CHECK_EVENT, (event) => {
		lastSumsCheck = event.detail;
		if (controller$1) updateSumNote(controller$1);
	});
	var stopLivesearchFor = (what) => {
		if (isLivesearchRunning()) stopLivesearch(`Stopped at ${clockTime()}: ${what}. Press Start to livesearch the current filters`);
	};
	var applyDisplaySettings = (ctrl) => {
		const settings = Settings.getSettings();
		if (ctrl.site.compactMode !== settings.compactCards) ctrl.site.compactMode = settings.compactCards;
		updatePreview(ctrl);
	};
	var sortSavedIfWanted = async (ctrl) => {
		try {
			const moved = await ctrl.sortIfWanted();
			if (moved > 0 && controller$1 === ctrl) setStatus$1(`Put ${moved} saved ${moved === 1 ? "filter" : "filters"} in name order`);
		} catch (error) {
			if (controller$1 === ctrl) setStatus$1(`Sorting the saved filters failed: ${errorMessage(error)}`, "error");
		}
	};
	var autoSortWas = Settings.getSettings().autoSortFilters;
	var applyFilterColumnSetting = () => {
		const settings = Settings.getSettings();
		if (!settings.enhancedFilters) unmountFilterColumn();
		else if (isMarketPath()) mountFilterColumn();
		if (controller$1) applyDisplaySettings(controller$1);
		const sortTurnedOn = settings.autoSortFilters && !autoSortWas;
		autoSortWas = settings.autoSortFilters;
		if (sortTurnedOn && controller$1 && isMarketPath()) sortSavedIfWanted(controller$1);
	};
	document.addEventListener(SETTINGS_CHANGED_EVENT, applyFilterColumnSetting);
	var renderAll = (ctrl) => {
		if (!root) return;
		try {
			renderSections(ctrl);
		} catch (error) {
			console.error(`${LOG$6} The filter column failed to render; showing the site's own panels.`, error);
			unmountFilterColumn();
		}
	};
	var renderSections = (ctrl) => {
		if (!root || !toolbarRoot) return;
		const { vocab } = ctrl;
		const propertyOptions = vocab.properties.map((option) => ({
			value: option.key,
			label: displayLabel(option.label)
		}));
		const ui = {
			ctrl,
			vocab,
			propertyOptions,
			modifierNames: propertyOptions.filter((option) => !option.value.includes("{") && !option.value.includes("|")),
			change: (mutate, refresh) => {
				const result = ctrl.update(mutate);
				if (!result.ok) ui.status(result.error, "error");
				else if (statusLine$1?.dataset.tone === "error") ui.status("");
				updatePreview(ctrl);
				updateLiveNote(ctrl);
				updateSocketNote(ctrl);
				updateSumNote(ctrl);
				updateSavedMarker(ctrl);
				refreshCards();
				refresh?.();
			},
			status: setStatus$1
		};
		const saved = savedFiltersSection(ui);
		ctrl.onSavedFilters = () => saved.refresh();
		toolbarRoot.replaceChildren(toolbarSection(ui).el);
		root.replaceChildren(saved.el, itemSection(ui).el, modsSection(ui).el, groupsSection(ui).el, sumsSection(ui).el, corruptionSection(ui).el, requirementsSection(ui).el, sellerSection(ui).el, sortSection(ui).el, advancedSection(ui).el, modeSection(ui).el);
		updatePreview(ctrl);
		updateLiveNote(ctrl);
	};
	var updatePreview = (ctrl) => {
		if (!preview) return;
		const show = Settings.getSettings().showQuery;
		preview.classList.toggle("pd2te-hidden", !show);
		if (!show) return;
		const result = compile(ctrl.current);
		if (!result.ok) {
			preview.textContent = result.error;
			return;
		}
		const query = { ...result.value.form };
		delete query.properties;
		const { sort } = ctrl.current;
		const branches = result.value.branches > 0 ? `\n// ${result.value.branches} OR branches` : "";
		preview.textContent = JSON.stringify({
			...query,
			$sort: { [sort.field]: sort.direction }
		}, null, 1) + branches;
	};
	var LINK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>`;
	var copySearchLink = async (ui) => {
		const url = searchLink(ui.ctrl.current, false);
		try {
			await navigator.clipboard.writeText(url);
			ui.status("Link copied. It opens in the viewer's own Hardcore/Ladder mode");
		} catch {
			window.prompt("Copy this link:", url);
		}
	};
	var toolbarSection = (ui) => makeSection(() => {
		const search = h("button", {
			type: "button",
			class: "ls-btn pd2te-gold-btn",
			text: "Search"
		});
		search.addEventListener("click", () => {
			stopLivesearchFor("you searched other filters");
			const result = ui.ctrl.search();
			if (!result.ok) {
				ui.status(result.error, "error");
				return;
			}
			const branches = result.value.branches > 0 ? `, ${result.value.branches} OR branches` : "";
			ui.status(`Searched at ${clockTime()}${branches}`);
		});
		const clear = h("button", {
			type: "button",
			class: "ls-btn stop-btn",
			text: "Clear"
		});
		clear.addEventListener("click", () => {
			stopLivesearchFor("the filters were cleared");
			ui.ctrl.clear().then(() => {
				clearTabName();
				ui.status("Filters cleared");
			}, (error) => ui.status(`Clear failed: ${errorMessage(error)}`, "error"));
		});
		const share = h("button", {
			type: "button",
			class: "ls-btn pd2te-link-btn",
			title: "Copy a link to this search",
			"aria-label": "Copy a link to this search"
		});
		share.append(html(LINK_ICON));
		share.addEventListener("click", () => void copySearchLink(ui));
		statusLine$1 = h("div", { class: "ls-status pd2te-holds-line" });
		setStatus$1(lastStatus.text, lastStatus.tone);
		liveNote = h("div", {
			class: "ls-status pd2te-live-note pd2te-hidden",
			text: "Livesearch is watching your last search, not these edits. Search stops it; then press Start again."
		});
		liveNote.dataset.tone = "warn";
		socketNote = h("div", { class: "ls-status pd2te-hidden" });
		updateSocketNote(ui.ctrl);
		sumNote = h("div", { class: "ls-status pd2te-hidden" });
		updateSumNote(ui.ctrl);
		preview = h("pre", { class: "pd2te-preview pd2te-hidden" });
		return h("div", { class: "pd2te-toolbar" }, row(search, clear, share), statusLine$1, socketNote, sumNote, liveNote, preview);
	});
	var describeSave = (action, loaded, searched) => {
		if (action.kind === "invalid") return loaded || !searched ? "" : "Type a name";
		if (action.kind === "create") return `Save creates "${action.name}"`;
		if (action.target._id !== loaded?._id) return `Save overwrites the other filter "${action.target.name}"`;
		if (action.name !== action.target.name) return `Save overwrites "${action.target.name}" and renames it "${action.name}"`;
		return `Save overwrites "${action.name}"`;
	};
	var savedFiltersSection = (ui) => makeSection((refresh) => {
		const { ctrl } = ui;
		const list = ctrl.savedFilters();
		const loaded = ctrl.loadedFilter();
		const chooser = combo(list.map((filter) => ({
			value: filter._id,
			label: filter.name
		})), loaded?._id ?? "", list.length > 0 ? `Load filter (${list.length})` : "No saved filters yet", (id) => {
			const saved = list.find((filter) => filter._id === id);
			if (!saved) return;
			stopLivesearchFor("a saved filter was loaded");
			ctrl.load(saved._id);
			setTabName(saved.name);
			ui.status(`Loaded "${saved.name}"`);
		});
		chooser.title = "Type to find a saved filter; Enter or a click loads and searches it";
		const remove = button$1("Delete", () => {
			const target = ctrl.loadedFilter();
			if (!target || !confirm(`Delete the saved filter "${target.name}"?`)) return;
			ctrl.remove(target._id).then(() => {
				ui.status(`Deleted "${target.name}"`);
				refresh();
			}, (error) => ui.status(`Delete failed: ${errorMessage(error)}`, "error"));
		}, "pd2te-btn-danger");
		remove.disabled = !loaded;
		remove.title = loaded ? `Delete "${loaded.name}"` : "Load a saved filter to delete it";
		const nameInput = textInput(loaded?.name ?? "", "Name", () => {}, 30);
		const hint = h("div", { class: "pd2te-hint pd2te-holds-line" });
		const describe = () => {
			hint.textContent = describeSave(ctrl.saveAction(nameInput.value), ctrl.loadedFilter(), ctrl.hasSearched());
		};
		nameInput.addEventListener("input", describe);
		ctrl.onSearched = describe;
		let busy = false;
		const run = (task) => {
			if (busy) return;
			busy = true;
			save.disabled = true;
			saveNew.disabled = true;
			task().then(({ saved, note }) => {
				setTabName(saved.name);
				ui.status(`Saved "${saved.name}" at ${clockTime()}${note ? `, but ${note}` : ""}`, note ? "warn" : "info");
				refresh();
			}, (error) => {
				busy = false;
				save.disabled = false;
				saveNew.disabled = false;
				ui.status(`Save failed: ${errorMessage(error)}`, "error");
			});
		};
		const save = button$1("Save", () => {
			const action = ctrl.saveAction(nameInput.value);
			if (action.kind === "invalid") {
				ui.status(action.message, "warn");
				return;
			}
			if (action.kind === "overwrite" && action.target._id !== ctrl.loadedFilter()?._id && !confirm(`Overwrite the saved filter "${action.target.name}" with these filters?`)) return;
			run(() => ctrl.save(nameInput.value));
		});
		save.title = "Overwrites the loaded filter (renamed, if you changed the name), or creates one when none is loaded";
		const saveNew = button$1("Save as new", () => {
			const name = nameInput.value.trim();
			const taken = name === "" ? null : ctrl.findByName(name);
			if (name === "" || taken) {
				ui.status(taken ? `"${taken.name}" already exists: give the new filter another name` : "Give the new filter a name first", "warn");
				return;
			}
			run(() => ctrl.saveAsNew(name));
		});
		saveNew.title = "Saves these filters as a new saved filter under this name";
		nameInput.addEventListener("keydown", (event) => {
			if (event.key === "Enter") save.click();
		});
		describe();
		savedMarker = h("span", {
			class: "pd2te-unsaved pd2te-invisible",
			text: "unsaved changes",
			title: "The filters differ from the loaded saved filter"
		});
		updateSavedMarker(ctrl);
		return panel$1("saved", "My Filters", h("div", {}, row(chooser, remove), row(nameInput, save, saveNew), hint), true, savedMarker);
	});
	var modeSection = (ui) => makeSection(() => {
		const model = ui.ctrl.current;
		return panel$1("mode", "Mode", h("div", { class: "pd2te-grid2" }, field("Mode", triSelect(triOfBool(model.hardcore), [
			"Any",
			"Hardcore",
			"Softcore"
		], (value) => ui.change((m) => {
			m.hardcore = boolOfTri(value);
		}))), field("Ladder", triSelect(triOfBool(model.ladder), [
			"Any",
			"Ladder",
			"Non-ladder"
		], (value) => ui.change((m) => {
			m.ladder = boolOfTri(value);
		}))), button$1("Save as default", () => {
			ui.ctrl.site.updatePreferences().then(() => ui.status("Mode saved as your default"), (error) => ui.status(`Could not save the default: ${errorMessage(error)}`, "error"));
		})), false);
	});
	var itemSection = (ui) => makeSection((refresh) => {
		const model = ui.ctrl.current;
		const { vocab } = ui;
		const typeOptions = vocab.types.map((type) => ({
			value: type.code,
			label: type.display
		}));
		const baseOptions = (model.types.length > 0 ? vocab.bases.filter((base) => model.types.includes(base.typeCode)) : vocab.bases).map((base) => ({
			value: base.code,
			label: base.display
		}));
		return panel$1("item", "Item", h("div", {}, field("Name", multiPicker({
			options: vocab.names.map((name) => ({
				value: name,
				label: name
			})),
			selected: model.names,
			placeholder: "Exact name",
			onChange: (names) => ui.change((m) => {
				m.names = names;
			}, refresh)
		}), textInput(model.nameContains, "Contains", (value) => ui.change((m) => {
			m.nameContains = value;
		}))), field("Price text", h("div", { class: "pd2te-grid2" }, textInput(model.price, "Include", (value) => ui.change((m) => {
			m.price = value;
		})), textInput(model.priceExclude, "Exclude", (value) => ui.change((m) => {
			m.priceExclude = value;
		})))), field("Price (HR)", rangeInputs(model.hrPrice, (range) => ui.change((m) => {
			m.hrPrice = range;
		}))), field("Type", multiPicker({
			options: typeOptions,
			selected: model.types,
			placeholder: "Add a type",
			onChange: (types) => ui.change((m) => {
				m.types = types;
			}, refresh)
		})), field("Base", multiPicker({
			options: baseOptions,
			selected: model.bases,
			placeholder: model.types.length > 0 ? "Add a base of those types" : "Add a base",
			onChange: (selected) => ui.change((m) => {
				m.bases = selected;
			}, refresh)
		})), field("Rarity", multiPicker({
			options: QUALITIES.map((quality) => ({
				value: quality,
				label: quality
			})),
			selected: model.qualities,
			placeholder: "",
			inline: true,
			onChange: (qualities) => ui.change((m) => {
				m.qualities = qualities;
			})
		})), h("div", { class: "pd2te-grid2" }, field("Ethereal", triSelect(model.ethereal, [
			"Any",
			"Yes",
			"No"
		], (value) => ui.change((m) => {
			m.ethereal = value;
		}))), field("Corrupted", triSelect(model.corrupted, [
			"Any",
			"Yes",
			"No"
		], (value) => ui.change((m) => {
			m.corrupted = value;
		}))), field("Desecrated", triSelect(model.desecrated, [
			"Any",
			"Yes",
			"No"
		], (value) => ui.change((m) => {
			m.desecrated = value;
		}))), field("Identified", triSelect(model.identified, [
			"Any",
			"Yes",
			"No"
		], (value) => ui.change((m) => {
			m.identified = value;
		})))), field("Sockets (any of)", multiPicker({
			options: SOCKET_COUNTS.map((count) => ({
				value: count,
				label: count
			})),
			selected: model.socketValues.map(String),
			placeholder: "",
			inline: true,
			columns: 7,
			onChange: (counts) => ui.change((m) => {
				m.socketValues = counts.map(Number);
			})
		}), rangeInputs(model.socketRange, (range) => ui.change((m) => {
			m.socketRange = range;
		}))), h("div", { class: "pd2te-grid2" }, field("Item level", rangeInputs(model.itemLevel, (range) => ui.change((m) => {
			m.itemLevel = range;
		}))), field("Defense", rangeInputs(model.defense, (range) => ui.change((m) => {
			m.defense = range;
		}))))), true);
	});
	var modRow = (ui, mod, onRemove) => {
		const { vocab } = ui;
		const parts = [h("div", { class: "pd2te-mod-head" }, h("span", {
			class: "pd2te-mod-name",
			text: propertyLabel(vocab, mod.key),
			title: mod.key
		}), button$1("×", onRemove, "pd2te-btn-small pd2te-btn-danger"))];
		let valueLabels = ["Min", "Max"];
		if (vocab.skillProperties.has(mod.key)) {
			parts.push(selectInput([{
				value: "",
				label: "Any skill"
			}, ...vocab.skills.map((skill) => ({
				value: String(skill.value),
				label: skill.label
			}))], mod.skill === void 0 ? "" : String(mod.skill), (value) => ui.change(() => setOptional(mod, "skill", value === "" ? void 0 : Number(value)))), rangeInputs({
				min: mod.skillLevelMin,
				max: mod.skillLevelMax
			}, (range) => ui.change(() => {
				setOptional(mod, "skillLevelMin", range.min);
				setOptional(mod, "skillLevelMax", range.max);
			}), ["Level min", "Level max"]));
			valueLabels = ["Chance min", "Chance max"];
		}
		if (mod.key === "item_aura") {
			parts.push(selectInput([{
				value: "",
				label: "Any aura"
			}, ...vocab.auras.map((aura) => ({
				value: String(aura.value),
				label: aura.label
			}))], mod.aura === void 0 ? "" : String(mod.aura), (value) => ui.change(() => setOptional(mod, "aura", value === "" ? void 0 : Number(value)))));
			valueLabels = ["Level min", "Level max"];
		}
		parts.push(rangeInputs({
			min: mod.min,
			max: mod.max
		}, (range) => ui.change(() => {
			setOptional(mod, "min", range.min);
			setOptional(mod, "max", range.max);
		}), valueLabels));
		return h("div", { class: "pd2te-mod" }, ...parts);
	};
	var modsSection = (ui) => makeSection((refresh) => {
		const model = ui.ctrl.current;
		return panel$1("mods", "Mods", h("div", {}, checkbox("Ignore socketed jewels/runes", model.ignoreSocketed, (checked) => ui.change((m) => {
			m.ignoreSocketed = checked;
		}), "Mod values count the item's own stats only: 350% ED plus two 40% ED jewels no longer passes 400% ED. For Mods, Mod groups and corrupted mods; a minimum is exact, a maximum still counts what's socketed. Runewords keep their runes. The livesearch checks it too"), field("Must have", picker(ui.propertyOptions, "Add a mod", (key) => ui.change((m) => {
			m.mods.push({ key });
		}, refresh)), ...model.mods.map((mod, index) => modRow(ui, mod, () => ui.change((m) => {
			m.mods.splice(index, 1);
		}, refresh)))), field("Must not have", multiPicker({
			options: ui.modifierNames,
			selected: model.excludeMods,
			placeholder: "Add a mod to exclude",
			onChange: (excluded) => ui.change((m) => {
				m.excludeMods = excluded;
			}, refresh)
		}))), true);
	});
	var groupBox = (ui, group, index, refresh) => {
		const count = group.mods.length;
		const atLeastOptions = Array.from({ length: Math.max(1, count) }, (_, i) => ({
			value: String(i + 1),
			label: String(i + 1)
		}));
		return h("div", { class: "pd2te-group" }, h("div", { class: "pd2te-group-head" }, h("span", { text: "At least" }), selectInput(atLeastOptions, String(Math.min(Math.max(1, group.atLeast), Math.max(1, count))), (value) => ui.change(() => {
			group.atLeast = Number(value);
		})), h("span", { text: count === 1 ? "of this mod" : `of these ${count} mods` }), h("span", { class: "pd2te-spacer" }), button$1("Remove group", () => ui.change((m) => {
			m.groups.splice(index, 1);
		}, refresh), "pd2te-btn-small pd2te-btn-danger")), picker(ui.propertyOptions, "Add a mod to this group", (key) => ui.change(() => {
			group.mods.push({ key });
		}, refresh)), ...group.mods.map((mod, modIndex) => modRow(ui, mod, () => ui.change(() => {
			group.mods.splice(modIndex, 1);
		}, refresh))));
	};
	var groupsSection = (ui) => makeSection((refresh) => {
		const model = ui.ctrl.current;
		return panel$1("groups", "Mod groups (OR)", h("div", {}, ...model.groups.map((group, index) => groupBox(ui, group, index, refresh)), button$1("Add group", () => ui.change((m) => {
			m.groups.push({
				atLeast: 1,
				mods: []
			});
		}, refresh))), true);
	});
	var sumTermRow = (ui, term, onRemove) => {
		const weight = numberInput(term.weight, "Weight", (value) => {
			if (value === void 0) {
				weight.value = String(term.weight);
				return;
			}
			ui.change(() => {
				term.weight = value;
			});
		});
		weight.step = "any";
		weight.classList.add("pd2te-sum-weight");
		weight.title = "Each point of this mod counts this much (3, 0.5, -1...)";
		return h("div", { class: "pd2te-sum-term" }, h("span", {
			class: "pd2te-mod-name",
			text: propertyLabel(ui.vocab, term.key),
			title: term.key
		}), h("span", {
			class: "pd2te-sum-times",
			text: "×"
		}), weight, button$1("×", onRemove, "pd2te-btn-small pd2te-btn-danger"));
	};
	var sumBox = (ui, sum, index, refresh, terms) => {
		const total = rangeInputs({
			min: sum.min,
			max: sum.max
		}, (range) => ui.change(() => {
			if (range.min === void 0) delete sum.min;
			else sum.min = range.min;
			if (range.max === void 0) delete sum.max;
			else sum.max = range.max;
		}), ["Min", "Max"]);
		total.classList.add("pd2te-sum-total");
		return h("div", { class: "pd2te-group" }, h("div", { class: "pd2te-group-head" }, h("span", { text: "Total" }), total, button$1("Remove sum", () => ui.change((m) => {
			m.sums.splice(index, 1);
		}, refresh), "pd2te-btn-small pd2te-btn-danger")), picker(terms, "Add mod", (key) => ui.change(() => {
			if (!sum.terms.some((term) => term.key === key)) sum.terms.push({
				key,
				weight: 1
			});
		}, refresh)), ...sum.terms.map((term, termIndex) => sumTermRow(ui, term, () => ui.change(() => {
			sum.terms.splice(termIndex, 1);
		}, refresh))));
	};
	var sumsSection = (ui) => makeSection((refresh) => {
		const model = ui.ctrl.current;
		const terms = ui.propertyOptions.filter((option) => isSummable(option.value));
		return panel$1("sums", "Weighted Sums", h("div", {}, ...model.sums.map((sum, index) => sumBox(ui, sum, index, refresh, terms)), button$1("Add sum", () => ui.change((m) => {
			m.sums.push({ terms: [] });
		}, refresh))), true);
	});
	var corruptionSection = (ui) => makeSection((refresh) => {
		const model = ui.ctrl.current;
		const outcomes = model.corruptionOutcomes;
		const need = h("div", { class: `pd2te-group-head${outcomes.length > 1 ? "" : " pd2te-invisible"}` }, h("span", { text: "At least" }), selectInput(Array.from({ length: Math.max(1, outcomes.length) }, (_, index) => ({
			value: String(index + 1),
			label: String(index + 1)
		})), String(Math.min(Math.max(1, model.corruptionAtLeast), Math.max(1, outcomes.length))), (value) => ui.change((m) => {
			m.corruptionAtLeast = Number(value);
		})), h("span", { text: `of these ${outcomes.length} mods` }));
		need.title = "Counted over what the corruption and the desecration (the second corruption) rolled";
		const add = picker(ui.modifierNames, "Add a corrupted mod", (key) => ui.change((m) => {
			if (!m.corruptionOutcomes.some((outcome) => outcome.key === key)) m.corruptionOutcomes.push({ key });
		}, refresh));
		add.title = "A mod the item's corruption or its desecration (the second corruption) rolled";
		return panel$1("corruption", "Corruption", h("div", {}, add, ...outcomes.map((outcome, index) => modRow(ui, outcome, () => ui.change((m) => {
			m.corruptionOutcomes.splice(index, 1);
		}, refresh))), need), false);
	});
	var sellerSection = (ui) => makeSection((refresh) => {
		const model = ui.ctrl.current;
		const nameInput = textInput("", "Site username or game account", () => {}, 40);
		const setSeller = () => {
			const name = nameInput.value.trim();
			if (name === "") return;
			ui.status(`Looking up ${name}...`);
			findUserByName(name).then((user) => {
				if (!user) {
					ui.status(`No site user or game account named ${name}`, "warn");
					return;
				}
				ui.change((m) => {
					m.seller = user.username ? {
						id: user._id,
						name: user.username
					} : { id: user._id };
				}, refresh);
				ui.status(`Seller set to ${user.username ?? user._id}; press Search`);
			}, (error) => ui.status(`Lookup failed: ${errorMessage(error)}`, "error"));
		};
		nameInput.addEventListener("keydown", (event) => {
			if (event.key === "Enter") setSeller();
		});
		return panel$1("seller", "Seller & listing", h("div", {}, field("Seller", model.seller ? row(h("span", {
			class: "pd2te-mod-name",
			text: `Seller: ${model.seller.name ?? model.seller.id}`,
			title: model.seller.id
		}), button$1("×", () => ui.change((m) => {
			delete m.seller;
		}, refresh), "pd2te-btn-small pd2te-btn-danger")) : row(nameInput, button$1("Set", setSeller))), h("div", { class: "pd2te-grid2" }, field("Seller on the site", triSelect(model.online, [
			"Any",
			"Online",
			"Offline"
		], (value) => ui.change((m) => {
			m.online = value;
		}))), field("Seller in game", triSelect(model.inGame, [
			"Any",
			"In game",
			"Not in game"
		], (value) => ui.change((m) => {
			m.inGame = value;
		})))), checkbox("Include listings older than 3 days", model.includeStale, (checked) => ui.change((m) => {
			m.includeStale = checked;
		}), "Off: only listings created, bumped or edited in the last 3 days, which is all the site itself ever shows")), false);
	});
	var requirementsSection = (ui) => makeSection(() => {
		const model = ui.ctrl.current;
		return panel$1("requirements", "Requirements", h("div", {}, field("Class", multiPicker({
			options: CLASSES,
			selected: model.classes,
			placeholder: "",
			inline: true,
			onChange: (classes) => ui.change((m) => {
				m.classes = classes;
			})
		})), field("Level", rangeInputs(model.level, (range) => ui.change((m) => {
			m.level = range;
		}))), h("div", { class: "pd2te-grid2" }, field("Strength", rangeInputs(model.strength, (range) => ui.change((m) => {
			m.strength = range;
		}))), field("Dexterity", rangeInputs(model.dexterity, (range) => ui.change((m) => {
			m.dexterity = range;
		}))))), false);
	});
	var sortSection = (ui) => makeSection(() => {
		const model = ui.ctrl.current;
		const fields = [...SORT_FIELDS, {
			value: SUM_SORT_FIELD,
			label: "Sum (the first one, see Weighted Sums)"
		}];
		return panel$1("sort", "Sort", h("div", { class: "pd2te-grid2" }, field("Sort by", selectInput(fields.some((option) => option.value === model.sort.field) ? fields : [...fields, {
			value: model.sort.field,
			label: model.sort.field
		}], model.sort.field, (value) => ui.change((m) => {
			m.sort.field = value;
		}))), field("Order", selectInput([{
			value: "-1",
			label: "Descending"
		}, {
			value: "1",
			label: "Ascending"
		}], String(model.sort.direction), (value) => ui.change((m) => {
			m.sort.direction = value === "1" ? 1 : -1;
		})))), false);
	});
	var advancedSection = (ui) => makeSection(() => {
		const model = ui.ctrl.current;
		const textarea = h("textarea", {
			class: "pd2te-input",
			placeholder: "{ \"item.durability.current\": { \"$gte\": 10 } }",
			spellcheck: "false"
		});
		textarea.value = model.custom;
		textarea.addEventListener("change", () => ui.change((m) => {
			m.custom = textarea.value;
		}));
		return panel$1("advanced", "Custom query", h("div", {}, h("div", {
			class: "pd2te-hint",
			text: "A JSON object of query keys merged into the search. A $or here becomes another OR group. Anything a loaded filter has that the panels can't show ends up here."
		}), textarea), model.custom.trim() !== "");
	});
	var LOG$5 = "[pd2-trade-enhancer]";
	var installSearchChecks = () => {
		if (!setPageQueryRewriter((query) => sumRewrite(query) ?? socketedRewrite(query))) console.warn(`${LOG$5} Couldn't hook the page's search: sums and "Ignore socketed jewels/runes" won't narrow the results.`);
	};
	var LOG$4 = "[pd2-trade-enhancer]";
	var bridgeChecked = false;
	var warnedIds = new Set();
	var tradeOnLoad = () => {
		if (!document.querySelector("div.filters > div")) return;
		addIdToImportantTradeElements();
		if (!document.getElementById("filters")) return;
		mountLivesearchUi();
		forceNewestFirstSort();
		if (mountFilterColumn() === "failed") console.warn(`${LOG$4} The enhanced filter column could not be mounted (see above): keeping the site's own filter column.`);
		installSearchChecks();
		checkBridgeOnce();
		onMarketPageMounted();
	};
	var addIdToImportantTradeElements = () => {
		IMPORTANT_ELEMENTS.forEach(({ id, find, expected = 1 }) => {
			const matches = find();
			if (matches.length === expected) {
				matches[0].id = id;
				return;
			}
			if (warnedIds.has(id)) return;
			warnedIds.add(id);
			console.warn(`${LOG$4} #${id}: expected ${expected} match(es), found ${matches.length}. Site layout changed? Not tagged.`);
		});
	};
	var checkBridgeOnce = () => {
		if (bridgeChecked) return;
		bridgeChecked = true;
		const problem = probeBridge();
		if (problem !== null) {
			console.warn(`${LOG$4} Livesearch won't be able to start: ${problem}.`);
			return;
		}
		console.info(`${LOG$4} Site app and API client reachable: livesearch will poll the API.`);
		getQueryBuilder().then((build) => console.info(build ? `${LOG$4} Found the site's query builder: Start builds the query from the filter panel.` : `${LOG$4} The site's query builder wasn't found: Start runs the page's search to capture the query.`));
	};
	var forceNewestFirstSort = () => {
		const filters = getMarketFilters();
		if (filters) setSort(filters, "bumped_at", -1);
	};
	var CREATE_ROUTE = "market.create";
	var isCreatePage = (proxy) => isObject(proxy) && Array.isArray(proxy.listings) && hasFunctions(proxy, "fetchListings", "$watch");
	var isCharacterDetails = (proxy) => isObject(proxy) && "selectedItem" in proxy && hasFunctions(proxy, "selectItem", "deselectItem", "$watch");
	var isItemGrid = (proxy) => isObject(proxy) && Array.isArray(proxy.items) && typeof proxy.onItemClick === "function";
	var getCreatePage = () => getRouteComponent(CREATE_ROUTE, "PageGameMarketCreate", isCreatePage);
	var getCharacterDetails = (page = getCreatePage()) => page ? findComponent(page.$.subTree, "ComponentGameArmoryCharacterDetails", isCharacterDetails) : null;
	var getVisibleStashItems = (details) => {
		if (details.display !== "stash") return null;
		return findAllComponents(details.$.subTree, "ContentItemGrid", isItemGrid).filter((grid) => grid.$el instanceof HTMLElement && grid.$el.isConnected && grid.$el.offsetParent !== null).flatMap((grid) => grid.items);
	};
	var getListingCrud = () => {
		try {
			const service = getApi()?.service("market/listing");
			return hasFunctions(service, "find", "create", "patch", "remove") ? service : null;
		} catch {
			return null;
		}
	};
	var LOG$3 = "[pd2-trade-enhancer]";
	var REQUEST_TIMEOUT_MS = 15e3;
	var RECONNECT_WAIT_MS = 6e4;
	var RATE_LIMIT_WAIT_MS = 3e4;
	var MAX_SEND_ATTEMPTS = 3;
	var VERIFY_DELAY_MS = 3e3;
	var classify = (error) => {
		const code = errorCode(error);
		const name = typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";
		if (code === 404 || name === "NotFound") return "notFound";
		if (isRateLimitError(error)) return "rateLimited";
		if (code === 408 || name === "Timeout") return "timeout";
		if (code >= 400 && code < 500) return "rejected";
		return "unknown";
	};
	var waitForConnection = async () => {
		const socket = getSocket();
		if (!socket || socket.connected !== false) return true;
		await new Promise((resolve) => {
			const done = () => {
				clearTimeout(timeoutId);
				socket.off("connect", done);
				resolve();
			};
			const timeoutId = setTimeout(done, RECONNECT_WAIT_MS);
			socket.on("connect", done);
		});
		return socket.connected !== false;
	};
	var callOnce = async (send) => {
		if (!await waitForConnection()) return {
			ok: false,
			kind: "offline",
			error: new Error("not connected to the site")
		};
		return new Promise((resolve) => {
			let settled = false;
			const finish = (result) => {
				if (settled) return;
				settled = true;
				clearTimeout(timeoutId);
				resolve(result);
			};
			const timeoutId = setTimeout(() => {
				finish({
					ok: false,
					kind: "timeout",
					error: new Error(`no answer after ${REQUEST_TIMEOUT_MS / 1e3}s`)
				});
			}, REQUEST_TIMEOUT_MS);
			try {
				send().then((value) => finish({
					ok: true,
					value
				}), (error) => finish({
					ok: false,
					kind: classify(error),
					error
				}));
			} catch (error) {
				finish({
					ok: false,
					kind: classify(error),
					error
				});
			}
		});
	};
	var call = async (send) => {
		for (let attempt = 1;; attempt++) {
			const result = await callOnce(send);
			if (result.ok || attempt >= MAX_SEND_ATTEMPTS) return result;
			if (result.kind === "rateLimited") {
				console.warn(LOG$3, `Rate limited by the site; waiting ${RATE_LIMIT_WAIT_MS / 1e3}s before trying again.`);
				await sleep(RATE_LIMIT_WAIT_MS);
			} else if (result.kind !== "offline") return result;
		}
	};
	var serviceOrThrow = () => {
		const service = getListingCrud();
		if (!service) throw new Error("the site's market/listing service was not found");
		return service;
	};
	var itemName = (item) => item?.name?.trim() || item?.base?.name?.trim() || "Unnamed item";
	var listingName = (listing) => {
		if (listing.type === "service") return `${listing.service?.type ?? "Unknown"} service`;
		if (listing.type === "exchange") return "Exchange listing";
		return itemName(listing.item);
	};
	var isActiveItemListing = (listing) => (listing.type ?? "item") === "item" && !listing.accepted_offer_id;
	var fetchMyListings = async () => {
		const me = getMyUserId();
		if (!me) throw new Error("not logged in");
		const service = serviceOrThrow();
		const result = await call(() => service.find({
			query: {
				user_id: me,
				$limit: 100
			},
			pd2: true
		}));
		if (!result.ok) throw new Error(`could not read your listings (${errorMessage(result.error)})`);
		return (result.value.data ?? []).filter((row) => typeof row?._id === "string");
	};
	var rereadMyListings = async () => {
		try {
			return await fetchMyListings();
		} catch (error) {
			console.warn(LOG$3, "Could not re-read your listings to check what happened.", error);
			return null;
		}
	};
	var listingsOfItem = async (hash) => (await rereadMyListings())?.filter((listing) => listing.item?.hash === hash) ?? null;
	var patchListing = async (listing, verb, changes) => {
		const name = listingName(listing);
		if (listing.accepted_offer_id) return {
			ok: false,
			severity: "skip",
			message: `${name}: has an accepted offer`
		};
		const service = serviceOrThrow();
		const bumpedAt = new Date().toJSON();
		const patched = await call(() => service.patch(listing._id, {
			...changes,
			bumped_at: bumpedAt
		}));
		if (patched.ok) return {
			ok: true,
			listing: patched.value
		};
		if (patched.kind === "notFound") return {
			ok: false,
			severity: "skip",
			message: `${name}: the listing is gone (sold or removed)`
		};
		if (patched.kind === "timeout" || patched.kind === "unknown") {
			await sleep(VERIFY_DELAY_MS);
			const row = (await rereadMyListings())?.find((current) => current._id === listing._id);
			if (row && Date.parse(row.bumped_at ?? "") === Date.parse(bumpedAt)) return {
				ok: true,
				listing: row
			};
		}
		return {
			ok: false,
			severity: "stop",
			message: `${name}: the ${verb} did not go through (${errorMessage(patched.error)})`
		};
	};
	var bumpListing = (listing) => patchListing(listing, "bump", {});
	var repriceListing = (listing, price) => patchListing(listing, "price change", { price: price.text });
	var createListing = async (item, target, price) => {
		const name = itemName(item);
		const me = getMyUserId();
		if (!item.hash) return {
			ok: false,
			severity: "skip",
			message: `${name}: no item data`
		};
		if (!me) return {
			ok: false,
			severity: "stop",
			message: "not logged in"
		};
		const service = serviceOrThrow();
		const payload = {
			item: {
				...JSON.parse(JSON.stringify(item)),
				character_id: target.character,
				account_id: target.account
			},
			user_id: me,
			type: "item",
			is_hardcore: target.hardcore,
			is_ladder: target.ladder,
			price: price.text,
			bumped_at: new Date().toJSON()
		};
		const created = await call(() => service.create(payload));
		if (created.ok) return {
			ok: true,
			listing: created.value
		};
		if (created.kind === "timeout" || created.kind === "unknown") {
			await sleep(VERIFY_DELAY_MS);
			const current = await listingsOfItem(item.hash);
			if (current && current.length > 0) return {
				ok: true,
				listing: current[0]
			};
			if (current === null) return {
				ok: false,
				severity: "stop",
				message: `${name}: the create timed out and the result could not be checked`
			};
			return {
				ok: false,
				severity: "stop",
				message: `${name}: no answer from the site (${errorMessage(created.error)}); not listed`
			};
		}
		if (errorCode(created.error) === 422 && /listing limit/i.test(errorMessage(created.error))) return {
			ok: false,
			severity: "stop",
			message: `${name}: the 50-listing limit is reached; not listed`
		};
		return {
			ok: false,
			severity: "skip",
			message: `${name}: the site refused the listing (${errorMessage(created.error)})`
		};
	};
	var deleteListing = async (listing) => {
		const name = itemName(listing.item);
		const service = serviceOrThrow();
		const removed = await call(() => service.remove(listing._id));
		if (removed.ok || !removed.ok && removed.kind === "notFound") return { ok: true };
		if (removed.kind === "timeout" || removed.kind === "unknown") {
			await sleep(VERIFY_DELAY_MS);
			const current = listing.item?.hash ? await listingsOfItem(listing.item.hash) : null;
			if (current && !current.some((row) => row._id === listing._id)) return { ok: true };
		}
		return {
			ok: false,
			severity: "stop",
			message: `${name}: the delete did not go through (${errorMessage(removed.error)})`
		};
	};
	var LOG$2 = "[pd2-trade-enhancer]";
	var ITEM_GAP_MS = 1500;
	var running = null;
	var isCreateActionRunning = () => running !== null;
	var requestStop = () => {
		if (!running) return;
		running.control.stopRequested = true;
		setCreateStatus(`${running.label}: stopping after the current item...`, "warn");
	};
	var stopCreateActionOffPage = () => {
		if (running && !running.control.stopRequested && !isCreatePath()) requestStop();
	};
	var refreshPageListings = () => {
		try {
			getCreatePage()?.fetchListings();
		} catch (error) {
			console.warn(LOG$2, "Could not refresh the page's listings.", error);
		}
	};
	var runExclusive = async (label, body) => {
		if (running) {
			setCreateStatus(`${running.label} is still running`, "warn");
			return;
		}
		const current = {
			label,
			control: { stopRequested: false }
		};
		running = current;
		setCreateBusy(true);
		try {
			await body(current.control);
		} catch (error) {
			console.error(LOG$2, `${label} stopped after an error:`, error);
			setCreateStatus(`${label} stopped: ${errorMessage(error)}`, "error");
			alert(`pd2-trade-enhancer: ${label} stopped after an error: ${errorMessage(error)}\nPlease check your listings.`);
		} finally {
			running = null;
			setCreateBusy(false);
			refreshPageListings();
		}
	};
	var runJobs = async (label, jobs, control) => {
		let done = 0;
		const skipped = [];
		let failure = null;
		for (let i = 0; i < jobs.length; i++) {
			if (control.stopRequested) {
				skipped.push(`${jobs.length - i} not started (stopped)`);
				break;
			}
			const job = jobs[i];
			setCreateStatus(`${label}: ${i + 1}/${jobs.length} ${job.name}`);
			const outcome = await job.run();
			if (outcome.ok) done++;
			else if (outcome.severity === "skip") skipped.push(outcome.message);
			else {
				failure = outcome.message;
				console.error(LOG$2, `${label}: ${outcome.message}`);
				break;
			}
			if (i < jobs.length - 1 && !control.stopRequested) await sleep(ITEM_GAP_MS);
		}
		const parts = [`${done} done`];
		if (skipped.length > 0) parts.push(`${skipped.length} skipped (see console)`);
		if (failure) parts.push(`stopped: ${failure}`);
		const summary = `${label}: ${parts.join(", ")}`;
		setCreateStatus(summary, failure ? "error" : skipped.length > 0 ? "warn" : "info");
		console.info(LOG$2, summary);
		skipped.forEach((note) => console.warn(LOG$2, `${label} skipped: ${note}`));
		return !failure && !control.stopRequested;
	};
	var needStashView = () => {
		const details = getCharacterDetails();
		const items = details ? getVisibleStashItems(details) : null;
		if (!details || !items) {
			setCreateStatus("Open the Stash view first", "warn");
			return null;
		}
		return {
			details,
			items
		};
	};
	var hashesOf = (items) => new Set(items.map((item) => item.hash).filter((hash) => !!hash));
	var listingsOn = (listings, hashes) => listings.filter((listing) => isActiveItemListing(listing) && !!listing.item?.hash && hashes.has(listing.item.hash));
	var bumpJobs = (listings) => listings.map((listing) => ({
		name: itemName(listing.item),
		run: () => bumpListing(listing)
	}));
	var plural = (count, word) => `${count} ${word}${count === 1 ? "" : "s"}`;
	var bumpSelected = () => {
		const listing = getCharacterDetails()?.selectedItemListing;
		if (!listing) {
			setCreateStatus("The selected item isn't listed", "warn");
			return;
		}
		runExclusive("Bump", async (control) => {
			await runJobs("Bump", bumpJobs([listing]), control);
		});
	};
	var bumpTab = () => {
		const view = needStashView();
		if (!view) return;
		runExclusive("Bump Tab", async (control) => {
			setCreateStatus("Bump Tab: reading your listings...");
			const listings = listingsOn(await fetchMyListings(), hashesOf(view.items));
			if (listings.length === 0) {
				setCreateStatus("Bump Tab: nothing listed on this stash tab");
				return;
			}
			await runJobs("Bump Tab", bumpJobs(listings), control);
		});
	};
	var bumpAll = () => {
		runExclusive("Bump All", async (control) => {
			setCreateStatus("Bump All: reading your listings...");
			const listings = (await fetchMyListings()).filter(isActiveItemListing);
			if (listings.length === 0) {
				setCreateStatus("Bump All: you have no active listings");
				return;
			}
			await runJobs("Bump All", bumpJobs(listings), control);
		});
	};
	var deleteTab = () => {
		const view = needStashView();
		if (!view) return;
		runExclusive("Delete Tab", async (control) => {
			setCreateStatus("Delete Tab: reading your listings...");
			const listings = listingsOn(await fetchMyListings(), hashesOf(view.items));
			if (listings.length === 0) {
				setCreateStatus("Delete Tab: nothing listed on this stash tab");
				return;
			}
			await runJobs("Delete Tab", listings.map((entry) => ({
				name: itemName(entry.item),
				run: () => deleteListing(entry)
			})), control);
		});
	};
	var priceTab = (priceText) => {
		const text = priceText.trim();
		if (!text) {
			setCreateStatus("Price Tab: enter a price first", "warn");
			return;
		}
		const view = needStashView();
		if (!view) return;
		const { details, items } = view;
		const target = {
			account: details.account,
			character: details.characterDetails?.name ?? void 0,
			hardcore: details.listingHardcore,
			ladder: details.listingLadder
		};
		runExclusive("Price Tab", async (control) => {
			setCreateStatus("Price Tab: reading your listings...");
			const all = await fetchMyListings();
			const byHash = new Map();
			all.forEach((listing) => {
				const hash = listing.item?.hash;
				if (hash && (!byHash.has(hash) || isActiveItemListing(listing))) byHash.set(hash, listing);
			});
			const listed = items.map((item) => item.hash ? byHash.get(item.hash) : void 0).filter((l) => !!l);
			const unlisted = items.filter((item) => item.hash && !byHash.has(item.hash));
			const room = Math.max(0, 50 - all.length);
			const toCreate = unlisted.slice(0, room);
			const overLimit = unlisted.length - toCreate.length;
			if (unlisted.length > 0 && !target.account) {
				setCreateStatus("Price Tab: select your account first (new listings need it)", "warn");
				return;
			}
			if (listed.length + toCreate.length === 0) {
				setCreateStatus(overLimit > 0 ? `Price Tab: the 50-listing limit is reached` : "Price Tab: no items on this tab");
				return;
			}
			if (overLimit > 0) console.warn(LOG$2, `Price Tab: ${overLimit} items won't be listed (50-listing limit, you have ${all.length}).`);
			const price = { text };
			if (await runJobs("Price Tab", [...listed.map((listing) => ({
				name: itemName(listing.item),
				run: () => repriceListing(listing, price)
			})), ...toCreate.map((item) => ({
				name: itemName(item),
				run: () => createListing(item, target, price)
			}))], control) && overLimit > 0) setCreateStatus(`Price Tab done; ${plural(overLimit, "item")} not listed (50-listing limit)`, "warn");
		});
	};
	var filterButton = button$1("Filter", () => void togglePanel(), "pd2te-btn-small pd2te-card-btn pd2te-own");
	filterButton.title = "Search the market for items like this one: pick its mods, base and rarity";
	var details$1 = null;
	var panelItem = null;
	var selectedCard = () => document.querySelector("div.user-info")?.closest(".listing") ?? null;
	var openPanel = () => document.querySelector(".pd2te-item-filter");
	var togglePanel = async () => {
		const open = openPanel();
		if (open) {
			open.remove();
			return;
		}
		const card = selectedCard();
		const target = details$1;
		const item = target?.selectedItem;
		if (!card || !item || !target) return;
		let vocab;
		try {
			vocab = await loadVocab();
		} catch (error) {
			setCreateStatus(`Filter: couldn't read the market's filter lists (${errorMessage(error)})`, "error");
			return;
		}
		if (target.selectedItem !== item || !card.isConnected || openPanel()) return;
		const panel = buildItemPanel(item, {
			vocab,
			ownStats: false,
			actions: [{
				label: "Search",
				title: "Open the market in a new tab, searching for the ticked ones in this listing mode",
				run: (apply) => {
					const model = emptyModel();
					if (typeof target.listingHardcore === "boolean") model.hardcore = target.listingHardcore;
					if (typeof target.listingLadder === "boolean") model.ladder = target.listingLadder;
					apply(model);
					window.open(searchLink(model), "_blank", "noopener");
				}
			}]
		});
		panelItem = item;
		card.append(panel);
	};
	var ensureItemFilter = (current) => {
		details$1 = current;
		const card = selectedCard();
		const item = current?.selectedItem;
		const panel = openPanel();
		if (panel && (!card || !item || panelItem !== item || !card.contains(panel))) panel.remove();
		if (!card || !item || !Settings.getSettings().enhancedFilters) {
			filterButton.remove();
			return;
		}
		const slot = card.querySelector(".meta > .flex") ?? card.querySelector(".meta");
		if (slot && filterButton.parentElement !== slot) slot.append(filterButton);
	};
	var panel = html(`
<div id="pd2teCreatePanel" class="pd2te-create-panel">
    <div class="pd2te-create-row">
        <button type="button" class="ls-btn start-btn pd2te-create-btn" data-action="bumpTab"
            title="Bump the listed items on this stash tab">Bump Tab</button>
        <button type="button" class="ls-btn start-btn pd2te-create-btn" data-action="bumpAll"
            title="Bump all your listings">Bump All</button>
        <button type="button" class="ls-btn stop-btn pd2te-create-btn" data-action="deleteTab"
            title="Remove the listings of the items on this stash tab">Delete Tab</button>
    </div>
    <div class="pd2te-create-row">
        <input type="text" class="name-input pd2te-price-input" placeholder="Price for Price Tab" autocomplete="off">
        <button type="button" class="ls-btn start-btn pd2te-create-btn" data-action="priceTab"
            title="List every item on this stash tab at this price (listed items get the new price and a bump)">Price Tab</button>
    </div>
    <div class="pd2te-create-row">
        <div class="ls-status pd2te-create-status"></div>
        <button type="button" class="ls-btn stop-btn pd2te-create-btn pd2te-hidden" data-action="stop"
            title="Stop after the current item">Stop</button>
    </div>
</div>
`);
	var makeBumpIcon = () => html(`
<div class="bump-button-container" title="Bump this listing">
    <svg class="bump-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
        </path>
    </svg>
</div>
`);
	var bumpIcon = makeBumpIcon();
	bumpIcon.id = "bumpContainer";
	var status$1 = panel.querySelector(".pd2te-create-status");
	var priceInput = panel.querySelector(".pd2te-price-input");
	var actionButtons = Array.from(panel.querySelectorAll("button[data-action]")).filter((button) => button.dataset.action !== "stop");
	var stopButton = panel.querySelector("button[data-action=\"stop\"]");
	var actions = {
		bumpTab: () => bumpTab(),
		bumpAll: () => bumpAll(),
		deleteTab: () => deleteTab(),
		priceTab: () => priceTab(priceInput.value),
		stop: () => requestStop()
	};
	panel.addEventListener("click", (event) => {
		const button = event.target.closest("button[data-action]");
		if (button && !button.disabled) actions[button.dataset.action ?? ""]?.();
	});
	priceInput.addEventListener("keydown", (event) => {
		if (event.key === "Enter") priceTab(priceInput.value);
	});
	bumpIcon.addEventListener("click", () => {
		if (!isCreateActionRunning()) bumpSelected();
	});
	var setCreateStatus = (text, tone = "info") => {
		status$1.textContent = text;
		status$1.dataset.tone = tone;
	};
	var setCreateBusy = (busy) => {
		actionButtons.forEach((button) => button.disabled = busy);
		priceInput.disabled = busy;
		stopButton.classList.toggle("pd2te-hidden", !busy);
		bumpIcon.classList.toggle("pd2te-busy", busy);
	};
	var ensurePanel = () => {
		const row = document.querySelector("input[placeholder='Search for stash item...']")?.closest(".flex.flex-row.mb-4");
		if (!row || panel.isConnected && panel.previousElementSibling === row) return;
		row.insertAdjacentElement("afterend", panel);
	};
	var details = null;
	var currentDetails = () => {
		if (!details || !isAlive(details)) details = getCharacterDetails();
		return details;
	};
	var ensureItemPanelControls = () => {
		const holder = document.querySelector("div.user-info")?.lastElementChild;
		if (!holder) return;
		const current = currentDetails();
		ensureItemFilter(current);
		const listed = (current?.selectedItemListing ?? null) !== null;
		if (listed && bumpIcon.parentElement !== holder) holder.appendChild(bumpIcon);
		else if (!listed && bumpIcon.isConnected) bumpIcon.remove();
	};
	var ensureCreateUi = () => {
		ensurePanel();
		ensureItemPanelControls();
	};
	var MANAGE_ROUTE = "market.manage";
	var isManagePage = (proxy) => isObject(proxy) && Array.isArray(proxy.listings) && hasFunctions(proxy, "fetch", "bumpAll", "updateListing", "$watch");
	var isListingCard = (proxy) => isObject(proxy) && isObject(proxy.listing) && typeof proxy.listing._id === "string" && "showBump" in proxy && "showActionNotification" in proxy;
	var getManagePage = () => getRouteComponent(MANAGE_ROUTE, "PageGameMarketManage", isManagePage);
	var getListingCards = (page) => findAllComponents(page.$.subTree, "GameMarketListing", isListingCard);
	var LOG$1 = "[pd2-trade-enhancer]";
	var NOTICE_MS = 2e3;
	var entries = new WeakMap();
	var MAX_LOOKUP_MISSES = 5;
	var lookupMisses = new WeakMap();
	var bumping = new Set();
	var noticeTimers = new WeakMap();
	var notify = (card, text, type) => {
		if (!isAlive(card)) return;
		card.actionNotification = text;
		card.actionNotificationType = type;
		card.showActionNotification = true;
		clearTimeout(noticeTimers.get(card));
		noticeTimers.set(card, setTimeout(() => card.showActionNotification = false, NOTICE_MS));
	};
	var bumpCard = async (card, icon) => {
		const listing = card.listing;
		if (bumping.has(listing._id)) return;
		bumping.add(listing._id);
		icon.classList.add("pd2te-busy");
		try {
			const outcome = await bumpListing(listing);
			if (outcome.ok) {
				if (outcome.listing) {
					listing.updated_at = outcome.listing.updated_at;
					listing.bumped_at = outcome.listing.bumped_at;
				}
				notify(card, "Bumped", "success");
			} else {
				console.warn(LOG$1, `Bump: ${outcome.message}`);
				notify(card, "Bump failed", "error");
			}
		} catch (error) {
			console.error(LOG$1, "Bump failed:", error);
			notify(card, "Bump failed", "error");
		} finally {
			bumping.delete(listing._id);
			icon.classList.remove("pd2te-busy");
		}
	};
	var addEntries = (elements) => {
		const page = getManagePage();
		if (!page) return;
		const cards = new Map(getListingCards(page).map((card) => [card.$el, card]));
		elements.forEach((element) => {
			const card = cards.get(element);
			if (!card) {
				lookupMisses.set(element, (lookupMisses.get(element) ?? 0) + 1);
				return;
			}
			lookupMisses.delete(element);
			const icon = makeBumpIcon();
			icon.addEventListener("click", () => void bumpCard(card, icon));
			entries.set(element, {
				card,
				icon
			});
		});
	};
	var placeIcon = (element, { card, icon }) => {
		const row = element.querySelector(".user-info")?.lastElementChild;
		const show = isAlive(card) && card.showBump && !card.listing.accepted_offer_id;
		if (show && row && icon.parentElement !== row) row.appendChild(icon);
		else if (!show && icon.isConnected) icon.remove();
	};
	var ensureManageUi = () => {
		const elements = Array.from(document.querySelectorAll(".panel.listing"));
		const unseen = elements.filter((element) => !entries.has(element) && (lookupMisses.get(element) ?? 0) < MAX_LOOKUP_MISSES);
		if (unseen.length > 0) addEntries(unseen);
		elements.forEach((element) => {
			const entry = entries.get(element);
			if (entry) placeIcon(element, entry);
		});
	};
	var EXCHANGE_ROUTE = "market.exchange";
	var isExchangePage = (proxy) => isObject(proxy) && Array.isArray(proxy.exchanges) && isObject(proxy.currencyIWant) && isObject(proxy.currencyIHave) && hasFunctions(proxy, "searchExchanges", "$watch");
	var isExchangePicker = (proxy) => isObject(proxy) && typeof proxy.header === "string" && isObject(proxy.itemList) && isObject(proxy.allItems);
	var getExchangePage = () => getRouteComponent(EXCHANGE_ROUTE, "PageGameMarketExchange", isExchangePage);
	var getPickers = (page) => {
		const pickers = findAllComponents(page.$.subTree, "ExchangeSection", isExchangePicker);
		return {
			want: pickers.find((picker) => /\bwant\b/i.test(picker.header)) ?? null,
			have: pickers.find((picker) => /\bhave\b/i.test(picker.header)) ?? null
		};
	};
	var getCurrencyNames = (page) => {
		const { want, have } = getPickers(page);
		const names = {};
		Object.entries((want ?? have)?.allItems ?? {}).forEach(([code, item]) => {
			if (item?.name) names[code] = item.name;
		});
		return names;
	};
	var isExchangeSearchQuery = (query) => query.type === "exchange" && Array.isArray(query.$or);
	var copyPicks = (picks) => JSON.parse(JSON.stringify(picks ?? {}));
	var readForm = (page) => ({
		want: copyPicks(page.currencyIWant),
		have: copyPicks(page.currencyIHave),
		hardcore: page.hardcore,
		ladder: page.ladder,
		online: page.online,
		inGame: page.inGame
	});
	var hasPicks = (page) => Object.keys(page.currencyIWant ?? {}).length > 0 || Object.keys(page.currencyIHave ?? {}).length > 0;
	var LOG = "[pd2-trade-enhancer]";
	var marker = createRunMarker("pd2te-exchange-livesearch-running", "Exchange livesearch", "Livesearch");
	var SPECIAL_NAMES = {
		hrs: "HRs",
		gold: "Gold",
		pgems: "PGems"
	};
	var session = null;
	var controller = null;
	var isExchangeLivesearchRunning = () => controller !== null;
	var currencyName = (code, names) => SPECIAL_NAMES[code] ?? names[code] ?? code;
	var entriesText = (entries, names) => (entries ?? []).map((entry) => {
		const quantity = Number(entry.quantity);
		return `${currencyName(entry.base_code ?? "?", names)}${quantity > 1 ? ` x${quantity}` : ""}`;
	}).join(", ");
	var picksText = (picks, names) => Object.keys(picks).map((code) => currencyName(code, names)).join(", ");
	var describe = (form, names) => `${picksText(form.want, names) || "anything"} for ${picksText(form.have, names) || "anything"}`;
	var toHit = (listing, names) => ({
		id: listing._id,
		name: `${entriesText(listing.exchange?.have, names) || "?"} for ${entriesText(listing.exchange?.want, names) || "?"}`,
		price: listing.price?.trim() || void 0,
		savedAt: timeOf(listing) || void 0
	});
	var onExchangePageMounted = () => {
		if (session) {
			session.sync();
			return;
		}
		marker.reportLost(setExchangeStatus);
	};
	var startExchangeLivesearch = () => {
		if (controller) return;
		const page = getExchangePage();
		const service = getListingService();
		if (!page || !service) {
			console.warn(LOG, `Exchange livesearch can't start: ${page ? "the site's API client" : "the exchange page"} wasn't found.`);
			setExchangeStatus("Can't start: the site's app isn't reachable (see console)", "error");
			return;
		}
		if (!hasPicks(page)) {
			setExchangeStatus("Pick what you want or have first", "warn");
			return;
		}
		unlockSound();
		const current = new AbortController();
		controller = current;
		const s = {
			signal: current.signal,
			finalStatus: null,
			sync: () => {}
		};
		session = s;
		marker.set(true);
		setExchangeRunning(true);
		setExchangeStatus("Starting...");
		livesearch(s, page);
	};
	var stopExchangeLivesearch = (reason) => {
		if (!controller || !session) return;
		session.finalStatus ??= [reason, "info"];
		controller.abort();
	};
	var stopExchangeLivesearchOffPage = () => {
		if (controller && !isExchangePath()) stopExchangeLivesearch(`Stopped at ${clockTime()}: you left the Exchange page`);
	};
	var livesearch = async (s, startPage) => {
		const { signal } = s;
		const service = getListingService();
		let shown = null;
		let names = getCurrencyNames(startPage);
		let loop;
		const tracker = createFeedTracker({
			signal,
			what: "exchange",
			rowsKey: "exchanges",
			getPage: () => getExchangePage(),
			showsWatchedSearch: (page) => {
				const current = loop.currentSearch();
				return !loop.hasPending() && current !== null && shown?.page === page && shown.signature === current.signature;
			},
			refetch: (page) => page.searchExchanges(Number(page.page) || 1),
			hasUnsearchedEdits: (page, searchedForm) => searchedForm === null || stableStringify(readForm(page)) !== searchedForm,
			status: setExchangeStatus
		});
		const offFind = service ? onPageFind({
			found: (query, call) => {
				const page = getExchangePage();
				if (!page || page.loading !== true || !isExchangeSearchQuery(query)) return;
				const form = readForm(page);
				tracker.pageSearched(call, stableStringify(form));
				const base = searchBaseOf(query);
				const signature = stableStringify(base);
				shown = {
					page,
					signature
				};
				names = {
					...names,
					...getCurrencyNames(page)
				};
				loop.propose({
					base,
					resolve: query.$resolve,
					signature,
					label: describe(form, names)
				});
			},
			failed: (query, call, error) => {
				const page = getExchangePage();
				if (!page || page.loading !== true || !isExchangeSearchQuery(query)) return;
				tracker.pageSearchFailed(call, error);
			}
		}) : null;
		try {
			if (!service || !offFind) {
				console.warn(LOG, "Exchange livesearch can't start: the market/listing find hooks couldn't be installed.");
				s.finalStatus ??= ["Can't start: the site's app isn't reachable (see console)", "error"];
				return;
			}
			loop = createPollLoop({
				signal,
				service,
				tracker,
				label: "Exchange livesearch",
				goneType: "exchange",
				recentHits: false,
				status: setExchangeStatus,
				findPage: (find, search, since, skip, limit) => {
					const query = {
						...search.base,
						updated_at: { $gt: new Date(since).toISOString() },
						$sort: {
							updated_at: -1,
							_id: -1
						},
						$skip: skip,
						$limit: limit
					};
					if (search.resolve !== void 0) query.$resolve = search.resolve;
					return find(query);
				},
				toHit: (row) => toHit(row, names),
				feedRows: (_find, _search, fresh) => Promise.resolve(fresh),
				onSwitch: (search) => setWatchedLabel(search.label)
			});
			s.sync = () => {
				tracker.sync();
			};
			tracker.sync();
			let captured = false;
			let attempt = 0;
			while (attempt < 2 && !signal.aborted) {
				if (!await loop.waitForConnection()) continue;
				attempt++;
				setExchangeStatus("Searching...");
				try {
					(getExchangePage() ?? startPage).searchExchanges(1);
				} catch (error) {
					console.warn(LOG, "Calling the exchange page's search failed.", error);
					break;
				}
				if (await loop.waitForSearch(8e3)) {
					captured = true;
					break;
				}
			}
			if (!captured) {
				if (!signal.aborted) {
					console.warn(LOG, "The exchange page's search never reached the market/listing find hook.");
					s.finalStatus ??= ["Stopped: couldn't capture the page's search (see console)", "error"];
				}
				return;
			}
			await loop.run();
		} catch (error) {
			console.error(LOG, "Exchange livesearch stopped after an error:", error);
			s.finalStatus ??= [`Stopped: ${errorMessage(error)} (see console)`, "error"];
		} finally {
			offFind?.();
			tracker.release();
			loop?.release();
			if (session === s) session = null;
			controller?.abort();
			controller = null;
			marker.set(false);
			setExchangeRunning(false);
			setWatchedLabel("");
			setExchangeStatus(...s.finalStatus ?? ["Stopped", "info"]);
			console.info(LOG, "Exchange livesearch stopped.");
		}
	};
	var START_TITLE = "Alert when a new exchange listing matches this search (matched like Search). Runs while this page is open, also in a background browser tab.";
	var STOP_TITLE = "Stop livesearch. Leaving this page stops it too.";
	var controls = html(`
<div id="pd2teExchangeLive" class="pd2te-exchange-live pd2te-own">
    <button type="button" class="ls-btn start-btn pd2te-exchange-btn">Livesearch</button>
    <div class="pd2te-exchange-info">
        <div class="pd2te-exchange-watched pd2te-holds-line"></div>
        <div class="ls-status pd2te-exchange-status pd2te-holds-line"></div>
    </div>
</div>
`);
	var button = controls.querySelector("button");
	var watched = controls.querySelector(".pd2te-exchange-watched");
	var status = controls.querySelector(".pd2te-exchange-status");
	button.title = START_TITLE;
	button.addEventListener("click", () => {
		if (isExchangeLivesearchRunning()) stopExchangeLivesearch(`Stopped at ${clockTime()}`);
		else startExchangeLivesearch();
	});
	var setExchangeRunning = (running) => {
		button.textContent = running ? "Stop" : "Livesearch";
		button.title = running ? STOP_TITLE : START_TITLE;
		button.classList.toggle("start-btn", !running);
		button.classList.toggle("stop-btn", running);
	};
	var setExchangeStatus = (text, tone = "info") => {
		status.textContent = text;
		status.dataset.tone = tone;
	};
	var setWatchedLabel = (label) => {
		watched.textContent = label ? `Watching: ${label}` : "";
	};
	var ensureControls = () => {
		const row = document.querySelector(".exchange-controls");
		if (!row || controls.isConnected && controls.previousElementSibling === row) return false;
		row.insertAdjacentElement("afterend", controls);
		return true;
	};
	var ensureExchangeUi = () => {
		if (ensureControls()) onExchangePageMounted();
	};
	var FILTERS_ROUTE = "market.filters";
	var PAGE_SIZE = 100;
	var isFiltersPage = (proxy) => isObject(proxy) && Array.isArray(proxy.filters) && typeof proxy.page === "number" && hasFunctions(proxy, "fetch", "updateFilterOrder", "$watch");
	var getFiltersPage = () => getRouteComponent(FILTERS_ROUTE, "PageGameMarketFilters", isFiltersPage);
	var bar = null;
	var statusLine = null;
	var sortButton = null;
	var autoSortBox = null;
	var checkedPage = null;
	var setStatus = (text, tone = "info") => {
		if (!statusLine) return;
		statusLine.textContent = text;
		statusLine.dataset.tone = tone;
	};
	var hostOf = (page) => {
		const root = page.$.subTree?.el;
		return root instanceof Element ? root.querySelector("div.flex-grow.mr-8") : null;
	};
	var showAutoSort = () => {
		const on = Settings.getSettings().autoSortFilters;
		if (autoSortBox) autoSortBox.checked = on;
		bar?.parentElement?.classList.toggle("pd2te-autosort", on);
	};
	var runSort = async (page, manual) => {
		if (sortButton) sortButton.disabled = true;
		setStatus(manual ? "Sorting..." : "Checking the order...");
		try {
			const { moved, total } = await sortSavedFilters((done, count) => setStatus(`Sorting: ${done} of ${count} moved`));
			if (moved > 0 && isAlive(page)) await page.fetch(page.page, PAGE_SIZE, (page.page - 1) * PAGE_SIZE);
			if (moved > 0) setStatus(`Sorted A-Z: ${moved} of ${total} filters moved`);
			else setStatus(manual ? `Already sorted A-Z (${total} filters)` : "");
		} catch (error) {
			setStatus(`Sorting failed: ${errorMessage(error)}`, "error");
		} finally {
			if (sortButton) sortButton.disabled = false;
		}
	};
	var buildBar = (page) => {
		sortButton = button$1("Sort A-Z", () => {
			if (Settings.getSettings().autoSortFilters || confirm("Put all your saved filters in name order? Their order is saved on the server, so it replaces the one you dragged.")) runSort(page, true);
		});
		sortButton.title = "Puts every saved filter in name order, once. Dragging still works afterwards";
		const autoSort = checkbox("Keep sorted A-Z", Settings.getSettings().autoSortFilters, (on) => saveBooleanSetting("autoSortFilters", on), "The \"Sort filters A-Z\" setting: new and renamed filters go straight to their place, others are put back when this page or the Trade page opens. Dragging is off while it's on");
		autoSortBox = autoSort.querySelector("input");
		statusLine = h("span", { class: "ls-status" });
		return h("div", { class: "pd2te-filters-bar pd2te-own" }, sortButton, autoSort, statusLine);
	};
	var ensureFiltersPageUi = () => {
		const page = getFiltersPage();
		if (!page) return;
		const host = hostOf(page);
		if (!host) return;
		if (!bar || bar.parentElement !== host) {
			bar = buildBar(page);
			host.prepend(bar);
			showAutoSort();
		}
		if (checkedPage !== page) {
			checkedPage = page;
			if (Settings.getSettings().autoSortFilters) runSort(page, false);
		}
	};
	document.addEventListener(SETTINGS_CHANGED_EVENT, () => {
		const wasOn = bar?.parentElement?.classList.contains("pd2te-autosort") ?? false;
		showAutoSort();
		const page = getFiltersPage();
		if (!wasOn && Settings.getSettings().autoSortFilters && page && bar?.isConnected) runSort(page, false);
	});
	var mainObserverLogic = () => {
		stopLivesearchOffPage();
		stopExchangeLivesearchOffPage();
		stopCreateActionOffPage();
		stopFilterSortOffPage();
		if (isMarketPath()) {
			if (document.getElementById("lsSettingsHeader")) return;
			tradeOnLoad();
		} else if (isCreatePath()) ensureCreateUi();
		else if (isManagePath()) ensureManageUi();
		else if (isExchangePath()) ensureExchangeUi();
		else if (isFiltersPath()) ensureFiltersPageUi();
	};
	new MutationObserver(mainObserverLogic).observe(document.body, {
		childList: true,
		subtree: true
	});
	mainObserverLogic();
})();

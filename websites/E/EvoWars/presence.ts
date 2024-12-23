const presence = new Presence({
		clientId: "1320365788808347678",
	}),
	browsingTimestamp = Math.floor(Date.now() / 1000);

const enum Assets { // Other default assets can be found at index.d.ts
	Logo = "https://i.imgur.com/6jYxPTx.png",
}

presence.on("UpdateData", async () => {
	const presenceData: PresenceData = {
			largeImageKey: Assets.Logo,
			startTimestamp: browsingTimestamp,
		},
		menu = {
			welcome: document.querySelector<HTMLElement>("#tr_html_text_69"), // Main tab
			main: document.querySelector<HTMLElement>("#tr_html_text_108"), // Main tab
			profile: document.querySelector<HTMLElement>("#tr_html_text_330"), // Profile tab
			settings: document.querySelector<HTMLElement>("#tr_html_text_175"), // Settings tab
			chooseMode: document.querySelector<HTMLElement>("#tr_html_text_553"), // Gamemode selection tab
		},
		submenu = {
			profile: {
				stats: document.querySelector<HTMLElement>("tr_html_text_335"),
				account: document.querySelector<HTMLElement>("tr_html_text_423"),
			},
		},
		elements = {
			profile: {
				level: document.querySelector("#tr_html_text_359")?.textContent,
				exp: document.querySelector("#tr_html_text_372")?.textContent,
			},
			chooseMode: {
				mode: document
					.querySelector("#tr_html_text_1096")
					?.textContent?.toLowerCase(),
			},
			game: {
				type: document
					.querySelector("#splash-map-name")
					?.textContent?.toLowerCase(),
				typeObjective: document
					.querySelector("#splash-map-objective")
					?.textContent?.toLowerCase(),
			},
		};
	switch (true) {
		case menu?.main?.style?.display === "block":
		case menu.welcome?.style?.display === "block": {
			presenceData.details = "Main menu";
			break;
		}
		case !!elements.game.type && !!elements.game.typeObjective: {
			presenceData.details = elements.game.type;
			presenceData.state = elements.game.typeObjective;
			break;
		}
		case menu?.settings?.style?.display !== "none": {
			presenceData.details = "Settings menu";
			break;
		}
		case menu?.chooseMode?.style?.display !== "none": {
			presenceData.details = "Choosing game menu";
			presenceData.state = `Viewing gamemode: ${elements.chooseMode.mode}`;
			break;
		}
		case menu?.profile?.style?.display !== "none": {
			switch (true) {
				case submenu.profile.stats.style?.display !== "none": {
					presenceData.details = "Profile menu - Statistics & Masteries";
					presenceData.state = `Level ${elements.profile?.level} | EXP ${elements.profile?.exp}`;
					break;
				}
				case submenu.profile.account.style?.display !== "none": {
					presenceData.details = "Profile menu - Account";
					presenceData.details = "Viewing their account";
					break;
				}
			}
			break;
		}
		default: {
			presenceData.details = "Browsing...";
		}
	}

	presence.setActivity(presenceData);
});

import { HogwartNarratorSheet } from "./narrator-sheet.js";
import { wykonajRzutCechy } from "./dice.js";
import { inicjalizujSceneStartowa } from "./sceneManager.js";
import { setupPDFCompendium } from "./compendium.js";
import { wykonajRuch } from "./moves.js";


export class HogwartActorSheet extends ActorSheet {


    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["hogwart", "sheet", "actor", "hogwart-actor-sheet", "hogwart-custom-sheet"],
            template: "systems/systemHogwartRPG/templates/actor-sheet.hbs",
            width: 950,
            height: 750,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "arkusz" }]
        });
    }

    getData() {
        const context = super.getData();
        const actorData = this.actor.toObject(false);

        context.system = actorData.system || {};
        context.flags = actorData.flags || {};
        context.items = actorData.items || [];

        context.zaklecia = [];
        context.przedmioty = [];

        for (let item of context.items) {
            item.img = item.img || Item.DEFAULT_ICON;
            if (item.type === "zaklecie") {
                context.zaklecia.push(item);
            } else {
                context.przedmioty.push(item);
            }
        }

        context.system.domySelected = {
            "gryffindor": "Gryffindor",
            "slytherin": "Slytherin",
            "ravenclaw": "Ravenclaw",
            "hufflepuff": "Hufflepuff"
        };
        context.system.lataSelected = {
            "1": game.i18n.localize("HOGWART.Glowna.1"),
            "2": game.i18n.localize("HOGWART.Glowna.2"),
            "3": game.i18n.localize("HOGWART.Glowna.3"),
            "4": game.i18n.localize("HOGWART.Glowna.4"),
            "5": game.i18n.localize("HOGWART.Glowna.5"),
            "6": game.i18n.localize("HOGWART.Glowna.6"),
            "7": game.i18n.localize("HOGWART.Glowna.7")
        };
        context.system.krewSelected = {
            "czysta": game.i18n.localize("HOGWART.Glowna.Pure"),
            "polkrwi": game.i18n.localize("HOGWART.Glowna.Half"),
            "mugolak": game.i18n.localize("HOGWART.Glowna.Muggleborn")
        };

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        const wybranyDom = this.actor.system?.dom || this.actor.system?.house || "";
        this.element.removeClass("gryffindor slytherin ravenclaw hufflepuff");
        if (wybranyDom) {
            this.element.addClass(wybranyDom.toLowerCase());
        }

        html.find('.rollable').click(this._onRoll.bind(this));
        html.find('.item-create').click(this._onItemCreate.bind(this));
        html.find('.item-edit').click(this._onItemEdit.bind(this));
        html.find('.item-delete').click(this._onItemDelete.bind(this));
    }

    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const type = header.dataset.type || "przedmiot";
        const itemData = {
            name: `Nowy ${type}`,
            type: type,
            system: {}
        };
        return await Item.create(itemData, { parent: this.actor });
    }

    _onItemEdit(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("itemId"));
        if (item) item.sheet.render(true);
    }

    async _onItemDelete(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("itemId"));
        if (item) await item.delete();
        li.slideUp(200, () => this.render(false));
    }

    async _onRoll(event) {
        event.preventDefault();
        const element = event.currentTarget;
        const dataset = element.dataset;

        if (dataset.roll || dataset.cecha) {
            const cechaNazwa = dataset.cecha;
            await wykonajRzutCechy(this.actor, cechaNazwa);
        }
    }
}

//inicjalizacja foundry
Hooks.once("init", async function () {
    console.log("Hogwart System | Rejestracja arkuszy i inicjalizacja...");

    Actors.unregisterSheet("core", ActorSheet);

    Actors.registerSheet("systemHogwartRPG", HogwartActorSheet, {
        types: ["character"],
        makeDefault: true,
        label: "Karta Postaci"
    });

    if (typeof HogwartNarratorSheet !== "undefined") {
        Actors.registerSheet("systemHogwartRPG", HogwartNarratorSheet, {
            types: ["narrator"],
            makeDefault: true,
            label: "Panel Narratora"
        });
    }

    await loadTemplates([
        "systems/systemHogwartRPG/templates/actor-history.hbs"
    ]);
});

Hooks.once("ready", async function () {
    if (typeof inicjalizujSceneStartowa === "function") {
        await inicjalizujSceneStartowa();
    }

    if (typeof setupPDFCompendium === "function") {
        await setupPDFCompendium();
    }
});

Hooks.on("renderChatMessage", (message, html) => {
    const root = html instanceof jQuery ? html : $(html);

    root.find('.btn-moj-ruch').off('click').on('click', async event => {
        event.preventDefault();
        const btn = $(event.currentTarget);
        const ruchId = btn.attr('data-ruch-id');
        const wynik = btn.attr('data-wynik');

        let actor = game.user.character
            || canvas.tokens?.controlled[0]?.actor
            || (message.speaker?.actor ? game.actors.get(message.speaker.actor) : null);

        await wykonajRuch(ruchId, actor, wynik);
    });
});
Hooks.once("init", async function () {
    console.log("Hogwart System | Rejestracja arkuszy...");

    Actors.registerSheet("systemHogwartRPG", HogwartActorSheet, {
        types: ["character"],
        makeDefault: true,
        label: "Karta Postaci"
    });

    Actors.registerSheet("systemHogwartRPG", HogwartNarratorSheet, {
        types: ["narrator"], 
        makeDefault: true,
        label: "Panel Narratora"
    });
});

const RUCHY_CONFIG = {
    "stan-w-obliczu": { cecha: "odwaga" },
    "zdobadz-czego-szukasz": { cecha: ["odwaga", "spryt"] },
    "pomoz-lub-przeszkodz": { cecha: "lojalnosc" },
    "zbliz-sie-stworzenie": { cecha: "lojalnosc" },
    "ukryj-sie": { cecha: "spryt" },
    "zdobadz-wiedze": { cecha: "intelekt" },
    "rzuc-zaklecie": { cecha: "magia" },
    "pojedynek": { cecha: "magia" },
    "uwarz-eliksir": { cecha: "magia" },
    "uzyj-obiektu": { cecha: "magia" }
};


const CECHY_MAP = {
    "odwaga": "Odwaga",
    "spryt": "Spryt",
    "lojalnosc": "Lojalnosc",
    "intelekt": "Intelekt",
    "magia": "Magia"
};


export const BAZA_RUCHOW = new Proxy({}, {
    get(target, prop) {
        if (typeof prop !== "string" || !(prop in RUCHY_CONFIG)) return target[prop];
        const config = RUCHY_CONFIG[prop];
        return {
            cecha: config.cecha,
            nazwa: game.i18n.localize(`MOVES.${prop}.name`),
            sukces: game.i18n.localize(`MOVES.${prop}.success`),
            kompromis: game.i18n.localize(`MOVES.${prop}.compromise`),
            porazka: game.i18n.localize(`MOVES.${prop}.failure`)
        };
    },
    ownKeys() {
        return Object.keys(RUCHY_CONFIG);
    },
    getOwnPropertyDescriptor(target, prop) {
        if (prop in RUCHY_CONFIG) {
            return { enumerable: true, configurable: true };
        }
    }
});


export function pobierzNazweCechy(cechaKlucz) {
    const cecha = (cechaKlucz || "").toLowerCase().trim();
    const jsonKey = CECHY_MAP[cecha] || cecha;
    return game.i18n.localize(`HOGWART.Stats.${jsonKey}`);
}


export async function rzutNaCeche(actor, cechaKlucz) {
    const cecha = (cechaKlucz || "").toLowerCase().trim();
    const przetlumaczonaCecha = pobierzNazweCechy(cecha).toUpperCase();
    const txtRzutNaCeche = game.i18n.localize("HOGWART.Roll.TraitRoll");

    const mod = actor.system?.stats?.[cecha]?.value || 0;
    const roll = new Roll(`2d6 + ${mod}`);
    await roll.evaluate();

    let labelWynik = "";
    let opisWynik = "";
    let colorStyle = "";

    if (roll.total >= 10) {
        labelWynik = game.i18n.localize("HOGWART.Roll.Success");
        opisWynik = game.i18n.localize("HOGWART.Roll.SuccessDesc");
        colorStyle = "border-left: 4px solid #27ae60; background: rgba(39, 174, 96, 0.15); color: #27ae60;";
    } else if (roll.total >= 7) {
        labelWynik = game.i18n.localize("HOGWART.Roll.Partial");
        opisWynik = game.i18n.localize("HOGWART.Roll.PartialDesc");
        colorStyle = "border-left: 4px solid #d35400; background: rgba(211, 84, 0, 0.15); color: #d35400;";
    } else {
        labelWynik = game.i18n.localize("HOGWART.Roll.Failure");
        opisWynik = game.i18n.localize("HOGWART.Roll.FailureDesc");
        colorStyle = "border-left: 4px solid #c0392b; background: rgba(192, 57, 43, 0.15); color: #c0392b;";
    }

    //html
    const htmlRuchy = await generujHtmlRuchow(actor, cecha, roll.total);

    //cała wiadomość 2
    const content = `
        <div class="hogwart-roll-card">
            <p style="margin: 0 0 6px 0;"><strong>${txtRzutNaCeche}</strong> ${przetlumaczonaCecha}</p>
            <div style="padding: 8px; margin-bottom: 8px; ${colorStyle}">
                <strong style="font-size: 1.1em;">${labelWynik}</strong>
                <p style="margin: 4px 0 0 0; font-size: 0.9em; color: #222;">${opisWynik}</p>
            </div>
            ${htmlRuchy}
        </div>
    `;

    await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        content: content
    });
}

export async function generujHtmlRuchow(actor, cechaKlucz, wynikRzutu) {
    const cecha = (cechaKlucz || "").toLowerCase().trim();

    const pasujaceRuchy = Object.entries(BAZA_RUCHOW).filter(([id, move]) => {
        if (Array.isArray(move.cecha)) {
            return move.cecha.includes(cecha);
        }
        return move.cecha === cecha;
    });

    if (pasujaceRuchy.length === 0) return "";

    const nazwaCechyPrzetlumaczona = pobierzNazweCechy(cecha).toUpperCase();
    const txtDostepneRuchy = game.i18n.localize("HOGWART.Roll.AvailableMoves");

    let html = `<div class="hogwart-moves-card" style="border: 1px solid #7a0303; padding: 8px; border-radius: 5px; background: rgba(0,0,0,0.05); margin-top: 10px;">`;
    html += `<h4 style="margin: 0 0 8px 0; text-align: center; border-bottom: 1px solid #7a0303; padding-bottom: 4px;">${txtDostepneRuchy} (${nazwaCechyPrzetlumaczona})</h4>`;

    pasujaceRuchy.forEach(([id, ruch]) => {
        html += `
            <div style="margin-bottom: 6px;">
                <button class="btn-moj-ruch" data-ruch-id="${id}" data-wynik="${wynikRzutu}" style="width: 100%; text-align: left; padding: 6px 8px; cursor: pointer; background: #2b2b2b; color: #fff; border: 1px solid #7a0303; border-radius: 3px; font-weight: bold;">
                    📖 ${ruch.nazwa}
                </button>
            </div>
        `;
    });

    html += `</div>`;

    return html;
}

export async function wykonajRuch(ruchId, actorInput, wynikRzutu) {
    const ruch = BAZA_RUCHOW[ruchId];
    if (!ruch) return;

    const actor = actorInput?.actor || actorInput;
    const total = Number(wynikRzutu);

    const txtSuccess = game.i18n.localize("HOGWART.Roll.Success");
    const txtPartial = game.i18n.localize("HOGWART.Roll.Partial");
    const txtFailure = game.i18n.localize("HOGWART.Roll.Failure");

    let html = `<div class="hogwart-move-result" style="border: 2px solid #7a0303; padding: 10px; border-radius: 5px; background: #fff; color: #111;">`;
    html += `<h3 style="margin: 0 0 8px 0; color: #7a0303; border-bottom: 1px solid #ccc; padding-bottom: 4px; text-align: center;">${ruch.nazwa}</h3>`;

    if (!isNaN(total)) {
        if (total >= 10) {
            html += `<div style="padding: 6px; background: rgba(39, 174, 96, 0.15); border-left: 4px solid #27ae60;">`;
            html += `<strong style="color: #27ae60;">${txtSuccess}:</strong><br><span style="font-size: 0.9em;">${ruch.sukces}</span>`;
            html += `</div>`;
        } else if (total >= 7) {
            html += `<div style="padding: 6px; background: rgba(211, 84, 0, 0.15); border-left: 4px solid #d35400;">`;
            html += `<strong style="color: #d35400;">${txtPartial}:</strong><br><span style="font-size: 0.9em;">${ruch.kompromis}</span>`;
            html += `</div>`;
        } else {
            html += `<div style="padding: 6px; background: rgba(192, 57, 43, 0.15); border-left: 4px solid #c0392b;">`;
            html += `<strong style="color: #c0392b;">${txtFailure}:</strong><br><span style="font-size: 0.9em;">${ruch.porazka}</span>`;
            html += `</div>`;
        }
    } else {
        html += `<div style="margin-bottom: 8px; padding: 6px; background: rgba(39, 174, 96, 0.15); border-left: 4px solid #27ae60;"><strong>${txtSuccess}:</strong><br><span style="font-size: 0.9em;">${ruch.sukces}</span></div>`;
        html += `<div style="margin-bottom: 8px; padding: 6px; background: rgba(211, 84, 0, 0.15); border-left: 4px solid #d35400;"><strong>${txtPartial}:</strong><br><span style="font-size: 0.9em;">${ruch.kompromis}</span></div>`;
        html += `<div style="padding: 6px; background: rgba(192, 57, 43, 0.15); border-left: 4px solid #c0392b;"><strong>${txtFailure}:</strong><br><span style="font-size: 0.9em;">${ruch.porazka}</span></div>`;
    }

    html += `</div>`;

    const speakerData = actor ? ChatMessage.getSpeaker({ actor: actor }) : ChatMessage.getSpeaker();

    await ChatMessage.create({
        speaker: speakerData,
        content: html
    });
}
import { generujHtmlRuchow, pobierzNazweCechy } from "./moves.js";


export async function wykonajRzutCechy(actor, cechaNazwa) {
    const kluczCechy = (cechaNazwa || "").toLowerCase().trim();

    if (actor.system.stanNieprzytomny === true) {
        ui.notifications.warn(`Postać ${actor.name} jest nieprzytomna i nie może działać!`);
        return;
    }

    const cechaWartosc = actor.system[kluczCechy] || 0;
    let modyfikator = 0;
    let opisModow = [];

    //Nazwa cechy pl - eng
    const nazwaCechyPrzetlumaczona = pobierzNazweCechy(kluczCechy).toUpperCase();

    if (kluczCechy === "odwaga" && actor.system.stanPrzestraszony === true) {
        modyfikator -= 2;
        opisModow.push(`<strong>${game.i18n.localize("HOGWART.Conditions.Afraid")}:</strong> -2`);
    }

    if (kluczCechy === "spryt" && actor.system.stanZly === true) {
        modyfikator -= 2;
        opisModow.push(`<strong>${game.i18n.localize("HOGWART.Conditions.Angry")}:</strong> -2`);
    }

    if (kluczCechy === "intelekt" && actor.system.stanZestresowany === true) {
        modyfikator -= 2;
        opisModow.push(`<strong>${game.i18n.localize("HOGWART.Conditions.Stressed")}:</strong> -2`);
    }

    if ((kluczCechy === "lojalnosc" || kluczCechy === "lojalność") && actor.system.stanZazdrosny === true) {
        modyfikator -= 2;
        opisModow.push(`<strong>${game.i18n.localize("HOGWART.Conditions.Jealous")}:</strong> -2`);
    }

    if (kluczCechy === "magia" && actor.system.stanZawstydzony === true) {
        modyfikator -= 2;
        opisModow.push(`<strong>${game.i18n.localize("HOGWART.Conditions.Embarrassed")}:</strong> -2`);
    }

    if (actor.system.stanRanny === true) {
        modyfikator -= 1;
        opisModow.push(`<strong>${game.i18n.localize("HOGWART.Conditions.Injured")}:</strong> -1`);
    }

    if (actor.system.stanPrzeklety === true && actor.system.przekletyCecha) {
        const wybrane = (actor.system.przekletyCecha || "").toLowerCase();
        if (kluczCechy === wybrane || (kluczCechy === "lojalność" && wybrane === "lojalnosc")) {
            modyfikator -= 1;
            opisModow.push(`<strong>${game.i18n.localize("HOGWART.Conditions.Cursed")}:</strong> -1`);
        }
    }

    let formula = `2d6 + ${cechaWartosc}`;
    if (modyfikator !== 0) {
        formula += modyfikator > 0 ? ` + ${modyfikator}` : ` - ${Math.abs(modyfikator)}`;
    }

    const roll = new Roll(formula, actor.getRollData());
    await roll.evaluate();

    let titleWynik = "";
    let descWynik = "";
    let borderColor = "";
    let bgColor = "";

    if (roll.total <= 6) {
        titleWynik = game.i18n.localize("HOGWART.Roll.Failure");
        descWynik = game.i18n.localize("HOGWART.Roll.FailureDesc");
        borderColor = "#c0392b";
        bgColor = "rgba(192, 57, 43, 0.08)";
    } else if (roll.total >= 7 && roll.total <= 9) {
        titleWynik = game.i18n.localize("HOGWART.Roll.Partial");
        descWynik = game.i18n.localize("HOGWART.Roll.PartialDesc");
        borderColor = "#d35400";
        bgColor = "rgba(211, 84, 0, 0.08)";
    } else {
        titleWynik = game.i18n.localize("HOGWART.Roll.Success");
        descWynik = game.i18n.localize("HOGWART.Roll.SuccessDesc");
        borderColor = "#27ae60";
        bgColor = "rgba(39, 174, 96, 0.08)";
    }

    const wynikSzablonHtml = `
      <div style="margin-top: 12px; padding: 10px; border-left: 4px solid ${borderColor}; background: ${bgColor}; border-radius: 0 4px 4px 0;">
        <strong style="color: ${borderColor}; font-size: 14px; font-weight: bold;">${titleWynik}</strong><br>
        <span style="font-size: 12px; line-height: 1.4; display: block; margin-top: 4px; color: #1a1a1a;">
          ${descWynik}
        </span>
      </div>
    `;

    const txtRzutNaCeche = game.i18n.localize("HOGWART.Roll.TraitRoll");
    let flavorText = `${txtRzutNaCeche} <strong>${nazwaCechyPrzetlumaczona}</strong>`;

    if (opisModow.length > 0) {
        flavorText += `<hr><small style="color: #444;">${opisModow.join("<br>")}</small>`;
    }

    flavorText += wynikSzablonHtml;

    //przyciski
    if (typeof generujHtmlRuchow === "function") {
        const ruchyHtml = await generujHtmlRuchow(actor, kluczCechy, roll.total);
        flavorText += `<div style="margin-top: 10px;">${ruchyHtml}</div>`;
    }

    //Cała wiadomość
    await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: actor }),
        flavor: flavorText
    });
}
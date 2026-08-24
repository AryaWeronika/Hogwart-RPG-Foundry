export class HogwartNarratorSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["hogwart", "sheet", "actor", "narrator"],
            template: "systems/systemHogwartRPG/templates/actor-narrator-sheet.hbs",
            width: 900,
            height: 750,
            resizable: true
        });
    }

    getData() {
        const context = super.getData();
        const systemData = context.actor.system;

        systemData.glownePostacie = systemData.glownePostacie || {
            "1": { nazwa: "", dom: "", rok: "" },
            "2": { nazwa: "", dom: "", rok: "" },
            "3": { nazwa: "", dom: "", rok: "" },
            "4": { nazwa: "", dom: "", rok: "" },
            "5": { nazwa: "", dom: "", rok: "" }
        };

        systemData.postacieNarratora = systemData.postacieNarratora || {
            "1": { nazwa: "", rola: "", cecha: "" },
            "2": { nazwa: "", rola: "", cecha: "" },
            "3": { nazwa: "", rola: "", cecha: "" },
            "4": { nazwa: "", rola: "", cecha: "" },
            "5": { nazwa: "", rola: "", cecha: "" },
            "6": { nazwa: "", rola: "", cecha: "" }
        };

        systemData.zagrozenia = systemData.zagrozenia || {
            "1": { tytul: "", dotyczy: "", stawka: "", krok: "" },
            "2": { tytul: "", dotyczy: "", stawka: "", krok: "" },
            "3": { tytul: "", dotyczy: "", stawka: "", krok: "" }
        };

        context.system = systemData;
        return context;
    }
}
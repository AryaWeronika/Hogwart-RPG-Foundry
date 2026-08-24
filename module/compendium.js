export async function setupPDFCompendium() {
    if (!game.user.isGM) return;

    const pack = game.packs.get("systemHogwartRPG.podrecznik-hogwart");
    if (!pack) return;

    const index = await pack.getIndex();

    if (index.size === 0) {//pussta paczka wtedy
        console.log("Hogwart System | Generowanie podręczników PDF...");

        const pdfPL = "systems/systemHogwartRPG/assets/podrecznik.pdf";
        const pdfEN = "systems/systemHogwartRPG/assets/podrecznikENG.pdf";

        await pack.configure({ locked: false });

        await JournalEntry.create({
            name: "Podręcznik Główny / Core Rulebook",
            pages: [
                {
                    name: "Podręcznik (PL)",
                    type: "pdf",
                    src: pdfPL
                },
                {
                    name: "Core Rulebook (EN)",
                    type: "pdf",
                    src: pdfEN
                }
            ]
        }, { pack: pack.collection });

        await pack.configure({ locked: true });
    }
}
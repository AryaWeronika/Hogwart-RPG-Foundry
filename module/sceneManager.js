//startowa scena z tłem
export async function inicjalizujSceneStartowa() {
    
    if (game.user.isGM && game.scenes.size === 0) {

        const sceneData = {
            name: "Pokój Wspólny (Start)",
            img: "systems/systemHogwartRPG/assets/scena-startowa.webp",
            active: true,            
            navigation: true,        
            navName: "Strona Startowa",
            grid: {
                type: 0                
            },
            padding: 0,              
            background: {
                color: "#1a1a1a"
            }
        };

        try {
            const nowaScena = await Scene.create(sceneData);
            await nowaScena.view(); 
        } catch (error) {
            console.error(error);
        }
    }
}
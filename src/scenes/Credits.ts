import { GameData } from "../GameData";

export default class Credits extends Phaser.Scene {

    private creditsText!: Phaser.GameObjects.Text;
    private scrollSpeed: number = 40;

    constructor() {
        super({ key: "Credits" });
    }

    preload() {
    }

    create() {

        
        this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, "Background-Credits")
            .setOrigin(0.5)
            .setDisplaySize(this.scale.width / 2, this.scale.height / 2);

        
        const creditsContent = `
 IL NOSTRO VIDEOGIOCO 

--- PROGRAMMAZIONE ---
Simone Codetti
Marco Cuomo
Marco Pisapia
FrancescoPIO Manzo
Simone Avagliano
Antonio Casaburi
--- GRAFICA ---
Enza
MariaGrazia Casaburi
Albachiara
Maria
--- MUSICA ---
Vinicius
Simone Avagliano
--- TESTER ---
Simone Codetti
Marco Cuomo

Grazie per aver giocato!
        `;

        this.creditsText = this.add.text(
            this.scale.width / 2,
            this.scale.height,
            creditsContent,
            {
                fontFamily: "Arial",
                fontSize: "28px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: this.scale.width - 100 }
            }
        ).setOrigin(0.5, 0);

        
        const closeButton = this.add.text(
            this.scale.width - 400,
            250,
            "CHIUDI",
            {
                fontSize: "24px",
                backgroundColor: "#000000",
                color: "#ffffff",
                padding: { x: 10, y: 5 }
            }
        )
        .setOrigin(0.5)
        .setInteractive();

        closeButton.on("pointerdown", () => {
            this.scene.start("Intro"); // Cambia con la tua scena Intro
        });

      
        this.input.keyboard?.on("keydown-ESC", () => {
            this.scene.start("Intro"); // Cambia con la tua scena Intro
        });
    }

    update(time: number, delta: number) {

        
        this.creditsText.y -= this.scrollSpeed * (delta / 1000);

        
        if (this.creditsText.y + this.creditsText.height < 0) {
            this.creditsText.y = this.scale.height;
        }
    }
}
// Definizione della scena Intro che estende Phaser.Scene
import { gameSettingsManager, GameSettings } from "../GameSettings";

export default class Intro extends Phaser.Scene {

  // =====================
  // DICHIARAZIONE VARIABILI
  // =====================

  // Variabile per il logo del gioco (versione testuale)
  private _logoGioco!: Phaser.GameObjects.Image;

  // Variabile per il bottone PLAY
  private _playButton!: Phaser.GameObjects.Sprite;

  // Variabile per il bottone AUDIO
  private _audioButton!: Phaser.GameObjects.Sprite;

  // Container che conterrà le informazioni
  private _infoContainer!: Phaser.GameObjects.Container;

  // Testo che mostra i comandi del gioco
  private _infoText!: Phaser.GameObjects.Text;

  // Bottone per chiudere il pannello info
  private _closeButton!: Phaser.GameObjects.Text;

  // Bottone per aprire le impostazioni
  private _settingsButton!: Phaser.GameObjects.Sprite;

  // Bottone per aprire le crediti
  private _creditsButton!: Phaser.GameObjects.Sprite;

  // Variabile per la musica di sottofondo
  private _music!: Phaser.Sound.BaseSound;

  // Listener per le impostazioni globali
  private settingsListener?: (settings: GameSettings) => void;

  // =====================
  // COSTRUTTORE
  // =====================

  // Costruttore della scena
  constructor() {

    // Richiama il costruttore della classe Phaser.Scene
    super({ key: "Intro" });
  }

  // =====================
  // PRELOAD
  // =====================

  // Metodo per il caricamento degli asset
  preload() {

    // --- CARICAMENTO SFONDO ---
    // this.load.image("background", "PERCORSO/DEL/TUO/SFONDO.png");

    // --- CARICAMENTO LOGO GIOCO ---
    // this.load.image("logoGioco", "PERCORSO/DEL/LOGO_GIOCO.png");

    // --- CARICAMENTO LOGO SCUOLA ---
    // this.load.image("logoScuola", "PERCORSO/DEL/LOGO_SCUOLA.png");

    // --- CARICAMENTO LOGO GRUPPO ---
    // this.load.image("logoGruppo", "PERCORSO/DEL/LOGO_GRUPPO.png");

    // --- CARICAMENTO SUONI CLICK ---
    // this.load.audioSprite("sfx", "PERCORSO/SFX/sfx.json", "PERCORSO/SFX/sfx.mp3");
  }

  // =====================
  // CREATE
  // =====================

  // Metodo chiamato una sola volta all’avvio della scena
  create() {

    // --- CREAZIONE MUSICA ---
     this._music = this.sound.add("mmx3zerotheme", { loop: true, volume: 1 });

    // --- RIPRODUZIONE MUSICA ---
     this._music.play();

    // --- INSERIMENTO SFONDO IMMAGINE ---
    this.add.video(
      this.game.canvas.width / 2,
      this.game.canvas.height / 2,
      "introVideo"
    ).setOrigin(0.5).setScale(1.2).play(true);

    // --- LOGO MOTUS ---
    this.add.image(
      150,
      this.game.canvas.height / 2 + 300,
      "motus2"
    ).setOrigin(0.5).setScale(0.3);

    // --- LOGO SCUOLA ---
    this.add.image(
      this.game.canvas.width - 95,
      this.game.canvas.height / 2 + 310,
      "logoScuola"
    ).setOrigin(0.5).setScale(0.3);

    // Calcola il centro orizzontale dello schermo
    const centerX = this.game.canvas.width / 2;

    // Calcola il centro verticale dello schermo
    const centerY = this.game.canvas.height / 2 - 40;

    // --- LOGO COME IMMAGINE ---
    this._logoGioco = this.add.image(centerX, centerY - 100, "gameLogo").setOrigin(0.5).setScale(1.5);

    // --- BOTTONE PLAY ---
    this._playButton = this.add
      .sprite(
        centerX,                 // Posizione X
        centerY + 90,            // Posizione Y (più in basso)
        "btn-play-intro",        // Sprite key
        0                        // Frame iniziale
      )
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.75);

    // Evento click sul bottone PLAY
    this._playButton.on("pointerdown", () => {
      this.scene.start("GamePlay");
    });

    // Hover effect - cambia frame
    this._playButton.on("pointerover", () => {
      this._playButton.setFrame(1);
    });

    this._playButton.on("pointerout", () => {
      this._playButton.setFrame(0);
    });

    // --- BOTTONE IMPOSTAZIONI ---
    this._settingsButton = this.add
      .sprite(
        centerX,                 // Posizione X
        centerY + 190,            // Posizione Y (al posto del bottone INFO)
        "btn-settings-intro",    // Sprite key
        0                        // Frame iniziale
      )
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.75);

    // Evento click sul bottone IMPOSTAZIONI
    this._settingsButton.on("pointerdown", () => {
      this.scene.pause();
      this.scene.launch("Settings", { from: this.scene.key });
      this.scene.bringToTop("Settings");
    });

    // Hover effect - cambia frame
    this._settingsButton.on("pointerover", () => {
      this._settingsButton.setFrame(1);
    });

    this._settingsButton.on("pointerout", () => {
      this._settingsButton.setFrame(0);
    });

    // --- BOTTONE CREDITI ---
    this._creditsButton = this.add
      .sprite(
        centerX,                 // Posizione X
        centerY + 270,            // Posizione Y (al posto del bottone INFO)
        "btn-credits-intro",     // Sprite key
        0                        // Frame iniziale
      )
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.75)
      
    // Evento click sul bottone CREDITI
      this._creditsButton.on("pointerdown", () => {
        this.scene.pause();
        this.scene.launch("Credits", { from: this.scene.key });
        this.scene.bringToTop("Credits");
      }).on("pointerover", () => {
        this._creditsButton.setFrame(1);
      }).on("pointerout", () => {
        this._creditsButton.setFrame(0);
      });

    // --- BOTTONE AUDIO ---
    this._audioButton = this.add
      .sprite(
        this.game.canvas.width - 90, // Posizione X
        60,                            // Posizione Y
        "btn-audio-intro",             // Sprite key
        0                              // Frame iniziale (audio ON)
      )
      .setOrigin(0.5)
      .setInteractive()
      .setScale(0.7);

    // Evento click sul bottone audio
    this._audioButton.on("pointerover", () => {
      const currentSettings = gameSettingsManager.getSettings();
      const isMuted = currentSettings.masterVolume === 0;

      const newVolume = isMuted ? 0.5 : 0;
      
      this._audioButton.setFrame(isMuted ? 1 : 3);

    })
    .on("pointerdown", () => {
      // Ottieni le impostazioni attuali dal gestore globale
      const currentSettings = gameSettingsManager.getSettings();
      const isMuted = currentSettings.masterVolume === 0;
      
      // Alterna lo stato audio
      const newVolume = isMuted ? 0.5 : 0; // Toggle tra silenzioso e volume normale
      
      // Aggiorna il gestore globale
      gameSettingsManager.updateSetting("masterVolume", newVolume);
      
      // Cambia il frame dello sprite (0 = ON, 1 = OFF)
      this._audioButton.setFrame(isMuted ? 0 : 2);
      
      // Applica il volume a tutti i suoni in riproduzione
      if (Array.isArray((this.sound as any).sounds)) {
        (this.sound as any).sounds.forEach((sound: any) => {
          if (sound && sound.isPlaying) {
            sound.setVolume(newVolume);
          }
        });
      }
    })
    .on("pointerout", () => {
      const currentSettings = gameSettingsManager.getSettings();
      const isMuted = currentSettings.masterVolume === 0;

      const newVolume = isMuted ? 0.5 : 0;
      
      this._audioButton.setFrame(isMuted ? 0 : 2);
    });

    // --- TESTO INFO ---
    this._infoText = this.add.text(
      centerX,                     // Posizione X
      centerY,                     // Posizione Y
      "[Frecce] Movimento\n[Spazio] Attacco 1\n[F] Attacco 2\n[LMB] Interazione",
      {
        fontSize: "24px",           // Dimensione font
        color: "#ffffff",           // Colore
        align: "center"             // Allineamento
      }
    ).setOrigin(0.5);               // Centra il testo

    // --- BOTTONE CHIUDI ---
    this._closeButton = this.add.text(
      centerX,                     // Posizione X
      centerY + 140,               // Posizione Y
      "CHIUDI",                    // Testo
      {
        fontSize: "22px",           // Dimensione font
        color: "#ff5555"            // Colore rosso
      }
    ).setOrigin(0.5)                // Centra
     .setInteractive();             // Rende cliccabile

    // Evento click sul bottone chiudi
    this._closeButton.on("pointerdown", () => {


      // Nasconde il pannello info
      this._infoContainer.setVisible(false);
    });
    

    // --- CONTAINER INFO ---
    this._infoContainer = this.add.container(
      0,                            // Posizione X
      0,                            // Posizione Y
      [
        this._infoText,             // Testo
        this._closeButton           // Bottone chiudi
      ]
    );

    // Nasconde il container all'avvio
    this._infoContainer.setVisible(false);

    // Listener per le impostazioni globali
    this.settingsListener = (settings: GameSettings) => {
      // Le impostazioni sono cambiate globalmente
      console.log("Impostazioni cambiate in Intro:", settings);
    };
    gameSettingsManager.addListener(this.settingsListener);
  }

  // =====================
  // FUNZIONE CREA BOTTONE
  // =====================

  // Funzione che crea un bottone testuale riutilizzabile
  creaBottone(
    x: number,                     // Posizione X
    y: number,                     // Posizione Y
    testo: string,                 // Testo
    callback: () => void,           // Funzione di callback
    size: string = "28px"           // Dimensione font
  ): Phaser.GameObjects.Text {

    // Crea il testo
    const bottone = this.add.text(
      x,                            // X
      y,                            // Y
      testo,                        // Testo
      {
        fontSize: size,             // Dimensione font
        color: "#cccccc"            // Colore iniziale
      }
    )
    .setOrigin(0.5)                 // Centra
    .setInteractive();              // Rende cliccabile

    // Evento hover
    bottone.on("pointerover", () => {
      bottone.setColor("#ffffff");  // Cambia colore
    });

    // Evento uscita mouse
    bottone.on("pointerout", () => {
      bottone.setColor("#cccccc");  // Ripristina colore
    });

    // Evento click
    bottone.on("pointerdown", () => {

      // Suono click
      // this.sound.playAudioSprite("sfx", "click_mouse");

      // Esegue la callback
      callback();
    });

    // Ritorna il bottone creato
    return bottone;
  }

  // =====================
  // UPDATE
  // =====================

  // Metodo chiamato ad ogni frame
  update(time: number, delta: number): void {

    // Nessuna logica di aggiornamento
    // Schermata statica intenzionalmente
  }

  // =====================
  // SHUTDOWN
  // =====================

  // Metodo chiamato quando la scena viene fermata
  shutdown(): void {
    // Rimuovi il listener
    if (this.settingsListener) {
      gameSettingsManager.removeListener(this.settingsListener);
      this.settingsListener = undefined;
    }
  }
}

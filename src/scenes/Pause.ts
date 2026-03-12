import { GameObjects } from "phaser";
import { gameSettingsManager, GameSettings } from "../GameSettings";

// Traduzioni per la scena Pausa
const TRANSLATIONS = {
  IT: {
    title: "PAUSA",
    resume: "RIPRENDI",
    restart: "RESTART",
    settings: "IMPOSTAZIONI",
    language: "LINGUA",
  },
  EN: {
    title: "PAUSE",
    resume: "RESUME",
    restart: "RESTART",
    settings: "SETTINGS",
    language: "LANGUAGE",
  },
};

export default class Pause extends Phaser.Scene {

  private fromScene!: string;
  private _resumeButton: Phaser.GameObjects.Sprite;
  private _restartButton: Phaser.GameObjects.Sprite;
  private _settingButton: Phaser.GameObjects.Sprite;
  private _languageButton: Phaser.GameObjects.Rectangle;

  // Testi
  private titleText?: Phaser.GameObjects.Text;
  private resumeText?: Phaser.GameObjects.Text;
  private restartText?: Phaser.GameObjects.Text;
  private settingsText?: Phaser.GameObjects.Text;
  private languageText?: Phaser.GameObjects.Text;

  // Gestore per l'uniforme delle impostazioni
  private settingsListener?: (settings: GameSettings) => void;

  constructor() {
    super({
      key: "Pause",
    });
  }

  init(data: { from: string }) {
    this.fromScene = data.from;
  }

  preload() {
    // Preload delle risorse se necessario
  }

  create() {
    // Crea sfondo blur da scena precedente
    const rt = this.add.renderTexture(
      0,
      0,
      this.scale.width,
      this.scale.height
    ).setOrigin(0).setDepth(1000);

    if (this.scene.isActive(this.fromScene)) {
      rt.draw(this.scene.get(this.fromScene));
      rt.setPipeline('BlurPipeline');
    }

    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Overlay scuro
    this.add.rectangle(
      0,
      0,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.4
    ).setOrigin(0).setDepth(1010);

    // Titolo "PAUSA"
    this.titleText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 200,
      this.trans("title"),
      { 
        fontSize: '80px', 
        color: '#ffffff',
        fontFamily: 'medieval'
      }
    ).setOrigin(0.5).setDepth(1020);

    // Posizionamenti bottoni
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    // Aumentiamo lo spacing per evitare sovrapposizioni e usiamo scale simili all'Intro
    const buttonSpacing = 100;

    // Bottone RESUME (1)
    this._resumeButton = this.add.sprite(
      centerX,
      centerY - buttonSpacing,
      "btn-resume",
      0
    ).setOrigin(0.5, 0.5).setInteractive().setScale(0.75).setDepth(1020);

  

    // Bottone RESTART (2)
    this._restartButton = this.add.sprite(
      centerX,
      centerY,
      "btn-restart",
      0
    ).setOrigin(0.5, 0.5).setInteractive().setScale(0.75).setDepth(1020);

  

    // Bottone SETTINGS (3)
    this._settingButton = this.add.sprite(
      centerX,
      centerY + buttonSpacing,
      "btn-settings-intro",
      0
    ).setOrigin(0.5).setScale(0.75).setInteractive().setDepth(1020);


    // Event listeners per i bottoni
    this.setupButtonEvents();

    // Listener del manager globale per aggiornamenti impostazioni
    /* this.settingsListener = (settings: GameSettings) => {
      this.updateUILanguage();
    };
    gameSettingsManager.addListener(this.settingsListener); */
  }

  private setupButtonEvents(): void {
    // RESUME
    this._resumeButton.on('pointerdown', () => {
      this.resumeGame();
    });
    // Usa cambio di frame come in Intro quando disponibile
    this._resumeButton.on('pointerover', () => {
      (this._resumeButton as any).setFrame?.(1);
    });
    this._resumeButton.on('pointerout', () => {
      (this._resumeButton as any).setFrame?.(0);
    });

    // RESTART
    this._restartButton.on('pointerdown', () => {
      this.restartGame();
    });
    // Cambia frame in hover per coerenza con Intro
    this._restartButton.on('pointerover', () => {
      (this._restartButton as any).setFrame?.(1);
    });
    this._restartButton.on('pointerout', () => {
      (this._restartButton as any).setFrame?.(0);
    });

    // SETTINGS
    this._settingButton.on('pointerdown', () => {
      this.openSettings();
    });
    this._settingButton.on('pointerover', () => {
      (this._settingButton as any).setFrame?.(1);
    });
    this._settingButton.on('pointerout', () => {
      (this._settingButton as any).setFrame?.(0);
    });

  }

  private resumeGame(): void {
    this.cleanup();
    
    // Resetta il flag isPaused nel GamePlay 
    const gamePlayScene = this.scene.get(this.fromScene);
    if (gamePlayScene && (gamePlayScene as any).isPaused !== undefined) {
      (gamePlayScene as any).isPaused = false;
    }
    
    this.scene.stop();
    this.scene.resume(this.fromScene);
  }

private restartGame(): void {
  this.cleanup();

  // Stop della scena Pause e della scena di gioco; lascia che GamePlay si occupi
  // di (ri)lanciare l'Hud nel suo `create` per evitare sovrapposizioni.
  this.scene.stop(); // stop Pause
  this.scene.stop(this.fromScene);

    this.scene.start(this.fromScene);
}

  private openSettings(): void {
    this.scene.pause();
    this.scene.start('Settings', { from: 'Pause' });
    this.scene.bringToTop('Settings');
  }

  private toggleLanguage(): void {
    const currentSettings = gameSettingsManager.getSettings();
    const newLanguage = currentSettings.language === "IT" ? "EN" : "IT";
    gameSettingsManager.updateSetting("language", newLanguage);
  }

/*   private updateUILanguage(): void {
    if (this.titleText) {
      this.titleText.setText(this.trans("title"));
    }
    if (this.resumeText) {
      this.resumeText.setText(this.trans("resume"));
    }
    if (this.restartText) {
      this.restartText.setText(this.trans("restart"));
    }
    if (this.settingsText) {
      this.settingsText.setText(this.trans("settings"));
    }
    if (this.languageText) {
      this.languageText.setText(this.getCurrentLanguageText());
    }
  } */

  private getCurrentLanguageText(): string {
    const settings = gameSettingsManager.getSettings();
    return settings.language === "IT" ? "ITA" : "ENG";
  }

  private trans(key: keyof typeof TRANSLATIONS["IT"]): string {
    const settings = gameSettingsManager.getSettings();
    return TRANSLATIONS[settings.language][key];
  }

  private cleanup(): void {
    // Rimuovi il listener
    if (this.settingsListener) {
      gameSettingsManager.removeListener(this.settingsListener);
      this.settingsListener = undefined;
    }
  }

  shutdown(): void {
    this.cleanup();
  }

  update(time: number, delta: number): void {
    // Update logic if needed
  }
}


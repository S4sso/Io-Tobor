// Importazione delle dipendenze necessarie
import { GameData } from "../GameData";
import { gameSettingsManager, GameSettings } from "../GameSettings";

// Interfaccia per i dati passati alla scena Settings
interface SettingsData {
  from: string; // Nome della scena da cui si è aperta la scena Settings
}

// Tipo alias per le impostazioni (equivalente a GameSettings)
type Settings = GameSettings;

// Dizionario delle traduzioni per i testi dell'interfaccia
// Supporta italiano (IT) e inglese (EN)
const TRANSLATIONS = {
  IT: {
    title: "IMPOSTAZIONI",
    audioSection: "AUDIO",
    masterVolume: "Volume Generale",
    musicVolume: "Musica",
    sfxVolume: "Effetti Sonori",
    gameplaySection: "GAMEPLAY",
    language: "Lingua",
    difficulty: "Difficolta'",
    save: "SALVA",
    apply: "APPLICA",
    cancel: "ANNULLA",
    back: "INDIETRO",
    easy: "FACILE",
    normal: "NORMALE",
    hard: "DIFFICILE",
    extreme: "ESTREMO",
    controlsSection: "CONTROLLI",
    moveUp: "Su",
    moveDown: "Giù",
    moveLeft: "Sinistra",
    moveRight: "Destra",
    interact: "Interagisci",
    attack: "Attacca",
    defend: "Difendi",
    changeKey: "MODIFICA",
    enterNewKey: "Inserisci nuovo tasto...",
    settingsSaved: "Impostazioni salvate!",
    settingsApplied: "Impostazioni applicate!",
    settingsReset: "Impostazioni ripristinate!",
  },
  EN: {
    title: "SETTINGS",
    audioSection: "AUDIO",
    masterVolume: "Master Volume",
    musicVolume: "Music",
    sfxVolume: "SFX",
    gameplaySection: "GAMEPLAY",
    language: "Language",
    difficulty: "Difficulty",
    save: "SAVE",
    apply: "APPLY",
    cancel: "CANCEL",
    back: "BACK",
    easy: "EASY",
    normal: "NORMAL",
    hard: "HARD",
    extreme: "EXTREME",
    controlsSection: "CONTROLS",
    moveUp: "Up",
    moveDown: "Down",
    moveLeft: "Left",
    moveRight: "Right",
    interact: "Interact",
    attack: "Attack",
    defend: "Defend",
    changeKey: "CHANGE",
    enterNewKey: "Enter new key...",
    settingsSaved: "Settings saved!",
    settingsApplied: "Settings applied!",
    settingsReset: "Settings reset!",
  },
};

/**
 * Classe principale della scena delle impostazioni
 * Gestisce tutte le opzioni configurabili del gioco: audio, gameplay, controlli
 */
export default class SettingsScene extends Phaser.Scene {
  // Mappatura dei frame dello spritesheet per i bottoni delle impostazioni
  // Ogni bottone ha 3 stati: normale, hover, premuto
  private buttonFrames = {
    save: 0,
    saveHover: 1,
    saveDown: 2,
    apply: 3,
    applyHover: 4,
    applyDown: 5,
    cancel: 6,
    cancelHover: 7,
    cancelDown: 8,
    back: 9,
    backHover: 10,
    backDown: 11,
    sliderBg: 12,
    sliderHandle: 13,
  } as any;
  // Nome della scena da cui si è aperta questa scena (per tornare indietro)
  private fromScene!: string;
  
  // Impostazioni correnti modificate dall'utente (non ancora salvate)
  private currentSettings: Settings = gameSettingsManager.getSettings();

  // Copia delle impostazioni originali (per il pulsante Annulla)
  private originalSettings: Settings = { ...this.currentSettings };

  // ===== ELEMENTI DELL'INTERFACCIA UTENTE =====
  
  // Mappa che contiene i riferimenti alle frecce dei controlli volume (sinistra/destra)
  private sliders: Map<string, any> = new Map();
  
  // Mappa che contiene i testi che mostrano i valori percentuali dei volumi
  private sliderValues: Map<string, Phaser.GameObjects.Text> = new Map();
  
  // Array dei bottoni per la selezione della lingua (IT/EN)
  private languageButtons: Phaser.GameObjects.Text[] = [];
  
  // Array dei bottoni per la selezione della difficoltà (NORMAL/HARD/EXTREME)
  private difficultyButtons: Phaser.GameObjects.Text[] = [];
  
  // Testo che mostra la difficoltà attuale
  private difficultyDisplayText?: Phaser.GameObjects.Text;
  
  // Mappa che contiene i bottoni per modificare i controlli (tasti di movimento, attacco, ecc.)
  private controlButtons: Map<string, Phaser.GameObjects.Text> = new Map();
  
  // Altezza totale del container delle impostazioni (per lo scroll)
  private containerHeight: number = 0;
  
  // Container principale che contiene tutti gli elementi delle impostazioni
  private settingsContainer?: Phaser.GameObjects.Container;
  
  // Testo che appare quando si sta modificando un tasto ("Inserisci nuovo tasto...")
  private keyChangePrompt?: Phaser.GameObjects.Text;
  
  // Flag che indica se si sta aspettando l'input di un nuovo tasto
  private isWaitingForKey: boolean = false;
  
  // Nome del controllo di cui si sta modificando il tasto (es. "moveUp", "attackButton")
  private currentKeyBeingChanged?: string;
  //Riferimenti al bottone INDIETRO
  private backBtn: Phaser.GameObjects.Sprite;
  private backText: Phaser.GameObjects.Text;
  // Riferimento al titolo per aggiornarlo al cambio lingua
  private titleText?: Phaser.GameObjects.Text;

  /**
   * Costruttore della scena Settings
   * Inizializza la scena con la chiave "Settings"
   */
  constructor() {
    super({
      key: "Settings",
    });
  }

  /**
   * Metodo init: chiamato prima di create()
   * Inizializza i dati della scena e carica le impostazioni
   * @param data - Dati passati alla scena (contiene la scena di provenienza)
   */
  init(data: SettingsData) {
    // Salva la scena da cui si è aperta questa scena (per tornare indietro)
    this.fromScene = data?.from || "GamePlay";
    
    // Carica le impostazioni correnti dal manager globale
    this.currentSettings = gameSettingsManager.getSettings();
    
    // Salva una copia delle impostazioni originali (per il pulsante Annulla)
    this.originalSettings = { ...this.currentSettings };
  }

  /**
   * Metodo create: chiamato quando la scena viene creata
   * Crea tutti gli elementi grafici dell'interfaccia delle impostazioni
   */
  create() {
    // ===== SFONDO =====
    // Aggiunge l'immagine di sfondo delle impostazioni
    this.add.image(0, 0, "BackgroundSettings").setOrigin(0).setDisplaySize(this.scale.width, this.scale.height);
    
    // Crea una texture di rendering per mostrare la scena precedente con effetto blur
    const rt = this.add.renderTexture(0, 0, this.scale.width, this.scale.height).setOrigin(0);
    if (this.scene.isActive(this.fromScene)) {
      // Disegna la scena precedente sulla texture
      rt.draw(this.scene.get(this.fromScene));
      // Applica un effetto blur per creare profondità
      rt.setPipeline('BlurPipeline');
    }

    // Aggiunge un overlay scuro semi-trasparente per migliorare la leggibilità
    this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.6).setOrigin(0);

    // ===== TITOLO =====
    // Aggiunge il titolo "IMPOSTAZIONI" o "SETTINGS" in base alla lingua
    this.titleText = this.add
      .text(this.scale.width / 2, 40, this.trans("title"), {
        fontSize: "80px",
        color: "#ffffff",
        fontFamily: "medieval",
      })
      .setOrigin(0.5);

    // ===== CONTAINER DELLE IMPOSTAZIONI =====
    // Crea il container principale che contiene tutte le opzioni configurabili
    this.settingsContainer = this.createSettingsContainer();

    // ===== BOTTONI INFERIORI =====
    // Crea i bottoni in basso: Salva, Applica, Annulla, Indietro
    this.createBottomButtons();

    // ===== CONTROLLI TASTIERA =====
    // Permette di chiudere le impostazioni premendo ESC (equivalente a Reset)
    this.input.keyboard.once("keydown-ESC", () => this.resetAll());
  }

  /**
   * Crea il container principale che contiene tutte le impostazioni
   * Organizza le impostazioni in tre colonne: sinistra (Audio+Lingua), centro (Difficoltà), destra (Controlli)
   * @returns Il container creato con tutti gli elementi delle impostazioni
   */
  private createSettingsContainer(): Phaser.GameObjects.Container {
    // Posizione Y iniziale per iniziare a disporre gli elementi
    const startY = 130;
    const padding = 40;

    // Crea un container centrato orizzontalmente
    // Le coordinate dei figli sono relative al centro del container
    const container = this.add.container(this.scale.width / 2, 0);

    // ===== POSIZIONAMENTO COLONNE =====
    // Colonna sinistra: contiene Audio e Lingua
    const leftStartX = -this.scale.width / 2 + 40; // Posizione globale x ~= 40
    
    // Colonna centro: contiene Difficoltà
    const centerStartX = -80; // Leggermente a sinistra del centro per equilibrio
    
    // Colonna destra: contiene i Controlli
    const rightStartX = this.scale.width / 2 - 440; // Posizione globale x ~= width - 440

    // Usiamo lo stesso Y iniziale per allineare le colonne verticalmente
    let leftY = startY;  // Cursore Y per la colonna sinistra
    let centerY = startY;  // Cursore Y per la colonna centro
    let rightY = startY;  // Cursore Y per la colonna destra

    // ===== SEZIONE AUDIO (colonna sinistra) =====
    // Aggiunge il titolo della sezione Audio
    leftY = this.addSectionTitle(container, this.trans("audioSection"), leftY, leftStartX);
    leftY += 20; // Spazio tra titolo e controlli

    // Controllo Volume Generale (Master Volume)
    leftY = this.addVolumeSlider(
      container,
      "masterVolume",
      this.trans("masterVolume"),
      this.currentSettings.masterVolume,
      leftY,
      leftStartX
    );

    // Controllo Volume Musica
    leftY = this.addVolumeSlider(
      container,
      "musicVolume",
      this.trans("musicVolume"),
      this.currentSettings.musicVolume,
      leftY,
      leftStartX
    );

    // Controllo Volume Effetti Sonori (SFX)
    leftY = this.addVolumeSlider(
      container,
      "sfxVolume",
      this.trans("sfxVolume"),
      this.currentSettings.sfxVolume,
      leftY,
      leftStartX
    );

    leftY += 15; // Spazio extra dopo la sezione audio

    // ===== SEZIONE LINGUA (colonna sinistra, sotto audio) =====
    leftY += 15; // Spazio tra sezioni
    // Aggiunge il titolo della sezione Gameplay (per Lingua)
    leftY = this.addSectionTitle(container, this.trans("gameplaySection"), leftY, leftStartX);
    leftY += 15; // Spazio tra titolo e controlli

    // Selettore della lingua (Italiano/Inglese)
    leftY = this.addLanguageSelector(container, leftY, leftStartX);

    // ===== SEZIONE DIFFICOLTÀ (colonna centro) =====
    // Aggiunge il titolo della sezione Difficoltà
    centerY = this.addSectionTitle(container, this.trans("difficulty"), centerY, centerStartX);
    centerY += 15; // Spazio tra titolo e controlli

    // Selettore della difficoltà (Normale/Difficile/Estremo)
    centerY = this.addDifficultySelector(container, centerY, centerStartX);

    // ===== SEZIONE CONTROLLI (colonna destra) =====
    // Aggiunge il titolo della sezione Controlli
    rightY = this.addSectionTitle(container, this.trans("controlsSection"), rightY, rightStartX);
    rightY += 15; // Spazio tra titolo e controlli

    // Selettore dei controlli (tasti di movimento, attacco, difesa, interazione)
    rightY = this.addControlsSelector(container, rightY, rightStartX);

    // Calcola l'altezza totale del container (la maggiore tra le tre colonne)
    this.containerHeight = Math.max(leftY, centerY, rightY);

    return container;
  }

  /**
   * Aggiunge un titolo di sezione (es. "AUDIO", "GAMEPLAY", "CONTROLLI")
   * @param container - Container a cui aggiungere il titolo
   * @param title - Testo del titolo da visualizzare
   * @param y - Posizione Y iniziale
   * @param startX - Posizione X (opzionale, default a sinistra)
   * @returns Nuova posizione Y dopo aver aggiunto il titolo
   */
  private addSectionTitle(
    container: Phaser.GameObjects.Container,
    title: string,
    y: number,
    startX?: number
  ): number {
    // Calcola la posizione X: se non specificata, usa la posizione di default a sinistra
    const sx = typeof startX !== "undefined" ? startX : -this.scale.width / 2 + 40;
    
    // Crea il testo del titolo con stile arancione e font pixel
    container.add(
      this.add
        .text(sx, y, title, {
          fontSize: "40px",
          color: "#ffaa00", // Colore arancione per i titoli
          fontFamily: "medieval", // Font pixel art
        })
        .setOrigin(0, 0) // Allineamento in alto a sinistra
    );

    // Restituisce la nuova posizione Y (titolo + spazio)
    return y + 45;
  }

  /**
   * Aggiunge un controllo slider per il volume (con frecce sinistra/destra)
   * @param container - Container a cui aggiungere il controllo
   * @param key - Chiave dell'impostazione (es. "masterVolume", "musicVolume", "sfxVolume")
   * @param label - Etichetta da mostrare (es. "Volume Generale")
   * @param value - Valore iniziale del volume (0-100)
   * @param y - Posizione Y iniziale
   * @param startXParam - Posizione X (opzionale)
   * @returns Nuova posizione Y dopo aver aggiunto il controllo
   */
  private addVolumeSlider(
    container: Phaser.GameObjects.Container,
    key: string,
    label: string,
    value: number,
    y: number,
    startXParam?: number
  ): number {
    // Calcola la posizione X iniziale
    const startX = typeof startXParam !== "undefined" ? startXParam : -this.scale.width / 2 + 40;

    // ===== ETICHETTA =====
    // Aggiunge il testo dell'etichetta (es. "Volume Generale", "Musica", "Effetti Sonori")
    container.add(
      this.add
        .text(startX, y, label, {
          fontSize: "28px",
          color: "#ffffff",
          fontFamily: "medieval",
        })
        .setOrigin(0, 0) // Allineamento in alto a sinistra
    );

    // ===== FRECCIA SINISTRA (diminuisce il volume) =====
    // Usa l'immagine per la freccia sinistra
    const leftArrow = this.add
      .image(startX + 320, y + 32, "arrowleft")
      .setOrigin(0.5, 0.5) // Allineamento al centro
      .setInteractive() // Rende il bottone cliccabile
      .setScale(0.15); // Scala ridotta per adattarsi all'interfaccia
    container.add(leftArrow);

    // ===== TESTO DEL VALORE =====
    // Mostra il valore percentuale del volume (es. "75%")
    const valueText = this.add
      .text(startX + 350, y + 18, `${Math.round(value)}%`, {
        fontSize: "28px",
        color: "#ffaa00", // Colore arancione per evidenziare il valore
        fontFamily: "medieval",
      })
      .setOrigin(0, 0);

    container.add(valueText);

    // ===== FRECCIA DESTRA (aumenta il volume) =====
    // Usa l'immagine per la freccia destra
    const rightArrow = this.add
      .image(startX + 420, y + 32, "arrowright")
      .setOrigin(0.5, 0.5) // Allineamento al centro
      .setInteractive() // Rende il bottone cliccabile
      .setScale(0.15); // Scala ridotta per adattarsi all'interfaccia
    container.add(rightArrow);

    // ===== EVENTI DELLE FRECCE =====
    const step = 5; // Incremento/decremento del volume per ogni click
    
    // Evento per la freccia sinistra (diminuisce il volume)
    leftArrow.on("pointerdown", () => {
      // Calcola il nuovo valore diminuendo di "step" e limitandolo tra 0 e 100
      const newValue = Phaser.Math.Clamp(Math.round(((this.currentSettings as any)[key] as number) - step), 0, 100);
      
      // Aggiorna le impostazioni locali
      (this.currentSettings as any)[key] = newValue;
      
      // Aggiorna immediatamente nel manager globale (propaga alle altre scene)
      gameSettingsManager.updateSetting(key as keyof GameSettings, newValue);
      
      // Aggiorna il testo visualizzato
      valueText.setText(`${newValue}%`);
      
      // Applica il nuovo volume ai suoni in riproduzione
      this.applyGameSettings();
      
      // Effetto visivo: scala leggermente il bottone quando viene premuto
      if (this.textures.exists("arrowleft")) {
        leftArrow.setScale(0.2); // Scala più piccola quando premuto
        this.time.delayedCall(100, () => leftArrow.setScale(0.15)); // Ritorna alla scala normale dopo 100ms
      } else {
        leftArrow.setScale(0.95);
        this.time.delayedCall(100, () => leftArrow.setScale(1));
      }
    });

    // Evento per la freccia destra (aumenta il volume)
    rightArrow.on("pointerdown", () => {
      // Calcola il nuovo valore aumentando di "step" e limitandolo tra 0 e 100
      const newValue = Phaser.Math.Clamp(Math.round(((this.currentSettings as any)[key] as number) + step), 0, 100);
      
      // Aggiorna le impostazioni locali
      (this.currentSettings as any)[key] = newValue;
      
      // Aggiorna immediatamente nel manager globale (propaga alle altre scene)
      gameSettingsManager.updateSetting(key as keyof GameSettings, newValue);
      
      // Aggiorna il testo visualizzato
      valueText.setText(`${newValue}%`);
      
      // Applica il nuovo volume ai suoni in riproduzione
      this.applyGameSettings();
      
      // Effetto visivo: scala leggermente il bottone quando viene premuto
      if (this.textures.exists("arrowright")) {
        rightArrow.setScale(0.2); // Scala più piccola quando premuto
        this.time.delayedCall(100, () => rightArrow.setScale(0.15)); // Ritorna alla scala normale dopo 100ms
      } else {
        rightArrow.setScale(0.95);
        this.time.delayedCall(100, () => rightArrow.setScale(1));
      }
    });

    // ===== SALVATAGGIO RIFERIMENTI =====
    // Salva i riferimenti alle frecce e al testo del valore per poterli aggiornare in seguito
    this.sliders.set(key, { left: leftArrow, right: rightArrow });
    this.sliderValues.set(key, valueText);

    // Restituisce la nuova posizione Y (posizione corrente + altezza del controllo)
    return y + 70;
  }


  /**
   * Aggiunge il selettore della lingua (Italiano/Inglese)
   * @param container - Container a cui aggiungere il selettore
   * @param y - Posizione Y iniziale
   * @param startXParam - Posizione X (opzionale)
   * @returns Nuova posizione Y dopo aver aggiunto il selettore
   */
  private addLanguageSelector(
    container: Phaser.GameObjects.Container,
    y: number,
    startXParam?: number
  ): number {
    // Calcola la posizione X iniziale
    const startX = typeof startXParam !== "undefined" ? startXParam : -this.scale.width / 2 + 40;

    // ===== ETICHETTA =====
    // Aggiunge il testo "Lingua" o "Language" in base alla lingua corrente
    container.add(
      this.add
        .text(startX, y, this.trans("language"), {
          fontSize: "28px",
          color: "#ffffff",
          fontFamily: "medieval",
        })
        .setOrigin(0, 0) // Allineamento in alto a sinistra
    );

    // ===== BOTTONE ITALIANO =====
    // Crea il bottone per selezionare l'italiano
    const itButton = this.add
      .text(startX, y + 40, "ITALIANO", {
        fontSize: "24px",
        // Colore bianco se selezionato, grigio se non selezionato
        color: this.currentSettings.language === "IT" ? "#ffffff" : "#666666",
        // Sfondo arancione se selezionato, grigio scuro se non selezionato
        backgroundColor: this.currentSettings.language === "IT" ? "#ffaa00" : "#333333",
        padding: { x: 18, y: 12 },
        fontFamily: "medieval",
      })
      .setOrigin(0, 0) // Allineamento in alto a sinistra
      .setInteractive(); // Rende il bottone cliccabile

    container.add(itButton);

    // ===== BOTTONE INGLESE =====
    // Crea il bottone per selezionare l'inglese
    const enButton = this.add
      .text(startX + 220, y + 40, "ENGLISH", {
        fontSize: "24px",
        // Colore bianco se selezionato, grigio se non selezionato
        color: this.currentSettings.language === "EN" ? "#ffffff" : "#666666",
        // Sfondo arancione se selezionato, grigio scuro se non selezionato
        backgroundColor: this.currentSettings.language === "EN" ? "#ffaa00" : "#333333",
        padding: { x: 18, y: 12 },
        fontFamily: "medieval",
      })
      .setOrigin(0, 0) // Allineamento in alto a sinistra
      .setInteractive(); // Rende il bottone cliccabile

    container.add(enButton);

    // ===== EVENTI DEI BOTTONI =====
    // Evento per il bottone Italiano
    itButton.on("pointerdown", () => {
      // Imposta la lingua a Italiano
      this.currentSettings.language = "IT";
      
      // Aggiorna immediatamente nel manager globale (propaga alle altre scene)
      gameSettingsManager.updateSetting("language", "IT");
      
      // Aggiorna lo stile visivo dei bottoni
      this.updateLanguageButtons(itButton, enButton);
      
      // Ricostruisce il container per aggiornare tutti i testi tradotti
      this.rebuildSettingsContainer();
    });

    // Evento per il bottone Inglese
    enButton.on("pointerdown", () => {
      // Imposta la lingua a Inglese
      this.currentSettings.language = "EN";
      
      // Aggiorna immediatamente nel manager globale (propaga alle altre scene)
      gameSettingsManager.updateSetting("language", "EN");
      
      // Aggiorna lo stile visivo dei bottoni
      this.updateLanguageButtons(itButton, enButton);
      
      // Ricostruisce il container per aggiornare tutti i testi tradotti
      this.rebuildSettingsContainer();
    });

    // Salva i riferimenti ai bottoni per poterli aggiornare in seguito
    this.languageButtons = [itButton, enButton];

    // Restituisce la nuova posizione Y (posizione corrente + altezza del controllo)
    return y + 100;
  }

  /**
   * Ricostruisce completamente il container delle impostazioni
   * Viene chiamato quando cambia la lingua per aggiornare tutti i testi tradotti
   */
  private rebuildSettingsContainer() {
    // ===== DISTRUZIONE DEL CONTAINER PRECEDENTE =====
    try {
      if (this.settingsContainer) {
        // Distrugge il container e tutti i suoi figli
        this.settingsContainer.destroy(true);
      }
    } catch (e) {
      // Ignora eventuali errori durante la distruzione
    }

    // ===== PULIZIA STATO MODIFICA TASTI =====
    // Rimuove il prompt che appare quando si modifica un tasto
    if (this.keyChangePrompt) {
      this.keyChangePrompt.destroy();
      this.keyChangePrompt = undefined;
    }
    
    // Resetta lo stato di attesa per l'input di un nuovo tasto
    this.isWaitingForKey = false;
    this.currentKeyBeingChanged = undefined;

    // ===== PULIZIA RIFERIMENTI BOTTONI =====
    // Svuota gli array dei bottoni perché i riferimenti sono stati distrutti
    // Questi verranno ricreati quando si ricostruisce il container
    this.difficultyButtons = [];
    this.languageButtons = [];
    this.controlButtons.clear();

    // ===== SINCRONIZZAZIONE IMPOSTAZIONI =====
    // Ricarica le impostazioni dal manager globale per assicurarsi che siano sincronizzate
    // Questo è importante perché altre scene potrebbero aver modificato le impostazioni
    this.currentSettings = gameSettingsManager.getSettings();

    // ===== RICREAZIONE CONTAINER =====
    // Ricrea il container con tutti gli elementi aggiornati
    this.settingsContainer = this.createSettingsContainer();

    // ===== AGGIORNAMENTO TITOLO =====
    // Aggiorna il titolo della scena in base alla lingua selezionata
    if (this.titleText) {
      this.titleText.setText(this.trans("title"));
    }
  }

  /**
   * Aggiorna lo stile visivo dei bottoni della lingua per mostrare quale è selezionata
   * @param itButton - Bottone per l'italiano
   * @param enButton - Bottone per l'inglese
   */
  private updateLanguageButtons(
    itButton: Phaser.GameObjects.Text,
    enButton: Phaser.GameObjects.Text
  ) {
    // Se la lingua corrente è Italiano
    if (this.currentSettings.language === "IT") {
      // Evidenzia il bottone Italiano (bianco su arancione)
      itButton.setStyle({
        color: "#ffffff",
        backgroundColor: "#ffaa00",
      });
      // Scurisce il bottone Inglese (grigio su grigio scuro)
      enButton.setStyle({
        color: "#666666",
        backgroundColor: "#333333",
      });
    } else {
      // Se la lingua corrente è Inglese
      // Scurisce il bottone Italiano (grigio su grigio scuro)
      itButton.setStyle({
        color: "#666666",
        backgroundColor: "#333333",
      });
      // Evidenzia il bottone Inglese (bianco su arancione)
      enButton.setStyle({
        color: "#ffffff",
        backgroundColor: "#ffaa00",
      });
    }
  }

  private addDifficultySelector(
    container: Phaser.GameObjects.Container,
    y: number,
    startXParam?: number
  ): number {
    const startX = typeof startXParam !== "undefined" ? startXParam : -this.scale.width / 2 + 40;

    // NOTA: Label "Difficoltà" rimosso - i bottoni sono self-explanatory

    const difficulties: Array<"NORMAL" | "HARD" | "EXTREME"> = ["NORMAL", "HARD", "EXTREME"];
    const difficultyLabels = [this.trans("normal"), this.trans("hard"), this.trans("extreme")];
    const colors = ["#ffaa00", "#ff0000", "#ff00ff"];

    let currentY = y; // Usa Y invece di X per posizionare verticalmente

    difficulties.forEach((diff, index) => {
      let button: any;
      
      // Associa il nome dello sprite per ogni difficoltà
      const spriteNames: { [key: string]: string } = {
        "NORMAL": "btn-difficulty-normal",
        "HARD": "btn-difficulty-hard",
        "EXTREME": "btn-difficulty-extreme"
      };
      const spriteName = spriteNames[diff];
      
      // Crea uno sprite con frame per l'effetto hover (come INDIETRO, SALVA, ecc.)
      if (true) {
        
        console.log(`Aggiungo bottone ${diff} (${spriteName})`);
        
        button = this.add
          .sprite(startX + 60, currentY + 55, spriteName, 0)
          .setOrigin(0.5)
          .setInteractive()
          .setDepth(5)
          .setScale(0.7);
        
        container.add(button);
        
        button.on("pointerdown", () => {
          this.currentSettings.difficulty = diff;
          gameSettingsManager.updateSetting("difficulty", diff);
          this.updateDifficultyButtons(difficulties, colors);
          this.updateDifficultyDisplay();
        });
        
        button.on("pointerover", () => {
          button.setAlpha(1);
          button.setScale(0.75);
          button.setFrame(1);
        });
        
        button.on("pointerout", () => {
          button.setAlpha(1);
          button.setScale(0.7);
          button.setFrame(0);
        });
      } else if (this.textures.exists("settings_buttons")) {
        button = this.add
          .sprite(startX + 60, currentY + 55, "settings_buttons", this.buttonFrames.cancel)
          .setOrigin(0.5)
          .setInteractive()
          .setDepth(5);
        button.setDisplaySize(120, 40);
        container.add(button);
        
        button.on("pointerdown", () => {
          this.currentSettings.difficulty = diff;
          gameSettingsManager.updateSetting("difficulty", diff);
          this.updateDifficultyButtons(difficulties, colors);
          this.updateDifficultyDisplay();
        });
        
        button.on("pointerover", () => button.setAlpha(0.8));
        button.on("pointerout", () => button.setAlpha(1));
      } else {
        // Fallback: bottone di testo
        button = this.add
          .text(startX, currentY + 35, difficultyLabels[index], {
            fontSize: "22px",
            color: this.currentSettings.difficulty === diff ? "#ffffff" : "#666666",
            backgroundColor: this.currentSettings.difficulty === diff ? colors[index] : "#333333",
            padding: { x: 14, y: 10 },
            fontFamily: "medieval",
          })
          .setOrigin(0, 0)
          .setInteractive();

        container.add(button);

        button.on("pointerdown", () => {
          this.currentSettings.difficulty = diff;
          gameSettingsManager.updateSetting("difficulty", diff);
          this.updateDifficultyButtons(difficulties, colors);
          this.updateDifficultyDisplay();
        });
        
        button.on("pointerover", () => button.setAlpha(0.8));
        button.on("pointerout", () => button.setAlpha(1));
      }

      this.difficultyButtons.push(button);
      currentY += 110; // Aumentato per posizionamento verticale (uno sotto l'altro)
    });

    // Aggiungi testo che mostra la difficoltà attuale
    const currentDifficultyText = this.add
      .text(startX + 60, currentY + 20, `${this.trans("difficulty")}: ${this.trans(
        this.currentSettings.difficulty === "HARD" ? "hard" : 
        this.currentSettings.difficulty === "EXTREME" ? "extreme" : 
        "normal"
      ).toUpperCase()}`, {
        fontSize: "24px",
        color: "#ffffff",
        fontFamily: "medieval",
      })
      .setOrigin(0.5, 0);

    container.add(currentDifficultyText);
    
    // Salva il riferimento al testo della difficoltà attuale per aggiornarlo
    this.difficultyDisplayText = currentDifficultyText;

    return y + 250;
  }

  private addControlsSelector(
    container: Phaser.GameObjects.Container,
    y: number,
    startXParam?: number
  ): number {
    const startX = typeof startXParam !== "undefined" ? startXParam : -this.scale.width / 2 + 40;

    const controls = [
      { key: "moveUp", label: this.trans("moveUp") },
      { key: "moveDown", label: this.trans("moveDown") },
      { key: "moveRight", label: this.trans("moveRight") },
      { key: "moveLeft", label: this.trans("moveLeft") },
      { key: "interactKey", label: this.trans("interact") },
      { key: "attackButton", label: this.trans("attack") },
      { key: "defendButton", label: this.trans("defend") },
    ];

    let offsetY = y;
    controls.forEach((c, idx) => {
      const label = this.add
        .text(startX, offsetY, c.label, {
          fontSize: "28px",
          color: "#ffffff",
          fontFamily: "medieval",
        })
        .setOrigin(0, 0);

      container.add(label);

      const btn = this.add
        .text(startX + 240, offsetY, String((this.currentSettings as any)[c.key]).toUpperCase(), {
          fontSize: "24px",
          color: "#ffffff",
          backgroundColor: "#333333",
          padding: { x: 14, y: 10 },
          fontFamily: "medieval",
        })
        .setOrigin(0, 0)
        .setInteractive();

      container.add(btn);
      this.controlButtons.set(c.key, btn);

      btn.on("pointerdown", () => {
        if (this.isWaitingForKey) {
          return; // Ignora se stiamo già aspettando un tasto
        }

        // Disabilita temporaneamente l'interattività del bottone
        btn.disableInteractive();
        
        this.isWaitingForKey = true;
        this.currentKeyBeingChanged = c.key;
        
        // Mostra il messaggio "Inserisci nuovo tasto..."
        const originalText = btn.text;
        btn.setText(this.trans("enterNewKey"));
        btn.setStyle({ color: "#ffaa00" });

        // Crea o aggiorna il prompt visibile
        if (this.keyChangePrompt) {
          this.keyChangePrompt.destroy();
        }
        const promptText = this.trans("enterNewKey") + "\n" + c.label;
        this.keyChangePrompt = this.add
          .text(this.scale.width / 2, this.scale.height / 2, promptText, {
            fontSize: "32px",
            color: "#ffaa00",
            fontFamily: "medieval",
            align: "center",
            backgroundColor: "#000000",
            padding: { x: 24, y: 18 },
          })
          .setOrigin(0.5)
          .setDepth(1000);

        // Variabili per i listener (dichiarate prima per poter essere rimosse)
        let kbHandler: ((ev: KeyboardEvent) => void) | null = null;
        let mouseDownHandler: ((pointer: Phaser.Input.Pointer) => void) | null = null;

        // Funzione per completare la modifica del tasto
        const finishKeyChange = (newValue: string) => {
          (this.currentSettings as any)[c.key] = newValue;
          // Aggiorna immediatamente nel manager globale
          gameSettingsManager.updateSetting(c.key as keyof GameSettings, newValue);
          btn.setText(newValue.toUpperCase());
          btn.setStyle({ color: "#ffffff" });
          
          // Rimuovi listener e prompt
          if (kbHandler) {
            window.removeEventListener("keydown", kbHandler);
            kbHandler = null;
          }
          if (mouseDownHandler) {
            this.input.off("pointerdown", mouseDownHandler);
            mouseDownHandler = null;
          }
          if (this.keyChangePrompt) {
            this.keyChangePrompt.destroy();
            this.keyChangePrompt = undefined;
          }
          
          // Riabilita l'interattività del bottone
          btn.setInteractive();
          
          this.isWaitingForKey = false;
          this.currentKeyBeingChanged = undefined;
        };

        // Listen for keyboard input
        kbHandler = (ev: KeyboardEvent) => {
          // Ignora ESC per annullare (opzionale)
          if (ev.code === "Escape") {
            finishKeyChange(originalText);
            return;
          }
          
          ev.preventDefault();
          ev.stopPropagation();
          
          let val = "";
          // Gestisci tasti freccia e altri tasti speciali usando ev.code (posizione fisica del tasto)
          if (ev.code.startsWith("Arrow")) {
            if (ev.code === "ArrowUp") val = "UP";
            else if (ev.code === "ArrowDown") val = "DOWN";
            else if (ev.code === "ArrowLeft") val = "LEFT";
            else if (ev.code === "ArrowRight") val = "RIGHT";
          } else if (ev.code === "Space") {
            val = "SPACE";
          } else if (ev.code.startsWith("Key")) {
            val = ev.code.replace("Key", "").toUpperCase();
          } else if (ev.code.startsWith("Digit")) {
            val = ev.code.replace("Digit", "");
          } else if (ev.code.startsWith("Numpad")) {
            val = "NUM_" + ev.code.replace("Numpad", "");
          } else {
            val = ev.key.toUpperCase();
          }
          
          if (val) {
            finishKeyChange(val);
          }
        };

        // Listen for mouse button input
        mouseDownHandler = (pointer: Phaser.Input.Pointer) => {
          // Determina quale pulsante del mouse è stato premuto
          let val = "LMB";
          if (pointer.button === 2) {
            val = "RMB";
          } else if (pointer.button === 1) {
            val = "MMB";
          }
          
          finishKeyChange(val);
        };

        // Attach listeners dopo un piccolo delay per evitare di catturare il click iniziale sul bottone
        this.time.delayedCall(100, () => {
          if (this.isWaitingForKey && this.currentKeyBeingChanged === c.key) {
            // Listener per tastiera (una volta sola)
            if (kbHandler) {
              window.addEventListener("keydown", kbHandler, { once: true, passive: false });
            }
            // Listener per mouse (una volta sola)
            if (mouseDownHandler) {
              this.input.once("pointerdown", mouseDownHandler);
            }
          }
        });
      });

      offsetY += 54;
    });

    return offsetY;
  }

  private updateDifficultyButtons(
    difficulties: Array<"NORMAL" | "HARD" | "EXTREME">,
    colors: string[]
  ) {
    this.difficultyButtons.forEach((button, index) => {
      // Verifica che il bottone esista ancora e non sia stato distrutto
      if (!button || !button.scene || button.scene !== this) {
        return;
      }
      
      try {
        const diff = difficulties[index];
        const isSelected = this.currentSettings.difficulty === diff;
        
        // Se è uno sprite, usa i frame
        if (button instanceof Phaser.GameObjects.Sprite) {
          // Frame 1 se selezionato, frame 0 se no
          button.setFrame(isSelected ? 1 : 0);
        } else {
          // Fallback: bottone di testo
          if (isSelected) {
            button.setStyle({
              color: "#ffffff",
              backgroundColor: colors[index],
            });
          } else {
            button.setStyle({
              color: "#666666",
              backgroundColor: "#333333",
            });
          }
        }
      } catch (e) {
        // Ignora errori se il bottone è stato distrutto
        console.warn("Errore aggiornando bottone difficoltà:", e);
      }
    });
  }

  private updateDifficultyDisplay() {
    if (this.difficultyDisplayText) {
      const difficultyText = this.currentSettings.difficulty === "HARD" ? "hard" : 
                             this.currentSettings.difficulty === "EXTREME" ? "extreme" : 
                             "normal";
      this.difficultyDisplayText.setText(`${this.trans("difficulty")}: ${this.trans(difficultyText).toUpperCase()}`);
    }
  }

  private createBottomButtons() {
    const btnWidth = 130;
    const btnSpacing = 50;
    const centerX = this.scale.width / 2;
    const spacing = btnWidth + btnSpacing;
    
    // Posizioni centrate simmetricamente intorno al centro dello schermo
    const btn1X = centerX - 1.5 * spacing;
    const btn2X = centerX - 0.5 * spacing;
    const btn3X = centerX + 0.5 * spacing;
    const btn4X = centerX + 1.5 * spacing;
    
    const btnY = this.scale.height - 65; // Posizione Y

    // SALVA Button (verde)
    let saveBtn: any;
    if (true) {
      console.log("Aggiungo bottone SALVA (btn-save)");

      saveBtn = this.add
        .sprite(btn1X, btnY, "btn-save", 0)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(5)
        .setScale(0.5);

      saveBtn.on("pointerdown", () => this.save());
      saveBtn.on("pointerover", () => {
        saveBtn.setAlpha(1);
        saveBtn.setScale(0.55);
        saveBtn.setFrame(1);
      });
      saveBtn.on("pointerout", () => {
        saveBtn.setAlpha(1);
        saveBtn.setScale(0.5);
        saveBtn.setFrame(0);
      });
    }

    // APPLICA Button (blu)
    let applyBtn: any;
    if (true) {
      console.log("Aggiungo bottone APPLICA (btn-apply)");

      applyBtn = this.add
        .sprite(btn2X, btnY, "btn-apply", 0)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(5)
        .setScale(0.5);

      applyBtn.on("pointerdown", () => this.apply());
      applyBtn.on("pointerover", () => {
        applyBtn.setAlpha(1);
        applyBtn.setScale(0.55);
        applyBtn.setFrame(1);
      });
      applyBtn.on("pointerout", () => {
        applyBtn.setAlpha(1);
        applyBtn.setScale(0.5);
        applyBtn.setFrame(0);
      });
    }

    // RESET Button - Ripristina ai valori di default
    let resetBtn: any;
    if (true) {
      console.log("Aggiungo bottone RESET (btn-reset)");

      resetBtn = this.add
        .sprite(btn3X, btnY, "btn-reset", 0)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(5)
        .setScale(0.5);

      resetBtn.on("pointerdown", () => this.resetAll());
      resetBtn.on("pointerover", () => {
        resetBtn.setAlpha(1);
        resetBtn.setScale(0.55);
        resetBtn.setFrame(1);
      });
      resetBtn.on("pointerout", () => {
        resetBtn.setAlpha(1);
        resetBtn.setScale(0.5);
        resetBtn.setFrame(0);
      });
    }

    // INDIETRO Button (rosso)
    
    if (true) {

      console.log("Aggiungo bottone INDIETRO (btn-back)");

      this.backBtn = this.add
        .sprite(btn4X, btnY, "btn-back", 0)
        .setOrigin(0.5)
        .setInteractive()
        .setDepth(5)
        .setScale(0.5);

      this.backBtn.on("pointerdown", () => this.back());
      this.backBtn.on("pointerover", () => {
        this.backBtn.setAlpha(1);
        this.backBtn.setScale(0.55);
        this.backBtn.setFrame(1);
      });
      this.backBtn.on("pointerout", () => {
        this.backBtn.setAlpha(1);
        this.backBtn.setScale(0.5);
        this.backBtn.setFrame(0);
      });
    }
  }

  /**
   * Funzione chiamata quando si preme il bottone "SALVA"
   * Salva le impostazioni e torna alla scena precedente
   */
  private save() {
    // Salva le impostazioni correnti come nuove impostazioni originali
    // (così il bottone Annulla userà queste come riferimento)
    this.originalSettings = { ...this.currentSettings };
    
    // Salva le impostazioni nel localStorage e nel manager globale
    this.saveSettings();
    
    // Mostra una notifica di conferma (verde)
    this.showNotification(this.trans("settingsSaved"), "#00ff00");
    
    // Torna alla scena precedente dopo 500ms (per dare tempo di vedere la notifica)
    this.time.delayedCall(500, () => {
      this.back();
    });
  }

  /**
   * Funzione chiamata quando si preme il bottone "APPLICA"
   * Applica le impostazioni senza salvarle come originali (si possono ancora annullare)
   */
  private apply() {
    // Salva le impostazioni nel localStorage e nel manager globale
    this.saveSettings();
    
    // Mostra una notifica di conferma (blu)
    this.showNotification(this.trans("settingsApplied"), "#0099ff");
  }

  /**
   * Funzione chiamata quando si preme il bottone "RESET"
   * Ripristina tutte le impostazioni ai valori di default iniziali
   */
  private resetAll() {
    // Ripristina le impostazioni ai valori di default globali
    gameSettingsManager.resetToDefault();
    
    // Ricarica le impostazioni dal manager globale
    this.currentSettings = gameSettingsManager.getSettings();
    this.originalSettings = { ...this.currentSettings };
    
    // Aggiorna tutti gli elementi dell'interfaccia per riflettere i valori di default
    this.resetUIElements();
    
    // Mostra una notifica di conferma
    this.showNotification(this.trans("settingsReset"), "#ffaa00");
    
    // Torna alla scena precedente dopo 500ms (per dare tempo di vedere la notifica)
    this.time.delayedCall(500, () => {
      this.back();
    });
  }

  /**
   * Funzione chiamata quando si preme il bottone "INDIETRO" o ESC
   * Chiude la scena Settings e torna alla scena precedente
   */
  private back() {
    console.log("Cambiando scena a: ", this.fromScene);

    // ===== CHIUSURA SCENA SETTINGS =====
    // Ferma la scena Settings
    this.scene.stop();
    
    // ===== GESTIONE SCENA PRECEDENTE =====
    // Controlla lo stato della scena precedente e gestisci la ripresa appropriatamente
    if (this.scene.isPaused(this.fromScene)) {
      // Se la scena è in pausa, riprendila e portala in primo piano
      this.scene.resume(this.fromScene);
      this.scene.bringToTop(this.fromScene);
    } else if (this.scene.isActive(this.fromScene)) {
      // Se la scena è già attiva, portala solo in primo piano
      this.scene.bringToTop(this.fromScene);
    } else {
      // Se la scena non esiste o non è attiva, avviala da zero
      this.scene.start(this.fromScene);
    }
  }

  private showNotification(message: string, color: string) {
    const notif = this.add
      .text(this.scale.width / 2, this.scale.height - 150, message, {
        fontSize: "32px",
        color: color,
        fontFamily: "medieval",
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: notif,
      alpha: 0,
      duration: 2000,
      delay: 500,
      onComplete: () => notif.destroy(),
    });
  }

  private resetUIElements() {
    // Reset slider-like controls (now arrows + text)
    const sliderKeys = Array.from(this.sliderValues.keys());
    sliderKeys.forEach((key) => {
      const value = this.currentSettings[key as keyof Settings] as number;
      const textObj = this.sliderValues.get(key);
      textObj && textObj.setText(`${Math.round(value)}%`);
    });

    // Reset language buttons
    if (this.languageButtons.length === 2) {
      this.updateLanguageButtons(this.languageButtons[0], this.languageButtons[1]);
    }

    // Reset difficulty buttons (order: NORMAL, HARD, EXTREME)
    const difficulties: Array<"NORMAL" | "HARD" | "EXTREME"> = ["NORMAL", "HARD", "EXTREME"];
    const colors = ["#ffaa00", "#ff0000", "#ff00ff"];
    this.updateDifficultyButtons(difficulties, colors);
    this.updateDifficultyDisplay();

    // Reset control button texts
    const controlKeys = Array.from(this.controlButtons.keys());
    controlKeys.forEach((k) => {
      const btn = this.controlButtons.get(k);
      if (btn) {
        const val = (this.currentSettings as any)[k];
        btn.setText(String(val).toUpperCase());
      }
    });
  }

  private saveSettings() {
    // Salva nel manager globale che notificherà tutte le scene
    gameSettingsManager.updateSettings(this.currentSettings);
    // Applica le impostazioni al gioco
    this.applyGameSettings();
  }

  private applyGameSettings() {
    // Le impostazioni sono già state salvate nel manager globale
    // che notificherà automaticamente tutti i listener
    console.log("Impostazioni applicate:", this.currentSettings);

    // Apply master volume if Sound Manager supports it
    try {
      // master multiplier
      const master = (this.currentSettings.masterVolume ?? 100) / 100;

      // If SoundManager has a global volume property, set it
      if (typeof (this.sound as any).volume === "number") {
        try {
          (this.sound as any).volume = master;
        } catch (e) {
          // ignore
        }
      }

      // For existing sounds, adjust volume by music/sfx split when possible
      const musicMul = (this.currentSettings.musicVolume ?? 100) / 100;
      const sfxMul = (this.currentSettings.sfxVolume ?? 100) / 100;

      if (Array.isArray((this.sound as any).sounds)) {
        (this.sound as any).sounds.forEach((s: any) => {
          try {
            // choose multiplier: if sound is looped or name contains 'music' use musicMul
            const isMusic = !!s.loop || (s.key && String(s.key).toLowerCase().includes("music"));
            const vol = master * (isMusic ? musicMul : sfxMul);
            if (typeof s.setVolume === "function") {
              s.setVolume(vol);
            } else if (typeof s.volume === "number") {
              s.volume = vol;
            }
          } catch (err) {
            // ignore per-sound errors
          }
        });
      }
    } catch (err) {
      console.warn("Errore applicando volumi audio:", err);
    }
  }

  private trans(key: keyof typeof TRANSLATIONS["IT"]): string {
    return TRANSLATIONS[this.currentSettings.language][key];
  }

  update() {}
}

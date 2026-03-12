// Sistema globale per le impostazioni del gioco
export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  language: "IT" | "EN";
  difficulty: "NORMAL" | "HARD" | "EXTREME";
  moveUp: string;
  moveDown: string;
  moveLeft: string;
  moveRight: string;
  interactKey: string;
  attackButton: string;
  defendButton: string;
}

class GameSettingsManager {
  private settings: GameSettings = {
    masterVolume: 100,
    musicVolume: 100,
    sfxVolume: 100,
    language: "IT",
    difficulty: "NORMAL",
    moveUp: "W",
    moveDown: "S",
    moveLeft: "A",
    moveRight: "D",
    interactKey: "E",
    attackButton: "LMB",
    defendButton: "RMB",
  };

  private defaultSettings: GameSettings = {
    masterVolume: 100,
    musicVolume: 100,
    sfxVolume: 100,
    language: "IT",
    difficulty: "NORMAL",
    moveUp: "W",
    moveDown: "S",
    moveLeft: "A",
    moveRight: "D",
    interactKey: "E",
    attackButton: "LMB",
    defendButton: "RMB",
  };

  private listeners: Array<(settings: GameSettings) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  // Carica le impostazioni dal localStorage
  loadFromStorage(): void {
    const saved = localStorage.getItem("gameSettings");
    if (saved) {
      try {
        const loaded = JSON.parse(saved);
        this.settings = {
          ...this.settings,
          ...loaded,
          defendButton: loaded.defendButton || this.settings.defendButton,
        };
      } catch (e) {
        console.warn("Errore caricando impostazioni:", e);
      }
    }
  }

  // Salva le impostazioni nel localStorage
  saveToStorage(): void {
    try {
      localStorage.setItem("gameSettings", JSON.stringify(this.settings));
    } catch (e) {
      console.warn("Errore salvando impostazioni:", e);
    }
  }

  // Ottieni le impostazioni correnti
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  // Aggiorna le impostazioni
  updateSettings(newSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Aggiorna una singola impostazione
  updateSetting<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
    this.settings[key] = value;
    this.saveToStorage();
    this.notifyListeners();
  }

  // Reimposta alle impostazioni di default
  resetToDefault(): void {
    this.settings = { ...this.defaultSettings };
    this.saveToStorage();
    this.notifyListeners();
  }

  // Registra un listener per i cambiamenti delle impostazioni
  addListener(callback: (settings: GameSettings) => void): void {
    this.listeners.push(callback);
  }

  // Rimuovi un listener
  removeListener(callback: (settings: GameSettings) => void): void {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  // Notifica tutti i listener
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getSettings());
      } catch (e) {
        console.warn("Errore nel listener delle impostazioni:", e);
      }
    });
  }
}

// Istanza singleton globale
export const gameSettingsManager = new GameSettingsManager();

// Esponi anche su window per compatibilità
if (typeof window !== "undefined") {
  (window as any).gameSettings = gameSettingsManager.getSettings();
  gameSettingsManager.addListener((settings) => {
    (window as any).gameSettings = settings;
  });
}

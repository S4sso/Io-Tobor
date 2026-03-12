//importiamo la classe GameData
import { GameData } from "../GameData";
import WebFontFile from '../scenes/webFontFile';

export default class Preloader extends Phaser.Scene {

  private _loading: Phaser.GameObjects.Text;
  private _progressBg: Phaser.GameObjects.Graphics;
  private _progressBar: Phaser.GameObjects.Graphics;
  private _image: Phaser.GameObjects.Image;
  private _star: Phaser.GameObjects.TileSprite;

  constructor() {
    super({
      key: "Preloader",
    });
  }

  preload() {
    this.cameras.main.setBackgroundColor(GameData.globals.bgColor);

    // Inizializza barra di caricamento stilizzata (più grande)
    const w = this.game.canvas.width;
    const h = this.game.canvas.height;
    const barWidth = Math.floor(w * 0.7);
    const barHeight = 40;
    const barX = Math.floor((w - barWidth) / 2);
    const barY = GameData.preloader.loadingBarY - 22;

    this._progressBg = this.add.graphics();
    this._progressBg.fillStyle(0x222222, 0.95);
    this._progressBg.fillRoundedRect(barX, barY, barWidth, barHeight, 12);

    this._progressBar = this.add.graphics();

    this.loadAssets();
  }

  init() {
    // Salviamo la posizione iniziale del logo (ci serve per l'animazione "su/giù") e lo alziamo leggermente
    const startY = GameData.preloader.imageY - 20;
    // Creiamo l'immagine del logo al centro e la rendiamo inizialmente invisibile
    this._image = this.add
      .image(
        GameData.preloader.imageX,
        GameData.preloader.imageY - 20,
        GameData.preloader.image
      )
      .setAlpha(0).setOrigin(0.5,0.5).setScale(1.3);

    // Animazione 1: fade-in del logo (entra gradualmente)
    this.tweens.add({
      targets: [this._image],
      alpha: 1,
      duration: 1500,
      ease: "Sine.easeInOut"
    });

    this._loading = this.add
      .text(this.game.canvas.width / 2, GameData.preloader.loadingTextY, "")
      .setAlpha(1)
      .setDepth(1001)
      .setOrigin(0.5, 1).setColor("#ffffff").setFontSize(40).setFontFamily(GameData.preloader.loadingTextFont);

    this._star = this.add.tileSprite(this.game.canvas.width/2, this.game.canvas.height/2, this.game.canvas.width, this.game.canvas.height, "star").setOrigin(0.5, 0.5).setScale(5).setDepth(-1).setAlpha(0.3);  
  }
  create() {
    this.input.setDefaultCursor('url(assets/images/cursor.png), pointer');
    // create() rimane minimale: l'immagine e le animazioni sono impostate in init()
    // Assicuriamoci che il testo di caricamento sia presente (fallback)
    if (!this._loading) {
      this._loading = this.add
        .text(this.game.canvas.width / 2, GameData.preloader.loadingTextY, "")
        .setAlpha(1)
        .setDepth(1001)
        .setOrigin(0.5, 1).setColor("#ffffff").setFontSize(40).setFontFamily(GameData.preloader.loadingTextFont);
    }
  }
  update(time: number, delta: number): void {
    this._star.tilePositionX -= 0.03;
  }
  

  loadAssets(): void {

    this.load.on("start", () => { });

    this.load.on("fileprogress", (file: any, value: any) => {

    });

    this.load.on('progress', (value: number) => {
      const w = this.game.canvas.width;
      const barWidth = Math.floor(w * 0.7);
      const barHeight = 40;
      const barX = Math.floor((w - barWidth) / 2);
      const barY = GameData.preloader.loadingBarY - 22;

      this._progressBar.clear();
      this._progressBar.fillStyle(GameData.preloader.loadingBarColor, 1);
      this._progressBar.fillRoundedRect(barX + 2, barY + 2, Math.max(0, (barWidth - 4) * value), barHeight - 4, 10);

      // Manteniamo il testo di caricamento ma rimuoviamo la percentuale interna alla barra
      this._loading.setText(GameData.preloader.loadingText + ' ' + Math.round(value * 100) + '%');
    });

    this.load.on('complete', () => {

      // Animazione completamento barra
      this._loading.setText(GameData.preloader.loadingTextComplete);

      this.tweens.add({
        targets: [this._progressBar, this._progressBg],
        alpha: 0,
        duration: 400,
        onComplete: () => {
          if (this._progressBar) { this._progressBar.destroy(); }
          if (this._progressBg) { this._progressBg.destroy(); }
        }
      });

      // Mostra logo e scritte dopo il caricamento
      const centerX = this.game.canvas.width / 2;
      const centerY = this.game.canvas.height / 2;
      // Logo centrato (alzato leggermente)
      this._image.setAlpha(1).setScale(1.3).setPosition(centerX, centerY - 80);

      // Scritta sotto il logo
      this.add.text(
        centerX,
        centerY,
        "Created by Motus Group",
        {
          fontFamily: GameData.preloader.loadingTextFont,
          fontSize: "24px",
          color: "#ffffff",
          align: "center"
        }
      ).setOrigin(0.5, 0).setAlpha(0.7);

    

      // Sprite della barra spaziatrice
      const spacebarSprite = this.add.image(centerX, centerY + 220, "btn-space").setOrigin(0.5, 0.5).setScale(0.7);

      // Animazione della barra spaziatrice
      this.tweens.add({
      targets: [spacebarSprite],
      scale: { from: 0.5, to: 0.57 },
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: "Sine.inOut",
    });

      // Funzione per avviare la scena successiva
      const startGame = () => {
        // Suono di conferma se disponibile
        if (this.sound) {
          this.sound.play('space_sfx');
        }

        // Assicuriamoci che i listener non scattino più volte
        this.input.keyboard?.off('keydown-SPACE', startGame);
        this.input.off('pointerdown', startGame);

        // Fade out e cambio scena
        this.tweens.add({
          targets: [this._image, this._loading,  spacebarSprite],
          alpha: 0,
          duration: 500,
          onComplete: () => {
            this.scene.stop("Preloader");
            this.scene.start("Intro");
          },
        });
      };

      // Avvia con click o barra spaziatrice (solo dopo il complete)
      this.input.once('pointerdown', startGame);
      this.input.keyboard?.once('keydown-SPACE', startGame);

    });

    //Assets Load



    //Assets Load
    //--------------------------

    //WEB FONT
    if (GameData.webfonts != null) {
      let _fonts: Array<string> = [];
      GameData.webfonts.forEach((element: FontAsset) => {
        _fonts.push(element.key);
      });
      this.load.addFile(new WebFontFile(this.load, _fonts));
    }

    //local FONT
    if (GameData.fonts != null) {
      let _fonts: Array<string> = [];
      GameData.fonts.forEach((element: FontAsset) => {
        this.load.font(element.key, element.path,element.type);
      });
      
    }



    //SCRIPT
    if (GameData.scripts != null)
      GameData.scripts.forEach((element: ScriptAsset) => {
        this.load.script(element.key, element.path);
      });

    // IMAGES
    if (GameData.images != null)
      GameData.images.forEach((element: ImageAsset) => {
        this.load.image(element.name, element.path);
      });
       if (GameData.images != null)
      GameData.images.forEach((element: ImageAsset) => {
        this.load.image(element.name, element.path);
        this.load.image("fumo", "assets/images/particelle/fumo.png");
        this.load.image("scintille", "assets/images/particelle/scintille.png");
        this.load.image("spark1", "assets/images/particelle/spark1.png");
        this.load.image("spark2", "assets/images/particelle/spark2.png");
        this.load.image("spark3", "assets/images/particelle/spark3.png");
      });

    // TILEMAPS
    if (GameData.tilemaps != null)
      GameData.tilemaps.forEach((element: TileMapsAsset) => {
        this.load.tilemapTiledJSON(element.key, element.path);
      });

    // ATLAS
    if (GameData.atlas != null)
      GameData.atlas.forEach((element: AtlasAsset) => {
        this.load.atlas(element.key, element.imagepath, element.jsonpath);
      });

    // SPRITESHEETS
    if (GameData.spritesheets != null)
      GameData.spritesheets.forEach((element: SpritesheetsAsset) => {
        this.load.spritesheet(element.name, element.path, {
          frameWidth: element.width,
          frameHeight: element.height,
          endFrame: element.frames - 1,
        });
      });
      

    //video 
    if (GameData.videos != null) {
      GameData.videos.forEach((element: VideoAsset) => {
        this.load.video(element.name, element.path, true);
      });
    }

    //bitmap fonts
    if (GameData.bitmapfonts != null)
      GameData.bitmapfonts.forEach((element: BitmapfontAsset) => {
        this.load.bitmapFont(element.name, element.imgpath, element.xmlpath);
      });

    // SOUNDS
    if (GameData.sounds != null)
      GameData.sounds.forEach((element: SoundAsset) => {
        this.load.audio(element.name, element.paths);
      });

    // Audio
    if (GameData.audios != null)
      GameData.audios.forEach((element: AudioSpriteAsset) => {
        this.load.audioSprite(
          element.name,
          element.jsonpath,
          element.paths,
          element.instance
        );
      });
  }
}
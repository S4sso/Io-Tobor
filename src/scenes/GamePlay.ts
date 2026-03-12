
import "phaser";
import Tobor from "./gameObjects/Tobor/Tobor";

// Scena principale di gameplay del prototipo "Revolution of Self"
// Semplificata: un unico ambiente di prova con doppio salto e wall‑jump
export default class GamePlay extends Phaser.Scene {

  // input da tastiera
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  // player attuale
  private player: Tobor;
  private spawnPoint: Phaser.Math.Vector2;

  // statistiche di movimento
  private baseSpeed: number = 220;
  private jumpVelocity: number = -360;
  private doubleJumpVelocity: number = -320;
  private hasDoubleJumped: boolean = false;
  //i layer vengono istanziati come variabili di classe
	private map: Phaser.Tilemaps.Tilemap;
	private tileset: Phaser.Tilemaps.Tileset;
  private tileset1: Phaser.Tilemaps.Tileset;
  private tileset2: Phaser.Tilemaps.Tileset;
  private tileset3: Phaser.Tilemaps.Tileset;
  private tileset4: Phaser.Tilemaps.Tileset;
  //in layer viene istanziato il livello di tile visibili
	private layer: Phaser.Tilemaps.TilemapLayer;
  //in layer 2 il livello per la gestione delle collisioni pavimento e piattaforme	
	private layer2: Phaser.Tilemaps.TilemapLayer;
  // Ladder layer for climbing mechanics
  private ladderLayer: Phaser.Tilemaps.TilemapLayer;
  // Lever layer for gravity flip mechanics
  private leverLayer: Phaser.Tilemaps.TilemapLayer;
  private leverKey: Phaser.Input.Keyboard.Key;
  private levers: Phaser.GameObjects.Sprite[] = [];
  // Laser layer for laser shooters
  private laserLayer: Phaser.Tilemaps.TilemapLayer;
  private laserShooters: Phaser.GameObjects.Sprite[] = [];
  // marker layer containing yellow tiles where beams should appear
  private laserBeamLayer: Phaser.Tilemaps.TilemapLayer;
  private laserBeams: Phaser.Physics.Arcade.StaticGroup;

  constructor() {
    super({
      key: "GamePlay",
    });
  }

  preload() {
    this.load.tilemapTiledJSON("livello1", "assets/map/livelloLaser/livello1.json");
    this.load.image("tilemap-cose-utili-extruded", "assets/map/livelloLaser/tileset-cose-utili-extruded.png");
    this.load.image("tilemap1-extruded", "assets/map/livelloLaser/tileset1-extruded.png");
    this.load.image("tilemap2-extruded", "assets/map/livelloLaser/tileset2-extruded.png");
    this.load.image("tilemap3-extruded", "assets/map/livelloLaser/tileset3-extruded.png");
    this.load.image("tilemap4-extruded", "assets/map/livelloLaser/tileset4-extruded.png");
    this.load.spritesheet("laser-shooter", "assets/images/laser/laser_shooter.png", { frameWidth: 46, frameHeight: 24, endFrame: 1 });
    this.load.spritesheet("laser-beam", "assets/images/laser/laser_beam.png", { frameWidth: 48, frameHeight: 176, endFrame: 2 });
    this.load.spritesheet("leva", "assets/images/leva/leva.png", { frameWidth: 228, frameHeight: 276 });
  }

  init() {
    // Impostiamo una gravità verticale globale per tutte le entità con corpo fisico (player + Echi)
    this.physics.world.gravity.y = 900;
  }

  create() {

    this.map = this.make.tilemap({ key: "livello1"});
    if (this.cameras.main) {
        this.cameras.main.setBounds(0, 300, this.map.widthInPixels, this.map.heightInPixels - 300);
        this.cameras.main.scrollX = 0;
        this.cameras.main.scrollY = 0;
        console.log("Camera bounds set:", this.cameras.main.getBounds());
      }
    	this.physics.world.setBounds(
		  0, //x
		  0, //y
		  this.map.widthInPixels, //width
		  this.map.heightInPixels //height
	  );

    this.laserBeams = this.physics.add.staticGroup();

    //creo il tileset che sarà utilizzato nei singoli layer come texture per le tile
	  
    this.tileset = this.map.addTilesetImage("tileset-cose-utili-extruded", "tilemap-cose-utili-extruded");
    this.tileset1 = this.map.addTilesetImage("tileset1-extruded", "tilemap1-extruded");
    this.tileset2 = this.map.addTilesetImage("tileset2-extruded", "tilemap2-extruded");
    this.tileset3 = this.map.addTilesetImage("tileset3-extruded", "tilemap3-extruded");
    this.tileset4 = this.map.addTilesetImage("tileset4-extruded", "tilemap4-extruded");

    //creo il primo layer che ospiterà le tile del pavimento
	//questo layer è solamente visuale e non c'è interazione con nessun game object
    this.layer = this.map
	  .createLayer("world", [this.tileset, this.tileset1, this.tileset2, this.tileset3, this.tileset4], 0, 0)
	  .setDepth(9)
	  .setAlpha(1);
    //il secondo layer contiene invece le tile con il collide:true
    	//questo layer viene settato con alpha a zero
    	this.layer2 = this.map
	  .createLayer("collisions", [this.tileset, this.tileset1, this.tileset2, this.tileset3, this.tileset4], 0, 0)
	  .setDepth(0)
	  .setAlpha(0);
    this.layer2.setCollisionByProperty({ collide: true });

    // Create ladder layer for climbing mechanics
    this.ladderLayer = this.map
      .createLayer("ladder", [this.tileset, this.tileset1, this.tileset2, this.tileset3, this.tileset4], 0, 0)
      .setDepth(1)
      .setAlpha(0);

    // Create lever layer for gravity flip mechanics
    this.leverLayer = this.map
      .createLayer("lever", [this.tileset, this.tileset1, this.tileset2, this.tileset3, this.tileset4], 0, 0)
      .setDepth(1)
      .setAlpha(0);
    const leverTiles = this.leverLayer.getTilesWithin(
      0,
      0,
      this.map.width,
      this.map.height
    );

    for (const tile of leverTiles) {

      if (tile.index !== -1) {

      const lever = this.add.sprite(
  tile.getCenterX(),
  tile.getCenterY(),
  "leva",
  0
      )
      .setScale(.2)
      .setInteractive({ useHandCursor: true });
      lever.on("pointerdown", () => {

  const active = lever.getData("active");

  if (active) {
    lever.setFrame(0);
    lever.setData("active", false);
  } else {
    lever.setFrame(1);
    lever.setData("active", true);
  }

  this.player.toggleGravity();

});

      lever.setDepth(10);
      lever.setData("active", false);

      this.levers.push(lever);

    }

  } // Invisible, used for collision detection only

    // Create laser layer for laser shooters
    this.laserLayer = this.map
      .createLayer("laser", [this.tileset, this.tileset1, this.tileset2, this.tileset3, this.tileset4], 0, 0)
      .setDepth(5)
      .setAlpha(1);

    // also create a dedicated layer for beam graphics; this layer is only a marker layer so it
    // can be invisible once the beams are spawned
    this.laserBeamLayer = this.map
      .createLayer("laserbeam", [this.tileset, this.tileset1, this.tileset2, this.tileset3, this.tileset4], 0, 0)
      .setDepth(6)
      .setAlpha(0); // hide the tile markers

    // create animations once
    this.anims.create({
      key: 'laser-shooter-anim',
      frames: this.anims.generateFrameNumbers('laser-shooter', { start: 0, end: 1 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'laser-beam-anim',
      frames: this.anims.generateFrameNumbers('laser-beam', { start: 0, end: 2 }),
      frameRate: 32,
      yoyo: true,
      repeat: -1
    });

    // Place laser shooters on red tiles (assuming tiles with index != -1 are red)
    const laserTiles = this.laserLayer.getTilesWithin(0, 0, this.map.width, this.map.height);
    for (const tile of laserTiles) {
      if (tile.index !== -1) {
        const shooter = this.add.sprite(tile.getCenterX(), tile.getCenterY(), 'laser-shooter');
        shooter.setDepth(10).setScale(2);
        this.laserShooters.push(shooter);
        // Check if the shooter is on the floor (tile below is collision)
        const tileBelow = this.layer2.getTileAt(tile.x, tile.y + 1);
        if (tileBelow && tileBelow.properties.collide) {
          shooter.setFlipY(true); // Flip to face upwards
        }
        shooter.play('laser-shooter-anim');
      }
    }

    const beamTiles = this.laserBeamLayer.getTilesWithin(0, 0, this.map.width, this.map.height);

    for (const tile of beamTiles) {

    if (tile.index !== -1) {

    const beam = this.laserBeams.create(
      tile.getCenterX(),
      tile.getCenterY(),
      'laser-beam'
    ) as Phaser.Physics.Arcade.Sprite;

    beam.setDepth(10).setScale(2);
    beam.play('laser-beam-anim');
    const shooter = this.getClosestShooter(beam, this.laserShooters);
    beam.setData("shooter", shooter);
    if (beam.y < 398) {

  beam.setAlpha(0);

this.time.addEvent({
  delay: 2000,
  loop: true,
  callback: () => {

    const shooter = beam.getData("shooter") as Phaser.GameObjects.Sprite;

    if (beam.alpha === 0) {

      beam.setAlpha(1);

      if (shooter) {
        shooter.play("laser-shooter-anim");
      }

    } else {

      beam.setAlpha(0);

      if (shooter) {
        shooter.stop();
        shooter.setFrame(0); // idle
      }

    }

  }
});

}
      }
    }

    this.player = new Tobor({
      scene: this,
      x: 100,
      y: 200,
      key: "robo"
    });

    this.player.setDepth(10).setScale(2);

    this.leverKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.R
    );

    this.physics.add.collider(
		this.player,
		this.layer2,
		(_player: any, _tile: any) => {
		//qui è possibile eseguire del codice specifico per verificare la collisione tra il gameObject ed una specifica tile
		// ad esempio la tile oltre alla proprietà collide=true potrebbe avere una proprietà exit=true perché è la tile che ci permette di passare al livello successivo
			if (_tile.properties.exit == true) {
				// eseguo del codice specifico o richiamo un metodo						console.log("level completed");
			}
		},
		undefined,
		this
		);

    // Add collision for ladder tiles
    this.physics.add.overlap(
      this.player,
      this.ladderLayer,
      (_player: any, _tile: any) => {
        // Handle ladder climbing logic here
        if (_tile.properties.ladder) {
          console.log("LADDER OVERLAP");
          // Player is on a ladder - this will be handled in Tobor's update method
          (_player as Tobor).setOnLadder(true);
        }
      },
      (_player: any, _tile: any) => {
        return _tile.properties.ladder === true;
      },
      this
    );
    

    // Add collision for laser beams - kills player on contact
    this.physics.add.overlap(
      this.player,
      this.laserBeams,
      (_player: any, _beam: any) => {

        const beam = _beam as Phaser.Physics.Arcade.Sprite;

        if (beam.alpha > 0.5) {
          (_player as Tobor).death();
        }

      },
      undefined,
      this 
    );

    // Camera follows the player
    this.cameras.main.startFollow(this.player);

    console.log("GamePlay");
  
    // --- INPUT ---
    this.cursors = this.input.keyboard.createCursorKeys();

    // --- CAMERA ---
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

    // spawn iniziale
    this.spawnPoint = new Phaser.Math.Vector2();

    this.pause();
  }
  private getClosestShooter(
  beam: Phaser.GameObjects.Sprite,
  shooters: Phaser.GameObjects.Sprite[]
): Phaser.GameObjects.Sprite | null {

  let closest: Phaser.GameObjects.Sprite | null = null;
  let minDistance = Number.MAX_VALUE;

  shooters.forEach((shooter) => {

    const distance = Phaser.Math.Distance.Between(
      beam.x,
      beam.y,
      shooter.x,
      shooter.y
    );

    if (distance < minDistance) {
      minDistance = distance;
      closest = shooter;
    }

  });

  return closest;
}


  update(time: number, delta: number): void {
    this.player.update(time, delta);
    this.player.setOnLadder(false);
    console.log("Player position: ", this.player.x, this.player.y);
    if (Phaser.Input.Keyboard.JustDown(this.leverKey)) {
      this.tryActivateLever();
    }
  }




  // statistiche fisse, non più basate su livello
  private getStatsForLevel(level: number) {
    // ritorno valore fisso, usato solo se necessario
    return {
      baseSpeed: this.baseSpeed,
      jumpVelocity: this.jumpVelocity,
      doubleJumpVelocity: this.doubleJumpVelocity,
      canDoubleJump: true,
    };
  }
  private getLeverFromTile(tile: Phaser.Tilemaps.Tile): Phaser.GameObjects.Sprite | null {

  for (const lever of this.levers) {

    if (
      Phaser.Math.Distance.Between(
        lever.x,
        lever.y,
        tile.getCenterX(),
        tile.getCenterY()
      ) < 10
    ) {
      return lever;
    }

  }

  return null;
}
   private tryActivateLever() {

  const tile = this.leverLayer.getTileAtWorldXY(
    this.player.x,
    this.player.y
  );

  if (!tile) return;

  if (tile.properties.lever) {

    const lever = this.getLeverFromTile(tile);

    if (lever) {

      const active = lever.getData("active");

      if (active) {
        lever.setFrame(0);
        lever.setData("active", false);
      } else {
        lever.setFrame(1);
        lever.setData("active", true);
      }

      this.player.toggleGravity();

    }
  }
}

   pause(): void {

      console.log("Sono entrato nella funzione pause");

      this.input.keyboard.on('keydown-ESC', ()=>{

        this.scene.launch('Pause', {
          from: this.scene.key // passa la scena chiamante
        });

        this.scene.bringToTop('Pause');
        this.scene.pause();
            
        });

  }
}
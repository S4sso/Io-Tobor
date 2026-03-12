export let GameData: gameData = {
   globals: {
    gameWidth: 1280,
    gameHeight: 800,
    bgColor: "#000000",
    debug: true
  },

  preloader: {
  
  bgColor: "000000",
  image: "logo",
  imageX: 1280 / 2,
  imageY: 800 / 2,

  loadingText: "Caricamento...",
  loadingTextFont: "ralewayRegular",
  loadingTextComplete: "Click to Start!",
  loadingTextY: 700,
  loadingBarColor: 0x494949,
  loadingBarY: 630,

  },

  spritesheets: [
    
    { name: "robo", path: "assets/images/robo.png", width: 30, height: 50, frames: 8 },
    { name:"star", path:"assets/images/bg/preloader/blue-stars.png", width:272, height:160, frames: 0},
    { name: "btn-audio-intro", path:"assets/images/buttons/volumeButton.png", width:75, height:77, frames: 4},
    { name: "btn-play-intro" , path:"assets/images/buttons/playButton.png", width:402, height:75, frames: 2},
    { name: "btn-settings-intro" , path:"assets/images/buttons/settingsButton.png", width:402, height:75, frames: 2},
    { name: "btn-credits-intro" , path:"assets/images/buttons/creditsButton.png", width:402, height:75, frames: 2},
    { name: "btn-resume", path:"assets/images/buttons/resumeButton.png", width:402, height:75, frames: 2 },
    { name: "btn-restart", path:"assets/images/buttons/restartButton.png", width:402, height:75, frames: 2 },
    { name:"btn-x" , path:"assets/images/buttons/xButton.png", width:45, height:45, frames: 4},
  ],

  images: [
    { name: "phaser", path: "assets/images/logo-phaser.png" },
    { name: "freedoom", path: "assets/images/freedoom.png" },
    { name: "thelucasart", path: "assets/images/thelucasart.png" },
    { name: "intro-bg", path: "assets/images/intro-bg.jpg" },
    { name: "bg-1", path: "assets/images/bg/1.png" },
    { name: "bg-2", path: "assets/images/bg/2.png" },
    { name: "bg-3", path: "assets/images/bg/3.png" },
    { name: "bg-4", path: "assets/images/bg/4.png" },
    { name: "bg-5", path: "assets/images/bg/5.png" },
    { name: "bg-6", path: "assets/images/bg/6.png" },
    { name: "bg-7", path: "assets/images/bg/7.png" },
    { name: "motus", path:"assets/images/motus.png" },
    { name: "motus2", path:"assets/images/motus2.png" },
    { name: "motus-full", path:"assets/images/Motus-LogoFull.png" },
    { name: "logoScuola", path:"assets/images/logoscuola.png" },
    { name: "phaser", path:"assets/images/logo-phaser.png" },
    { name: "btn-space", path:"assets/images/buttons/SPACE.png" },
    { name: "gameLogo", path:"assets/images/gameLogo.png" },
    { name: "Background-Intro" , path:"assets/images/bg/intro/bg-intro.png" },
    { name: "Background-Credits", path:"assets/images/bg/crediti/bg-crediti.png"},
    { name: "tilemap-cose-utili-extruded", path: "assets/map/tileset-cose-utili-extruded.png"},
    { name: "tilemap1-extruded", path: "assets/map/livelloLaser/tileset1-extruded.png"},
    { name: "tilemap2-extruded", path: "assets/map/livelloLaser/tileset2-extruded.png"},
    { name: "tilemap3-extruded", path: "assets/map/livelloLaser/tileset3-extruded.png"},
    { name: "tilemap4-extruded", path: "assets/map/livelloLaser/tileset4-extruded.png"},

      

  ],

  // non servono più tilemap, l'ambiente viene creato in codice
  tilemaps: [
    {
		  key: "livello1",
		  path: "assets/map/livelloLaser/livello1.json",
		}

  ],
  atlas: [],
sounds: [
      {
      name: "death_sfx",
      paths: [ "assets/sounds/music.ogg"]
    },
    {
      name: "space_sfx",
      paths: [ "assets/sounds/music.ogg"]
    },

   {
    name: "mmx3zerotheme",
    paths: ["assets/sounds/mmx3zerotheme.ogg", "assets/sounds/mmx3zerotheme.m4a"]
   }
  ],

  videos: [
    { name: "introVideo", path: "assets/images/bg/intro/bg-video-intro.mp4" },
    { name: "trailerVideo", path: "assets/videos/videoTrailer.mp4" },
  ],
  audios: [

    /*{
    name: "sfx",
    jsonpath: "assets/sounds/sfx.json",
    paths: ["assets/sounds/sfx.ogg", "assets/sounds/sfx.m4a"],
    instances: 10,
  }*/
  ],

  scripts: [],
  fonts: [{key:"ralewayRegular", path:"assets/fonts/raleway.regular.ttf",type:"truetype"}],
  webfonts: [{ key: 'Nosifer' }, { key: 'Roboto' }, { key: 'Press+Start+2P' }, { key: 'Rubik+Doodle+Shadow' }, { key: 'Rubik+Glitch' }],
  bitmapfonts: [],
};

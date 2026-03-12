export default class Trailer extends Phaser.Scene {

    private laws: string[];
    private fullText: string;
    private currentChar: number;
    private text: Phaser.GameObjects.Text;
    private typeTimer: any;
    private video: Phaser.GameObjects.Video;
    private skipText: Phaser.GameObjects.Text;
    
    constructor() {
        super('Trailer');
    }

    preload() {
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        this.laws = [
            "1. Un robot non può recar danno a un essere umano né può permettere che, a causa del proprio mancato intervento, un essere umano riceva danno.\n\n",
            "2. Un robot deve obbedire agli ordini impartiti dagli esseri umani, purché tali ordini non contravvengano alla Prima Legge.\n\n",
            "3. Un robot deve proteggere la propria esistenza, purché tale autodifesa non contrasti con la Prima o con la Seconda Legge."
        ];

        this.fullText = this.laws.join('');
        this.currentChar = 0;

        this.text = this.add.text(
            this.scale.width / 2,
            this.scale.height / 2,
            '',
            {
                fontSize: '24px',
                color: '#ffffff',
                wordWrap: { width: 700 },
                align: 'center'
            }
        ).setOrigin(0.5);

        this.typeTimer = this.time.addEvent({
            delay: 40,
            callback: this.typeText,
            callbackScope: this,
            loop: true
        });

        this.pause();
    }

    typeText() {
        if (this.currentChar < this.fullText.length) {
            this.text.text += this.fullText[this.currentChar];
            this.currentChar++;
        } else {
            this.typeTimer.remove();

            this.time.delayedCall(3000, () => {
                this.tweens.add({
                    targets: this.text,
                    alpha: 0,
                    duration: 2000,
                    onComplete: () => {
                        this.startVideo();
                    }
                });
            });
        }
    }

    startVideo() {
        this.text.destroy();

        this.video = this.add.video(
            this.scale.width / 2,
            this.scale.height / 2,
            'trailerVideo'
        );

        this.video.play(false);

        this.skipText = this.add.text(
            this.scale.width - 30,
            this.scale.height - 30,
            'Press SPACE to Skip',
            {
                fontSize: '20px',
                color: '#ffffff'
            }
        ).setOrigin(1);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.video.stop();
            this.scene.start('GamePlay');
        });

        this.video.once('complete', () => {
            this.scene.start('GamePlay');
        });
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
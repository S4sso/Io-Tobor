import { ITobor } from "./ITobor";

export default class Tobor extends Phaser.GameObjects.Sprite implements ITobor {

    private _config: genericConfig;
    private _scene: Phaser.Scene;

    private _body: Phaser.Physics.Arcade.Body;

    // Meccaniche di movimento
    private baseSpeed: number = 220;
    private jumpVelocity: number = -360;
    private doubleJumpVelocity: number = -320;
    private hasDoubleJumped: boolean = false;
    private jetpackThrust: number = -400;

    // Input
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private jumpKey: Phaser.Input.Keyboard.Key;
    private jetKey: Phaser.Input.Keyboard.Key;

    // Core system - abilità sbloccate
    private coreCount: number = 0;
    private hasDoubleJumpAbility: boolean = false;
    private hasWallClimbAbility: boolean = false;
    private hasJetpackAbility: boolean = false;
    private isOnLadder: boolean = false;
    private gravityInverted: boolean = false;

    private _animations: Array<{ key: string, frames: number[], frameRate: number, yoyo: boolean, repeat: number }> = [
        { key: "idle", frames: [0, 1, 2, 3], frameRate: 10, yoyo: false, repeat: -1 },
        { key: "move", frames: [4, 5, 6, 7], frameRate: 10, yoyo: false, repeat: -1 }
    ];

    constructor(params: genericConfig) {
        super(params.scene, params.x, params.y, params.key);

        this._config = params;
        this._scene = params.scene;

        this.create();
        this.createAnimations();
        this.setupInput();
        
        // Start with idle animation
        this.play("idle");
    }

    create() {
        // abilita fisica
        this._scene.physics.world.enable(this);

        this._body = this.body as Phaser.Physics.Arcade.Body;
        this._body.setCollideWorldBounds(true);

        this._body.setSize(30, 50);
        this._body.setOffset(
            (this._body.width - 30) / 2,
            (this._body.height - 50) / 2
        );

        
        this._scene.add.existing(this);
    }

    createAnimations() {
        this._animations.forEach(element => {
            if (!this._scene.anims.exists(element.key)) {
                let animation: Phaser.Types.Animations.Animation = {
                    key: element.key,
                    frames: this.anims.generateFrameNumbers(this._config.key, {
                        frames: element.frames
                    }),
                    frameRate: element.frameRate,
                    yoyo: element.yoyo,
                    repeat: element.repeat
                };

                this._scene.anims.create(animation);
            }
        });
    }

    private setupInput() {
        this.cursors = this._scene.input.keyboard.createCursorKeys();
        this.jumpKey = this._scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.jetKey = this._scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    /**
     * Imposta il numero di core raccolti e sblocca le abilità corrispondenti
     */
    public setCoreCount(coreCount: number) {
        this.coreCount = coreCount;
        this.unlockAbilitiesByCore(coreCount);
    }

    /**
     * Switch case per sbloccare abilità in base ai core
     * 0 core: salto normale + movimento
     * 1 core: salto normale + movimento + doppio salto + arrampicata
     * 2+ core: tutte le abilità + jetpack
     */
    private unlockAbilitiesByCore(coreCount: number) {
        // Reset delle abilità
        this.hasDoubleJumpAbility = false;
        this.hasWallClimbAbility = false;
        this.hasJetpackAbility = false;

        switch (coreCount) {
            case 0:
                // Solo movimento e salto normale
                console.log("Player: 0 core - Solo salto e movimento");
                break;
            case 1:
                // Doppio salto + arrampicata
                this.hasDoubleJumpAbility = true;
                this.hasWallClimbAbility = true;
                console.log("Player: 1 core - Doppio salto + arrampicata sbloccati");
                break;
            case 2:
                // Tutte le abilità
                this.hasDoubleJumpAbility = true;
                this.hasWallClimbAbility = true;
                this.hasJetpackAbility = true;
               
                console.log("Player: 2+ core - Tutte le abilità sbloccate (Jetpack incluso)");
                break;
            default:
                

        }
    }

    update(time: number, delta: number) {
        
        // Gestione input
        const left = this.cursors.left.isDown;
        const right = this.cursors.right.isDown;
        const jump = Phaser.Input.Keyboard.JustDown(this.jumpKey);
        const jet = Phaser.Input.Keyboard.JustDown(this.jetKey);
        

        // Movimento orizzontale
        this.handleHorizontalMovement(left, right);

        // Movimento verticale (salti)
        this.handleVerticalMovement(jump, delta);

        // Jetpack (se sbloccato)
        if (this.hasJetpackAbility && jet) {
            this._body.setVelocityY(this.jetpackThrust);
        }

        // Gestione animazioni
        this.handleAnimations(left, right);
    }

    private handleHorizontalMovement(left: boolean, right: boolean) {
        if (left) {
            this._body.setVelocityX(-this.baseSpeed);
            this.setFlipX(false); // Face left (assuming sprite faces left by default)
        } else if (right) {
            this._body.setVelocityX(this.baseSpeed);
            this.setFlipX(true); // Face right (flip if sprite faces left by default)
        } else {
            this._body.setVelocityX(0);
        }
    }

    private handleVerticalMovement(jump: boolean, delta: number) {
        const onFloor = this.gravityInverted
            ? this._body.blocked.up
            : this._body.blocked.down;
        const onWall = this._body.blocked.left || this._body.blocked.right;

        // Handle ladder climbing
        if (this.isOnLadder) {

            // disattiva gravità
            this._body.setAllowGravity(false);

            const up = this.cursors.up.isDown;
            const down = this.cursors.down.isDown;

            if (up) {
                this._body.setVelocityY(-this.baseSpeed);
            } 
            else if (down) {
                this._body.setVelocityY(this.baseSpeed);
            } 
            else {
                this._body.setVelocityY(0);
            }

            return;
        }

        // riattiva gravità quando non sei sulla scala
        this._body.setAllowGravity(true);

        if (onFloor) {
            this.hasDoubleJumped = false;
            if (jump) {
                this._body.setVelocityY(
                    this.gravityInverted
                    ? -this.jumpVelocity
                    : this.jumpVelocity
                );
            }
        } else if (jump) {
            // Wall climbing - se ha l'abilità
            if (this.hasWallClimbAbility && onWall && this._body.velocity.y > 0) {
                this._body.setVelocityY(
                this.gravityInverted ? -this.jumpVelocity : this.jumpVelocity
                );
                const wallSide = this._body.blocked.left ? 'right' : 'left';
                if (wallSide === 'right') {
                    this._body.setVelocityX(this.baseSpeed);
                } else {
                    this._body.setVelocityX(-this.baseSpeed);
                }
                this.hasDoubleJumped = false;
            }
            // Doppio salto - se ha l'abilità
            else if (this.hasDoubleJumpAbility && !this.hasDoubleJumped) {
                this._body.setVelocityY(
                this.gravityInverted ? -this.doubleJumpVelocity : this.doubleJumpVelocity
                );
                this.hasDoubleJumped = true;
            }
        }
    }

    private handleAnimations(left: boolean, right: boolean) {
        const isMoving = left || right;
        
        if (isMoving) {
            if (this.anims.currentAnim?.key !== "move") {
                this.play("move");
            }
        } else {
            if (this.anims.currentAnim?.key !== "idle") {
                this.play("idle");
            }
        }
    }

    /**
     * Ritorna il numero di core attuali
     */
    public getCoreCount(): number {
        return this.coreCount;
    }

    /**
     * Ritorna se ha l'abilità di doppio salto
     */
    public hasDoubleJump(): boolean {
        return this.hasDoubleJumpAbility;
    }

    /**
     * Ritorna se ha l'abilità di arrampicata
     */
    public hasWallClimb(): boolean {
        return this.hasWallClimbAbility;
    }

    /**
     * Ritorna se ha l'abilità di jetpack
     */
    public hasJetpack(): boolean {
        return this.hasJetpackAbility;
    }

    /**
     * Imposta se il player è su una scala
     */
    public setOnLadder(onLadder: boolean) {
        this.isOnLadder = onLadder;
    }

    public toggleGravity() {

    this.gravityInverted = !this.gravityInverted;

    if (this.gravityInverted) {
        this._body.setGravityY(-1800);
        this.setFlipY(true);
        } else {
            this._body.setGravityY(0);
            this.setFlipY(false);
        }

    }    /**
     * Metodo chiamato quando il player muore
     * Emette un evento 'playerDied' che può essere gestito dalla scena
     */
    public death(): void {
        console.log("Player died!");
        this._scene.scene.start('GameOver');
    }
}
export interface ITobor {
    create(): void;
    update(time: number, delta: number): void;
    setCoreCount(coreCount: number): void;
    getCoreCount(): number;
    hasDoubleJump(): boolean;
    hasWallClimb(): boolean;
    hasJetpack(): boolean;
}
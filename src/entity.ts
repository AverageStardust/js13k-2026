import { Vector } from "./vector.js";

export abstract class Entity {
    static inflate(entity: any) {
        switch (entity.type) {
            case "player":
                Object.setPrototypeOf(entity, Player.prototype);
        }
    }

    static getUUID(): number {
        return Math.floor(Math.random() * 2 ** 53);
    }

    position: Vector = [0, 0];

    abstract readonly type: string;
    abstract readonly visibility: number;
    abstract char: string;

    abstract update(): void;
}

export class Player extends Entity {
    readonly type = "player";
    readonly visibility = 10;
    char = "🐕";
    input: Record<string, boolean> = {};

    update() {
        if (this.input["w"]) {
            this.position[1]--;
        }
        if (this.input["s"]) {
            this.position[1]++;
        }
        if (this.input["a"]) {
            this.position[0]--;
        }
        if (this.input["d"]) {
            this.position[0]++;
        }
    }
}

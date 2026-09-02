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

    abstract readonly type: string;

    position: Vector = [0, 0];
    active: boolean = true;
    readonly depth: number = 50;

    abstract char: string;
    colour: string = "#000";

    abstract update(time: number): void;
}

export class Player extends Entity {
    readonly type = "player";
    readonly depth = 100;
    readonly char = "🐕";

    input: Record<string, boolean> = {};
    lastInput: number = 0;

    update(time: number) {
        if (time > this.lastInput + 10) {
            this.active = false;
        }

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

    setInput(input: Record<string, boolean>, time: number) {
        this.input = input;
        this.lastInput = time;
        this.active = true;
    }
}

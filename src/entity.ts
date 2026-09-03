import { Vector, vectorAdd } from "./vector.js";
import { World } from "./world.js";

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
    readonly depth: number = 50;

    position: Vector = [0, 0];
    active: boolean = true;

    abstract rune: string;

    abstract update(world: World): void;
}

export class Player extends Entity {
    readonly type = "player";
    readonly depth = 100;
    readonly rune = "🐕";

    target: Vector | undefined = undefined;
    input: Record<string, boolean> = {};
    lastInput: number = 0;

    update(world: World) {
        if (world.time > this.lastInput + 10) {
            this.active = false;
        }

        if (this.input["w"]) {
            this.move([0, -1]);
        }
        if (this.input["s"]) {
            this.move([0, 1]);
        }
        if (this.input["a"]) {
            this.move([-1, 0]);
        }
        if (this.input["d"]) {
            this.move([1, 0]);
        }
    }

    move(direction: Vector) {
        this.position = vectorAdd(this.position, direction);
        this.target = vectorAdd(this.position, direction);
    }

    setInput(input: Record<string, boolean>, time: number) {
        this.input = input;
        this.lastInput = time;
        this.active = true;
    }
}

import { Vector, vectorAdd } from "./math.js";
import { DIRT_TILE } from "./tile.js";
import { World } from "./world.js";

export abstract class Being {
    static inflate(being: any) {
        switch (being.type) {
            case "player":
                Object.setPrototypeOf(being, Player.prototype);
        }
    }

    static getUUID(): number {
        return Math.floor(Math.random() * 2 ** 53);
    }

    abstract readonly type: string;
    readonly depth: number = 50;

    position: Vector = [0, 0];
    moveDelay: number = 0;
    speed: number = 0.25;
    active: boolean = true;

    abstract rune: string;

    update(_: World) {
        this.moveDelay -= this.speed;
    }

    move(direction: Vector, world: World) {
        const newPosition = vectorAdd(this.position, direction);
        const tileData = world.getTileData(newPosition);

        if(this.moveDelay <= 0.0001 && tileData.isGround) {
            this.position = vectorAdd(this.position, direction);
            this.moveDelay = 1
            return true;
        } else {
            return false;
        }
    }
}

export class Player extends Being {
    readonly type = "player";
    readonly depth = 100;
    readonly rune = "🐕";

    target: Vector | undefined = undefined;
    breakProgress: number = 0;
    input: Record<string, boolean> = {};
    lastInput: number = 0;

    update(world: World) {
        super.update(world);

        if (world.time > this.lastInput + 10) {
            this.active = false;
        }

        let movement: Vector = [0, 0];
        if (this.input["w"]) {
            movement[1]--;
        }
        if (this.input["s"]) {
            movement[1]++;
        }
        if (this.input["a"]) {
            movement[0]--;
        }
        if (this.input["d"]) {
            movement[0]++;
        }
        if (movement[0] || movement[1]) {
            this.move(movement, world);
        }

        if (this.input["q"] && this.target !== undefined) {
            const tileData = world.getTileData(this.target);
            if (tileData.breakStrength < 1) {
                this.breakProgress += tileData.breakSpeed;

                if (this.breakProgress >= 1) {
                    world.setTile(this.target, DIRT_TILE)
                    this.breakProgress = 0;
                }
            } else {
                this.breakProgress = 0;
            }
        }
    }

    move(direction: Vector, world: World) {
        if (super.move(direction, world)) {
            this.breakProgress = 0;
        }

        this.target = vectorAdd(this.position, direction);
        return true;
    }

    setInput(input: Record<string, boolean>, time: number) {
        this.input = input;
        this.lastInput = time;
        this.active = true;
    }
}

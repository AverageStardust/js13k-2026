import { Vector } from "./math.js";
import { DIRT_TILE, ITEM_DATA, TILE_DATA, TileData } from "./data.js";
import { World } from "./world.js";
import { Inventory } from "./inventory.js";

export abstract class Being {
    static inflate(being: any) {
        switch (being.type) {
            case "player":
                Object.setPrototypeOf(being, Player.prototype);
                Object.setPrototypeOf(being.inventory, Inventory.prototype);
        }

        Object.setPrototypeOf(being.position, Vector.prototype);
    }

    static getUUID(): number {
        return Math.floor(Math.random() * 2 ** 53);
    }

    abstract readonly type: string;
    readonly depth: number = 50;

    position: Vector = new Vector();
    moveDelay: number = 0;
    speed: number = 1 / 3;
    isActive: boolean = true;

    abstract rune: string;

    update(_: World) {
        this.moveDelay -= this.speed;
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillText(this.rune, 0, 0);
    }

    move(direction: Vector, world: World) {
        const newPosition = this.position.add(direction);
        const tileData = world.getTileData(newPosition);

        if (this.moveDelay <= 0.0001 && tileData.isGround) {
            this.position = newPosition;
            this.moveDelay = 1;
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
    inventory: Inventory = new Inventory();

    update(world: World) {
        super.update(world);

        if (world.time > this.lastInput + 1000) {
            this.isActive = false;
        }

        this.handleInput(world);
    }

    handleInput(world: World) {
        this.handleMovement(world);

        if (this.target !== undefined) {
            if (this.input["q"]) {
                this.handleBreaking(world, this.target);
            }

            if (this.input["e"] && this.inventory.holding !== undefined) {
                this.handlePlacing(world, this.target, this.inventory.holding);
            }
        }
    }

    handleMovement(world: World) {
        const movement = new Vector();

        if (this.input["w"]) {
            movement.addComponents(0, -1);
        }
        if (this.input["s"]) {
            movement.addComponents(0, 1);
        }
        if (this.input["a"]) {
            movement.addComponents(-1, 0);
        }
        if (this.input["d"]) {
            movement.addComponents(1, 0);
        }

        if (!movement.isZero()) {
            this.move(movement, world);
        }
    }

    handleBreaking(world: World, target: Vector) {
        const tileData = world.getTileData(target);

        if (this.canBreak(tileData)) {
            this.breakProgress += tileData.breakSpeed;

            if (this.breakProgress >= 1) {
                const tileData = world.getTileData(target);
                for (const itemId of tileData.items ?? []) {
                    this.inventory.add(itemId);
                }

                world.setTile(target, DIRT_TILE);
                this.breakProgress = 0;
            }
        } else {
            this.breakProgress = 0;
        }
    }

    canBreak(tileData: TileData): boolean {
        let toolStrength = 0;

        const holdingItem = this.inventory.holding;
        if (holdingItem !== undefined) {
            const itemData = ITEM_DATA[holdingItem];
            if (itemData.toolStrength !== undefined) {
                toolStrength = itemData.toolStrength;
            }
        }

        return tileData.breakStrength <= toolStrength;
    }

    handlePlacing(world: World, target: Vector, itemId: number) {
        const existingTileId = world.getTile(target);
        const tileData = TILE_DATA[existingTileId];

        if (tileData.isGround) {
            const itemTileId = ITEM_DATA[itemId].tile;

            if (itemTileId !== undefined && itemTileId !== existingTileId) {
                if (this.inventory.remove(itemId)) {
                    world.setTile(target, itemTileId);
                }
            }
        }
    }

    render(ctx: CanvasRenderingContext2D) {
        ctx.fillText(this.rune, 0, 0);

        if (this.target !== undefined && this.inventory.holding !== undefined) {
            const offset = this.target.sub(this.position).normalize(36);
            const heldItem = ITEM_DATA[this.inventory.holding];
            const itemSprite = heldItem.name.split(" ")[0];

            ctx.scale(0.5, 0.5);
            ctx.fillText(itemSprite, offset.x, offset.y);
            ctx.scale(2, 2);
        }
    }

    move(direction: Vector, world: World) {
        if (super.move(direction, world)) {
            this.breakProgress = 0;
        }

        this.target = this.position.add(direction);
        return true;
    }

    setInput(input: Record<string, boolean>, time: number) {
        this.input = input;
        this.lastInput = time;
        this.isActive = true;
    }
}

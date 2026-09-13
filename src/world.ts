import { Being as Being, Player, Unicorn } from "./being.js";
import {
    BUSHES_TILE,
    DIRT_TILE,
    GRASS_TILE,
    GRAVEL_TILE,
    OAK_TREE_TILE,
    PINE_TREE_TILE,
    RAINBOW_TILE,
    TILE_DATA,
    TileData,
} from "./data.js";
import { Vector } from "./math.js";
import { Noise, RNG } from "./random.js";

const WORLD_SIZE = new Vector(100, 100);
const WORLD_AREA = WORLD_SIZE.area();
const UPDATE_PERCENT = 0.005;

export class World {
    rng: RNG;
    time: number = 0;
    tiles: number[][];
    beings: Record<number, Being> = {};

    static inflate(state: string): World {
        // not a world yet but it's best if typescript knows the property names
        const world = Object.setPrototypeOf(
            JSON.parse(state),
            World.prototype,
        ) as World;

        Object.setPrototypeOf(world.rng, RNG.prototype);

        for (const being of Object.values(world.beings)) {
            Being.inflate(being);
        }

        return world as World;
    }

    constructor() {
        this.rng = new RNG();
        const noise = new Noise(this.rng.randInt());

        this.tiles = [];
        for (let y = 0; y < WORLD_SIZE.y; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < WORLD_SIZE.x; x++) {
                const a = noise.complex(new Vector(x, y), WORLD_SIZE);
                if (a > 0.25) {
                    this.tiles[y][x] = GRAVEL_TILE;
                } else {
                    this.tiles[y][x] = GRASS_TILE;
                }
            }
        }

        this.scatter(GRASS_TILE, BUSHES_TILE, 0.015);
        this.groupedScatter(GRASS_TILE, OAK_TREE_TILE, 0.005, 6, 0.9);
        this.groupedScatter(GRASS_TILE, PINE_TREE_TILE, 0.005, 15, 0.9);
        this.scatter(GRASS_TILE, RAINBOW_TILE, 0.0015);

        for (let i = 0; i < 3; i++) {
            this.spawn(new Unicorn());
        }
    }

    groupedScatter(
        find: number,
        replace: number,
        percent: number,
        radius: number,
        groupingChance: number,
    ) {
        let centerPosition: Vector = this.randomPosition();
        for (let i = 0; i < percent * WORLD_AREA;) {
            if (this.rng.randFloat() > groupingChance) {
                centerPosition = this.randomPosition();
            }

            const offset = this.rng.randUnitVector(
                radius * this.rng.randFloat(),
            );
            const position = centerPosition.add(offset.round());
            if (this.getTile(position) == find) {
                this.setTile(position, replace);
                i++;
            }
        }
    }

    scatter(find: number, replace: number, percent: number) {
        for (let i = 0; i < percent * WORLD_AREA;) {
            const position = this.randomPosition();

            if (this.getTile(position) == find) {
                this.setTile(position, replace);
                i++;
            }
        }
    }

    spawn(being: Being, position?: Vector) {
        while (position === undefined) {
            position = this.randomPosition();

            if (!this.getTileData(position).isGround) {
                position = undefined;
            }
        }

        being.position = position;
        this.beings[Being.randomUUID()] = being;
    }

    randomPosition(): Vector {
        const x = this.rng.randIntN(WORLD_SIZE.x);
        const y = this.rng.randIntN(WORLD_SIZE.y);
        return new Vector(x, y);
    }

    hasNeighbour(position: Vector, tileId: number) {
        return (
            this.getTile(position.addComponents(1, 0)) == tileId ||
            this.getTile(position.addComponents(-1, 0)) == tileId ||
            this.getTile(position.addComponents(0, 1)) == tileId ||
            this.getTile(position.addComponents(0, -1)) == tileId
        );
    }

    getTileData(position: Vector): TileData {
        return TILE_DATA[this.getTile(position)];
    }

    getTile(position: Vector): number {
        position = position.modulus(WORLD_SIZE);
        return this.tiles[position.y][position.x];
    }

    setTile(position: Vector, tileId: number) {
        position = position.modulus(WORLD_SIZE);
        this.tiles[position.y][position.x] = tileId;
    }

    render(cameraPosition: Vector, ctx: CanvasRenderingContext2D) {
        const visableBeings = this.getVisableBeings(cameraPosition);
        const selectedPositions = this.getSelectedPositions();

        this.renderTiles(cameraPosition, visableBeings, selectedPositions, ctx);
        this.renderEntities(cameraPosition, visableBeings, ctx);
    }

    getVisableBeings(cameraPosition: Vector): Record<number, Being> {
        const visableBeings: Record<number, Being> = {};

        for (const being of Object.values(this.beings)) {
            if (!this.isOnScreen(cameraPosition, being.position)) continue;

            const hash = being.position.modulus(WORLD_SIZE).hash();
            const oldBeing = visableBeings[hash];
            const oldDepth = oldBeing?.depth ?? -Infinity;

            if (being.isActive && oldDepth < being.depth) {
                visableBeings[hash] = being;
            }
        }

        return visableBeings;
    }

    getSelectedPositions(): Record<number, number> {
        const selectedPositions: Record<number, number> = {};

        for (const being of Object.values(this.beings)) {
            if (
                being instanceof Player &&
                being.isActive &&
                being.target !== undefined
            ) {
                selectedPositions[being.target.modulus(WORLD_SIZE).hash()] = being.breakProgress;
            }
        }

        return selectedPositions;
    }

    isOnScreen(cameraPosition: Vector, objectPosition: Vector): boolean {
        const offset = cameraPosition.sub(objectPosition).addComponents(9, 9).modulus(WORLD_SIZE);
        return (
            offset.x >= 0 && offset.x <= 18 && offset.y >= 0 && offset.y <= 18
        );
    }

    renderEntities(
        cameraPosition: Vector,
        visableBeings: Record<number, Being>,
        ctx: CanvasRenderingContext2D,
    ) {
        ctx.fillStyle = "#fff";
        for (const being of Object.values(visableBeings)) {
            const translation = being.position
                .sub(cameraPosition)
                .addComponents(8, 8)
                .modulus(WORLD_SIZE)
                .scale(32)
                .addComponents(16, 24);
            ctx.translate(translation.x, translation.y);
            being.render(ctx);
            ctx.translate(-translation.x, -translation.y);
        }
    }

    renderTiles(
        cameraPosition: Vector,
        visableBeings: Record<number, Being>,
        selectedPositions: Record<number, number>,
        ctx: CanvasRenderingContext2D,
    ) {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 544, 544);

        for (let x = 0; x < 17; x++) {
            for (let y = 0; y < 17; y++) {
                const position = cameraPosition.addComponents(x - 8, y - 8);
                const hash = position.modulus(WORLD_SIZE).hash();
                const tileData = this.getTileData(position);
                const breakProgress = selectedPositions[hash];

                this.renderTileBackground(x, y, tileData, breakProgress, ctx);

                if (visableBeings[hash] === undefined) {
                    this.renderTileRune(x, y, tileData, breakProgress, ctx);
                }
            }
        }
    }

    renderTileBackground(
        x: number,
        y: number,
        tileData: TileData,
        breakProgress: number,
        ctx: CanvasRenderingContext2D,
    ) {
        ctx.fillStyle = tileData.colour;
        if (breakProgress !== undefined) {
            // light background if selected
            if (breakProgress > 0 && this.time % 4 < 2) {
                ctx.fillStyle += "77";
            } else {
                ctx.fillStyle += "55";
            }
        } else {
            ctx.fillStyle += "22";
        }
        ctx.fillRect(x * 32, y * 32, 32, 32);
    }

    renderTileRune(
        x: number,
        y: number,
        tileData: TileData,
        breakProgress: number,
        ctx: CanvasRenderingContext2D,
    ) {
        let offsetX = 16,
            offsetY = 24;

        if (breakProgress > 0) {
            offsetX += (this.rng.randFloat() - 0.5) * (breakProgress * 2 + 1);
            offsetY += (this.rng.randFloat() - 0.5) * (breakProgress * 2 + 1);
            ctx.fillStyle += Math.ceil(255 - breakProgress * 255)
                .toString(16)
                .padStart(2, "0");
        }

        ctx.fillStyle = tileData.colour;
        ctx.fillText(tileData.rune, x * 32 + offsetX, y * 32 + offsetY);
    }

    update() {
        for (let i = 0; i < UPDATE_PERCENT * WORLD_AREA; i++) {
            const position = this.randomPosition();
            const tile = this.getTile(position);
            switch (tile) {
                case DIRT_TILE:
                    if (this.hasNeighbour(position, GRASS_TILE)) {
                        this.setTile(position, GRASS_TILE);
                    }
            }
        }
    }
}

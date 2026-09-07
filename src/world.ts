import { Being as Being, Player } from "./being.js";
import {
    BUSHES_TILE,
    GRASS_TILE,
    GRAVEL_TILE,
    TILES,
    TREE_TILE,
    TileData,
} from "./tile.js";
import { Vector, vectorHash, vectorModulus } from "./math.js";
import { Noise } from "./random.js";

const WORLD_SIZE = 100;
const WORLD_AREA = WORLD_SIZE * WORLD_SIZE;

export class World {
    time: number = 0;
    tiles: number[][];
    beings: Record<number, Being> = {};

    static inflate(state: string): World {
        // not a world yet but it's best if typescript knows the property names
        const world = Object.setPrototypeOf(
            JSON.parse(state),
            World.prototype,
        ) as World;

        for (const being of Object.values(world.beings)) {
            Being.inflate(being);
        }

        return world as World;
    }

    constructor() {
        const noise = new Noise();
        this.tiles = [];
        for (let y = 0; y < WORLD_SIZE; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < WORLD_SIZE; x++) {
                const a = noise.simple(
                    [x * 0.2, y * 0.2],
                    [WORLD_SIZE * 0.2, WORLD_SIZE * 0.2],
                );
                if (a > 0.0) {
                    this.tiles[y][x] = GRAVEL_TILE;
                } else {
                    this.tiles[y][x] = GRASS_TILE;
                }
            }
        }

        this.scatter(GRASS_TILE, BUSHES_TILE, 0.01);
        this.scatter(GRASS_TILE, TREE_TILE, 0.01);
    }

    scatter(find: number, replace: number, percent: number) {
        for (let i = 0; i < percent * WORLD_AREA; i++) {
            const x = Math.floor(Math.random() * WORLD_SIZE);
            const y = Math.floor(Math.random() * WORLD_SIZE);

            if (this.getTile(x, y) == find) {
                this.setTile(x, y, replace);
            }
        }
    }

    getTileData(x: number, y: number): TileData {
        return TILES[this.getTile(x, y)];
    }

    getTile(x: number, y: number): number {
        [x, y] = vectorModulus([x, y], [WORLD_SIZE, WORLD_SIZE]);
        return this.tiles[y][x];
    }

    setTile(x: number, y: number, tileId: number) {
        [x, y] = vectorModulus([x, y], [WORLD_SIZE, WORLD_SIZE]);
        this.tiles[y][x] = tileId;
    }

    render(cameraPosition: Vector, ctx: CanvasRenderingContext2D) {
        const beingByPosition: Record<number, Being> = {};
        const selectedPositions: Record<number, true> = [];

        for (const being of Object.values(this.beings)) {
            const hash = vectorHash(being.position);
            const oldBeing = beingByPosition[hash];

            if (
                being.active &&
                (oldBeing === undefined || oldBeing.depth < being.depth)
            ) {
                beingByPosition[hash] = being;

                if (being instanceof Player && being.target !== undefined) {
                    selectedPositions[vectorHash(being.target)] = true;
                }
            }
        }

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, 544, 544);

        ctx.font = "26px 'Nimbus Mono PS', 'Courier New', monospace";
        ctx.textAlign = "center";
        for (let x = 0; x < 17; x++) {
            for (let y = 0; y < 17; y++) {
                const i = x + cameraPosition[0] - 8;
                const j = y + cameraPosition[1] - 8;

                const hash = vectorHash([i, j]);
                const being: Being | undefined = beingByPosition[hash];
                const tileData = this.getTileData(i, j);

                if (selectedPositions[hash] === true) {
                    ctx.fillStyle = tileData.colour + "6";
                } else {
                    ctx.fillStyle = tileData.colour + "2";
                }
                ctx.fillRect(x * 32, y * 32, 32, 32);

                if (being === undefined) {
                    ctx.fillStyle = tileData.colour;
                } else {
                    ctx.fillStyle = "#fff";
                }
                ctx.fillText(
                    being?.rune ?? tileData.rune,
                    x * 32 + 16,
                    y * 32 + 24,
                );
            }
        }
    }
}

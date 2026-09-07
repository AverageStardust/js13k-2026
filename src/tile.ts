export interface TileData {
    rune: string;
    colour: string;
    breakStrength: number;
    breakSpeed: number;
    isGround: boolean;
}

export const TILES: TileData[] = [
    { // grass
        rune: ",",
        colour: "#090",
        breakStrength: 0,
        breakSpeed: 0.3,
        isGround: true,
    },
    { // gravel
        rune: ".",
        colour: "#666",
        breakStrength: 0,
        breakSpeed: 0.3,
        isGround: true,
    },
    { // dirt
        rune: "_",
        colour: "#750",
        breakStrength: Infinity,
        breakSpeed: 0,
        isGround : true,
    },
    { // bushes
        rune: "⁂",
        colour: "#090",
        breakStrength: 0,
        breakSpeed: 0.1,
        isGround: false,
    },
    { // tree
        rune: "🌳",
        colour: "#090",
        breakStrength: 0,
        breakSpeed: 0.1,
        isGround: false,
    }
];

export const GRASS_TILE = 0;
export const GRAVEL_TILE = 1;
export const DIRT_TILE = 2;
export const BUSHES_TILE = 3;
export const TREE_TILE = 4;

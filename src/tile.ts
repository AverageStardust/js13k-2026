export interface TileData {
    rune: string;
    colour: string;
}

export const TILES: TileData[] = [
    { // grass
        rune: ",",
        colour: "#090",
    },
    { // gravel
        rune: ":",
        colour: "#666"
    },
    { // dirt
        rune: "_",
        colour: "#666"
    },
    { // bushes
        rune: "⁂",
        colour: "#090",
    },
    { // tree
        rune: "🌳",
        colour: "#090",
    }
];

export const GRASS_TILE = 0;
export const GRAVEL_TILE = 1;
export const DIRT_TILE = 2;
export const BUSHES_TILE = 3;
export const TREE_TILE = 4;

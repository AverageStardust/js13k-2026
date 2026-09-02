export interface TileData {
    char: string;
    colour: string;
}

export const TILES: TileData[] = [
    {
        char: ",",
        colour: "#090",
    },
    {
        char: "⁂",
        colour: "#090",
    },
    {
        char: "🌳",
        colour: "#090",
    }
];

export const GRASS_TILE = 0;
export const BUSHES_TILE = 1;
export const TREE_TILE = 2;

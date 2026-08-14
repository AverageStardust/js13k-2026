import { Plugin } from "vite";
import { statSync } from "fs";
import { execFileSync } from "child_process";
import ect from "ect-bin";
import path from "path";
import fs from "fs/promises";

const sizeGoal = 1024 * 13;

export default function ectPlugin(): Plugin {
    return {
        name: "vite:ect",
        writeBundle: async () => {
            try {
                await etcWriteBundle();
            } catch (err) {
                console.log("\nECT error: ", err);
            }
        },
    };
}

async function etcWriteBundle() {
    const files = await fs.readdir(path.join(__dirname, "dist"));

    const assetFiles = files
        .filter((file) => {
            return (
                !file.includes(".js") &&
                !file.includes(".css") &&
                !file.includes(".html") &&
                !file.includes(".zip") &&
                file !== "assets"
            );
        })
        .map((file) => path.join(__dirname, "dist", file));

    const args = ["-strip", "-zip", "-10009", "dist/index.html", ...assetFiles];
    const result = execFileSync(ect, args);

    console.log("\nECT result: ", result.toString().trim());

    const stats = statSync("dist/index.zip");
    const percent = Math.floor((stats.size / sizeGoal) * 1000) / 10;

    console.log(
        `\n\x1B[1;33m${stats.size}/${sizeGoal}B (${percent}%)\x1B[0m\n`,
    );
}

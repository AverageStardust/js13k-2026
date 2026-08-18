import * as path from "jsr:@std/path";

enum CliType {
    Number,
    Array,
}

const cliToApi = new Map([
    ["-Zab", { api: "numAbbreviations", type: CliType.Number }],
    ["-Zlr", { api: "recipLearningRate", type: CliType.Number }],
    ["-Zmc", { api: "modelMaxCount", type: CliType.Number }],
    ["-Zmd", { api: "modelRecipBaseCount", type: CliType.Number }],
    ["-Zpr", { api: "precision", type: CliType.Number }],
    ["-Zdy", { api: "dynamicModels", type: CliType.Number }],
    ["-Zco", { api: "contextBits", type: CliType.Number }],
    ["-S", { api: "sparseSelectors", type: CliType.Array }],
]);

function main() {
    let seconds = parseInt(prompt("Run for how many seconds?") || "", 10);
    if (isNaN(seconds)) return;

    console.log("Building...");
    const build = new Deno.Command("vite", {
        args: ["build"],
        stderr: "inherit",
    });
    if (!build.outputSync().success) Deno.exit(1);

    console.log(`Spending ${seconds} seconds optimizing...`);
    const optimize = new Deno.Command("node", {
        args: [
            "node_modules/roadroller/cli.mjs",
            path.join(import.meta.dirname, "/dist/output.js"),
            "-D",
            "-OO",
        ],
        stderr: "piped",
    });
    const optimizeProcess = optimize.spawn();

    setTimeout(() => finishOptimizing(optimizeProcess), seconds * 1000);
}

async function finishOptimizing(optimizeProcess: Deno.ChildProcess) {
    optimizeProcess.kill();

    const config = await getOptimizeConfig(optimizeProcess);
    const configPieces = config
        .split(" ")
        .filter((param) => !param.startsWith("-Sx"));

    const configObject: Record<string, unknown> = {
        allowFreeVars: true,
    };

    const digitRegex = new RegExp("\\d");

    configPieces.forEach((cliSetting) => {
        const splitIndex = digitRegex.exec(cliSetting)?.index;

        if (splitIndex !== undefined) {
            const setting = cliSetting.substring(0, splitIndex);
            const value = cliSetting.substring(splitIndex);
            const mapping = cliToApi.get(setting);

            if (mapping !== undefined) {
                configObject[mapping.api] = convertCliValue(
                    value,
                    mapping.type,
                );
            }
        }
    });

    await Deno.writeTextFile(
        path.join(import.meta.dirname, "/roadrollerConfig.json"),
        JSON.stringify(configObject),
    );

    console.log(`Best Config: ${config}`);
}

async function getOptimizeConfig(
    optimizeProcess: Deno.ChildProcess,
): Promise<string> {
    const output = new TextDecoder().decode(
        await optimizeProcess.stderr.bytes(),
    );

    let bestConfig = output
        .split("\n")
        .reverse()
        .find((line) => line.includes("<-"));

    if (bestConfig === undefined) {
        throw Error("Best config could not be found in CLI output.");
    }

    bestConfig = bestConfig.split(") ")[1];
    bestConfig = bestConfig.split(": ")[0];

    return bestConfig;
}

function convertCliValue(value: string, type: CliType): number | number[] {
    if (type === CliType.Number) {
        return parseInt(value, 10);
    } else {
        return value.split(",").map((value: string) => parseInt(value, 10));
    }
}

main();

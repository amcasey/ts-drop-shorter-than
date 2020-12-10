if (process.argv.length !== 5) {
    const path = require("path");
    console.error(`Usage: ${path.basename(process.argv[0])} ${path.basename(process.argv[1])} duration_ms in_path out_path`);
    process.exit(1);
}

const minDuration = 1000 * +process.argv[2];
const inPath = process.argv[3];
const outPath = process.argv[4];

const Parser = require("jsonparse");
const fs = require("fs");

const p = new Parser();

const writeStream = fs.createWriteStream(outPath);
writeStream.write("[\n");

let first = true;
p.onValue = function (value) {
    if (this.stack.length !== 1) return;

    if (value.ph === "X" && Number.parseFloat(value.dur) < minDuration) return;

    if (!first) {
        writeStream.write(",\n");
    }
    first = false;

    writeStream.write(JSON.stringify(value));

    if (this.mode === Parser.C.ARRAY) {
        this.value = [];
    }
}

const readStream = fs.createReadStream(inPath);
readStream.on("data", chunk => p.write(chunk));
readStream.on("end", () => writeStream.write("\n]"));

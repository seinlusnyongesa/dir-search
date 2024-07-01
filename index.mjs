import { readFile, stat, readdir } from "node:fs/promises";
import { join, resolve, sep } from "node:path";

const rgx = new RegExp(process.argv[2]);
const filenames = process.argv.slice(3);
const dir = process.cwd();

async function processFiles(filenames) {
	for (let i = 0; ; i++) {
		if (filenames.length <= 0) break;
		let name = filenames[0];
		let filepath = resolve(join(dir, name));
		filenames = filenames.slice(1);
		// console.log(filepath);
		let stats = await getStats(filepath);
		if (stats == -1) continue;
		if (stats.isDirectory()) {
			let files = await processDir(filepath);
			files = files.map((v) => name + sep + v);
			filenames = [...files, ...filenames];
			continue;
		}
		let content = await readFile(filepath, "utf8");
		if (rgx.test(content)) {
			console.log(name);
		}
	}
}

// file information
async function getStats(path) {
	let stats;
	try {
		stats = await stat(path);
	} catch (error) {
		if (error.code != "ENOENT") throw error;
		else return -1;
	}
	return stats;
}

// get all the files in a directory
async function processDir(path) {
	let files;
	try {
		files = await readdir(path);
	} catch (error) {
		if (error.code != "ENOENT") throw error;
		return [];
	}
	return files;
}

processFiles(filenames);

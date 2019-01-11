import * as fs from 'fs-extra';
import * as path from 'path';
import * as util from 'util';

export function parseNxFileName(fileName: string) {
    const isNx = fileName.match(/@\d/);
    const Nx = (fileName.match(/@(\d)x\./) || [])[1];
    const ext = path.extname(fileName);

    const ret = {
        isNx,
        ext,
        basename: path.basename(fileName, ext).split('@')[0] + ext,
        Nx: Nx ? Number(Nx).toFixed(1) + 'x' : undefined,
    };

    return ret;
}

export interface RestructurePlan {
    copyFile: Array<{ from: string, to: string }>;
    backupFile: Array<{ from: string, to: string }>;
    removeFile: string[];
    NxFolders: string[];
    files: string[];
}

export function createFileMovePlan(folder: string, filelist: string[]): RestructurePlan {
    const plan: RestructurePlan = {
        copyFile: [],
        backupFile: [],
        removeFile: [],
        NxFolders: [],
        files: []
    };

    const fileMap: {
        [k: string]: { [i: string]: string }
    } = {};

    for (let i = 0; i < filelist.length; i++) {
        const element = filelist[i];
        const fileNameInfo = parseNxFileName(element);
        const originFile = path.join(folder, element);
        const OneXfile = path.join(folder, fileNameInfo.basename);

        fileMap[OneXfile] = fileMap[OneXfile] || {};

        if (fileNameInfo.isNx) {
            plan.backupFile.push({
                from: originFile,
                to: path.join(folder, 'backup', element)
            });

            if (plan.NxFolders.indexOf(fileNameInfo.Nx!) == -1) {
                plan.NxFolders.push(fileNameInfo.Nx!);
            }

            plan.copyFile.push({
                from: originFile,
                to: path.join(folder, fileNameInfo.Nx!, fileNameInfo.basename)
            });

            plan.removeFile.push(originFile);

            fileMap[OneXfile][fileNameInfo.Nx!] = originFile;
        }
    }

    for (const key in fileMap) {
        if (fileMap.hasOwnProperty(key)) {
            const element = fileMap[key];
            if (filelist.indexOf(key) == -1) {
                const Nxs = Object.keys(element).sort(function (a, b) {
                    return parseInt(a) - parseInt(b);
                });
                if (Nxs.length) {
                    plan.copyFile.push({
                        from: element[Nxs[0]],
                        to: key
                    });
                }
            }
        }
    }

    plan.files = Object.keys(fileMap);

    return plan;
}

export async function executeRestructurePlan(folder: string, plan: RestructurePlan) {
    const copyfile = util.promisify(fs.copyFile);
    const removefile = util.promisify(fs.remove);

    for (let i = 0; i < plan.NxFolders.length; i++) {
        const element = plan.NxFolders[i];
        await fs.mkdirp(path.join(folder, element));
    }
    await fs.mkdirp(path.join(folder, 'backup'));

    for (let i = 0; i < plan.backupFile.length; i++) {
        const element = plan.backupFile[i];
        await copyfile(element.from, element.to);
    }

    for (let i = 0; i < plan.copyFile.length; i++) {
        const element = plan.copyFile[i];
        await copyfile(element.from, element.to);
    }

    for (let i = 0; i < plan.removeFile.length; i++) {
        const element = plan.removeFile[i];
        await removefile(element);
    }
}

export async function printManifest(plan: RestructurePlan) {
    plan.files.forEach(function (file) {
        console.log('-', path.join(
            path.basename(
                path.dirname(file)
            ),
            path.basename(file)).replace(/\\/, '/'));
    });
}

export async function listAllFile(folder: string): Promise<string[]> {
    const files = await fs.readdir(folder);
    const ret: string[] = [];
    for (let i = 0; i < files.length; i++) {
        const element = files[i];
        const stat = await fs.stat(path.join(folder, element));
        if (stat.isFile()) {
            ret.push(element);
        }
    }
    return ret;
}

export async function restructureFolder(folder: string) {
    const files = await listAllFile(folder);
    const plan = createFileMovePlan(folder, files);
    
    if (process.argv.indexOf('--preview') === -1) {
        await executeRestructurePlan(folder, plan);
    }

    if (process.argv.indexOf('--verbose') !== -1) {
        console.log(plan);
    }

    printManifest(plan);
}

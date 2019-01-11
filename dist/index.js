"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs-extra");
var path = require("path");
var util = require("util");
function parseNxFileName(fileName) {
    var isNx = fileName.match(/@\d/);
    var Nx = (fileName.match(/@(\d)x\./) || [])[1];
    var ext = path.extname(fileName);
    var ret = {
        isNx: isNx,
        ext: ext,
        basename: path.basename(fileName, ext).split('@')[0] + ext,
        Nx: Nx ? Number(Nx).toFixed(1) + 'x' : undefined,
    };
    return ret;
}
exports.parseNxFileName = parseNxFileName;
function createFileMovePlan(folder, filelist) {
    var plan = {
        copyFile: [],
        backupFile: [],
        removeFile: [],
        NxFolders: [],
        files: []
    };
    var fileMap = {};
    for (var i = 0; i < filelist.length; i++) {
        var element = filelist[i];
        var fileNameInfo = parseNxFileName(element);
        var originFile = path.join(folder, element);
        var OneXfile = path.join(folder, fileNameInfo.basename);
        fileMap[OneXfile] = fileMap[OneXfile] || {};
        if (fileNameInfo.isNx) {
            plan.backupFile.push({
                from: originFile,
                to: path.join(folder, 'backup', element)
            });
            if (plan.NxFolders.indexOf(fileNameInfo.Nx) == -1) {
                plan.NxFolders.push(fileNameInfo.Nx);
            }
            plan.copyFile.push({
                from: originFile,
                to: path.join(folder, fileNameInfo.Nx, fileNameInfo.basename)
            });
            plan.removeFile.push(originFile);
            fileMap[OneXfile][fileNameInfo.Nx] = originFile;
        }
    }
    for (var key in fileMap) {
        if (fileMap.hasOwnProperty(key)) {
            var element = fileMap[key];
            if (filelist.indexOf(key) == -1) {
                var Nxs = Object.keys(element).sort(function (a, b) {
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
exports.createFileMovePlan = createFileMovePlan;
function executeRestructurePlan(folder, plan) {
    return __awaiter(this, void 0, void 0, function () {
        var copyfile, removefile, i, element, i, element, i, element, i, element;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    copyfile = util.promisify(fs.copyFile);
                    removefile = util.promisify(fs.remove);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < plan.NxFolders.length)) return [3 /*break*/, 4];
                    element = plan.NxFolders[i];
                    return [4 /*yield*/, fs.mkdirp(path.join(folder, element))];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [4 /*yield*/, fs.mkdirp(path.join(folder, 'backup'))];
                case 5:
                    _a.sent();
                    i = 0;
                    _a.label = 6;
                case 6:
                    if (!(i < plan.backupFile.length)) return [3 /*break*/, 9];
                    element = plan.backupFile[i];
                    return [4 /*yield*/, copyfile(element.from, element.to)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8:
                    i++;
                    return [3 /*break*/, 6];
                case 9:
                    i = 0;
                    _a.label = 10;
                case 10:
                    if (!(i < plan.copyFile.length)) return [3 /*break*/, 13];
                    element = plan.copyFile[i];
                    return [4 /*yield*/, copyfile(element.from, element.to)];
                case 11:
                    _a.sent();
                    _a.label = 12;
                case 12:
                    i++;
                    return [3 /*break*/, 10];
                case 13:
                    i = 0;
                    _a.label = 14;
                case 14:
                    if (!(i < plan.removeFile.length)) return [3 /*break*/, 17];
                    element = plan.removeFile[i];
                    return [4 /*yield*/, removefile(element)];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16:
                    i++;
                    return [3 /*break*/, 14];
                case 17: return [2 /*return*/];
            }
        });
    });
}
exports.executeRestructurePlan = executeRestructurePlan;
function printManifest(plan) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            plan.files.forEach(function (file) {
                console.log('-', path.join(path.basename(path.dirname(file)), path.basename(file)).replace(/\\/, '/'));
            });
            return [2 /*return*/];
        });
    });
}
exports.printManifest = printManifest;
function listAllFile(folder) {
    return __awaiter(this, void 0, void 0, function () {
        var files, ret, i, element, stat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.readdir(folder)];
                case 1:
                    files = _a.sent();
                    ret = [];
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i < files.length)) return [3 /*break*/, 5];
                    element = files[i];
                    return [4 /*yield*/, fs.stat(path.join(folder, element))];
                case 3:
                    stat = _a.sent();
                    if (stat.isFile()) {
                        ret.push(element);
                    }
                    _a.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, ret];
            }
        });
    });
}
exports.listAllFile = listAllFile;
function restructureFolder(folder) {
    return __awaiter(this, void 0, void 0, function () {
        var files, plan;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, listAllFile(folder)];
                case 1:
                    files = _a.sent();
                    plan = createFileMovePlan(folder, files);
                    if (!(process.argv.indexOf('--preview') === -1)) return [3 /*break*/, 3];
                    return [4 /*yield*/, executeRestructurePlan(folder, plan)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    if (process.argv.indexOf('--verbose') !== -1) {
                        console.log(plan);
                    }
                    printManifest(plan);
                    return [2 /*return*/];
            }
        });
    });
}
exports.restructureFolder = restructureFolder;

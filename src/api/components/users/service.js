"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var in_memory_database_1 = require("../../../data-manager/in-memory-database");
function findAll() {
    return __spreadArrays(in_memory_database_1.inMemoryDb.users.all.values());
}
function getByUsername(username) {
    return in_memory_database_1.inMemoryDb.users.getByTelegramName(username);
}
function getById(id) {
    return in_memory_database_1.inMemoryDb.users.getById(+id);
}
exports["default"] = {
    findAll: findAll,
    getByUsername: getByUsername,
    getById: getById
};

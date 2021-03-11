"use strict";
exports.__esModule = true;
var service_1 = require("./service");
function findAll(req, res) {
    res.status(200).json(service_1["default"].findAll());
}
exports["default"] = {
    findAll: findAll
};

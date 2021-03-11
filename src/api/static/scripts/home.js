var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var _this = this;
var state = {
    editing: false,
    currentRow: null,
    currentRowReservedCopy: '',
    currentRowOldObject: null
};
var resetState = function () {
    state.editing = false;
    state.currentRow = null;
    state.currentRowReservedCopy = '';
    state.currentRowOldObject = null;
};
var mainBlock = document.getElementById('body');
var fetchData = function (type) { return __awaiter(_this, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, fetch("/" + type, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'text/json'
                    }
                })];
            case 1:
                data = _a.sent();
                return [2 /*return*/, data.json()];
        }
    });
}); };
function handleCancelEditRow() {
    if (state.currentRow !== null) {
        state.currentRow.innerHTML = state.currentRowReservedCopy;
    }
    resetState();
}
function handleSubmitEditing(event) {
    event.preventDefault();
    console.log('submitting');
}
function handleEditRow(rowId) {
    if (state.editing) {
        return;
    }
    state.editing = true;
    var row = document.getElementById(rowId);
    var phoneData = JSON.parse(row.childNodes[1].textContent || '');
    state.currentRow = row;
    state.currentRowReservedCopy = row.innerHTML;
    state.currentRowOldObject = phoneData;
    var form = "\n    <form onsubmit=\"handleSubmitEditing()\">\n      <div class=\"col s2\">\n        <input type=\"text\" name=\"phone\" value=\"" + phoneData.phone + "\" />\n      </div>\n      <div class=\"col s2\">\n        <input type=\"text\" name=\"department\" value=\"" + phoneData.department + "\">\n      </div>\n      <div class=\"col s4\">\n        <input type=\"text\" name=\"name\" value=\"" + phoneData.name + "\" />\n      </div>\n      <div class=\"col s1\">\n        <button class=\"waves-light btn-small\" onclick=\"handleCancelEditRow()\">\n          <i class=\"material-icons\">close</i>\n        </button>\n      </div>\n      <div class=\"col s1\">\n        <button type=\"submit\" class=\"waves-light btn-small\">\n          <i class=\"material-icons\">check</i>\n        </button>\n      </div>\n    </form>\n  ";
    row.innerHTML = form;
}
var getPhonesTable = function (phones) {
    return "\n    <div class=\"row\">\n      <div hidden>Summary</div>\n      <div class=\"col s2\"><h6>\u0422\u0435\u043B\u0435\u0444\u043E\u043D</h6></div>\n      <div class=\"col s2\"><h6>\u0412\u0456\u0434\u0434\u0456\u043B</h6></div>\n      <div class=\"col s4\"><h6>\u0406\u043C'\u044F</h6></div>\n      <div class=\"col s1\"><h6></h6></div>\n      <div class=\"col s1\"><h6></h6></div>\n    </div>\n    " + phones.reduce(function (acc, phone) {
        return (acc += "\n    <div class=\"row\" id=\"" + phone.id + "\">\n      <div hidden id=\"" + phone.id + "_\">" + JSON.stringify(phone) + "</div>\n      <div class=\"col s2\">" + phone.phone + "</div>\n      <div class=\"col s2\">" + phone.department + "</div>\n      <div class=\"col s4\">" + phone.name + "</div>\n      <div class=\"col s1\">\n        <button class=\"waves-light btn-small\" onclick=\"handleEditRow('" + phone.id + "')\">\n           <i class=\"material-icons\">edit</i> \n        </button>\n      </div>\n      <div class=\"col s1\">\n        <button class=\"waves-light btn-small\"><i class=\"material-icons\">delete</i></button>\n       </div>\n    </div>\n    ");
    }, '') + "\n  ";
};
var getBirthdaysTable = function (birthdays) {
    return "\n  <table>\n    <thead>\n      <tr>\n        <th hidden>Id</td>\n        <th>\u0406\u043C'\u044F</td>\n        <th>\u0414\u0435\u043D\u044C</td>\n        <th>\u041C\u0456\u0441\u044F\u0446\u044C</td>\n        <th>\u0420\u0456\u043A</td>\n      </tr>\n    </thead>\n    <tbody>\n      " + birthdays.reduce(function (acc, birthday) {
        return (acc += "\n      <tr>\n        <td hidden>" + birthday.id + "</td>\n        <td>" + birthday.name + "</td>\n        <td>" + birthday.day + "</td>\n        <td>" + birthday.month + "</td>\n        <td>" + birthday.year + "</td>\n      </tr>\n      ");
    }, '') + "\n    </tbody>\n  </table>\n  ";
};
var getUsersTable = function (users) {
    return "\n  <table>\n    <thead>\n      <tr>\n        <th hidden>Id</td>\n        <th>\u0406\u043C'\u044F</td>\n        <th>\u041F\u0440\u0456\u0437\u0432\u0438\u0449\u0435</td>\n        <th>\u042E\u0437\u0435\u0440\u043D\u0435\u0439\u043C</td>\n        <th>\u0410\u0434\u043C\u0456\u043D\u0456\u0441\u0442\u0440\u0430\u0442\u043E\u0440</td>\n        <th>\u0414\u0430\u0442\u0430 \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u043D\u044F</td>\n      </tr>\n    </thead>\n    <tbody>\n      " + users.reduce(function (acc, user) {
        return (acc += "\n      <tr>\n        <td hidden>" + user.id + "</td>\n        <td>" + user.firstName + "</td>\n        <td>" + user.lastName + "</td>\n        <td>" + user.userName + "</td>\n        <td>" + user.isAdmin + "</td>\n        <td>" + user.date + "</td>\n      </tr>\n      ");
    }, '') + "\n    </tbody>\n  </table>\n  ";
};
var emptyBlock = function (block) { return (block.innerHTML = ''); };
var createDataSelector = function (usersButton, phonesButton, birthdaysButton) {
    var dataBlock = document.getElementById('data');
    return {
        value: '',
        setCurrentOption: function (value) {
            if (this.value === value) {
                return;
            }
            this.value = value;
            resetState();
            switch (value) {
                case 'phones':
                    usersButton.checked = false;
                    phonesButton.checked = true;
                    birthdaysButton.checked = false;
                    emptyBlock(dataBlock);
                    fetchData('phones')
                        .then(function (data) {
                        var phones = data;
                        return getPhonesTable(phones);
                    })
                        .then(function (table) { return (dataBlock.innerHTML = table); });
                    break;
                case 'birthdays':
                    usersButton.checked = false;
                    phonesButton.checked = false;
                    birthdaysButton.checked = true;
                    emptyBlock(dataBlock);
                    fetchData('birthdays')
                        .then(function (data) {
                        var birthdays = data;
                        return getBirthdaysTable(birthdays);
                    })
                        .then(function (table) { return (dataBlock.innerHTML = table); });
                    break;
                default:
                    usersButton.checked = true;
                    phonesButton.checked = false;
                    birthdaysButton.checked = false;
                    emptyBlock(dataBlock);
                    fetchData('users')
                        .then(function (data) {
                        var users = data;
                        return getUsersTable(users);
                    })
                        .then(function (table) { return (dataBlock.innerHTML = table); });
                    break;
            }
        }
    };
};
var refreshTokens = function () {
    fetch('/auth/refresh', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: localStorage.refreshToken })
    })
        .then(function (res) { return res.json(); })
        .then(function (res) {
        var accessToken = res.accessToken, refreshToken = res.refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        getContent();
    })["catch"](function (error) {
        console.error('something went wrong');
        console.error(error.message);
    });
};
var addDataSelectorListeners = function () {
    var usersButton = document.getElementById('data-selector__users');
    var phonesButton = document.getElementById('data-selector__phones');
    var birthdaysButton = document.getElementById('data-selector__birthdays');
    var dataManager = createDataSelector(usersButton, phonesButton, birthdaysButton);
    usersButton.addEventListener('change', function () { return dataManager.setCurrentOption('users'); });
    phonesButton.addEventListener('change', function () { return dataManager.setCurrentOption('phones'); });
    birthdaysButton.addEventListener('change', function () { return dataManager.setCurrentOption('birthdays'); });
    dataManager.setCurrentOption('phones');
};
function getContent() {
    fetch('/', {
        method: 'POST',
        headers: {
            authorization: "Bearer " + localStorage.accessToken
        }
    })
        .then(function (res) {
        if (res.status === 401) {
            window.location.replace('/auth/login');
            throw 401;
        }
        else if (res.status === 403) {
            refreshTokens();
            throw 403;
        }
        return res;
    })
        .then(function (res) { return res.text(); })
        .then(function (res) {
        mainBlock.innerHTML = res;
        addDataSelectorListeners();
    })["catch"](function (e) {
        console.error({ e: e });
    });
}
getContent();

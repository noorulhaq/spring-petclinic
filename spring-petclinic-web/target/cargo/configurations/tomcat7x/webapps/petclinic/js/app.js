function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    };

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    var i;
    for (i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
            message += '\n- '+ conditions[i].message();
    }
    return message;
}

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var condition, branchDataObject, value;
    var array = [];
    var length = branchDataConditionArray.length;
    for (condition = 0; condition < length; condition++) {
        branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var line;
    var json = '';
    for (line in branchData) {
        if (isNaN(line))
            continue;
        if (json !== '')
            json += ',';
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    var line, branchDataJSON, conditionIndex, condition;
    for (line in jsonObject) {
        branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}

function jscoverage_parseCoverageJSON(data) {
    var result = {};
    var json = eval('(' + data + ')');
    var file;
    for (file in json) {
        var fileCoverage = json[file];
        result[file] = {};
        result[file].lineData = fileCoverage.lineData;
        result[file].functionData = fileCoverage.functionData;
        result[file].branchData = convertBranchDataLinesFromJSON(fileCoverage.branchData);
    }
    return result;
}

function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
if (typeof(_$jscoverage) === "undefined" && (typeof(Storage) !== "undefined") && typeof(localStorage["jscover"]) !== "undefined")
    _$jscoverage = jscoverage_parseCoverageJSON(localStorage["jscover"]);
if (typeof(jscoverbeforeunload) === "undefined") {
    var jscoverbeforeunload = (window.onbeforeunload) ? window.onbeforeunload : function () {};
    window.onbeforeunload = function () {
        jscoverbeforeunload();
        if ((typeof(_$jscoverage) !== "undefined") && (typeof(Storage) !== "undefined"))
            localStorage["jscover"] = jscoverage_serializeCoverageToJSON();
    };
}
var jsCover_isolateBrowser = false;
if (!jsCover_isolateBrowser) {
    try {
        if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
            // this is a browser window that was opened from another window

            if (!top.opener._$jscoverage) {
                top.opener._$jscoverage = {};
            }
        }
    } catch (e) {
    }

    try {
        if (typeof top === 'object' && top !== null) {
            // this is a browser window

            try {
                if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
                    top._$jscoverage = top.opener._$jscoverage;
                }
            } catch (e) {
            }

            if (!top._$jscoverage) {
                top._$jscoverage = {};
            }
        }
    } catch (e) {
    }

    try {
        if (typeof top === 'object' && top !== null && top._$jscoverage) {
            this._$jscoverage = top._$jscoverage;
        }
    } catch (e) {
    }
}
if (!this._$jscoverage) {
    this._$jscoverage = {};
}
if (! _$jscoverage['/main/webapp/js/app.js']) {
  _$jscoverage['/main/webapp/js/app.js'] = {};
  _$jscoverage['/main/webapp/js/app.js'].lineData = [];
  _$jscoverage['/main/webapp/js/app.js'].lineData[1] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[5] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[6] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[9] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[11] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[13] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[45] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[56] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[57] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[58] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[59] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[60] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[61] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[62] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[63] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[64] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[65] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[68] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[69] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[70] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[71] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[72] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[73] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[74] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[78] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[79] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[80] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[81] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[84] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[89] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[91] = 0;
  _$jscoverage['/main/webapp/js/app.js'].lineData[92] = 0;
}
if (! _$jscoverage['/main/webapp/js/app.js'].functionData) {
  _$jscoverage['/main/webapp/js/app.js'].functionData = [];
  _$jscoverage['/main/webapp/js/app.js'].functionData[0] = 0;
  _$jscoverage['/main/webapp/js/app.js'].functionData[1] = 0;
  _$jscoverage['/main/webapp/js/app.js'].functionData[2] = 0;
  _$jscoverage['/main/webapp/js/app.js'].functionData[3] = 0;
  _$jscoverage['/main/webapp/js/app.js'].functionData[4] = 0;
}
if (! _$jscoverage['/main/webapp/js/app.js'].branchData) {
  _$jscoverage['/main/webapp/js/app.js'].branchData = {};
}
_$jscoverage['/main/webapp/js/app.js'].lineData[1]++;
var app = angular.module('spring-petclinic', ['ui.router', 'ui.router.stateHelper', 'ngAnimate', 'ngCookies', 'ngResource', 'ngMockE2E', 'ngStorage']);
_$jscoverage['/main/webapp/js/app.js'].lineData[5]++;
app.constant('useMockData', false);
_$jscoverage['/main/webapp/js/app.js'].lineData[6]++;
app.constant('context', '/petclinic-api');
_$jscoverage['/main/webapp/js/app.js'].lineData[9]++;
app.config(['stateHelperProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', function(stateHelperProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
  _$jscoverage['/main/webapp/js/app.js'].functionData[0]++;
  _$jscoverage['/main/webapp/js/app.js'].lineData[11]++;
  $urlRouterProvider.otherwise("/");
  _$jscoverage['/main/webapp/js/app.js'].lineData[13]++;
  $urlMatcherFactoryProvider.strictMode(false);
  _$jscoverage['/main/webapp/js/app.js'].lineData[45]++;
  stateHelperProvider.state({
  name: "landing", 
  url: "/", 
  templateUrl: "components/landing/landing.html", 
  controller: "MainController", 
  data: {
  requireLogin: false}}).state({
  name: "dashboard", 
  url: "/dashboard", 
  templateUrl: "components/dashboard/dashboard.html", 
  controller: "DashboardController", 
  data: {
  requireLogin: true}}).state({
  name: "vets", 
  url: "/vets", 
  templateUrl: "components/veterinarians/veterinarians.html", 
  controller: "VeterinarianController", 
  data: {
  requireLogin: true}}).state({
  name: "pets", 
  url: "/pets", 
  templateUrl: "components/pets/pets.html", 
  controller: "PetController", 
  data: {
  requireLogin: true}}).state({
  name: "owners", 
  url: "/owners", 
  templateUrl: "components/owners/owners.html", 
  controller: "OwnerController", 
  data: {
  requireLogin: true}}).state({
  name: "ownerDetails", 
  url: "/owners/:id", 
  templateUrl: "components/owners/owner_details.html", 
  controller: "OwnerDetailsController", 
  data: {
  requireLogin: true}});
}]);
_$jscoverage['/main/webapp/js/app.js'].lineData[56]++;
app.controller('MainController', MainController);
_$jscoverage['/main/webapp/js/app.js'].lineData[57]++;
app.controller('DashboardController', DashboardController);
_$jscoverage['/main/webapp/js/app.js'].lineData[58]++;
app.controller('VeterinarianController', VeterinarianController);
_$jscoverage['/main/webapp/js/app.js'].lineData[59]++;
app.controller('PetController', PetController);
_$jscoverage['/main/webapp/js/app.js'].lineData[60]++;
app.controller('PetDetailsController', PetDetailsController);
_$jscoverage['/main/webapp/js/app.js'].lineData[61]++;
app.controller('OwnerController', OwnerController);
_$jscoverage['/main/webapp/js/app.js'].lineData[62]++;
app.controller('OwnerDetailsController', OwnerDetailsController);
_$jscoverage['/main/webapp/js/app.js'].lineData[63]++;
app.controller('AddOwnerController', AddOwnerController);
_$jscoverage['/main/webapp/js/app.js'].lineData[64]++;
app.controller('VisitController', VisitController);
_$jscoverage['/main/webapp/js/app.js'].lineData[65]++;
app.controller('SearchController', SearchController);
_$jscoverage['/main/webapp/js/app.js'].lineData[68]++;
app.factory('Owner', Owner);
_$jscoverage['/main/webapp/js/app.js'].lineData[69]++;
app.factory('Pet', Pet);
_$jscoverage['/main/webapp/js/app.js'].lineData[70]++;
app.factory('OwnerPet', OwnerPet);
_$jscoverage['/main/webapp/js/app.js'].lineData[71]++;
app.factory('Vet', Vet);
_$jscoverage['/main/webapp/js/app.js'].lineData[72]++;
app.factory('Visit', Visit);
_$jscoverage['/main/webapp/js/app.js'].lineData[73]++;
app.factory('PetType', PetType);
_$jscoverage['/main/webapp/js/app.js'].lineData[74]++;
app.factory('MockService', MockService);
_$jscoverage['/main/webapp/js/app.js'].lineData[78]++;
app.directive('scrollToTarget', function() {
  _$jscoverage['/main/webapp/js/app.js'].functionData[1]++;
  _$jscoverage['/main/webapp/js/app.js'].lineData[79]++;
  return function(scope, element) {
  _$jscoverage['/main/webapp/js/app.js'].functionData[2]++;
  _$jscoverage['/main/webapp/js/app.js'].lineData[80]++;
  element.bind('click', function() {
  _$jscoverage['/main/webapp/js/app.js'].functionData[3]++;
  _$jscoverage['/main/webapp/js/app.js'].lineData[81]++;
  angular.element('html, body').stop().animate({
  scrollTop: angular.element(angular.element(element).attr('href')).offset().top - 20}, 1500);
  _$jscoverage['/main/webapp/js/app.js'].lineData[84]++;
  return false;
});
};
});
_$jscoverage['/main/webapp/js/app.js'].lineData[89]++;
app.directive('datePicker', DatePickerDirective);
_$jscoverage['/main/webapp/js/app.js'].lineData[91]++;
app.run(function(useMockData, MockService) {
  _$jscoverage['/main/webapp/js/app.js'].functionData[4]++;
  _$jscoverage['/main/webapp/js/app.js'].lineData[92]++;
  MockService.mock(useMockData);
});

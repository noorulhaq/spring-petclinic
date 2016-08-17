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
if (! _$jscoverage['/main/webapp/services/services.js']) {
  _$jscoverage['/main/webapp/services/services.js'] = {};
  _$jscoverage['/main/webapp/services/services.js'].lineData = [];
  _$jscoverage['/main/webapp/services/services.js'].lineData[1] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[2] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[5] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[6] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[9] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[10] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[13] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[14] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[17] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[18] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[21] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[22] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[25] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[26] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[29] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[30] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[32] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[33] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[40] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[41] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[42] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[43] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[44] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[45] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[46] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[47] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[48] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[49] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[50] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[52] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[53] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[54] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[57] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[58] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[59] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[60] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[61] = 0;
  _$jscoverage['/main/webapp/services/services.js'].lineData[62] = 0;
}
if (! _$jscoverage['/main/webapp/services/services.js'].functionData) {
  _$jscoverage['/main/webapp/services/services.js'].functionData = [];
  _$jscoverage['/main/webapp/services/services.js'].functionData[0] = 0;
  _$jscoverage['/main/webapp/services/services.js'].functionData[1] = 0;
  _$jscoverage['/main/webapp/services/services.js'].functionData[2] = 0;
  _$jscoverage['/main/webapp/services/services.js'].functionData[3] = 0;
  _$jscoverage['/main/webapp/services/services.js'].functionData[4] = 0;
  _$jscoverage['/main/webapp/services/services.js'].functionData[5] = 0;
  _$jscoverage['/main/webapp/services/services.js'].functionData[6] = 0;
  _$jscoverage['/main/webapp/services/services.js'].functionData[7] = 0;
  _$jscoverage['/main/webapp/services/services.js'].functionData[8] = 0;
}
if (! _$jscoverage['/main/webapp/services/services.js'].branchData) {
  _$jscoverage['/main/webapp/services/services.js'].branchData = {};
  _$jscoverage['/main/webapp/services/services.js'].branchData['32'] = [];
  _$jscoverage['/main/webapp/services/services.js'].branchData['32'][1] = new BranchData();
}
_$jscoverage['/main/webapp/services/services.js'].branchData['32'][1].init(145, 11, 'useMockData');
function visit13_32_1(result) {
  _$jscoverage['/main/webapp/services/services.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/main/webapp/services/services.js'].lineData[1]++;
var Owner = ['$resource', 'context', function($resource, context) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[0]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[2]++;
  return $resource(context + '/api/owners/:id');
}];
_$jscoverage['/main/webapp/services/services.js'].lineData[5]++;
var OwnerPet = ['$resource', 'context', function($resource, context) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[1]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[6]++;
  return $resource(context + '/api/owners/:ownerId/pets', {
  ownerId: '@ownerId'});
}];
_$jscoverage['/main/webapp/services/services.js'].lineData[9]++;
var Pet = ['$resource', 'context', function($resource, context) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[2]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[10]++;
  return $resource(context + '/api/pets/:id');
}];
_$jscoverage['/main/webapp/services/services.js'].lineData[13]++;
var Vet = ['$resource', 'context', function($resource, context) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[3]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[14]++;
  return $resource(context + '/api/vets/:vetId');
}];
_$jscoverage['/main/webapp/services/services.js'].lineData[17]++;
var Visit = ['$resource', 'context', function($resource, context) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[4]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[18]++;
  return $resource(context + '/api/pets/:petId/visits', {
  petId: '@id'});
}];
_$jscoverage['/main/webapp/services/services.js'].lineData[21]++;
var PetType = ['$resource', 'context', function($resource, context) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[5]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[22]++;
  return $resource(context + '/api/pets/types');
}];
_$jscoverage['/main/webapp/services/services.js'].lineData[25]++;
var MockService = ['$httpBackend', '$http', '$q', 'context', function($httpBackend, $http, $q, context) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[6]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[26]++;
  return {
  mock: function(useMockData) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[7]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[29]++;
  var passThroughRegex = new RegExp('/static/mock-data/|components/');
  _$jscoverage['/main/webapp/services/services.js'].lineData[30]++;
  $httpBackend.whenGET(passThroughRegex).passThrough();
  _$jscoverage['/main/webapp/services/services.js'].lineData[32]++;
  if (visit13_32_1(useMockData)) {
    _$jscoverage['/main/webapp/services/services.js'].lineData[33]++;
    $q.defer();
    _$jscoverage['/main/webapp/services/services.js'].lineData[40]++;
    $q.all([$http.get(context + '/static/mock-data/pets.json'), $http.get(context + '/static/mock-data/vets.json'), $http.get(context + '/static/mock-data/owners.json'), $http.get(context + '/static/mock-data/owner_one.json'), $http.get(context + '/static/mock-data/pettypes.json')]).then(function(data) {
  _$jscoverage['/main/webapp/services/services.js'].functionData[8]++;
  _$jscoverage['/main/webapp/services/services.js'].lineData[41]++;
  console.log("Mocking /api/pets");
  _$jscoverage['/main/webapp/services/services.js'].lineData[42]++;
  $httpBackend.whenGET(context + '/api/pets').respond(data[0].data);
  _$jscoverage['/main/webapp/services/services.js'].lineData[43]++;
  console.log("Mocking /api/vets");
  _$jscoverage['/main/webapp/services/services.js'].lineData[44]++;
  $httpBackend.whenGET(context + '/api/vets').respond(data[1].data);
  _$jscoverage['/main/webapp/services/services.js'].lineData[45]++;
  console.log("Mocking /api/owners");
  _$jscoverage['/main/webapp/services/services.js'].lineData[46]++;
  $httpBackend.whenGET(context + '/api/owners').respond(data[2].data);
  _$jscoverage['/main/webapp/services/services.js'].lineData[47]++;
  console.log("Mocking /api/owners/1");
  _$jscoverage['/main/webapp/services/services.js'].lineData[48]++;
  $httpBackend.whenGET(context + '/api/owners/1').respond(data[3].data);
  _$jscoverage['/main/webapp/services/services.js'].lineData[49]++;
  console.log("Mocking /api/pets/types");
  _$jscoverage['/main/webapp/services/services.js'].lineData[50]++;
  $httpBackend.whenGET(context + '/api/pets/types').respond(data[4].data);
  _$jscoverage['/main/webapp/services/services.js'].lineData[52]++;
  console.log("Setting up passthrough for other urls");
  _$jscoverage['/main/webapp/services/services.js'].lineData[53]++;
  var passThroughRegex = new RegExp('/');
  _$jscoverage['/main/webapp/services/services.js'].lineData[54]++;
  $httpBackend.whenGET(passThroughRegex).passThrough();
});
  } else {
    _$jscoverage['/main/webapp/services/services.js'].lineData[57]++;
    console.log("Setting up passthrough for other urls");
    _$jscoverage['/main/webapp/services/services.js'].lineData[58]++;
    var passThroughRegex = new RegExp('/');
    _$jscoverage['/main/webapp/services/services.js'].lineData[59]++;
    $httpBackend.whenGET(passThroughRegex).passThrough();
    _$jscoverage['/main/webapp/services/services.js'].lineData[60]++;
    $httpBackend.whenPOST(passThroughRegex).passThrough();
    _$jscoverage['/main/webapp/services/services.js'].lineData[61]++;
    $httpBackend.whenPUT(passThroughRegex).passThrough();
    _$jscoverage['/main/webapp/services/services.js'].lineData[62]++;
    $httpBackend.whenDELETE(passThroughRegex).passThrough();
  }
}};
}];

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
if (! _$jscoverage['/main/webapp/components/owners/OwnerController.js']) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'] = {};
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData = [];
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[1] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[2] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[3] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[8] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[11] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[13] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[14] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[15] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[17] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[18] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[19] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[21] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[22] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[23] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[26] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[27] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[28] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[31] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[32] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[33] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[34] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[35] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[36] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[43] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[45] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[47] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[48] = 0;
}
if (! _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData = [];
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[0] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[1] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[2] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[3] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[4] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[5] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[6] = 0;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[7] = 0;
}
if (! _$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData = {};
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData['33'] = [];
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData['34'] = [];
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData['34'][1] = new BranchData();
}
_$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData['34'][1].init(7, 36, '$scope.currentOwner.pets[i].id == id');
function visit4_34_1(result) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData['33'][1].init(50, 35, 'i < $scope.currentOwner.pets.length');
function visit2_33_1(result) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[1]++;
var OwnerController = ['$scope', '$state', 'Owner', function($scope, $state, Owner) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[0]++;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[2]++;
  $scope.$on('$viewContentLoaded', function(event) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[1]++;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[3]++;
  $('html, body').animate({
  scrollTop: $("#owners").offset().top}, 1000);
});
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[8]++;
  $scope.owners = Owner.query();
}];
_$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[11]++;
var OwnerDetailsController = ['$scope', '$rootScope', '$stateParams', 'Owner', function($scope, $rootScope, $stateParams, Owner) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[2]++;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[13]++;
  var currentId = $stateParams.id;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[14]++;
  var nextId = parseInt($stateParams.id) + 1;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[15]++;
  var prevId = parseInt($stateParams.id) - 1;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[17]++;
  $scope.prevOwner = Owner.get({
  id: prevId});
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[18]++;
  $scope.nextOwner = Owner.get({
  id: nextId});
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[19]++;
  $scope.currentOwner = Owner.get($stateParams);
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[21]++;
  $scope.saveOwner = function() {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[3]++;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[22]++;
  owner = $scope.currentOwner;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[23]++;
  Owner.save(owner);
};
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[26]++;
  $scope.addPet = function() {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[4]++;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[27]++;
  $scope.petFormHeader = "Add a new Pet";
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[28]++;
  $scope.currentPet = {
  type: {}};
};
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[31]++;
  $scope.editPet = function(id) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[5]++;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[32]++;
  $scope.petFormHeader = "Edit Pet";
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[33]++;
  for (i = 0; visit2_33_1(i < $scope.currentOwner.pets.length); i++) {
    _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[34]++;
    if (visit4_34_1($scope.currentOwner.pets[i].id == id)) {
      _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[35]++;
      $scope.currentPet = $scope.currentOwner.pets[i];
      _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[36]++;
      break;
    }
  }
};
}];
_$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[43]++;
var AddOwnerController = ['$scope', 'Owner', function($scope, Owner) {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[6]++;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[45]++;
  $scope.owner = {
  id: 0, 
  pets: []};
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[47]++;
  $scope.addOwner = function() {
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].functionData[7]++;
  _$jscoverage['/main/webapp/components/owners/OwnerController.js'].lineData[48]++;
  Owner.save($scope.owner);
};
}];

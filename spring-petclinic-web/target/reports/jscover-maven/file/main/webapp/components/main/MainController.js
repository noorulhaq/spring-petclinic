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
if (! _$jscoverage['/main/webapp/components/main/MainController.js']) {
  _$jscoverage['/main/webapp/components/main/MainController.js'] = {};
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData = [];
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[1] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[3] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[5] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[6] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[9] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[10] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[11] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[14] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[15] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[16] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[19] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[20] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[21] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[23] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[27] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[49] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[51] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[53] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[55] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[56] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[58] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[59] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[60] = 0;
}
if (! _$jscoverage['/main/webapp/components/main/MainController.js'].functionData) {
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData = [];
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[0] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[1] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[2] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[3] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[4] = 0;
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[5] = 0;
}
if (! _$jscoverage['/main/webapp/components/main/MainController.js'].branchData) {
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData = {};
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData['20'] = [];
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData['58'] = [];
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData['58'][2] = new BranchData();
}
_$jscoverage['/main/webapp/components/main/MainController.js'].branchData['58'][2].init(72, 27, '$scope.getSession() == null');
function visit4_58_2(result) {
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData['58'][2].ranCondition(result);
  return result;
}_$jscoverage['/main/webapp/components/main/MainController.js'].branchData['58'][1].init(56, 43, 'requireLogin && $scope.getSession() == null');
function visit3_58_1(result) {
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/main/webapp/components/main/MainController.js'].branchData['20'][1].init(7, 27, '$scope.getSession() == null');
function visit2_20_1(result) {
  _$jscoverage['/main/webapp/components/main/MainController.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/main/webapp/components/main/MainController.js'].lineData[1]++;
var MainController = ['$scope', '$rootScope', '$state', '$sessionStorage', 'context', function($scope, $rootScope, $state, $sessionStorage, context) {
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[0]++;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[3]++;
  $scope.$storage = $sessionStorage;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[5]++;
  $scope.getSession = function() {
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[1]++;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[6]++;
  return $scope.$storage.session;
};
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[9]++;
  $scope.login = function() {
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[2]++;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[10]++;
  $scope.$storage.session = {
  'username': 'test'};
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[11]++;
  $state.go('dashboard');
};
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[14]++;
  $scope.logout = function() {
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[3]++;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[15]++;
  $scope.$storage.session = null;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[16]++;
  $state.go('landing');
};
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[19]++;
  $scope.goHome = function() {
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[4]++;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[20]++;
  if (visit2_20_1($scope.getSession() == null)) {
    _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[21]++;
    $state.go('landing');
  } else {
    _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[23]++;
    $state.go('dashboard');
  }
};
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[27]++;
  $scope.menuTabs = [{
  'name': 'Main Page', 
  'url': '#', 
  'font': 'fa fa-home'}, {
  'name': 'Services', 
  'url': '#services', 
  'font': 'fa fa-eyedropper'}, {
  'name': 'Pets', 
  'url': '#pets', 
  'font': 'fa fa-paw'}, {
  'name': 'Veterinarians', 
  'url': '#vets', 
  'font': 'fa fa-user'}, {
  'name': 'About', 
  'url': '#about', 
  'font': 'fa fa-question'}];
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[49]++;
  $scope.context = context;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[51]++;
  $scope.footerText = '\xa9 ' + new Date().getFullYear() + ' Pet Clinic, A Spring Framework Demonstration';
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[53]++;
  $rootScope.$state = $state;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[55]++;
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
  _$jscoverage['/main/webapp/components/main/MainController.js'].functionData[5]++;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[56]++;
  var requireLogin = toState.data.requireLogin;
  _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[58]++;
  if (visit3_58_1(requireLogin && visit4_58_2($scope.getSession() == null))) {
    _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[59]++;
    event.preventDefault();
    _$jscoverage['/main/webapp/components/main/MainController.js'].lineData[60]++;
    $state.go('landing');
  }
});
}];

'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, socket, $location) {

  $scope.$watch(function() { return $location.path() }, function() {
  
        if($location.path().indexOf('/build') > -1){
            $scope.activeNav = 'build';
            return true;
        }

        if($location.path().indexOf('/watch') > -1){
            $scope.activeNav = 'watch';
            return true;
        }
  });

  })./******************** END AppCtrl ********************************
  *********************************************************************/
  controller('RuleBuilderCtrl', function ($scope, $routeParams, $http, $modal) {

  var rule_id = $routeParams.id;
  $scope.row = {};
  $scope.rule = {};
  $scope.slider = false;
  $scope.rulesList = [];
  $scope.alarmsAttributes = [];
  $scope.toggleSlider = function(){
  $scope.slider = ($scope.slider) ? false : true;
  }
  $scope.toggleRowChecked = function(attribute){
    $scope.row[attribute] = ($scope.row[attribute] != 'checked') ? 'checked' : '';
  }
  $scope.submit = function() {

    $http({
      method  : 'POST',
      data    : $scope.rule,
      url     : '/api/alarm/submit',
      headers : {'Content-Type': 'application/json'}
    }).
    success(function (data, status, headers, config) {
      if(data=='ok'){

  $scope.rule = {};
        var modalInstance = $modal.open({
          templateUrl: 'modalContent.html',
          controller: ModalInstanceCtrl
        });
      }
      
    }).
    error(function (data, status, headers, config) {
      console.log('error');
    });

  }
  var ModalInstanceCtrl = function ($scope, $modalInstance) {
    $scope.ok = function () {
      $modalInstance.close();
    };
  };

    $http({
      method  : 'GET',
      data    : {},
      url     : '/api/ticket/alarm_codes',
      headers : {'Content-Type': 'application/json'}
    }).
    success(function (data, status, headers, config) {
      $scope.rulesList = data;
    }).
    error(function (data, status, headers, config) {
      console.log('error');
    });
    if(rule_id){
      $http({
        method  : 'POST',
        data    : {id:rule_id},
        url     : '/api/alarm/attributes',
        headers : {'Content-Type': 'application/json'}
      }).
      success(function (data, status, headers, config) {
        $scope.alarmsAttributes = data._source;
        $scope.message = data._source.message;  
        $scope.alarmsAttributes = Object.keys($scope.alarmsAttributes); 
        $scope.attriLength   = $scope.alarmsAttributes.length;
        $scope.alarmsAttributesJSON = {};
        for(var i = 0 ; i < $scope.alarmsAttributes ;i++){
            $scope.alarmsAttributesJSON.alarmsAttributes[i] = false;
        }
        
      }).
      error(function (data, status, headers, config) {
        console.log('error');
      });

    }

  
  })./******************** END RuleBuilderCtrl ************************
  *********************************************************************/
  controller('ActivityWatcherCtrl', function ($scope, $http, socket, Moment, $modal) {
    /* ALARMS HANDLING */
    $scope.alarmList = [];
    $scope.incidentList = [];

    var alarm_fieldDefs = [{field:'protocol', displayName:'Protocol'}, {field:'syslogtype', displayName:'Log Type'}, {field:'timestamp', displayName:'Datetime', cellTemplate:'<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field]*1000|date:"M/d/yyyy hh:mm a"}}</span></div>'}, {field:'ipaddress', displayName:'IP Address'}, {field:'hostname', displayName:'Host'}, {field:'tag', displayName:'Tag'},{field:'content', displayName:'Message', cellTemplate:'<div class="ngCellText" ng-class="col.colIndex()" title="{{row.entity[col.field]}}"><span ng-cell-text>{{row.entity[col.field]}}</span></div>'} ];
    
    var incident_fieldDefs = [{field:'web_incident_id', displayName:'Incident ID'}, {field:'slmlookuptblkeyword', displayName:'Keyword'}, {field:'reported_date', displayName:'Reported Date', cellTemplate:'<div class="ngCellText" ng-class="col.colIndex()"><span ng-cell-text>{{row.entity[col.field]*1000|date:"M/d/yyyy hh:mm a"}}</span></div>'}, {field:'company', displayName:'Company'}, {field:'city', displayName:'City'}, {field:'priority', displayName:'priority'}, {field:'description', displayName:'Description'}];

    /**********/

    $http({
      method: 'POST',
      data: {},
      url: '/api/alarms/list',
      headers : {'Content-Type': 'application/json'}
    }).
    success(function (data, status, headers, config) {
      $scope.alarmList = data;
    }).
    error(function (data, status, headers, config) {
      console.log('error');
    });

    /**********/

    socket.on('send:alarm', function (data) {
      $scope.alarmList = data;
    });

/*******************************************************************************************************/

    $scope.incidentGridOptions = {
      data: 'incidentList',
      enableColumnResize: true,
      enableSorting: true,
      plugins: [new ngGridFlexibleHeightPlugin()],
        rowTemplate:'<div ng-click="showAlarms(row.getProperty(\'web_incident_id\'))" ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell">' +
                   '<div class="ngVerticalBar" ng-class="{ ngVerticalBarVisible: !$last }"> </div>' +
                   '<div ng-cell></div>' +
                   '</div>',
      columnDefs:incident_fieldDefs
    };

    /**********/

    $http({
      method: 'POST',
      data: {},
      url: '/api/incidents/list',
      headers : {'Content-Type': 'application/json'}
    }).
    success(function (data, status, headers, config) {
      $scope.incidentList = data;
    }).
    error(function (data, status, headers, config) {
      console.log('error');
    });

    /**********/

    socket.on('send:ticket', function (data) {
      $scope.incidentList = data;
    });

/*******************************************************************************/
$scope.selectedIncident = '';

  $scope.showAlarms = function (incidentID) {
    $scope.selectedIncident = incidentID;
    var modalInstance = $modal.open({
      templateUrl: 'modalContent.html',
      controller: ModalInstanceCtrl,
      resolve: {
        incidentID: function () {
          return $scope.selectedIncident;
        }}
    });
  };

var ModalInstanceCtrl = function ($scope, $modalInstance, incidentID) {

    /**********/
    $scope.selectedIncident = incidentID;
    $http({
      method: 'POST',
      data: {incidentID: incidentID},
      url: '/api/incident/alarms',
      headers : {'Content-Type': 'application/json'}
    }).
    success(function (data, status, headers, config) {
      $scope.incidentAlarms = data;
    }).
    error(function (data, status, headers, config) {
      console.log('error');
    });

    /**********/

  $scope.ok = function () {
    $modalInstance.close();
  };

};


  }).controller('CorrelationConstructorCtrl', function($scope){
    $scope.testVals = '';
    $scope.pushVals = function(index){
      var testVars = ['linkdown->connectivity\n', 'SNMP->connectivity\n', 'ICMP->connectivity\n'];
      $scope.testVals = $scope.testVals + testVars[index];
    }

  });
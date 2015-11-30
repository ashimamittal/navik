﻿﻿﻿angular.module('DecisionWorkbench')
.controller("filterOuterController", function($scope, $rootScope, sharedProperties){
    //Triggered when the filter.htm is included by angular
	$scope.$on('$includeContentLoaded', function () {
        console.log('Content included !!!!');
        
//        var dragDrop = $("#fieldChooser");
//		var dragDrop1 = $("#fieldChooser1");
//		var scroller = $("#scroller, .DragDropContainer, .DragDropContainer1");
//		//Drag and drop setting

//		if (dragDrop.length > 0) {
//			var sourceFields = dragDrop.find("#sourceFields");
//			var destinationFields = dragDrop.find("#destinationFields");
//			userGroupChooser = dragDrop.fieldChooser(sourceFields, destinationFields);
//		};

//		if (dragDrop1.length > 0) {
//			var sourceFields1 = dragDrop1.find("#sourceFields1");
//			var destinationFields1 = dragDrop1.find("#destinationFields1");
//			var convActivityChooser = dragDrop1.fieldChooser(sourceFields1, destinationFields1);
//		};
		//Scrollbar

//		if (scroller.length) {
//			if (scroller.hasClass("mCustomScrollbar")) exit;
//			scroller.mCustomScrollbar({
//				advanced: { updateOnContentResize: true }
//			});
//		}
		//percent or num switch button
		var switchbutton = $(' .switch:not(.actBtnSwitch) a');
		if (switchbutton.length > 0) {
			switchbutton.click(function (e) {
				if ($(this).closest('div').hasClass('deactivated')) {
					e.preventDefault();
					e.stoppropagation();
					e.stopImmediatePropagation();
					return false;
				}
				var ClassName = $(this).attr('rel');
				$('.' + ClassName).find('.slidervalue').toggleClass('switchon');
				$(this).closest('.switch').toggleClass('on');
				return false;
			});
		}
   });

   $scope.showBestDecision = function(url){
        $rootScope.$broadcast('clearAllFilters');
        $scope.$broadcast('showBestDecision');
    }


})
.controller("filtersController", function ($scope, $element, $location, RequestConstantsFactory, DataService, $rootScope, CustomService, UtilitiesService, sharedProperties) {

	var temp;
	var notifyRequestConstants = RequestConstantsFactory['NOTIFICATION'];
	$scope.conversionActivities = [];
	//$scope.filter = 'false';
	$scope.thisPage = $location.path();
	$scope.perAmount = 0;
	$scope.numAmount = 0;
    $scope.uplift = 0;
    //Used to show spinner in search result
    $rootScope.loadingDOSearchResult = false;
    $scope.groupsCleared = false;
    $scope.activitiesCleared = false;
    $scope.dateCleared = false;

    //NEW Drag-drop Plugin code
    $scope.availUG = [];
    $scope.selectedUG = [];
    $scope.availCA = [];
    $scope.selectedCA = [];

    $scope.sliderConfig = {
			min: 0,
			max: 1000,
			step: 1
	}
	$scope.value = {
			num: 0,
			per: 0
	}

	$scope.closeFilter = function() {
		$('.xclose').trigger('click');
		$('.acc_link').trigger('click');
	}
    
    $scope.clearFilterClicked = function(){
		$scope.value.num  = 0;
		$scope.clearActiveDate();
		$rootScope.$broadcast('clearAllFilters');
	};

	//For displaying the date values in the filter selection
	$scope.dateChanged = function(){
		$scope.dateCleared = false;
	}

	//Success function for all filters 
	$scope.success = function (filterData) {
		try {
			$scope.error = false;
			//For user groups
            $.each(filterData['listOfUserGroups'], function(key, item){
                if(item.default == true){
                    $scope.selectedUG.push(item);
                }else{
                    $scope.availUG.push(item);
                }
            });
            //For conversion activities
			$.each(filterData['listOfConvActivity'], function(key, item){
                if(item.default == true){
                    $scope.selectedCA.push(item);
                }else{
                    $scope.availCA.push(item);
                }
            });

            //For the active till date - start and end date
			$scope.fromDate = filterData['activeTillDate'].greaterThanDate;
			$scope.toDate = filterData['activeTillDate'].lessThanDate;
            
            //For the slider max and min
			$scope.sliderConfig.max = sharedProperties.getMaxValue() * 2;
			//$scope.value.num = filterData['convUplift'].greaterThan;
			$scope.value.num = sharedProperties.getDeficitValue();
		} catch (e) {
			$scope.error = true;
			UtilitiesService.throwError($scope, e);
		}
	}

    //NEW Drag-Drop plugin implementation



    //for watching slider - percentage & value change 
	$scope.$watchCollection('value', function (newValue, oldValue) {
		if($('.contentPanel-filter .switch').hasClass('on')){
			$scope.uplift = $scope.value.num;
			$scope.uplift = UtilitiesService.getLocaleString($scope.uplift);
		}else{
			$scope.uplift = $scope.value.per;
		}
		//If percent input has changed
		if ($(':focus').hasClass('perval')) {
			$scope.percent = newValue.per.split('%');
			$scope.value.num = ($scope.percent[0] * $scope.sliderConfig.max) / 100 | 0;
		}
		else {
			$scope.value.per = (((newValue.num / $scope.sliderConfig.max) * 100).toFixed(1)) + '%';
		}
	});

	//converting to percentage
	$scope.toPercent = function (input) {
		return $filter('number')(input * 100) + '%';
	};

    $scope.filterSearchResults = function() {
    	if($scope.selectedUG.length == 0 || $scope.selectedCA.length == 0){
    		$rootScope.loadingDOSearchResult = false;
    		 $scope.loadingDOSearchResult = false;
    		UtilitiesService.getNotifyMessage(window.notifyConstants.NOTIFY_DW_FILTER_SELECT_ATLEAST,notifyRequestConstants.SUCCESS);
    		return false;
    	}
    console.log("reviewDOFilterClicked");
        $rootScope.$broadcast('reviewDOFilterClicked');
    }

	 $rootScope.$on('clearAllFilters', function () {
	   $scope.availUG = $.merge($.merge([],$scope.availUG), $scope.selectedUG);
       $scope.selectedUG = [];
       $scope.availCA = $.merge($.merge([],$scope.availCA), $scope.selectedCA);
       $scope.selectedCA = [];
       
       //conversion activities
	   $scope.groupsCleared = true;
       $scope.activitiesCleared = true;
       $scope.uplift = 0;
       $scope.dateCleared = true;
  });
	 
	 $scope.clearActiveDate = function() {
        $scope.fromDate = "";
        $scope.toDate = "";
        $scope.dateCleared = true;
     }

	$scope.clearConversionUplift = function() {
		$scope.value.num=0;
		$scope.builddoButtonClicked();
	};
	$scope.clearUserGroups = function() {
		$scope.availUG = $.merge($.merge([],$scope.availUG), $scope.selectedUG);
        $scope.selectedUG = [];
        $scope.groupsCleared = true;
		$scope.builddoButtonClicked();
	};
	$scope.clearConversionActivities = function() {
		$scope.availCA = $.merge($.merge([],$scope.availCA), $scope.selectedCA);
        $scope.selectedCA = [];
        $scope.activitiesCleared = true;
		$scope.builddoButtonClicked();
	};

    $scope.$on('showBestDecision', function(){
        $scope.value.num = sharedProperties.getDeficitValue(); 
        $scope.builddoButtonClicked('/builddo', true);
    })

	
	$(document).off("click", ".filterDecisionOptions").on("click", ".filterDecisionOptions", function(e){
		e.preventDefault();
		$scope.$apply();
	});
	$scope.buildDoTable = function(result){
		$rootScope.$broadcast("builddoTableData", result);
	}
    
	//used in review-do filtering
	$rootScope.filterDataBySelectedOptions = function(data) {
        var _data = [];
        var finalResult = {};
		$.each(data.doList, function(key, record) {
            var validRecord = true;
			var validUserGroup = true;
			var validActivity = true;
			
			//Check if the selected user groups are available in the record
			if($.merge($.merge([],$scope.availUG), $scope.selectedUG).length > 0) {
				$.each($.merge($.merge([],$scope.availUG), $scope.selectedUG), function(key, userGroup){
					if(userGroup.default) {
						var recordFound = false;
                        $.each(record.userGroupList, function(key, userGroupData){
							if(!recordFound) {
								recordFound = userGroup.groupId.indexOf(userGroupData.groupId)>-1;
							}
						});
						validUserGroup = validUserGroup && recordFound;
					}
				});
			}
			validRecord = validUserGroup;
			
			if($.merge($.merge([],$scope.availCA), $scope.selectedCA).length > 0) {
				$.each($.merge($.merge([],$scope.availCA), $scope.selectedCA), function(key, activity){
					if(activity.default) {
						var recordFound = false;
						$.each(record.targetConvActivityList, function(key, activityData){
							if(!recordFound) {
                                recordFound = activity.convActivityId.indexOf(activityData.convActivityId)>-1;
							}
						});
						validRecord = validRecord && recordFound;
					}
				});
			}
			
			var activeEndDate = moment(record.activeEndDate);
			var activeStartDate = moment(record.activeStartDate);
			
			if($scope.fromDate != "") {
				validRecord = validRecord && moment($scope.fromDate).isBefore(activeStartDate);
			}
			if($scope.toDate != ""){
				validRecord = validRecord && moment(activeEndDate).isBefore($scope.toDate);
			}
			
			validRecord = validRecord && (record.expectedNewSub >= $scope.value.num);
			
			if(validRecord) {
				_data.push(record);
			}
		});
		finalResult['doList'] = _data;
        console.log("result:", finalResult);
		return finalResult;
	}
	$scope.fail = function () {
        $scope.error = true;
        //$scope.hasErrorMsg = true;
        //$scope.errorMsg = "Network Error !!";
    }

	$scope.setDOSuccess = function(){
		$scope.loadingDOSearchResult = false;
	//	UtilitiesService.getNotifyMessage(window.notifyConstants.NOTIFY_DW_DO_UPDATED,notifyRequestConstants.SUCCESS);
	}
	$scope.builddoButtonClicked = function(url, isBestDecision){
        $rootScope.loadingDOSearchResult = true;
        $scope.loadingDOSearchResult = true;
        if(!$scope.filterForm.$valid){
        	$scope.loadingDOSearchResult = false;
        	$('form').addClass("formError");
			return false;
		} else {
			$('form').removeClass("formError");
		}
        
        if(!isBestDecision){
        	if($scope.selectedUG.length == 0 || $scope.selectedCA.length == 0){
        		$rootScope.loadingDOSearchResult = false;
        		 $scope.loadingDOSearchResult = false;
        		UtilitiesService.getNotifyMessage(window.notifyConstants.NOTIFY_DW_FILTER_SELECT_ATLEAST,notifyRequestConstants.SUCCESS);
        		return false;
        	}
        }
		var requestSetDO = {};
		var listOfUserGroups = [];
		var listOfConvActivity = [];
		var filter = {};
		
		requestSetDO['mode'] = $rootScope.selectedUserMode;
		window.appConstants.AVAILABLE_PERIODS.forEach(function(period){
			if(period.periodName == $rootScope.selectedPeriod) {
				requestSetDO['timeRange'] = UtilitiesService.getPeriodData(period); 
			}
		})
		$.each($.merge($.merge([],$scope.availUG), $scope.selectedUG), function(key, userGroup){
			if(userGroup.default) {
				var tempObj = {
						"groupId": userGroup.groupId,
						"groupName": userGroup.groupName
				};
				listOfUserGroups.push(tempObj);
			}
		});
		$.each($.merge($.merge([],$scope.availCA), $scope.selectedCA), function(key, activity){
			if(activity.default) {
				var tempObj = {
						"convActivityId": activity.convActivityId,
						"convActivityName": activity.convActivityName
				};
				listOfConvActivity.push(tempObj);
			}
		});
		filter['activeTillDate'] = {
				"greaterThanDate": $scope.fromDate,
				"lessThanDate": $scope.toDate
		};
		filter['convUplift'] = {
				"greaterThan": $scope.value.num,
				"asPercentage": false
		};
		filter['listOfUserGroups'] = listOfUserGroups;
		filter['listOfConvActivity'] = listOfConvActivity;
		requestSetDO['filter'] = filter;
		function saveDecision() {
			//var requestData = UtilitiesService.getRequestData();
			//requestData = angular.extend({}, requestData, request);
			var requestData = getDOSettingsSaveRequest();
			var func = $scope.setDOSuccess; 
			var cacheKey = "DWIndexSave" + JSON.stringify(requestData);
			if (arguments[1]) { 
				if (arguments[1].key == cacheKey) { 
					func = null; 
				} else { 
					return false; 
				} 
			}
			DataService.setDOSettings(requestData, func, $scope.fail);
		}
		
		function redirect() {
			$rootScope.loadingDOSearchResult = false;
			if(url){
				$location.path(url).search({flow:"false"});
			}
			
		}
		
		function getDOSettingsSaveRequest() {
            console.log("MERGE",$.merge($.merge([],$scope.availUG), $scope.selectedUG), $.merge($.merge([],$scope.availCA), $scope.selectedCA));
			var requestSetDO = {};
		      var listOfUserGroups = [];
		      var listOfConvActivity = [];
		      $.each($.merge($.merge([],$scope.availUG), $scope.selectedUG), function(key, userGroup){
		             var tempObj = {
		                          "groupId": userGroup.groupId,
		                          "groupName": userGroup.groupName,
		                          "selected": userGroup.default
		             };
		             listOfUserGroups.push(tempObj);
		      });
		      $.each($.merge($.merge([],$scope.availCA), $scope.selectedCA), function(key, activity){
		             var tempObj = {
		                          "convActivityId": activity.convActivityId,
		                          "convActivityName": activity.convActivityName,
		                          "selected": activity.default
		             };
		             listOfConvActivity.push(tempObj);
		      });
		      requestSetDO['activeTillDate'] = {
		                   "greaterThanDate": $scope.fromDate,
		              "lessThanDate": $scope.toDate
		      };
		      requestSetDO['convUplift'] = {
		                   "greaterThan": $scope.value.num,
		              "asPercentage": true
		      };
		      requestSetDO['listOfUserGroups'] = listOfUserGroups;
		      requestSetDO['listOfConvActivity'] = listOfConvActivity;
		      return requestSetDO;
		}

		function loadDecisionOptionsTable() {
			//var requestData = UtilitiesService.getRequestData();
			//requestData = angular.extend({}, requestData, request);
			var requestData = requestSetDO;
            console.log("REQQQQ",requestSetDO);
            return false;
			var func = redirect; 
			var cacheKey = "DWDecisionTable" + JSON.stringify(requestData);
			if (arguments[1]) { 
				if (arguments[1].key == cacheKey) { 
					func = null; 
				} else { 
					return false; 
				} 
			}
			DataService.getBuilddoDecision(requestData, func, $scope.fail);
		}
		saveDecision();
		loadDecisionOptionsTable();
		redirect();
	}

	var requestData = UtilitiesService.getRequestData();

	var cacheKey = "DWFilter" + JSON.stringify(requestData);
	function loadData() {
		var func = $scope.success; 
		if (arguments[1]) { 
			if (arguments[1].key == cacheKey) { 
				func = null; 
			} else { 
				return false; 
			} 
		}
		DataService.getFilterData(requestData, func, $scope.fail);
	}
	loadData();
    
})

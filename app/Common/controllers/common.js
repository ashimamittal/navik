angular.module('AnalyticsApp')

.controller("commonController", function ($scope, $rootScope, $location) {

    window.requestStack = {};

    $scope.periods = window.appConstants.TIME_PERIODS;
    $scope.selected = $scope.periods[0];
    $rootScope.selectedUserMode = window.appConstants.DEFAULT_USER_MODE;    

    //This array of objects - is to decide which time period to be selected 1st
	$scope.selectedIndex = [{"key":"weekly","selected":true},{"key":"monthly","selected": false},{"key":"quarterly","selected": false},{"key":"yearly","selected": false}];
    if(localStorage.getItem("selectedPeriod")){
    	$.each($scope.selectedIndex, function(key, value){
    		value.selected = false;
    		if(value.key == localStorage.getItem("selectedPeriod")){
    			value.selected = true;
    			$scope.selected = $scope.periods[key];
    		}
    	})
    }
    
	$rootScope.$on('$routeChangeSuccess', function(evt, cur, prev) {
		$scope.thisPage = $location.path();
	});
    // This selectedPeriod will be used across the app
    $rootScope.selectedPeriod = $scope.selected.key;

   /* $scope.broadcastPeriodChange = function () {
        $rootScope.selectedPeriod = $scope.selected.key;
        localStorage.setItem("selectedPeriod", selectedPeriod);
        $rootScope.$broadcast('periodChange');
    }*/
    $rootScope.builddoLoad = false;

   /* $scope.userModeSelected = function (selectedUserMode) {
        angular.element('.freeMode').each(function () {
            if (angular.element(this).parent().hasClass('active')) {
                angular.element(this).parent().removeClass('active');
            } else {
                angular.element(this).parent().addClass('active');
            }
        });
        $rootScope.selectedUserMode = selectedUserMode;
        $rootScope.$broadcast('periodChange');
    }
    */
  //This function will be called when time period is selected
    $scope.broadcastPeriodChange = function (selectedPeriod, index) {
    	console.log("selectedPeriod:", selectedPeriod, index)
    	$.each($scope.selectedIndex, function(key, value){
    		$scope.selectedIndex[key].selected= false;
    		if(key == index){
    	    	$scope.selectedIndex[index].selected= true;
    		}
    	})
    	localStorage.setItem("selectedPeriod", selectedPeriod);
        $rootScope.selectedPeriod = selectedPeriod;
        $rootScope.$broadcast('periodChange');
    }

    $rootScope.$on('DWPageChange', function (event, period) {
        setTabsEnable();
    });

    var setTabsEnable = function () {
        $scope.urlIndex = $location.search();
        
        if ($scope.urlIndex.flow == "false") {
            $scope.enable = false;
        }
        else {
            $scope.enable = true;
        }
    }
    setTabsEnable();
})

.controller('dwLinkController', function($scope, $window) {
	$scope.navModuleClicked = function(htmlName, pageName){
		if(htmlName != $scope.mainHtml){
			$window.location=htmlName +".htm" + pageName;
		}
	}
})

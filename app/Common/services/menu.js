angular.module('AnalyticsApp')

.service("MenuService", function ($rootScope, DataService, NetworkService, sharedProperties, UtilitiesService) {
	
	this.getMenu = function getMenu(checkedCount, maximumCount, defaultIndex) {
		return new Menu(checkedCount, maximumCount, defaultIndex);
	}
	
	function Menu(maximumCount, $scope, defaultIndex) {

		//used to identify if the menus has to saved
		var menuUpdated = false; 
        var menuSyncActive = false;
		var userSettings = null;
		var data = null;
		var defaultWidgetIndex = defaultIndex;
		$scope.select = $scope.urlIndex.currentlySelected;
		
		$scope.fail = function () {
	        $scope.error = true;
	        $rootScope.$broadcast('periodChange');
	        //$scope.hasErrorMsg = true;
	        //$scope.errorMsg = "Network Error !!";
	    } 
		//to be called when a menu is selected
		this.onSelect = function(selectedMenu) {
			menuUpdated = true
			var checkedCount = 0;
			userSettings.menus.forEach(function(menu) {
				//if menu type is available then check  for menu type else check only for menu selection
				//assumtion menu type will be available only for EA
				var selected = userSettings.selectedType ? menu.menuType == userSettings.selectedType && menu.checked === true : menu.checked === true;  
				if(selected) {
					checkedCount++;
					if(checkedCount > maximumCount) {
						selectedMenu.checked = false;
						alert("Cannot select more than " + maximumCount);
					}
				}
			});
			
			//Hide and show the widget based on the selection
			data.forEach(function(dataEntry) {
				//"window.MENU_WIDGET_LINK[menu.menuItemID] == dataEntry.groupBy" condition has to be removed once API is updated
				if(window.MENU_WIDGET_LINK[selectedMenu.menuItemID] && (window.MENU_WIDGET_LINK[selectedMenu.menuItemID] == dataEntry.subGroupBy || window.MENU_WIDGET_LINK[selectedMenu.menuItemID] == dataEntry.groupBy)) {
					dataEntry.display = selectedMenu.checked;
				}
			});
		}
		
		this.saveMenu = function saveMenu(groupBy, groupName, settings, selectedType) {
			$scope.fail = function () {
		        //$scope.error = true;
		    } 
			if(menuUpdated) {
				var data = {
					    "mode": "free",
					    "groupBy": groupBy,
					    "groupName": groupName,
					}
				//This should also be removed once the API is updated 
				if(selectedType) {
					settings.menus.forEach(function(menu){
						if(menu.menuType != selectedType && menu.checked) {
							menu.checked = false;
						}
					});
				}
				data['menus'] = settings.menus;
				DataService.saveUserSettings(
						groupBy,
						data,
						function(result) {
							//turn it back to false so that API is no called in the next menu save unless it is updated
							menuUpdated = false;
						},$scope.fail
				);
			}
		}
		
		this.getUserSettings = function getUserSettings(groupName, success) {
			DataService.getUserSettings(
					groupName,
					function(userSettingsData) {
						userSettings = userSettingsData.data[0];
						//This should be removed once API is updated
						if(groupName == 'EA') {
							userSettings['selectedType'] = "module";
						}
						success(userSettings);
					}, $scope.fail
				);
			return userSettings;
		}
		
		this.selected = function(data){
			loadSharedProperty(data);
	        $scope.select = data.groupBy;
	        sharedProperties.setHeading(data.groupName);
		}
	   this.widgetSelected = function (data) {
	    	loadSharedProperty(data);
	        $scope.select = data.subGroupBy;
	    };
		    
	    //Sync up with the menu in widgets
	    this.menuSync = function() {
	    	menuSync();
	    };
	    	
	    function menuSync() {
	    	//Sync menu only when both userSetting and data is available
	    	if(userSettings && data && !menuSyncActive) {
                menuSyncActive = true;
		    	userSettings.menus.forEach(function(menu) {
		    		data.forEach(function(dataEntry) {
		    			//"window.MENU_WIDGET_LINK[menu.menuItemID] == dataEntry.groupBy" condition has to be removed once API is updated
			    		if(window.MENU_WIDGET_LINK[menu.menuItemID] && (window.MENU_WIDGET_LINK[menu.menuItemID] == dataEntry.subGroupBy || window.MENU_WIDGET_LINK[menu.menuItemID] == dataEntry.groupBy)) {
			    			var typeSame = true;
			    			//Type will be available for EA
			    			if(userSettings.selectedType) {
			    				if(userSettings.selectedType != menu.menuType) {
			    					typeSame = false;
			    				}
			    			}
			    			dataEntry.display = menu.checked && typeSame;
			    		}
		    		});
		    	});
		    	$scope.menuSynced = true;
		    	//loads the shared property based on the selection
		    	var currentlySelected = $scope.urlIndex.currentlySelected;
		    	if (typeof (currentlySelected) == 'undefined') {
		    		var found = false; 
			    	data.forEach(function(dataEntry) {
		    			if(!found && 
			    				((dataEntry.display && (currentlySelected == null || currentlySelected == 'undefined')) 
			    					|| dataEntry.subGroupBy == defaultWidgetIndex)) {
			    			loadSharedProperty(dataEntry);
			    			$scope.select = sharedProperties.getSubGroupBy();
			    			found = true;
			    		}
			    	});
		    	} else {
		    		sharedProperties.setSubGroupBy($scope.urlIndex.currentlySelected);
		            sharedProperties.setHeading($scope.urlIndex.name);
		    	}
                $rootScope.$broadcast('periodChange');
                menuSyncActive = false;
	        }
        }
	    
	    function loadSharedProperty(data) {
	    	if(data.subGroupBy) {
	    		sharedProperties.setSubGroupBy(data.subGroupBy);
	    	} else {
	    		sharedProperties.setSubGroupBy(data.groupBy);
	    	}
	    	if(data.subgroupName) {
	    		sharedProperties.setHeading(data.subgroupName);
	    	} else {
	    		sharedProperties.setHeading(data.groupName);
	    	}
	    }
	    
	    //Watching the value of shared property
	    $scope.$watch(
			function () {
			    return sharedProperties.getSubGroupBy();
			},
			function (newValue, oldValue) {
				//load the data as per the selection
                if(newValue != null && newValue != oldValue){
		    	    $rootScope.$broadcast('periodChange');
				    $rootScope.heading = sharedProperties.getHeading();
                }
			}
		);
	    
	    //Watch for userSetting and sync the menu
	    $rootScope.$watch(function() {
	    	  return userSettings;
	    	}, function(newData, oldData){
	    	    menuSync();
	    	});
	    
	   //Watch for data and sync the menu
	    $rootScope.$watch(function() {
	    	  return data;
	    	}, function(newData, oldData){
                menuSync();
	    	});

		this.setData = function setData(actualData) {
			data = actualData;
		}
	}
});
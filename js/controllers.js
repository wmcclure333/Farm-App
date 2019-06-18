var cropControllers = angular.module('cropControllers', ['ngAnimate']);

cropControllers.controller("ListController", ['$scope', '$http',function($scope, $http) {
	$http.get('php/grabDataFromMCDB.php').success(function(data){
		$scope.crops = data.aRecs;
		$scope.cropOrder = 'varietyName';	
	});
}]); 

cropControllers.controller("DetailsController", ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
	var temp = this;
	$http.get('php/grabDataFromMCDB.php').success(function(data){
		$scope.crops = data.aRecs;
		$scope.fieldOptions = data.aFields;
		//calculate data array index for current crop id and store in whichItem
		count = 0; 
		$($scope.crops).each(function(){
			//determine which crop to access based on the URL parameter id
			if(Number(this.varietyId) == Number($routeParams.itemId)){
				$scope.whichItem = count;
				temp.itemId = count;
				return;
			}
			count++;
		});
		$scope.propMethodSelected = $scope.crops[$scope.whichItem].propagationMethod;
		$scope.seedSupplierSelected = $scope.crops[$scope.whichItem].seedSupplier;
  	});		//END .GET
	  
	  
	$scope.getFieldOptions = function (thisField) {
	  if(typeof($scope.fieldOptions) != "undefined"){
		var res = new Array();
		$($scope.fieldOptions).each(function(x){
			if(this.fieldName == thisField){
				res.push(this.fieldValue);	
			}
		});  
    	return res;
	  }
	};
	
}]); //end DetailsController

cropControllers.controller("PlanController", ['$scope', '$http', function($scope, $http) {
	var temp = this;
	$scope.plot = {plength : 72, pwidth : 30};
	$scope.genericSeedingBuffer = 1.1666667; //this is a multiplier used to determine how many "extra" seeds to start to offset failure
	$scope.numSuccessions = 1;
	$scope.numPlants = 0;
	$scope.successions = [0,0,0,0,0,0,0,0,0,0];
	$scope.taskOrder = 'tDate';
	$scope.harvestOrder = 'tDateCompleted';
	var thisSeason = document.getElementsByName("seasonId");
	$scope.seasonId = $(thisSeason).val();
	$scope.thisCropWeek = $("#current_week").html();
	$scope.taskStatusFilters = {active: true};
	$scope.vid = document.getElementById("audioClick");

	//show/hide PLAN or TASK display based on which tab is currently active (by URL)
    	var aThisPage = window.location.href;
    	aThisPage = aThisPage.split("/");
    	var thisPage = aThisPage[aThisPage.length - 1];	
	switch(thisPage){
      		case "plan":
        		$("#taskBlocks").css("display", "none");
       			$("#planBlocks").css("display", "block");
        		break;
      		case "tsk":
        		$("#taskBlocks").css("display", "block");
        		$("#planBlocks").css("display", "none");
        		break;
    	}    

	//same post call here is repeated below in reloadExistingCropsList().  That function is called after an insert is made in order to refresh the updated list. Might need to find a cleaner way to do this w/o repeating code.
	$http.post('php/grabDataFromPLANDB.php', {seasonId: $scope.seasonId, yearId: $("#yearId").val()}).success(function(data0){
		$scope.existingCropsInPlan = data0.aRecs;
	});
	$http.get('php/grabDataFromMCDB.php').success(function(data1){
		$scope.crops = data1.aRecs;
	});		
	$http.get('php/grabDataFromCCDB.php').success(function(data2){
		$scope.cropcodes = data2;
	});		
	$http.post('php/grabDataFromTSKDB.php', {seasonId: $scope.seasonId, yearId: $("#yearId").val()}).success(function(data3){
		$scope.theTaskList = data3.aRecs;
	});
	$http.post('php/grabDataFromTRAKDB.php', {type: "allharvest", seasonId: $scope.seasonId, yearId: $("#yearId").val()}).success(function(data4){
		//convert task group ids to full variety names to all search/sort
		$(data4.aRecs).each(function(){
			this.varietyName = $scope.getCropNameAndVarietyFromId(this.taskGroupId);
		});

		$scope.theHarvestList = data4.aRecs;
	});
	  
	//refresh on crop list (PLAN) after changes have been made
	$scope.reloadExistingCropsList = function (thisScope) {
		$http.post('php/grabDataFromPLANDB.php', {seasonId: $scope.seasonId, yearId: $("#yearId").val()}).success(function(data0){
			//change scope depending on if function is called from within it's own scope or outside of it
			if(thisScope == "outside") {
				$scope.existingCropsInPlan = data0.aRecs;
				$scope.generateTaskList();
			}else if(thisScope == "inside"){
			 	$scope.$parent.existingCropsInPlan = data0.aRecs;
			 	$scope.$parent.generateTaskList();
			 }
		});
	};

	//refresh on task list (TASK) after changes have been made
	$scope.reloadTaskList = function(thisScope){
		$http.post('php/grabDataFromTSKDB.php', {seasonId: $scope.seasonId, yearId: $("#yearId").val()}).success(function(data0){
			if(thisScope == "outside") {
				$scope.theTaskList = data0.aRecs;
			}else if(thisScope == "inside"){
				$scope.$parent.theTaskList = data0.aRecs;
			}
		});
	}; 	

	//refresh on harvest list (TRAK) after changes have been made
	$scope.reloadHarvestList = function(thisScope){
		$http.post('php/grabDataFromTRAKDB.php', {type: "allharvest", seasonId: $scope.seasonId, yearId: $("#yearId").val()}).success(function(data0){
			if(thisScope == "outside") {
				//convert task group ids to full variety names to all search/sort
				$(data0.aRecs).each(function(){
					this.varietyName = $scope.getCropNameAndVarietyFromId(this.taskGroupId);
				});
				$scope.theHarvestList = data0.aRecs;
			}else if(thisScope == "inside"){
				//convert task group ids to full variety names to all search/sort
				$(data0.aRecs).each(function(){
					this.varietyName = $scope.$parent.getCropNameAndVarietyFromId(this.taskGroupId);
				});				
				$scope.$parent.theHarvestList = data0.aRecs;
			}
		});
	}; 	

	//take X # of successions currently set and return an array of empty values with X indicies - for use in ng-repeat
	$scope.getCropNumSuccessions = function () {	
		var aTemp = [];
		for(c = 0; c < $scope.numSuccessions; c++){
			aTemp.push(0);
		}
		return aTemp;
	};	  

	//return list of all crop code types (ex. CUCU, TOMA, etc)
	$scope.getCropCodeOptions = function () {	
		var aCropCodes = new Array();
		$($scope.cropcodes).each(function(x){
			aCropCodes.push(this);	
		});  
		return aCropCodes;
	};

	//take crop code (ex. CUCU) and return list of all varieties under that crop type
	$scope.getCropOptions = function (cropCodeToMatch) {	
		var aCrops = new Array();
		$($scope.crops).each(function(x){
			if(this.cropCode == cropCodeToMatch){
				aCrops.push(this);	
			}
		});  
    		return aCrops;
	};

	//take crop variety id and get all crop data for this variety from mcdb
	$scope.getCropDataFromVarietyId = function (varietyIdToMatch) {	
		var thisCrop = new Object();
		$($scope.crops).each(function(i, val){
			if(Number(val.varietyId) == Number(varietyIdToMatch)){
				thisCrop = this;
			}
		});  
		return thisCrop;
	};

	//take variety id (or task group id) and get crop name and variety name in format: CROP NAME - VARIETY NAME
	$scope.getCropNameAndVarietyFromId = function (varietyIdToMatch) {
		//take first number in task group id (ex. 2_32) and use it as variety id
		if(varietyIdToMatch.indexOf("_") != -1){
			aTempId = varietyIdToMatch.split("_");
			varietyIdToMatch = aTempId[0];
		}

		var thisVarietyName, thisCropId, thisCropName;
		$($scope.crops).each(function(x){
			if(this.varietyId == varietyIdToMatch){
				thisVarietyName = this.varietyName;
				thisCropId = this.cropCode;
			}
		});  

		$($scope.cropcodes).each(function(x){
			if(this.cropCode == thisCropId){
				thisCropName = this.cropName;
			}
		});  
		return thisCropName+" - "+thisVarietyName;
	};

	$scope.generateSuccessionFieldDates = function(varietyId){
		var aSeedingFirstLastDates = $scope.getFirstAndLastSeedingDatesForCrop(varietyId);
		var aSeedingDates = $scope.generateSuccessionDateArray(aSeedingFirstLastDates[0], aSeedingFirstLastDates[1], $(".cropSuccessionPlants").length);
		$(".cropSuccessionPlants").each(function(index){
			$("#d_dateSuccession"+index).val(aSeedingDates[index]);
		});
	};

	//take variety id and return crops first and last seeding dates based on season setting
	$scope.getFirstAndLastSeedingDatesForCrop = function(varietyId){
		var thisCrop = new Object();
		thisCrop = $scope.getCropDataFromVarietyId(varietyId);

		var dateOfFirstSeeding; var dateOfLastSeeding; 
		if($scope.seasonId == "spring") {
			dateOfFirstSeeding = thisCrop.springFirstSeedingDate;
			dateOfLastSeeding = thisCrop.springLastSeedingDate;
		}else if($scope.seasonId == "fall") {
			dateOfFirstSeeding = thisCrop.fallFirstSeedingDate;
			dateOfLastSeeding = thisCrop.fallLastSeedingDate;
		}
		var aSeedingDates = [dateOfFirstSeeding, dateOfLastSeeding];
		return aSeedingDates;
	};

	//take in 1st and last dates for seeding of crop and # of desired successions for crop, generate an array of date values representing the successions of a crop
	$scope.generateSuccessionDateArray = function(dateOfFirstSeeding, dateOfLastSeeding, numSuccessionsForThisCrop){
		var aSuccessionPlantingProgression = [];
		var successionPlantingInterval = Math.round((dateOfLastSeeding - dateOfFirstSeeding) / numSuccessionsForThisCrop);
		aSuccessionPlantingProgression[0] = Number(dateOfFirstSeeding);
		for(b = 1; b < numSuccessionsForThisCrop; b++){
			if(Number(aSuccessionPlantingProgression[b-1]) + Number(successionPlantingInterval) >= dateOfLastSeeding){
				aSuccessionPlantingProgression[b] = Number(dateOfLastSeeding);
			}else{
				aSuccessionPlantingProgression[b] = Number(aSuccessionPlantingProgression[b-1]) + Number(successionPlantingInterval);							
			}
		}
		return aSuccessionPlantingProgression;
	};


	//creates task list (TASK) from crop list (PLAN) using data in ICG to make calculations for successions, dates, quantities, etc.
	$scope.generateTaskList = function(){
		var aTempTaskList = [];

		$($scope.existingCropsInPlan).each(function(e, val){
			//get mcdb data for this crop and assign full variety name
			var thisCrop = new Object();
			thisCrop = $scope.getCropDataFromVarietyId(val.varietyId);

			//grab prop method to determine task (seed i, seed o, etc). Use this to figure out loop for multiple tasks (harden, etc).
			var thisPropMethod = thisCrop.propagationMethod;

			//find # of successions
			var succCount = 1; var thisSucc = 1;
			while(thisSucc != 0){
				thisSucc = val["succession"+succCount];
				succCount++;
			}
			var numSuccessionsForThisCrop = succCount - 2;
			var aSuccessionPlantingProgression = [];
			for(cc = 1; cc <= 10; cc++){
				if(val["successionDate"+cc] != "-100"){
					aSuccessionPlantingProgression[cc-1] = val["successionDate"+cc];
				}
			}

			//determine weeks to transplant for this crop to be able to calculate task dates
			var weeksToTransplant = Math.round(thisCrop.daysToTransplant / 7);

			//calculate number of seeds/plants per bed for crop
			var numRowsInBedForVariety = 0;
			if(thisCrop.rowSpacing) numRowsInBedForVariety = Math.floor($scope.plot.pwidth / thisCrop.rowSpacing);
			var numPlantsPerRowForVariety = 0;
			if(thisCrop.plantSpacing) numPlantsPerRowForVariety = Math.floor($scope.plot.plength / thisCrop.plantSpacing);
			
			var numPlantsPerBedForVariety = numRowsInBedForVariety * numPlantsPerRowForVariety;

			//determine # of tasks to create for each succession based on prop method (seed i, seed o, etc)
			var numTasksPerSuccession = 0; var aTaskProgression = [];
			switch(thisPropMethod){
				case "indoorBlock":
					numTasksPerSuccession = 3;
					aTaskProgression = ["seed i", "harden", "transplant"];
					aTaskDateOffsets = [0, weeksToTransplant - 1, weeksToTransplant];
					break;
				case "outdoorSeed":
					numTasksPerSuccession = 1;
					aTaskProgression = ["seed o"];
					aTaskDateOffsets = [0];
					break;
				case "cutting":
					numTasksPerSuccession = 1;
					aTaskProgression = ["plant cutting"];
					aTaskDateOffsets = [0];
					break;
			}

			//loop through successions and tasks for each
			for(c = 1; c <= numSuccessionsForThisCrop; c++){
				for(d = 1; d <= numTasksPerSuccession; d++){
					//set all task data here
					var tempObj = {};	
					tempObj.taskGroupId = thisCrop.varietyId+"_"+val.entryId;						
					tempObj.subject = $scope.getCropNameAndVarietyFromId(thisCrop.varietyId);
					tempObj.plot = "";
					tempObj.task = aTaskProgression[d-1];
					tempObj.tdate = Number(aSuccessionPlantingProgression[c-1]) + Number(aTaskDateOffsets[d-1]);
					tempObj.amount = val["succession"+c] * numPlantsPerBedForVariety;  //beds * plants per bed = total plants
					  		
					//calculate and update "amount" value to include buffer for seed failure ex. seed 6 to get 4... 6|4 		
					if(tempObj.task != "transplant"){
						var bufferedAmount = 0;
						if(tempObj.task == "seed i"){
							bufferedAmount = Math.ceil(tempObj.amount * ($scope.genericSeedingBuffer * $scope.genericSeedingBuffer));	
							tempObj.amount = Math.ceil(tempObj.amount * $scope.genericSeedingBuffer);
						}else if(tempObj.task == "harden"){
							bufferedAmount = Math.ceil(tempObj.amount * $scope.genericSeedingBuffer);
						}else if(tempObj.task == "seed o"){
							bufferedAmount = tempObj.amount;	//no extra spots to be seeded outdoors
						}
						if(tempObj.amount == 0) tempObj.amount = "?"; //throw ? indicator to show missing data or error
						else tempObj.amount = bufferedAmount+" | "+tempObj.amount;
					}
					//add seeds per block/space info to the end of the "amount" value
					if(tempObj.task == "seed i"){
						tempObj.amount += " | "+thisCrop.numSeedsSownForEach;
					}else if(tempObj.task == "seed o"){
						tempObj.amount += " | "+thisCrop.numSeedsSownForEach;
					}
					
					tempObj.succession = c;
					tempObj.notes = "";
					aTempTaskList.push(tempObj);
				}
			}				
		});

		$http.post('php/insertDataToTSKDB.php', {type: "generate", aTasks: aTempTaskList, seasonId: $scope.seasonId, yearId: $("#yearId").val()}).success(function(data2){
			if(data2 == 1){
				console.log("Task List Created!");
				$scope.reloadTaskList("outside");
			}
		});
	};
}]); //end PlanController


cropControllers.controller("ImagesPanelController", ['$scope', '$http','$routeParams', function($scope, $http, $routeParams){
	$scope.whichItem = Number($routeParams.itemId);	//current crop id pulled from URL route
	var tempGlobal = this;	//temp object to hold global data and avoid scope issues
	
	$http.post('php/grabDataFromMCDBImages.php', {dataType: 'single', cropId: $scope.whichItem}).success(function(data){
		$scope.images = data;
	});
}]); //end ImagesPanelController


cropControllers.controller("NotesPanelController", ['$scope', '$http','$routeParams', '$timeout', function($scope, $http, $routeParams, $timeout){
	
	$scope.whichItem = Number($routeParams.itemId);	//current crop id pulled from URL route
	var tempGlobal = this;	//temp object to hold global data and avoid scope issues
	
	//grab family 4-letter code from MCDB using itemId index to then grab family index from CCDB
	$http.post('php/grabDataFromMCDB.php', {dataType: 'single', cropId: $scope.whichItem}).success(function(data2){
		tempGlobal.cropFamilyCode = data2.aRecs[0].cropCode; 
		$scope.searchKeywords = data2.aRecs[0].searchKeywords;
		$http.post('php/grabDataFromCCDB.php', {dataType: 'single', cropFamId: tempGlobal.cropFamilyCode}).success(function(data3){
			tempGlobal.cropFamilyIndex = Number(data3[0].cropIndex) + 1000;	//adjust +1000 to identify family index vs. varietal index 
			$scope.familyCode = Number(data3[0].cropIndex) + 1000; 
			//grab all notes
			$http.post('php/grabDataFromCropnotes.php', {dataType: 'single', cropId: $scope.whichItem, cropFamId: tempGlobal.cropFamilyIndex}).success(function(data){
				$scope.notesStorage = new Array();	
				$scope.notesHarvest = new Array();	
				$scope.notesGrowing = new Array();	
				$scope.notesMarketing = new Array();	
				$scope.notesGeneral = new Array();	

				$(data).each(function(index){
					switch(data[index].noteType){
						case "storage":
							$scope.notesStorage.push(data[index]);
							break;
						case "harvest":
							$scope.notesHarvest.push(data[index]);
							break;
						case "growing":
							$scope.notesGrowing.push(data[index]);
							break;
						case "marketing":
							$scope.notesMarketing.push(data[index]);
							break;
						case "general":
							$scope.notesGeneral.push(data[index]);
							break;
					}
				});
			});
		 });
		 
		//Grab FJO records based on crop type and variety name keywords
		var searchKeywordsFiltered = $scope.searchKeywords.replace(", ", ",");
		$http.post('php/grabDataFromFJO.php', {searchKeywords: searchKeywordsFiltered}).success(function(fjoData){
			$scope.fjo = fjoData;
			for(c = 0; c < fjoData.length; c++){
				console.log(fjoData[c].postId+"<br>");
			}
			highlightTerms("postTitle");
			highlightTerms("postContent");
			function highlightTerms(contentType){
				//BEGIN - HIGHLIGHT KEYWORDS IN CONTENT
				var aSearchKeywords = searchKeywordsFiltered.split(",");
				for(var c = 0; c < fjoData.length; c++){
					//cycle through each log
					var thisPost = fjoData[c][contentType].toLowerCase();
					indexLoc = 0; lowestIndex = thisPost.length; stopLoop = 0;
					var spanInsert = new Object(); var aInserts = new Array();
	
					while(stopLoop == 0){
						//keep cycling through log until all keywords found and marked
						stopLoop = 1;
						keywordLength = 0;
						for(var d = 0; d < aSearchKeywords.length; d++){
							//cycle through each keyword and search the log for it
							thisIndex = thisPost.indexOf(aSearchKeywords[d], indexLoc);
							if(thisIndex != -1 && thisIndex < lowestIndex){
								stopLoop = 0;
								lowestIndex = thisIndex;
								keywordLength = aSearchKeywords[d].length;
							}
						}
						//save locations of all highlight start/end points to add highlighting later
						if(stopLoop == 0){
							spanInsert.start = lowestIndex; spanInsert.end = lowestIndex+keywordLength;
							aInserts.push(spanInsert);
							indexLoc = lowestIndex;
						}
					}//END WHILE LOOP
					
					//cycle through start/end points and add highlighting at the spot where next keyword was found
					for(var e = aInserts.length - 1; e >= 0; e--){
						fjoData[c][contentType] = fjoData[c][contentType].slice(0, aInserts[e].end) + "</span>" + fjoData[c][contentType].slice(aInserts[e].end);
						fjoData[c][contentType] = fjoData[c][contentType].slice(0, aInserts[e].start) + "<span class='highlight'>" + fjoData[c][contentType].slice(aInserts[e].start);
					}
				}
				//END - HIGHLIGHT KEYWORDS IN CONTENT
			}
		});
	});

	
	$scope.adjustNoteDimensions = setInterval(function(){
		$scope.adjustAllNoteDimensions();
	}, 1000);

	$scope.adjustAllNoteDimensions = function(){
		$("ul.cropNotesTabList li textarea").each(function(e){
			$(".noShowHeight").css("width", "350px");
			$(".noShowHeight").css("font-size", $(this).css("font-size"));
			$(".noShowHeight").css("line-height", $(this).css("line-height"));
			$(".noShowHeight").html($(this).html());
			var tempHei = $(".noShowHeight").height();
			$(this).css("height", tempHei+20);
		});
	};
	
	//other controller vars and functions
	this.tab = 1;
	this.selectTab = function(setTab){
		this.tab = setTab;
	};
	this.isSelected = function(checkTab){
		return this.tab === checkTab;
	};

}]); //end NotesPanelController

/******************************************************************************************************************************/
/******************** DIRECTIVES *******************************************************************************************/
/******************************************************************************************************************************/

//Check if radio button should be currently set ('checked') as the thumbnail of radio group 
cropControllers.directive('checkForThumb', function($http) {
  return {
	  	restrict: 'A',
        scope: { isTheThumb: '@' },
		link: function(scope, element, attr){
			//"check" the current thumbnail in radio group
			var isTheThumb = scope.$eval(attr.isTheThumb);
			if(isTheThumb) element.prop('checked', true);
		}
   }
});

//Directs function of the edit tab panel - adds control to the tab buttons
cropControllers.directive('editImagesTabPanel', function($http) {
	return {
		restrict: 'A',
		link: function(scope, element, attr){
			$('.nav-tabs a').click(function (e) {
				e.preventDefault();
				$(this).tab('show');
			});	
		}
   	}
});

//Initiates carousel (bootstrap). Adds event functionality to carousel items including showing image captions, zooming image.
cropControllers.directive('item', function($http) {
  	return {
		restrict: 'C',
		link: function(scope, element, attr){
			document.oncontextmenu = function() {return false;};	//stop context menu from showing on right click
			element.mouseover(function(){
				$(this).find(".carousel-caption").css("display", "block");
			}).mouseout(function(){
				$(this).find(".carousel-caption").css("display", "none");
			}).mousedown(function(e){
				if(e.button == 2){	//if right-click...
					var thisZoomedImg = $(this).find(".detailsImageCtr img").attr("src").replace("-300x200", "");
					window.open(thisZoomedImg, "_blank");
				}
			});
		}
    }
});

//Turn element into button that shows the image admin panel
cropControllers.directive('btnShowImageAdminPanel', function($http) {
  	return {
		restrict: 'A',
		link: function(scope, element, attr){
			element.click(function(){
				$(".editImagesTabPanel").css("display", "block");
			});
		}
    }
});

//Adds listeners to form buttons - closing popup, submitting new images to DB
cropControllers.directive('addCropImage', function($http, $routeParams) {
	return {
		restrict: 'A',
		link: function(scope, element, attr){
			$(".cancelImgBtn").click(function(){
				$(".editImagesTabPanel").css("display", "none");
			});
			$(".submitImgBtn").click(function(){
				$(".editImagesTabPanel").css("display", "none");
				//Create new entry in DB
				$http.post('php/insertDataToMCDBImages.php', {type:'insert', id:$routeParams.itemId, fileName:$("#imgFile").val(), fileCaption:$("#imgCaption").val(), isThumb:$('input[name=isThumb]:checked').val()}).success(function(data2){
					console.log("Image inserted");
				});
			});
		}
    }
});

//adds listeners to form buttons - close popup, submit new image order or thumbnail to DB
cropControllers.directive('reorderCropImage', function($http, $routeParams) {
  	return {
		restrict: 'A',
		link: function(scope, element, attr){
			$(".reorderImgBtn").click(function(){
				$(".editImagesTabPanel").css("display", "none");
				var aRadios = new Array();
				$(".assignThumbRadio").each(function(){
					var thisObj = new Object();
					thisObj.mark = $(this).attr('image-mark');
					if($(this).is(':checked'))
						thisObj.isThumb = 1;
					else thisObj.isThumb = 0;
					aRadios.push(thisObj);					
				});
				//Create new entry in DB
				$http.post('php/insertDataToMCDBImages.php', {type:'update', radios:aRadios}).success(function(data2){
					console.log("Images updated");
				});
			});
		}
    }
});

//adds event functionality to an element to create and insert a blank crop record into the database, then redirects the browser to the new crop's details page
cropControllers.directive('createNewCrop', function($http) {
	return {
		restrict: 'C',
		link: function(scope, element, attr){
			element.click(function(){
				//Create new entry in DB
				$http.post('php/insertDataToMCDB.php', {type:'insert'}).success(function(data2){
					window.open("http://localhost/__FARM_DIGITAL/_TheFarm/index.html#/details/"+data2, "_self");
				});
			});
		}
    }
});

//Adjusts input box width as user types
cropControllers.directive('elasticInput', function() {
  	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			attr.$observe('value', function(value) {
				thisValue = value;
 				if(thisValue){
					adjustInputWid(thisValue);
				}
			});
           
			element.on("keypress", function(){adjustInputWid($(this).val());});
			function adjustInputWid(val){
				var thisValue;
				var tempFontSize = Number(element.css("font-size").replace("px", ""));
				$(".noShow").css("font-size", tempFontSize+"px");
				$(".noShow").html(val);
				element.width($(".noShow").width()+20);
			}

    	}
  	};
});
//Adjusts input box width as user types
cropControllers.directive('elasticTextarea', function($timeout) {
  	return {
		restrict: 'A',
		link: function(scope, element, attr) {
           
			element.on("keypress", function(){adjustInputHei($(this).html());});
			function adjustInputHei(val){
				var thisValue;
				var tempFontSize = Number(element.css("font-size").replace("px", ""));
				$(".noShowHeight").css("font-size", tempFontSize+"px");
				$(".noShowHeight").html(val);
				element.height($(".noShowHeight").height()+20);
			}

    	}
  	};
});

//Creates elements that select all text within on a single click for easy editing
cropControllers.directive('selectAllFocus', function() {
  	return {
		restrict: 'A',
		link: function(scope, element, attr) {
			element.on("click", function () {	//add "select all" on field focus
			   $(this).select();
			});
    	}
  	};
});

//Toggles an element based on user click by changing the elements class to represent "on" or "off" states
cropControllers.directive('toggleInput', function($http) {
 	return {
		restrict: 'A',
        scope: {
            toggleValue: '@',
			toggleType: '@'
        },
		template: '<img id="icon_{{toggleType}}" class="toggle{{toggleValue}}" src="images/profileToggleIcons_{{toggleType}}.png" width="30" height="30" alt=""/>',
		link: function(scope, element, attr){
			element.click(function(){
				var thisImg = $(this).find("img");
				if(thisImg.hasClass("toggle1")){
					thisImg.removeClass("toggle1");
					thisImg.addClass("toggle0");	
					thisVal = 0;	
				}else if(thisImg.hasClass("toggle0")){
					thisImg.removeClass("toggle0");
					thisImg.addClass("toggle1");
					thisVal = 1;	
				}
				thisField = "Is"+thisImg.attr("id").substr(5);
				cropid = $(".cropTitle").attr("id").substr(4);
				
				//Update DB with toggle info
				$http.post('php/insertDataToMCDB.php', {val: thisVal, field: thisField, cropid:cropid, type:'update'}).success(function(data2){
				});

			});
		}
    }
});

//Sets form element to update database on change
cropControllers.directive('editableBlock', function($http) {
  return {
	  restrict: 'C',
		link: function(scope, element, attr){
			element.change(function(){
				thisVal = $(this).val();
				thisField = $(this).attr("name");
				if($(this).is("select")) thisVal = $(this).find("option:selected").text();
				//Update DB
				if($(this).attr("database")){	//if database attr is set to override the default mcdb...
					databaseToUpdate = $(this).attr("database");
					//add to proper db below
					switch(databaseToUpdate){
						case "tskdb":
							//Only update form field if it's a manual (protected) task or if it's a 'Notes' field
							if(element.parent().parent().attr("thisOverwriteStatus") == "protected" || element.attr("id") == "t_notes"){
								taskid = element.parent().parent().attr("thistaskid");
								$http.post('php/updateDataForTSKDB.php', {type:'update', val: thisVal, field: thisField, thisTaskId:taskid }).success(function(data2){});
							}else if(element.attr("id") == "t_tdate"){	//if task date is updated, check for needed updates of other tasks within succession
								taskid = element.parent().parent().attr("thistaskid");
								var tempGroup = element.parent().parent().attr("id");
								var taskGroupId = tempGroup.substr(5);
								var thisSuccession = element.parent().parent().find(".tsk_succession #t_succession").val();
								var thisTask = element.parent().parent().find(".tsk_task #t_task").val();
								var oldValue = element.attr("oldValue");
								var newValue = element.val();
								var valDifference = parseInt(newValue) - parseInt(oldValue);
								element.attr("oldValue", newValue);
								$http.post('php/updateDataForTSKDB.php', {type:'updateSuccessions', taskGroupId: taskGroupId, thisTaskId:taskid, thisSuccession: thisSuccession, thisTask: thisTask, valDifference: valDifference, newValue: newValue }).success(function(data2){
									console.log(data2);
									scope.reloadTaskList("outside");
								});								
							}
							break;
						case "trakdb":
							harvestid = element.parent().parent().attr("thisharvestid");
							$http.post('php/updateDataForTRAKDB.php', {type:'update', harvestid: harvestid, field: thisField, val: thisVal }).success(function(data3){
								console.log("Harvest record updated");
							});
							break;
						case "none": 	//when "database" attrib is set to "none", no DB insert or update takes place
							//do nothing
							break;
					}
				}else{
					databaseToUpdate = "mcdb";	//default to mcdb if attribute is not set
					cropid = $(".cropTitle").attr("id").substr(4);
					$http.post('php/insertDataToMCDB.php', {val: thisVal, field: thisField, cropid:cropid, type:'update'}).success(function(data2){
					});
				} 
			});
		}
    }
});


//Sets form element to update database on change
cropControllers.directive('updateSuccessionCount', function($http) {
  return {
	  restrict: 'EA',
		link: function(scope, element, attr){
			element.change(function(){
				var plantsPerSuccession = scope.numPlants / scope.numSuccessions;
				plantsPerSuccession = (Math.ceil(plantsPerSuccession * 4) / 4);
				for(var c = 0; c < scope.numSuccessions; c++){
					scope.successions[c] = plantsPerSuccession;
					scope.$apply();
				}

				var thisVarietyId = $("#d_addCrop").find("option:selected").val();
				scope.generateSuccessionFieldDates(thisVarietyId);
			});
		}
    }
});

//Button that adds a task to list
cropControllers.directive('updateSeedDates', function($http, $routeParams, $compile) {
  return {
	  restrict: 'A',
		link: function(scope, element, attr){
			element.on("change", function(){
				var thisVarietyId = element.find("option:selected").val();
				var aSeedDates = scope.getFirstAndLastSeedingDatesForCrop(thisVarietyId);
				$("#first_seed_date span").html(aSeedDates[0]);
				$("#last_seed_date span").html(aSeedDates[1]);

				scope.generateSuccessionFieldDates(thisVarietyId);
			});
		}
    }
});


//Button that submits a new crop to the plan
cropControllers.directive('addCropToPlan', function($http, $routeParams, $compile) {
  return {
	  restrict: 'AC',
	  controller: 'PlanController',
		link: function(scope, element, attr){
			element.on("click", function(){
				var varietyId = $("#d_addCrop").find("option:selected").val();
				succession1 = $("#d_numPlantsSuccession0").val(); succession2 = $("#d_numPlantsSuccession1").val(); succession3 = $("#d_numPlantsSuccession2").val(); succession4 = $("#d_numPlantsSuccession3").val(); succession5 = $("#d_numPlantsSuccession4").val(); succession6 = $("#d_numPlantsSuccession5").val(); succession7 = $("#d_numPlantsSuccession6").val(); succession8 = $("#d_numPlantsSuccession7").val(); succession9 = $("#d_numPlantsSuccession8").val(); succession10 = $("#d_numPlantsSuccession9").val();
				successionDate1 = $("#d_dateSuccession0").val(); successionDate2 = $("#d_dateSuccession1").val(); successionDate3 = $("#d_dateSuccession2").val(); successionDate4 = $("#d_dateSuccession3").val(); successionDate5 = $("#d_dateSuccession4").val(); successionDate6 = $("#d_dateSuccession5").val(); successionDate7 = $("#d_dateSuccession6").val(); successionDate8 = $("#d_dateSuccession7").val(); successionDate9 = $("#d_dateSuccession8").val(); successionDate10 = $("#d_dateSuccession9").val();
				$http.post('php/insertDataToPLANDB.php', {type: 'insert', varietyId: varietyId, seasonId: scope.seasonId, yearId: $("#yearId").val(), succession1: succession1, succession2: succession2, succession3: succession3, succession4: succession4, succession5: succession5, succession6: succession6, succession7: succession7, succession8: succession8, succession9: succession9, succession10: succession10, successionDate1: successionDate1, successionDate2: successionDate2, successionDate3: successionDate3, successionDate4: successionDate4, successionDate5: successionDate5, successionDate6: successionDate6, successionDate7: successionDate7, successionDate8: successionDate8, successionDate9: successionDate9, successionDate10: successionDate10}).success(function(data2){
					if(data2 == 1){
						console.log("Inserted!");
						scope.reloadExistingCropsList("outside");
						//reset form fields for inserting crops
						scope.numSuccessions = 1;
						$("#d_numPlantsSuccession0").val('').css("width", "auto");
						$("#d_numPlants").val('0');
						$("#d_numSuccessions").val('1');
						scope.cropCodeSelected = "";
						scope.cropSelected = "";
					}
				});
			});
		}
    }
});

//Button that deletes a crop from the plan
cropControllers.directive('deleteCropFromPlan', function($http, $routeParams, $compile) {
  return {
	  restrict: 'AE',
	  controller: 'PlanController',
	  scope: {
	  	group: '=',
	  	thisindex: '='
	  },
		link: function(scope, element, attr){
			element.on("click", function(){
				var thisEntryId = Number($(this).attr("id").replace("crop_", ""));
				var taskGroupId = element.parent().parent().parent().attr("taskGroup");
				scope.group.splice(scope.thisindex,1);
				$http.post('php/deleteDataFromPLANDB.php', {type: 'single', entryId: thisEntryId, taskGroupId: taskGroupId, seasonId: scope.seasonId, yearId: $("#yearId").val()}).success(function(data2){
					if(data2 == 1){
						console.log("Deleted!");
						scope.reloadExistingCropsList("inside");
					}
				});
			});
		}
    }
});

//Button that deletes a task or task group from list
cropControllers.directive('deleteTaskFromList', function($http, $routeParams, $compile) {
  return {
	  restrict: 'AE',
		link: function(scope, element, attr){
			element.on("click", function(){
				var animThis = element.parent().parent().parent();
				TweenLite.to(animThis, .75, {css:{scaleY:0}, ease:Power2.easeOut});
				var thisTaskId = $(this).parent().parent().attr("thisTaskId");
				var updateType = "disable";
				var removeFromTrak = 0;	
				if(element.parent().parent().attr("thisTaskStatus") == "disabled") updateType = "resetToActive";	
				if(element.parent().parent().attr("thisTaskStatus") == "completed") {  //if task previously completed, remove from TRAKDB
					removeFromTrak = 1;	
					var thisTaskGroupId = $(this).parent().parent().attr("id").substr(5);
					var task = $(this).parent().parent().find("#t_task").val();
				}
				$http.post('php/updateDataForTSKDB.php', {type: updateType, thisTaskId: thisTaskId}).success(function(data2){
					if(data2 == 1){
						console.log("Disabled!");
						scope.vid.src = "audio/-trash.mp3";
						scope.vid.play();

						scope.reloadTaskList("outside");

						if(removeFromTrak){
						//remove completed record from TRAKDB
							$http.post('php/insertDeleteDataFromTRAKDB.php', {type: "resetToActive", thisTaskGroupId: thisTaskGroupId, task: task, seasonId: scope.seasonId, yearId: $("#yearId").val()}).success(function(data3){
								if(data3 != 0){
									console.log("Completed task deleted from TRAKDB");
									}
							});
						}
					}
				});
			});
		}
    }
});

//Button that deletes a task or task group from list
cropControllers.directive('doubleClickToComplete', function($http, $routeParams, $compile) {
  return {
	  restrict: 'A',
		link: function(scope, element, attr){
			element.on("dblclick", function(){
				//Insert completed task record in TRAKDB, then update TASKDB and display
				var thisTaskGroupId = $(this).parent().attr("id").substr(5);
				var task = $(this).parent().find("#t_task").val();
				var succession = $(this).parent().find("#t_succession").val();
				var updateType = "complete";
				var thisTaskId = $(this).parent().attr("thisTaskId");
				
				if(element.parent().attr("thisTaskStatus") == "completed"){
					updateType = "resetToActive";
					taskTotalResult = 1; tDateCompleted = 1; //init with dummy values to pass the if statement below
				}else{	//only display prompts for new task completions, not for resets to active
					tempAmount = $(this).parent().find("#t_amount").val();
					aTempAmount = tempAmount.split(" | ");
					var taskTotalExpected = aTempAmount[0];
					var taskTotalResult = prompt("How many?", taskTotalExpected);
					if(taskTotalResult != null) 
						var tDateCompleted = prompt("Week completed:", $("#current_week").html());					
					if(tDateCompleted != null) 
						var notes = prompt("Add notes:");					
				}

				if(taskTotalResult != null && tDateCompleted != null){	//if data prompts are canceled, skip db insert
					$http.post('php/insertDeleteDataFromTRAKDB.php', {type: updateType, thisTaskGroupId: thisTaskGroupId, task: task, succession: succession, taskTotalResult: taskTotalResult, notes: notes, tDateCompleted: tDateCompleted, seasonId: scope.seasonId, yearId: $("#yearId").val()}).success(function(data2){
						if(data2 != 0){
							console.log("Completed task "+data2+" TRAKDB");
							var animThis = element.parent();
							TweenLite.to(animThis, .25, {css:{backgroundColor:"rgba(0, 0, 255, 0.3)"}, ease:Power2.easeOut});

							scope.vid.src = "audio/-complete1.mp3";
							scope.vid.play();						

							//Update task status in TASKDB and update display with completed task status
							$http.post('php/updateDataForTSKDB.php', {type: updateType, thisTaskId: thisTaskId}).success(function(data3){
								if(data3 == 1){
									console.log("Completed task updated in TASKDB");
									scope.reloadTaskList("outside");
								}
							});
						}
					});
				}
			});
		}
    }
});

//Button that adds a task to list
cropControllers.directive('addManualTask', function($http, $routeParams, $compile) {
  return {
	  restrict: 'A',
		link: function(scope, element, attr){
			element.on("click", function(){
				$http.post('php/insertDataToTSKDB.php', {type: "addnewtask", seasonId: scope.seasonId, yearId: $("#yearId").val()}).success(function(data2){
					if(data2 == 1){
						console.log("New Task Created!");
						scope.vid.src = "audio/snap_insert_click.mp3";
						scope.vid.play();						
						scope.reloadTaskList("outside");
					}
				});
			});
		}
    }
});

//Button that generates task list from crop plan
cropControllers.directive('generateTaskList', function($http, $routeParams, $compile) {
  return {
	  restrict: 'AE',
		link: function(scope, element, attr){
			element.on("click", function(){
				scope.generateTaskList();
			});
		}
    }
});

//Button that deletes a harvest record from harvest list
cropControllers.directive('deleteHarvestFromList', function($http, $routeParams, $compile) {
  return {
	  restrict: 'AE',
		link: function(scope, element, attr){
			element.on("click", function(){
				var thisHarvestId = element.parent().parent().attr("thisHarvestId");
				var animThis = element.parent().parent().parent();
				TweenLite.to(animThis, .5, {css:{scaleY:0}, ease:Power2.easeOut});
				$http.post('php/insertDeleteDataFromTRAKDB.php', {type: "removeHarvest", thisTaskGroupId: "notneeded", thisHarvestId: thisHarvestId, task: "harvest", seasonId: scope.seasonId, yearId: $("#yearId").val()}).success(function(data2){
					if(data2 == 1){
						console.log("Harvest record deleted from TRAKDB");
						scope.vid.src = "audio/-trash.mp3";
						scope.vid.play();
						scope.reloadHarvestList("outside");
					}
				});
			});
		}
    }
});

//Button that adds a harvest record to the harvest list
cropControllers.directive('addManualHarvest', function($http, $routeParams, $compile) {
  return {
	  restrict: 'A',
		link: function(scope, element, attr){
			element.on("click", function(){
				tempId = document.getElementsByName("harvestInsertGroupId");
				var thisTaskGroupId = $(tempId).val();
				var taskTotalResult = $("#harvestTotal").val();
				var tDateCompleted = $("#harvestTDate").val();
				var notes = $("#harvestNotes").val();

				$http.post('php/insertDeleteDataFromTRAKDB.php', {type: "addHarvest", thisTaskGroupId: thisTaskGroupId, taskTotalResult:taskTotalResult, tDateCompleted: tDateCompleted, notes: notes, seasonId: scope.seasonId, yearId: $("#yearId").val()}).success(function(data2){
					if(data2 == 1){
						console.log("New harvest record added to TRAKDB");
						scope.vid.src = "audio/snap_insert_click.mp3";
						scope.vid.play();
						scope.reloadHarvestList("outside");

						//reset form fields after submit
						$("#harvestTotal").val('');
						$("#harvestTDate").val(scope.thisCropWeek);
						$("#harvestNotes").val('');
					}
				});
			});
		}
    }
});

//Sets form element (for notes only) to update database on change. Same as 'editableBlock' above but for notes.
cropControllers.directive('editableNote', function($http, $routeParams, $compile) {
  return {
	  restrict: 'C',
		link: function(scope, element, attr){
			element.on("change", function(){
				noteId = $(this).attr("id").substr(6);
				noteVal = $(this).val();

				if(noteId == '_new'){	//insert new note record
					var cropId = $routeParams.itemId;
					var aNoteType = $(this).attr("name").split('_');
					var noteType = aNoteType[1];
					
					if(noteVal[noteVal.length - 1] == "^"){	//if ^ code is used, add note to crop family rather than specific crop variety
						cropId = scope.familyCode;
						noteVal = noteVal.substr(0, noteVal.length - 1);	//get rid of ^ code
					}
					//Insert to DB
					$http.post('php/insertDataToCropnotes.php', {noteVal: noteVal, cropId:cropId, noteType:noteType, type:'insert'}).success(function(data2){	
						//add new note to 'notes' array so it displays in binded li repeat
						element.val('...add new note');
						element.css("width", "120px");
						var tempObj = new Object();
						tempObj.noteId = data2;
						tempObj.cropId = cropId;
						tempObj.noteCopy = noteVal;
						tempObj.noteType = noteType;
						switch(noteType){
							case "storage":
								scope.notesStorage.push(tempObj);
								break;
							case "harvest":
								scope.notesHarvest.push(tempObj);
								break;
							case "growing":
								scope.notesGrowing.push(tempObj);
								break;
							case "marketing":
								scope.notesMarketing.push(tempObj);
								break;
							case "general":
								scope.notesGeneral.push(tempObj);
								break;
						}
					});
					
				}else{	//update existing note record
					$http.post('php/insertDataToCropnotes.php', {noteVal: noteVal, noteId:noteId, type:'update'}).success(function(data2){
					});
				}
			});
		}
    }
});

//
cropControllers.directive('noteDelete', function($http, $routeParams, $compile) {
  return {
	  restrict: 'A',
		link: function(scope, element, attr){
			element.on("click", function(){
				var tempId = element.parent().find("textarea").attr("id");
				var thisNoteId = tempId.substr(6);
				var tempType = element.parent().find("textarea").attr("name");
				var aTempType = tempType.split("_");
				var thisNoteType = aTempType[1];
				thisNoteType = thisNoteType.charAt(0).toUpperCase() + thisNoteType.slice(1);
				//delete note from DB
				$http.post('php/deleteDataFromCROPNOTES.php', {noteId: thisNoteId, type:'single'}).success(function(data2){
					console.log("Note Deleted!");
					//remove deleted element from 'notes' array so it no longer displays in binded li repeat
					var thisArray = scope["notes"+thisNoteType];

					for(c = 0; c < thisArray.length; c++){
						if(thisArray[c].noteId == thisNoteId)
							thisArray.splice(c, 1);	
					}
				});
			});
		}
    }
});

//
cropControllers.directive('noteHighlight', function($http, $routeParams, $compile) {
  return {
	  restrict: 'A',
		link: function(scope, element, attr){
			element.on("click", function(){
				var thisListItem = element.parent();
				var tempId = $(thisListItem).find("textarea").attr("id");
				var thisNoteId = tempId.substr(6);
				//add highlight tag to note in DB to change it's class
				$http.post('php/updateDataForCROPNOTES.php', {type: "toggleHighlight", noteId: thisNoteId}).success(function(data2){
					if(data2 == 1){
						console.log("Note Highlight Toggled");
						//highlight element from 'notes' array so it updates in display 
						if($(thisListItem).hasClass("activeHighlight")) $(thisListItem).removeClass("activeHighlight");
						else $(thisListItem).addClass("activeHighlight");
					} 
				});
			});
		}
    }
});

//
cropControllers.directive('noteUniversal', function($http, $routeParams, $compile) {
  return {
	  restrict: 'A',
		link: function(scope, element, attr){
			element.on("click", function(){
				var thisListItem = element.parent();
				var tempId = $(thisListItem).find("textarea").attr("id");
				var thisNoteId = tempId.substr(6);

				//toggle DB crop id between universal and variety specific
				$http.post('php/updateDataForCROPNOTES.php', {type: "toggleScope", noteId: thisNoteId, varietyId: scope.whichItem}).success(function(data2){
					if(data2 == 0){
						console.log("Note scope set to 'variety'");
					} else if(data2 == 1){
						console.log("Note scope set to 'crop'");
					}
					//set styles to show scope status 
					if($(thisListItem).hasClass("activeUniversal")) $(thisListItem).removeClass("activeUniversal");
					else $(thisListItem).addClass("activeUniversal");
				});
			});
		}
    }
});



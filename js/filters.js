theFarmApp.filter('noempty', function() {
  return function(input) {
	if(input == null || input == '')
		return "--";
	else return input;
  };
})/*.filter('checkmark', function() {
  return function(input) {
    return input == 1 ? '\u2713' : '\u2718';
  };
})*/.filter('propMethod', function() {
  return function(input){
	  switch(input){
		case "indoorBlock":
			return "soil block";
			break;
		case "outdoorSeed":
			return "direct seed";
			break;
		case "cutting":
			return "cutting";
			break;
		default:
			return "error";
	  }
  }
}).filter('perc', function() {
  return function(input) {
	if(input == null || input == '')
		return "--";
	else if(input != null && input != 0 && input != '')
		return input+"%"; 
  };
}).filter('temp', function() {
  return function(input) {
	if(input == null || input == '')
		return "--";
	else if(input != null && input != 0 && input != '')
		return input+"°"; 
  };
}).filter('inches', function() {
  return function(input) {
	if(input == null || input == '')
		return "--";
	else if(input != null && input != 0 && input != '')
		return input+"\""; 
  };
}).filter('displayDate', function() {
  return function(input) {
	if(input == null || input == '')
		return "--";
	else if(input != null && input != 0 && input != '')
		return Number(input.substr(4, 2))+"/"+Number(input.substr(6,2))+"/"+input.substr(2,2);
  };
}).filter('longText', function() {
  return function(input) {
	if(input == null || input == '')
		return "n/a";
	else if(input != null && input != 0 && input != '')
		formattedInput = input.replace("&#176;", "°");
		return formattedInput;
  };
}).filter('unsafe', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
}).filter('byStatus', function() {
    return function(theTaskList, statuses) {
      var items = {
      	statuses: statuses,
      	out: []
      };
      angular.forEach(theTaskList, function (value, key) {
		if (this.statuses[value.taskStatus] === true) {
            this.out.push(value);
        }
      }, items);
      return items.out;
    }
  });
;
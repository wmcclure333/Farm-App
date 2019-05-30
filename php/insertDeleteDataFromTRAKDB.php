<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;
$seasonId = $request->seasonId;
$yearId = $request->yearId;
$thisTaskGroupId = $request->thisTaskGroupId;
$task = $request->task;

if($type == "complete"){	//insert completed task record to db
	$taskTotalResult = $request->taskTotalResult;
	$tDateCompleted = $request->tDateCompleted;
	$succession = $request->succession;
	$notes = $request->notes;

	$thisDate = date("Ymd");
	$sql='INSERT INTO trakdb (TaskGroupId, Task, Succession, TaskTotalResult, TDateCompleted, Notes, DateAdded, SeasonId, YearId) VALUES ("'.$thisTaskGroupId.'", "'.$task.'", "'.$succession.'", "'.$taskTotalResult.'", "'.$tDateCompleted.'", "'.$notes.'", '.$thisDate.', "'.$seasonId.'", '.$yearId.')';
	$rs=$db->query($sql);
	mysqli_close($db);
	if($rs == 1) echo "inserted to";
	else echo 0;

}else if($type == "resetToActive"){	//remove completed task record from db
	$succession = $request->succession;

	$sql='DELETE FROM trakdb WHERE TaskGroupId = "'.$thisTaskGroupId.'" AND Task = "'.$task.'" AND Succession = "'.$succession.'" AND SeasonId = "'.$seasonId.'" AND YearId = '.$yearId;
	$rs=$db->query($sql);
	mysqli_close($db);
	if($rs == 1) echo "deleted from";
	else echo 0;

}else if($type == "addHarvest"){	//add harvest record to db
	$taskTotalResult = $request->taskTotalResult;
	$tDateCompleted = $request->tDateCompleted;
	$notes = $request->notes;

	$thisDate = date("Ymd");
	$sql='INSERT INTO trakdb (TaskGroupId, Task, TaskTotalResult, TDateCompleted, Notes, DateAdded, SeasonId, YearId) VALUES ("'.$thisTaskGroupId.'", "harvest", "'.$taskTotalResult.'", "'.$tDateCompleted.'", "'.$notes.'", '.$thisDate.', "'.$seasonId.'", '.$yearId.')';
	$rs=$db->query($sql);
	mysqli_close($db);
	echo $rs;
}else if($type == "removeHarvest"){	//remove harvest record from db
	$thisHarvestId = $request->thisHarvestId;
	$sql='DELETE FROM trakdb WHERE EntryId = "'.$thisHarvestId.'" AND Task = "'.$task.'" AND SeasonId = "'.$seasonId.'" AND YearId = '.$yearId;
	$rs=$db->query($sql);
	mysqli_close($db);
	echo $rs;
}

?>
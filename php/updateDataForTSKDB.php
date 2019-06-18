<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;
$thisTaskId = $request->thisTaskId;

if($type == "disable"){
	$sql5='UPDATE tskdb SET TaskStatus="disabled" WHERE EntryId = "'.$thisTaskId.'"';
	$rs5=$db->query($sql5);
	mysqli_close($db);
	echo $rs5;
}else if($type == "complete"){
	$sql5='UPDATE tskdb SET TaskStatus="completed" WHERE EntryId = "'.$thisTaskId.'"';
	$rs5=$db->query($sql5);
	mysqli_close($db);
	echo $rs5;
}else if($type == "resetToActive"){
	$sql5='UPDATE tskdb SET TaskStatus="active" WHERE EntryId = "'.$thisTaskId.'"';
	$rs5=$db->query($sql5);
	mysqli_close($db);
	echo $rs5;
}else if($type == "update"){	//this just updates the notes field for now
	$updateField = $request->field;
	$updateVal = $request->val;
	$sql5='UPDATE tskdb SET '.$updateField.'="'.$updateVal.'" WHERE EntryId = "'.$thisTaskId.'"';
	$rs5=$db->query($sql5);
	mysqli_close($db);
	echo $rs5;
}else if($type == "updateSuccessions"){	//update succession value and all following successions within that task group
	$taskGroupId = $request->taskGroupId;
	$thisSuccession =  $request->thisSuccession;
	$thisTask = $request->thisTask;
	$valDifference = $request->valDifference;
	$newValue = $request->newValue;
	$aTasksToUpdateInGroup = [$thisTaskId];
	$aNewDateValuesToInsert = [$newValue];
	$aTempPlanId = explode("_", $taskGroupId);
	$planEntryId = $aTempPlanId[1];
	if(strcmp($thisTask,"transplant") != 0 && strcmp($thisTask, "seed o") != 0 && strcmp($thisTask, "cutting") != 0){
		//select all records from task group and store entry ids of those AFTER edited task in succession
		$sql4='SELECT * FROM tskdb WHERE TaskGroupId = "'.$taskGroupId.'" AND Succession = "'.$thisSuccession.'" AND Task <> "'.$thisTask.'"';
		$rs4=$db->query($sql4);
		$rs4->data_seek(0);
		$count = 0;
		while($row4 = $rs4->fetch_assoc()){
			switch($thisTask){
				case "seed i":
					if($row4['Task'] == "harden" || $row4['Task'] == "transplant"){
						array_push($aTasksToUpdateInGroup, $row4['EntryId']);
						array_push($aNewDateValuesToInsert, ($row4['TDate'] + $valDifference));
					}
					break;
				case "harden":
					if($row4['Task'] == "transplant"){
						array_push($aTasksToUpdateInGroup, $row4['EntryId']);
						array_push($aNewDateValuesToInsert, ($row4['TDate'] + $valDifference));
					}
					break;
			}
		}
	}

	//cycle through stored entry ids and update succession dates of those records in DB
	for($c = 0; $c < count($aTasksToUpdateInGroup); $c++){
		$sql5='UPDATE tskdb SET TDate="'.$aNewDateValuesToInsert[$c].'" WHERE EntryId = "'.$aTasksToUpdateInGroup[$c].'"';
		$rs5=$db->query($sql5);
	}

	//if the 1st task in the succession is changes, update the planDB succession value also
	if(strcmp($thisTask,"seed i") == 0 || strcmp($thisTask, "seed o") == 0 || strcmp($thisTask, "cutting") == 0){
		$sql6='UPDATE plandb SET SuccessionDate'.$thisSuccession.'="'.$newValue.'" WHERE EntryId = "'.$planEntryId.'"';
		$rs6=$db->query($sql6);
	}

	mysqli_close($db);
	if($c == 1 && $rs5 == 1) echo "Task record updated";
	else if($rs5 == 1) echo "Successions in task group updated";
	else echo "Error with task update";
}


?>

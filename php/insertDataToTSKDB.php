<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;
$seasonId = $request->seasonId;
$yearId = $request->yearId;

if($type == "generate"){
	$aTasks = $request->aTasks;

	//remove all existing "replaceable" tasks from db before adding new tasks
	//$sql1='DELETE FROM tskdb WHERE TaskStatus <> "completed" AND OverwriteStatus = "replaceable" AND SeasonId = "'.$seasonId.'" AND YearId = '.$yearId;
	//$rs1=$db->query($sql1);


	if(sizeof($aTasks) == 0){	//if deleting the last crop from plan, skip the insert below and return a success value
		$rs = 1;
	}else{
		$thisDate = date("Ymd");
		foreach($aTasks as &$task){
			//check to see if entry already exists in db from previous generation.  If it exists under a "completed" status, skip insert.
			$sql0='SELECT * FROM tskdb WHERE SeasonId = "'.$seasonId.'" AND YearId = '.$yearId.' AND TaskGroupId = "'.$task->taskGroupId.'" AND Task = "'.$task->task.'" AND Succession = "'.$task->succession.'" AND TaskStatus = "completed"';
			$rs0=$db->query($sql0);
			$rs0->data_seek(0);
			$count = 0;
			while($row = $rs0->fetch_assoc()){
				$count++;
			}

			if($count == 0){
				$sql='INSERT INTO tskdb (OverwriteStatus, TaskStatus, TaskGroupId, Subject, Plot, Task, TDate, BedAmount, Succession, Notes, DateAdded, SeasonId, YearId) VALUES ("replaceable", "active", "'.$task->taskGroupId.'", "'.$task->subject.'", "'.$task->plot.'", "'.$task->task.'", "'.$task->tdate.'", "'.$task->amount.'", "'.$task->succession.'", "'.$task->notes.'", '.$thisDate.', "'.$seasonId.'", '.$yearId.')';
				$rs=$db->query($sql);	
			}
		}
	}

	mysqli_close($db);
	echo $rs;

}else if($type == "addnewtask"){
	$thisDate = date("Ymd");
	$sql='INSERT INTO tskdb (OverwriteStatus, TaskStatus, TaskGroupId, Subject, TDate, SeasonId, YearId, DateAdded) VALUES ("protected", "active", "p_0", "New Task", -100, "'.$seasonId.'", '.$yearId.', '.$thisDate.')';
	$rs=$db->query($sql);
	mysqli_close($db);
	echo $rs;
}

?>
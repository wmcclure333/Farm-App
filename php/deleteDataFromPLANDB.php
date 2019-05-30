<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;
$seasonId = $request->seasonId;
$yearId = $request->yearId;

if($type == "single"){
	//remove plan record from PLANDB
	$entryId = $request->entryId;
	$sql='DELETE FROM plandb WHERE EntryId = '.$entryId;
	$rs=$db->query($sql);

	$taskGroupId = $request->taskGroupId;
	//remove all existing "unprotected" & "uncompleted" tasks from TSKDB matching the task group of the removed plan record
	$sql2='DELETE FROM tskdb WHERE TaskStatus <> "completed" AND OverwriteStatus <> "protected" AND TaskGroupId = "'.$taskGroupId.'" AND SeasonId = "'.$seasonId.'" AND YearId = '.$yearId;
	$rs2=$db->query($sql2);

	mysqli_close($db);
	echo $rs;
}else if($type == ""){
	/*$thisDate = date("Ymd");
	$sql='INSERT INTO plandb (VarietyId, SeasonId, YearId, Succession1, Succession2, Succession3, Succession4, Succession5, Succession6, Succession7, Succession8, Succession9, Succession10, DateAdded) VALUES ('.$varietyId.', "'.$seasonId.'", '.$yearId.', '.$succession1.', '.$succession2.', '.$succession3.', '.$succession4.', '.$succession5.', '.$succession6.', '.$succession7.', '.$succession8.', '.$succession9.', '.$succession10.', '.$thisDate.')';
	$rs=$db->query($sql);
	echo $rs;*/
}

?>
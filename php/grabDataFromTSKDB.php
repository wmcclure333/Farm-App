<?php
/*
*/
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$seasonId = $request->seasonId;
$yearId = $request->yearId;

$sql='SELECT * FROM tskdb WHERE SeasonId = "'.$seasonId.'" AND YearId = '.$yearId;//.' AND TaskStatus not IN ("disabled", "completed")';
$rs=$db->query($sql);
$rs->data_seek(0);
$count = 0;
while($row = $rs->fetch_assoc()){
	$thisRec = null;
    $thisRec->entryId = $row['EntryId'];
    $thisRec->overwriteStatus = $row['OverwriteStatus'];
    $thisRec->taskStatus = $row['TaskStatus'];
    $thisRec->taskGroupId = $row['TaskGroupId'];
    $thisRec->subject = $row['Subject'];
    $thisRec->plot = $row['Plot'];
    $thisRec->task = $row['Task'];
    $thisRec->tDate = floatval($row['TDate']);
    $thisRec->amount = $row['BedAmount'];
    $thisRec->succession = $row['Succession'];
    $thisRec->notes = $row['Notes'];
    $thisRec->dateAdded = $row['DateAdded'];
    $thisRec->seasonId = $row['SeasonId'];
    $thisRec->yearId = $row['YearId'];
	$aRecs[$count] = $thisRec;
	$count++;
}

mysqli_close($db);

$returnData->aRecs = $aRecs;
echo json_encode($returnData);

?>
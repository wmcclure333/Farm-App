<?php
/*
*/
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;

$seasonId = $request->seasonId;
$yearId = $request->yearId;

if($type == "allharvest"){    //grab all harvest records only

    $sql='SELECT * FROM trakdb WHERE Task = "harvest" AND SeasonId = "'.$seasonId.'" AND YearId = '.$yearId;
    $rs=$db->query($sql);
    $rs->data_seek(0);
    $count = 0;
    while($row = $rs->fetch_assoc()){
    	$thisRec = null;
        $thisRec->entryId = $row['EntryId'];
        $thisRec->taskGroupId = $row['TaskGroupId'];
        $thisRec->succession = $row['Succession'];     
        $thisRec->taskTotalResult = $row['TaskTotalResult'];
        $thisRec->tDateCompleted = floatval($row['TDateCompleted']);
        $thisRec->notes = $row['Notes'];
        $thisRec->dateAdded = $row['DateAdded'];
    	$aRecs[$count] = $thisRec;
    	$count++;
    }

    mysqli_close($db);

    $returnData->aRecs = $aRecs;
    echo json_encode($returnData);
}else if($type == "all"){ //grab all records

}
?>
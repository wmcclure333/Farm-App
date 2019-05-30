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

$sql='SELECT * FROM plandb WHERE SeasonId = "'.$seasonId.'" AND YearId = '.$yearId;
$rs=$db->query($sql);
$rs->data_seek(0);
$count = 0;
while($row = $rs->fetch_assoc()){
	$thisRec = null;
    $thisRec->entryId = $row['EntryId'];
    $thisRec->varietyId = $row['VarietyId'];
    $thisRec->seasonId = $row['SeasonId'];
    $thisRec->yearId = $row['YearId'];
    $thisRec->succession1 = $row['Succession1'];
    $thisRec->succession2 = $row['Succession2'];
    $thisRec->succession3 = $row['Succession3'];
    $thisRec->succession4 = $row['Succession4'];
    $thisRec->succession5 = $row['Succession5'];
    $thisRec->succession6 = $row['Succession6'];
    $thisRec->succession7 = $row['Succession7'];
    $thisRec->succession8 = $row['Succession8'];
    $thisRec->succession9 = $row['Succession9'];
    $thisRec->succession10 = $row['Succession10'];
    $thisRec->successionDate1 = $row['SuccessionDate1'];
    $thisRec->successionDate2 = $row['SuccessionDate2'];
    $thisRec->successionDate3 = $row['SuccessionDate3'];
    $thisRec->successionDate4 = $row['SuccessionDate4'];
    $thisRec->successionDate5 = $row['SuccessionDate5'];
    $thisRec->successionDate6 = $row['SuccessionDate6'];
    $thisRec->successionDate7 = $row['SuccessionDate7'];
    $thisRec->successionDate8 = $row['SuccessionDate8'];
    $thisRec->successionDate9 = $row['SuccessionDate9'];
    $thisRec->successionDate10 = $row['SuccessionDate10'];
    $thisRec->dateAdded = $row['DateAdded'];
	$aRecs[$count] = $thisRec;
	$count++;
}

mysqli_close($db);

$returnData->aRecs = $aRecs;
echo json_encode($returnData);

?>
<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;
$varietyId = $request->varietyId;
$seasonId = $request->seasonId;
$yearId = $request->yearId;
$succession1 = $request->succession1; $succession2 = $request->succession2; $succession3 = $request->succession3; $succession4 = $request->succession4; $succession5 = $request->succession5; $succession6 = $request->succession6; $succession7 = $request->succession7; $succession8 = $request->succession8; $succession9 = $request->succession9; $succession10 = $request->succession10;
$successionDate1 = $request->successionDate1; $successionDate2 = $request->successionDate2; $successionDate3 = $request->successionDate3; $successionDate4 = $request->successionDate4; $successionDate5 = $request->successionDate5; $successionDate6 = $request->successionDate6; $successionDate7 = $request->successionDate7; $successionDate8 = $request->successionDate8; $successionDate9 = $request->successionDate9; $successionDate10 = $request->successionDate10;

//set data to 0 if empty
if($succession1 == "") $succession1 = 0; if($succession2 == "") $succession2 = 0; if($succession3 == "") $succession3 = 0; if($succession4 == "") $succession4 = 0; if($succession5 == "") $succession5 = 0; if($succession6 == "") $succession6 = 0; if($succession7 == "") $succession7 = 0; if($succession8 == "") $succession8 = 0; if($succession9 == "") $succession9 = 0; if($succession10 == "") $succession10 = 0;
if($successionDate1 == "") $successionDate1 = -100; if($successionDate2 == "") $successionDate2 = -100; if($successionDate3 == "") $successionDate3 = -100; if($successionDate4 == "") $successionDate4 = -100; if($successionDate5 == "") $successionDate5 = -100; if($successionDate6 == "") $successionDate6 = -100; if($successionDate7 == "") $successionDate7 = -100; if($successionDate8 == "") $successionDate8 = -100; if($successionDate9 == "") $successionDate9 = -100; if($successionDate10 == "") $successionDate10 = -100;

if($type == "update"){
	/*$updateVal = $request->val;
	$updateField = $request->field;
	$updateCrop = $request->cropid;
	
	$sql='UPDATE mcdb SET '.$updateField.'="'.$updateVal.'" WHERE VarietyId = '.$updateCrop;
	$rs=$db->query($sql);*/
}else if($type == "insert"){
	$thisDate = date("Ymd");
	$sql='INSERT INTO plandb (VarietyId, SeasonId, YearId, Succession1, Succession2, Succession3, Succession4, Succession5, Succession6, Succession7, Succession8, Succession9, Succession10, SuccessionDate1, SuccessionDate2, SuccessionDate3, SuccessionDate4, SuccessionDate5, SuccessionDate6, SuccessionDate7, SuccessionDate8, SuccessionDate9, SuccessionDate10,  DateAdded) VALUES ('.$varietyId.', "'.$seasonId.'", '.$yearId.', '.$succession1.', '.$succession2.', '.$succession3.', '.$succession4.', '.$succession5.', '.$succession6.', '.$succession7.', '.$succession8.', '.$succession9.', '.$succession10.', '.$successionDate1.', '.$successionDate2.', '.$successionDate3.', '.$successionDate4.', '.$successionDate5.', '.$successionDate6.', '.$successionDate7.', '.$successionDate8.', '.$successionDate9.', '.$successionDate10.', '.$thisDate.')';
	$rs=$db->query($sql);
	mysqli_close($db);
	echo $rs;
}

?>
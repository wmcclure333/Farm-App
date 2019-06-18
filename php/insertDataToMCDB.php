<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;

if($type == "update"){
	$updateVal = $request->val;
	$updateField = $request->field;
	$updateCrop = $request->cropid;
	
	$sql='UPDATE mcdb SET '.$updateField.'="'.$updateVal.'" WHERE VarietyId = '.$updateCrop;
	$rs=$db->query($sql);
	mysqli_close($db);
}else if($type == "insert"){
	$thisDate = date("Ymd");
	$sql='INSERT INTO mcdb (DateAdded) VALUES ('.$thisDate.')';
	$rs=$db->query($sql);
	
	$sql='SELECT VarietyId FROM mcdb ORDER BY VarietyId DESC';
	$rs=$db->query($sql);
	$rs->data_seek(0);
	$row = $rs->fetch_assoc();
        $thisCropId = $row['VarietyId'];
	
	mysqli_close($db);
	echo $thisCropId;
}


//echo $updateField.":".$updateVal;

?>

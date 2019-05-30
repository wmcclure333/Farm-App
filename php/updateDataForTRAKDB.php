<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;
$harvestid = $request->harvestid;

if($type == "update"){	
	$updateField = $request->field;
	$updateVal = $request->val;
	$sql5='UPDATE trakdb SET '.$updateField.'="'.$updateVal.'" WHERE EntryId = "'.$harvestid.'"';
	$rs5=$db->query($sql5);
	mysqli_close($db);
	echo $rs5;
}

?>
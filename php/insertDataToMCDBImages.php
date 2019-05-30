<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;

if($type == "update"){
	$aRadios = $request->radios;
	foreach($aRadios as $radio){
		$sql='UPDATE mcdb_images SET IsThumb ="'.$radio->isThumb.'" WHERE Mark = "'.$radio->mark.'"';
		$rs=$db->query($sql);
	}
	mysqli_close($db);
}else if($type == "insert"){
	$thisDate = date("Ymd");
	$thisId = $request->id;
	$fileName = $request->fileName;
	$fileCaption = $request->fileCaption;
	//$isThumb = $request->isThumb;
	//if($isThumb == 1) $fileName .= "-150x150.png";
	//else if($isThumb == 0) $fileName .= "-300x200.png";
	$sql='INSERT INTO mcdb_images (VarietyId, DateAdded, ImageFile, ImageCaption, IsThumb) VALUES ('.$thisId.', '.$thisDate.', "'.$fileName.'", "'.$fileCaption.'", 0)';
	$rs=$db->query($sql);
	mysqli_close($db);

	//echo $thisCropId;
}



?>
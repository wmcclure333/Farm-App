<?php
/*
*/
error_reporting(E_ERROR);
include("aa_link.php");
//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$dataType = $request->dataType;

if($dataType == "single"){
	$cropId = $request->cropId;

	//Grab image data
	$sql3='SELECT * FROM mcdb_images WHERE VarietyId = '.$cropId;
	$rs3=$db->query($sql3);
	$rs3->data_seek(0);
	$count3 = 0;
	while($row3 = $rs3->fetch_assoc()){
		$thisRec3 = null;
		$thisRec3->mark = $row3['Mark'];
		$thisRec3->isThumb = $row3['IsThumb'];
		$thisRec3->imageFile = $row3['ImageFile'];
		$thisRec3->imageCaption = $row3['ImageCaption'];
		$thisRec3->dateAdded = $row3['DateAdded'];
		$aImages[$count3] = $thisRec3;
		$count3++;
	}
}

mysqli_close($db);
		
echo json_encode($aImages);

?>
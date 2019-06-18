<?php

error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$dataType = $request->dataType;
if($dataType == "single"){
	$cropFamId = $request->cropFamId;
	$sql='SELECT * FROM ccdb WHERE CropCode = "'.$cropFamId.'"';
}else{
	$sql='SELECT * FROM ccdb  ORDER BY CropName ASC';
}
 
$rs=$db->query($sql);
$rs->data_seek(0);
$count = 0;
while($row = $rs->fetch_assoc()){
	$thisRec = null;
    	$thisRec->cropIndex = $row['index'];
    	$thisRec->cropCode = $row['CropCode'];
    	$thisRec->cropName = $row['CropName'];
	$aRecs[$count] = $thisRec;
	$count++;
}
mysqli_close($db);
		
echo json_encode($aRecs);

?>

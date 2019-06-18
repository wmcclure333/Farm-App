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
	$cropFamId = $request->cropFamId;
	$sql='SELECT * FROM cropnotes WHERE CropId = "'.$cropId.'" OR CropId = "'.$cropFamId.'"';
}else{
	$sql='SELECT * FROM cropnotes';
}
 
$rs=$db->query($sql);
$rs->data_seek(0);
$count = 0;
while($row = $rs->fetch_assoc()){
	$thisRec = null;
    	$thisRec->noteId = $row['NoteId'];
    	$thisRec->cropId = $row['CropId'];
	if($thisRec->cropId / 1000 >= 1) $thisRec->isUniversal = 1;
	else $thisRec->isUniversal = 0;
    	$thisRec->noteType = $row['NoteType'];
    	$thisRec->isNoteHighlighted = $row['IsNoteHighlighted'];
    	$thisRec->noteCopy = $row['NoteCopy'];
   	 $thisRec->dateAdded = $row['DateAdded'];
	$aRecs[$count] = $thisRec;
	$count++;
}
mysqli_close($db);
		
echo json_encode($aRecs);

?>

<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;

if($type == "toggleHighlight"){
	$noteId = $request->noteId;

	$sql0='SELECT * FROM cropnotes WHERE NoteId = "'.$noteId.'"';
	$rs0=$db->query($sql0);
	$rs0->data_seek(0);
	while($row = $rs0->fetch_assoc()){
	    $thisHighlightVal = $row['IsNoteHighlighted'];
	    if($thisHighlightVal == 0) $thisHighlightVal = 1;
	    else $thisHighlightVal = 0;
	}

	$sql='UPDATE cropnotes SET IsNoteHighlighted="'.$thisHighlightVal.'" WHERE NoteId = "'.$noteId.'"';
	$rs=$db->query($sql);

	mysqli_close($db);
	echo $rs;
}else if($type == "toggleScope"){
	$noteId = $request->noteId;
	$varietyId = $request->varietyId;
	$scopeToggledTo = 0; //binary returned to indicate if final scope is at crop or variety level

	$sql0='SELECT * FROM cropnotes WHERE NoteId = "'.$noteId.'"';
	$rs0=$db->query($sql0);
	$rs0->data_seek(0);
	while($row = $rs0->fetch_assoc()){
	    $thisCropId = $row['CropId'];
	    //check if note is set to crop scope or variety scope.  
	    if($thisCropId / 1000 >= 1) $newCropIdScope = $varietyId;
	    else{
	    	//grab crop code using variety id
	    	$sql1='SELECT * FROM mcdb WHERE VarietyId = '.$thisCropId;
			$rs1=$db->query($sql1);
			//$rs1->data_seek(0);
			while($row1 = $rs1->fetch_assoc()){
			    $thisCropCode = $row1['CropCode'];
			}
	    	//grab crop id using crop code
	    	$sql2='SELECT * FROM ccdb WHERE CropCode = "'.$thisCropCode.'"';
			$rs2=$db->query($sql2);
			//$rs2->data_seek(0);
			while($row2 = $rs2->fetch_assoc()){
			    $thisCropId = $row2['index'];
			}
			//set scope to crop id
			if($thisCropId < 10) $thisCropId = "0".$thisCropId;
			$newCropIdScope = "10".$thisCropId;
			$scopeToggledTo = 1;	//set scope indicator to crop level
	    }
	}

	$sql='UPDATE cropnotes SET CropId="'.$newCropIdScope.'" WHERE NoteId = "'.$noteId.'"';
	$rs=$db->query($sql);
	mysqli_close($db);

	echo $scopeToggledTo;
}

?>
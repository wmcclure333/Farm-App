<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;
$thisDate = date("Ymd");

if($type == "delete"){
	$noteId = $request->noteId;
	$sql='DELETE FROM cropnotes WHERE NoteId='.$noteId;
	$rs=$db->query($sql);
}else if($type == "update"){
	$noteId = $request->noteId;
	$noteVal = $request->noteVal;
	$sql='UPDATE cropnotes SET NoteCopy="'.$noteVal.'", DateModified="'.$thisDate.'" WHERE NoteId = '.$noteId;
	$rs=$db->query($sql);
}else if($type == "insert"){
	$cropId = $request->cropId;
	$noteVal = $request->noteVal;
	$noteType = $request->noteType;
	
	$sql='INSERT INTO cropnotes (CropId, NoteType, NoteCopy, DateAdded) VALUES ('.$cropId.', "'.$noteType.'", "'.$noteVal.'", "'.$thisDate.'")';
	$rs=$db->query($sql);
	
	$sql='SELECT NoteId FROM cropnotes ORDER BY NoteId DESC';
	$rs=$db->query($sql);
	$rs->data_seek(0);
	$row = $rs->fetch_assoc();
    $thisNoteId = $row['NoteId'];
	
	mysqli_close($db);
	echo $thisNoteId;
}

?>
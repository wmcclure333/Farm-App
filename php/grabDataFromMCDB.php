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
	$sql='SELECT * FROM mcdb WHERE VarietyId = '.$cropId;
}else{
	$sql='SELECT * FROM mcdb ORDER BY VarietyName ASC';
	$sqlIm='SELECT * FROM mcdb_images WHERE IsThumb = 1';
	$rsIm=$db->query($sqlIm);
	$rsIm->data_seek(0);
	$countIm = 0;
	$aThumbs = [];
	while($rowIm = $rsIm->fetch_assoc()){
		$thisRecIm = null;
		$thisRecIm->varietyId = $rowIm['VarietyId'];
		$thisRecIm->imageThumb = $rowIm['ImageFile'];
		$aThumbs[$countIm] = $thisRecIm;
		$countIm++;
	}
}


 
$rs=$db->query($sql);
$rs->data_seek(0);
$count = 0;
while($row = $rs->fetch_assoc()){
	$thisRec = null;
    $thisRec->varietyId = $row['VarietyId'];
    $thisRec->varietyName = $row['VarietyName'];
    $thisRec->cropCode = $row['CropCode'];
    $thisRec->isOrganic = $row['IsOrganic'];
    $thisRec->isHeirloom = $row['IsHeirloom'];
    $thisRec->isMixedVarietySeed = $row['IsMixedVarietySeed'];
    $thisRec->isPerennial = $row['IsPerennial'];
    $thisRec->propagationMethod = $row['PropagationMethod'];
    $thisRec->numSeedsSownForEach = $row['NumSeedsSownForEach'];
    $thisRec->isBlockMini = $row['IsBlockMini'];
    $thisRec->isBlockMedium = $row['IsBlockMedium'];
    $thisRec->isBlockLarge = $row['IsBlockLarge'];
    $thisRec->springFirstSeedingDate = $row['SpringFirstSeedingDate'];
    $thisRec->springLastSeedingDate = $row['SpringLastSeedingDate'];
    $thisRec->fallFirstSeedingDate = $row['FallFirstSeedingDate'];
    $thisRec->fallLastSeedingDate = $row['FallLastSeedingDate'];
    $thisRec->germinationRate = $row['GerminationRate'];
    $thisRec->germinationTemp = $row['GerminationTemp'];
    $thisRec->idealGerminationTemp = $row['IdealGerminationTemp'];
    $thisRec->daysToTransplant = $row['DaysToTransplant'];
    $thisRec->daysToMaturity = $row['DaysToMaturity'];
    $thisRec->storageTemp = $row['StorageTemp'];
    $thisRec->storageHumidity = $row['StorageHumidity'];
    $thisRec->precoolingMethod = $row['PrecoolingMethod'];
    $thisRec->storageLife = $row['StorageLife'];
    $thisRec->isEthyleneSensitive = $row['IsEthyleneSensitive'];
    $thisRec->pH = $row['PH'];
    $thisRec->growingTemp = $row['GrowingTemp'];
    $thisRec->idealTemp = $row['IdealTemp'];
    $thisRec->plantHeight = $row['PlantHeight'];
    $thisRec->plantSpacing = $row['PlantSpacing'];
    $thisRec->rowSpacing = $row['RowSpacing'];
    $thisRec->seedDepth = $row['SeedDepth'];
    $thisRec->seedSupplier = $row['SeedSupplier'];
    $thisRec->searchKeywords = $row['SearchKeywords'];
    $thisRec->dateAdded = $row['DateAdded'];
	foreach($aThumbs as $thumb){
		if($thumb->varietyId == $thisRec->varietyId){
			$thisRec->imageThumb = $thumb->imageThumb."-150x150.png";//str_replace("300x200", "150x150", $thumb->imageThumb);
			break;	
		}
	}
	$aRecs[$count] = $thisRec;
	$count++;
}

//Grab multi-choice field data
$sql2='SELECT * FROM mcdb_set_options';
$rs2=$db->query($sql2);
$rs2->data_seek(0);
$count2 = 0;
while($row2 = $rs2->fetch_assoc()){
	$thisRec2 = null;
    $thisRec2->fieldName = $row2['FieldName'];
    $thisRec2->fieldValue = $row2['FieldValue'];
	$aFields[$count2] = $thisRec2;
	$count2++;
}

mysqli_close($db);

$returnData->aRecs = $aRecs;
$returnData->aFields = $aFields;
echo json_encode($returnData);

?>
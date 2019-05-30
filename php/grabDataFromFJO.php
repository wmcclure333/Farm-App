<?php
/*
*/
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
//$dataType = $request->dataType;
$dataType = "single";
if($dataType == "single"){
	$keywordList = $request->searchKeywords;
	$aSearchTheseKeywords = explode(",", $keywordList);
	$count = 0;
	foreach($aSearchTheseKeywords as $keyword){
		$aSearchTheseKeywordsAsSeparateWords[$count] = " ".$keyword." ";
		$count++;
	}
	$sql='SELECT * FROM wp_posts';
}
 
$rs=$dbFJO->query($sql);
$rs->data_seek(0);
$count = 0;
$aRecs = [];
while($row = $rs->fetch_assoc()){
	$thisRec = null;
	$checkThisCopy = $row['post_content'];
	foreach($aSearchTheseKeywordsAsSeparateWords as $keyword){
		if(strpos($checkThisCopy, $keyword) !== false){ 
			$thisRec->postId = $row['ID'];
			$tempStr = $checkThisCopy;
			//remove chars that may break code
			$tempStr = preg_replace("/[^A-Za-z0-9\-.\_:\"\'=\[\]\<\>\n\r\/&; ]/", '', $tempStr);
			$tempStr = str_replace("</li>\n", "</li>", $tempStr);
			$tempStr = str_replace("\n", "<br>", $tempStr);
			//$tempStr = str_replace("</li><br>", "</li>", $tempStr);
			$thisRec->postContent = $tempStr;
			$thisRec->postTitle = $row['post_title'];
			$thisRec->postDate = substr($row['post_date'], 0, 10);
			$thisRec->postModified = substr($row['post_modified'], 0, 10);
			$aRecs[$count] = $thisRec;
			$count++;
		}
	}
}

//grab term index # based on keywords passed in
$sql='SELECT * FROM wp_terms';
$rs=$dbFJO->query($sql);
$rs->data_seek(0);
$count = 0;
$aTermIds = [];
while($row = $rs->fetch_assoc()){
	$checkThisTerm = $row['name'];
	foreach($aSearchTheseKeywords as $keyword){
		if($checkThisTerm == $keyword){ 
			$aTermIds[$count] = $row['term_id'];
			$count++;
		}
	}
}
//grab crop taxonomy ids based on term ids
$sql='SELECT * FROM wp_term_taxonomy';
$rs=$dbFJO->query($sql);
$rs->data_seek(0);
$count = 0;
$aTaxonomyIds = [];
while($row = $rs->fetch_assoc()){
	$checkThisTerm = $row['term_id'];
	foreach($aTermIds as $term){
		if($term == $checkThisTerm){
			$aTaxonomyIds[$count] = $row['term_taxonomy_id'];
			$count++;
		}
	}
}

//grab post ids based on term ids
$sql='SELECT * FROM wp_term_relationships';
$rs=$dbFJO->query($sql);
$rs->data_seek(0);
$count = 0;
$aPostIds = [];
while($row = $rs->fetch_assoc()){
	$checkThisTerm = $row['term_taxonomy_id'];
	foreach($aTaxonomyIds as $term){
		if($term == $checkThisTerm){
			$aPostIds[$count] = $row['object_id'];
			$count++;
		}
	}
}

//grab post records based on the list of post ids
$count = count($aRecs);
foreach($aPostIds as $postid){
	$sql='SELECT * FROM wp_posts WHERE ID = '.$postid;
	$rs=$dbFJO->query($sql);
	$rs->data_seek(0);
	while($row = $rs->fetch_assoc()){
		$thisRec = null;
		$thisRec->postId = $row['ID'];
		$tempStr = $row['post_content'];
		//$tempStr = substr($tempStr, 0, 3489);
		//$tempStr = ltrim($tempStr);
		$tempStr = preg_replace("/[^A-Za-z0-9\-.\_:\"\'=\[\]\<\>\n\r\/&%; ]/", '', $tempStr);
		$tempStr = str_replace("</li>\n", "</li>", $tempStr);
		$tempStr = str_replace("\n", "<br>", $tempStr);
		//$tempStr = str_replace("</li><br>", "</li>", $tempStr);
		/*$tempStr = str_replace('[', '', $tempStr);
		$tempStr = str_replace(']', '', $tempStr);
		$tempStr = str_replace('=', '', $tempStr);
		$tempStr = str_replace('<', '', $tempStr);
		$tempStr = str_replace('>', '', $tempStr);
		$tempStr = str_replace('/', '', $tempStr);
		$tempStr = str_replace(':', '', $tempStr);
		$tempStr = str_replace("'", "", $tempStr);*/
		$thisRec->postContent = $tempStr;
		$thisRec->postTitle = $row['post_title'];
		$thisRec->postDate = substr($row['post_date'], 0, 10);
		$thisRec->postModified = substr($row['post_modified'], 0, 10);
		/*if($thisRec->postId == "858")*/ $aRecs[$count] = $thisRec;
		$count++;
	}
}

//remove duplicate posts
$aCompRecs = $aRecs;
$aIndicesToRemove = [];
foreach($aRecs as $rec){
	$count = 0;
	foreach($aRecs as $compRec){
		if($compRec->postId == $rec->postId){
			if(!in_array($compRec->postId, $aIndicesToRemove))
				array_push($aIndicesToRemove, $compRec->postId);
		}
		$count++;
	}	
}/*
$highestIndex = $aIndicesToRemove[0]; $count = 0;
$aIndicesToRemoveSorted = [];
for($c = 0; $c < count($aIndicesToRemove); $c++){
	foreach($aIndicesToRemove as $indexToDelete){
		if($indexToDelete > $highestIndex){
			$highestIndex = $indexToDelete;
		}
	}
	$aIndicesToRemoveSorted[$c] = $highestIndex;
}*/
foreach($aIndicesToRemove as $removeThisId){
	$count = 0; $firstOne = 0;
	foreach($aCompRecs as $thisPost){
		if($thisPost->postId == $removeThisId){
			if($firstOne > 0){
				array_splice($aCompRecs, $count, 1);
			}
			$firstOne++;
		}
		$count++;
	}
}

mysqli_close($dbFJO);

echo json_encode($aCompRecs);
?>
<?php
error_reporting(E_ERROR);
include("aa_link.php");

//post data needs to be broken down since angular has sent the data in JSON format, not in $_POST vars
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);

$type = $request->type;

if($type == "single"){
	$thisTaskId = $request->thisTaskId;
	//$succession = $request->succession;

	//$sql='DELETE FROM tskdb WHERE TaskGroupId = "'.$taskGroupId.'" AND Succession = "'.$succession.'"';
	//$rs=$db->query($sql);

	//$rs = 1;

	//grab all other tasks in deleted group and edit succession values
	//if($rs == 1){
		/*$sql2='SELECT * FROM tskdb WHERE TaskGroupId = "'.$taskGroupId.'"';
		$rs2=$db->query($sql2);
		$rs2->data_seek(0);*/
		
		//loop through successions and edit the ones higher than deleted succession to slide down a notch
		/*while($row = $rs2->fetch_assoc()){
			if($row['Succession'] > $succession){
			    $thisId = $row['EntryId'];
			    $thisNewSuccession = $row['Succession'] - 1;
			    if($thisNewSuccession < 1) $thisNewSuccession = 1;

				$sql3='UPDATE tskdb SET Succession="'.$thisNewSuccession.'" WHERE EntryId = '.$thisId;
				$rs3=$db->query($sql3);			
			}
		}*/

		//remove deleted succession in plandb so re-generated task lists don't re-create deleted task
		/*$thisPlanRecord = explode("_", $taskGroupId);
		$sql4='SELECT * FROM plandb WHERE EntryId = "'.$thisPlanRecord[1].'"';
		$rs4=$db->query($sql4);
		$rs4->data_seek(0);
		$count = $succession;
		$aNewSuccessionValues = [];
		while($row4 = $rs4->fetch_assoc()){
			while($count <= 9){
				$aNewSuccessionValues[$count-1] = $row4['Succession'.($count+1)];
				$count++;
			}
		}*/

		/*while($succession <= 9){
			$sql5='UPDATE plandb SET Succession'.$succession.'="'.$aNewSuccessionValues[$succession-1].'" WHERE EntryId = "'.$thisPlanRecord[1].'"';
			$rs5=$db->query($sql5);
			$succession++;
		}*/
	//}

	$sql5='UPDATE tskdb SET TaskStatus="disabled" WHERE EntryId = "'.$thisTaskId.'"';
	$rs5=$db->query($sql5);
	mysqli_close($db);
	echo $rs5;
}else if($type == ""){

}

?>
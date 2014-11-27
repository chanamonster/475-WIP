$(function(){

	getChores()
	getChoresForDropdown();


	//show chore popup
	$('#chore_add_pg').click(function(){
		$('#chore_add_bkgd').fadeIn();
		$('#chore_add_popup').fadeIn();
		// $('#choices').fadeIn();
		// $('#chore_add_form').fadeOut();
	})

	//hide chore popup
	$('#chore_add_x').click(function(){
		$('#chore_add_bkgd').fadeOut();

		//clear form fields
	})
	$('#chore_feedback_close').click(function(){
		$('#chore_add_bkgd').fadeOut();
		$('#chore_feedback_popup').fadeOut();
		//clear form fields
	})

	//choose which type of chore form
	$('#existing_chore').click(function(){
		$('#choices').fadeOut();
		// getChoresForDropdown();
		// getMembersForDropdown();
		$('#chore_add_form').fadeIn();
	})

	//////// CHORE ADD ////////
	$('#chore_type').change(function(){
		chore_type = $('#chore_type').val();
		if (chore_type != 'onetime'){
			$('#repeat_form').slideDown();
		} else {
			console.log("chore display", $('chore_type').css("display"));
			if ($('chore_type').css("display") != "none"){
				$('#repeat_form').slideUp();
			}
		}

		if (chore_type == 'rotating'){
			$('#span_assignee').html('Start with: ');
		} else {
			$('#span_assignee').html('Assign to: ');
		}
	})

	$('input[name=rate_frequency]').change(function(){
		// console.log($('input[name=rate_frequency]:checked').val());
		rf = $('input[name=rate_frequency]:checked').val();
		if (rf == "daily"){
			$('#span_rate').html('day');
		} else if (rf == "weekly"){
			$('#span_rate').html('week');
		} else { //rf == "monthly"
			$('#span_rate').html('month');
		}
	})

	$('#new_or_old').change(function(){
		noo = $('#new_or_old').val();
		if (noo == "new"){
			$('#old_chore').slideUp();
			$('#new_chore_input').slideDown();
		} else { //old
			$('#new_chore_input').slideUp();
			$('#old_chore').slideDown();
		}
	})

	$('#button1').click(function(){
		console.log("submitting chore add form");
		if ($('#new_or_old').val() == "new"){
			addNewChore();
			$("#new_chore_name").val("");
		} else {
			addExistingChore();
		}
		$("#assignee").val("");
		$("#chore_type").val("");
		$("#rate_frequency").val("");
		$("#rate").val("");
		$("#due_date").val("");
		$("#end_date").val("");
	});

})

function getChores(){ // populate page with all chore information
	// $("#all-chores").html("")
	// $("#my-chores").html("")
	// $("#their-chores").html("")
	console.log("running getChores in script_chore_add.js");
	$.ajax({
		url: "getChores",
		type: "get",
		data: {},
		success: function(chores) {
			if (chores.length == 0){
				message = "There are currently no chores in the system."
				$("#all-chores").html(message)
			}else{
				$.ajax({
					url: "getAssigns",
					type:"get",
					data:{},
					success: function(assigns){
						// console.log(assigns)
						my_assignments = assigns["my_assignments"]
						their_assignments = assigns["their_assignments"]
						// console.log("Parsing My ")
						my_message = parseAssignments(my_assignments, chores)
						// console.log("Parsing Their")
						their_message = parseAssignments(their_assignments, chores)
						if (my_message.length != ""){
							my_table = "<table id='chores_tbl'><tr><th>Day</th><th>Chore</th><th></th></tr>"
						    my_table += my_message
						    my_table += "</table>"
							$("#my-chores").html(my_table)
						} else{ /*$("#my-chores").html("<i>You don't have any chores assigned to you.</i>")*/}
						if (their_message.length != ""){
							$("#their-chores").html(their_message)
						} else{ /*$("#their-chores").html("<i>No one else has any chores assigned to them.</i>")*/}
					}
				})
				// data.forEach(function(chore){
				// 	message += chore.chore_name + ": " + chore.description + "<br>"
				// })
			}
			// $("#all-chores").html(message)
		}
	});
	return false;
}

function parseAssignments( assigns , chores ){
	message = "" 
	console.log(chores)
	assigns.forEach(function(a){
		chore_name = a.chore_name
		// console.log(a)
		chores.forEach(function(chore){
			if (chore.chore_name == chore_name ){
				due_date = new Date(a.due_date);
				due_date.setDate(due_date.getDate()+1); //fixes weird bug where day is subtracted by one when made into new Date
				due_date = due_date.toDateString();
				if (a.completed){
					console.log("a._id: ", a._id);
					message += "<tr id='completed-chore'><td>"+due_date.substring(0,3)+"</td>"
					message += "<td>"+chore.chore_name+"</td>"
					message += "<td><a id='complete-b' href='/undo-complete-chore/"+a._id+"'>Mark as Not Done</a></td>"
					message += "</tr>"
				} else {
					console.log("a._id: ", a._id);
					message += "<tr><td>"+due_date.substring(0,3)+"</td>"
					message += "<td>"+chore.chore_name+"</td>"
					message += "<td><a id='incomplete-b' href='/complete-chore/"+a._id+"'>Mark as Done</a></td>"
					message += "</tr>"
				}
				// message += a.user_name +" is assigned to do " + chore.chore_name + " due on " + due_date + "<br>"
			}
		})
	})
	return message
}

function getChoresForDropdown(){ // function to populate drop down list with all users in db (in a house)
	$.ajax({
			url: "getChores",
			type: "get",
			data: {},
			success: function(data) {
				message = "";
				data.forEach(function(chore){
					select = "<option value='"+chore.chore_name+"'>"+chore.chore_name+"</option>";
					message += select;
				})
				$('#select_chore_name').html(message);
			}
	});
	return false;
}

// function getMembersForDropdown(){ // function to populate drop down list with all users in db
// 	$.ajax({
// 		url: "getMembers",
// 		type: "get",
// 		data: {},
// 		success: function(data) {
// 			console.log("GETMEMBERS FOR DROPDOWN: ", data)
// 			// message = "";
// 			// data.forEach(function(chore){
// 			// 	select = "<option value='"+chore.chore_name+"'>"+chore.chore_name+"</option>";
// 			// 	message += select;
// 			// })
// 			// $('#select_chore_name').html(message);
// 		}
// 	});
// 	return false;
// }


function addNewChore(){
	console.log("----  IN ADD CHORE SCRIPT FXN ---- ")
	chore_name = $("#new_chore_name").val();
	assignee = $("#assignee").val();
	chore_type = $("#chore_type").val();
	rate_freq = $("#rate_frequency").val();
	rate = $("#rate").val();
	due_date = $("#due_date").val();
	end_date = $("#end_date").val();

	$.ajax({
			url: "chore_add_new",
			type: "post",
			data: {
				chore_name: chore_name,
				assignee: assignee,
				due_date: due_date,
				chore_type: chore_type,
				rate_frequency: rate_freq,
				rate: rate,
				end_date: end_date
			},
			success: function(data) {
				getChores();
				$('#chore_add_popup').fadeOut();


				due = new Date(due_date);
				due.setDate(due.getDate()+1); //fixes weird bug where day is subtracted by one when made into new Date
				due = due.toDateString();

				end = new Date(end_date);
				end.setDate(end.getDate()+1); //fixes weird bug where day is subtracted by one when made into new Date
				end = end.toDateString();
				if (chore_type == "onetime"){
					message = chore_name + " has been assigned to " + assignee + " for " + due + "."
				} else if (chore_type == "repeating"){
					message = chore_name + " has been assigned to " + assignee + " to repeat every " + rate

					if (rate_freq == "daily"){
						message += " day(s) "
					} else if (rate_freq == "weekly"){
						message += " week(s) "
					} else { //monthly
						message += " month(s) "
					}

					message += "from " + due + " until " + end + "."
				} else {
					message = chore_name + " has been assigned to everyone to repeat every " + rate

					if (rate_freq == "daily"){
						message += " day(s) "
					} else if (rate_freq == "weekly"){
						message += " week(s) "
					} else { //monthly
						message += " month(s) "
					}
					message += "from " + due + " until " + end + "."
				}
				$('#chore_feedback_popup span').html(message);
				$('#chore_feedback_popup').fadeIn();

			}
	});
	return false;	
}

function addExistingChore(){
	console.log("----  IN ADD CHORE SCRIPT FXN ---- ")
	chore_name = $("#select_chore_name").val();
	assignee = $("#assignee").val();
	chore_type = $("#chore_type").val();
	rate_freq = $("#rate_frequency").val();
	rate = $("#rate").val();
	due_date = $("#due_date").val();
	end_date = $("#end_date").val();

	$.ajax({
			url: "chore_add_existing",
			type: "post",
			data: {
				chore_name: chore_name,
				assignee: assignee,
				due_date: due_date,
				chore_type: chore_type,
				rate_frequency: rate_freq,
				rate: rate,
				end_date: end_date
			},
			success: function(data) {
				getChores();
				$('#chore_add_popup').fadeOut();


				due = new Date(due_date);
				due.setDate(due.getDate()+1); //fixes weird bug where day is subtracted by one when made into new Date
				due = due.toDateString();

				end = new Date(end_date);
				end.setDate(end.getDate()+1); //fixes weird bug where day is subtracted by one when made into new Date
				end = end.toDateString();
				if (chore_type == "onetime"){
					message = chore_name + " has been assigned to " + assignee + " for " + due + "."
				} else if (chore_type == "repeating"){
					message = chore_name + " has been assigned to " + assignee + " to repeat every " + rate

					if (rate_freq == "daily"){
						message += " day(s) "
					} else if (rate_freq == "weekly"){
						message += " week(s) "
					} else { //monthly
						message += " month(s) "
					}

					message += "from " + due + " until " + end + "."
				} else {
					message = chore_name + " has been assigned to everyone to repeat every " + rate

					if (rate_freq == "daily"){
						message += " day(s) "
					} else if (rate_freq == "weekly"){
						message += " week(s) "
					} else { //monthly
						message += " month(s) "
					}
					message += "from " + due + " until " + end + "."
				}
				$('#chore_feedback_popup span').html(message);
				$('#chore_feedback_popup').fadeIn();

			}
	});
	return false;	
}

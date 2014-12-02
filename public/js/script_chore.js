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

	$('#chore_add_reminder_x').click(function(){
		$("#chore_add_reminder_bkgd").fadeOut()
	})

	// //choose which type of chore form
	// $('#existing_chore').click(function(){
	// 	$('#choices').fadeOut();
	// 	// getChoresForDropdown();
	// 	// getMembersForDropdown();
	// 	$('#chore_add_form').fadeIn();
	// })

	// $('#toggle-action').click(function(){
	// 	console.log("clicking toggle-action")
	// 	if ($(this).html() == "Edit"){
	// 		$(this).html("Hide Edit");
	// 		// document.getElementById("edit-b").style.display = "inline"
	// 		// $('#edit-b').css("display", "inline");
	// 		$('#delete-b').css("display", "inline");
	// 	} else {
	// 		$(this).html("Edit");
	// 		$('#edit-b').css("display", "none");
	// 		$('#delete-b').css("display", "none");
	// 	}
		
	// })

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
		console.log("RF: ", rf);
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
		// $("#assignee").val("");
		// $("#chore_type").val("");
		// $("#rate_frequency").val("");
		$("#rate").val(1);
		$("#due_date").val("");
		$("#end_date").val("");
	});

	$("#reminder-button").click(function(){
		console.log("creating a new reminder...")
	})


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
						my_assignments_this = assigns["my_assignments_this"]
						my_assignments_next = assigns["my_assignments_next"]
						my_assignments_future = assigns["my_assignments_future"]
						their_assignments_this = assigns["their_assignments_this"]
						their_assignments_next = assigns["their_assignments_next"]
						their_assignments_future = assigns["their_assignments_future"]
						// console.log("Parsing My ")
						my_message_this = parseAssignments(my_assignments_this, chores)
						my_message_next = parseAssignments(my_assignments_next, chores)
						my_message_future = parseAssignments(my_assignments_future, chores)
						// console.log("Parsing Their")
						their_message_this = parseTheirAssignments(their_assignments_this, chores)
						their_message_next = parseTheirAssignments(their_assignments_next, chores)
						their_message_future = parseTheirAssignments(their_assignments_future, chores)
						
						if (my_message_this.length != ""){
							my_table = "<table class='chores_tbl'><tr><th>Day</th><th>Chore</th><th>Status</th><th>Action</th></tr>"
						    my_table += my_message_this
						    my_table += "</table>"
							$("#my-chores_this").html(my_table)
						} else{ $("#my-chores").html("<br><i>I don't have any chores for this week.</i>")}
						if (my_message_next.length != ""){
							my_table = "<table class='chores_tbl'><tr><th>Day</th><th>Chore</th><th>Status</th><th>Action</th></tr>"
						    my_table += my_message_next
						    my_table += "</table>"
							$("#my-chores_next").html(my_table)
						} else { $('#my-chores_next').html("<br><i>I don't have any chores next week.</i>")}
						if (my_message_future.length != ""){
							my_table = "<table class='chores_tbl'><tr><th>Day</th><th>Chore</th><th>Status</th><th>Action</th></tr>"
						    my_table += my_message_future
						    my_table += "</table>"
							$("#my-chores_future").html(my_table)
						} else { $('#my-chores_future').html("<br><i>I don't have any chores after two weeks.</i>")}
						if (their_message_this.length != ""){
							my_table = "<table class='chores_tbl'><tr><th>Day</th><th>Chore</th><th>Housemate</th><th>Status</th><th>Action</th></tr>"
						    my_table += their_message_this
						    my_table += "</table>"
							$("#their-chores_this").html(my_table)
						} else{ $("#their-chores").html("<br><i>No one else has any chores this week.</i>")}
						if (their_message_next.length != ""){
							my_table = "<table class='chores_tbl'><tr><th>Day</th><th>Chore</th><th>Housemate</th><th>Status</th><th>Action</th></tr>"
						    my_table += their_message_next
						    my_table += "</table>"
							$("#their-chores_next").html(my_table)
						} else { $('#their-chores_next').html("<br><i>No one else has any chores next week.</i>")}
						if (their_message_future.length != ""){
							my_table = "<table class='chores_tbl'><tr><th>Day</th><th>Chore</th><th>Housemate</th><th>Status</th><th>Action</th></tr>"
						    my_table += their_message_future
						    my_table += "</table>"
							$("#their-chores_future").html(my_table)
						} else { $('#their-chores_future').html("<br><i>No one else has any chores after two weeks.</i>")}
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

function parseAssignments( assigns , chores , past){
	message = "" 
	console.log(chores)
	today = new Date();
	today.setMinutes(0);
	today.setSeconds(0);
	today.setHours(0);
    this_wk = new Date();
    this_wk.setDate(this_wk.getDate()+7);
    next_wk = new Date();
    next_wk.setDate(next_wk.getDate()+14);
	assigns.forEach(function(a){
		chore_name = a.chore_name
		// console.log(a)
		chores.forEach(function(chore){
			if (chore.chore_name == chore_name ){
				due_date = new Date(a.due_date);
				due_date.setDate(due_date.getDate()+1); //fixes weird bug where day is subtracted by one when made into new Date
				due_date = due_date.toDateString();
				if (a.completed){
					// console.log("a._id: ", a._id);
					message += "<tr id='completed-chore'><td>"+due_date.substring(0,3)+"</td>"
					message += "<td>"+chore.chore_name+"</td>"
					message += "<td>Done</td>"
					message += "<td><a id='complete-b' href='/undo-complete-chore/"+a._id+"'>Mark as Not Done</a><a name ='edit-b' id='edit-b'><img src='images/icon_edit.png' width='20px'></a> <a id='delete-b'><img src='images/icon_delete.png' width='20px'></a></td>"
					message += "</tr>"
				} else {
					// console.log("a._id: ", a._id);
					if (whenDate(a.due_date) == "future"){
						message += "<tr><td>"+due_date.substring(4,10)+"</td>"
					} else {message += "<tr><td>"+due_date.substring(0,3)+"</td>"}
					message += "<td>"+chore.chore_name+"</td>"
					if (whenDate(a.due_date) == "past"){
						console.log("^^^ ", a.user_name);
						message += "<td id='red'>Overdue</td>"
					} else {message += "<td id='red'>Incomplete</td>"}
					message += "<td><a id='incomplete-b' href='/complete-chore/"+a._id+"'>Mark as Done</a> <a name ='edit-b' id='edit-b'><img src='images/icon_edit.png' width='20px'></a> <a id='delete-b'><img src='images/icon_delete.png' width='20px'></a>"
					message += "<a id='cal-b' chore='"+chore.chore_name+"' duedate='"+due_date+"' onclick=addReminder(this) class='btn btn-primary'>Create a Personal Reminder</a></td>"
					message += "</tr>"
				}
				// message += a.user_name +" is assigned to do " + chore.chore_name + " due on " + due_date + "<br>"
			}
		})
	})
	return message
}

function parseTheirAssignments( assigns , chores , past){
	message = "" 
	console.log(chores)
	today = new Date();
	today.setMinutes(0);
	today.setSeconds(0);
	today.setHours(0);
    this_wk = new Date();
    this_wk.setDate(this_wk.getDate()+7);
    next_wk = new Date();
    next_wk.setDate(next_wk.getDate()+14);
	assigns.forEach(function(a){
		chore_name = a.chore_name
		// console.log(a)
		chores.forEach(function(chore){
			if (chore.chore_name == chore_name ){
				due_date = new Date(a.due_date);
				due_date.setDate(due_date.getDate()+1); //fixes weird bug where day is subtracted by one when made into new Date
				due_date = due_date.toDateString();
				if (a.completed){
					// console.log("a._id: ", a._id);
					message += "<tr id='completed-chore'><td>"+due_date.substring(0,3)+"</td>"
					message += "<td>"+chore.chore_name+"</td>"
					message += "<td>"+a.user_name.split(" ")[0]+"</td>"
					message += "<td>Done</td>"
					message += "<td><a id='complete-b' href='/undo-complete-chore/"+a._id+"'>Mark as Not Done</a><a name ='edit-b' id='edit-b'><img src='images/icon_edit.png' width='20px'></a> <a id='delete-b'><img src='images/icon_delete.png' width='20px'></a></td>"
					message += "</tr>"
				} else {
					// console.log("a._id: ", a._id);
					if (whenDate(a.due_date) == "future"){
						message += "<tr><td>"+due_date.substring(4,10)+"</td>"
					} else {message += "<tr><td>"+due_date.substring(0,3)+"</td>"}
					message += "<td>"+chore.chore_name+"</td>"
					message += "<td>"+a.user_name.split(" ")[0]+"</td>"
					console.log("a.user_name: ", a.user_name);
					if (whenDate(a.due_date) == "past"){
						console.log("^^^ ", a.user_name);
						message += "<td id='red'>Overdue</td>"
					} else {message += "<td id='red'>Incomplete</td>"}
					message += "<td><a id='incomplete-b' href='/complete-chore/"+a._id+"'>Mark as Done</a><a name ='edit-b' id='edit-b'><img src='images/icon_edit.png' width='20px'></a> <a id='delete-b'><img src='images/icon_delete.png' width='20px'></a></td>"
					message += "</tr>"
				}
				// message += a.user_name +" is assigned to do " + chore.chore_name + " due on " + due_date + "<br>"
			}
		})
	})
	return message
}

function addReminder(item){
	console.log("popup appears to add a reminder")
	chore = $(item).attr("chore")
	duedate = $(item).attr("duedate")
	date = new Date(duedate)
	str = date.toISOString()
	str = str.split('T')[0]
	$('#chore_add_reminder_bkgd').fadeIn();
	$('#chore_add_reminder_popup').fadeIn();
	$("#chore_reminder").val(chore)
	$("#due_date_reminder").val(str)
}

function whenDate(date){
    days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    today = new Date();
    today_day = days.indexOf(today.toDateString().substring(0,3));
    console.log("today is: "+today.toDateString().substring(0,3)+" today_day: ", today_day)
    thswk = new Date();
    thswk.setDate(thswk.getDate()+(7-today_day));
    nxtwk = new Date();
    nxtwk.setDate(nxtwk.getDate()+(7-today_day+7));
    date = new Date(date)
    date.setDate(date.getDate()+1)
    when = ""
    // console.log("today: ", today)
    // console.log("this: ", thswk)
    // console.log("next: ", nxtwk)
    // console.log("date: ", date)
    if (date < today){
        when = "past"
    } else if ((today <= date) && (date < thswk)){
        when = "this"
    } else if ((thswk <= date) && (date < nxtwk)){
        when = "next"
    } else {
        when = "future"
    }
    // console.log("when: ", when)
    return when
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
	rate_freq = $('input[name=rate_frequency]:checked').val();
	// console.log("RATE FREQ: ", rate_freq);
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
	rate_freq = $('input[name=rate_frequency]:checked').val();
	// console.log("RATE FREQ: ", rate_freq);
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

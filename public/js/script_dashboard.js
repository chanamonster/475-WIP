$(document).ready(function(){
	console.log("In dashboard_script.js")
	updateDashboardGroceries()
	updateDashboardBills()
	updateDashboardChores()
});

function updateDashboardGroceries(){
	console.log("----  IN Get Groceries SCRIPT---- ")
	$.ajax({
			url: "getGroceryListNotBought",
			type: "get",
			data: {},
			success: function(data) {
				message = "<ul>"
				data.forEach(function(item){
					message += "<li>"+item.quantity+" "+item.name+"</li>"
				})
				message += "</ul>"
				$('#dash-groceries').html(message);
				// updateDashboardChores()
			}
	});
	
	return false;
}

function updateDashboardBills(){
	console.log("---- IN Get Bills SCRIPT---- ")
	$.ajax({
		url: "getBills",
		type: "get",
		data: {},
		success: function(bills) {
			if (bills.length == 0) {
				message1 = "I currently don't owe any money."
				$("#my-payments").html(message1);
				message2 = "No one owes me any bill payments."
				$("#pay-to-me").html(message2);
			} else {
				// console.log(bills)
				$.ajax({
					url: "getPays",
					type: "get",
					data: {},
					success: function(pays){
						// console.log("PAYS: ",pays)
						my_balance = pays.balance
						pays = pays.data;
						my_payments = pays["my_payments"]
						pay_to_me = pays["pay_to_me"]
						if (my_payments.length != 0) {
							my_message = parseMyPayments(my_payments, bills)
							$("#my-payments").html(my_message)
						}else{
							$("#my-payments").html("I currently don't owe any money.")
						}
						if (pay_to_me.length != 0){
							ptm_message = parsePTMPayments(pay_to_me, bills)
							$("#pay-to-me").html(ptm_message)
						} else{
							$("#pay-to-me").html("No one owes me any bill payments.")
						}

						if (my_balance > 0){
							$('#my_balance').html("My balance: $"+my_balance);
						} else {
							my_balance = Math.abs(my_balance)
							$('#my_balance').html("My balance: -$"+my_balance);
						}
					}
				})
			}
		}
	}); 
	return false;
}

function updateDashboardChores(){
	console.log("----  IN Get Chores SCRIPT---- ")
	$.ajax({
			url: "getChores",
			type: "get",
			data: {},
			success: function(chores) {
				// console.log(chores)
				if (chores.length == 0){
					$("#my-chores").html("There are currently no chores for me to do.")
				}
				else{
					$.ajax({
					url: "getAssigns",
					type:"get",
					data:{},
					success: function(assigns){
						// console.log(assigns)
						my_assignments = assigns["my_assignments_this"]
						console.log("Parsing My ")
						my_message = parseAssignments(my_assignments, chores)
						
						if (my_message.length != ""){
							$("#dash-my-chores").html(my_message)
						} else{ $("#dash-my-chores").html("I don't have any chores to do this week.")}
						
					}
					})

					// message = ""
					// data.forEach(function(d){
					// 	due = new Date(d.due_date)
					// 	message += d.chore_name +" is due on " + due.toDateString() + "<br>"
					// })
					
					// $("#my-chores").html(message)
				}
			}
	});
	return false;
};

function parseAssignments( assigns , chores ){
	subDate = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
	longDate = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
	prevDate = -2;
	message = "<table>"
	today = new Date()
	// console.log(chores)
	assigns.forEach(function(a){
		chore_name = a.chore_name
		// console.log(a)
		chores.forEach(function(chore){
			if ((chore.chore_name == chore_name ) && (a.completed==false)){
				due_date = new Date(a.due_date)
				due_date.setDate(due_date.getDate()+1)
				due_date = due_date.toDateString()
				due = due_date.substring(0,3)
				if ((subDate.indexOf(due) == prevDate) || ((prevDate==-1)&&(whenDate(a.due_date)=="past"))){
					message += "<tr><td></td>"
				} else if (whenDate(a.due_date)=="past"){
					message += "<tr><td id='red'>Overdue: </td>"
				} else {
					message += "<tr><td>"+longDate[subDate.indexOf(due)] + ": </td>"
				}
				if (whenDate(a.due_date)=="past"){
					message += "<td id='red'>" + chore.chore_name + "</td>"
				} else {
					message += "<td>" + chore.chore_name + "</td>"

				}
				message += "</tr>"
				if (whenDate(a.due_date)=="past"){
					prevDate = -1
				} else {
					prevDate = subDate.indexOf(due)
				}
			}
		})
	})
	message += "</table>"
	return message
}

function whenDate(date){
    days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    today = new Date();
    today_day = days.indexOf(today.toDateString().substring(0,3));
    thswk = new Date();
    thswk.setDate(thswk.getDate()+(7-today_day));
    nxtwk = new Date();
    nxtwk.setDate(nxtwk.getDate()+(7-today_day+7));
    date = new Date(date)
    date.setDate(date.getDate()+1)
    when = ""
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

function parseMyPayments( pays, bills) {
	message2 = ""
	console.log(bills)
	pays.forEach(function(p) {
		bill_name = p.bill_name
		bills.forEach(function(bill) {
			if (bill.bill_name == bill_name) {
				date = new Date(bill.date).toDateString()
				message2 += "I owe " + bill.user_name + " $" + p.partial_amount + " for " + bill.bill_name + " bill <br>"
			}
		})
	})
	return message2
}

function parsePTMPayments( pays, bills) {
	message2 = ""
	console.log(bills)
	pays.forEach(function(p) {
		bill_name = p.bill_name
		bills.forEach(function(bill) {
			if (bill.bill_name == bill_name) {
				date = new Date(bill.date).toDateString()
				message2 += p.payer +" owes me $" + p.partial_amount + " for " + bill.bill_name + " bill <br>"
			}
		})
	})
	return message2
}
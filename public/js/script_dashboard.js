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
				if (data.length == 0){
					message = "<i>There are no grocery items on the shopping list</i>"
				} else {
					message = "<ul>"
					data.forEach(function(item){
						message += "<li>"+item.quantity+" "+item.name+"</li>"
					})
					message += "</ul>"
				}
				$('#dash-groceries').html(message);
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
				message1 = "<i>I currently don't owe any money.</i>"
				$("#dash-my-payments").html(message1);
				message2 = "<i>No one owes me any bill payments.</i>"
				$("#dash-pay-to-me").html(message2);
			} else {
				// console.log(bills)
				$.ajax({
					url: "getPays",
					type: "get",
					data: {},
					success: function(pays){
						// console.log("PAYS: ",pays)
						my_balance = pays.balance.toFixed(2)
						pays = pays.data;
						my_payments = pays["my_payments"]
						pay_to_me = pays["pay_to_me"]
						owe = 0
						lent = 0
						if (my_payments.length != 0) {
							my_message = parseMyPayments(my_payments, bills)[0]
							$("#dash-my-payments").html(my_message)
						}else{
							$("#dash-my-payments").html("<i>I currently don't owe any money.</i>")
						}
						if (pay_to_me.length != 0){
							ptm_message = parsePTMPayments(pay_to_me, bills)[0]
							$("#dash-pay-to-me").html(ptm_message)
						} else{
							$("#dash-pay-to-me").html("<i>No one owes me any bill payments.</i>")
						}

						if (my_balance >= 0){
							$('#dash-my_balance').html("My balance: <span id='green'>$"+my_balance+"</span>");
						} else {
							my_balance = Math.abs(my_balance)
							$('#dash-my_balance').html("My balance: <span id='red'>-$"+my_balance+"</span>");
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
					// $("#dash-my-chores").html("</i>I don't have any chores to do this week.</i>")
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
						
						if (my_assignments.length != 0){
							my_message = parseAssignments(my_assignments, chores)
							$("#dash-my-chores").html(my_message)
						} else{ $("#dash-my-chores").html("<i>I don't have any chores to do this week.</i>")}
						
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
	owe = 0;
	console.log(bills)
	pays.forEach(function(p) {
		bill_name = p.bill_name
		bills.forEach(function(bill) {
			if (bill.bill_name == bill_name) {
				date = new Date(bill.date).toDateString()
				add = "$" + p.partial_amount + " to " + bill.user_name.split(" ")[0] + " - " + bill.bill_name
				if (add.length > 40){
					add = add.substring(0, 38) + "...<br>"
				} else { add += "<br>"}
				message2 += add
				owe += p.partial_amount
			}
		})
	})
	return [message2,owe]
}

function parsePTMPayments( pays, bills) {
	message2 = ""
	lent = 0
	console.log(bills)
	pays.forEach(function(p) {
		bill_name = p.bill_name
		bills.forEach(function(bill) {
			if (bill.bill_name == bill_name) {
				date = new Date(bill.date).toDateString()
				add = "$"+p.partial_amount+" to "+ p.payer.split(" ")[0] +" - " + bill.bill_name

				if (add.length > 40){
					add = add.substring(0, 38) + "...<br>"
				} else { add += "<br>"}
				message2 += add
				lent += p.partial_amount
			}
		})
	})
	return [message2,lent]
}
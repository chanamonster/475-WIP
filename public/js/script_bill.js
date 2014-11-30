$(function() {
	getBills();
	jQuery("#tab1").show()
	jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr('href');
 
        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().siblings().hide();
 
        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });

    //show bill popup
	$('#bill_add_pg').click(function(){
		$('#bill_add_bkgd').fadeIn();
		$('#bill_add_popup').fadeIn();
	})
	//hide bill popup
	$('#bill_add_x').click(function(){
		$('#bill_add_bkgd').fadeOut();

		//clear form fields
	})
	$('#bill_feedback_close').click(function(){
		$('#bill_add_bkgd').fadeOut();
		$('#bill_feedback_popup').fadeOut();
		//clear form fields
	})

	//submitting bill add form
	$('#bill-formb').click(function(){
		console.log("submitting bill add form");
		addNewBill();
		$("#bill_name").val("");
		$("#amount").val("");
		$("#date").val("");
		//recheck all boxes? idk
	});

	$(":checkbox").click(function(){
		console.log("clicked checkbox");
		if ($(this).attr("checked")){
			console.log("unchecking")
			$(this).attr("checked", false)
		} else {
			console.log("checking")
			$(this).attr("checked", true)
		}
	})

})

function getBills() {
	console.log("running getBills in script_bill_add.js");
	$.ajax({
		url: "getBills",
		type: "get",
		data: {},
		success: function(bills) {
			if (bills.length == 0){
				message = "There are no bills yet."
				$("#all-bills").html(message)
			} else {
				$.ajax({
					url: "getPays",
					type: "get",
					data: {},
					success: function(pays){
						my_balance = "Balance: $"+pays.balance.toFixed(2)
						console.log(pays)
						pay_to_me = pays.data["pay_to_me"]
						my_payments = pays.data["my_payments"]
						my_past_payments = pays.data["my_past"]
						their_payments = pays.data["their_payments"]
						// total_balance = pays.data["total_balance"]
						// console.log("Parsing My ") 
						pay_me_message = parseOwedPayments(pay_to_me, bills)
						my_message = parseMyPayments(my_payments, bills)
						my_past_message = parsePastPayments(my_past_payments, bills)
						their_message = parsePayments(their_payments, bills)

						// $("#total-balance").html(total_balance);

						if (pay_me_message != "") {
							$("#pay-to-me").html(pay_me_message);
							console.log("1");
						} else{ 
							// $("#pay-to-me").html("You don't have any payments.")
							console.log("2");
						}
						if (my_past_message != "") {
							$("#my-past-payments").html(my_past_message)
							console.log("3");
						} else{ 
							// $("#my-past-payments").html("You haven't made any payments.")
							console.log("4");
						}
						if (my_message != "") {
							$("#my-payments").html(my_message)
							console.log("5");
						} else{ 
							// $("#my-payments").html("You don't have any bills assigned to you.")
							console.log("6");
						}
						if (their_message != ""){
							$("#their-payments").html(their_message)
							console.log("7");
						} else{
							// $("#their-payments").html("No on else has to pay any bills.")
							console.log("8");
						}
					} 
				})
				console.log("calling totals");
				$.ajax({
					url: "getTotals",
					type: "get",
					data: {},
					success: function(totals){
						console.log("---TOTALS: ", totals);
						totalsTbl = "<table id='totalsTbl'><tr>"
						totals.forEach(function(total){
							if (total[1] < 0){
								num = " id='red'> -$"+Math.abs(total[1])
							} else {
								num = " id='green'> $"+total[1]
							}
							totalsTbl += "<td><div class='total_num'" + num + "</div>" + "<div id='total_person'>" + total[0] + "</div></td>"
						})
						totalsTbl += "</tr></table>"
						$("#total-balance").html(totalsTbl);

					}
				})
			}
		}
	}); 
	return false;
}



function parsePayments( pays, bills) {
	var message = ""
	if (pays.length != 0){
		message += '<table><tr><td><b><center>Date</center</b></td>'+
		'<td><b><center>Paid From</center></b></td>'+
		'<td><b><center>Paid To</center></b></td><td><b><center>Amount</center></b></td>'+
		'<td><b><center>Bill</center></b></td><td><b><center>Hide?</center></b></td>'
		pays.forEach(function(p) {
		bill_name = p.bill_name
		console.log(p)
		bills.forEach(function(bill) {
			if (bill.bill_name == bill_name && p.obsolete!="0"){
				date = new Date(bill.date).toDateString()
					message += '<tr><td>'+date+'</td><td>'+p.payer+'</td><td>'+p.user_name+'</td><td>$' + p.partial_amount + '</td><td>' + bill.bill_name
					+ '</td>' + '<td><a id="complete-b" href="/hidePay/' + p._id + '">Hide</a>'+'</td></tr>';
			}
		})
	})
	}
	return message
}

function parseMyPayments( pays, bills) {
	var message = ""
	if (pays.length != 0){
		message += '<table><tr><td><b><center>Date</center</b></td>'+
		'<td><b><center>Lent From</center></b></td>'+
		'<td><b><center>Amount</center></b></td>'+
		'<td><b><center>Bill</center></b></td><td><b><center>Action</center></b></td>'
		pays.forEach(function(p) {
			bill_name = p.bill_name
			// console.log(p)
			bills.forEach(function(bill) {
				if (bill.bill_name == bill_name && p.obsolete=="1"&& p.completed==false) {
					date = new Date(bill.date).toDateString()
					fxn = "completePay('"+p._id+"')";
					message += '<tr><td>'+date+'</td><td>'+ p.user_name + '</td><td> $' + p.partial_amount + '</td><td>' + bill.bill_name + '</td>'
					// + '<td><a id="complete-b" href="/completePay/' + p._id + '">Complete</a></td>';
					+ '<td><a id="complete-b" onclick="' + fxn + '">Mark as Paid</a></td>';
				}
			})
		})
		message += '</table>'
	}
	
	return message
}

function parsePastPayments( pays, bills) {
	var message = ""
	if (pays.length != 0){
		message += '<table><tr><td><b><center>Date</center</b></td>'+
		'<td><b><center>Paid From</center></b></td>'+
		'<td><b><center>Paid To</center></b></td><td><b><center>Amount</center></b></td>'+
		'<td><b><center>Bill</center></b></td>'
		pays.forEach(function(p) {
			bill_name = p.bill_name
			// console.log(p)
			bills.forEach(function(bill) {
				if (bill.bill_name == bill_name && p.obsolete!="0" && p.completed==true){
					date = new Date(bill.date).toDateString()
					message += '<tr><td>'+date+'</td><td>'+p.payer+'</td><td>'+p.user_name+'</td><td>$' + p.partial_amount + '</td><td>' + bill.bill_name
					+ '</td>'
					// + '</td>' + '<td><a id="complete-b" href="/hidePay/' + p._id + '">Hide</a>'+'</td></tr>';
					}
				}
			)
		})
		message += '</table>'	
	}
	
	return message
}

//what other people owe me
function parseOwedPayments( pays, bills) {
	// console.log("hello");
	var message = ""
	if (pays.length !=0){
		message += '<table><tr><td><b><center>Date</center</b></td>'+
		'<td><b><center>Lent To</center></b></td><td><b><center>Amount</center></b></td>'+
		'<td><b><center>Bill</center></b></td><td><b><center>Action</center></b></td>'
		pays.forEach(function(p) {
			bill_name = p.bill_name
			// console.log(p)
			bills.forEach(function(bill) {
				if (bill.bill_name == bill_name && p.obsolete=="1" && p.completed==false){
					date = new Date(bill.date).toDateString()
					fxn = "completePay('"+p._id+"')";
					message += '<tr><td>'+date+'</td><td>'+ p.payer + '</td><td> $' + p.partial_amount + '</td><td>' + bill.bill_name + '</td>'
					// + '<td><a id="complete-b" href="/completePay/' + p._id + '">Complete</a></td>';
					+ '<td><a id="complete-b" onclick="' + fxn + '">Mark as Paid</a></td>';
				}
			})
		})
	}
	return message
}


function addNewBill(){
	console.log("----  IN ADD BILL SCRIPT FXN ---- ")
	bill_name = $("#bill_name").val();
	amount = $("#amount").val();
	date = $("#date").val();
	user_name = $('#user_name').val();
	payer = $( ":checkbox:checked" )
			  .map(function() {
			    return this.value;
			  })
			  .get()
	partial_amount = ""

	$.ajax({
			url: "bill_add_new",
			type: "post",
			data: {
				bill_name: bill_name,
				amount: amount,
				date: date,
				user_name: user_name,
				partial_amount: partial_amount,
				payer: payer
			},
			success: function(data) {
				getBills();
				$('#bill_add_popup').fadeOut();


				due = new Date(date);
				due.setDate(due.getDate()+1); //fixes weird bug where day is subtracted by one when made into new Date
				due = due.toDateString();
				message = "The expense "+bill_name+" paid by "+user_name+" to "
				for (var i=0; i<payer.length; i++){
					message += payer[i]
					if (i != payer.length-1){
						message += ", "
					}
					if (i == payer.length-2){
						message += "and "
					}
				}
				message += " on "+due+" has been added."
				$('#bill_feedback_popup span').html(message);
				$('#bill_feedback_popup').fadeIn();

			}
	});
	return false;
}

function completePay(id){
	url = "/completePay/"+id;
	$.ajax({
			url: url,
			type: "get",
			data: {},
			success: function(data) {
				getBills();
				console.log("WOOOOOO")
			}
	});
	return false;
}
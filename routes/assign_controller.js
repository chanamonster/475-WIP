var Database = require('../models/mymongo.js'),
	Assign = require('../models/assign.js'),
	this_user = require('../models/auth').this_user,
    ObjectId = require('mongodb').ObjectID;


exports.asgnExisting = function(req, res){
    console.log("asgnExisting");
    console.log("req.body.chore_type: ", req.body.chore_type);
    if (req.body.chore_type == "onetime"){
        var newAssign = {
            chore_name: req.body.chore_name,
            user_name: req.body.assignee,
            due_date: req.body.due_date,
            completed: false
        };
        Database.insert(
            "housemates",
            "assigns",
            newAssign,
            function(model) {
                res.redirect('chores');
            }
        );
    } else if (req.body.chore_type == "repeating"){
        start_date = new Date(req.body.due_date);
        on_date = new Date(req.body.due_date);    
        end_date = new Date(req.body.end_date);
        dates = [start_date];
        rate = Number(req.body.rate);

        incrementDate(on_date, req.body.rate_frequency, rate);

        while (on_date <= end_date){
            push_date = new Date(on_date);
            dates.push(push_date);
            incrementDate(on_date, req.body.rate_frequency, rate);
        }

        dates.forEach(function(date){
            var newAssign = {
                chore_name: req.body.chore_name,
                user_name: req.body.assignee,
                due_date: date,
                completed: false
            };
            Database.insert(
                "housemates",
                "assigns",
                newAssign,
                function(model) {
                    
                }
            );
        });
        
        res.redirect('chores');
    } else { //rotating
        start_date = new Date(req.body.due_date);
        on_date = new Date(req.body.due_date);    
        end_date = new Date(req.body.end_date);
        dates = [start_date];
        rate = Number(req.body.rate);
        members = this_user.members;

        //find which index the assignee is
        on_member = members.indexOf(req.body.assignee);
        console.log("---starting on_member: ", on_member);
        rotation = [on_member];

        incrementDate(on_date, req.body.rate_frequency, rate);

        while (on_date <= end_date){
            push_date = new Date(on_date);
            dates.push(push_date);
            incrementDate(on_date, req.body.rate_frequency, rate);
        }

        for (var i=0; i<dates.length; i++){
            if (on_member == this_user.members.length-1){
                on_member = 0;
            } else {
                on_member += 1;
            }
            push_index = on_member;
            rotation.push(push_index);
        }
        console.log("ROTATION: ", rotation);

        dates.forEach(function(date){
            console.log("...on member...", on_member);

            var newAssign = {
                chore_name: req.body.chore_name,
                user_name: members[rotation[dates.indexOf(date)]],
                due_date: date,
                completed: false
            };
            Database.insert(
                "housemates",
                "assigns",
                newAssign,
                function(model) {
                    
                }
            );
        });
        
        
        res.redirect('chores');
    }
};

function incrementDate(date, rate_frequency, rate){
    if (rate_frequency == "daily"){
        var x = date.getDate()+rate;
        date.setDate(x);
        console.log("DATE IS....", date);
        
    } else if (rate_frequency == "weekly"){
        xrate = rate*7
        var x = date.getDate()+xrate;
        date.setDate(x);
        console.log("DATE IS....", date);

    } else if (rate_frequency == "monthly"){
        var x = date.getMonth()+rate;
        date.setMonth(x);
        console.log("DATE IS....", date);

    } /*else { //yearly 
        var x = date.getFullYear()+rate;
        date.setFullYear(x);
        console.log("DATE IS....", date);

    }*/
    return date;
}

exports.getAssignments = function(req,res){
    console.log("GETTING ALL Assigments..");
    var data = {
        my_assignments_this : [],
        my_assignments_next : [],
        my_assignments_future : [],
        their_assignments_this : [],
        their_assignments_next : [],
        their_assignments_future : []
    };
    my_name = this_user.first_name + " " + this_user.last_name
    
    // console.log("today: ", today)
    // console.log("next week: ", next_wk)
    Database.find("housemates","assigns","", function(model){
        model.forEach(function(assign){
            when = whenDate(assign.due_date)
            if (assign.user_name == my_name){
                if (when == "this"){
                    data["my_assignments_this"].push(assign)
                } else if (when == "next"){
                    data["my_assignments_next"].push(assign)
                } else if (when == "future"){
                    data["my_assignments_future"].push(assign)
                } else if ((when == "past") && !assign.completed){ //past
                    data["my_assignments_this"].push(assign)
                }
            } else{
                if (when == "this"){
                    data["their_assignments_this"].push(assign)
                } else if (when == "next"){
                    data["their_assignments_next"].push(assign)
                } else if (when == "future"){
                    data["their_assignments_future"].push(assign)
                } else if ((when == "past") && !assign.completed){ //past
                    data["their_assignments_this"].push(assign)
                }
            }
            // data.push(chore.chore_name);
        })
        data["my_assignments_this"].sort(compare_date);
        console.log(data["my_assignments_this"])
        // data["their_assignments"].sort(compare_date);
        res.send(data)
    })
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

exports.completeChore = function(req, res){
    // console.log("ID IS: ", req.params.id);
    id = req.params.id;
    Assign.findById(id, function (err, doc) {
      if (err) {
        // console.log("id is: ", id);
        // console.log("typeof(id) is: ", typeof(id));
        return console.log("err:", err);
      } else {
        // console.log("id is: ", id);
        // console.log("typeof(id) is: ", typeof(id));
        // console.log("DOC FOUND:", doc);
        doc.completed = true;
        doc.save();
        res.redirect('chores');
      }
    })
};

exports.undoCompleteChore = function(req, res){
    // console.log("ID IS: ", req.params.id);
    id = req.params.id;

    Assign.findById(id, function (err, doc) {
      if (err) {
        // console.log("id is: ", id);
        // console.log("typeof(id) is: ", typeof(id));
        return console.log("err:", err);
      } else {
        // console.log("id is: ", id);
        // console.log("typeof(id) is: ", typeof(id));
        // console.log("DOC FOUND:", doc);
        doc.completed = false;
        doc.save();
        res.redirect('chores');
      }
      
    })
};

function compare_date(a,b) {
  aDate = new Date(a.due_date)
  bDate = new Date(b.due_date)
    console.log("sorting assignments");
  if (aDate< bDate)
     return -1;
  if (aDate > bDate)
    return 1;
  return 0;
}
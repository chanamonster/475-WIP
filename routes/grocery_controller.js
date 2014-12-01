var Database = require("../models/mymongo.js"),
    this_user = require('../models/auth').this_user;
var grocerylist            = require('../models/grocerylist');

exports.addGrocery = function(req, res){
    var newGrocery = {
        name: req.body.name,
        quantity: req.body.quantity,
        bought:"NOT BOUGHT",
        obsolete:"1"
    };
    Database.insert(
        "housemates",
        "groceries",
        newGrocery,
        function(model) {
            res.render('grocery', {
                user:this_user,
                name : newGrocery.name,
                quantity: newGrocery.quantity,
                bought: newGrocery.bought,
                obsolete: newGrocery.obsolete,
                members: this_user.members
            });
        }
    );
}

exports.deleteGrocery = function(req, res){
console.log("********");
console.log(req.params.id);
console.log("********");
grocerylist.findByIdAndUpdate({_id: req.params.id},
                       {
                        obsolete:"0"
               }, function(err, docs){
                if(err) res.json(err);
                else
                { req.params.id
                   console.log(docs);
                   res.redirect('/grocery');
                 }
             });
}

exports.updateGroceryAsBought = function(req, res) {
    console.log("************");
    console.log(req.params.id);
    console.log("*********");
    grocerylist.findByIdAndUpdate({_id: req.params.id},
        {
            bought:"BOUGHT"
        }, function(err, docs){
            if (err) res.json(err);
            else
                { req.params.id
                    console.log(docs);
                    res.redirect('/grocery');
                }
        }
        );
}

exports.reactivateGrocery = function(req, res) {
    console.log("*******");
    console.log(req.params.id);
    console.log("**********");
    grocerylist.findByIdAndUpdate({_id: req.params.id}, 
        { 
            bought: "NOT BOUGHT"
        }, function(err, docs){
            if (err) res.json(err);
            else {
                req.params.id
                console.log(docs);
                res.redirect('/grocery');
            }
        });
}

exports.getGroceries = function(req, res){
            var message ='<ul>';
            grocerylist.find({"obsolete":"1"}, function(err, grocery) {
            // if there are any errors, return the error
            if (err)
                res.send(err);
            else
            {
            res.send(grocery)
            }
        });    
    
}

exports.getGroceriesNotBought = function(req, res){
            var message ='<ul>';
            grocerylist.find({ $and:[ {"obsolete":"1"}, {"bought":"NOT BOUGHT"} ]}, function(err, grocery) {
            // if there are any errors, return the error
            if (err)
                res.send(err);
            else
            {
                if (err)
                    res.send(err);
                else
                {
                res.send(grocery)
                }
            }
        });    
}

exports.getGroceriesBought = function(req, res){
            var message ='<ul>';
            grocerylist.find({ $and:[ {"obsolete":"1"}, {"bought":"BOUGHT"} ]}, function(err, grocery) {
            // if there are any errors, return the error
            if (err)
                res.send(err);
            else
            {
                if (err)
                    res.send(err);
                else
                {
                res.send(grocery)
                }
            }
        });    
}

exports.getGroceriesbyid = function(req, res){
            var message ='<ul>';
            grocerylist.find({"name":"beef"}, function(err, grocery) {
            // if there are any errors, return the error
            if (err)
                res.send(err);
            else
            {
            // check to see if theres already a user with that email
            if (grocery) {
                console.log(grocery[0]); //returns undefined
                for( var i =0;i< grocery.length;i++ ) {
                var item = grocery[i];
                message = message + '<li>' + item.quantity + ' ' + item.name + ' $ ' + item.price + '</li>';
                }
                message = message +'</ul>';
                res.send(message);
            } 
            else
            {
                res.send("no data");
            }
            }
        });    
    
}
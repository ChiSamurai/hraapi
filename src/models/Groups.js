var mongoose = require('mongoose');
var uuid = require('uuid/v4');
var jsonQuery = require('json-query');
const arrayDiffer = require('array-differ');

const util = require('util')
/*var Users = require('../models/Users.js');*/

var async = require("async");

var GroupMembersSchema = new mongoose.Schema({
    "name": { type:String, unique:true},
    "type": { type:String, enum: ["user", "group"]}
});

var GroupSchema = new mongoose.Schema({
    groupname: {type: String, required: true, unique: true, dropDups: true},
    active: {type:Boolean, required:true, default: true},
    source: {type:String, required:true, unique:false, default: "local"}, //local or ldap? (or anything else in the future)
    creator : {type:String, required:true}, 
    members : [GroupMembersSchema],
    managers: [GroupMembersSchema]
  },{
    timestamps: true
  }
);
GroupSchema.statics.getUserGroups = function(req, res, next) {
    var query = { 
        $and: [
            {"members.id": req.userMetadata.username},
            {"members.type": "user" }
        ]
    };
    //ToDo: get LDAP Groups if connected to LDAP
    var _next = next;
    this.find(query ,{"_id": 0, "id": 1, "members.id.$": 1}, function(err, post) {
        if (err) return next(err);
        post.forEach(function(group) {
            req.userMetadata.groups.local.push({
                id: group.id
            });
        });
        return next(null, req, res);
    });
};

GroupSchema.statics.getGroups = function(groupnames, onlyActive, next) {
    var query = {"groupname": {$in: groupnames} };
    //if onlyActive is set, query only for active groups
    if(onlyActive) query = {$and: [query, {"active": true}]}; 
    this.find(query, function (err, foundGroups){
        if(err) return next(err);
        return next(null, foundGroups);
    });
};


GroupSchema.statics.addUsersToGroup = function(o_Users, o_Group, next){
    for(user in o_Users){
        console.log(user);
    }
};


GroupSchema.statics.addUsersToGroups = function(o_Users, o_Groups, next){
    for(group in o_Groups){
        console.log(group);
    }
};

GroupSchema.statics.getGroupMembers = function(groupnames, onlyActive, next) {
    var groupUsers = [];
    // get the Group Objects
    this.getGroups(groupnames, onlyActive, function (err, groupObjects) {
        if (err) return next(err);
        var seriesFunctions = [];
        //Create the functions to get all members for getting called in series 
        for (var i = 0; i < groupObjects.length; i++){
            var groupObj = groupObjects[i];
            var groupName = groupObj.groupname;
            seriesFunctions.push(function(callback){
                groupObj.getMembers(false, function(err, members) {
                    if (err) return callback(err);
                    groupUsers[groupName] = members;
                    callback(null, members);
                });
            });
        }
        //run the functions asynchonous
        async.parallel(seriesFunctions, function(err, result) {
            if (err) return next(err);
            return next(err, groupUsers);
        });
    });
};


GroupSchema.methods.getMembers = function(onlyActive, next) {
    //get all members in this group
    var memberIDs = jsonQuery("members.name", {data:this}).value;
    mongoose.model("Users").find({'username': {$in: memberIDs}}, {"password": 0}, function (err, memberUsers) {
        if (err) return next(err);
        return next(null, memberUsers);
    });
/*        
        //ToDo: handle membergroups
        for (var i = 0; i < members.length; i++) {
            members[i]
        }
    });*/
};


GroupSchema.methods.addMemberUsers = function(users, next) {
    var thisGroup = this;
    //first get the existing member's ids to avoid dups
    this.getMembers(false, function(err, memberUsers) {
        if (err) return next(err);
        //iterate over the users to add
        var actualMemberNames = jsonQuery("username", {data:memberUsers}).value;
        var newMemberNames = jsonQuery("username", {data:users}).value;

        //get only new Usernames
        var toAddUsernames = arrayDiffer(newMemberNames, actualMemberNames);

        //only existing user IDs should be added
        mongoose.model("Users").getUsers(toAddUsernames, true, function (err, usersToAdd){
            if (err) return next(err);
            for(var index in usersToAdd){
                thisGroup.members.push({
                    id: usersToAdd[index].username,
                    type: "user"
                });
            };
            thisGroup.save(function (err) {
              if (err) return next(err);
              next(null);
            });            
        });

    });
};


module.exports = mongoose.model('Groups', GroupSchema);
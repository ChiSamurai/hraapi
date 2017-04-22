var mongoose = require('mongoose');
var uuid = require('uuid/v4');

var GroupSchema = new mongoose.Schema({
    "groupId" : {type:String, required:true, unique:true, dropDups: true, default:uuid},
    "source": {type:String, required:true, unique:false, default: "local"}, //local or ldap? (or anything else in the future)
    "groupname": {type: String, required: true, unique: true, dropDups: true},
    "creator" : {type:String, required:true}, 
    "members" : [
        {
            "id": { type:String, unique:true},
            "type": { type:String, enum: ["user", "group"]}
        }
    ],
    "managers":[
        {
            "id": { type:String, unique:true},
            "type": { type:String, enum: ["user", "group"]}
        }
    ]
  },{
    timestamps: true
  }
);

GroupSchema.statics.getUserGroups = function(req, res, next) {
    var query = { 
        $and: [
            {"members.id": req.userMetadata.userId},
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
        next(null, req, res);
    });
};

GroupSchema.methods.addUserGroup = function(req, res, next){

};

GroupSchema.statics.getGroups = function(groupnames, next) {
    this.find({"groupname": { $in: groupnames}}, {'_id':0}, function (err, foundGroups){
        if(err) next(err);
        next(null, foundGroups);
    });
};

module.exports = mongoose.model('Groups', GroupSchema);
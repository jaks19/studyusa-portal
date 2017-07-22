var invitationServices = {};

let request = require('request'),
    dbopsServices = require('../dbops-services'),
    Invitation = require("../../models/invitation");

invitationServices.generateCode = function generateCode(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) { text += possible. charAt(Math. floor(Math. random() * possible. length)) }
    return text;
}

invitationServices.garbageCollectInvitations = async function garbageCollectInvitations(req, res, garbageCollectDays) {
    let allInvitations = await dbopsServices.findAllEntriesAndPopulate(Invitation, { }, [ ], req, res);
    allInvitations.forEach(function(thisInvitation) {
        let thisValidDate = new Date(thisInvitation.validUntil),
            today = new Date(Date.now()),
            tooOldBar = (new Date()).setDate(today.getDate() - garbageCollectDays);
        if (thisValidDate < tooOldBar){ dbopsServices.findEntryByIdAndRemove(Invitation, thisInvitation._id, req, res) }
    });
    return;
}

invitationServices.getSortedInvitations = async function getSortedInvitations(req, res){
    let invitations = await dbopsServices.findAllEntriesAndPopulate(Invitation, { }, [ ], req, res),
        active = [],
        expired = [];
        
    for (var i = 0; i < invitations.length; i++) {
        let thisInvitation = invitations[i],
            thisValidDate = new Date(thisInvitation.validUntil),
            today = new Date(Date.now());
        if (thisValidDate < today){ expired.push(thisInvitation) }
        else { active.push(thisInvitation) }
    }
    return [ active, expired ];
}

invitationServices.isValid = async function isValid(req, res, garbageCollect=true){
    var invitation = await dbopsServices.findOneEntryAndPopulate(Invitation, { code: req.body.code }, [ ], req, res);
    if (!invitation) { return false }
    let thisDate = new Date(invitation.validUntil),
        today = new Date(Date.now());
    if (thisDate < today){ return false }
    
    if(garbageCollect) { dbopsServices.findEntryByIdAndRemove(Invitation, invitation._id, req, res) }
    return true;
}
    
module.exports = invitationServices;
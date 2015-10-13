/**
 * Created by nsb on 09/10/2015.
 */

var myApp = angular.module('mainModule',['ngDialog']);

myApp.factory('roles',function($http){
    var self = this;
    var roles = {};
    roles.list = {};

    // GET
    self.get = roles.get;
    roles.get = function(callback) {
        $http.get("http://localhost:8080/api/roles")
            .then(function successCallback(response){
                roles.list = response.data.roles;
                callback(response.data.privileges);

            }, function errorCallback(response){
                alert(response.statusText);
            });
    };
    // DELETE
    self.delete = roles.delete;
    roles.delete = function(callback, dialogObj){
        id = dialogObj.general['roleID'];
        $http.delete("http://localhost:8080/api/roles/"+id+"/delete")
            .then(function successCallback(response){
                callback(response);
            },function errorCallback(response){
                callback(response);
            });
    };

    // CREATE
    self.create = roles.create;
    roles.create = function(callback, dialogObj){
        var privArr = [];
        for (var p in dialogObj.inputs.cbs){if (dialogObj.inputs.cbs[p]) {privArr.push(p)}};
        var newRole = {
            "name":dialogObj.inputs['name'],
            "description":dialogObj.inputs['description'],
            "privileges":privArr
        };
        $http.post("http://localhost:8080/api/roles/create",JSON.stringify(newRole))
            .then(function successCallback(response){
                callback(response);
            },function errorCallback(response){
                callback(response);
            });
    };

    // UPDATE
    self.update = roles.update;
    roles.update = function(callback, dialogObj){
        id = dialogObj.general['roleId'];
        var updatedRole = {
            "name":dialogObj.inputs['name'],
            "description":dialogObj.inputs['description'],
            "privileges":Object.keys(dialogObj.inputs.cbs)
        };
        $http.post("http://localhost:8080/api/roles/"+id+"/update",JSON.stringify(updatedRole))
            .then(function successCallback(response){
                callback(response);
            },function errorCallback(response){
                callback(response);
            });
    };

    return roles;

});


myApp.factory('dialogService', function(){
    var self = this;
    var dialogObj = {};
    dialogObj.values = {};
    dialogObj.values.privCbs = {};

    // NEW DIALOG OBJECT DEFINITION
    // the general object will hold things like the dialog header
    dialogObj.general = {};
    // inputs will input values i.e name ,description and input status like disabled..
    dialogObj.inputs = {};
    // inputs.cbs is the object containing a value per privilage (false or true) and basically
    // is the checked/unchecked we see on screen.
    dialogObj.inputs.cbs = {};
    // holds the buttons data ( names ,state for ng-hide,ng-disabled )
    dialogObj.buttons = {};
    // specific functions
    self.setCreate = function (){
        dialogObj.general['Header'] = 'Create New Role';
        dialogObj.inputs['name'] = "";
        dialogObj.inputs['description'] = "";
        dialogObj.inputs['disableNameInput'] = false;
        dialogObj.inputs['disableDescriptionInput'] = false;
        dialogObj.inputs['disablePrivilegeCheckboxes'] = false;
        dialogObj.buttons['hideEditBtn'] = true;
        dialogObj.buttons['hideCreateBtn'] = false;
        dialogObj.buttons['hideRemoveBtn'] = true;
    };
    self.setUpdate = function (roleObj){
        dialogObj.general['Header'] = 'Edit Role';
        dialogObj.inputs['name'] = roleObj['name'];
        dialogObj.inputs['description'] = roleObj['description'];
        dialogObj.inputs['disableNameInput'] = false;
        dialogObj.inputs['disableDescriptionInput'] = false;
        dialogObj.inputs['disablePrivilegeCheckboxes'] = false;
        dialogObj.buttons['hideEditBtn'] = false;
        dialogObj.buttons['hideCreateBtn'] = true;
        dialogObj.buttons['hideRemoveBtn'] = true;
    };
    self.setRemove = function (roleObj){
        dialogObj.general['Header'] = 'Remove Role';
        dialogObj.inputs['name'] = roleObj['name'];
        dialogObj.inputs['description'] = roleObj['description'];
        dialogObj.inputs['disableNameInput'] = true;
        dialogObj.inputs['disableDescriptionInput'] = true;
        dialogObj.inputs['disablePrivilegeCheckboxes'] = true;
        dialogObj.buttons['hideEditBtn'] = true;
        dialogObj.buttons['hideCreateBtn'] = true;
        dialogObj.buttons['hideRemoveBtn'] = false;
    };
    self.setView = function (roleObj){
        dialogObj.general['Header'] = 'View Role';
        dialogObj.inputs['name'] = roleObj['name'];
        dialogObj.inputs['description'] = roleObj['description'];
        dialogObj.inputs['disableNameInput'] = true;
        dialogObj.inputs['disableDescriptionInput'] = true;
        dialogObj.inputs['disablePrivilegeCheckboxes'] = true;
        dialogObj.buttons['hideEditBtn'] = true;
        dialogObj.buttons['hideCreateBtn'] = true;
        dialogObj.buttons['hideRemoveBtn'] = true;
    };
    self.setCheckboxesState = function (roleObj, fullPrivList){
        if (roleObj.name !== '')
        {
            for (var i = 0; i < fullPrivList.length; i++) {
                dialogObj.inputs.cbs[fullPrivList[i]] = roleObj['privileges'].indexOf(fullPrivList[i]) >= 0;
            }
        } else {
            for (var j = 0; j < fullPrivList.length; j++) {
                dialogObj.inputs.cbs[fullPrivList[j]] = false;
            }
        }

    };
    self.initDialog = dialogObj.initDialog;
    dialogObj.initDialog = function(dialogType, rolesObj, id, fullPrivList){
        var roleObj = {name: '', description: '', privileges: []};
        dialogObj.general['roleID']=0;
        if (id > 0) { roleObj = rolesObj.list[id]; dialogObj.general['roleID']=id }
        self.setCheckboxesState(roleObj, fullPrivList);
        switch (dialogType){
            case 'create' : self.setCreate();break;
            case 'update' : self.setUpdate(roleObj); break;
            case 'remove' : self.setRemove(roleObj); break;
            case 'view' : self.setView(roleObj); break;
            default:
        }
    };
    // END OF NEW DIALOG OBJECT DEFINITION


    //self.set = dialogObj.set;
    /**dialogObj.set = function(dialogType, roleLineObj){

        switch(dialogType){
            case 'view':
                dialogObj.values = {
                    disableNameInput: true,
                    disableDescriptionInput: true,
                    disablePrivilegesInput: true,
                    disablePrivilegesCheckboxes: true,
                    hideEditBtn : true,
                    hideCreateBtn: true,
                    hideRemoveBtn : true,
                    Header : 'View Role',
                    hideStatus: false
                };
                break;
            case 'edit':
                dialogObj.values = {
                    disableNameInput: false,
                    disableDescriptionInput: false,
                    disablePrivilegesInput: false,
                    disablePrivilegesCheckboxes: false,
                    hideEditBtn : false,
                    hideCreateBtn: true,
                    hideRemoveBtn : true,
                    Header : 'Edit Role',
                    hideStatus: true
                };
                break;
            case 'remove':
                dialogObj.values = {
                    disableNameInput: true,
                    disableDescriptionInput: true,
                    disablePrivilegesInput: true,
                    disablePrivilegesCheckboxes: true,
                    hideEditBtn : true,
                    hideCreateBtn: true,
                    hideRemoveBtn : false,
                    Header : 'Remove Role',
                    hideStatus: false
                };
                break;
            case 'create':
                dialogObj.values = {
                    disableNameInput: false,
                    disableDescriptionInput: false,
                    disablePrivilegesInput: false,
                    disablePrivilegesCheckboxes: false,
                    hideEditBtn : true,
                    hideCreateBtn: false,
                    hideRemoveBtn : true,
                    Header : 'Remove Role',
                    hideStatus: false
                };
                break;
            default:


        }
        dialogObj.values['name'] = roleLineObj['name'];
        dialogObj.values['description'] = roleLineObj['description'];
        dialogObj.values['privileges'] = roleLineObj['privileges'];
    };
     **/

    //self.removeRole = dialogObj.removeRole;
    //dialogObj.removeRole = function(id){
    //    dialogObj.values['hideStatus'] = false;
    //    dialogObj.values['statusText'] = "Removing Role: "+ id;
    //};

    //self.checkBoxTester = dialogObj.checkBoxTester;
    //dialogObj.checkBoxTester = function(priv2check, PrivList){
    //    return PrivList.indexOf(priv2check) >= 0
    //};


    //self.getPrivCheckboxesState = dialogObj.getPrivCheckboxesState;
    //dialogObj.getPrivCheckboxesState = function(p){
    //    return(dialogObj.values.privCbs[p]);
    //};

    return dialogObj
});

myApp.controller('MainCtrl', function($scope, ngDialog, roles, dialogService) {
    var self = this;
    self.roles = roles;
    self.roles.get(function(res){
        // remember that fullPrivList is an array.
        self.fullPrivList = res;
    });
    self.dialogObj = dialogService;

    // Expand Role row into dialog
    self.openDialog = function(id,dialogType){
        //self.roleID = id;
        self.dialogObj.initDialog(dialogType, self.roles, id, self.fullPrivList);
        //if (id > 0) {
         //   self.dialogObj.set(dialogType, self.roles.list[id]);
        //} else {
         //   self.dialogObj.set(dialogType, {
          //      name: "please insert name",
           //     description: "Please write a description",
            //    privileges: "please choose privileges"
            //});
       // }

        ngDialog.closeAll();
        ngDialog.open({
            template: 'dNewTemplate.html',
            disableAnimation: true,
            closeByEscape: false,
            closeByDocument: false,
            showClose: false,
            scope: $scope,
            className: 'ngdialog-theme-default'
        })
    };

    // run delete role
    self.remove = function(id){
        //self.dialogObj.removeRole(id);
        ngDialog.closeAll();
        self.roles.delete(function(res){
            if (res.statusText == "OK") {
                self.roles.get()
            } else {
                alert("Role deletion problem: " + res.data);
            }
        }, self.dialogObj);
    };

    // run the create role
    self.create = function() {

        ngDialog.closeAll();
        alert(Object.keys(self.dialogObj.inputs.cbs['View Data']));
        self.roles.create(function (res) {
            if (res.statusText == "OK") {
                self.roles.get()
            } else {
                alert("Role creation problem: " + res.data);
            }
        }, self.dialogObj);
    };

    // run update role
    self.update = function() {
        //for (p in self.fullPrivList) {
         //   pName = self.fullPrivList[p];
         //   if (self.dialogObj.values['privileges'].indexOf(pName) == -1){
         //       self.dialogObj.values['privileges'].push(pName);
         //   }

        //}
        //self.dialogObj.values['privileges'] = privArr.join(',');

        ngDialog.closeAll();
        self.roles.update(function (res) {
            if (res.statusText == "OK") {
                self.roles.get()
            } else {
                alert("Role creation problem: " + res.data);
            }
        }, self.dialogObj);
    };
});
/**
 * Created by nsb on 09/10/2015.
 */

var myApp = angular.module('mainModule',['ngDialog']);

myApp.factory('roles',function($http){
    var self = this;
    var roles = {};
    roles.list = {};

    self.checkboxes2array = function(cbObj){
    // this function will take the privilege checkboxes and
    // translate them to array of strings
        var privArr = [];
        for (var p in cbObj){if (cbObj[p]) {privArr.push(p)}}
        return privArr;
    };
    self.constructRoleObj = function(dialogObj){
        // function builds the new role json data to
        // be sent when creating/updating a role.
        return {
            "name":dialogObj.inputs['name'],
            "description":dialogObj.inputs['description'],
            "privileges":self.checkboxes2array(dialogObj.inputs.cbs)
        };
    };

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
        $http.delete("http://localhost:8080/api/roles/"+dialogObj.general['roleID']+"/delete")
            .then(function successCallback(response){
                callback(response);
            },function errorCallback(response){
                callback(response);
            });
    };

    // CREATE
    self.create = roles.create;
    roles.create = function(callback, dialogObj){
        var newRole = self.constructRoleObj(dialogObj);
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
        var updatedRole = self.constructRoleObj(dialogObj);
        $http.post("http://localhost:8080/api/roles/"+dialogObj.general['roleID']+"/update",JSON.stringify(updatedRole))
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
        dialogObj.buttons['hideGoToEditModeBtn'] = true;
    };
    self.setUpdate = function (roleObj){
        dialogObj.general['Header'] = 'Update Role';
        dialogObj.inputs['name'] = roleObj['name'];
        dialogObj.inputs['description'] = roleObj['description'];
        dialogObj.inputs['disableNameInput'] = false;
        dialogObj.inputs['disableDescriptionInput'] = false;
        dialogObj.inputs['disablePrivilegeCheckboxes'] = false;
        dialogObj.buttons['hideEditBtn'] = false;
        dialogObj.buttons['hideCreateBtn'] = true;
        dialogObj.buttons['hideRemoveBtn'] = true;
        dialogObj.buttons['hideGoToEditModeBtn'] = true;
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
        dialogObj.buttons['hideGoToEditModeBtn'] = true;
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
        dialogObj.buttons['hideGoToEditModeBtn'] = false;
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
            case 'create'       : self.setCreate();break;
            case 'update'       : self.setUpdate(roleObj); break;
            case 'remove'       : self.setRemove(roleObj); break;
            case 'view'         : self.setView(roleObj); break;
            case 'toEditMode'   : self.setUpdate(roleObj); break;
            default:
        }
    };
    // END OF NEW DIALOG OBJECT DEFINITION

    return dialogObj
});

myApp.controller('MainCtrl', function($scope, ngDialog, roles, dialogService) {
    // Main controller
    var self = this;
    self.roles = roles;
    self.roles.get(function(res){
        self.fullPrivList = res; // remember that fullPrivList is an array.
    });
    self.dialogObj = dialogService;

    // Expand Role row into dialog
    self.openDialog = function(id,dialogType){
        // next line is the dialog Object constructor/init
        self.dialogObj.initDialog(dialogType, self.roles, id, self.fullPrivList);
        ngDialog.closeAll();
        ngDialog.open({
            template: 'dNewTemplate.html',
            disableAnimation: true,
            closeByEscape: true,
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
        ngDialog.closeAll();
        self.roles.update(function (res) {
            if (res.statusText == "OK") {
                self.roles.get()
            } else {
                alert("Role Updating problem: " + res.data);
            }
        }, self.dialogObj);
    };
});
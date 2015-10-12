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
    roles.delete = function(callback, id){
        $http.delete("http://localhost:8080/api/roles/"+id+"/delete")
            .then(function successCallback(response){
                callback(response);
            },function errorCallback(response){
                callback(response);
            });
    };

    // CREATE
    self.create = roles.create;
    roles.create = function(callback, createObj){
        var newRole = {
            "name":createObj.name,
            "description":createObj.description,
            "privileges":createObj.privileges.split(",")
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
    roles.update = function(callback, id, updateObj){
        var newRole = {
            "name":updateObj.name,
            "description":updateObj.description,
            "privileges":updateObj.privileges.split(",")
        };
        $http.post("http://localhost:8080/api/roles/"+id+"/update",JSON.stringify(newRole))
            .then(function successCallback(response){
                callback(response);
            },function errorCallback(response){
                callback(response);
            });
    };

    return roles;

});


myApp.factory('dialogServices', function(){
    var self = this;
    var dVars = {};
    dVars.values = {};
    dVars.values.privCbs = {};

    self.set = dVars.set;
    dVars.set = function(dialogType, roleLineObj){

        switch(dialogType){
            case 'view':
                dVars.values = {
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
                dVars.values = {
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
                dVars.values = {
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
                dVars.values = {
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
        dVars.values['name'] = roleLineObj['name'];
        dVars.values['description'] = roleLineObj['description'];
        dVars.values['privileges'] = roleLineObj['privileges'];
    };

    self.removeRole = dVars.removeRole;
    dVars.removeRole = function(id){
        dVars.values['hideStatus'] = false;
        dVars.values['statusText'] = "Removing Role: "+ id;
    };

    self.checkBoxTester = dVars.checkBoxTester;
    dVars.checkBoxTester = function(priv2check, PrivList){
        return PrivList.indexOf(priv2check) >= 0
    };


    self.getPrivCheckboxesState = dVars.getPrivCheckboxesState;
    dVars.getPrivCheckboxesState = function(p){
        return(dVars.values.privCbs[p]);
    };

    return dVars
});

myApp.controller('MainCtrl', function($scope, ngDialog, roles, dialogServices) {
    var self = this;
    self.roles = roles;
    self.roles.get(function(res){
        self.fullPrivList = res;
    });
    self.dialogServices = dialogServices;

    // Expand Role row into dialog
    self.openDialog = function(id,dialogType){
        self.roleID = id;
        if (id > 0) {
            self.dialogServices.set(dialogType, self.roles.list[id]);
        } else {
            self.dialogServices.set(dialogType, {
                name: "please insert name",
                description: "Please write a description",
                privileges: "please choose privileges"
            });
        }

        ngDialog.closeAll();
        ngDialog.open({
            template: 'dTemplate.html',
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
        //self.dialogServices.removeRole(id);
        ngDialog.closeAll();
        self.roles.delete(function(res){
            if (res.statusText == "OK") {
                self.roles.get()
            } else {
                alert("Role deletion problem: " + res.data);
            }
        },id);
    };

    // run the create role
    self.create = function() {
        var privArr = [];
        for (p in self.fullPrivList) {
            pName = self.fullPrivList[p];

            if (self.dialogServices.values.privCbs[pName]){
                privArr.push(pName);
            }
        }
        self.dialogServices.values['privileges'] = privArr.join(',');
        alert(self.dialogServices.values['privileges']);
        ngDialog.closeAll();
        self.roles.create(function (res) {
            if (res.statusText == "OK") {
                self.roles.get()
            } else {
                alert("Role creation problem: " + res.data);
            }
        }, self.dialogServices.values);
    };

    // run update role
    self.update = function(id) {
        self.roles.update(function (res) {
            if (res.statusText == "OK") {
                self.roles.get()
            } else {
                alert("Role creation problem: " + res.data);
            }
        }, id, self.dialogServices.values);
    };
});
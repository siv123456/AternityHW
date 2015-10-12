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

    return roles;

});


myApp.factory('dialogServices', function(){
    var self = this;
    var dVars = {};
    dVars.values = {};

    self.set = dVars.set;
    dVars.set = function(dialogType){
        dVars.values['statusText'] = "";
        switch(dialogType){
            case 'view':
                dVars.values = {
                    disableEditBtn : true,
                    disableRemoveBtn : true,
                    Header : 'View Role',
                    hideStatus: false
                };
                break;
            case 'edit':
                dVars.values = {
                    disableEditBtn : false,
                    disableRemoveBtn : true,
                    Header : 'Edit Role',
                    hideStatus: true
                };
                break;
            case 'remove':
                dVars.values = {
                    disableEditBtn : true,
                    disableRemoveBtn : false,
                    Header : 'Remove Role',
                    hideStatus: false
                };
                break;
            default:

        }
    };

    self.removeRole = dVars.removeRole;
    dVars.removeRole = function(id){
        dVars.values['hideStatus'] = false;
        dVars.values['statusText'] = "Removing Role: "+ id;
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
        self.dialogServices.set(dialogType);
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

    // create init values
    self.createObj = {};
    self.createObj.name = 'secure444';
    self.createObj.desc = 'Description..';
    self.createObj.priv = 'View Data,View Users,Manage Users,View Roles';

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

});
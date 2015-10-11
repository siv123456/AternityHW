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
    roles.get = function(callbackf) {
        $http.get("http://localhost:8080/api/roles")
            .then(function successCallback(response){
                roles.list = response.data.roles;
                callbackf(response.data.privileges);

            }, function errorCallback(response){
                alert(response.statusText);
            });
    };

    return roles;

});

myApp.factory('dialogVars', function(){
    var self = this;
    var dVars = {};
    dVars.values = {};

    self.set = dVars.set;
    dVars.set = function(dialogType){
        switch(dialogType){
            case 'view':
                dVars.values = {
                    disableEditBtn : true,
                    disableRemoveBtn : true,
                    Header : 'View Role'
                };
                break;
            case 'edit':
                dVars.values = {
                    disableEditBtn : false,
                    disableRemoveBtn : true,
                    Header : 'Edit Role'
                };
                break;
            case 'remove':
                dVars.values = {
                    disableEditBtn : true,
                    disableRemoveBtn : false,
                    Header : 'Remove Role'
                };
                break;
            default:

        }
    };


    return dVars
});

myApp.controller('MainCtrl', function($scope, ngDialog, roles, dialogVars) {
    var self = this;
    self.roles = roles;
    self.roles.get();
    self.dialogVars = dialogVars;

    // Expand Role row into dialog
    self.expandDialog = function(id,dialogType){
        self.roleID = id;
        self.dialogVars.set(dialogType);

        ngDialog.open({
            template: 'dialogTemplate.html',
            closeByEscape: false,
            closeByDocument: false,
            showClose: false,
            scope: $scope,
            className: 'ngdialog-theme-default'
        }).then(
            function(value) {
                if (value == 'close') {
                    ngdialog.close();
                }
            }
        );
    };

    // Expand row to edit role
    self.editDialog = function(id){
        self.roleID = id;
        self.editBtnDisable = false;
        self.removeBtnDisable = true;
        self.dialogHeader = "Role To Edit";
        ngDialog.open({
            template: 'dialogTemplate.html',
            closeByEscape: false,
            closeByDocument: false,
            scope: $scope,
            className: 'ngdialog-theme-default'
        });
    }

    // Expand row to remove role
    self.removeDialog = function(id){
        self.roleID = id;
        self.editBtnDisable = true;
        self.removeBtnDisable = false;
        self.dialogHeader = "Role To Remove";
        ngDialog.open({
            template: 'dialogTemplate.html',
            closeByEscape: false,
            closeByDocument: false,
            scope: $scope,
            className: 'ngdialog-theme-default'
        });
    }
});
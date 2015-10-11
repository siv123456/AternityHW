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

    return roles;

});

myApp.controller('MainCtrl', function($scope, ngDialog, roles) {
    var self = this;
    self.roles = roles;
    self.roles.get();

    self.expandDialog = function(id){
        self.expandRoleID = id;
        ngDialog.open({
            template: 'dialogTemplate.html',
            closeByEscape: false,
            closeByDocument: false,
            showClose: false,
            scope: $scope,
            className: 'ngdialog-theme-default'
        });
    }
});
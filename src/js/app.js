var myApp = angular.module("myApp", ["ngRoute"]);

myApp.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "login.html",
            controller: "LoginController"
        })
});

myApp.factory('auth', function() {
    var storedUser = [];
    var authService = {};

    authService.authed = function () {
        return !!storedUser.uid;
    };

    authService.currentUser = function () {
      return storedUser;
    };

    authService.login = function (user) {
        storedUser.push = {
            csrf_token: user.csrf_token,
            uid: user.current_user.uid,
            name: user.current_user.name,
            roles: user.current_user.roles,
            logout_token: user.logout_token
        };
        console.log(storedUser);
    };
    return authService;
});

myApp.controller('LoginController', [
    '$scope', '$http', 'auth',
    function ($scope, $http, auth) {
        $scope.credentials = {
            username: '',
            password: ''
        };
        $scope.loginError = false;

        $scope.login = function (credentials) {
            console.log(auth.currentUser());
            doLogin(credentials);
            console.log(auth.currentUser());
        };
        var doLogin = function (credentials) {
            var data = {
                name: credentials.username,
                pass: credentials.password
            };
            return $http
                .post('http://dropa.asuscomm.com/dapi/user/login?_format=json', data,{
                    headers: {
                        'Content-Type': 'Content-type: application/json'
                    }
                })
                .success(function (res) {
                    $scope.loginError = false;
                    console.log(res);
                })
                .error(function () {
                    $scope.loginError = true;
                });
        }}
]);

myApp.controller('ApplicationController', [
    '$scope', '$http', 'auth',
    function ($scope, $http, auth) {
        $scope.needLogin = function () {
            return auth.authed();
        };

        $scope.currentUser = auth.currentUser()
    }
]);

myApp.controller('check', [
    '$scope', 'auth',
    function ($scope, auth) {
        $scope.check = function () {
            console.log(auth.currentUser())
        }
    }
]);

myApp.factory('items', function() {
    var items = [];
    var itemsService = {};

    itemsService.add = function(item) {
        items.push(item);
    };
    itemsService.list = function() {
        return items;
    };

    return itemsService;
});

myApp.controller('Ctrl1', [
    '$scope', 'items',
    function ($scope, items) {
        $scope.list = items.list;
    }
]);

myApp.controller('Ctrl2', [
    '$scope', 'items',
    function ($scope, items) {
        $scope.add = items.add;
    }
]);

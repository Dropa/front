var myApp = angular.module("myApp", ["ngRoute"]);

myApp.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "templates/frontpage.html",
            controller: "FrontPageController"
        })
});

myApp.factory('auth', function() {
    if (!storedUser) {
        var storedUser = [];
    }
    if (!authService) {
        var authService = {};
    }

    authService.authed = function () {
        return !!storedUser.uid;
    };

    authService.currentUser = function () {
      return storedUser;
    };

    authService.login = function (user) {
        storedUser = {
            csrf_token: user.csrf_token,
            uid: user.current_user.uid,
            name: user.current_user.name,
            roles: user.current_user.roles,
            logout_token: user.logout_token
        };
    };

    authService.logout = function () {
        storedUser = {}
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
            doLogin(credentials);
        };
        $scope.logout = function () {
            doLogout();
        };

        var doLogin = function (credentials) {
            var data = {
                name: credentials.username,
                pass: credentials.password
            };
            return $http
                .post('http://dropa.asuscomm.com/dapi/user/login?_format=json', data, {
                    headers: {
                        'Content-Type': 'Content-type: application/json'
                    }
                })
                .success(function (res) {
                    $scope.loginError = false;
                    auth.login(res);
                })
                .error(function (res) {
                    console.log(res);
                    $scope.loginError = true;
                });
        };
        var doLogout = function () {
            return $http
                .get('http://dropa.asuscomm.com/dapi/user/logout')
                .success(function (res) {
                    console.log(res);
                    auth.logout();
                })
                .error(function (res) {
                    console.log(res);
                })
        }
}]);

myApp.controller('FrontPageController', [
    '$scope', '$http',
    function ($scope, $http) {
    }
]);

myApp.controller('ApplicationController', [
    '$scope', '$http', 'auth',
    function ($scope, $http, auth) {
        $scope.authed = auth.authed;
        $scope.currentUser = auth.currentUser;
        $scope.logstat = function () {
            var token = '';
            $http
                .get('http://dropa.asuscomm.com/dapi/rest/session/token')
                .success(function (res) {
                    token = res;
                });
            return $http
                .get('http://dropa.asuscomm.com/dapi/user/login_status?_format=json', {
                    headers: {
                        'Content-Type': 'Content-type: application/json',
                        'X-CSRF-Token': token
                    }})
                .success(function (res) {
                    console.log(res);
                })
                .error(function (res) {
                    console.log(res);
                })
        }
    }
]);



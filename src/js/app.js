var myApp = angular.module('myApp', ['ngRoute']);

myApp.config(['$routeProvider', function($routeProvider) {
    var authRequired = function ($location, $q, auth) {
        var deferred = $q.defer();
        if (auth.authed()) {
            deferred.resolve();
        }
        else {
            deferred.reject();
            $location.url('/');
        }
        return deferred.promise;
    };

    $routeProvider
        .when('/', {
            templateUrl: 'templates/frontpage.html',
            controller: 'FrontPageController'
        })
        .when('/articles', {
            templateUrl: 'templates/articles/articles.html',
            controller: 'ArticlesController'
        })
        .when('/profile', {
            templateUrl: 'templates/profile/profile.html',
            controller: 'ProfileController',
            resolve:{authOk:authRequired}
        })
        .otherwise({redirectTo: '/'});

}]);

myApp.factory('auth', function($http) {
    if (!storedUser) {
        var storedUser = [];
    }
    if (!authService) {
        var authService = {};
    }

    authService.basePath = function () {
        return 'http://dropa.asuscomm.com/dapi';
    };

    authService.authed = function () {
        return !!storedUser.uid;
    };

    authService.currentUser = function () {
      return storedUser;
    };

    authService.token = function () {
        $http.get(authService.basePath() + '/rest/session/token')
            .success(function (token) {
                return token;
            })
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
            doLogin(credentials).error(function () {
                console.log('Trying again.');
                doLogout().success(function () {
                    doLogin(credentials);
                });
            });
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
                .post(auth.basePath() + '/user/login?_format=json', data, {
                    headers: {
                        'Content-Type': 'Content-type: application/json'
                    }
                })
                .success(function (res) {
                    $scope.loginError = false;
                    auth.login(res);
                })
                .error(function () {
                    $scope.loginError = true;
                });
        };
        var doLogout = function () {
            return $http
                .get(auth.basePath() + '/user/logout')
                .success(function () {
                    auth.logout();
                })
                .error(function () {

                })
        }
}]);

myApp.controller('FrontPageController', [
    '$scope', '$http',
    function ($scope, $http) {
    }
]);

myApp.controller('ArticlesController', [
    '$scope', '$http', 'auth',
    function ($scope, $http, auth) {
        $scope.currentUser = auth.currentUser;
        $scope.authed = auth.authed;
        $scope.articles = [];
        $scope.selectedArticle = {};
        $scope.newArticle = {
            title: '',
            body: '',
            image: ''
        };
        $scope.initArticles = function () {
            $http.get(auth.basePath() + '/articles')
                .success(function (data) {
                    $scope.articles = data;
                });
        };
        $scope.editAccess = function (article) {
            roles = auth.currentUser().roles;
            if (roles) {
                if (roles.indexOf('administrator') !== -1 || roles.indexOf('article_moderator') !== -1) {
                    return true;
                }
            }
            return article.author_id === auth.currentUser().uid;
        };
        $scope.showArticle = function (articleId) {
            $scope.selectedArticle = {};
            $http.get(auth.basePath() + "/articles/" + articleId + '?_format=json', {
                headers: {
                    'Content-Type': 'Content-type: application/json'
                }})
                .success(function(data) {
                    console.log(data);
                    $scope.selectedArticle = data[0];
                });
        };
        $scope.resetArticle = function () {
            $scope.newArticle = {};
        };
        $scope.addArticle = function (newArticle) {
            console.log(newArticle);
            $scope.resetArticle();
        }
    }
]);

myApp.controller('ApplicationController', [
    '$scope', '$http', 'auth',
    function ($scope, $http, auth) {
        $scope.authed = auth.authed;
        $scope.currentUser = auth.currentUser;
    }
]);



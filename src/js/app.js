var myApp = angular.module('myApp', ['ngRoute', 'ui.rCalendar']);

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
            templateUrl: 'templates/articles/articles.html',
            controller: 'ArticlesController'
        })
        .when('/events', {
            templateUrl: 'templates/events/events.html',
            controller: 'EventsController'
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
    if (!authToken) {
        var authToken = '';
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

        return authToken;
    };

    authService.tokenize = function (_callback) {
        $http.get(authService.basePath() + '/rest/session/token')
            .success(function (result) {
                authToken = result;
                _callback();
            })
            .error(function () {
                console.log('Problem while fetching token.')
            });
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
                        'Content-type': 'application/json'
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

myApp.controller('ArticlesController', [
    '$scope', '$http', 'auth',
    function ($scope, $http, auth) {
        $scope.currentUser = auth.currentUser;
        $scope.authed = auth.authed;
        $scope.articles = [];
        $scope.selectedArticle = {};
        $scope.newArticle = {};
        $scope.initArticles = function () {
            $http.get(auth.basePath() + '/articles?_format=json')
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
            $http.get(auth.basePath() + '/articles/' + articleId + '?_format=json', {
                headers: {
                    'Content-type': 'application/json'
                }})
                .success(function(data) {
                    $scope.selectedArticle = data[0];
                });
        };
        $scope.resetArticle = function () {
            $scope.newArticle = {};
            $scope.selectedArticle = {};
        };
        $scope.addArticle = function (newArticle) {
            // TODO: Apparently newArticle.image does not get here.
            var data = {
                type: 'article',
                title: [newArticle.title],
                body: [newArticle.body]
            };
            var post = function () {
                $http.post(auth.basePath() + '/node?_format=json', data, {
                    headers: {
                        'X-CSRF-Token': auth.token(),
                        'Content-type': 'application/json'
                    }
                }).success(function(res) {
                    $scope.resetArticle();
                    $scope.initArticles();
                })
            };
            auth.tokenize(post);
        };
        $scope.editArticle = function (articleId) {
            $scope.selectedArticle = {};
            $http.get(auth.basePath() + '/articles/' + articleId + '?_format=json', {
                headers: {
                    'Content-type': 'application/json'
                }})
                .success(function(data) {
                    $scope.selectedArticle = data[0];
                });
        };
        $scope.updateArticle = function (article) {
            var data = {
                type: 'article',
                title: [article.title],
                body: [article.body]
            };
            var post = function () {
                $http.patch(auth.basePath() + '/node/' + article.id + '?_format=json', data, {
                    headers: {
                        'X-CSRF-Token': auth.token(),
                        'Content-type': 'application/json'
                    }
                }).success(function(res) {
                    $scope.resetArticle();
                    $scope.initArticles();
                })
            };
            auth.tokenize(post);
        };
        $scope.removeArticle = function (articleId) {
            $scope.selectedArticle = {};
            $http.get(auth.basePath() + '/articles/' + articleId + '?_format=json', {
                headers: {
                    'Content-type': 'application/json'
                }})
                .success(function(data) {
                    $scope.selectedArticle = data[0];
                });
        };
        $scope.deleteArticle = function (article) {
            var post = function () {
                $http.delete(auth.basePath() + '/node/' + article.id + '?_format=json', {
                    headers: {
                        'X-CSRF-Token': auth.token(),
                        'Content-type': 'application/json'
                    }
                }).success(function(res) {
                    $scope.resetArticle();
                    $scope.initArticles();
                })
            };
            auth.tokenize(post);
        }
    }
]);

myApp.controller('EventsController', [
    '$scope', '$http', 'auth',
    function ($scope, $http, auth) {
        'use strict';

        $scope.changeMode = function (mode) {
            $scope.mode = mode;
        };

        $scope.today = function () {
            $scope.currentDate = new Date();
        };

        $scope.isToday = function () {
            var today = new Date();
            var currentCalendarDate = new Date($scope.currentDate);

            today.setHours(0, 0, 0, 0);
            currentCalendarDate.setHours(0, 0, 0, 0);
            return today.getTime() === currentCalendarDate.getTime();
        };

        $scope.loadEvents = function () {
            $http.get(auth.basePath() + '/events?_format=json')
                .success(function (json) {setEvents(json)});
        };

        $scope.onEventSelected = function (event) {
            $scope.event = event;
            $("#showEvent").modal();
        };

        $scope.onTimeSelected = function (selectedTime, events) {

        };

        function setEvents(json) {
            var events = [];
            for (var i = 0; i < json.length; i++) {
                var startDate = new Date(json[i].start_date.replace(/-/g,'/').replace('T',' '));
                var endDate = new Date(json[i].end_date.replace(/-/g,'/').replace('T',' '));
                events.push({
                    title: json[i].title,
                    startTime: startDate,
                    endTime: endDate,
                    allDay: false,
                    place: json[i].place,
                    body: json[i].body
                });
            }
            $scope.eventSource = events;
        }
    }
]);

myApp.controller('ProfileController', [
    '$scope', '$http', 'auth',
    function ($scope, $http, auth) {
        $scope.user = {};

        $scope.initUser = function () {
            $http.get(auth.basePath() + '/user/' + auth.currentUser().uid + '?_format=json')
                .success(function (res) {
                    $scope.user = res;
                })
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



/// <reference path='_all.ts' />

module blogposts {
    'use strict';

    //maybe should use ui-router instead of ngRoute
    var golby = angular.module('golby', ['ngRoute'])
            .controller('viewBlogPostCtrl', ViewBlogPostCtrl)
            .controller('createBlogPostCtrl', CreateBlogPostCtrl)
            .controller('authenticationCtrl', AuthenticationCtrl)
            .controller('alertsCtrl', AlertsCtrl)
            .controller('pageCtrl', PageCtrl)

            .service('blogPostStore', RemoteBlogPostStore)
            .service('authenticationService', RemoteAuthenticationService)
            .service('alertsService', AlertsService)
            .service('promiseBuilder', PromiseBuilder)
            .service('pageService', PageService)

            .config(['$routeProvider',
                function routes($routeProvider: ng.route.IRouteProvider) {
                    $routeProvider
                        .when('/', {
                            templateUrl: 'views/viewPosts.html',
                            controller: 'viewBlogPostCtrl'
                        })
                        .when('/posts/', {
                            redirectTo: '/'
                        })
                        .when('/posts/:postId', {
                            templateUrl: 'views/viewSinglePost.html',
                            controller: 'viewBlogPostCtrl'
                        })
                        .when('/admin/posts/:postId', {
                            templateUrl: 'views/newPost.html',
                            controller: 'createBlogPostCtrl'
                        })
                        .when('/admin/posts/', {
                            templateUrl: 'views/newPost.html',
                            controller: 'createBlogPostCtrl'
                        })
                        .when('/login/', {
                            templateUrl: 'views/login.html'
                        })
                        .when('/404', {
                            templateUrl: 'views/404.html'
                        })
                        .otherwise({
                            redirectTo: '/404'
                        });
                }
            ]);
}

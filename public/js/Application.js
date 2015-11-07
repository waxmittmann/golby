/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var ViewBlogPostCtrl = (function () {
        function ViewBlogPostCtrl(blogPostStore, authenticationService, alertsService, $scope, $location, $routeParams) {
            this.blogPostStore = blogPostStore;
            this.authenticationService = authenticationService;
            this.alertsService = alertsService;
            this.$scope = $scope;
            this.$location = $location;
            this.$routeParams = $routeParams;
            $scope.vm = this;
            this.loadPosts();
            this.selectedPostId = $routeParams.postId;
            console.log("Called constructor! " + $routeParams.postId);
        }
        ViewBlogPostCtrl.prototype.loadPosts = function () {
            var that = this;
            this.blogPostStore.list().then(function (inBlogPosts) {
                console.log("Received " + inBlogPosts);
                _.forEach(inBlogPosts, function (ele) {
                    console.log(ele);
                });
                that.blogPosts = inBlogPosts;
            }, function () {
                console.log("Error retrieving posts");
                that.alertsService.error("Error retrieving posts");
            });
        };
        ViewBlogPostCtrl.prototype.list = function () {
            return this.blogPosts;
        };
        ViewBlogPostCtrl.prototype.loadSelectedPost = function () {
            console.log("Called loadSelectedPost");
            if (!this.selectedPostId) {
                throw "No post was selected...";
            }
            var that = this;
            this.blogPostStore.get(this.selectedPostId).then(function (blogPost) {
                that.$scope.selectedPost = blogPost;
            }, function () {
                that.alertsService.error("Error retrieving posts");
                console.log("Error retrieving posts");
            });
        };
        ViewBlogPostCtrl.prototype.deletePost = function (id) {
            var that = this;
            this.blogPostStore.remove(id).then(function () {
                that.loadPosts();
            }, function () {
                that.alertsService.error("Error deleting post");
                console.log("Error deleting post");
            });
        };
        ViewBlogPostCtrl.$inject = [
            'blogPostStore',
            'authenticationService',
            'alertsService',
            '$scope',
            '$location',
            '$routeParams'
        ];
        return ViewBlogPostCtrl;
    })();
    blogposts.ViewBlogPostCtrl = ViewBlogPostCtrl;
})(blogposts || (blogposts = {}));
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var CreateBlogPostCtrl = (function () {
        function CreateBlogPostCtrl(blogPostStore, authenticationService, $scope, $location, $routeParams) {
            this.blogPostStore = blogPostStore;
            this.authenticationService = authenticationService;
            this.$scope = $scope;
            this.$location = $location;
            this.$routeParams = $routeParams;
            $scope.vm = this;
            var that = this;
            if (!authenticationService.isLoggedIn()) {
                this.$location.path("/login");
            }
            if ($routeParams.postId) {
                $scope.newPostId = $routeParams.postId;
                blogPostStore.get($scope.newPostId).then(function (blogPost) {
                    var postToEdit = blogPost;
                    if (!postToEdit) {
                        throw "Post with id " + that.$scope.newPostId + " not found";
                    }
                    that.$scope.postEditing = postToEdit;
                    console.log("Now editing ");
                    console.log(that.$scope.postEditing);
                }, function (error) {
                    console.log("Failed to load post");
                });
            }
            else {
                $scope.postEditing = new blogposts.BlogPostData("", "");
            }
        }
        CreateBlogPostCtrl.prototype.addOrEditPost = function () {
            if (this.$scope.postEditing.id) {
                return this.blogPostStore.edit(this.$scope.postEditing);
            }
            else {
                return this.blogPostStore.add(this.$scope.postEditing);
            }
        };
        CreateBlogPostCtrl.prototype.save = function () {
            var that = this;
            this.addOrEditPost().then(function (post) {
                that.$scope.postEditing = post;
                console.log("Saved successfully");
            }, function () {
                console.log("Failed to save");
            });
        };
        CreateBlogPostCtrl.prototype.cancel = function () {
            this.$location.path("/");
        };
        CreateBlogPostCtrl.prototype.done = function () {
            var that = this;
            this.addOrEditPost().then(function () {
                console.log("Saved successfully");
                that.$location.path("/");
            }, function () {
                console.log("Failed to save");
            });
        };
        CreateBlogPostCtrl.$inject = [
            'blogPostStore',
            'authenticationService',
            '$scope',
            '$location',
            '$routeParams'
        ];
        return CreateBlogPostCtrl;
    })();
    blogposts.CreateBlogPostCtrl = CreateBlogPostCtrl;
})(blogposts || (blogposts = {}));
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var BlogPost = (function () {
        function BlogPost(id, title, body) {
            this.id = id;
            this.title = title;
            this.body = body;
        }
        return BlogPost;
    })();
    blogposts.BlogPost = BlogPost;
})(blogposts || (blogposts = {}));
/// <reference path='../../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var BlogPostData = (function () {
        function BlogPostData(title, body) {
            this.title = title;
            this.body = body;
        }
        return BlogPostData;
    })();
    blogposts.BlogPostData = BlogPostData;
})(blogposts || (blogposts = {}));
/// <reference path='../../../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var LocalStorageBlogPostStore = (function () {
        function LocalStorageBlogPostStore(promiseBuilder, $q) {
            this.promiseBuilder = promiseBuilder;
            this.$q = $q;
        }
        LocalStorageBlogPostStore.prototype.add = function (newPostData) {
            var that = this;
            var _newPostData = newPostData;
            var deferred = this.$q.defer();
            this.doWithPosts(function (posts) {
                var newBlogPost = new blogposts.BlogPost(that.nextId(), _newPostData.title, _newPostData.body);
                posts.push(newBlogPost);
                deferred.resolve(newBlogPost);
            });
            return deferred.promise;
        };
        LocalStorageBlogPostStore.prototype.edit = function (editedPost) {
            var deferred = this.$q.defer();
            this.doWithPosts(function (posts) {
                var index = _.findIndex(posts, function (post) {
                    return post.id == editedPost.id;
                });
                if (index != -1) {
                    posts[index] = editedPost;
                    deferred.resolve(editedPost);
                }
                else {
                    deferred.reject("No post with id " + editedPost.id);
                }
            });
            return deferred.promise;
        };
        LocalStorageBlogPostStore.prototype.get = function (id) {
            var post = this.doWithPosts(function (posts) {
                var index = _.findIndex(posts, function (post) {
                    return post.id == id;
                });
                console.log("Found " + index);
                return posts[index];
            });
            return this.promiseBuilder.fromValue(post);
        };
        LocalStorageBlogPostStore.prototype.remove = function (id) {
            var deferred = this.$q.defer();
            this.list().then(function (posts) {
                var newPosts = _.filter(posts, function (post) { return post.id != id; });
                var difference = posts.length - newPosts.length;
                localStorage.setItem(LocalStorageBlogPostStore.STORAGE_ID, JSON.stringify(newPosts));
                deferred.resolve(difference);
            }, function () { throw "Should never happen!"; });
            return deferred.promise;
        };
        LocalStorageBlogPostStore.prototype.list = function () {
            return this.promiseBuilder.fromValue(this.listHelper());
        };
        LocalStorageBlogPostStore.prototype.listHelper = function () {
            var result = JSON.parse(localStorage.getItem(LocalStorageBlogPostStore.STORAGE_ID));
            if (!result) {
                result = new Array();
            }
            console.log("Received " + result);
            return result;
        };
        LocalStorageBlogPostStore.prototype.nextId = function () {
            var difference = this.doWithPosts(function (posts) {
                var largestId = _.chain(posts)
                    .map(function (post) {
                    return Number(post.id);
                })
                    .reduce(function (largestSoFar, cur) {
                    console.log("Comparing " + largestSoFar + " and " + cur);
                    return largestSoFar > cur ? largestSoFar : cur;
                }, 1)
                    .value();
                var newId = largestId + 1;
                console.log(largestId + ", " + newId);
                return newId;
            });
            return difference;
        };
        LocalStorageBlogPostStore.prototype.doWithPosts = function (func) {
            var posts = this.listHelper();
            var result = func(posts);
            localStorage.setItem(LocalStorageBlogPostStore.STORAGE_ID, JSON.stringify(posts));
            return result;
        };
        LocalStorageBlogPostStore.STORAGE_ID = "blog-post-store";
        LocalStorageBlogPostStore.$inject = ['promiseBuilder', '$q'];
        return LocalStorageBlogPostStore;
    })();
    blogposts.LocalStorageBlogPostStore = LocalStorageBlogPostStore;
})(blogposts || (blogposts = {}));
/// <reference path='../../../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var ServerResponse = (function () {
        function ServerResponse(data) {
            this.data = data;
        }
        return ServerResponse;
    })();
    var RemoteBlogPostStore = (function () {
        function RemoteBlogPostStore($q, $http, authenticationService) {
            this.$q = $q;
            this.$http = $http;
            this.authenticationService = authenticationService;
        }
        RemoteBlogPostStore.prototype.add = function (newPost) {
            var deferred = this.$q.defer();
            var that = this;
            this.$http({
                method: 'POST',
                url: '/posts',
                headers: {
                    'token': that.authenticationService.getToken()
                },
                data: JSON.stringify({
                    'title': newPost.title,
                    'body': newPost.body
                })
            }).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                console.log("Had error " + error);
                deferred.reject("Had error " + error);
            });
            return deferred.promise;
        };
        RemoteBlogPostStore.prototype.edit = function (editedPost) {
            var deferred = this.$q.defer();
            var that = this;
            this.$http({
                method: 'PUT',
                url: '/posts/' + editedPost.id,
                headers: {
                    'token': that.authenticationService.getToken()
                },
                data: JSON.stringify(editedPost)
            }).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                console.log("Had error " + error);
                deferred.reject("Had error " + error);
            });
            return deferred.promise;
        };
        RemoteBlogPostStore.prototype.get = function (id) {
            var deferred = this.$q.defer();
            this.$http({
                method: 'GET',
                url: '/posts/' + id
            }).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                console.log("Had error " + error);
                deferred.reject("Had error " + error);
            });
            return deferred.promise;
        };
        RemoteBlogPostStore.prototype.remove = function (id) {
            var deferred = this.$q.defer();
            var that = this;
            this.$http({
                method: 'DELETE',
                url: '/posts/' + id,
                headers: {
                    'token': that.authenticationService.getToken()
                }
            }).then(function (result) {
                deferred.resolve(Number(result));
            }, function (error) {
                console.log("Had error " + error);
                deferred.reject("Had error " + error);
            });
            return deferred.promise;
        };
        RemoteBlogPostStore.prototype.list = function () {
            var deferred = this.$q.defer();
            this.$http({
                method: 'GET',
                url: '/posts'
            }).then(function (result) {
                deferred.resolve(result.data);
            }, function (error) {
                console.log("Had error " + error);
                deferred.reject("Had error " + error);
            });
            return deferred.promise;
        };
        RemoteBlogPostStore.$inject = ['$q', '$http', 'authenticationService'];
        return RemoteBlogPostStore;
    })();
    blogposts.RemoteBlogPostStore = RemoteBlogPostStore;
})(blogposts || (blogposts = {}));
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var AuthenticationCtrl = (function () {
        function AuthenticationCtrl(authenticationService, $scope) {
            this.authenticationService = authenticationService;
            this.$scope = $scope;
            this.username = "";
            this.password = "";
            $scope.vm = this;
            this.checkLoggedIn();
        }
        AuthenticationCtrl.prototype.checkLoggedIn = function () {
            var that = this;
            console.log(this.authenticationService.isLoggedIn());
            this.authenticationService.isLoggedIn()
                .then(function (isLoggedIn) {
                that.$scope.loggedIn = isLoggedIn;
            }, function () {
                throw "Something went wrong!";
            });
        };
        AuthenticationCtrl.prototype.logIn = function () {
            var that = this;
            this.authenticationService.login(this.username, this.password).then(function () {
                that.checkLoggedIn();
            });
        };
        AuthenticationCtrl.prototype.logOut = function () {
            var that = this;
            this.authenticationService.logout().then(function () {
                that.checkLoggedIn();
            });
        };
        AuthenticationCtrl.prototype.showAdminControls = function () {
            console.log("is logged in? = " + this.authenticationService.isProbablyLoggedIn());
            return this.authenticationService.isProbablyLoggedIn();
        };
        AuthenticationCtrl.$inject = [
            'authenticationService',
            '$scope'
        ];
        return AuthenticationCtrl;
    })();
    blogposts.AuthenticationCtrl = AuthenticationCtrl;
})(blogposts || (blogposts = {}));
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
})(blogposts || (blogposts = {}));
/// <reference path='../../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var AlwaysAllowAuthenticationService = (function () {
        function AlwaysAllowAuthenticationService($q) {
            this.$q = $q;
            this.loggedIn = false;
        }
        AlwaysAllowAuthenticationService.prototype.login = function (username, password) {
            console.log("Logged in");
            this.loggedIn = true;
            var future = this.$q.defer;
            future.resolve("blah");
            return future.promise;
        };
        AlwaysAllowAuthenticationService.prototype.logout = function () {
            console.log("Logged out");
            this.loggedIn = false;
            var future = this.$q.defer;
            future.resolve("blah");
            return future.promise;
        };
        AlwaysAllowAuthenticationService.prototype.isLoggedIn = function () {
            var future = this.$q.defer;
            future.resolve(this.loggedIn);
            return future.promise;
        };
        AlwaysAllowAuthenticationService.prototype.isProbablyLoggedIn = function () {
            return this.loggedIn;
        };
        AlwaysAllowAuthenticationService.prototype.getToken = function () {
            return "dummyToken";
        };
        AlwaysAllowAuthenticationService.$inject = ['$q'];
        return AlwaysAllowAuthenticationService;
    })();
    blogposts.AlwaysAllowAuthenticationService = AlwaysAllowAuthenticationService;
})(blogposts || (blogposts = {}));
/// <reference path='../../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var RemoteAuthenticationService = (function () {
        function RemoteAuthenticationService($q, $http) {
            this.$q = $q;
            this.$http = $http;
            // private token: string;
            this.probablyLoggedIn = false;
        }
        RemoteAuthenticationService.prototype.login = function (username, password) {
            var that = this;
            var deferred = this.$q.defer();
            this.$http({
                method: 'POST',
                url: '/authentication',
                data: JSON.stringify({
                    'username': username,
                    'password': password
                })
            }).then(function (tokenResponse) {
                that.probablyLoggedIn = true;
                that.setToken(tokenResponse.data["token"]);
                deferred.resolve();
            }, function (error) {
                console.log("Had error " + error);
                that.probablyLoggedIn = false;
                deferred.reject("Had error " + error);
            });
            return deferred.promise;
        };
        RemoteAuthenticationService.prototype.logout = function () {
            var deferred = this.$q.defer();
            var that = this;
            this.$http({
                method: 'DELETE',
                url: '/authentication',
                headers: {
                    token: that.getToken()
                }
            }).then(function () {
                that.probablyLoggedIn = false;
                that.setToken("");
                deferred.resolve();
            }, function (error) {
                console.log("Had error " + error);
                deferred.reject("Had error " + error);
            });
            return deferred.promise;
        };
        RemoteAuthenticationService.prototype.isLoggedIn = function () {
            var deferred = this.$q.defer();
            var that = this;
            this.$http({
                method: 'GET',
                url: '/authentication',
                headers: {
                    token: that.getToken()
                }
            }).then(function () {
                that.probablyLoggedIn = true;
                deferred.resolve(true);
            }, function (error) {
                console.log("Had error " + error);
                that.probablyLoggedIn = false;
                deferred.resolve(false);
            });
            return deferred.promise;
        };
        RemoteAuthenticationService.prototype.isProbablyLoggedIn = function () {
            return this.probablyLoggedIn;
        };
        RemoteAuthenticationService.prototype.setToken = function (token) {
            localStorage.setItem(RemoteAuthenticationService.STORAGE_ID, token);
        };
        RemoteAuthenticationService.prototype.getToken = function () {
            // return this.token;
            return localStorage.getItem(RemoteAuthenticationService.STORAGE_ID);
        };
        RemoteAuthenticationService.$inject = ['$q', '$http'];
        RemoteAuthenticationService.STORAGE_ID = "token-store";
        return RemoteAuthenticationService;
    })();
    blogposts.RemoteAuthenticationService = RemoteAuthenticationService;
})(blogposts || (blogposts = {}));
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    (function (AlertType) {
        AlertType[AlertType["SUCCESS"] = 0] = "SUCCESS";
        AlertType[AlertType["INFO"] = 1] = "INFO";
        AlertType[AlertType["WARNING"] = 2] = "WARNING";
        AlertType[AlertType["ERROR"] = 3] = "ERROR";
    })(blogposts.AlertType || (blogposts.AlertType = {}));
    var AlertType = blogposts.AlertType;
    ;
    var AlertsService = (function () {
        function AlertsService() {
            this.receivers = [];
        }
        AlertsService.prototype.success = function (message) {
            this.send(AlertType.SUCCESS, message);
        };
        AlertsService.prototype.info = function (message) {
            this.send(AlertType.INFO, message);
        };
        AlertsService.prototype.warning = function (message) {
            this.send(AlertType.WARNING, message);
        };
        AlertsService.prototype.error = function (message) {
            this.send(AlertType.ERROR, message);
        };
        AlertsService.prototype.send = function (type, message) {
            console.log("Sending!");
            var _type = type;
            var _message = message;
            _.forEach(this.receivers, function (receiver) {
                receiver.receive(_type, _message);
            });
        };
        AlertsService.prototype.register = function (receiver) {
            console.log("registered " + receiver);
            this.receivers.push(receiver);
        };
        AlertsService.$inject = [];
        return AlertsService;
    })();
    blogposts.AlertsService = AlertsService;
})(blogposts || (blogposts = {}));
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var AlertsCtrl = (function () {
        function AlertsCtrl($scope, $interval, alertsService) {
            this.$scope = $scope;
            this.$interval = $interval;
            this.alertsService = alertsService;
            alertsService.register(this);
        }
        AlertsCtrl.prototype.receive = function (type, message) {
            if (this.curInterval) {
                this.$interval.cancel(this.curInterval);
            }
            this.$scope.alert = {
                'type': type,
                'message': message
            };
            var that = this;
            this.curInterval = this.$interval(function () {
                that.$scope.alert = {};
            }, 1500);
            console.log("Received alert");
            //Todo: Have it clear after xxx ms
            //Potential Todo: Have a queue of messages, in case we have multiple
        };
        AlertsCtrl.$inject = [
            '$scope',
            '$interval',
            'alertsService'
        ];
        return AlertsCtrl;
    })();
    blogposts.AlertsCtrl = AlertsCtrl;
})(blogposts || (blogposts = {}));
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var PromiseBuilder = (function () {
        function PromiseBuilder($q) {
            this.$q = $q;
        }
        PromiseBuilder.prototype.fromValue = function (value) {
            var deferred = this.$q.defer();
            deferred.resolve(value);
            return deferred.promise;
        };
        PromiseBuilder.prototype.fromFunction = function (func) {
            var deferred = this.$q.defer();
            deferred.resolve(func());
            return deferred.promise;
        };
        PromiseBuilder.$inject = ['$q'];
        return PromiseBuilder;
    })();
    blogposts.PromiseBuilder = PromiseBuilder;
})(blogposts || (blogposts = {}));
/// <reference path='../libs/jquery/jquery.d.ts' />
/// <reference path='../libs/angular/angular.d.ts' />
/// <reference path='../libs/angular/angular-route.d.ts' />
/// <reference path='../libs/underscore/underscore.d.ts' />
/// <reference path='./viewblogposts/ViewBlogPostCtrl.ts' />
/// <reference path='./createblogpost/CreateBlogPostCtrl.ts' />
/// <reference path='./blogpost/BlogPost.ts' />
/// <reference path='./blogpost/store/BlogPostStore.ts' />
/// <reference path='./blogpost/store/implementations/LocalStorageBlogPostStore.ts' />
/// <reference path='./blogpost/store/implementations/RemoteBlogPostStore.ts' />
/// <reference path='./authentication/AuthenticationCtrl.ts' />
/// <reference path='./authentication/AuthenticationService.ts' />
/// <reference path='./authentication/implementation/AlwaysAllowAuthenticationService.ts' />
/// <reference path='./authentication/implementation/RemoteAuthenticationService.ts' />
/// <reference path='./alerts/AlertsService.ts' />
/// <reference path='./alerts/AlertsCtrl.ts' />
/// <reference path='./common/PromiseBuilder.ts' />
/// <reference path='_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    //maybe should use ui-router instead of ngRoute
    var golby = angular.module('golby', ['ngRoute'])
        .controller('viewBlogPostCtrl', blogposts.ViewBlogPostCtrl)
        .controller('createBlogPostCtrl', blogposts.CreateBlogPostCtrl)
        .controller('authenticationCtrl', blogposts.AuthenticationCtrl)
        .controller('alertsCtrl', blogposts.AlertsCtrl)
        .service('blogPostStore', blogposts.RemoteBlogPostStore)
        .service('authenticationService', blogposts.RemoteAuthenticationService)
        .service('alertsService', blogposts.AlertsService)
        .service('promiseBuilder', blogposts.PromiseBuilder)
        .config(['$routeProvider',
        function routes($routeProvider) {
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
})(blogposts || (blogposts = {}));
//# sourceMappingURL=Application.js.map
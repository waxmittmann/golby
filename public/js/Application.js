/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var ViewBlogPostCtrl = (function () {
        function ViewBlogPostCtrl(blogPostStore, authenticationService, $scope, $location, $routeParams) {
            this.blogPostStore = blogPostStore;
            this.authenticationService = authenticationService;
            this.$scope = $scope;
            this.$location = $location;
            this.$routeParams = $routeParams;
            $scope.vm = this;
            this.loadPosts();
            this.selectedPostId = $routeParams.postId;
            console.log("Called constructor!");
        }
        ViewBlogPostCtrl.prototype.loadPosts = function () {
            this.blogPostStore.list().then(function (inBlogPosts) {
                this.blogPosts = inBlogPosts;
            }, function () {
                console.log("Error retrieving posts");
            });
        };
        ViewBlogPostCtrl.prototype.list = function () {
            return this.blogPosts;
        };
        ViewBlogPostCtrl.prototype.loadSelectedPost = function () {
            if (!this.selectedPostId) {
                throw "No post was selected...";
            }
            this.blogPostStore.get(this.selectedPostId).then(function (blogPost) {
                var selectedPost = blogPost;
                this.$scope.selectedPost = selectedPost;
            }, function () {
                console.log("Error retrieving posts");
            });
        };
        ViewBlogPostCtrl.prototype.deletePost = function (id) {
            this.blogPostStore.remove(id).then(function () {
                this.loadPosts();
            }, function () {
                console.log("Error deleting post");
            });
        };
        ViewBlogPostCtrl.$inject = [
            'blogPostStore',
            'authenticationService',
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
            if (!authenticationService.isLoggedIn()) {
                this.$location.path("/login");
            }
            if ($routeParams.postId) {
                $scope.newPostId = $routeParams.postId;
                blogPostStore.get($scope.newPostId).then(function (blogPost) {
                    var postToEdit = blogPost;
                    if (!postToEdit) {
                        throw "Post with id " + $scope.newPostId + " not found";
                    }
                    $scope.postEditing = postToEdit;
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
            this.addOrEditPost().then(function () {
                console.log("Saved successfully");
            }, function () {
                console.log("Failed to save");
            });
        };
        CreateBlogPostCtrl.prototype.cancel = function () {
            this.$location.path("/");
        };
        CreateBlogPostCtrl.prototype.done = function () {
            this.addOrEditPost().then(function () {
                console.log("Saved successfully");
                this.$location.path("/");
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
/// <reference path='../_all.ts' />
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
/// <reference path='../../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var LocalStorageBlogPostStore = (function () {
        function LocalStorageBlogPostStore(promiseBuilder, $q) {
            this.promiseBuilder = promiseBuilder;
            this.$q = $q;
        }
        LocalStorageBlogPostStore.prototype.add = function (newPostData) {
            return this.doWithPosts(function (posts) {
                var newPostData = new blogposts.BlogPost(this.nextId(), newPostData.title, newPostData.body);
                posts.push(newPostData);
                return newPostData;
            });
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
                console.log("Stored " + newPosts);
                deferred.resolve(difference);
            }, function () { throw "Should never happen!"; });
            return deferred;
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
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var AuthenticationService = (function () {
        function AuthenticationService() {
            this.loggedIn = false;
        }
        AuthenticationService.prototype.login = function (password) {
            console.log("Logged in");
            this.loggedIn = true;
        };
        AuthenticationService.prototype.logout = function () {
            console.log("Logged out");
            this.loggedIn = false;
        };
        AuthenticationService.prototype.isLoggedIn = function () {
            return this.loggedIn;
        };
        return AuthenticationService;
    })();
    blogposts.AuthenticationService = AuthenticationService;
})(blogposts || (blogposts = {}));
/// <reference path='../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var AuthenticationCtrl = (function () {
        function AuthenticationCtrl(authenticationService, $scope) {
            this.authenticationService = authenticationService;
            this.$scope = $scope;
            $scope.vm = this;
            $scope.loggedIn = this.authenticationService.isLoggedIn();
        }
        AuthenticationCtrl.prototype.logIn = function () {
            this.authenticationService.login();
            this.$scope.loggedIn = this.authenticationService.isLoggedIn();
        };
        AuthenticationCtrl.prototype.logOut = function () {
            this.authenticationService.logout();
            this.$scope.loggedIn = this.authenticationService.isLoggedIn();
        };
        AuthenticationCtrl.prototype.showAdminControls = function () {
            console.log("is logged in? = " + this.authenticationService.isLoggedIn());
            return this.authenticationService.isLoggedIn();
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
/// <reference path='./blogpost/BlogPostStore.ts' />
/// <reference path='./blogpost/implementations/LocalStorageBlogPostStore.ts' />
/// <reference path='./authentication/AuthenticationService.ts' />
/// <reference path='./authentication/AuthenticationCtrl.ts' />
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
        .service('blogPostStore', blogposts.LocalStorageBlogPostStore)
        .service('authenticationService', blogposts.AuthenticationService)
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
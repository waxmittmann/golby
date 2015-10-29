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
            this.blogPosts = this.blogPostStore.list();
            this.selectedPostId = $routeParams.postId;
            console.log("Called constructor!");
        }
        ViewBlogPostCtrl.prototype.list = function () {
            return this.blogPosts;
        };
        ViewBlogPostCtrl.prototype.getPosts = function (from, to) {
            throw "Not implemented yet";
        };
        ViewBlogPostCtrl.prototype.getSelectedPost = function () {
            if (!this.selectedPostId) {
                throw "No post was selected...";
            }
            return this.blogPostStore.get(this.selectedPostId);
        };
        ViewBlogPostCtrl.prototype.deletePost = function (id) {
            this.blogPostStore.remove(id);
            this.blogPosts = this.blogPostStore.list();
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
                var postToEdit = blogPostStore.get($scope.newPostId);
                if (!postToEdit) {
                    throw "Post with id " + $scope.newPostId + " not found";
                }
                $scope.newPostTitle = postToEdit.title;
                $scope.newPostBody = postToEdit.body;
            }
            else {
                $scope.newPostTitle = "";
                $scope.newPostBody = "";
            }
        }
        CreateBlogPostCtrl.prototype.addOrEditPost = function () {
            if (this.$scope.newPostId) {
                var newPost = new blogposts.BlogPost(this.$scope.newPostId, this.$scope.newPostTitle, this.$scope.newPostBody);
                this.blogPostStore.edit(newPost);
            }
            else {
                var newPost = new blogposts.BlogPost(this.blogPostStore.nextId(), this.$scope.newPostTitle, this.$scope.newPostBody);
                this.blogPostStore.add(newPost);
                this.$scope.newPostId = newPost.id;
            }
        };
        CreateBlogPostCtrl.prototype.save = function () {
            this.addOrEditPost();
        };
        CreateBlogPostCtrl.prototype.cancel = function () {
            this.$location.path("/");
        };
        CreateBlogPostCtrl.prototype.done = function () {
            this.addOrEditPost();
            this.$location.path("/");
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
})(blogposts || (blogposts = {}));
/// <reference path='../../_all.ts' />
var blogposts;
(function (blogposts) {
    'use strict';
    var LocalStorageBlogPostStore = (function () {
        function LocalStorageBlogPostStore() {
        }
        LocalStorageBlogPostStore.prototype.add = function (newPost) {
            this.doWithPosts(function (posts) {
                posts.push(newPost);
            });
        };
        LocalStorageBlogPostStore.prototype.edit = function (editedPost) {
            this.doWithPosts(function (posts) {
                var index = _.findIndex(posts, function (post) { return post.id == editedPost.id; });
                if (index != -1) {
                    posts[index] = editedPost;
                }
                else {
                    throw "No post with id " + editedPost.id;
                }
            });
        };
        LocalStorageBlogPostStore.prototype.get = function (id) {
            var post = this.doWithPosts(function (posts) {
                var index = _.findIndex(posts, function (post) {
                    return post.id == id;
                });
                console.log("Found " + index);
                return posts[index];
            });
            return post;
        };
        LocalStorageBlogPostStore.prototype.remove = function (id) {
            var posts = this.list();
            var newPosts = _.filter(posts, function (post) { return post.id != id; });
            var difference = posts.length - newPosts.length;
            localStorage.setItem(LocalStorageBlogPostStore.STORAGE_ID, JSON.stringify(newPosts));
            console.log("Stored " + newPosts);
            return difference;
        };
        LocalStorageBlogPostStore.prototype.list = function () {
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
                    .map(function (post) { return Number(post.id); })
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
            var posts = this.list();
            var result = func(posts);
            localStorage.setItem(LocalStorageBlogPostStore.STORAGE_ID, JSON.stringify(posts));
            return result;
        };
        LocalStorageBlogPostStore.STORAGE_ID = "blog-post-store";
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
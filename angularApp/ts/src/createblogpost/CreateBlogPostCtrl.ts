/// <reference path='../_all.ts' />


module blogposts {
    'use strict';

    export class CreateBlogPostCtrl {

        public static $inject = [
            'blogPostStore',
            'authenticationService',
            '$scope',
            '$location',
            '$routeParams'
        ];

        constructor(private blogPostStore:BlogPostStore,
                    private authenticationService,
                    private $scope,
                    private $location:ng.ILocationService,
                    private $routeParams) {
            $scope.vm = this;
            var that = this;

            if (!authenticationService.isLoggedIn()) {
                this.$location.path("/login");
            }

            if ($routeParams.postId) {
                $scope.newPostId = $routeParams.postId;
                blogPostStore.get($scope.newPostId).then(
                    function(blogPost) {
                        var postToEdit : BlogPostData = blogPost;
                        if (!postToEdit) {
                            throw "Post with id " + that.$scope.newPostId + " not found";
                        }
                        that.$scope.postEditing = postToEdit;
                        console.log("Now editing ");
                        console.log(that.$scope.postEditing);
                    },
                    function(error) {
                        console.log("Failed to load post");
                    }
                );
            } else {
                $scope.postEditing = new BlogPostData("", "");
            }
        }

        addOrEditPost(): ng.IPromise<BlogPost> {
            if (this.$scope.postEditing.id) {
                return this.blogPostStore.edit(this.$scope.postEditing);
            } else {
                return this.blogPostStore.add(this.$scope.postEditing);
            }
        }

        save() {
            var that = this;
            this.addOrEditPost().then(
                function(post) {
                    that.$scope.postEditing = post;
                    console.log("Saved successfully");
                },
                function() {
                    console.log("Failed to save");
                }
            );
        }

        cancel() {
            this.$location.path("/");
        }

        done() {
            var that = this;
            this.addOrEditPost().then(
                function() {
                    console.log("Saved successfully");
                    that.$location.path("/");
                },
                function() {
                    console.log("Failed to save");
                }
            );
        }
    }
}

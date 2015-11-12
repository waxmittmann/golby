/// <reference path='../_all.ts' />


module blogposts {
    'use strict';

    export class CreateBlogPostCtrl {

      public static PAGE_NAME: String = "CreateBlogPost";

        public static $inject = [
            'blogPostStore',
            'authenticationService',
            'pageService',
            '$scope',
            '$location',
            '$routeParams'
        ];

        constructor(private blogPostStore:BlogPostStore,
                    private authenticationService,
                    private pageService,
                    private $scope,
                    private $location:ng.ILocationService,
                    private $routeParams) {
            pageService.pageChanged(CreateBlogPostCtrl.PAGE_NAME);
            $scope.vm = this;
            var that = this;

            if (!authenticationService.isLoggedIn()) {
                this.$location.path("/login");
            }

            if ($routeParams.postId) {
                $scope.newPostId = $routeParams.postId;
                blogPostStore.get($scope.newPostId).then(
                    function(blogPost) {
                        var postToEdit : BlogPostData = BlogPostData.fromBlogPost(blogPost);
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
            if (this.$scope.newPostId) {
                console.log("Editing, id present");
                return this.blogPostStore.edit(
                    this.$scope.postEditing.toBlogPost(this.$scope.newPostId));
            } else {
                console.log("Adding, no id");
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

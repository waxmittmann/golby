/// <reference path='../_all.ts' />

module blogposts {
    'use strict';

    export class ViewBlogPostCtrl {
        public static $inject = [
            'blogPostStore',
            'authenticationService',
            'alertsService',
            '$scope',
            '$location',
            '$routeParams'
        ];

        //The reason for this is because the storage will return a new array each time
        //so we will trigger an endless digest cycle =(
        //Maybe we should take blogPosts out of the digest cycle and manually trigger
        //updates?
        private blogPosts:BlogPost[];
        private selectedPostId;

        constructor(private blogPostStore : BlogPostStore,
                    private authenticationService : AuthenticationService,
                    private alertsService: AlertsService,
                    private $scope,
                    private $location : ng.ILocationService,
                    private $routeParams) {
            $scope.vm = this;
            this.loadPosts();
            this.selectedPostId = $routeParams.postId;
            console.log("Called constructor! " + $routeParams.postId);
        }

        protected loadPosts() {
            var that = this;
            this.blogPostStore.list().then(
                function (inBlogPosts) {
                    console.log("Received " + inBlogPosts);
                    _.forEach(inBlogPosts, function(ele) {
                        console.log(ele);
                    });
                    that.blogPosts = inBlogPosts;
                },
                function () {
                    console.log("Error retrieving posts");
                    that.alertsService.error("Error retrieving posts");
                }
            );
        }

        list():BlogPost[] {
            return this.blogPosts;
        }

        loadSelectedPost(): void {
            console.log("Called loadSelectedPost");
            if (!this.selectedPostId) {
                throw "No post was selected...";
            }
            var that = this;
            this.blogPostStore.get(this.selectedPostId).then(
                function (blogPost: BlogPost) {
                    that.$scope.selectedPost = blogPost;
                },
                function () {
                    that.alertsService.error("Error retrieving posts");
                    console.log("Error retrieving posts");
                }
            )
        }

        deletePost(id:number) {
            var that = this;
            this.blogPostStore.remove(id).then(
                function() {
                    that.loadPosts();
                },
                function() {
                    that.alertsService.error("Error deleting post");
                    console.log("Error deleting post");
                }
            )
        }
    }
}

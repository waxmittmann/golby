/// <reference path='../../../_all.ts' />

module blogposts {
    'use strict';

    export class LocalStorageBlogPostStore implements BlogPostStore {
        private static STORAGE_ID = "blog-post-store"

        public static $inject = ['promiseBuilder', '$q'];

        constructor(private promiseBuilder: PromiseBuilder, private $q) {
        }

        add(newPostData : BlogPostData): ng.IPromise<BlogPost> {
            var that = this;
            var _newPostData = newPostData;
            var deferred: ng.IDeferred<BlogPost> = this.$q.defer();
            this.doWithPosts(function (posts:BlogPost[]) {
                var newBlogPost = new BlogPost(that.nextId(), _newPostData.title, _newPostData.body);
                posts.push(newBlogPost);
                deferred.resolve(newBlogPost);
            });
            return deferred.promise;
        }

        edit(editedPost:BlogPost): ng.IPromise<BlogPost> {
            var deferred: ng.IDeferred<BlogPost> = this.$q.defer();

            this.doWithPosts(function (posts:BlogPost[]) {
                var index = _.findIndex(posts,
                    function (post) {
                        return post.id == editedPost.id;
                    });
                if (index != -1) {
                    posts[index] = editedPost;
                    deferred.resolve(editedPost);
                } else {
                    deferred.reject("No post with id " + editedPost.id);
                    //throw "No post with id " + editedPost.id;
                }
            });

            return deferred.promise;
        }

        get(id:number): ng.IPromise<BlogPost> {
            var post = this.doWithPosts(function (posts:BlogPost[]) {
                var index = _.findIndex(posts,
                    function (post) {
                        return post.id == id;
                    });
                console.log("Found " + index);
                return posts[index];
            });
            return this.promiseBuilder.fromValue(post);
        }

        remove(id:number): ng.IPromise<number> {

            var deferred = this.$q.defer();

            this.list().then(
                function(posts: BlogPost[]) {
                    var newPosts = _.filter(posts, function(post: BlogPost) { return post.id != id});
                    var difference: number = posts.length - newPosts.length;
                    localStorage.setItem(LocalStorageBlogPostStore.STORAGE_ID, JSON.stringify(newPosts));
                    deferred.resolve(difference);
                },
                function() { throw "Should never happen!"; }
            );

            return deferred.promise;
        }

        list() : ng.IPromise<BlogPost[]> {
            return this.promiseBuilder.fromValue(this.listHelper());
        }

        protected listHelper() : BlogPost[] {
            var result = JSON.parse(localStorage.getItem(LocalStorageBlogPostStore.STORAGE_ID));
            if (!result) {
                result = new Array<BlogPost>();
            }
            console.log("Received " + result);
            return result;
        }

        protected nextId() {
            var difference = this.doWithPosts(function (posts) {
                var largestId:number = _.chain(posts)
                    .map(function (post) {
                        return Number(post.id);
                    })
                    .reduce(function (largestSoFar:number, cur:number) {
                        console.log("Comparing " + largestSoFar + " and " + cur);
                        return largestSoFar > cur ? largestSoFar : cur;
                    }, 1)
                    .value();
                var newId:number = largestId + 1;
                console.log(largestId + ", " + newId);
                return newId;
            });
            return difference;
        }

        doWithPosts(func) {
            var posts:BlogPost[] = this.listHelper();
            var result = func(posts);
            localStorage.setItem(LocalStorageBlogPostStore.STORAGE_ID, JSON.stringify(posts));
            return result;
        }
    }
}

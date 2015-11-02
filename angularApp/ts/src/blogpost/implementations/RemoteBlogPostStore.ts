/// <reference path='../../_all.ts' />

module blogposts {
    'use strict';

    //$http({
    //    method: 'GET',
    //    url: '/someUrl'
    //}).then(function successCallback(response) {
    //    // this callback will be called asynchronously
    //    // when the response is available
    //}, function errorCallback(response) {
    //    // called asynchronously if an error occurs
    //    // or server returns response with an error status.
    //});

    export class RemoteBlogPostStore implements BlogPostStore {

        public static $inject = ['$q', '$http'];


        constructor(
            private $q,
            private $http: ng.IHttpService
        ) { }

        add(newPost: BlogPostData): ng.IPromise<BlogPost> {
            var deferred = this.$q.defer();

            this.$http({
                method: 'PUT',
                url: '/posts/',
                data: JSON.stringify({
                    'title': newPost.title,
                    'body': newPost.body
                })
            }).then(
                function(result: string) {
                    var parsedJson = JSON.parse(result);
                    deferred.resolve(new BlogPost(parsedJson.id, parsedJson.title, parsedJson.body));
                },
                function(error) {
                    console.log("Had error " + error);
                }
            );

            return deferred.promise;
        }

        edit(editedPost: BlogPost): ng.IPromise<BlogPost> {
            var deferred = this.$q.defer();

            this.$http({
                method: 'PUT',
                url: '/posts/' + editedPost.id,
                data: JSON.stringify(editedPost)
            }).then(
                function(result: string) {
                    var parsedJson = JSON.parse(result);
                    deferred.resolve(new BlogPost(parsedJson.id, parsedJson.title, parsedJson.body));
                },
                function(error) {
                    console.log("Had error " + error);
                }
            );

            return deferred.promise;
        }

        get(id: number): ng.IPromise<BlogPost> {
            var deferred = this.$q.defer();

            this.$http({
                method: 'GET',
                url: '/posts/' + id
            }).then(
                function(result: string) {
                    var parsedJson = JSON.parse(result);
                    deferred.resolve(new BlogPost(parsedJson.id, parsedJson.title, parsedJson.body));
                },
                function(error) {
                    console.log("Had error " + error);
                }
            );

            return deferred.promise;
        }

        remove(id: number): ng.IPromise<number> {
            var deferred = this.$q.defer();

            this.$http({
                method: 'DELETE',
                url: '/posts' + id
            }).then(
                function(result: string) {
                    deferred.resolve(Number(result));
                },
                function(error) {
                    console.log("Had error " + error);
                }
            );

            return deferred.promise;
        }

        list(): ng.IPromise<BlogPost[]> {
            var deferred = this.$q.defer();

            this.$http({
                method: 'GET',
                url: '/posts'
            }).then(
                function(result: string) {
                    var parsedJson = JSON.parse(result);
                    var posts: BlogPost[] = new Array<BlogPost>();
                    var i = 0;
                    for (; i < parsedJson.length; i++) {
                        var post = parsedJson[i];
                        posts.push(new BlogPost(post.id, post.title, post.body))
                    }
                    deferred.resolve(posts);
                },
                function(error) {
                    console.log("Had error " + error);
                }
            );

            return deferred.promise;
        }
    }
}

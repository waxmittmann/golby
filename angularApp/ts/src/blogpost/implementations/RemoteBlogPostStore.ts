/// <reference path='../../_all.ts' />

module blogposts {
    'use strict';

    class ServerResponse {
      constructor(public data: string) { }
    }

    export class RemoteBlogPostStore implements BlogPostStore {

        public static $inject = ['$q', '$http'];

        constructor(
            private $q,
            private $http: ng.IHttpService
        ) { }

        add(newPost: BlogPostData): ng.IPromise<BlogPost> {
            var deferred = this.$q.defer();

            this.$http({
                method: 'POST',
                url: '/posts',
                data: JSON.stringify({
                    'title': newPost.title,
                    'body': newPost.body
                })
            }).then(
                function(result: BlogPost) {
                    deferred.resolve(result);
                },
                function(error) {
                    console.log("Had error " + error);
                    deferred.reject("Had error " + error);
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
                    deferred.reject("Had error " + error);
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
                    deferred.reject("Had error " + error);
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
                    deferred.reject("Had error " + error);
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
                function(result: ServerResponse) {
                    deferred.resolve(
                        _.map(result.data, function(rawPost) {
                            console.log(rawPost);
                            return new BlogPost(rawPost["id"], rawPost["title"], rawPost["body"]);
                        })
                    );
                },
                function(error) {
                    console.log("Had error " + error);
                    deferred.reject("Had error " + error);
                }
            );

            return deferred.promise;
        }
    }
}

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
                // function(result: string) {
                    // var parsedJson = JSON.parse(result);
                    // deferred.resolve(new BlogPost(parsedJson.id, parsedJson.title, parsedJson.body));
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

        //{data: Array[3], status: 200, config: Object, statusText: "OK"}config: Objectdata: Array[3]headers: (name)status: 200statusText: "OK"__proto__: Object
        list(): ng.IPromise<BlogPost[]> {
            var deferred = this.$q.defer();

            this.$http({
                method: 'GET',
                url: '/posts'
            }).then(
                function(result: ServerResponse) {
                    // var posts: BlogPost[] = new Array<BlogPost>();
                    // console.log("Have ");
                    // console.log(result);
                    // var jsonData = JSON.parse(result);
                    // for (var i = 0; i < jsonData.counters.length; i++) {
                    //     var counter = jsonData.counters[i];
                    //     console.log(counter.counter_name);
                    // }
                    // console.log("Got " + jsonData);
                    // deferred.resolve("");

                    // var posts: BlogPost[] = new Array<BlogPost>();
                    // var i = 0;
                    // for (; i < result.length; i++) {
                    //   var parsedJson;
                    //   try {
                    //     parsedJson = JSON.parse(result);
                    //   } catch (err) {
                    //     deferred.reject("Failed to parse: " + err);
                    //     return;
                    //   }
                    //
                    //   posts.push(new BlogPost(parsedJson.id, parsedJson.title, parsedJson.body))
                    // }
                    // deferred.resolve(posts);

                    deferred.resolve(
                        _.map(result.data, function(rawPost) {
                            console.log(rawPost);
                            // console.log(rawPost.id + ", " + rawPost.title + ", " + rawPost.body);
                            // var post = JSON.parse(rawPost);
                            // return new BlogPost(post.id, post.title, post.body);
                            // return new BlogPost(rawPost.id, rawPost.title, rawPost.body);
                            return new BlogPost(rawPost["id"], rawPost["title"], rawPost["body"]);
                            // return "";
                        })
                    );

                    //
                    // var rawJson: string = result.data;
                    //
                    // console.log(result.data);
                    //
                    // var parsedJson;
                    // try {
                    //   parsedJson = JSON.parse(result.data);
                    // } catch (err) {
                    //   console.log("Failed to parse: " + err);
                    //   deferred.reject("Failed to parse: " + err);
                    //   return;
                    // }
                    // var posts: BlogPost[] = new Array<BlogPost>();
                    // var i = 0;
                    // for (; i < parsedJson.length; i++) {
                    //     var post = parsedJson[i];
                    //     posts.push(new BlogPost(post.id, post.title, post.body))
                    // }
                    // console.log("Resolved! ");
                    // deferred.resolve(posts);
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

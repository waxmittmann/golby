/// <reference path='../../../_all.ts' />

module blogposts {
    'use strict';

    class ServerResponse {
      constructor(public data: string) { }
    }

    export class RemoteBlogPostStore implements BlogPostStore {

        public static $inject = ['$q', '$http', 'authenticationService'];

        constructor(
            private $q,
            private $http: ng.IHttpService,
            private authenticationService: AuthenticationService
        ) { }

        add(newPost: BlogPostData): ng.IPromise<BlogPost> {
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
            }).then(
                function(result: ServerResponse) {
                    deferred.resolve(result.data);
                },
                function(error) {
                    console.log("Had error " + error);
                    deferred.reject("Had error " + error);
                }
            );

            return deferred.promise;
        }

        /*
        What the fuck
        edit(editedPost: BlogPost): ng.IPromise<BlogPost> {
            var deferred = this.$q.defer();
            var that = this;

            var data = JSON.stringify(editedPost);
            console.log("Edited post:");
            console.log(editedPost);
            console.log("Id type:");
            console.log(typeof editedPost.id)
            editedPost.id = Number.parseInt(editedPost.id);
            console.log(typeof editedPost.id)

            this.$http({
                method: 'PUT',
                url: '/posts/' + editedPost.id,
                headers: {
                    'token': that.authenticationService.getToken()
                },
                data: data
            }).then(
                function(result: ServerResponse) {
                    deferred.resolve(result.data);
                },
                function(error) {
                    console.log("Had error " + error);
                    deferred.reject("Had error " + error);
                }
            );

            return deferred.promise;
        }
         */

        edit(editedPost: BlogPost): ng.IPromise<BlogPost> {
            var deferred = this.$q.defer();
            var that = this;

            console.log("Edited post:");
            console.log(editedPost);
            console.log("Id type:");
            console.log(typeof editedPost.id)
            //editedPost.id = Number.parseInt(editedPost.id);
            //console.log(typeof editedPost.id)

            editedPost = new BlogPost(parseInt("" + editedPost.id), editedPost.title, editedPost.body);
            console.log(typeof editedPost.id)
            var data = JSON.stringify(editedPost);

            this.$http({
                method: 'PUT',
                url: '/posts/' + editedPost.id,
                headers: {
                    'token': that.authenticationService.getToken()
                },
                data: data
            }).then(
                function(result: ServerResponse) {
                    deferred.resolve(result.data);
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
                function(result: ServerResponse) {
                    deferred.resolve(result.data);
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
            var that = this;

            this.$http({
                method: 'DELETE',
                url: '/posts/' + id,
                headers: {
                    'token': that.authenticationService.getToken()
                }
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
                  deferred.resolve(result.data);
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

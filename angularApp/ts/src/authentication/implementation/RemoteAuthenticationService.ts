/// <reference path='../../_all.ts' />

module blogposts {
    'use strict';

    export class RemoteAuthenticationService implements AuthenticationService {
        // private token: string;
        private probablyLoggedIn: Boolean = false;

        public static $inject = ['$q', '$http'];

        private static STORAGE_ID = "token-store";

        constructor(
            private $q,
            private $http: ng.IHttpService
        ) { }

        login(username: String, password: String) {
          var that = this;
          var deferred = this.$q.defer();

          this.$http({
              method: 'POST',
              url: '/authentication',
              data: JSON.stringify({
                  'username': username,
                  'password': password
              })
          }).then(
              function(tokenResponse) {
                  that.probablyLoggedIn = true;
                  that.setToken(tokenResponse.data["token"]);
                  deferred.resolve();
              },
              function(error) {
                  console.log("Had error " + error);
                  that.probablyLoggedIn = false;
                  deferred.reject("Had error " + error);
              }
          );
          return deferred.promise;
        }

        logout() {
          var deferred = this.$q.defer();
          var that = this;
          this.$http({
              method: 'DELETE',
              url: '/authentication',
              headers: {
                token: that.getToken()
              }
          }).then(
              function() {
                  that.probablyLoggedIn = false;
                  that.setToken("");
                  deferred.resolve();
              },
              function(error) {
                  console.log("Had error " + error);
                  deferred.reject("Had error " + error);
              }
          );

          return deferred.promise;
        }

        isLoggedIn() {
          var deferred = this.$q.defer();
          var that = this;

          this.$http({
              method: 'GET',
              url: '/authentication',
              headers: {
                token: that.getToken()
              }
          }).then(
              function() {
                  that.probablyLoggedIn = true;
                  deferred.resolve(true);
              },
              function(error) {
                  console.log("Had error " + error);
                  that.probablyLoggedIn = false;
                  deferred.resolve(false);
              }
          );

          return deferred.promise;
        }

        isProbablyLoggedIn() {
          return this.probablyLoggedIn;
        }

        private setToken(token: string) {
          localStorage.setItem(RemoteAuthenticationService.STORAGE_ID, token);
        }

        getToken() {
          // return this.token;
          return localStorage.getItem(RemoteAuthenticationService.STORAGE_ID);
        }
    }
}

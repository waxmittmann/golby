/// <reference path='../../_all.ts' />

module blogposts {
    'use strict';

    export class AlwaysAllowAuthenticationService implements AuthenticationService {
        private loggedIn:boolean = false;

        public static $inject = ['$q'];

        constructor(
            private $q
        ) { }

        login(username: String, password: String) {
            console.log("Logged in");
            this.loggedIn = true;
            var future = this.$q.defer;
            future.resolve("blah");
            return future.promise;
        }

        logout() {
            console.log("Logged out");
            this.loggedIn = false;
            var future = this.$q.defer;
            future.resolve("blah");
            return future.promise;
        }

        isLoggedIn() {
          var future = this.$q.defer;
          future.resolve(this.loggedIn);
          return future.promise;
        }

        isProbablyLoggedIn() {
          return this.loggedIn;
        }

        getToken() {
            return "dummyToken";
        }
    }
}

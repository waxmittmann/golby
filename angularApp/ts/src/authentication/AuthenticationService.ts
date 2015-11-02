/// <reference path='../_all.ts' />

module blogposts {
    'use strict';

    export class AuthenticationService {

        private loggedIn:boolean = false;

        login(password:string) {
            console.log("Logged in");
            this.loggedIn = true;
        }

        logout() {
            console.log("Logged out");
            this.loggedIn = false;
        }

        isLoggedIn() {
            return this.loggedIn;
        }
    }
}

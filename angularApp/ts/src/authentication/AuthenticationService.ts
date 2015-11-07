/// <reference path='../_all.ts' />

module blogposts {
    'use strict';

    export interface AuthenticationService {
        login(username: String, password: String): ng.IPromise<String>;

        logout(): ng.IPromise<String>;

        isLoggedIn(): ng.IPromise<Boolean>;

        isProbablyLoggedIn(): Boolean;

        getToken(): string;
    }
}

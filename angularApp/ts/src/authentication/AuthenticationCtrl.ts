/// <reference path='../_all.ts' />

module blogposts {
    'use strict';

    export class AuthenticationCtrl {

        public static $inject = [
            'authenticationService',
            'pageService',
            '$scope',
            '$location'
        ];

        public username:String = "";
        public password:String = "";

        public static PAGE_NAME = "Authentication";

        constructor(private authenticationService,
                    private pageService,
                    private $scope,
                    private $location) {
            $scope.vm = this;
            this.checkLoggedIn(function () {
            });
        }

        //This is so dodgy =p
        pageHit() {
            this.pageService.pageChanged(AuthenticationCtrl.PAGE_NAME);
        }

        //Fix: Check what null is and return
        private checkLoggedIn(doAfterLogin:() => void) {
            var that = this;

            console.log(this.authenticationService.isLoggedIn());
            this.authenticationService.isLoggedIn()
                .then(
                function (isLoggedIn) {
                    that.$scope.loggedIn = isLoggedIn;
                    doAfterLogin();
                }, function () {
                    throw "Something went wrong!";
                });
        }

        logIn() {
            var that = this;

            this.authenticationService.login(this.username, this.password).then(function () {
                that.checkLoggedIn(function() {
                    that.$location.path("/");
                });
            });
        }

        logOut() {
            var that = this;

            this.authenticationService.logout().then(function () {
                that.checkLoggedIn(function () {});
            });
        }

        showAdminControls():boolean {
            console.log("is logged in? = " + this.authenticationService.isProbablyLoggedIn());
            return this.authenticationService.isProbablyLoggedIn();
        }
    }
}

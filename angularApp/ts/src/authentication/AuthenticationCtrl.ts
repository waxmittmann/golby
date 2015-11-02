/// <reference path='../_all.ts' />

module blogposts {
  'use strict';

  export class AuthenticationCtrl {

    public static $inject = [
      'authenticationService',
			'$scope'
		];

    constructor(
      private authenticationService,
      private $scope
    ) {
        $scope.vm = this;
        $scope.loggedIn = this.authenticationService.isLoggedIn();
    }

    logIn() {
      this.authenticationService.login();
      this.$scope.loggedIn = this.authenticationService.isLoggedIn();
    }

    logOut() {
      this.authenticationService.logout();
      this.$scope.loggedIn = this.authenticationService.isLoggedIn();
    }

    showAdminControls(): boolean {
      console.log("is logged in? = " + this.authenticationService.isLoggedIn());
      return this.authenticationService.isLoggedIn();
    }
  }
}

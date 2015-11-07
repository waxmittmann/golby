/// <reference path='../_all.ts' />

module blogposts {
  'use strict';

  export class AuthenticationCtrl {

    public static $inject = [
      'authenticationService',
			'$scope'
		];

    public username: String = "";
    public password: String = "";

    constructor(
      private authenticationService,
      private $scope
    ) {
        $scope.vm = this;
        this.checkLoggedIn();
    }

    private checkLoggedIn() {
      var that = this;

      console.log(this.authenticationService.isLoggedIn());
      this.authenticationService.isLoggedIn()
        .then(
          function(isLoggedIn) {
            that.$scope.loggedIn = isLoggedIn;
          }, function() {
            throw "Something went wrong!";
          });
    }

    logIn() {
      var that = this;
      
      this.authenticationService.login(this.username, this.password).then(function() {
        that.checkLoggedIn();
      });
    }

    logOut() {
      var that = this;

      this.authenticationService.logout().then(function() {
        that.checkLoggedIn();
      });
    }

    showAdminControls(): boolean {
      console.log("is logged in? = " + this.authenticationService.isProbablyLoggedIn());
      return this.authenticationService.isProbablyLoggedIn();
    }
  }
}

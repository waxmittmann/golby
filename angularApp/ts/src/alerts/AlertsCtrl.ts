/// <reference path='../_all.ts' />

module blogposts {
  'use strict';

  export class AlertsCtrl implements AlertsReceiver {

    public static $inject = [
      '$scope',
      'alertsService'
    ];

    constructor(private $scope, private alertsService: AlertsService) {
        alertsService.register(this);
    }

    receive(type: AlertType, message: string) {
      this.$scope.alert = {
        'type': type,
        'message': message
      };

      console.log("Received alert");

      //Todo: Have it clear after xxx ms
      //Potential Todo: Have a queue of messages, in case we have multiple
    }

  }
}
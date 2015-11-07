/// <reference path='../_all.ts' />

module blogposts {
  'use strict';

  export class AlertsCtrl implements AlertsReceiver {

    private curInterval;

    public static $inject = [
      '$scope',
      '$interval',
      'alertsService'
    ];

    constructor(private $scope, private $interval, private alertsService: AlertsService) {
        alertsService.register(this);
    }

    receive(type: AlertType, message: string) {
      if (this.curInterval) {
          this.$interval.cancel(this.curInterval);
      }

      this.$scope.alert = {
        'type': type,
        'message': message
      };

      var that = this;
      this.curInterval = this.$interval(function() {
          that.$scope.alert = {};
      }, 1500);

      console.log("Received alert");

      //Todo: Have it clear after xxx ms
      //Potential Todo: Have a queue of messages, in case we have multiple
    }

  }
}

/// <reference path='../_all.ts' />

module blogposts {
  'use strict';

  export enum AlertType {SUCCESS, INFO, WARNING, ERROR};

  export interface AlertsReceiver {
    receive(type: AlertType, message: string);
  }

  export class AlertsService {

    public static $inject = [];

    private receivers: AlertsReceiver[] = [];

    success(message: string) {
        this.send(AlertType.SUCCESS, message);
    }

    info(message: string) {
      this.send(AlertType.INFO, message);
    }

    warning(message: string) {
      this.send(AlertType.WARNING, message);
    }

    error(message: string) {
      this.send(AlertType.ERROR, message);
    }

    private send(type: AlertType, message: string) {
      console.log("Sending!");

      var _type = type;
      var _message = message;
      _.forEach(this.receivers, function(receiver) {
          receiver.receive(_type, _message);
      });
    }

    register(receiver: AlertsReceiver) {
      console.log("registered " + receiver);
      this.receivers.push(receiver);
    }

  }
}

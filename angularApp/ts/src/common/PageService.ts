/// <reference path='../_all.ts' />

module blogposts {
  'use strict';

  export interface PageChangeReceiver {
    receive(changedTo: String);
  }

  export class PageService {
    public static $inject = [];

    private receivers: Array<(string) => void> = new Array();

    // private receivers: Array<Function<String => Void>>;
    // private receivers: { (page: string): void; } [];

    register(receiver: ((string) => void)) {
      console.log("Registered");
      this.receivers.push(receiver);
    }

    pageChanged(page: String) {
      console.log("page changed " + page);
      _.forEach(this.receivers, function(receiver) {
        console.log("Sending " + page);
        receiver(page);
        // receiver.receive(page);
      });
    }
  }



  // private receivers: { (page: string) => void } [];
  //receivers: { (page: string): void } [];
  // var h : { (s: string): string; }[]
}

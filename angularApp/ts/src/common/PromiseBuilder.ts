/// <reference path='../_all.ts' />

module blogposts {
    'use strict';

    export class PromiseBuilder {
        public static $inject = ['$q'];

        constructor(private $q) {
        }

        fromValue<S>(value: S): ng.IPromise<S> {
            var deferred: ng.IDeferred<S> = this.$q.defer();
            deferred.resolve(value);
            return deferred.promise;
        }

        fromFunction<S>(func: () => S): ng.IPromise<S> {
            var deferred: ng.IDeferred<S> = this.$q.defer();
            deferred.resolve(func());
            return deferred.promise;
        }

    }

}

/// <reference path='../_all.ts' />

module blogposts {
  'use strict';

  export class BlogPost {
    constructor(
      public id: Number,
      public title: String,
      public body: String
    ) { }
  }

}

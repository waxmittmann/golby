/// <reference path='../_all.ts' />


module blogposts {
    'use strict';

    export class BlogPostData {
        constructor(public title: string, public body: string) { }
    }

    export interface BlogPostStore {
        add(newBlogPost: BlogPostData): ng.IPromise<BlogPost>;

        edit(editedPost:BlogPost): ng.IPromise<BlogPost>;

        get(id:number): ng.IPromise<BlogPost>;

        remove(id:number): ng.IPromise<number>;

        list(): ng.IPromise<BlogPost[]>;
    }
}

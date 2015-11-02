/// <reference path='../_all.ts' />


module blogposts {
    'use strict';

    export class BlogPostData {
        constructor(public title: string, public body: string) { }
    }

    export interface BlogPostStore {
        //add(newPost:BlogPost);
        add(newBlogPost: BlogPostData): ng.IPromise<BlogPost>;
        //add2(newPost: {string, string}): Promise;

        //edit(editedPost:BlogPost);
        edit(editedPost:BlogPost): ng.IPromise<BlogPost>;

        //get(id:number): BlogPost;
        get(id:number): ng.IPromise<BlogPost>;

        //remove(id:number): number;
        remove(id:number): ng.IPromise<number>;

        //list(): BlogPost[];
        list(): ng.IPromise<BlogPost[]>;

        //nextId(): number;
        //nextId(): Promise;
    }
}

/// <reference path='../../_all.ts' />

module blogposts {
    'use strict';

    export class BlogPostData {
        constructor(public title: String, public body: String) { }

        toBlogPost(id: number) {
            return new BlogPost(id, this.title, this.body)
        }

        static fromBlogPost(blogPost:BlogPost): BlogPostData {
            return new BlogPostData(blogPost.title, blogPost.body);
        }
    }

    export interface BlogPostStore {
        add(newBlogPost: BlogPostData): ng.IPromise<BlogPost>;

        edit(editedPost:BlogPost): ng.IPromise<BlogPost>;

        get(id: Number): ng.IPromise<BlogPost>;

        remove(id: Number): ng.IPromise<Number>;

        list(): ng.IPromise<BlogPost[]>;
    }
}

/// <reference path='../../_all.ts' />

module blogposts {
    'use strict';

    export class InMemoryBlogPostStore implements BlogPostStore {
        public static $inject = ['promiseBuilder'];

        protected posts = [
            new BlogPost(1, "First Post", "This is the body"),
            new BlogPost(2, "Second Post", "This is the body"),
            new BlogPost(3, "Third Post", "This is the body"),
            new BlogPost(4, "Fourth Post", "This is the body")
        ];

        constructor(private promiseBuilder: PromiseBuilder) {
        }

        add(newPostData:BlogPostData) {
            var that = this;
            return this.promiseBuilder.fromFunction(function() {
                var newPost = new BlogPost(that.nextId(), newPostData.title, newPostData.body);
                that.posts.push(newPost);
                return newPost;
            });
        }

        edit(editedPost:BlogPost) {
            var index = _.findIndex(this.posts,
                function (post) {
                    return post.id == editedPost.id
                });
            if (index != -1) {
                return this.promiseBuilder.fromFunction(function() {
                    this.posts[index] = editedPost;
                    return "";
                });
            } else {
                throw "No post with id " + editedPost.id;
            }
        }

        get(id:number) {
            var index = _.findIndex(this.posts,
                function (post) {
                    return post.id == id;
                });
            console.log("Found " + index);
            return this.promiseBuilder.fromValue(this.posts[index]);
        }

        remove(id:number) {
            var newPosts = _.filter(this.posts,
                function (post) {
                    return post.id != id
                });
            var difference = this.posts.length - newPosts.length;
            this.posts = newPosts;
            return this.promiseBuilder.fromValue(difference);
        }

        list() {
            return this.promiseBuilder.fromValue(this.posts);
        }

        private nextId(): number {
          return this.posts.length + 1;
        }
    }
}

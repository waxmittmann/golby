package blog

import play.api.data.validation.ValidationError
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.mvc.{Result, Action, AnyContent, Controller}
import play.api.libs.functional.syntax._

import authentication.AuthenticatedAction

import blog.BlogPostWithoutId.blogPostWithoutIdReads
import blog.BlogPost.blogPostReads

class BlogController extends Controller {
  def add() = AuthenticatedAction { request =>
      request.body.asJson.map(json => {
        json.validate[BlogPostWithoutId] match {
          case s: JsSuccess[BlogPostWithoutId] => {
            val newBlogPostId: Long = BlogPostsRepository.addNow(s.value)
            //Maybe should just return id here
            Ok(toJson(BlogPostsRepository.getNow(newBlogPostId)))
          }
          case f: JsError => {
            BadRequest("Json was wrong")
          }
        }
      }).getOrElse(BadRequest("Bad request body"))
  }

  def list = Action {
    val blogPosts: Seq[BlogPost] = BlogPostsRepository.listNow()
    Ok(Json.toJson(blogPosts.sortWith((postA: BlogPost, postB: BlogPost) => postA.id.compareTo(postB.id) > 0)))
  }

  def get(id: Long) = Action {
    BlogPostsRepository.listNow().find(_.id == id)
      .flatMap((blogPost) => Some(Ok(toJson(blogPost))))
      .getOrElse(NotFound("No post with id " + id))
  }

  def delete(id: Long) = AuthenticatedAction { request =>
      if (BlogPostsRepository.removeNow(id) == 0) {
        BadRequest(s"Did not find blog post with id $id to delete")
      } else {
        Ok
      }
  }

  def edit(id: Long) = AuthenticatedAction { request =>
    def errorHandler(error: Seq[(JsPath, Seq[ValidationError])]): Result = {
      println(error)
      BadRequest("Something went nasty")
    }

    def editHandler(blogPost: BlogPost): Result = {
      if (blogPost.id != id) {
        BadRequest("id in path does not equal post id")
      } else {
        val editedBlogPost: BlogPost = BlogPostsRepository.editNow(blogPost)
        Ok(toJson(editedBlogPost))
      }
    }

    def handlers(json: JsValue): Result = {
      //Hmm, how to implicit this?
      blogPostReads.reads(json).asEither.fold(errorHandler, editHandler)
    }

    request.body.asJson.map(handlers).getOrElse(BadRequest("Something went nasty"))
  }
}

package blog

import authentication.AuthenticationService
import play.api.Play
import play.api.data.validation.ValidationError
import play.api.libs.json._
import play.api.libs.json.Json._
import play.api.mvc.{Result, Action, AnyContent, Controller}
import play.api.libs.functional.syntax._

import slick.backend.DatabasePublisher
import slick.driver.H2Driver.api._

import scala.concurrent.ExecutionContext.Implicits.global

class BlogController extends Controller {
  implicit val blogPostWrites = new Writes[BlogPost] {
    def writes(blogPost: BlogPost) = Json.obj(
      "id" -> blogPost.id,
      "title" -> blogPost.title,
      "body" -> blogPost.body
    )
  }

  implicit val blogPostWithoutIdReads: Reads[BlogPostWithoutId] = (
        (JsPath \ "title").read[String] and
        (JsPath \ "body").read[String]
    )(BlogPostWithoutId.apply _)

  implicit val blogPostReads: Reads[BlogPost] = (
        (JsPath \ "id").read[Long] and
        (JsPath \ "title").read[String] and
        (JsPath \ "body").read[String]
    )(BlogPost.apply _)


  implicit val blogPostCompareById = new Ordering[BlogPost] {
    override def compare(x: BlogPost, y: BlogPost): Int = {
      return if (x.id - y.id > 0) 1
      else if (x.id == y.id) 0
      else -1
    }
  }

  def add() = Action {
    AuthenticationService.doIfAuthenticated((request) => {
      request.body.asJson.flatMap(json => {
        blogPostWithoutIdReads.reads(json).asOpt.flatMap(blogPostWithoutId => {
          val newBlogPostId: Long = BlogPostsRepository.addNow(blogPostWithoutId)
          //Maybe should just return id here
          Some(Ok(toJson(BlogPostsRepository.getNow(newBlogPostId))))
        }
        )
      }).getOrElse(BadRequest("Something went nasty"))
    })
  }

  private def createBlogEntry(blogPostWithoutId: BlogPostWithoutId): BlogPost = {
    val blogPosts: Seq[BlogPost] = BlogPostsRepository.listNow()
    //Todo: do in DB
    val nextId = if (blogPosts.isEmpty) 1 else blogPosts.map(_.id).max + 1;
    val blogPostWithId = blogPostWithoutId.toBlogPost(nextId)
    blogPostWithId
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

  def delete(id: Long) = Action {
    AuthenticationService.doIfAuthenticated((request) => {
      if (BlogPostsRepository.removeNow(id) == 0) {
        BadRequest(s"Did not find blog post with id $id to delete")
      } else {
        Ok
      }
    })
  }

  //Todo: Figure out a nicer way of doing auth (annotation mayhaps? interceptor?)
  def edit(id: Long): Action[AnyContent] = play.api.mvc.Action {
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
      println(json)
      val result: Result = blogPostReads.reads(json).asEither.fold(
        errorHandler,
        editHandler
      )
      result
    }

    AuthenticationService.doIfAuthenticated((request) => {
      request.body.asJson.map(handlers).getOrElse(BadRequest("Something went nasty"))
    })
  }

}

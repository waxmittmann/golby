package controllers

import play.api.libs.json._
import play.api.libs.json.Json.toJson
import play.api.mvc.{Action, Controller}
import play.api.libs.functional.syntax._

case class BlogPost(id: Long, title: String, body: String)

case class BlogPostWithoutId(title: String, body: String) {
  def toBlogPost(id: Long): BlogPost = {
    BlogPost(id, title, body)
  }
}

object BlogController extends Controller {

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

  implicit val blogPostCompareById = new Ordering[BlogPost] {
    override def compare(x: BlogPost, y: BlogPost): Int = {
      return if (x.id - y.id > 0) 1
      else if (x.id == y.id) 0
      else -1
    }
  }

  var posts: scala.collection.mutable.Map[Long, BlogPost] = scala.collection.mutable.Map(
    (1l, BlogPost(1l, "First Post", "... has a body")),
    (2l, BlogPost(2l, "Second Post", "... does too")),
    (3l, BlogPost(3l, "Third Post", "... is the best"))
  )

  def createBlogEntry(blogPostWithoutId: BlogPostWithoutId): BlogPost = {
//    val nextId = posts.values.min.id + 1;
    val nextId = posts.keys.max + 1;
    val blogPostWithId = blogPostWithoutId.toBlogPost(nextId)
    blogPostWithId
  }

  def add() = Action {
    implicit request =>
      request.body.asJson.flatMap(json => {
        blogPostWithoutIdReads.reads(json).asOpt.flatMap(blogPostWithoutId => {
          val blogPostWithId: BlogPost = createBlogEntry(blogPostWithoutId)
          posts.put(blogPostWithId.id, blogPostWithId)
          Some(Ok(toJson(blogPostWithId)))
        }
        )
      }).getOrElse(BadRequest("Something went nasty"))
  }

  def list = Action {
    Ok(Json.toJson(posts.values))
  }

}

package controllers

import play.api.libs.json._
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

  var posts: List[BlogPost] = List(
    BlogPost(1l, "First Post", "... has a body"),
    BlogPost(2l, "Second Post", "... does too"),
    BlogPost(3l, "Third Post", "... is the best")
  )


  def add() = Action { implicit request =>
    request.body.asJson.flatMap(json => {
      blogPostWithoutIdReads.reads(json).asOpt.flatMap(blogPostWithoutId => {
//          val blogPostWithId = BlogPost(nextId, "snoot", "poot")
          val nextId = posts.min.id + 1;
          val blogPostWithId = blogPostWithoutId.toBlogPost(nextId)
          println(request.body)
          posts ::= blogPostWithId
          Some(Ok(Json.toJson(blogPostWithId)))
        }
      )
    }).getOrElse(BadRequest("Something went nasty"))

//    val blogPost = blogPostWithoutIdReads.reads(request.body.asJson).asOpt.getOrElse()
//    val blogPostWithId = BlogPost(nextId, blogPost.title, blogPost.body)


//    val blogPostWithId = BlogPost(nextId, "snoot", "poot")
//    println(request.body)
//    posts ::= blogPostWithId
//    Ok(Json.toJson(blogPostWithId))
  }

  def list = Action {
    Ok(Json.toJson(posts))
  }

}

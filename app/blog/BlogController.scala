package blog

import authentication.AuthenticationService
import play.api.libs.json.Json._
import play.api.libs.json.{JsPath, Json, Reads, Writes}
import play.api.mvc.{Action, AnyContent, Controller}
import play.api.libs.functional.syntax._

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

  var posts: scala.collection.mutable.Map[Long, BlogPost] = scala.collection.mutable.Map(
    (1l, BlogPost(1l, "First Post", "... has a body")),
    (2l, BlogPost(2l, "Second Post", "... does too")),
    (3l, BlogPost(3l, "Third Post", "... is the best"))
  )

  def add() = Action {
    AuthenticationService.doIfAuthenticated((request) => {
      request.body.asJson.flatMap(json => {
        blogPostWithoutIdReads.reads(json).asOpt.flatMap(blogPostWithoutId => {
          val blogPostWithId: BlogPost = createBlogEntry(blogPostWithoutId)
          posts.put(blogPostWithId.id, blogPostWithId)
          Some(Ok(toJson(blogPostWithId)))
        }
        )
      }).getOrElse(BadRequest("Something went nasty"))
    })
  }

  private def createBlogEntry(blogPostWithoutId: BlogPostWithoutId): BlogPost = {
    val nextId = posts.keys.max + 1;
    val blogPostWithId = blogPostWithoutId.toBlogPost(nextId)
    blogPostWithId
  }

  def list = Action {
    Ok(Json.toJson(posts.values))
  }

  def get(id: Long) = Action {
    //Must be a 'scalarier' way of doing this
    if (posts.contains(id)) {
      Ok(toJson(posts.get(id)))
    } else {
      NotFound("No post with id " + id)
    }
  }

  def delete(id: Long) = Action {
    AuthenticationService.doIfAuthenticated((request) => {
      //Must be a 'scalarier' way of doing this
      if (posts.contains(id)) {
        Ok(toJson((posts -= id).values))
      } else {
        NotFound("No post with id " + id)
      }

      Ok(Json.toJson(posts.values))
    })
  }

  def edit(id: Long): Action[AnyContent] = play.api.mvc.Action {
    //Todo: Figure out a nicer way of doing it (annotation mayhaps? interceptor?)
    AuthenticationService.doIfAuthenticated((request) => {
      request.body.asJson.flatMap(json => {
        blogPostReads.reads(json).asOpt.flatMap((blogPost: BlogPost) => {
          if (blogPost.id != id) {
            Some(BadRequest("id in path does not equal post id"))
          } else {
            posts.put(blogPost.id, blogPost)
            Some(Ok(toJson(blogPost)))
          }
        })
      }).getOrElse(BadRequest("Something went nasty"))
    })
  }

}

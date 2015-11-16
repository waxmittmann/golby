package blog

import play.api.libs.json.{JsPath, Reads, Json, Writes}
import play.api.libs.functional.syntax._

object BlogPost {
  implicit val blogPostWrites = new Writes[BlogPost] {
    def writes(blogPost: BlogPost) = Json.obj(
      "id" -> blogPost.id,
      "title" -> blogPost.title,
      "body" -> blogPost.body
    )
  }

  implicit val blogPostReads: Reads[BlogPost] = (
        (JsPath \ "id").read[Long] and
        (JsPath \ "title").read[String] and
        (JsPath \ "body").read[String]
    )(BlogPost.apply _)

  def apply(in: (Long, String, String)) {
    BlogPost(in._1, in._2, in._3)
  }
}

case class BlogPost(id: Long, title: String, body: String)

object BlogPostWithoutId {
  implicit val blogPostWithoutIdReads: Reads[BlogPostWithoutId] = (
        (JsPath \ "title").read[String] and
        (JsPath \ "body").read[String]
    )(BlogPostWithoutId.apply _)
}

case class BlogPostWithoutId(title: String, body: String) {
  def toBlogPost(id: Long): BlogPost = {
    BlogPost(id, title, body)
  }
}

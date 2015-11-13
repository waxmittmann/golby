package blog

object BlogPost {
  def apply(in: (Long, String, String)) {
    BlogPost(in._1, in._2, in._3)
  }
}

case class BlogPost(id: Long, title: String, body: String)

case class BlogPostWithoutId(title: String, body: String) {
  def toBlogPost(id: Long): BlogPost = {
    BlogPost(id, title, body)
  }
}

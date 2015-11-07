package blog

case class BlogPost(id: Long, title: String, body: String)

case class BlogPostWithoutId(title: String, body: String) {
  def toBlogPost(id: Long): BlogPost = {
    BlogPost(id, title, body)
  }
}



package util

import blog.BlogPost
import play.api.mvc.QueryStringBindable

object Binders {

  //Hmm, don't need this I think... but maybe use one for something just to test
  implicit val blogPostQSB = new QueryStringBindable[BlogPost] {
    override def bind(key: String, params: Map[String, Seq[String]]): Option[Either[String, BlogPost]] = {
      println(key + ", " + params)
//      println(params("title"))
//      println(params("body"))
      println(params.keys)
      return None;
    }

    override def unbind(key: String, value: BlogPost): String = {
      println(key + ", " + value);
      return "";
    }
  }
}

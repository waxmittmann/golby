package blog

import java.util.concurrent.TimeUnit

import play.api.Play
import slick.dbio.Effect.Write
import slick.driver.H2Driver
import slick.driver.H2Driver.api._
import slick.jdbc
import slick.jdbc.JdbcBackend
import slick.lifted.{ProvenShape, ForeignKeyQuery}
import slick.profile.FixedSqlAction

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}

import scala.concurrent.ExecutionContext.Implicits.global
import slick.driver.JdbcProfile
import play.api.db.slick.DatabaseConfigProvider

case class BlogPost(id: Long, title: String, body: String)

class BlogPosts(tag: Tag) extends Table[(Long, String, String)](tag, "BLOGPOSTS") {
  def id = column[Long]("ID", O.PrimaryKey)

  def title = column[String]("TITLE")

  def body = column[String]("BODY")

  def * = (id, title, body)
}

case class BlogPostWithoutId(title: String, body: String) {
  def toBlogPost(id: Long): BlogPost = {
    BlogPost(id, title, body)
  }
}

object BlogPostsRepository {
  val dbConfig = DatabaseConfigProvider.get[JdbcProfile](Play.current)

  val blogPosts: TableQuery[BlogPosts] = TableQuery[BlogPosts]

  def doWithDb[S](func: Database => S): S = {
    val db: Database = dbConfig.db
    try {
      func(db)
    } catch {
      case ex: Exception => {
        ex.printStackTrace()
        throw ex
      }
    }
  }

  try { {
    println("Creating from " + blogPosts.schema)
    doWithDb(db => {
      val setupAction: DBIO[Unit] = DBIO.seq(
        blogPosts.schema.create,
        blogPosts +=(0, "Title", "Body"),
        blogPosts +=(1, "Title1", "Body1")
      )
      Await.result(db.run(setupAction), Duration.Inf)
      println("Created, supposedly?")
    })
  }
  }
  catch {
    case ex: Exception =>
      println("EXCEPTION!")
      ex.printStackTrace()
  }

  def list(): Future[Seq[BlogPost]] = {
    val listAllQuery = for {
      c <- blogPosts
    } yield (c.id, c.title, c.body)

    doWithDb(db => {
      db.run(listAllQuery.result).map(_.map(r => BlogPost(r._1, r._2, r._3)))
    })
  }

  def add(blogPost: BlogPost): Future[Int] = {
    val addAction: FixedSqlAction[Int, NoStream, Write]
    = (blogPosts +=(blogPost.id, blogPost.title, blogPost.body))
    doWithDb(db => db.run(addAction))
  }

  def remove(blogPost: BlogPost): Future[Int] = {
    val action = blogPosts.filter(_.id === blogPost.id).delete

    doWithDb(db => {
      db.run(action)
    })
  }

  def edit(blogPost: BlogPost): Future[BlogPost] = {
    doWithDb(db => {
      db.run(blogPosts
        .filter(_.id === blogPost.id)
        .map(i => (i.title, i.body))
        .update((blogPost.title, blogPost.body))
        .map(_ => blogPost))
    })
  }

  def editNow(blogPost: BlogPost): BlogPost = {
    doNow(() => edit(blogPost))
  }

  def listNow(): Seq[BlogPost] = {
    doNow(list)
  }

  def addNow(blogPost: BlogPost): Unit = {
    doNow(() => add(blogPost))
  }

  def removeNow(blogPost: BlogPost): Int = {
    doNow(() => remove(blogPost))
  }

  def doNow[S](func: () => Future[S]): S = {
    Await.result(func(), Duration(5, TimeUnit.SECONDS))
  }
}

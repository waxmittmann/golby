package test

import play.api.Play
import play.api.db.{Database, Databases}
import play.api.db.evolutions.{Evolution, SimpleEvolutionsReader, ClassLoaderEvolutionsReader, Evolutions}
import play.api.db.slick.DatabaseConfigProvider
import play.api.mvc.{Action, Controller}
import play.db.Database
import slick.backend.DatabaseConfig
import slick.driver.JdbcProfile

import scala.reflect.io.File

class TestController extends Controller {
  /*

  //  val databaseConfig: DatabaseConfig[JdbcProfile] = DatabaseConfigProvider.get[JdbcProfile](Play.current)
  val dbConfig: DatabaseConfig[JdbcProfile] = DatabaseConfigProvider.get[JdbcProfile](Play.current)

  //  val database: Database = Databases.withInMemory(name = "default") //name = "default")

  def putTestDataIntoDB() = Action { request =>
    //    Evolutions.applyEvolutions(database, ClassLoaderEvolutionsReader.forPrefix("test/"))
    //    Evolutions.applyEvolutions(database, ClassLoaderEvolutionsReader.forPrefix("zest/"))

//    Databases.

    /*
    slick.dbs.default.driver="slick.driver.H2Driver$"
slick.dbs.default.db.driver="org.h2.Driver"
slick.dbs.default.db.url="jdbc:h2:mem:play"
slick.dbs.default.connectionPool = disabled

     */

    dbConfig.db

    Databases.withDatabase(
      "org.h2.Driver",
      "jdbc:h2:mem:play"
    )(database => {
      println(database.getConnection().createStatement().executeQuery("SELECT * FROM BLOGPOSTS"))
    })

    Databases.withInMemory(name = "default")(database => {
      println(database.getConnection().createStatement().executeQuery("SELECT * FROM BLOGPOSTS"))
    })

    Databases.withInMemory(name = "default")(database => {
      Evolutions.applyEvolutions(database, SimpleEvolutionsReader.forDefault(
        new Evolution(
          1,
          "INSERT INTO BLOGPOSTS (5, 'george', 'costanza')",
          ""
        )
      ))
    })

    Ok("")
  }*/
}

//      println (File("conf/evolutions/test/").exists)
//      Evolutions.applyEvolutions(database, ClassLoaderEvolutionsReader.forPrefix("conf/evolutions/test/"))

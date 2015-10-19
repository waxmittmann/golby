package controllers

import play.api.data.Form
import play.api.libs.json.{JsValue, Json}
import play.api.mvc.{Action, Controller}
import play.api.data.Forms._

case class UserData(name: String, age: Int)

object TestController extends Controller {
//  val userForm: Form[UserData] = Form(
//    mapping(
//      "name" -> text,
//      "age" -> number
//    )(UserData.apply)(UserData.unapply)
//  )

  var cheeseList: List[String] = List("camenbert", "mozarella", "cheddar")

//  def index = Action {
//    Ok(views.html.Main())
//  }

  def list = Action {
    val cheeseJson: JsValue = Json.obj(
      "cheeses" -> cheeseList
    )

    Ok(cheeseJson)
  }


  def add(cheese: String) = Action {
    cheeseList ::= cheese
    Ok("")
  }

  def goo() = Action { implicit request =>

    val form = Form[(String, String)](
      tuple(
        "paramName1" -> nonEmptyText,
        "paramName2" -> nonEmptyText
      )
    )
    form.bindFromRequest.fold(
      failure => (),//do smthg with the failure info
      {
        case (p1, p2) => println(p1);println(p2)
      }
    )
    Ok("")
  }
}

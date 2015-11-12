package authentication

import play.api.libs.json._
import play.api.mvc._
import play.api.libs.functional.syntax._

case class LoginDetails(username: String, password: String) {
  def equals(loginDetails: LoginDetails): Boolean = {
    loginDetails != null && loginDetails.password.equals(password) && loginDetails.username.equals(username)
  }
}
case class TokenResponse(token: String)

class AuthenticationController extends Controller {

  val correctLoginDetails = LoginDetails("", "")

  implicit val loginDetailsParser: Reads[LoginDetails] = (
        (JsPath \ "username").read[String] and
        (JsPath \ "password").read[String]
    )(LoginDetails.apply _)

  def doLogin(): String = {
    AuthenticationService.authenticate()
  }

  def login() = Action { request =>
    val result: Result = request.body.asJson.map(json => {
      val jsResult: JsResult[Result] = loginDetailsParser.reads(json).map((loginDetails: LoginDetails) =>
        if (loginDetails.equals(correctLoginDetails)) {
          val token: String = doLogin()
          Ok(Json.obj("token" -> token))
        }
        else {
          println(loginDetails.username + ", " + loginDetails.password + " is wrong")
          Unauthorized("Wrong username / password")
        }
      )
      jsResult.getOrElse(BadRequest("Could not parse json"))
    }).getOrElse(BadRequest("Not json"))
    result
  }

  def logout() = Action {
    AuthenticationService.doIfAuthenticated((_) => {
      AuthenticationService.unauthenticate()
      Ok("All good!")
    })
  }

  def isAuthenticated() = Action {
    AuthenticationService.doIfAuthenticated((_) => Ok("All good!"))
  }
}

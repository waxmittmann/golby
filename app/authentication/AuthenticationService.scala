package authentication

import authentication.AuthenticationController._
import play.api.mvc.{Result, AnyContent, Request}

import scala.util.Random

object AuthenticationService {
  var currentlyAuthenticated: Option[String] = None
  val random: Random = new Random()

  def authenticate() : String = {
    val token: String = random.alphanumeric.take(20).mkString
    currentlyAuthenticated = Some(token)
    token
  }

  def unauthenticate(): Unit = {
    currentlyAuthenticated = None
  }

  def isAuthorized(token: String): Boolean = {
    currentlyAuthenticated.fold(false)(correctToken => correctToken == token)
  }

  def doIfAuthenticated(request: Request[AnyContent], func: (Request[AnyContent] => Result)) = {
    request.headers.get("token").flatMap(token =>
      if (AuthenticationService.isAuthorized(token))
        Some(func(request))
      else
        Some(Unauthorized("Bad token"))
    ).getOrElse(Unauthorized("No token"))
  }
}

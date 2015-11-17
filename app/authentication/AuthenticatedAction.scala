package authentication

import authentication.AuthenticationService
import play.api.mvc.Results._
import play.api.mvc._

import scala.concurrent.Future

object AuthenticatedAction extends ActionBuilder[Request] {
  def invokeBlock[A](request: Request[A], block: (Request[A]) => Future[Result]) = {
    request.headers.get("token").map(token => {
      if (AuthenticationService.isAuthorized(token)) {
        block(request)
      } else {
        Future.successful(Unauthorized("Bad token"))
      }
    }
    ).getOrElse(Future.successful(Unauthorized("No token")))
  }
}
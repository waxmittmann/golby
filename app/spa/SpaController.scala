package spa

import play.api.mvc.{Action, Controller}

object SpaController extends Controller {

  def index = Action {
    Ok(views.html.Index())
  }
  
}

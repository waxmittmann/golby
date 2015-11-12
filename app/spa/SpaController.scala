package spa

import play.api.mvc.{Action, Controller}

class SpaController extends Controller {

  def index = Action {
    Ok(views.html.Index())
  }
  
}

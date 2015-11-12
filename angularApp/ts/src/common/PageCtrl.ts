module blogposts {
  'use strict';

  export class PageCtrl {

    private page: String;

    public static $inject = [
      'pageService',
			'$scope'
		];

    constructor(
      private pageService,
      private $scope
    ) {
        console.log("Initing controller");
        $scope.vm = this;
        this.registerWithPageService();
    }

    isPage(inPage: String, toReturn: String) {
      console.log(this.page + " === " +  inPage);
      if (this.page === inPage) {
        //console.log("Returning " + toReturn);
        return toReturn;
      } else {
        //console.log("NOT Returning " + toReturn);
        return "";
      }
    }

    private registerWithPageService() {
      var that = this;
      this.pageService.register(function(_page) {
        console.log("PageCtrl has heard!");
        if (_page === AuthenticationCtrl.PAGE_NAME) {
          that.page = "authentication";
        } else if (_page === CreateBlogPostCtrl.PAGE_NAME) {
          that.page = "createpost";
        } else if (
          _page === ViewBlogPostCtrl.PAGE_NAME_SINGLE_VIEW ||
          _page === ViewBlogPostCtrl.PAGE_NAME_LIST_VIEW
        ) {
          that.page = "viewpost";
        } else {
          throw "Unknown page " + _page;
        }
      });
    }
  }
}

$(function() {
  var URL = 'https://its.actindi.net', Issue;

  Issue = function(id) {
    self = this;
    // チケットのオブジェクトを取得する
    $.ajax({
      url: URL + "/issues/" + id,
      async: false,
      type: 'get',
      dataType: "html",
      success: function (data) {
        $data = $(data);
        self.percent = $data.find(".percent").text();
        self.subject = $data.find(".subject h3").text();
      }
    })
    return self;
  };
  Issue.prototype = {
    formalized: function() {
      return this.subject + "(" + this.percent + ")";
    }
  };

  // http://stackoverflow.com/questions/3605214/javascript-add-leading-zeroes-to-date
  var get_today = function() {
    var MyDate = new Date();
    return MyDate.getFullYear() + '-' +
      ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-' +
      ('0' + MyDate.getDate()).slice(-2);
  };

  // マイページからuse_idを取得する
  var get_user_id = function() {
    var user_id = 1;
    $.ajax({
      url: URL + '/my/page',
      async: false,
      type: 'get',
      dataType:"html",
      success: function (data) {
        var $link = $(data).find("a.user.active");
        user_id = $link.attr("href").match(/users\/(\d*)/)[1];
      }
    });
    return user_id;
  };

  // 該当日付のチケットurlのコレクションを取得する
  var issue_id_set = function () {
    var today = get_today(), id_set = new Set();
    $.ajax({
      url: URL + '/activity',
      async: false,
      type: 'get',
      dataType: "html",
      data: 'user_id=' + get_user_id(),
      success: function (data) {
        var $today_h3;
        $(data).find("h3").each(function(_, h3) {
          var $h3= $(h3);
          if($h3.text() == today) {
            $today_h3 = $h3;
            return;
          }
        });
        var issues_parent_dom = $today_h3.next();
        issues_parent_dom.find("a").each(function(_, link) {
          var $link = $(link);
          if(/^.issues/.test($link.attr("href"))) { // チケットURLのlinkだけを抽出
            id = $link.attr("href").match(/issues.(\d*)#?/)[1];
            id_set.add(id);
          }
        });
      }
    })
    return id_set;
  };

  $("#fire").click(function(e) {
    for (var id of issue_id_set().values()) {
      var $p = $("<div>");
      $("body").append(
        $p.html(
          (new Issue(id)).formalized()
        )
      );
    }
  });
});

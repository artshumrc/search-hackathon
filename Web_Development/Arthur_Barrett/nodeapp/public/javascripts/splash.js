(function($) {
  "use strict";

  var splashController = {
    passageNum: 1,

    onDocumentReady: function() {
      console.log("document ready");
      $('[data-toggle="tooltip"]').tooltip();
      $('#booksleuth-anotherpassage').on('click', this.addAnotherPassage.bind(this));
      $('#booksleuth-loadpassages').on('click', this.loadPassages.bind(this));
      $('#booksleuth-passage-keywords').on('mouseover', this.onPassageKeywordsMouseover.bind(this));
    },

    addAnotherPassage: function(event) {
      splashController.passageNum++;
      var source = `
<div class="form-group booksleuth-passage">
    <label for="booksleuth-passage{{passageNum}}">Passage {{passageNum}}:</label> 
    <textarea id="booksleuth-passage{{passageNum}}" name="booksleuth-passage{{passageNum}}" class="form-control" ></textarea>
</div>
`;
      var template = Handlebars.compile(source);
      var html = template({passageNum: splashController.passageNum});
      $('.booksleuth-passage').last().after(html);
    },

    loadPassages: function(event) {
      console.log("loadpassages");

      var passageTexts = [];
      $('.booksleuth-passage').each(function(index, el) {
        passageTexts.push($('textarea', el).val());
      });

      var request = $.ajax({
        url: "/api/loadPassages",
        method: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify({passageTexts: passageTexts}),
      });
      request.done(function(data) {
        console.log("got data back from loading passages:", data);
        var source = `
<div class="booksleuth-passage-keywords">
<em>Proposed search terms:</em>
{{#each keywords}}
    <div class="booksleuth-passage-keyword">{{this}} <small>({{lookup ../frequency this}})</small><span class="oi oi-delete" title="delete" aria-hidden="true" style="display:none;"></span></div>
{{/each}}
</div>
`;
        var template = Handlebars.compile(source);
        var $keywords = $('#booksleuth-passage-keywords');
        $keywords.html(template(data));
        $("#booksleuth-search-execute").show();
      });
    },
    onPassageKeywordsMouseover: function(event) {
      var $keyword = $(event.target).closest('.booksleuth-passage-keyword');
      if($keyword.length == 1) {
        $('#booksleuth-passage-keywords .oi-delete').hide();
        $keyword.find('.oi-delete').show();
      }
    }
  };

  $(document).ready(splashController.onDocumentReady.bind(splashController));

})(jQuery);
(function($) {
  "use strict";

  var splashController = {
    passageNum: 1,
    passageData: {},
    searchKeywords: [],

    onDocumentReady: function() {
      console.log("document ready");
      $('[data-toggle="tooltip"]').tooltip();
      $('#booksleuth-anotherpassage').on('click', this.addAnotherPassage.bind(this));
      $('#booksleuth-loadpassages').on('click', this.loadPassages.bind(this));
      $('#booksleuth-passage-keywords').on('mouseover', this.onPassageKeywordsMouseover.bind(this));
      $('#booksleuth-passage-keywords').on('click', this.onPassageKeywordsClick.bind(this));
    },

    addAnotherPassage: function(event) {
      var self = this;
      self.passageNum++;
      var source = `
<div class="form-group booksleuth-passage">
    <label for="booksleuth-passage{{passageNum}}">Passage {{passageNum}}:</label> 
    <textarea id="booksleuth-passage{{passageNum}}" name="booksleuth-passage{{passageNum}}" class="form-control" ></textarea>
</div>
`;
      var template = Handlebars.compile(source);
      var html = template({passageNum: self.passageNum});
      $('.booksleuth-passage').last().after(html);
    },

    loadPassages: function(event) {
      var self = this;

      var passageTexts = [];
      $('.booksleuth-passage').each(function(index, el) {
        passageTexts.push($('textarea', el).val());
      });

      var passageParams = {};
      passageParams.limit = parseInt($('input#booksleuth-passage-params-limit').val(), 10);
      passageParams.weight = $('input[name="booksleuth-passage-params-tf"]:checked').val();
      passageParams.stopwords = $('input#booksleuth-passage-params-stopwords').val();

      var postData = {
        passageTexts: passageTexts,
        passageParams: passageParams
      };

      var request = $.ajax({
        url: "/api/loadPassages",
        method: "POST",
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(postData),
      });
      request.done(function(data) {
        console.log("loaded data", data);
        self.passageData = data;
        self.searchKeywords = data.keywords;

        var source = `
{{#if keywords}}
<h3>Choose the words you think are most relevant:</h3>
<div class="booksleuth-passage-keywords">
{{#each keywords}}
    <div class="booksleuth-passage-keyword" data-keyword="{{this}}">{{this}} <small>({{lookup ../frequency this}})</small><span class="oi oi-delete" title="delete" aria-hidden="true" style="display:none;"></span></div>
{{/each}}
</div>
{{else}}
<i class="text-secondary">Frequent word analysis did not return any results.</i>
{{/if}}
`;
        var template = Handlebars.compile(source);
        var $keywords = $('#booksleuth-passage-keywords');
        $keywords.html(template(data));
        self.updateSearchKeywords();
        $("#booksleuth-passage-search").show();
      });
    },
    updateSearchKeywords: function() {
      var self = this;
      $('#passage-search-terms').val(self.searchKeywords.join(' '));
    },
    onPassageKeywordsMouseover: function(event) {
      var $keyword = $(event.target).closest('.booksleuth-passage-keyword');
      if($keyword.length == 1) {
        $('#booksleuth-passage-keywords .oi-delete').hide();
        $keyword.find('.oi-delete').show();
      }
    },
    onPassageKeywordsClick: function(event) {
      var self = this;
      var $target = $(event.target);
      var $keyword = $target.closest('.booksleuth-passage-keyword');
      var keyword, keywordIdx;
      if($target.hasClass('oi-delete')) {
        keyword = $keyword.data('keyword');
        keywordIdx = self.searchKeywords.indexOf(keyword);
        if(keywordIdx !== -1) {
          self.searchKeywords.splice(keywordIdx, 1);
          $keyword.remove();
          self.updateSearchKeywords();
        } else {
          console.log("error removing keyword", keyword);
        }
      }
    }
  };

  $(document).ready(splashController.onDocumentReady.bind(splashController));

})(jQuery);
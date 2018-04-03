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
      passageParams.useIdf = $('input#booksleuth-passage-params-idf:checked').val() == '1' ? true : false;

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
        console.log("analyzed passage data:", data);
        self.passageData = data;
        self.searchKeywords = data.keywords;

        var source = `
{{#if keywords}}
<h3>Choose the words you think are most relevant:</h3>
<div class="form-check-inline">
    <div class="form-check">
      <input type="radio" class="form-check-input" id="booksleuth-passage-keywords-controls-view-inline" name="booksleuth-passage-keywords-controls-view" value="inline" {{#if inlineView }}checked{{/if}}> 
      <label for="booksleuth-passage-keywords-controls-view-inline">Inline view</label>
    </div>
    <div class="form-check">
      <input type="radio" class="form-check-input" id="booksleuth-passage-keywords-controls-view-list" name="booksleuth-passage-keywords-controls-view" value="list" {{#if listView }}checked{{/if}}> 
      <label for="booksleuth-passage-keywords-controls-view-list">List view</label>
    </div>
</div>
<div class="booksleuth-passage-keywords">
{{#each keywords}}
    <div class="booksleuth-passage-keyword booksleuth-passage-keyword-{{../viewType}}" data-keyword="{{this}}">{{this}} <small>({{lookup ../frequency this}})</small><span class="oi oi-delete" title="delete" aria-hidden="true" style="display:none;"></span></div>
{{/each}}
</div>
{{else}}
<i class="text-secondary">Frequent word analysis did not return any results.</i>
{{/if}}
`;
        var viewType = $('input[name="booksleuth-passage-keywords-controls-view"]:checked').val() || 'inline';
        var template = Handlebars.compile(source);
        var templateParams = $.extend({
          viewType: viewType,
          inlineView: viewType == 'inline',
          listView: viewType == 'list'
        }, data);

        var $keywords = $('#booksleuth-passage-keywords');
        $keywords.html(template(templateParams));
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
      } else if($target.attr('name') == 'booksleuth-passage-keywords-controls-view') {
        if($target.is(':checked')) {
          $('.booksleuth-passage-keyword')
            .removeClass('booksleuth-passage-keyword-' + ($target.val() == 'inline' ? 'list' : 'inline'))
            .addClass('booksleuth-passage-keyword-' + ($target.val() == 'inline' ? 'inline' : 'list'));
        }
      }
    }
  };

  $(document).ready(splashController.onDocumentReady.bind(splashController));

})(jQuery);
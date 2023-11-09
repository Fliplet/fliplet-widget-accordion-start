(function($) {
  'use strict';

  function resizeWindow() {
    if (Modernizr.windows) {
      var event = document.createEvent('UIEvents');

      event.initUIEvent('resize', true, false, window, 0);
      window.dispatchEvent(event);
    } else {
      window.dispatchEvent(new Event('resize'));
    }
  }

  Fliplet.Widget.instance('collapse-start', function() {
    var $container = $(this);

    Fliplet().then(function() {
      $container.translate();

      if (Fliplet.Env.get('interact')) {
        return;
      }

      // Initialize collapsibles
      $(Collapsible.SELECTORS.collapsibleStart).collapsible();

      // Wrap adjacent Collapsibles into Accordions
      $(Collapsible.SELECTORS.collapsible)
        .not(Collapsible.SELECTORS.collapsible + '+' + Collapsible.SELECTORS.collapsible)
        .each(function(i) {
          $(this)
            .nextUntil(':not(' + Collapsible.SELECTORS.collapsible + ')')
            .addBack()
            .wrapAll('<div class="panel-group" id="accordion-' + (i + 1) + '" />');
        });
      $('.panel-group').each(function() {
        var $accordion = $(this);
        var id = $accordion.attr('id');

        $accordion.find('[data-toggle="collapse"]').attr('data-parent', '#' + id);
      });

      // Cleanup unused Collapsible Ends
      $(Collapsible.SELECTORS.collapsibleEnd).closest(Collapsible.SELECTORS.widget).remove();

      // Trigger resize to render certain components correctly (e.g. Grid, Charts)
      resizeWindow();

      // Parse queries to open specific accordions
      /*
       * action {String} Set to 'openAccordion' to open a specific accordion
       * title {String} The accordion title to match and open (Optional)
       * index {Number} The index of accordion that you want to open, where 0 is the first one. (Default: 0)
       * groupIndex {Number} (Optional) The group of accordion that you want to specify. Use this to apply the index within a specific group. If this is not used, the index query will be used to target an accordion relative to the entire screen.
       * scroll {Boolean} If true, users will be scrolled to the opened accordion. (Default: false)
       *
       * Example 1 - Open the 1st accordion
       * ?action=openAccordion
       *
       * Example 2 - Open and scroll to the 2nd accordion of the 2nd accordion group
       * ?action=openAccordion&groupIndex=1&index=1&scroll=true
       *
       * Example 3 - Open all accordions with title "Foo bar" and scrolls to the first match
       * ?action=openAccordion&title=Foo%20bar&scroll=true
       *
       */
      var query = Fliplet.Navigate.query;

      if (query && query.action === 'openAccordion') {
        var index = parseInt(query.index, 10) || 0;
        var groupIndex = parseInt(query.groupIndex, 10) || '';
        var title = query.title;
        var scroll = query.scroll === 'true';
        var $collapse;

        if (title) {
          $collapse = $('.panel-group > .panel').filter(function() {
            return $(this).find('h4').text() === title;
          });
        } else if (typeof groupIndex === 'number') {
          $collapse = $('.panel-group:eq(' + groupIndex + ') > .panel:eq(' + index + ')');
        } else {
          $collapse = $('.panel-group > .panel:eq(' + index + ')');
        }

        if (!$collapse.length) {
          return;
        }

        $collapse.children('.panel-collapse').collapse('show');

        if (scroll && $collapse.position()) {
          $('html, body').animate({ scrollTop: $collapse.eq(0).position().top }, 100);
        }
      }
    });
  });

  // Event listeners to handle chevron UI states
  $(document)
    .on('keydown', Collapsible.SELECTORS.collapsible, function(event) {
      if (event.keyCode === 13 || event.keyCode === 32) {
        $(event.target).find(Collapsible.SELECTORS.collapse).collapse('toggle');
      }
    })
    .on('show.bs.collapse', Collapsible.SELECTORS.collapse, function() {
      // Immediately when the expand action is fired
      var $element = $(this);
      var id = $element.attr('id');
      var label = $('[data-toggle="collapse"][data-target="#' + id + '"]').text().trim();
      var parentId = $element.prev().data('parent');
      var $parentElement = $(parentId);
      var $openedAccordions = $parentElement.find('.collapse.in');
      var isNestedAccordion = !!$parentElement.parents('.collapse.in').length;
      var isChildOpening = !!$element.find('.opening').length;

      if (isNestedAccordion) {
        $element.addClass('opening');
      }

      if ($openedAccordions.length && !isChildOpening) {
        $openedAccordions.collapse('hide');
      }

      Collapsible.prototype.toggleChevron(id, true);
      resizeWindow();
      Fliplet.Analytics.trackEvent({
        category: 'accordion',
        action: 'open',
        label: label
      });
    })
    .on('hide.bs.collapse', Collapsible.SELECTORS.collapse, function() {
      // Immediately when the collapse action is fired
      resizeWindow();
    })
    .on('shown.bs.collapse', Collapsible.SELECTORS.collapse, function() {
      // When finishes expanding
      $(this).removeClass('opening');

      resizeWindow();
    })
    .on('hidden.bs.collapse', Collapsible.SELECTORS.collapse, function() {
      // When finishes collapsing
    });
})(jQuery);

(function($) {
  'use strict';

  if (Fliplet.Env.get('interact')) {
    return;
  }

  // COLLAPSIBLE CLASS DEFINITION
  // ============================

  var collapsibleTemplate = Fliplet.Widget.Templates['templates.collapsible'];

  function resizeWindow() {
    if (Modernizr.windows) {
     var event = document.createEvent('UIEvents');
     event.initUIEvent('resize', true, false, window, 0);
     window.dispatchEvent(event);
    } else {
      window.dispatchEvent(new Event('resize'));
    }
  }
  
  var Collapsible = function(el) {
    // Plugin initialization
    // Find the widget container for Collapsible Start
    var $collapsibleStart = $(el);
    var id = $collapsibleStart.data('collapse-start-id').toString();
    var $startWidget = $collapsibleStart.closest(Collapsible.SELECTORS.widget);
    var title = $collapsibleStart.html();
    
    // Find all subsequent content nodes
    var $content = $startWidget.nextUntil(Collapsible.SELECTORS.widget);
    var $next;
    if ($content.length) {
      $next = $content.last().next();
    } else {
      $next = $startWidget.next();
    }
    
    while ($next.length && !Collapsible.prototype.widgetIsCollapsiblePart($next)) {
      $content = $content.add($next);
      $content = $content.add($next.nextUntil(Collapsible.SELECTORS.widget));
      $next = $content.last().next();
    }

    // Create Collapsible based on title and content found
    var data = {
      id: id,
      title: $('<textarea />').html(title).text(), // Decode HTML entities
      collapsed: true
    };
    var $collapsible = $(collapsibleTemplate(data));
    $content.detach();      
    $collapsible.find('.panel-body').html($content);
    $startWidget.replaceWith($collapsible);
  }

  Collapsible.SELECTORS = {
    collapsibleStart: '[data-collapse-start-id]',
    collapsibleEnd: '[data-collapse-end-id]',
    collapse: '.collapse',
    collapsible: '[data-collapse-id]',
    widget: '[data-fl-widget-instance]'
  }
    
  Collapsible.prototype.widgetIsCollapsibleStart = function ($widget){
    return $widget.find(Collapsible.SELECTORS.collapsibleStart).length > 0;
  }

  Collapsible.prototype.widgetIsCollapsibleEnd = function ($widget){
    return $widget.find(Collapsible.SELECTORS.collapsibleEnd).length > 0;
  }

  Collapsible.prototype.widgetIsCollapsiblePart = function ($widget){
    return $widget.find(Collapsible.SELECTORS.collapsibleStart).length > 0
      || $widget.find(Collapsible.SELECTORS.collapsibleEnd).length > 0;
  }

  Collapsible.prototype.toggleChevron = function (id, show){
    $('[data-target="#' + id + '"]')[show ? 'removeClass' : 'addClass']('collapsed');
  }

  // COLLAPSIBLE PLUGIN DEFINITION
  // =============================

  function Plugin(option) {
    return this.each(function () {
      var $this = $(this)
      var data  = $this.data('bs.collapsible')

      if (!data) $this.data('bs.collapsible', (data = new Collapsible(this)))
      if (typeof option == 'string' && typeof data[option] === 'function') {
        data[option].call($this);
      }
    })
  }

  var old = $.fn.collapsible;

  $.fn.collapsible = Plugin;
  $.fn.collapsible.Constructor = Collapsible;


  // COLLAPSIBLE NO CONFLICT
  // =======================

  $.fn.collapsible.noConflict = function () {
    $.fn.collapsible = old;
    return this;
  }
  
  // COLLAPSIBLE INITIALIZATION
  // ==========================

  // Initialize collapsibles
  $(Collapsible.SELECTORS.collapsibleStart).collapsible();
  
  // Wrap adjacent Collapsibles into Accordions
  $(Collapsible.SELECTORS.collapsible)
    .not(Collapsible.SELECTORS.collapsible + '+' + Collapsible.SELECTORS.collapsible)
    .each(function(i){
      $(this)
        .nextUntil(':not('+Collapsible.SELECTORS.collapsible+')')
        .addBack()
        .wrapAll('<div class="panel-group" id="accordion-'+(i+1)+'" />');
    });
  $('.panel-group').each(function(){
    var $accordion = $(this);
    var id = $accordion.attr('id');
    $accordion.find('[data-toggle="collapse"]').attr('data-parent', '#'+id);
  });

  // Cleanup unused Collapsible Ends
  $(Collapsible.SELECTORS.collapsibleEnd).parents(Collapsible.SELECTORS.widget).remove();
  // Trigger resize to render certain components correctly (e.g. Grid, Charts)
  resizeWindow();

  // Parse queries to open specific accordions
  /*
   * action {String} Set to 'openAccordion' to open a specific accordion
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
   */
  var query = Fliplet.Navigate.query;
  if (query && query.action === 'openAccordion') {
    var index = parseInt(query.index, 10) || 0;
    var groupIndex = parseInt(query.groupIndex, 10) || '';
    var selector;
    var $collapse;

    if (typeof groupIndex === 'number') {
      selector = '.panel-group:eq('+groupIndex+') > .panel:eq('+index+')';
    } else {
      selector = '.panel-group > .panel:eq('+index+')';
    }
    $collapse = $(selector);

    $collapse.children('.panel-collapse').collapse('show');
    if (query.scroll && $collapse.position()) {
      $('html, body').animate({scrollTop: $collapse.position().top}, 100);
    }
  }

  // Event listeners to handle chevron UI states
  $(document)
    .on('show.bs.collapse', Collapsible.SELECTORS.collapse, function(){
      // Immediately when the expand action is fired
      var id = $(this).attr('id');
      var label = $('.panel-title[data-target="#' + id + '"]').text().trim();
      Fliplet.Analytics.trackEvent({
        category: 'accordion',
        action: 'open',
        label: label
      });
      Collapsible.prototype.toggleChevron(id, true);
      resizeWindow();
    })
    .on('hide.bs.collapse', Collapsible.SELECTORS.collapse, function(){
      // Immediately when the collapse action is fired
      Collapsible.prototype.toggleChevron($(this).attr('id'), false);
      resizeWindow();
    })
    .on('shown.bs.collapse', Collapsible.SELECTORS.collapse, function(){
      // When finishes expanding
      resizeWindow();
    })
    .on('hidden.bs.collapse', Collapsible.SELECTORS.collapse, function(){
      // When finishes collapsing
    });
})(jQuery);

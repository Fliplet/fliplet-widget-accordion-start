+ function($) {
  'use strict';

  if (Fliplet.Env.get('interact')) {
    return;
  }

  // COLLAPSIBLE CLASS DEFINITION
  // ============================

  var collapsibleTemplate = Fliplet.Widget.Templates['templates.collapsible'];
  
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
    if (Collapsible.prototype.widgetIsCollapsibleEnd($next)) {
      $next.remove();
    }

    // Create Collapsible based on title and content found
    var data = {
      id: id,
      title: title,
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

  $(Collapsible.SELECTORS.collapsibleStart).collapsible();
  // Cleanup unused Collapsible Ends
  $(Collapsible.SELECTORS.collapsibleEnd).remove();
  
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

  $(document).on('show.bs.collapse', Collapsible.SELECTORS.collapse, function(){
    Collapsible.prototype.toggleChevron($(this).attr('id'), true);
  });
  $(document).on('hide.bs.collapse', Collapsible.SELECTORS.collapse, function(){
    Collapsible.prototype.toggleChevron($(this).attr('id'), false);
  });
}(jQuery);

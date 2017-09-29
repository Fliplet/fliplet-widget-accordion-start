Fliplet().then(function () {
  $(window).on('resize', Fliplet.Widget.autosize);
  var widgetId = Fliplet.Widget.getDefaultId();

  function save(notifyComplete){
    Fliplet.Widget.save({
      heading: $('#heading').val()
    }).then(function () {
      if (notifyComplete) {
        Fliplet.Widget.complete();
      } else {
        Fliplet.Studio.emit('reload-widget-instance', widgetId);
      }
    });
  }

  $('form').submit(function (event) {
    event.preventDefault();
    save(true);
  });

  $('#heading').on('keyup change paste', $.debounce(function() {
    save();
  }, 500));

  // Fired from Fliplet Studio when the external save button is clicked
  Fliplet.Widget.onSaveRequest(function () {
    $('form').submit();
  });
});

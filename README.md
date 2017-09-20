# page.js
Simple turbolink-like helper for jQuery.

## Example

```js
// Intiailize plugin

var page = new $p.page({
    container: '#content'
}).on('preload', function() {

    // Fires before ajax request

}).on('progress', function(e) {

    // Fires on progress

}).on('pushstate', function(data) {

    // Save data on state
    data.activeMenuElement = 'whatever';

}).on('load', function(e) {

    // Fire Google Analytics on page-load
    ga('set', { page: location.pathname.substr(1) + location.search, title: window.title });
    ga('send', 'pageview');

});

// Use page.js when clicking url

$(document).on('click.page.link', ' a:not([data-ajax="false"])', function (e) {
    // Ignore ctrl + click
    if (!e.metaKey && !e.ctrlKey) {
        var href = $(this).attr('href');

        if (href === (location.pathname + location.search)) {
            e.preventDefault();
            page.reload();
            return;
        }

        if (href !== null && href.indexOf('/') === 0) {
            e.preventDefault();
            page.go(href);
        }
    }
});

```

Events added on `page.on()` will fire each time the event is trigged. If you only want to fire an event once, you can use the ` page.bind()` instead.

In your master template add `id="content"` to the element where you want your ajax-requests to be displayed.
```html
<div id="content">
    This content will be replaced by page.js when loading an url
</div>
```

## Events

- ready
- preload
- load
- progress
- error
- pushstate
- statechange

## Ajax request

You can call `page.js` in the template of your ajax-request.

**Example:**

```js
<!-- Your HTML -->

<script>
    // Set the page title
    page.setTitle('My loaded page');

    // Add styles to <head> if not already present
    page.loadStyles([
      '/css/specific-style.css'
    ]);

    // Add scripts to <head> if not already present
    page.loadScripts([
      '//code.jquery.com/jquery-3.1.1.slim.min.js'
    ]);

    // Fires when page and scripts is fully loaded
    page.ready(function() {

    });
</script>
```
Script or styles loaded through `page.loadScripts` or `page.loadStyles` will automaticially be added to the `<head>` of your page, if they aren't already present.

# page.js
Simple turbolink-like functionality for jQuery.

## Example

```js
// Intiailize jquery.turbolinks
page.init();

// Fires before ajax request
page.on('preload', function() {
    
});

// Fires on progress
page.on('progress', function(e) {
    
});

// Fires on page-load
page.on('load', function(e) {

    // Google Analytics
    ga('set', { page: location.pathname.substr(1) + location.search, title: window.title });
    ga('send', 'pageview');
    
});
```

Events added on `page.on()` will fire each time the event is trigged. If you only want to fire an event once, you can use the ` page.bind()` instead.

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

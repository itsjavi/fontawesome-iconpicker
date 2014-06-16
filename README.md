fontawesome-iconpicker
========================

Font Awesome Icon Picker is a fully customizable plugin for Twitter Bootstrap,
with a powerful base API, based on [bootstrap-popover-picker](http://mjolnic.github.io/bootstrap-popover-picker/)

[View demos](http://mjolnic.github.io/fontawesome-iconpicker/)

## Instantiation

You can call the plugin in several ways:

```javascript
// Create instance if not exists (returns a jQuery object)
$('.my').iconpicker();
$('.my').iconpicker({ /*options*/ }); // you can also specify options via data-* attributes

// For the first matched element, access to a plugin property value
$('.my').data('iconpicker').iconpickerProperty;

// For the first matched element, call a plugin instance method with the given args
$('.my').data('iconpicker').iconpickerMethod('methodArg1', 'methodArg2' /* , other args */);

// Call and apply a plugin method to EACH matched element.
$.iconpicker.batch('.my', 'iconpickerMethod', 'methodArg1', 'methodArg2' /* , other args */); ->
```

## Triggered Events

All of them exposes the plugin instance through event.iconpickerInstance

In order of call:

* iconpickerCreate
* iconpickerCreated
* iconpickerShow
* iconpickerShown
* iconpickerSelect (also exposes event.iconpickerItem and event.iconpickerValue)
* iconpickerUpdate
* iconpickerInvalid (also exposes event.iconpickerValue)
* iconpickerSetValue (also exposes event.iconpickerValue)
* iconpickerSetSourceValue (also exposes event.iconpickerValue)
* iconpickerUpdated
* iconpickerSelected (also exposes event.iconpickerItem and event.iconpickerValue)
* iconpickerHide
* iconpickerHidden
* iconpickerDestroy
* iconpickerDestroyed

## Popover placement extensions

This plugin comes with more placement options than the original Bootstrap Popover.
Here are all the possibilities in detail:

            1 2 3 4 5
            G       6
            F       7
            E       8
            D C B A 9
            
    0.      inline (no placement, display as inline-block)
    1.      topLeftCorner
    2.      topLeft
    3.      top (center)
    4.      topRight
    5.      topRightCorner
    6.      rightTop
    7.      right (center)
    8.      rightBottom
    9.      bottomRightCorner
    A.      bottomRight
    B.      bottom (center)
    C.      bottomLeft
    D.      bottomLeftCorner
    E.      leftBottom
    F.      left (center)
    G.      leftTop
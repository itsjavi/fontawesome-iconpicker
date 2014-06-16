bootstrap-popover-picker
========================

Generic jQuery plugin template for building pickers using Bootstrap popovers,
fully customizable with a powerful base API, including jQuery.UI position plugin.

[View demos](http://mjolnic.github.io/bootstrap-popover-picker/)

## Instantiation

You can call the plugin in several ways:

```javascript
// Create instance if not exists (returns a jQuery object)
$('.my').picker();
$('.my').picker({ /*options*/ }); // you can also specify options via data-* attributes

// For the first matched element, access to a plugin property value
$('.my').data('picker').pickerProperty;

// For the first matched element, call a plugin instance method with the given args
$('.my').data('picker').pickerMethod('methodArg1', 'methodArg2' /* , other args */);

// Call and apply a plugin method to EACH matched element.
$.picker.batch('.my', 'pickerMethod', 'methodArg1', 'methodArg2' /* , other args */); ->
```

## Triggered Events

All of them exposes the plugin instance through event.pickerInstance

In order of call:

* pickerCreate
* pickerCreated
* pickerShow
* pickerShown
* pickerSelect (also exposes event.pickerItem and event.pickerValue)
* pickerUpdate
* pickerInvalid (also exposes event.pickerValue)
* pickerSetValue (also exposes event.pickerValue)
* pickerSetSourceValue (also exposes event.pickerValue)
* pickerUpdated
* pickerSelected (also exposes event.pickerItem and event.pickerValue)
* pickerHide
* pickerHidden
* pickerDestroy
* pickerDestroyed

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


Note: The position plugin is embedded with the picker plugin, but uses a different
namespace: `$.fn.pos`, for avoiding other plugin issues.

## To-Do
- [x] Fix extra placements: rightTop, rightBottom, leftBottom and leftTop
- [x] Implement inline mode
- [x] Implement optional accept/cancel buttons
- [x] Hide on blur input, but not if the blur is caused because we clicked the popover
- [x] Fix css: soft lines showing under popover arrows
- [x] Auto placement when popover offsets the window (also due to scroll)
- [x] Container: Fix placements when container is different from the element parent
- [x] Implement component mode (if present, the trigger must be the component and not the input)
- [x] Fix arrow positions for all new placements
- [x] Detach popover HTML from DOM when destroy is called
- [x] Fix: has-error is not set in component mode
- [x] Max rows (limit popover height)
- [x] Filtered search (input accepts regular expressions)
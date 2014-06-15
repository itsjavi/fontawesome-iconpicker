bootstrap-popover-picker
========================

Generic jQuery plugin template for building pickers using Bootstrap popovers,
fully customizable with a powerful base API.

## Popover placement extensions

This plugin extends Popover adding new placement options to the existing ones,
so all the possibilities are:

* top, right, bottom, left
* topRight, bottomRight, bottomLeft, topLeft
* rightTop, rightBottom, leftBottom, leftTop

## Instantiation

You can call the plugin in several ways:

```javascript
    // Create instance if not exists (returns a jQuery object)
    $('.my').picker();
    $('.my').picker({ /*options*/ });
    
    // For the first matched element, return a plugin property value
    $('.my').picker('pickerProperty');

    // For the first matched element, call a plugin method with the given args and return the value
    $('.my').picker('pickerMethod', 'methodArg1', 'methodArg2' /* , other args */);
    
    // Call and apply a plugin method to EACH matched element. Returns a jQuery object.
    $('.my').picker(true, 'pickerMethod', methodArg1, ...); ->
```

## Triggered Events

All of them exposes the plugin instance through event.picker

In order of call:

* pickerCreate
* pickerPick (also exposes event.pickerItem and event.pickerValue)
* pickerUpdating
* pickerChange (also exposes event.pickerValue)
* pickerUpdated
* pickerDestroy

## To-Do
- [ ] Implement inline mode
- [ ] Implement optional accept/cancel buttons
- [ ] Hide on blur input, but not if the blur is caused because we clicked the popover
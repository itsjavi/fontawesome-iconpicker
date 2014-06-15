/*!
 * Bootstrap Popover Picker
 * http://mjolnic.github.io/bootstrap-popover-picker/
 *
 * Originally written by (c) 2012 Stefan Petre
 * Licensed under the Apache License v2.0
 * https://github.com/mjolnic/bootstrap-popover-picker/blob/master/LICENSE
 *
 */

(function(factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (window.jQuery && !window.jQuery.fn.picker) {
        factory(window.jQuery);
    }
}
(function($) {
    'use strict';
    // List of valid items
    var defaultSelectableItems = [
        'angle-double-down', 'angle-double-left', 'angle-double-right', 'angle-double-up',
        'angle-down', 'angle-left', 'angle-right', 'angle-up'
    ];
    var defaults = {
        // popover options:
        placement: 'bottomRight', // WIP (has some issues with auto and CSS). auto, top, bottom, left, right
        title: false, // Popover title (optional) only if specified in the template
        animation: true,
        // plugin options:
        selected: false, // use this value as the current item and ignore the original
        defaultValue: false, // use this value as the current item if input or element item is empty
        onlyValid: true, // Restrict setSourceValue to the selectableItems values. If it is not valid, the value won't change
        input: 'input', // children input selector
        hideOnPick: false,
        displayButtons: false,
        selectedCustomClass: 'bg-primary', // Appends this class when to the selected item
        selectableItems: false, // false or array. If is not false or empty array, it will be used instead of defaultSelectableItems

        // Not implemented yet or incomplete:
        inline: false, // WIP. displays the picker as an inline element
        component: '.input-group-addon', // children component jQuery selector or object, relative to the parent element
        container: false, // WIP.  Appends the popover to a specific element. If true, appends to the jQuery element.
        autoPlacement: true, // WIP (bugy). If true, the popover will be repositioned to another position when collapses with the window borders
        //
        // Plugin templates:
        templates: {
            picker: '<div class="picker"><div class="picker-items"></div></div>',
            item: '<div class="picker-item"><i class="fa"></i></div>',
            buttons: '<div class="picker-buttons">' +
                    '<button class="picker-button picker-button-cancel btn btn-default btn-sm">Cancel</button>' +
                    '<button class="picker-button picker-button-accept btn btn-primary btn-sm">Accept</button></div>',
            popover: '<div class="popover picker-popover"><div class="arrow"></div>' +
                    '<div class="popover-title"></div><div class="popover-content"></div></div>'
        }
    };

    var _idCounter = 0;

    var Picker = function(element, options) {
        this._id = _idCounter++;
        this.element = $(element).addClass('picker-element');
        this.options = $.extend(true, {}, defaults, this.element.data(), options);
        this.selectableItems = this.options.selectableItems;

        if ((!$.isArray(this.selectableItems)) || (this.selectableItems.length === 0)) {
            this.selectableItems = defaultSelectableItems;
        }

        // Plugin as component
        this.component = this.options.component;
        this.component = ((this.component !== false) ? this.element.parent().find(this.component) : false);

        if (((this.component !== false) && (this.component.length === 0)) || (!this.component)) {
            this.component = false;
        }else{
            this.component.addClass('picker-component');
        }

        // Plugin container
        this.container = (this.options.container === true) ? this.element : this.options.container;
        this.container = (this.container !== false) ? $(this.container) : false;

        if (((this.container !== false) && (this.container.length === 0)) || (!this.container)) {
            this.container = false;
        }else{
            this.container.addClass('picker-container');
        }

        // Is the element an input? Should we search inside for any input?
        this.input = this.element.is('input') ? this.element : (this.options.input ?
                this.element.find(this.options.input) : false);

        if (((this.input !== false) && (this.input.length === 0)) || (!this.input)) {
            this.input = false;
        }else{
            this.input.addClass('picker-input');
        }
        
        this.originalPlacement = this.options.placement;

        // Create picker HTML and sliders info
        this._createPicker();

        // Create popover HTML and events
        this._createPopover();

        // Bind mouse events
        this._bindEvents();

        this._trigger('pickerCreate');

        // Refresh everything
        $($.proxy(function() {
            this.update(this.options.selected);
        }, this));
    };

    Picker.prototype = {
        constructor: Picker,
        options: {},
        _id: 0, // instance identifier for bind/unbind events
        _trigger: function(name, opts) {
            //triggers an event bound to the element
            opts = opts || {};
            this.element.trigger($.extend({
                type: name,
                picker: this
            }, opts));
            //console.log(name + ' triggered for instance #' + this._id);
        },
        _error: function(text) {
            throw "Bootstrap Popover Picker Exception: " + text;
        },
        _createPopover: function() {
            var _self = this;
            var _isCustom = this._hasCustomPlacement();
            this.popover = this.element.popover({
                'title': this.options.title,
                'placement': (!_isCustom ? this.options.placement : 'picker-placement'),
                'container': this.element.parent(),
                'animation': (!_isCustom ? this.options.animation : false),
                'template': this.options.templates.popover,
                'content': this.picker.element,
                'html': true,
                'trigger': 'manual'
            }).on('focus.picker', function() {
                $(this).popover('show');
            }).on('show.bs.popover.picker', function(e) {
                if (_isCustom && _self.popover.$tip) {
                    // hide original popover placement cause
                    // we want to use our custom placement method
                    _self.popover.$tip.css('opacity', 0);
                } else {
                    _self._trigger('pickerShow');
                }
                _self.update();
            }).on('shown.bs.popover.picker', function(e) {
                if (_isCustom && _self.popover.$tip) {
                    // custom placement method
                    _self._showCustomPopover();
                } else {
                    _self._trigger('pickerShown');
                }
            }).data('bs.popover');

            return this.popover;
        },
        _createPicker: function(customProps) {
            customProps = customProps ||  {};

            var _self = this,
                    _picker = $(this.options.templates.picker);

            this.picker = {
                element: _picker
                        // other properties, jQuery objects, ...
            };

            var itemClickFn = function(e) {
                var $this = $(this);
                if ($this.is('.fa')) {
                    $this = $this.parent();
                }
                _self.update($this.data('pickerValue'));
                _self._trigger('pickerSelect', {
                    pickerItem: this,
                    pickerValue: _self.pickerValue
                });
                if (!_self.options.displayButtons) {
                    _self._trigger('pickerSelectAccepted', {
                        pickerItem: _self.picker.element.find('.picker-selected').get(0),
                        pickerValue: _self.pickerValue
                    });
                }
                if (_self.options.hideOnPick && (_self.getAcceptButton().length === 0)) {
                    // only hide when the accept button is not present
                    _self.hide();
                }
            };

            for (var i in this.selectableItems) {
                var itemElement = $(this.options.templates.item);
                itemElement.find('.fa').addClass('fa-' + this.selectableItems[i]);
                itemElement.data('pickerValue', this.selectableItems[i])
                        .on('click.picker', itemClickFn);
                this.picker.element.find('.picker-items').append(itemElement
                        .attr('title', '.' + this.getValue(this.selectableItems[i])));
            }

            if (this.options.displayButtons) {
                this.picker.element.append($(this.options.templates.buttons));
                this.getAcceptButton().on('click', function() {
                    _self.update(_self.pickerValue, true);

                    _self._trigger('pickerSelectAccepted', {
                        pickerItem: _self.picker.element.find('.picker-selected').get(0),
                        pickerValue: _self.pickerValue
                    });

                    _self.hide();
                });
                this.getCancelButton().on('click', function() {
                    _self.hide();
                });
            }

            this.picker = $.extend(true, this.picker, customProps);
        },
        _bindEvents: function() {
            // Hide only when clicking outside
            if (this.options.inline === false) {
                var _self = this;
                var wasDragging = false;
                var isDragging = false;
                var wasClickingInput = false;

                var isInsideFn = $.proxy(function(e) {
                    var _t = $(e.target);
                    if ((!_t.hasClass('picker-element')  ||
                            (_t.hasClass('picker-element') && !_t.is(this.element))) &&
                            (_t.parents('.picker-popover').length === 0)) {
                        return false;
                    }
                    return true;
                }, this);

                var hideFn = $.proxy(function(e) {
                    if (!isInsideFn(e)) {
                        this.hide();
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                }, this);

                var $doc = $(window.document);

                // Add a namespace to the document events so they can be identified
                // later for every instance separately
                var _eventNs = '.picker.inst' + this._id;

                // This events makes the picker to hide only if a click has been
                // triggered outside the popover or the element,
                // but it cancels if the user was dragging

                $doc.on('mousedown' + _eventNs, function(e) {
                    $doc.on('mousemove' + _eventNs, function(e) {
                        isDragging = true;
                        $doc.unbind('mousemove' + _eventNs);
                    });
                });
                $doc.on('mouseup' + _eventNs, function(e) {
                    wasDragging = (isDragging === true);
                    isDragging = false;
                    $doc.unbind('mousemove' + _eventNs);
                    if (!wasDragging) {
                        hideFn(e);
                    }
                });
                $doc.on('click.picker' + _eventNs, function(e) {
                    isDragging = false;
                    $doc.unbind('mousemove' + _eventNs);
                    if (!wasDragging) {
                        hideFn(e);
                    }
                });

                $(window).on('resize.picker' + _eventNs + ' orientationchange.picker' + _eventNs, function(e) {
                    // reposition popover
                    _self.setCustomPlacement();
                });

                if (this.hasInput()) {
                    // Bind input keyup event
                    this.input.on('keyup.picker', function(e) {
                        _self._updateFormGroupStatus(_self.getValid(this.value) !== false);
                        if ($.inArray(e.keyCode, [38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86]) === -1) {
                            _self.update();
                        }
                        _self.hide();
                    });

                    // On lose focus with tab, hide picker, but only if
                    // the click is was in the own popover
                    this.input.on('click.picker');
                }
            }
        },
        _unbindEvents: function(){
            this.element.off('.picker');
            this.element.off('.picker');

            if (this.hasInput()) {
                this.input.off('.picker');
            }

            if (this.hasComponent()) {
                this.component.off('.picker');
            }

            if (this.hasContainer()) {
                this.container.off('.picker');
            }

            // destroy window and window.document bound events
            $(window).off('.picker.inst' + this._id);
            $(window.document).off('.picker.inst' + this._id);
        },
        _hasCustomPlacement: function() {
            return ($.inArray(this.options.placement, ['top', 'right', 'bottom', 'left', 'auto']) === -1);
        },
        _showCustomPopover: function() {
            //this.popover.$tip.css({top: 0, left: 0});
            this._trigger('pickerShow');
            this.popover.$tip.removeClass('in');
            this.setCustomPlacement();
            this._trigger('pickerShown');
            this.popover.$tip.addClass((this.options.animation ? 'fade ' : '') + 'in')
                    .css({
                        opacity: ''
                    }); // remove opacity hack
        },
        setCustomPlacement: function(placement, detectCollisions) {
            placement = placement || this.options.placement;
            detectCollisions = (detectCollisions===false ? false : true);
            var pos, relPos, relOffset, actualWidth, actualHeight, tp = false;
            // reset placement classes
            this.popover.$tip.removeClass('bottom top left right picker-placement-topLeft ' +
                    'picker-placement-topRight picker-placement-rightTop picker-placement-rightBottom ' +
                    'picker-placement-bottomRight picker-placement-bottomLeft picker-placement-leftBottom ' +
                    'picker-placement-leftTop');

            relPos = this.popover.$element.position();
            relOffset = this.popover.$element.offset();

            this.popover.$tip.css('maxWidth', $(window).width() - relOffset.left - 5);

            pos = this.popover.getPosition(/in/.test(placement));
            actualWidth = this.popover.$tip[0].offsetWidth;
            actualHeight = this.popover.$tip[0].offsetHeight;

            //console.log(relPos);
            //console.log(relOffset);

            switch (placement) {
                /*
                 * Understanding the positions relative to rhe element:
                 *
                 *      - 1 -- 2 -
                 *      8        3
                 *      |        |
                 *      7        4
                 *      - 6 -- 5 -
                 *
                 *      1 - topLeft
                 *      2 - topRight
                 *      3 - rightTop
                 *      4 - rightBottom
                 *      5 - bottomRight
                 *      6 - bottomLeft
                 *      7 - leftBottom
                 *      8 - leftTop
                 */
                case 'topLeft':
                    tp = {
                        top: ((actualHeight - pos.height) + relPos.top - 5) * -1,
                        right: 'auto',
                        bottom: 'auto',
                        left: relPos.left
                    };
                    break;
                case 'topRight':
                    tp = {
                        top: ((actualHeight - pos.height) + relPos.top - 5) * -1,
                        right: -relPos.left,
                        bottom: 'auto',
                        left: 'auto'
                    };
                    break;

                case 'rightTop':
                    tp = {
                        top: pos.top - (actualHeight * .25),
                        right: 'auto',
                        bottom: 'auto',
                        left: pos.width
                    };
                    break;
                case 'rightBottom':
                    tp = {
                        top: pos.height - (actualHeight * .25),
                        right: 'auto',
                        bottom: 'auto',
                        left: pos.left
                    };
                    break;

                case 'bottomRight':
                    tp = {
                        top: pos.height + relPos.top,
                        right: -relPos.left,
                        bottom: 'auto',
                        left: 'auto'
                    };
                    break;

                case 'bottomLeft':
                    tp = {
                        top: pos.height + relPos.top,
                        right: 'auto',
                        bottom: 'auto',
                        left: relPos.left
                    };
                    break;

                case 'leftBottom':
                    tp = {
                        top: pos.height - (actualHeight * .25),
                        right: pos.left,
                        bottom: 'auto',
                        left: 'auto'
                    };
                    break;

                case 'leftTop':
                    tp = {
                        top: pos.top - (actualHeight * .25),
                        right: 'auto',
                        bottom: 'auto',
                        left: pos.left
                    };
                    break;

            }
            if (tp !== false) {
                this.options.placement = placement;
                this.popover.$tip.css(tp).addClass('picker-placement-' + placement);
                /*if (this.options.autoPlacement && detectCollisions) {
                    setTimeout($.proxy(function(){
                        this.detectCollisions(placement);
                    }, this), 200);
                }*/ // WIP, still buggy
                return true;
            } else {
                this.popover.$tip.addClass('picker-placement-' + this.options.placement);
            }
            return false;
        },
        detectCollisions: function(currentPlacement) { // WIP, still buggy
            var verticalSwitchers = {
                'topLeft': 'bottomLeft',
                'topRight': 'bottomRight',
                'rightTop': 'rightBottom',
                'rightBottom': 'rightTop',
                'bottomRight': 'topRight',
                'bottomLeft': 'topLeft',
                'leftBottom': 'leftTop',
                'leftTop': 'leftBottom'
            },
            horizontalSwitchers = {
                'topLeft': 'topRight',
                'topRight': 'topLeft',
                'rightTop': 'leftTop',
                'rightBottom': 'leftBottom',
                'bottomRight': 'bottomLeft',
                'bottomLeft': 'bottomRight',
                'leftBottom': 'rightBottom',
                'leftTop': 'rightTop'
            },
            ww = $(window).width(),
                    wh = $(window).height(),
                    o =  this.popover.$tip.offset(),
                    pw = this.popover.$tip[0].offsetWidth,
                    ph = this.popover.$tip[0].offsetHeight;
            //console.log(o);
            console.log(o.top - ph, +' '+wh);
            if ((o.top - ph) < 0) { // exceeds top
                console.log('set esceed');
                return this.setCustomPlacement(verticalSwitchers[currentPlacement], false);
            }
            
            if((this.originalPlacement!=null) && (this.originalPlacement != this.options.placement)){
                console.log('set prev');
                return this.setCustomPlacement(this.originalPlacement, false);
            }
        },
        _updateComponents: function() {
            // Update selected item
            this.picker.element.find('.picker-item.picker-selected')
                    .removeClass('picker-selected ' + this.options.selectedCustomClass);
            this.picker.element.find('.fa.fa-' + this.pickerValue).parent()
                    .addClass('picker-selected ' + this.options.selectedCustomClass);

            // Update component item
            if (this.hasComponent()) {
                var icn = this.component.find('i');
                if (icn.length > 0) {
                    icn.attr('class','fa fa-fw '+this.getValue());
                } else {
                    this.component.html(this.getValueHtml());
                }
            }

        },
        _updateFormGroupStatus: function(isValid) {
            if (this.hasInput()) {
                if (isValid !== false) {
                    // Remove form-group error class if any
                    this.input.parent('.form-group').removeClass('has-error');
                } else {
                    this.input.parent('.form-group').addClass('has-error');
                }
                return true;
            }
            return false;
        },
        /**
         * Returns a trimmed and sanitized string without the 'fa-' prefix
         * @param String|mixed val
         * @returns String
         */
        _sanitizeValue: function(val) {
            if (((typeof val === 'string') || (val instanceof String)) === false) {
                val = '';
            }
            return $.trim(val.replace('fa-', ''));
        },
        getValid: function(val) {
            // here we must validate the value (you may change this validation
            // to suit your needs
            val = this._sanitizeValue(val);
            if (($.inArray(val, this.selectableItems) !== -1) || (!this.options.onlyValid)) {
                return val;
            }
            return false;
        },
        /**
         * Sets the internal item value and updates everything, excepting the input or element.
         * For doing so, call setSourceValue() or update() instead
         */
        setValue: function(val) {
            // sanitize first
            var _val = this.getValid(val);
            if (_val !== false) {
                this.pickerValue = _val;
                this._updateComponents();
                this._updateFormGroupStatus(true);
                this._trigger('pickerSetValue', {
                    pickerValue: _val
                });
                return this.pickerValue;
            } else {
                this._updateFormGroupStatus(false);
                this._trigger('pickerInvalid', {
                    pickerValue: val
                });
                return false;
            }
        },
        /**
         * Returns the formatted item value
         * @returns string
         */
        getValue: function(val) {
            return 'fa-' + (val ? val : this.pickerValue);
        },
        getValueHtml: function() {
            return '<i class="fa ' + this.getValue() + '"></i>';
        },
        /**
         * Calls setValue and if it's a valid item value, sets the input or element value
         */
        setSourceValue: function(val) {
            val = this.setValue(val);
            if (val !== false) {
                if (this.hasInput()) {
                    this.input.val(this.getValue());
                } else {
                    this.element.data('pickerValue', this.getValue());
                }
                this._trigger('pickerSetSourceValue', {
                    pickerValue: val
                });
            }
            return val;
        },
        /**
         * Returns the input or element item value, without formatting, or defaultValue
         * if it's empty string, undefined, false or null
         * @param {type} defaultValue
         * @returns string|mixed
         */
        getSourceValue: function(defaultValue) {
            // returns the input or element value, as string
            defaultValue = defaultValue || this.options.defaultValue;
            var val = defaultValue;

            if (this.hasInput()) {
                val = this.input.val();
            } else {
                val = this.element.data('pickerValue');
            }
            if ((val === undefined) || (val === '') || (val === null) || (val === false)) {
                // if not defined or empty, return default
                val = defaultValue;
            }
            return val;
        },
        hasInput: function() {
            return (this.input !== false);
        },
        hasComponent: function() {
            return (this.component !== false);
        },
        hasContainer: function() {
            return (this.container !== false);
        },
        getAcceptButton: function() {
            return this.picker.element.find('.picker-button-accept');
        },
        getCancelButton: function() {
            return this.picker.element.find('.picker-button-cancel');
        },
        isDisabled: function() {
            if (this.hasInput()) {
                return (this.input.prop('disabled') === true);
            }
            return false;
        },
        show: function() {
            $($.proxy(function() {
                this.element.popover('show');
            }, this));
        },
        hide: function() {
            this._trigger('pickerHide');
            this.element.popover('hide');
        },
        update: function(val, isAccepted) {
            val = (val ? val :  this.getSourceValue(this.pickerValue));
            // reads the input or element value again and tries to update the plugin
            // fallback to the current selected item value
            this._trigger('pickerUpdate');

            if ((this.getAcceptButton().length === 0) || (isAccepted === true)) {
                this.setSourceValue(val);
            } else {
                this.setValue(val);
            }

            this._trigger('pickerUpdated');
            return val;
        },
        destroy: function() {
            // unbinds events and resets everything to the initial state,
            // including component mode
            this.element.removeData('picker').removeData('pickerValue').removeClass('picker-element');
            this.element.popover('destroy');

            this._unbindEvents();

            this._trigger('pickerDestroy');
        },
        disable: function() {
            if (this.hasInput()) {
                this.input.prop('disabled', true);
                return true;
            }
            return false;
        },
        enable: function() {
            if (this.hasInput()) {
                this.input.prop('disabled', false);
                return true;
            }
            return false;
        }
    };

    $.picker = Picker;

    // jQuery plugin
    $.fn.picker = function(option) {
        var apiArgs = arguments;
        var apiOption = option;

        if (option === true) {
            apiArgs = Array.prototype.slice.call(apiArgs, 1);
            apiOption = (apiArgs.length > 0 ? apiArgs[0] : false);
        }

        if ((option !== true) && (typeof option !== 'string')) { // new instances of not exist
            return this.each(function() {
                var $this = $(this);
                if ((!$this.data('picker')) && (typeof option !== 'string')) {
                    // create plugin and expose entire picker API
                    $this.data('picker', new Picker(this, ((typeof option === 'object') ? option : {})));
                }
            });
        } else if ((typeof apiOption === 'string') || (option === true)) { // api method or property
            var apiArgs = Array.prototype.slice.call(apiArgs, 1);

            if (!(typeof apiOption === 'string') || (apiOption === '')) {
                return (option === true ? this : false);
            }

            if (option === true) {
                // apply method to each element
                return this.each(function() {
                    var pInst = $(this).data('picker');
                    if (pInst) {
                        pInst[apiOption].apply(pInst, apiArgs);
                    }
                });
            }
            // apply method or return property value for the first element
            var pInst = this.data('picker');
            if (pInst) {
                var opt = pInst[apiOption];
                if (!!(opt && opt.constructor && opt.call && opt.apply)) {
                    return opt.apply(pInst, apiArgs);
                } else {
                    return opt;
                }
            }
        }
    };
}));

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
        maxRows: 6, // if it's exceeded, there will be vertical overflow. this DOES change css.
        // numCols: this is only orientative for calculating the maxRows overflow. changing this value does no change any CSS.
        // if you want to have another number of cols, regenerate picker.less file changing the @num_cols variable in variables.less
        numCols: 4,
        itemOuterHeight: 62, // this is only for calculation maxRows overflow. this should change suiting your CSS.
        //
        title: false, // Popover title (optional) only if specified in the template
        selected: false, // use this value as the current item and ignore the original
        defaultValue: false, // use this value as the current item if input or element item is empty
        placement: 'bottom', // WIP (has some issues with auto and CSS). auto, top, bottom, left, right
        collision: 'none', // If true, the popover will be repositioned to another position when collapses with the window borders
        animation: true,
        //hide picker automatically when a value is picked. it is ignored if mustAccept is not false and the accept button is visible
        hideOnSelect: false,
        showFooter: false,
        searchInFooter: false, // If true, the search will be added to the footer instead of the title
        mustAccept: false, // only applicable when there's an picker-btn-accept button in the popover footer
        selectedCustomClass: 'bg-primary', // Appends this class when to the selected item
        selectableItems: false, // false or array. If is not false or empty array, it will be used instead of defaultSelectableItems
        input: 'input', // children input selector
        component: '.input-group-addon', // children component jQuery selector or object, relative to the parent element
        container: false, // WIP.  Appends the popover to a specific element. If true, appends to the jQuery element.
        // Plugin templates:
        templates: {
            popover: '<div class="picker-popover popover"><div class="arrow"></div>' +
                    '<div class="popover-title"></div><div class="popover-content"></div></div>',
            footer: '<div class="popover-footer"></div>',
            buttons: '<button class="picker-btn picker-btn-cancel btn btn-default btn-sm">Cancel</button>' +
                    ' <button class="picker-btn picker-btn-accept btn btn-primary btn-sm">Accept</button>',
            search: '<input type="search" class="form-control picker-search" placeholder="Type to filter" />',
            picker: '<div class="picker"><div class="picker-items"></div></div>',
            pickerItem: '<div class="picker-item"><i class="fa"></i></div>',
        }
    };

    var _idCounter = 0;

    var _helpers = {
        isEmpty: function(val) {
            return ((val === false) || (val === '') || (val === null) || (val === undefined));
        },
        isEmptyObject: function(val) {
            return (this.isEmpty(val) === true) || (val.length === 0);
        },
        isElement: function(selector) {
            return ($(selector).length > 0);
        },
        isString: function(val) {
            return ((typeof val === 'string') || (val instanceof String));
        },
        isArray: function(val) {
            return $.isArray(val);
        },
        inArray: function(val, arr) {
            return ($.inArray(val, arr) !== -1);
        },
        throwError: function(text) {
            throw "Bootstrap Popover Picker Exception: " + text;
        }
    };

    var Picker = function(element, options) {
        this._id = _idCounter++;
        this.element = $(element).addClass('picker-element');
        this._trigger('pickerCreate');
        this.options = $.extend(true, {}, defaults, this.element.data(), options);
        this.options.originalPlacement = this.options.placement;

        if ((!$.isArray(this.options.selectableItems)) || (this.options.selectableItems.length === 0)) {
            this.options.selectableItems = defaultSelectableItems;
        }

        // Picker container element
        this.container = (_helpers.isElement(this.options.container) ? $(this.options.container) : false);
        if (this.container === false) {
            this.container = (this.element.is('input') ? this.element.parent() : this.element);
        }
        if (this.container.addClass('picker-container').is('.dropdown-menu')) {
            this.options.placement = 'inline';
        }

        // Is the element an input? Should we search inside for any input?     
        this.input = (this.element.is('input') ? this.element.addClass('picker-input') : false);
        if (this.input === false) {
            this.input = (this.container.find(this.options.input));
        }

        // Plugin as component ?
        this.component = this.container.find(this.options.component).addClass('picker-component');
        if (this.component.length === 0) {
            this.component = false;
        }

        // Create popover and picker HTML
        this._createPopover();
        this._createPicker();

        if (this.getAcceptButton().length === 0) {
            // disable this because we don't have accept buttons
            this.options.mustAccept = false;
        }

        // Avoid CSS issues with input-group-addon(s)
        if (this.container.is('.input-group')) {
            this.container.parent().append(this.popover);
        } else {
            this.container.append(this.popover);
        }

        this._calcOverflow();

        // Bind events
        this._bindElementEvents();
        this._bindWindowEvents();

        // Refresh everything
        this.update(this.options.selected);

        if (this.isInline()) {
            this.show();
        }

        this._trigger('pickerCreated');
    };

    Picker.pos = $.pos;
    Picker.batch = function(selector, method) {
        var args = Array.prototype.slice.call(arguments, 2);
        return $(selector).each(function() {
            var $inst = $(this).data('picker');
            if (!!$inst) {
                $inst[method].apply($inst, args);
            }
        });
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
                pickerInstance: this
            }, opts));
            //console.log(name + ' triggered for instance #' + this._id);
        },
        _createPopover: function() {
            this.popover = $(this.options.templates.popover);

            // title (header)
            var _title = this.popover.find('.popover-title');
            if (!!this.options.title) {
                _title.append($('<div class="popover-title-text">' + this.options.title + '</div>'));
            }
            if (!this.options.searchInFooter && !_helpers.isEmpty(this.options.templates.buttons)) {
                _title.append(this.options.templates.search);
            } else if (!this.options.title) {
                _title.remove();
            }

            // footer
            if (this.options.showFooter && !_helpers.isEmpty(this.options.templates.footer)) {
                var _footer = $(this.options.templates.footer);
                if (!_helpers.isEmpty(this.options.templates.search) && this.options.searchInFooter) {
                    _footer.append($(this.options.templates.search));
                }
                if (!_helpers.isEmpty(this.options.templates.buttons)) {
                    _footer.append($(this.options.templates.buttons));
                }
                this.popover.append(_footer);
            }

            if (this.options.animation === true) {
                this.popover.addClass('fade');
            }

            return this.popover;
        },
        _calcOverflow: function() {
            if (this.options.maxRows > 0) {
                var ln = this.options.selectableItems.length;
                if ((ln / this.options.numCols) > this.options.maxRows) {
                    this.popover.addClass('picker-has-overflow');
                    this.picker.find('.picker-items').css({
                        'overflow-y': 'auto',
                        'maxHeight': (this.options.maxRows * this.options.itemOuterHeight) + 'px'
                    });
                }
            }
        },
        _createPicker: function(popover) {
            var _self = this;
            this.picker = $(this.options.templates.picker);

            var itemClickFn = function(e) {
                var $this = $(this);
                if ($this.is('.fa')) {
                    $this = $this.parent();
                }

                _self._trigger('pickerSelect', {
                    pickerItem: $this,
                    pickerValue: _self.pickerValue
                });

                if (_self.options.mustAccept === false) {
                    _self.update($this.data('pickerValue'));
                    _self._trigger('pickerSelected', {
                        pickerItem: this,
                        pickerValue: _self.pickerValue
                    });
                } else {
                    _self.update($this.data('pickerValue'), true);
                }

                if (_self.options.hideOnSelect && (_self.options.mustAccept === false)) {
                    // only hide when the accept button is not present
                    _self.hide();
                }
            };

            for (var i in this.options.selectableItems) {
                var itemElement = $(this.options.templates.pickerItem);
                itemElement.find('.fa').addClass('fa-' + this.options.selectableItems[i]);
                itemElement.data('pickerValue', this.options.selectableItems[i])
                        .on('click.picker', itemClickFn);
                this.picker.find('.picker-items').append(itemElement
                        .attr('title', '.' + this.getValue(this.options.selectableItems[i])));
            }

            this.popover.find('.popover-content').append(this.picker);

            return this.picker;
        },
        _isEventInsidePicker: function(e) {
            var _t = $(e.target);
            if ((!_t.hasClass('picker-element')  ||
                    (_t.hasClass('picker-element') && !_t.is(this.element))) &&
                    (_t.parents('.picker-popover').length === 0)) {
                return false;
            }
            return true;
        },
        _bindElementEvents: function() {
            var _self = this;

            this.getSearchInput().on('keyup', function() {
                _self.filter($(this).val().toLowerCase());
            });

            this.getAcceptButton().on('click.picker', function() {
                var _picked = _self.picker.find('.picker-selected').get(0);

                _self.update(_self.pickerValue);

                _self._trigger('pickerSelected', {
                    pickerItem: _picked,
                    pickerValue: _self.pickerValue
                });
                if (!_self.isInline()) {
                    _self.hide();
                }
            });
            this.getCancelButton().on('click.picker', function() {
                if (!_self.isInline()) {
                    _self.hide();
                }
            });

            this.element.on('focus.picker', function(e) {
                _self.show();
                e.stopPropagation();
            });

            if (this.hasComponent()) {
                this.component.on('click.picker', function() {
                    _self.toggle();
                });
            }

            if (this.hasInput()) {
                // Bind input keyup event
                this.input.on('keyup.picker', function(e) {
                    if (!_helpers.inArray(e.keyCode, [38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86])) {
                        _self.update();
                    } else {
                        _self._updateFormGroupStatus(_self.getValid(this.value) !== false);
                    }
                    //_self.hide();
                });
            }

        },
        _bindWindowEvents: function() {
            var $doc = $(window.document);
            var _self = this;

            // Add a namespace to the document events so they can be identified
            // later for every instance separately
            var _eventNs = '.picker.inst' + this._id;

            $(window).on('resize.picker' + _eventNs + ' orientationchange.picker' + _eventNs, function(e) {
                // reposition popover
                if (_self.popover.hasClass('in')) {
                    _self.updatePlacement();
                }
            });

            if (!_self.isInline()) {
                $doc.on('mouseup' + _eventNs, function(e) {
                    if (!_self._isEventInsidePicker(e) && !_self.isInline()) {
                        _self.hide();
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    return false;
                });
            }

            return false;
        },
        _unbindElementEvents: function() {
            this.popover.off('.picker');
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
        },
        _unbindWindowEvents: function() {
            // destroy window and window.document bound events
            $(window).off('.picker.inst' + this._id);
            $(window.document).off('.picker.inst' + this._id);
        },
        updatePlacement: function(placement, collision) {
            placement = placement || this.options.placement;
            this.options.placement = placement; // set new placement
            collision = collision || this.options.collision;
            collision = (collision === true ? 'flip' : collision);

            var _pos = {
                // at: Defines which position (or side) on container element to align the
                // popover element against: "horizontal vertical" alignment.
                at: "right bottom",
                // my: Defines which position (or side) on the popover being positioned to align
                // with the container element: "horizontal vertical" alignment
                my: "right top",
                // of: Which element to position against.
                of: this.hasInput() ? this.input : this.container,
                // collision: When the positioned element overflows the window (or within element) 
                // in some direction, move it to an alternative position.
                collision: (collision === true ? 'flip' : collision),
                // within: Element to position within, affecting collision detection.
                within: window
            };

            // remove previous classes
            this.popover.removeClass('inline topLeftCorner topLeft top topRight topRightCorner ' +
                    'rightTop right rightBottom bottomRight bottomRightCorner ' +
                    'bottom bottomLeft bottomLeftCorner leftBottom left leftTop');

            if (typeof placement === 'object') {
                // custom position ?
                return this.popover.pos($.extend({}, _pos, placement));
            }

            switch (placement) {
                case 'inline':
                    {
                        _pos = false;
                    }
                    break;
                case 'topLeftCorner':
                    {
                        _pos.my = 'right bottom';
                        _pos.at = 'left top';
                    }
                    break;

                case 'topLeft':
                    {
                        _pos.my = 'left bottom';
                        _pos.at = 'left top';
                    }
                    break;

                case 'top':
                    {
                        _pos.my = 'center bottom';
                        _pos.at = 'center top';
                    }
                    break;

                case 'topRight':
                    {
                        _pos.my = 'right bottom';
                        _pos.at = 'right top';
                    }
                    break;

                case 'topRightCorner':
                    {
                        _pos.my = 'left bottom';
                        _pos.at = 'right top';
                    }
                    break;

                case 'rightTop':
                    {
                        _pos.my = 'left bottom';
                        _pos.at = 'right center';
                    }
                    break;

                case 'right':
                    {
                        _pos.my = 'left center';
                        _pos.at = 'right center';
                    }
                    break;

                case 'rightBottom':
                    {
                        _pos.my = 'left top';
                        _pos.at = 'right center';
                    }
                    break;

                case 'bottomRightCorner':
                    {
                        _pos.my = 'left top';
                        _pos.at = 'right bottom';
                    }
                    break;

                case 'bottomRight':
                    {
                        _pos.my = 'right top';
                        _pos.at = 'right bottom';
                    }
                    break;
                case 'bottom':
                    {
                        _pos.my = 'center top';
                        _pos.at = 'center bottom';
                    }
                    break;

                case 'bottomLeft':
                    {
                        _pos.my = 'left top';
                        _pos.at = 'left bottom';
                    }
                    break;

                case 'bottomLeftCorner':
                    {
                        _pos.my = 'right top';
                        _pos.at = 'left bottom';
                    }
                    break;

                case 'leftBottom':
                    {
                        _pos.my = 'right top';
                        _pos.at = 'left center';
                    }
                    break;

                case 'left':
                    {
                        _pos.my = 'right center';
                        _pos.at = 'left center';
                    }
                    break;

                case 'leftTop':
                    {
                        _pos.my = 'right bottom';
                        _pos.at = 'left center';
                    }
                    break;

                default:
                    {
                        return false;
                    }
                    break;

            }

            this.popover.css({
                'display': (this.options.placement === 'inline') ? '' : 'block'
            });

            if (_pos !== false) {
                this.popover.pos(_pos).css('maxWidth', $(window).width() - this.container.offset().left - 5);
            } else {
                //reset position
                this.popover.css({
                    'top': 'auto',
                    'right': 'auto',
                    'bottom': 'auto',
                    'left': 'auto',
                    'maxWidth': 'none'
                });
            }
            this.popover.addClass(this.options.placement);

            return true;
        },
        _updateComponents: function() {
            // Update selected item
            this.picker.find('.picker-item.picker-selected')
                    .removeClass('picker-selected ' + this.options.selectedCustomClass);
            this.picker.find('.fa.fa-' + this.pickerValue).parent()
                    .addClass('picker-selected ' + this.options.selectedCustomClass);

            // Update component item
            if (this.hasComponent()) {
                var icn = this.component.find('i');
                if (icn.length > 0) {
                    icn.attr('class', 'fa fa-fw ' + this.getValue());
                } else {
                    this.component.html(this.getValueHtml());
                }
            }

        },
        _updateFormGroupStatus: function(isValid) {
            if (this.hasInput()) {
                if (isValid !== false) {
                    // Remove form-group error class if any
                    this.input.parents('.form-group:first').removeClass('has-error');
                } else {
                    this.input.parents('.form-group:first').addClass('has-error');
                }
                return true;
            }
            return false;
        },
        getValid: function(val) {
            // here we must validate the value (you may change this validation
            // to suit your needs

            if (!_helpers.isString(val)) {
                val = '';
            }
            // trimmed and sanitized string without the 'fa-' prefix
            val = $.trim(val.replace('fa-', ''));

            if (_helpers.inArray(val, this.options.selectableItems)) {
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
                this._trigger('pickerSetValue', {
                    pickerValue: _val
                });
                return this.pickerValue;
            } else {
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
            return '<i class="fa fa-fw ' + this.getValue() + '"></i>';
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
            return this.popover.find('.picker-btn-accept');
        },
        getCancelButton: function() {
            return this.popover.find('.picker-btn-cancel');
        },
        getSearchInput: function() {
            return this.popover.find('.picker-search');
        },
        filter: function(filterText) {
            if (_helpers.isEmpty(filterText)) {
                this.picker.find('.picker-item').show();
                return $(false);
            } else {
                var found = [];
                this.picker.find('.picker-item').each(function() {
                    var $this = $(this);
                    var text = $this.attr('title').toLowerCase();
                    var regex = false;
                    try {
                        regex = new RegExp(filterText, 'g');
                    } catch (e) {
                        regex = false;
                    }
                    if ((regex !== false) && text.match(regex)) {
                        found.push($this);
                        $this.show();
                    } else {
                        $this.hide();
                    }
                });
                return found;
            }
        },
        show: function() {
            if (this.popover.hasClass('in')) {
                return false;
            }
            // hide other non-inline pickers
            $.picker.batch($('.picker-popover.in:not(.inline)').not(this.popover), 'hide');

            this._trigger('pickerShow');
            this.updatePlacement();
            this.popover.addClass('in');
            setTimeout($.proxy(function() {
                this.popover.css('display', this.isInline() ? '' : 'block');
                this._trigger('pickerShown');
            }, this), this.options.animation ? 300 : 1); // animation duration
        },
        hide: function() {
            if (!this.popover.hasClass('in')) {
                return false;
            }
            this._trigger('pickerHide');
            this.popover.removeClass('in');
            setTimeout($.proxy(function() {
                this.popover.css('display', 'none');
                this.getSearchInput().val('');
                this.filter(''); // clear filter
                this._trigger('pickerHidden');
            }, this), this.options.animation ? 300 : 1);
        },
        toggle: function() {
            if (this.popover.is(":visible")) {
                this.hide();
            } else {
                this.show(true);
            }
        },
        update: function(val, updateOnlyInternal) {
            val = (val ? val :  this.getSourceValue(this.pickerValue));
            // reads the input or element value again and tries to update the plugin
            // fallback to the current selected item value
            this._trigger('pickerUpdate');

            if (updateOnlyInternal === true) {
                val = this.setValue(val);
            } else {
                val = this.setSourceValue(val);
                this._updateFormGroupStatus(val !== false);
            }

            if (val !== false) {
                this._updateComponents();
            }

            this._trigger('pickerUpdated');
            return val;
        },
        destroy: function() {
            this._trigger('pickerDestroy');

            // unbinds events and resets everything to the initial state,
            // including component mode
            this.element.removeData('picker').removeData('pickerValue').removeClass('picker-element');

            this._unbindElementEvents();
            this._unbindWindowEvents();

            $(this.popover).remove();

            this._trigger('pickerDestroyed');
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
        },
        isDisabled: function() {
            if (this.hasInput()) {
                return (this.input.prop('disabled') === true);
            }
            return false;
        },
        isInline: function() {
            return (this.options.placement === 'inline') || (this.popover.hasClass('inline'));
        }
    };

    $.picker = Picker;

    // jQuery plugin
    $.fn.picker = function(options) {
        return this.each(function() {
            var $this = $(this);
            if (!$this.data('picker')) {
                // create plugin instance (only if not exists) and expose the entire instance API
                $this.data('picker', new Picker(this, ((typeof options === 'object') ? options : {})));
            }
        });
    };
}));

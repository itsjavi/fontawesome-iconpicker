/*!
 * Font Awesome Icon Picker
 * http://mjolnic.github.io/fontawesome-iconpicker/
 *
 * Originally written by (c) 2014 Javier Aguilar @mjolnic
 * Licensed under the MIT License
 * https://github.com/mjolnic/fontawesome-iconpicker/blob/master/LICENSE
 *
 */

(function(factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (window.jQuery && !window.jQuery.fn.iconpicker) {
        factory(window.jQuery);
    }
}
(function($) {
    'use strict';

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
            throw "Font Awesome Icon Picker Exception: " + text;
        }
    };

    var Iconpicker = function(element, options) {
        this._id = Iconpicker._idCounter++;
        this.element = $(element).addClass('iconpicker-element');
        this._trigger('iconpickerCreate');
        this.options = $.extend({}, Iconpicker.defaultOptions, this.element.data(), options);
        this.options.templates = $.extend({}, Iconpicker.defaultOptions.templates, this.options.templates);
        this.options.originalPlacement = this.options.placement;

        // Iconpicker container element
        this.container = (_helpers.isElement(this.options.container) ? $(this.options.container) : false);
        if (this.container === false) {
            this.container = (this.element.is('input') ? this.element.parent() : this.element);
        }
        if (this.container.addClass('iconpicker-container').is('.dropdown-menu')) {
            this.options.placement = 'inline';
        }

        // Is the element an input? Should we search inside for any input?     
        this.input = (this.element.is('input') ? this.element.addClass('iconpicker-input') : false);
        if (this.input === false) {
            this.input = (this.container.find(this.options.input));
        }

        // Plugin as component ?
        this.component = this.container.find(this.options.component).addClass('iconpicker-component');
        if (this.component.length === 0) {
            this.component = false;
        }else{
            this.component.find('i').addClass(this.options.iconComponentBaseClass);
        }

        // Create popover and iconpicker HTML
        this._createPopover();
        this._createIconpicker();

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

        // Bind events
        this._bindElementEvents();
        this._bindWindowEvents();

        // Refresh everything
        this.update(this.options.selected);

        if (this.isInline()) {
            this.show();
        }

        this._trigger('iconpickerCreated');
    };

    // Instance identifier counter
    Iconpicker._idCounter = 0;
    
    Iconpicker.defaultOptions = {
        title: false, // Popover title (optional) only if specified in the template
        selected: false, // use this value as the current item and ignore the original
        defaultValue: false, // use this value as the current item if input or element item is empty
        placement: 'bottom', //  (has some issues with auto and CSS). auto, top, bottom, left, right
        collision: 'none', // If true, the popover will be repositioned to another position when collapses with the window borders
        animation: true,
        //hide iconpicker automatically when a value is picked. it is ignored if mustAccept is not false and the accept button is visible
        hideOnSelect: false,
        showFooter: false,
        searchInFooter: false, // If true, the search will be added to the footer instead of the title
        mustAccept: false, // only applicable when there's an iconpicker-btn-accept button in the popover footer
        selectedCustomClass: 'bg-primary', // Appends this class when to the selected item
        icons: [], // list of icons (declared at the bottom of this script for maintainability)
        iconBaseClass: 'fa',
        iconComponentBaseClass: 'fa fa-fw',
        iconClassPrefix: 'fa-',
        input: 'input', // children input selector
        component: '.input-group-addon', // children component jQuery selector or object, relative to the parent element
        container: false, //   Appends the popover to a specific element. If true, appends to the jQuery element.
        // Plugin templates:
        templates: {
            popover: '<div class="iconpicker-popover popover"><div class="arrow"></div>' +
                    '<div class="popover-title"></div><div class="popover-content"></div></div>',
            footer: '<div class="popover-footer"></div>',
            buttons: '<button class="iconpicker-btn iconpicker-btn-cancel btn btn-default btn-sm">Cancel</button>' +
                    ' <button class="iconpicker-btn iconpicker-btn-accept btn btn-primary btn-sm">Accept</button>',
            search: '<input type="search" class="form-control iconpicker-search" placeholder="Type to filter" />',
            iconpicker: '<div class="iconpicker"><div class="iconpicker-items"></div></div>',
            iconpickerItem: '<div class="iconpicker-item"><i></i></div>'
        }
    };

    Iconpicker.batch = function(selector, method) {
        var args = Array.prototype.slice.call(arguments, 2);
        return $(selector).each(function() {
            var $inst = $(this).data('iconpicker');
            if (!!$inst) {
                $inst[method].apply($inst, args);
            }
        });
    };

    Iconpicker.prototype = {
        constructor: Iconpicker,
        options: {},
        _id: 0, // instance identifier for bind/unbind events
        _trigger: function(name, opts) {
            //triggers an event bound to the element
            opts = opts || {};
            this.element.trigger($.extend({
                type: name,
                iconpickerInstance: this
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
        _createIconpicker: function() {
            var _self = this;
            this.iconpicker = $(this.options.templates.iconpicker);

            var itemClickFn = function(e) {
                var $this = $(this);
                if ($this.is('.' + _self.options.iconBaseClass)) {
                    $this = $this.parent();
                }

                _self._trigger('iconpickerSelect', {
                    iconpickerItem: $this,
                    iconpickerValue: _self.iconpickerValue
                });

                if (_self.options.mustAccept === false) {
                    _self.update($this.data('iconpickerValue'));
                    _self._trigger('iconpickerSelected', {
                        iconpickerItem: this,
                        iconpickerValue: _self.iconpickerValue
                    });
                } else {
                    _self.update($this.data('iconpickerValue'), true);
                }

                if (_self.options.hideOnSelect && (_self.options.mustAccept === false)) {
                    // only hide when the accept button is not present
                    _self.hide();
                }
            };

            for (var i in this.options.icons) {
                var itemElement = $(this.options.templates.iconpickerItem);
                itemElement.find('i')
                        .addClass(_self.options.iconBaseClass + " " +
                        this.options.iconClassPrefix + this.options.icons[i]);
                itemElement.data('iconpickerValue', this.options.icons[i])
                        .on('click.iconpicker', itemClickFn);
                this.iconpicker.find('.iconpicker-items').append(itemElement
                        .attr('title', '.' + this.getValue(this.options.icons[i])));
            }

            this.popover.find('.popover-content').append(this.iconpicker);

            return this.iconpicker;
        },
        _isEventInsideIconpicker: function(e) {
            var _t = $(e.target);
            if ((!_t.hasClass('iconpicker-element')  ||
                    (_t.hasClass('iconpicker-element') && !_t.is(this.element))) &&
                    (_t.parents('.iconpicker-popover').length === 0)) {
                return false;
            }
            return true;
        },
        _bindElementEvents: function() {
            var _self = this;

            this.getSearchInput().on('keyup', function() {
                _self.filter($(this).val().toLowerCase());
            });

            this.getAcceptButton().on('click.iconpicker', function() {
                var _picked = _self.iconpicker.find('.iconpicker-selected').get(0);

                _self.update(_self.iconpickerValue);

                _self._trigger('iconpickerSelected', {
                    iconpickerItem: _picked,
                    iconpickerValue: _self.iconpickerValue
                });
                if (!_self.isInline()) {
                    _self.hide();
                }
            });
            this.getCancelButton().on('click.iconpicker', function() {
                if (!_self.isInline()) {
                    _self.hide();
                }
            });

            this.element.on('focus.iconpicker', function(e) {
                _self.show();
                e.stopPropagation();
            });

            if (this.hasComponent()) {
                this.component.on('click.iconpicker', function() {
                    _self.toggle();
                });
            }

            if (this.hasInput()) {
                // Bind input keyup event
                this.input.on('keyup.iconpicker', function(e) {
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
            var _eventNs = '.iconpicker.inst' + this._id;

            $(window).on('resize.iconpicker' + _eventNs + ' orientationchange.iconpicker' + _eventNs, function(e) {
                // reposition popover
                if (_self.popover.hasClass('in')) {
                    _self.updatePlacement();
                }
            });

            if (!_self.isInline()) {
                $doc.on('mouseup' + _eventNs, function(e) {
                    if (!_self._isEventInsideIconpicker(e) && !_self.isInline()) {
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
            this.popover.off('.iconpicker');
            this.element.off('.iconpicker');

            if (this.hasInput()) {
                this.input.off('.iconpicker');
            }

            if (this.hasComponent()) {
                this.component.off('.iconpicker');
            }

            if (this.hasContainer()) {
                this.container.off('.iconpicker');
            }
        },
        _unbindWindowEvents: function() {
            // destroy window and window.document bound events
            $(window).off('.iconpicker.inst' + this._id);
            $(window.document).off('.iconpicker.inst' + this._id);
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
            this.iconpicker.find('.iconpicker-item.iconpicker-selected')
                    .removeClass('iconpicker-selected ' + this.options.selectedCustomClass);

            this.iconpicker.find('.' + this.options.iconBaseClass + '.' +
                    this.options.iconClassPrefix + this.iconpickerValue).parent()
                    .addClass('iconpicker-selected ' + this.options.selectedCustomClass);

            // Update component item
            if (this.hasComponent()) {
                var icn = this.component.find('i');
                if (icn.length > 0) {
                    icn.attr('class', this.options.iconComponentBaseClass + ' ' + this.getValue());
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
            
            var isEmpty = (val==='');
            
            // trimmed and sanitized string without the icon class prefix
            val = $.trim(val.replace(this.options.iconClassPrefix, ''));

            if (_helpers.inArray(val, this.options.icons) || isEmpty) {
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
                this.iconpickerValue = _val;
                this._trigger('iconpickerSetValue', {
                    iconpickerValue: _val
                });
                return this.iconpickerValue;
            } else {
                this._trigger('iconpickerInvalid', {
                    iconpickerValue: val
                });
                return false;
            }
        },
        /**
         * Returns the formatted item value
         * @returns string
         */
        getValue: function(val) {
            return this.options.iconClassPrefix + (val ? val : this.iconpickerValue);
        },
        getValueHtml: function() {
            return '<i class="' + this.options.iconBaseClass + " " + this.getValue() + '"></i>';
        },
        /**
         * Calls setValue and if it's a valid item value, sets the input or element value
         */
        setSourceValue: function(val) {
            val = this.setValue(val);
            if ((val !== false) && (val !== '')) {
                if (this.hasInput()) {
                    this.input.val(this.getValue());
                } else {
                    this.element.data('iconpickerValue', this.getValue());
                }
                this._trigger('iconpickerSetSourceValue', {
                    iconpickerValue: val
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
                val = this.element.data('iconpickerValue');
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
            return this.popover.find('.iconpicker-btn-accept');
        },
        getCancelButton: function() {
            return this.popover.find('.iconpicker-btn-cancel');
        },
        getSearchInput: function() {
            return this.popover.find('.iconpicker-search');
        },
        filter: function(filterText) {
            if (_helpers.isEmpty(filterText)) {
                this.iconpicker.find('.iconpicker-item').show();
                return $(false);
            } else {
                var found = [];
                this.iconpicker.find('.iconpicker-item').each(function() {
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
            $.iconpicker.batch($('.iconpicker-popover.in:not(.inline)').not(this.popover), 'hide');

            this._trigger('iconpickerShow');
            this.updatePlacement();
            this.popover.addClass('in');
            setTimeout($.proxy(function() {
                this.popover.css('display', this.isInline() ? '' : 'block');
                this._trigger('iconpickerShown');
            }, this), this.options.animation ? 300 : 1); // animation duration
        },
        hide: function() {
            if (!this.popover.hasClass('in')) {
                return false;
            }
            this._trigger('iconpickerHide');
            this.popover.removeClass('in');
            setTimeout($.proxy(function() {
                this.popover.css('display', 'none');
                this.getSearchInput().val('');
                this.filter(''); // clear filter
                this._trigger('iconpickerHidden');
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
            val = (val ? val :  this.getSourceValue(this.iconpickerValue));
            // reads the input or element value again and tries to update the plugin
            // fallback to the current selected item value
            this._trigger('iconpickerUpdate');

            if (updateOnlyInternal === true) {
                val = this.setValue(val);
            } else {
                val = this.setSourceValue(val);
                this._updateFormGroupStatus(val !== false);
            }

            if (val !== false) {
                this._updateComponents();
            }

            this._trigger('iconpickerUpdated');
            return val;
        },
        destroy: function() {
            this._trigger('iconpickerDestroy');

            // unbinds events and resets everything to the initial state,
            // including component mode
            this.element.removeData('iconpicker').removeData('iconpickerValue').removeClass('iconpicker-element');

            this._unbindElementEvents();
            this._unbindWindowEvents();

            $(this.popover).remove();

            this._trigger('iconpickerDestroyed');
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

    $.iconpicker = Iconpicker;

    // jQuery plugin
    $.fn.iconpicker = function(options) {
        return this.each(function() {
            var $this = $(this);
            if (!$this.data('iconpicker')) {
                // create plugin instance (only if not exists) and expose the entire instance API
                $this.data('iconpicker', new Iconpicker(this, ((typeof options === 'object') ? options : {})));
            }
        });
    };

    // List of all Font Awesome icons without class prefix
    Iconpicker.defaultOptions.icons = [
        'adjust', 'adn', 'align-center', 'align-justify', 'align-left', 'align-right', 'ambulance',
        'anchor', 'android', 'angle-double-down', 'angle-double-left', 'angle-double-right', 'angle-double-up',
        'angle-down', 'angle-left', 'angle-right', 'angle-up', 'apple', 'archive', 'arrow-circle-down',
        'arrow-circle-left', 'arrow-circle-o-down', 'arrow-circle-o-left', 'arrow-circle-o-right',
        'arrow-circle-o-up', 'arrow-circle-right', 'arrow-circle-up', 'arrow-down', 'arrow-left',
        'arrow-right', 'arrow-up', 'arrows', 'arrows-alt', 'arrows-h', 'arrows-v', 'asterisk',
        'automobile', 'backward', 'ban', 'bank', 'bar-chart-o', 'barcode', 'bars', 'beer',
        'behance', 'behance-square', 'bell', 'bell-o', 'bitbucket', 'bitbucket-square', 'bitcoin',
        'bold', 'bolt', 'bomb', 'book', 'bookmark', 'bookmark-o', 'briefcase', 'btc',
        'bug', 'building', 'building-o', 'bullhorn', 'bullseye', 'cab', 'calendar', 'calendar-o',
        'camera', 'camera-retro', 'car', 'caret-down', 'caret-left', 'caret-right',
        'caret-square-o-down', 'caret-square-o-left', 'caret-square-o-right', 'caret-square-o-up',
        'caret-up', 'certificate', 'chain', 'chain-broken', 'check', 'check-circle', 'check-circle-o',
        'check-square', 'check-square-o', 'chevron-circle-down', 'chevron-circle-left',
        'chevron-circle-right', 'chevron-circle-up', 'chevron-down', 'chevron-left',
        'chevron-right', 'chevron-up', 'child', 'circle', 'circle-o', 'circle-o-notch',
        'circle-thin', 'clipboard', 'clock-o', 'cloud', 'cloud-download', 'cloud-upload',
        'cny', 'code', 'code-fork', 'codepen', 'coffee', 'cog', 'cogs', 'columns',
        'comment', 'comment-o', 'comments', 'comments-o', 'compass', 'compress', 'copy',
        'credit-card', 'crop', 'crosshairs', 'css3', 'cube', 'cubes', 'cut', 'cutlery',
        'dashboard', 'database', 'dedent', 'delicious', 'desktop', 'deviantart', 'digg',
        'dollar', 'dot-circle-o', 'download', 'dribbble', 'dropbox', 'drupal', 'edit', 'eject',
        'ellipsis-h', 'ellipsis-v', 'empire', 'envelope', 'envelope-o', 'envelope-square',
        'eraser', 'eur', 'euro', 'exchange', 'exclamation', 'exclamation-circle',
        'exclamation-triangle', 'expand', 'external-link', 'external-link-square', 'eye',
        'eye-slash', 'facebook', 'facebook-square', 'fast-backward', 'fast-forward', 'fax',
        'female', 'fighter-jet', 'file', 'file-archive-o', 'file-audio-o', 'file-code-o',
        'file-excel-o', 'file-image-o', 'file-movie-o', 'file-o', 'file-pdf-o', 'file-photo-o',
        'file-picture-o', 'file-powerpoint-o', 'file-sound-o', 'file-text', 'file-text-o',
        'file-video-o', 'file-word-o', 'file-zip-o', 'files-o', 'film', 'filter', 'fire',
        'fire-extinguisher', 'flag', 'flag-checkered', 'flag-o', 'flash', 'flask', 'flickr',
        'floppy-o', 'folder', 'folder-o', 'folder-open', 'folder-open-o', 'font', 'forward',
        'foursquare', 'frown-o', 'gamepad', 'gavel', 'gbp', 'ge', 'gear', 'gears', 'gift',
        'git', 'git-square', 'github', 'github-alt', 'github-square', 'gittip', 'glass', 'globe',
        'google', 'google-plus', 'google-plus-square', 'graduation-cap', 'group', 'h-square', 'hacker-news',
        'hand-o-down', 'hand-o-left', 'hand-o-right', 'hand-o-up', 'hdd-o', 'header', 'headphones',
        'heart', 'heart-o', 'history', 'home', 'hospital-o', 'html5', 'image', 'inbox', 'indent',
        'info', 'info-circle', 'inr', 'instagram', 'institution', 'italic', 'joomla', 'jpy',
        'jsfiddle', 'key', 'keyboard-o', 'krw', 'language', 'laptop', 'leaf', 'legal', 'lemon-o',
        'level-down', 'level-up', 'life-bouy', 'life-ring', 'life-saver', 'lightbulb-o', 'link',
        'linkedin', 'linkedin-square', 'linux', 'list', 'list-alt', 'list-ol', 'list-ul', 'location-arrow',
        'lock', 'long-arrow-down', 'long-arrow-left', 'long-arrow-right', 'long-arrow-up', 'magic',
        'magnet', 'mail-forward', 'mail-reply', 'mail-reply-all', 'male', 'map-marker', 'maxcdn',
        'medkit', 'meh-o', 'microphone', 'microphone-slash', 'minus', 'minus-circle', 'minus-square',
        'minus-square-o', 'mobile', 'mobile-phone', 'money', 'moon-o', 'mortar-board', 'music',
        'navicon', 'openid', 'outdent', 'pagelines', 'paper-plane', 'paper-plane-o', 'paperclip',
        'paragraph', 'paste', 'pause', 'paw', 'pencil', 'pencil-square', 'pencil-square-o', 'phone',
        'phone-square', 'photo', 'picture-o', 'pied-piper', 'pied-piper-alt', 'pied-piper-square',
        'pinterest', 'pinterest-square', 'plane', 'play', 'play-circle', 'play-circle-o', 'plus',
        'plus-circle', 'plus-square', 'plus-square-o', 'power-off', 'print', 'puzzle-piece', 'qq',
        'qrcode', 'question', 'question-circle', 'quote-left', 'quote-right', 'ra', 'random',
        'rebel', 'recycle', 'reddit', 'reddit-square', 'refresh', 'renren', 'reorder', 'repeat',
        'reply', 'reply-all', 'retweet', 'rmb', 'road', 'rocket', 'rotate-left', 'rotate-right',
        'rouble', 'rss', 'rss-square', 'rub', 'ruble', 'rupee', 'save', 'scissors', 'search',
        'search-minus', 'search-plus', 'send', 'send-o', 'share', 'share-alt', 'share-alt-square',
        'share-square', 'share-square-o', 'shield', 'shopping-cart', 'sign-in', 'sign-out', 'signal',
        'sitemap', 'skype', 'slack', 'sliders', 'smile-o', 'sort', 'sort-alpha-asc', 'sort-alpha-desc',
        'sort-amount-asc', 'sort-amount-desc', 'sort-asc', 'sort-desc', 'sort-down', 'sort-numeric-asc',
        'sort-numeric-desc', 'sort-up', 'soundcloud', 'space-shuttle', 'spinner', 'spoon', 'spotify',
        'square', 'square-o', 'stack-exchange', 'stack-overflow', 'star', 'star-half', 'star-half-empty',
        'star-half-full', 'star-half-o', 'star-o', 'steam', 'steam-square', 'step-backward', 'step-forward',
        'stethoscope', 'stop', 'strikethrough', 'stumbleupon', 'stumbleupon-circle', 'subscript',
        'suitcase', 'sun-o', 'superscript', 'support', 'table', 'tablet', 'tachometer', 'tag',
        'tags', 'tasks', 'taxi', 'tencent-weibo', 'terminal', 'text-height', 'text-width', 'th',
        'th-large', 'th-list', 'thumb-tack', 'thumbs-down', 'thumbs-o-down', 'thumbs-o-up', 'thumbs-up',
        'ticket', 'times', 'times-circle', 'times-circle-o', 'tint', 'toggle-down', 'toggle-left',
        'toggle-right', 'toggle-up', 'trash-o', 'tree', 'trello', 'trophy', 'truck', 'try', 'tumblr',
        'tumblr-square', 'turkish-lira', 'twitter', 'twitter-square', 'umbrella', 'underline', 'undo',
        'university', 'unlink', 'unlock', 'unlock-alt', 'unsorted', 'upload', 'usd', 'user', 'user-md',
        'users', 'video-camera', 'vimeo-square', 'vine', 'vk', 'volume-down', 'volume-off', 'volume-up',
        'warning', 'wechat', 'weibo', 'weixin', 'wheelchair', 'windows', 'won', 'wordpress', 'wrench',
        'xing', 'xing-square', 'yahoo', 'yen', 'youtube', 'youtube-play', 'youtube-square'
    ];
}));

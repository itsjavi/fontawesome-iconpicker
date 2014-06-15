(function(a) {
    "use strict";
    if (typeof define === "function" && define.amd) {
        define([ "jquery" ], a);
    } else if (window.jQuery && !window.jQuery.fn.picker) {
        a(window.jQuery);
    }
})(function(a) {
    "use strict";
    var b = [ "angle-double-down", "angle-double-left", "angle-double-right", "angle-double-up", "angle-down", "angle-left", "angle-right", "angle-up" ];
    var c = {
        placement: "bottom",
        title: false,
        container: false,
        animation: true,
        selected: false,
        defaultItem: false,
        onlyValid: true,
        input: "input",
        hideOnPick: false,
        selectedCustomClass: "bg-primary",
        selectableItems: false,
        inline: false,
        displayButtons: false,
        component: false,
        templates: {
            picker: '<div class="picker"><div class="picker-items"></div></div>',
            item: '<div class="picker-item"><i class="fa"></i></div>',
            buttons: '<div class="picker-buttons">' + '<button class="picker-button picker-button-cancel btn btn-default btn-sm">Cancel</button>' + '<button class="picker-button picker-button-accept btn btn-primary btn-sm">Accept</button></div>',
            popover: '<div class="popover picker-popover"><div class="arrow"></div>' + '<div class="popover-title"></div><div class="popover-content"></div></div>'
        }
    };
    var d = 0;
    var e = function(e, f) {
        this._id = d++;
        this.element = a(e).addClass("picker-element");
        this.options = a.extend({}, c, this.element.data(), f);
        this.selectableItems = this.options.selectableItems;
        if (!a.isArray(this.selectableItems) || this.selectableItems.length === 0) {
            this.selectableItems = b;
        }
        this.component = this.options.component;
        this.component = this.component !== false ? this.element.find(this.component) : false;
        if (this.component !== false && this.component.length === 0) {
            this.component = false;
        }
        this.container = this.options.container === true ? this.element : this.options.container;
        this.container = this.container !== false ? a(this.container) : false;
        this.input = this.element.is("input") ? this.element : this.options.input ? this.element.find(this.options.input) : false;
        if (this.input !== false && this.input.length === 0) {
            this.input = false;
        }
        this._createPicker();
        this._createPopover();
        this._bindEvents();
        this._trigger("pickerCreate");
        a(a.proxy(function() {
            this.update(this.options.selected);
        }, this));
    };
    e.prototype = {
        constructor: e,
        options: {},
        _id: 0,
        _trigger: function(b, c) {
            c = c || {};
            this.element.trigger(a.extend({
                type: b,
                picker: this
            }, c));
        },
        _error: function(a) {
            throw "Bootstrap Popover Picker Exception: " + a;
        },
        _createPopover: function() {
            var b = this;
            this.element.popover({
                title: this.options.title,
                placement: this.options.placement,
                container: this.container,
                animation: this.options.animation,
                template: this.options.templates.popover,
                content: this.picker.element,
                html: true,
                trigger: "manual"
            }).on("focus.picker", function() {
                a(this).popover("show");
            }).on("show.bs.popover.picker", function() {
                b.update();
            });
        },
        _createPicker: function(b) {
            b = b || {};
            var c = this;
            var d = a(this.options.templates.picker);
            this.picker = {
                element: d
            };
            var e = function(b) {
                var d = a(this);
                if (d.is(".fa")) {
                    d = d.parent();
                }
                c.update(d.data("pickerValue"));
                c._trigger("pickerSelect", {
                    pickerItem: this,
                    pickerValue: c.pickerValue
                });
                if (c.options.hideOnPick && c.getAcceptButton().length === 0) {
                    c.hide();
                }
            };
            for (var f in this.selectableItems) {
                var g = a(this.options.templates.item);
                g.find(".fa").addClass("fa-" + this.selectableItems[f]);
                g.data("pickerValue", this.selectableItems[f]).on("click.picker", e);
                this.picker.element.find(".picker-items").append(g.attr("title", "." + this.getValue(this.selectableItems[f])));
            }
            if (this.options.displayButtons) {
                this.picker.element.append(a(this.options.templates.buttons));
                this.getAcceptButton().on("click", function() {
                    c.update(c.pickerValue, true);
                    c.hide();
                });
                this.getCancelButton().on("click", function() {
                    c.hide();
                });
            }
            this.picker = a.extend(true, this.picker, b);
        },
        _bindEvents: function() {
            if (this.options.inline === false) {
                var b = false;
                var c = false;
                var d = false;
                var e = a.proxy(function(b) {
                    var c = a(b.target);
                    if ((!c.hasClass("picker-element") || c.hasClass("picker-element") && !c.is(this.element)) && c.parents(".picker-popover").length === 0) {
                        return false;
                    }
                    return true;
                }, this);
                var f = a.proxy(function(a) {
                    if (!e(a)) {
                        this.hide();
                    }
                    a.stopPropagation();
                    a.preventDefault();
                    return false;
                }, this);
                var g = a(window.document);
                var h = ".picker.inst" + this._id;
                g.on("mousedown" + h, function(a) {
                    g.on("mousemove" + h, function(a) {
                        c = true;
                        g.unbind("mousemove" + h);
                    });
                });
                g.on("mouseup" + h, function(a) {
                    b = c === true;
                    c = false;
                    g.unbind("mousemove" + h);
                    if (!b) {
                        f(a);
                    }
                });
                g.on("click.picker" + h, function(a) {
                    c = false;
                    g.unbind("mousemove" + h);
                    if (!b) {
                        f(a);
                    }
                });
                if (this.hasInput()) {
                    this.input.on("keyup.picker", a.proxy(function(b) {
                        if (a.inArray(b.keyCode, [ 38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86 ]) === -1) {
                            this.update();
                        }
                    }, this));
                    this.input.on("click.picker");
                }
            }
        },
        _updateComponents: function() {
            this.picker.element.find(".picker-item.picker-selected").removeClass("picker-selected " + this.options.selectedCustomClass);
            this.picker.element.find(".fa.fa-" + this.pickerValue).parent().addClass("picker-selected " + this.options.selectedCustomClass);
            if (this.component !== false) {
                var a = this.component.find("i").eq(0);
                if (a.length > 0) {
                    a.html(this.getValueHtml());
                } else {
                    this.component.html(this.getValueHtml());
                }
            }
        },
        _sanitizeValue: function(b) {
            if ((typeof b === "string" || b instanceof String) === false) {
                b = "";
            }
            return a.trim(b.replace("fa-", ""));
        },
        setValue: function(b) {
            b = this._sanitizeValue(b);
            if (a.inArray(b, this.selectableItems) !== -1 || !this.options.onlyValid) {
                this.pickerValue = b;
                this._updateComponents();
                this._trigger("pickerSetValue", {
                    pickerValue: b
                });
                return this.pickerValue;
            } else {
                console.warn("Invalid item value: ");
                console.log(b);
                return false;
            }
        },
        getValue: function(a) {
            return "fa-" + (a ? a : this.pickerValue);
        },
        getValueHtml: function() {
            return '<i class="fa ' + this.getValue() + '"></i>';
        },
        setSourceValue: function(a) {
            a = this.setValue(a);
            if (a !== false) {
                if (this.hasInput()) {
                    this.input.val(this.getValue());
                } else {
                    this.element.data("pickerValue", this.getValue());
                }
                this._trigger("pickerSetSourceValue", {
                    pickerValue: a
                });
            }
            return a;
        },
        getSourceValue: function(a) {
            a = a || this.options.defaultItem;
            var b = a;
            if (this.hasInput()) {
                b = this.input.val();
            } else {
                b = this.element.data("pickerValue");
            }
            if (b === undefined || b === "" || b === null || b === false) {
                b = a;
            }
            return b;
        },
        hasInput: function() {
            return this.input !== false;
        },
        hasComponent: function() {
            return this.component !== false;
        },
        hasContainer: function() {
            return this.container !== false;
        },
        getAcceptButton: function() {
            return this.picker.element.find(".picker-button-accept");
        },
        getCancelButton: function() {
            return this.picker.element.find(".picker-button-cancel");
        },
        isDisabled: function() {
            if (this.hasInput()) {
                return this.input.prop("disabled") === true;
            }
            return false;
        },
        show: function() {
            this.element.popover("show");
        },
        hide: function() {
            this.element.popover("hide");
        },
        update: function(a, b) {
            a = a ? a : this.getSourceValue(this.pickerValue);
            this._trigger("pickerUpdating");
            if (this.getAcceptButton().length === 0 || b === true) {
                this.setSourceValue(a);
            } else {
                this.setValue(a);
            }
            this._trigger("pickerUpdated");
            return a;
        },
        destroy: function() {
            this.element.removeData("picker").removeData("pickerValue").off(".picker");
            this.element.popover("destroy").off(".picker");
            if (this.hasInput()) {
                this.input.off(".picker");
            }
            if (this.hasComponent()) {
                this.component.off(".picker");
            }
            if (this.hasContainer()) {
                this.container.off(".picker");
            }
            this.element.removeClass("picker-element");
            a(window.document).off(".picker.inst" + this._id);
            this._trigger("pickerDestroy");
        },
        disable: function() {
            if (this.hasInput()) {
                this.input.prop("disabled", true);
                return true;
            }
            return false;
        },
        enable: function() {
            if (this.hasInput()) {
                this.input.prop("disabled", false);
                return true;
            }
            return false;
        }
    };
    a.picker = e;
    a.fn.picker = function(b) {
        var c = arguments;
        var d = b;
        if (b === true) {
            c = Array.prototype.slice.call(c, 1);
            d = c.length > 0 ? c[0] : false;
        }
        if (b !== true && typeof b !== "string") {
            return this.each(function() {
                var c = a(this);
                if (!c.data("picker") && typeof b !== "string") {
                    c.data("picker", new e(this, typeof b === "object" ? b : {}));
                }
            });
        } else if (typeof d === "string" || b === true) {
            var c = Array.prototype.slice.call(c, 1);
            if (!(typeof d === "string") || d === "") {
                return b === true ? this : false;
            }
            if (b === true) {
                return this.each(function() {
                    var b = a(this).data("picker");
                    if (b) {
                        b[d].apply(b, c);
                    }
                });
            }
            var f = this.data("picker");
            if (f) {
                var g = f[d];
                if (!!(g && g.constructor && g.call && g.apply)) {
                    return g.apply(f, c);
                } else {
                    return g;
                }
            }
        }
    };
});
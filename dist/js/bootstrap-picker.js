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
        placement: "bottomRight",
        title: false,
        animation: true,
        selected: false,
        defaultValue: false,
        onlyValid: true,
        input: "input",
        hideOnPick: false,
        displayButtons: false,
        selectedCustomClass: "bg-primary",
        selectableItems: false,
        inline: false,
        component: ".input-group-addon",
        container: false,
        autoPlacement: true,
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
        this.options = a.extend(true, {}, c, this.element.data(), f);
        this.selectableItems = this.options.selectableItems;
        if (!a.isArray(this.selectableItems) || this.selectableItems.length === 0) {
            this.selectableItems = b;
        }
        this.component = this.options.component;
        this.component = this.component !== false ? this.element.parent().find(this.component) : false;
        if (this.component !== false && this.component.length === 0 || !this.component) {
            this.component = false;
        } else {
            this.component.addClass("picker-component");
        }
        this.container = this.options.container === true ? this.element : this.options.container;
        this.container = this.container !== false ? a(this.container) : false;
        if (this.container !== false && this.container.length === 0 || !this.container) {
            this.container = false;
        } else {
            this.container.addClass("picker-container");
        }
        this.input = this.element.is("input") ? this.element : this.options.input ? this.element.find(this.options.input) : false;
        if (this.input !== false && this.input.length === 0 || !this.input) {
            this.input = false;
        } else {
            this.input.addClass("picker-input");
        }
        this.originalPlacement = this.options.placement;
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
            var c = this._hasCustomPlacement();
            this.popover = this.element.popover({
                title: this.options.title,
                placement: !c ? this.options.placement : "picker-placement",
                container: this.element.parent(),
                animation: !c ? this.options.animation : false,
                template: this.options.templates.popover,
                content: this.picker.element,
                html: true,
                trigger: "manual"
            }).on("focus.picker", function() {
                a(this).popover("show");
            }).on("show.bs.popover.picker", function(a) {
                if (c && b.popover.$tip) {
                    b.popover.$tip.css("opacity", 0);
                } else {
                    b._trigger("pickerShow");
                }
                b.update();
            }).on("shown.bs.popover.picker", function(a) {
                if (c && b.popover.$tip) {
                    b._showCustomPopover();
                } else {
                    b._trigger("pickerShown");
                }
            }).data("bs.popover");
            return this.popover;
        },
        _createPicker: function(b) {
            b = b || {};
            var c = this, d = a(this.options.templates.picker);
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
                if (!c.options.displayButtons) {
                    c._trigger("pickerSelectAccepted", {
                        pickerItem: c.picker.element.find(".picker-selected").get(0),
                        pickerValue: c.pickerValue
                    });
                }
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
                    c._trigger("pickerSelectAccepted", {
                        pickerItem: c.picker.element.find(".picker-selected").get(0),
                        pickerValue: c.pickerValue
                    });
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
                var b = this;
                var c = false;
                var d = false;
                var e = false;
                var f = a.proxy(function(b) {
                    var c = a(b.target);
                    if ((!c.hasClass("picker-element") || c.hasClass("picker-element") && !c.is(this.element)) && c.parents(".picker-popover").length === 0) {
                        return false;
                    }
                    return true;
                }, this);
                var g = a.proxy(function(a) {
                    if (!f(a)) {
                        this.hide();
                    }
                    a.stopPropagation();
                    a.preventDefault();
                    return false;
                }, this);
                var h = a(window.document);
                var i = ".picker.inst" + this._id;
                h.on("mousedown" + i, function(a) {
                    h.on("mousemove" + i, function(a) {
                        d = true;
                        h.unbind("mousemove" + i);
                    });
                });
                h.on("mouseup" + i, function(a) {
                    c = d === true;
                    d = false;
                    h.unbind("mousemove" + i);
                    if (!c) {
                        g(a);
                    }
                });
                h.on("click.picker" + i, function(a) {
                    d = false;
                    h.unbind("mousemove" + i);
                    if (!c) {
                        g(a);
                    }
                });
                a(window).on("resize.picker" + i + " orientationchange.picker" + i, function(a) {
                    b.setCustomPlacement();
                });
                if (this.hasInput()) {
                    this.input.on("keyup.picker", function(c) {
                        b._updateFormGroupStatus(b.getValid(this.value) !== false);
                        if (a.inArray(c.keyCode, [ 38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86 ]) === -1) {
                            b.update();
                        }
                        b.hide();
                    });
                    this.input.on("click.picker");
                }
            }
        },
        _unbindEvents: function() {
            this.element.off(".picker");
            this.element.off(".picker");
            if (this.hasInput()) {
                this.input.off(".picker");
            }
            if (this.hasComponent()) {
                this.component.off(".picker");
            }
            if (this.hasContainer()) {
                this.container.off(".picker");
            }
            a(window).off(".picker.inst" + this._id);
            a(window.document).off(".picker.inst" + this._id);
        },
        _hasCustomPlacement: function() {
            return a.inArray(this.options.placement, [ "top", "right", "bottom", "left", "auto" ]) === -1;
        },
        _showCustomPopover: function() {
            this._trigger("pickerShow");
            this.popover.$tip.removeClass("in");
            this.setCustomPlacement();
            this._trigger("pickerShown");
            this.popover.$tip.addClass((this.options.animation ? "fade " : "") + "in").css({
                opacity: ""
            });
        },
        setCustomPlacement: function(b, c) {
            b = b || this.options.placement;
            c = c === false ? false : true;
            var d, e, f, g, h, i = false;
            this.popover.$tip.removeClass("bottom top left right picker-placement-topLeft " + "picker-placement-topRight picker-placement-rightTop picker-placement-rightBottom " + "picker-placement-bottomRight picker-placement-bottomLeft picker-placement-leftBottom " + "picker-placement-leftTop");
            e = this.popover.$element.position();
            f = this.popover.$element.offset();
            this.popover.$tip.css("maxWidth", a(window).width() - f.left - 5);
            d = this.popover.getPosition(/in/.test(b));
            g = this.popover.$tip[0].offsetWidth;
            h = this.popover.$tip[0].offsetHeight;
            switch (b) {
              case "topLeft":
                i = {
                    top: (h - d.height + e.top - 5) * -1,
                    right: "auto",
                    bottom: "auto",
                    left: e.left
                };
                break;

              case "topRight":
                i = {
                    top: (h - d.height + e.top - 5) * -1,
                    right: -e.left,
                    bottom: "auto",
                    left: "auto"
                };
                break;

              case "rightTop":
                i = {
                    top: d.top - h * .25,
                    right: "auto",
                    bottom: "auto",
                    left: d.width
                };
                break;

              case "rightBottom":
                i = {
                    top: d.height - h * .25,
                    right: "auto",
                    bottom: "auto",
                    left: d.left
                };
                break;

              case "bottomRight":
                i = {
                    top: d.height + e.top,
                    right: -e.left,
                    bottom: "auto",
                    left: "auto"
                };
                break;

              case "bottomLeft":
                i = {
                    top: d.height + e.top,
                    right: "auto",
                    bottom: "auto",
                    left: e.left
                };
                break;

              case "leftBottom":
                i = {
                    top: d.height - h * .25,
                    right: d.left,
                    bottom: "auto",
                    left: "auto"
                };
                break;

              case "leftTop":
                i = {
                    top: d.top - h * .25,
                    right: "auto",
                    bottom: "auto",
                    left: d.left
                };
                break;
            }
            if (i !== false) {
                this.options.placement = b;
                this.popover.$tip.css(i).addClass("picker-placement-" + b);
                return true;
            } else {
                this.popover.$tip.addClass("picker-placement-" + this.options.placement);
            }
            return false;
        },
        detectCollisions: function(b) {
            var c = {
                topLeft: "bottomLeft",
                topRight: "bottomRight",
                rightTop: "rightBottom",
                rightBottom: "rightTop",
                bottomRight: "topRight",
                bottomLeft: "topLeft",
                leftBottom: "leftTop",
                leftTop: "leftBottom"
            }, d = {
                topLeft: "topRight",
                topRight: "topLeft",
                rightTop: "leftTop",
                rightBottom: "leftBottom",
                bottomRight: "bottomLeft",
                bottomLeft: "bottomRight",
                leftBottom: "rightBottom",
                leftTop: "rightTop"
            }, e = a(window).width(), f = a(window).height(), g = this.popover.$tip.offset(), h = this.popover.$tip[0].offsetWidth, i = this.popover.$tip[0].offsetHeight;
            console.log(g.top - i, +" " + f);
            if (g.top - i < 0) {
                console.log("set esceed");
                return this.setCustomPlacement(c[b], false);
            }
            if (this.originalPlacement != null && this.originalPlacement != this.options.placement) {
                console.log("set prev");
                return this.setCustomPlacement(this.originalPlacement, false);
            }
        },
        _updateComponents: function() {
            this.picker.element.find(".picker-item.picker-selected").removeClass("picker-selected " + this.options.selectedCustomClass);
            this.picker.element.find(".fa.fa-" + this.pickerValue).parent().addClass("picker-selected " + this.options.selectedCustomClass);
            if (this.hasComponent()) {
                var a = this.component.find("i");
                if (a.length > 0) {
                    a.attr("class", "fa fa-fw " + this.getValue());
                } else {
                    this.component.html(this.getValueHtml());
                }
            }
        },
        _updateFormGroupStatus: function(a) {
            if (this.hasInput()) {
                if (a !== false) {
                    this.input.parent(".form-group").removeClass("has-error");
                } else {
                    this.input.parent(".form-group").addClass("has-error");
                }
                return true;
            }
            return false;
        },
        _sanitizeValue: function(b) {
            if ((typeof b === "string" || b instanceof String) === false) {
                b = "";
            }
            return a.trim(b.replace("fa-", ""));
        },
        getValid: function(b) {
            b = this._sanitizeValue(b);
            if (a.inArray(b, this.selectableItems) !== -1 || !this.options.onlyValid) {
                return b;
            }
            return false;
        },
        setValue: function(a) {
            var b = this.getValid(a);
            if (b !== false) {
                this.pickerValue = b;
                this._updateComponents();
                this._updateFormGroupStatus(true);
                this._trigger("pickerSetValue", {
                    pickerValue: b
                });
                return this.pickerValue;
            } else {
                this._updateFormGroupStatus(false);
                this._trigger("pickerInvalid", {
                    pickerValue: a
                });
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
            a = a || this.options.defaultValue;
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
            a(a.proxy(function() {
                this.element.popover("show");
            }, this));
        },
        hide: function() {
            this._trigger("pickerHide");
            this.element.popover("hide");
        },
        update: function(a, b) {
            a = a ? a : this.getSourceValue(this.pickerValue);
            this._trigger("pickerUpdate");
            if (this.getAcceptButton().length === 0 || b === true) {
                this.setSourceValue(a);
            } else {
                this.setValue(a);
            }
            this._trigger("pickerUpdated");
            return a;
        },
        destroy: function() {
            this.element.removeData("picker").removeData("pickerValue").removeClass("picker-element");
            this.element.popover("destroy");
            this._unbindEvents();
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
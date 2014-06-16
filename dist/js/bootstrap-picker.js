(function(a, b) {
    a.ui = a.ui || {};
    var c, d = Math.max, e = Math.abs, f = Math.round, g = /left|center|right/, h = /top|center|bottom/, i = /[\+\-]\d+(\.[\d]+)?%?/, j = /^\w+/, k = /%$/, l = a.fn.pos;
    function m(a, b, c) {
        return [ parseFloat(a[0]) * (k.test(a[0]) ? b / 100 : 1), parseFloat(a[1]) * (k.test(a[1]) ? c / 100 : 1) ];
    }
    function n(b, c) {
        return parseInt(a.css(b, c), 10) || 0;
    }
    function o(b) {
        var c = b[0];
        if (c.nodeType === 9) {
            return {
                width: b.width(),
                height: b.height(),
                offset: {
                    top: 0,
                    left: 0
                }
            };
        }
        if (a.isWindow(c)) {
            return {
                width: b.width(),
                height: b.height(),
                offset: {
                    top: b.scrollTop(),
                    left: b.scrollLeft()
                }
            };
        }
        if (c.preventDefault) {
            return {
                width: 0,
                height: 0,
                offset: {
                    top: c.pageY,
                    left: c.pageX
                }
            };
        }
        return {
            width: b.outerWidth(),
            height: b.outerHeight(),
            offset: b.offset()
        };
    }
    a.pos = {
        scrollbarWidth: function() {
            if (c !== b) {
                return c;
            }
            var d, e, f = a("<div style='display:block;position:absolute;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"), g = f.children()[0];
            a("body").append(f);
            d = g.offsetWidth;
            f.css("overflow", "scroll");
            e = g.offsetWidth;
            if (d === e) {
                e = f[0].clientWidth;
            }
            f.remove();
            return c = d - e;
        },
        getScrollInfo: function(b) {
            var c = b.isWindow || b.isDocument ? "" : b.element.css("overflow-x"), d = b.isWindow || b.isDocument ? "" : b.element.css("overflow-y"), e = c === "scroll" || c === "auto" && b.width < b.element[0].scrollWidth, f = d === "scroll" || d === "auto" && b.height < b.element[0].scrollHeight;
            return {
                width: f ? a.pos.scrollbarWidth() : 0,
                height: e ? a.pos.scrollbarWidth() : 0
            };
        },
        getWithinInfo: function(b) {
            var c = a(b || window), d = a.isWindow(c[0]), e = !!c[0] && c[0].nodeType === 9;
            return {
                element: c,
                isWindow: d,
                isDocument: e,
                offset: c.offset() || {
                    left: 0,
                    top: 0
                },
                scrollLeft: c.scrollLeft(),
                scrollTop: c.scrollTop(),
                width: d ? c.width() : c.outerWidth(),
                height: d ? c.height() : c.outerHeight()
            };
        }
    };
    a.fn.pos = function(b) {
        if (!b || !b.of) {
            return l.apply(this, arguments);
        }
        b = a.extend({}, b);
        var c, k, p, q, r, s, t = a(b.of), u = a.pos.getWithinInfo(b.within), v = a.pos.getScrollInfo(u), w = (b.collision || "flip").split(" "), x = {};
        s = o(t);
        if (t[0].preventDefault) {
            b.at = "left top";
        }
        k = s.width;
        p = s.height;
        q = s.offset;
        r = a.extend({}, q);
        a.each([ "my", "at" ], function() {
            var a = (b[this] || "").split(" "), c, d;
            if (a.length === 1) {
                a = g.test(a[0]) ? a.concat([ "center" ]) : h.test(a[0]) ? [ "center" ].concat(a) : [ "center", "center" ];
            }
            a[0] = g.test(a[0]) ? a[0] : "center";
            a[1] = h.test(a[1]) ? a[1] : "center";
            c = i.exec(a[0]);
            d = i.exec(a[1]);
            x[this] = [ c ? c[0] : 0, d ? d[0] : 0 ];
            b[this] = [ j.exec(a[0])[0], j.exec(a[1])[0] ];
        });
        if (w.length === 1) {
            w[1] = w[0];
        }
        if (b.at[0] === "right") {
            r.left += k;
        } else if (b.at[0] === "center") {
            r.left += k / 2;
        }
        if (b.at[1] === "bottom") {
            r.top += p;
        } else if (b.at[1] === "center") {
            r.top += p / 2;
        }
        c = m(x.at, k, p);
        r.left += c[0];
        r.top += c[1];
        return this.each(function() {
            var g, h, i = a(this), j = i.outerWidth(), l = i.outerHeight(), o = n(this, "marginLeft"), s = n(this, "marginTop"), y = j + o + n(this, "marginRight") + v.width, z = l + s + n(this, "marginBottom") + v.height, A = a.extend({}, r), B = m(x.my, i.outerWidth(), i.outerHeight());
            if (b.my[0] === "right") {
                A.left -= j;
            } else if (b.my[0] === "center") {
                A.left -= j / 2;
            }
            if (b.my[1] === "bottom") {
                A.top -= l;
            } else if (b.my[1] === "center") {
                A.top -= l / 2;
            }
            A.left += B[0];
            A.top += B[1];
            if (!a.support.offsetFractions) {
                A.left = f(A.left);
                A.top = f(A.top);
            }
            g = {
                marginLeft: o,
                marginTop: s
            };
            a.each([ "left", "top" ], function(d, e) {
                if (a.ui.pos[w[d]]) {
                    a.ui.pos[w[d]][e](A, {
                        targetWidth: k,
                        targetHeight: p,
                        elemWidth: j,
                        elemHeight: l,
                        collisionPosition: g,
                        collisionWidth: y,
                        collisionHeight: z,
                        offset: [ c[0] + B[0], c[1] + B[1] ],
                        my: b.my,
                        at: b.at,
                        within: u,
                        elem: i
                    });
                }
            });
            if (b.using) {
                h = function(a) {
                    var c = q.left - A.left, f = c + k - j, g = q.top - A.top, h = g + p - l, m = {
                        target: {
                            element: t,
                            left: q.left,
                            top: q.top,
                            width: k,
                            height: p
                        },
                        element: {
                            element: i,
                            left: A.left,
                            top: A.top,
                            width: j,
                            height: l
                        },
                        horizontal: f < 0 ? "left" : c > 0 ? "right" : "center",
                        vertical: h < 0 ? "top" : g > 0 ? "bottom" : "middle"
                    };
                    if (k < j && e(c + f) < k) {
                        m.horizontal = "center";
                    }
                    if (p < l && e(g + h) < p) {
                        m.vertical = "middle";
                    }
                    if (d(e(c), e(f)) > d(e(g), e(h))) {
                        m.important = "horizontal";
                    } else {
                        m.important = "vertical";
                    }
                    b.using.call(this, a, m);
                };
            }
            i.offset(a.extend(A, {
                using: h
            }));
        });
    };
    a.ui.pos = {
        _trigger: function(a, b, c, d) {
            if (b.elem) {
                b.elem.trigger({
                    type: c,
                    position: a,
                    positionData: b,
                    triggered: d
                });
            }
        },
        fit: {
            left: function(b, c) {
                a.ui.pos._trigger(b, c, "posCollide", "fitLeft");
                var e = c.within, f = e.isWindow ? e.scrollLeft : e.offset.left, g = e.width, h = b.left - c.collisionPosition.marginLeft, i = f - h, j = h + c.collisionWidth - g - f, k;
                if (c.collisionWidth > g) {
                    if (i > 0 && j <= 0) {
                        k = b.left + i + c.collisionWidth - g - f;
                        b.left += i - k;
                    } else if (j > 0 && i <= 0) {
                        b.left = f;
                    } else {
                        if (i > j) {
                            b.left = f + g - c.collisionWidth;
                        } else {
                            b.left = f;
                        }
                    }
                } else if (i > 0) {
                    b.left += i;
                } else if (j > 0) {
                    b.left -= j;
                } else {
                    b.left = d(b.left - h, b.left);
                }
                a.ui.pos._trigger(b, c, "posCollided", "fitLeft");
            },
            top: function(b, c) {
                a.ui.pos._trigger(b, c, "posCollide", "fitTop");
                var e = c.within, f = e.isWindow ? e.scrollTop : e.offset.top, g = c.within.height, h = b.top - c.collisionPosition.marginTop, i = f - h, j = h + c.collisionHeight - g - f, k;
                if (c.collisionHeight > g) {
                    if (i > 0 && j <= 0) {
                        k = b.top + i + c.collisionHeight - g - f;
                        b.top += i - k;
                    } else if (j > 0 && i <= 0) {
                        b.top = f;
                    } else {
                        if (i > j) {
                            b.top = f + g - c.collisionHeight;
                        } else {
                            b.top = f;
                        }
                    }
                } else if (i > 0) {
                    b.top += i;
                } else if (j > 0) {
                    b.top -= j;
                } else {
                    b.top = d(b.top - h, b.top);
                }
                a.ui.pos._trigger(b, c, "posCollided", "fitTop");
            }
        },
        flip: {
            left: function(b, c) {
                a.ui.pos._trigger(b, c, "posCollide", "flipLeft");
                var d = c.within, f = d.offset.left + d.scrollLeft, g = d.width, h = d.isWindow ? d.scrollLeft : d.offset.left, i = b.left - c.collisionPosition.marginLeft, j = i - h, k = i + c.collisionWidth - g - h, l = c.my[0] === "left" ? -c.elemWidth : c.my[0] === "right" ? c.elemWidth : 0, m = c.at[0] === "left" ? c.targetWidth : c.at[0] === "right" ? -c.targetWidth : 0, n = -2 * c.offset[0], o, p;
                if (j < 0) {
                    o = b.left + l + m + n + c.collisionWidth - g - f;
                    if (o < 0 || o < e(j)) {
                        b.left += l + m + n;
                    }
                } else if (k > 0) {
                    p = b.left - c.collisionPosition.marginLeft + l + m + n - h;
                    if (p > 0 || e(p) < k) {
                        b.left += l + m + n;
                    }
                }
                a.ui.pos._trigger(b, c, "posCollided", "flipLeft");
            },
            top: function(b, c) {
                a.ui.pos._trigger(b, c, "posCollide", "flipTop");
                var d = c.within, f = d.offset.top + d.scrollTop, g = d.height, h = d.isWindow ? d.scrollTop : d.offset.top, i = b.top - c.collisionPosition.marginTop, j = i - h, k = i + c.collisionHeight - g - h, l = c.my[1] === "top", m = l ? -c.elemHeight : c.my[1] === "bottom" ? c.elemHeight : 0, n = c.at[1] === "top" ? c.targetHeight : c.at[1] === "bottom" ? -c.targetHeight : 0, o = -2 * c.offset[1], p, q;
                if (j < 0) {
                    q = b.top + m + n + o + c.collisionHeight - g - f;
                    if (b.top + m + n + o > j && (q < 0 || q < e(j))) {
                        b.top += m + n + o;
                    }
                } else if (k > 0) {
                    p = b.top - c.collisionPosition.marginTop + m + n + o - h;
                    if (b.top + m + n + o > k && (p > 0 || e(p) < k)) {
                        b.top += m + n + o;
                    }
                }
                a.ui.pos._trigger(b, c, "posCollided", "flipTop");
            }
        },
        flipfit: {
            left: function() {
                a.ui.pos.flip.left.apply(this, arguments);
                a.ui.pos.fit.left.apply(this, arguments);
            },
            top: function() {
                a.ui.pos.flip.top.apply(this, arguments);
                a.ui.pos.fit.top.apply(this, arguments);
            }
        }
    };
    (function() {
        var b, c, d, e, f, g = document.getElementsByTagName("body")[0], h = document.createElement("div");
        b = document.createElement(g ? "div" : "body");
        d = {
            visibility: "hidden",
            width: 0,
            height: 0,
            border: 0,
            margin: 0,
            background: "none"
        };
        if (g) {
            a.extend(d, {
                position: "absolute",
                left: "-1000px",
                top: "-1000px"
            });
        }
        for (f in d) {
            b.style[f] = d[f];
        }
        b.appendChild(h);
        c = g || document.documentElement;
        c.insertBefore(b, c.firstChild);
        h.style.cssText = "position: absolute; left: 10.7432222px;";
        e = a(h).offset().left;
        a.support.offsetFractions = e > 10 && e < 11;
        b.innerHTML = "";
        c.removeChild(b);
    })();
})(jQuery);

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
        title: false,
        selected: false,
        defaultValue: false,
        placement: "bottom",
        collision: "none",
        animation: true,
        hideOnSelect: false,
        showFooter: false,
        mustAccept: false,
        selectedCustomClass: "bg-primary",
        selectableItems: false,
        inline: false,
        inputSelector: "input",
        componentSelector: ".input-group-addon",
        containerSelector: false,
        templates: {
            popover: '<div class="picker-popover popover"><div class="arrow"></div>' + '<div class="popover-title"></div><div class="popover-content"></div></div>',
            popoverFooter: '<div class="popover-footer">' + '<button class="picker-btn picker-btn-cancel btn btn-default btn-sm">Cancel</button>' + '<button class="picker-btn picker-btn-accept btn btn-primary btn-sm">Accept</button></div>',
            picker: '<div class="picker"><div class="picker-items"></div></div>',
            pickerItem: '<div class="picker-item"><i class="fa"></i></div>'
        }
    };
    var d = 0;
    var e = function(e, f) {
        this._id = d++;
        this.element = a(e).addClass("picker-element");
        this._trigger("pickerCreate");
        this.options = a.extend(true, {}, c, this.element.data(), f);
        this.options.originalPlacement = this.options.placement;
        if (!a.isArray(this.options.selectableItems) || this.options.selectableItems.length === 0) {
            this.options.selectableItems = b;
        }
        this.container = this._sanitizeJqueryObject(!!this.options.containerSelector ? a(this.options.containerSelector) : this.element.is("input") ? this.element.parent() : this.element, "picker-container");
        this.component = this._sanitizeJqueryObject(!!this.options.componentSelector ? this.container.find(this.options.componentSelector) : false, "picker-component");
        this.input = this._sanitizeJqueryObject(this.element.is("input") ? this.element : this.options.inputSelector ? this.element.find(this.options.inputSelector) : false, "picker-input");
        this._createPicker(this._createPopover());
        if (this.getAcceptButton().length === 0) {
            this.options.mustAccept = false;
        }
        if (this.options.inline === true) {
            this.popover.addClass("popover-inline");
        }
        this.container.append(this.popover);
        this._bindElementEvents();
        this._bindWindowEvents();
        this.update(this.options.selected);
        this._trigger("pickerCreated");
    };
    e.pos = a.pos;
    e.batch = function(b, c) {
        var d = Array.prototype.slice.call(arguments, 2);
        return a(b).each(function() {
            var b = a(this).data("picker");
            if (!!b) {
                b[c].apply(b, d);
            }
        });
    };
    e.prototype = {
        constructor: e,
        options: {},
        _id: 0,
        _trigger: function(b, c) {
            c = c || {};
            this.element.trigger(a.extend({
                type: b,
                pickerInstance: this
            }, c));
        },
        _error: function(a) {
            throw "Bootstrap Popover Picker Exception: " + a;
        },
        _sanitizeJqueryObject: function(a, b) {
            if (a !== false && a.length === 0 || !a) {
                a = false;
            } else if (b) {
                a.addClass(b);
            }
            return a;
        },
        _createPopover: function() {
            this.popover = a(this.options.templates.popover);
            if (!!this.options.title) {
                this.popover.find(".popover-title").html(this.options.title);
            } else {
                this.popover.find(".popover-title").remove();
            }
            if (!!this.options.templates.popoverFooter && this.options.showFooter) {
                this.popover.append(a(this.options.templates.popoverFooter));
            } else if (this.options.showFooter !== true) {
                this.popover.find(".popover-footer").remove();
            }
            if (this.options.animation === true) {
                this.popover.addClass("fade");
            }
            return this.popover;
        },
        _createPicker: function(b) {
            var c = this;
            this.picker = a(this.options.templates.picker);
            var d = function(b) {
                var d = a(this);
                if (d.is(".fa")) {
                    d = d.parent();
                }
                c._trigger("pickerSelect", {
                    pickerItem: d,
                    pickerValue: c.pickerValue
                });
                if (c.options.mustAccept === false) {
                    c.update(d.data("pickerValue"));
                    c._trigger("pickerSelected", {
                        pickerItem: this,
                        pickerValue: c.pickerValue
                    });
                } else {
                    c.update(d.data("pickerValue"), true);
                }
                if (c.options.hideOnSelect && c.options.mustAccept === false) {
                    c.hide();
                }
            };
            for (var e in this.options.selectableItems) {
                var f = a(this.options.templates.pickerItem);
                f.find(".fa").addClass("fa-" + this.options.selectableItems[e]);
                f.data("pickerValue", this.options.selectableItems[e]).on("click.picker", d);
                this.picker.find(".picker-items").append(f.attr("title", "." + this.getValue(this.options.selectableItems[e])));
            }
            if (c.options.mustAccept === true) {
                this.getAcceptButton().on("click.picker", function() {
                    var a = c.picker.find(".picker-selected").get(0);
                    c.update(c.pickerValue);
                    c._trigger("pickerSelected", {
                        pickerItem: a,
                        pickerValue: c.pickerValue
                    });
                    if (c.options.inline !== true) {
                        c.hide();
                    }
                });
                this.getCancelButton().on("click.picker", function() {
                    if (c.options.inline !== true) {
                        c.hide();
                    }
                });
            }
            if (c.hasComponent()) {
                this.component.on("click.picker", function() {
                    c.toggle();
                });
            }
            b.find(".popover-content").append(this.picker);
            return this.picker;
        },
        _bindElementEvents: function() {
            var b = this;
            this.element.on("focus.picker", function(a) {
                b.show();
                a.stopPropagation();
            });
            if (this.hasInput()) {
                this.input.on("keyup.picker", function(c) {
                    b._updateFormGroupStatus(b.getValid(this.value) !== false);
                    if (a.inArray(c.keyCode, [ 38, 40, 37, 39, 16, 17, 18, 9, 8, 91, 93, 20, 46, 186, 190, 46, 78, 188, 44, 86 ]) === -1) {
                        b.update();
                    }
                });
            }
        },
        _eventIsInPicker: function(b) {
            var c = a(b.target);
            if ((!c.hasClass("picker-element") || c.hasClass("picker-element") && !c.is(this.element)) && c.parents(".picker-popover").length === 0) {
                return false;
            }
            return true;
        },
        _bindWindowEvents: function() {
            var b = a(window.document);
            var c = this;
            var d = ".picker.inst" + this._id;
            a(window).on("resize.picker" + d + " orientationchange.picker" + d, function(a) {
                if (c.popover.hasClass("in")) {
                    c.updatePlacement();
                }
            });
            if (this.options.inline === false) {
                b.on("mouseup" + d, function(a) {
                    if (!c._eventIsInPicker(a)) {
                        c.hide();
                    }
                    a.stopPropagation();
                    a.preventDefault();
                    return false;
                });
            }
            return false;
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
        updatePlacement: function(b, c) {
            b = b || this.options.placement;
            this.options.placement = b;
            c = c || this.options.collision;
            c = c === true ? "flip" : c;
            var d = {
                at: "right bottom",
                my: "right top",
                of: this.hasInput() ? this.input : this.container,
                collision: c === true ? "flip" : c,
                within: window
            };
            if (this.options.inline === true) {
                return this.popover.show();
            }
            if (typeof b === "object") {
                return this.popover.pos(a.extend({}, d, b));
            }
            this.popover.removeClass("topLeftCorner topLeft top topRight topRightCorner " + "rightTop right rightBottom bottomRight bottomRightCorner " + "bottom bottomLeft bottomLeftCorner leftBottom left leftTop");
            switch (b) {
              case "topLeftCorner":
                {
                    d.my = "right bottom";
                    d.at = "left top";
                }
                break;

              case "topLeft":
                {
                    d.my = "left bottom";
                    d.at = "left top";
                }
                break;

              case "top":
                {
                    d.my = "center bottom";
                    d.at = "center top";
                }
                break;

              case "topRight":
                {
                    d.my = "right bottom";
                    d.at = "right top";
                }
                break;

              case "topRightCorner":
                {
                    d.my = "left bottom";
                    d.at = "right top";
                }
                break;

              case "rightTop":
                {
                    d.my = "left bottom";
                    d.at = "right center";
                }
                break;

              case "right":
                {
                    d.my = "left center";
                    d.at = "right center";
                }
                break;

              case "rightBottom":
                {
                    d.my = "left top";
                    d.at = "right center";
                }
                break;

              case "bottomRightCorner":
                {
                    d.my = "left top";
                    d.at = "right bottom";
                }
                break;

              case "bottomRight":
                {
                    d.my = "right top";
                    d.at = "right bottom";
                }
                break;

              case "bottom":
                {
                    d.my = "center top";
                    d.at = "center bottom";
                }
                break;

              case "bottomLeft":
                {
                    d.my = "left top";
                    d.at = "left bottom";
                }
                break;

              case "bottomLeftCorner":
                {
                    d.my = "right top";
                    d.at = "left bottom";
                }
                break;

              case "leftBottom":
                {
                    d.my = "right top";
                    d.at = "left center";
                }
                break;

              case "left":
                {
                    d.my = "right center";
                    d.at = "left center";
                }
                break;

              case "leftTop":
                {
                    d.my = "right bottom";
                    d.at = "left center";
                }
                break;

              default:
                {
                    return false;
                }
                break;
            }
            this.popover.css({
                display: "block"
            }).pos(d).addClass(this.options.placement);
            this.popover.css("maxWidth", a(window).width() - this.container.offset().left - 5);
            return true;
        },
        _updateComponents: function() {
            this.picker.find(".picker-item.picker-selected").removeClass("picker-selected " + this.options.selectedCustomClass);
            this.picker.find(".fa.fa-" + this.pickerValue).parent().addClass("picker-selected " + this.options.selectedCustomClass);
            if (this.hasComponent()) {
                var a = this.component.find("i");
                if (a.length > 0) {
                    a.attr("class", "fa " + this.getValue());
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
            if (a.inArray(b, this.options.selectableItems) !== -1) {
                return b;
            }
            return false;
        },
        setValue: function(a) {
            var b = this.getValid(a);
            if (b !== false) {
                this.pickerValue = b;
                this._trigger("pickerSetValue", {
                    pickerValue: b
                });
                return this.pickerValue;
            } else {
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
            return this.popover.find(".picker-btn-accept");
        },
        getCancelButton: function() {
            return this.popover.find(".picker-btn-cancel");
        },
        show: function() {
            if (this.popover.hasClass("in")) {}
            a(".picker-popover.in:not(.popover-inline)").not(this.popover).hide();
            this._trigger("pickerShow");
            this.updatePlacement();
            this.popover.addClass("in");
            setTimeout(a.proxy(function() {
                this._trigger("pickerShown");
            }, this), this.options.animation ? 200 : 1);
        },
        hide: function() {
            if (!this.popover.hasClass("in")) {}
            this._trigger("pickerHide");
            this.popover.removeClass("in");
            setTimeout(a.proxy(function() {
                this.popover.css("display", "none");
                this._trigger("pickerHidden");
            }, this), this.options.animation ? 200 : 1);
        },
        toggle: function() {
            if (this.popover.hasClass("in")) {
                this.hide();
            } else {
                this.show();
            }
        },
        update: function(a, b) {
            a = a ? a : this.getSourceValue(this.pickerValue);
            this._trigger("pickerUpdate");
            if (b) {
                a = this.setValue(a);
            } else {
                a = this.setSourceValue(a);
            }
            if (a === false) {
                this._updateFormGroupStatus(false);
            } else {
                this._updateComponents();
                this._updateFormGroupStatus(true);
            }
            this._trigger("pickerUpdated");
            return a;
        },
        destroy: function() {
            this._trigger("pickerDestroy");
            this.element.removeData("picker").removeData("pickerValue").removeClass("picker-element");
            a(this.popover).detach();
            this._unbindEvents();
            this._trigger("pickerDestroyed");
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
        },
        isDisabled: function() {
            if (this.hasInput()) {
                return this.input.prop("disabled") === true;
            }
            return false;
        }
    };
    a.picker = e;
    a.fn.picker = function(b) {
        return this.each(function() {
            var c = a(this);
            if (!c.data("picker")) {
                c.data("picker", new e(this, typeof b === "object" ? b : {}));
            }
        });
    };
});
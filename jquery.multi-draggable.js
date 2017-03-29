/**
 * "jQuery UI Mult-draggable".
 *
 * @copyright       Copyright 2017, Anton Chukanov
 * @version         0.1
 */

(function ($) {
    var oldMouseStart = $.ui.draggable.prototype._mouseStart;
    $.ui.draggable.prototype._mouseStart = function (event, overrideHandle, noActivation) {
        this._trigger("beforeStart", event, this._uiHash());
        this._trigger("prepare", event, this._uiHash());
        oldMouseStart.apply(this, [event, overrideHandle, noActivation]);
    };

    $.extend($.ui.draggable.prototype.options, {
        multiple: false,
        cloneHelper: false,
        selected: '.selected'
    });

    $.ui.plugin.add('draggable', 'multiple', {
        prepare: function (evt) {
            var $this = $(this),
                inst = $this.data('ui-draggable');
            
            if (inst.options.multiple == true) {
                inst.options.cloneHelper = inst.options.cloneHelper || inst.options.helper == 'clone';

                var helper = createHelper($(inst.options.selected));
                inst.options.helper = function () {
                    return helper;
                }

                inst.options.cursorAt = getCursorAt(evt, $this, helper);
            }
        },
        start: function (evt, ui) {
            var $this = $(this),
                inst = $this.data('ui-draggable');
            
            if (inst.options.multiple == true && !inst.options.cloneHelper) {
                $(inst.options.selected).css('visibility', 'hidden');
            }
        },
        stop: function (evt, ui) {
            var inst = $(this).data('ui-draggable');

            if (inst.options.multiple == true) {
                var helperStartPos = ui.helper.data('startPosition'),
                    leftDif = getLeft(ui.helper) - helperStartPos.left,
                    topDif = getTop(ui.helper) - helperStartPos.top;

                var selected = $(inst.options.selected);

                $.each(selected, function () {
                    var $this = $(this);
                    var l = getLeft($this),
                        t = getTop($this);

                    $this.css({
                        left: l + leftDif - 1,
                        top: t + topDif - 1,
                        visibility: 'visible'
                    });
                });
            }
        }
    });

    function getCursorAt(evt, $this, helper) {
        var offset = $this.offset(),
            helperStartPos = helper.data('startPosition'),
            targetLeft = evt.clientX - offset.left - helperStartPos.left + getLeft($this),
            targetTop = evt.clientY - offset.top - helperStartPos.top + getTop($this);

        return {
            left: targetLeft,
            top: targetTop
        };
    }

    function createHelper(selected) {
        var selContainer = $('<div></div>').addClass('ui-draggable-selected-container');
        var l = Number.MAX_SAFE_INTEGER, t = Number.MAX_SAFE_INTEGER,
            r = Number.MIN_SAFE_INTEGER, b = Number.MIN_SAFE_INTEGER;
        $.each(selected, function () {
            var $this = $(this),
                left = getLeft($this),
                top = getTop($this),
                right = left + getWidth($this),
                bottom = top + getHeight($this);

            l = left < l ? left : l;
            r = right > r ? right : r;
            t = top < t ? top : t;
            b = bottom > b ? bottom : b;
        });

        selContainer.css({
            width: r - l,
            height: b - t
        });

        $.each(selected, function () {
            var $this = $(this),
                clone = $this.clone();

            var left = getLeft($this) - l,
                top = getTop($this) - t;

            clone.addClass('ui-draggable-selected-clone').css({
                left: left,
                top: top,
                opacity: 1
            })

            selContainer.append(clone);
        });

        selContainer.data('startPosition', {
            left: l - 1,
            top: t - 1
        })

        return selContainer;
    }

    function getLeft(element) {
        return parseFloat(element.css('left'));
    }

    function getTop(element) {
        return parseFloat(element.css('top'));
    }

    function getWidth(element) {
        return parseFloat(getComputedStyle(element.get(0)).width);
    }

    function getHeight(element) {
        return parseFloat(getComputedStyle(element.get(0)).height);
    }
})(jQuery);
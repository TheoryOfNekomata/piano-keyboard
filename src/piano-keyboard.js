/**
 * Script description.
 * @author TheoryOfNekomata
 * @date 2017-02-10
 */

(function pianoKeyboard() {
    var sharpSuffix = '#',
        keys = 12,
        whiteKeys = 7,
        grandPianoStartKey = 1,
        grandPianoEndKey = 88,
        bindings = {
            'standard': {
                81: 40,
                50: 41,
                87: 42,
                51: 43,
                69: 44,
                82: 45,
                53: 46,
                84: 47,
                54: 48,
                89: 49,
                55: 50,
                85: 51,
                73: 52,
                57: 53,
                79: 54,
                48: 55,
                80: 56,
                219: 57,
                187: 58,
                221: 59,

                90: 28,
                83: 29,
                88: 30,
                68: 31,
                67: 32,
                86: 33,
                71: 34,
                66: 35,
                72: 36,
                78: 37,
                74: 38,
                77: 39,
                188: 40,
                76: 41,
                190: 42,
                186: 43,
                191: 44
            },
            'janko': {

            }
        };

    function getOctave(i) {
        return Math.floor((i + keys - 4) / keys);
    }

    function getNormalizedPitchNumber(i) {
        while (i < 0) {
            i += keys;
        }
        return i % keys;
    }

    function getLeftPositionRatio(i) {
        var ratios = [
                (8 / keys),
                (5 / whiteKeys),
                (10 / keys),
                (6 / whiteKeys),
                0,
                (1 / keys),
                (1 / whiteKeys),
                (3 / keys),
                (2 / whiteKeys),
                (3 / whiteKeys),
                (6 / keys),
                (4 / whiteKeys)
            ];

        return ratios[getNormalizedPitchNumber(i)];
    }

    function getPitchClass(i) {
        var pitchClasses = [
                'G' + sharpSuffix,
                'A',
                'A' + sharpSuffix,
                'B',
                'C',
                'C' + sharpSuffix,
                'D',
                'D' + sharpSuffix,
                'E',
                'F',
                'F' + sharpSuffix,
                'G'
            ];

        return pitchClasses[getNormalizedPitchNumber(i)];
    }

    function getWidthUnit(kbdData) {
        var whiteKeyWidth = parseFloat(kbdData.whiteKeyWidth);

        if (isNaN(whiteKeyWidth)) {
            switch (kbdData.whiteKeyWidth) {
                case 'auto':
                case 'balanced':
                    return '%';
                default:
                    break;
            }
        }

        return 'px';
    }

    function getBlackKeyWidth(kbdData) {
        var blackKeyWidth = getWhiteKeyWidth(kbdData) * whiteKeys / keys;

        if (kbdData.whiteKeyWidth === 'balanced') {
            return getWhiteKeyWidth(kbdData);
        }

        return getWidthUnit(kbdData) === 'px' ? Math.ceil(blackKeyWidth) : blackKeyWidth;
    }

    function getWhiteKeyWidth(kbdData) {
        var whiteKeyWidth = parseFloat(kbdData.whiteKeyWidth),
            startKey = parseInt(kbdData.startKey),
            endKey = parseInt(kbdData.endKey);

        if (isNaN(whiteKeyWidth)) {
            switch (kbdData.whiteKeyWidth) {
                case 'auto':
                    return 100 / getWhiteKeysInRange(startKey, endKey);
                case 'balanced':
                    return 100 / (endKey - startKey + 1);
                default:
                    break;
            }
        }

        return whiteKeyWidth;
    }

    function getHorizontalOffset(kbdData) {
        var startKey = parseInt(kbdData.startKey),
            whiteKeyWidth = getWhiteKeyWidth(kbdData),
            ratio = getLeftPositionRatio(startKey),
            octave = getOctave(startKey);

        return whiteKeyWidth * whiteKeys * ratio + (octave * whiteKeyWidth * whiteKeys);
    }

    function getWhiteKeysInRange(startKey, endKey) {
        var whiteKeys = 0,
            i;

        for (i = startKey; i <= endKey; i++) {
            (function (i) {
                switch (getNormalizedPitchNumber(i)) {
                    case 0:
                    case 2:
                    case 5:
                    case 7:
                    case 10:
                        return;
                    default:
                        break;
                }
                ++whiteKeys;
            })(i);
        }

        return whiteKeys;
    }

    function getLeftOffset(kbdData, i) {
        var whiteKeyWidth = getWhiteKeyWidth(kbdData),
            ratio = getLeftPositionRatio(i),
            octave = getOctave(i);

        if (kbdData.whiteKeyWidth === 'balanced') {
            switch (getNormalizedPitchNumber(i)) {
                case 1:
                case 3:
                case 6:
                case 8:
                case 11:
                    return (i - 1) * whiteKeyWidth - whiteKeyWidth / 2;
                default:
                    break;
            }
            return (i - 1) * whiteKeyWidth;
        }
        return whiteKeyWidth * whiteKeys * ratio + (octave * whiteKeyWidth * whiteKeys) - getHorizontalOffset(kbdData);
    }

    function generateStyleForWhiteKeys(kbdData) {
        var css = '',
            startKey = parseInt(kbdData.startKey),
            endKey = parseInt(kbdData.endKey),
            whiteKeyWidth = getWhiteKeyWidth(kbdData),
            widthUnit = getWidthUnit(kbdData),
            i;

        for (i = startKey; i <= endKey; i++) {
            (function (i) {
                var left;

                left = getLeftOffset(kbdData, i);

                css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.key[data-key="' + i + '"]{left:' + left + widthUnit + '}';
            })(i);
        }
        css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key{width:' + whiteKeyWidth + widthUnit + '}';

        if (kbdData.whiteKeyWidth === 'balanced') {
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="C"],.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="E"],.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="F"],.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="B"]{width:' + (whiteKeyWidth * 1.5) + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="D"],.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="G"],.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="A"]{width:' + (whiteKeyWidth * 2) + widthUnit + '}';

            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="C"]:last-child{width:' + whiteKeyWidth + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="D"]:last-child{width:' + (whiteKeyWidth * 1.5) + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="F"]:last-child{width:' + whiteKeyWidth + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="G"]:last-child{width:' + (whiteKeyWidth * 1.5) + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="A"]:last-child{width:' + (whiteKeyWidth * 1.5) + widthUnit + '}';

            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key:first-child{left:0}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="D"]:first-child{width:' + (whiteKeyWidth * 1.5) + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="E"]:first-child{width:' + whiteKeyWidth + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="G"]:first-child{width:' + (whiteKeyWidth * 1.5) + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="A"]:first-child{width:' + (whiteKeyWidth * 1.5) + widthUnit + '}';
            css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.white.key[data-pitch="B"]:first-child{width:' + whiteKeyWidth + widthUnit + '}';
        }
        return css;
    }

    function generateStyle(kbdData) {
        var css = '',
            blackKeyWidth = getBlackKeyWidth(kbdData),
            widthUnit = getWidthUnit(kbdData);

        css += generateStyleForWhiteKeys(kbdData);
        css += '.piano-keyboard[data-kbd-id="' + kbdData.kbdId + '"]>.black.key{width:' + blackKeyWidth + widthUnit + '}';
        return css;
    }

    function generateKeys(kbdEl) {
        var i,
            startKey = parseInt(kbdEl.dataset.startKey),
            endKey = parseInt(kbdEl.dataset.endKey);

        for (i = startKey; i <= endKey; i++) {
            (function (i) {
                var key = document.createElement('button'),
                    pitchClass = getPitchClass(i),
                    octave = getOctave(i);

                key.dataset.key = i;
                key.dataset.octave = octave;
                key.classList.add(pitchClass.indexOf(sharpSuffix) > -1 ? 'black' : 'white');
                key.dataset.pitch = pitchClass;
                key.classList.add('key');
                key.setAttribute('tabindex', -1);

                kbdEl.appendChild(key);
            })(i);
        }
    }

    function doNoteOn(keyEl) {
        keyEl.classList.add('-active');
    }

    function doNoteOff(keyEl) {
        keyEl.classList.remove('-active');
    }

    function triggerKeyboardEvent(kbdEl, type, detail) {
        var event = new CustomEvent(type);

        event.eventName = type;

        switch (type) {
            case 'noteon':
            case 'noteoff':
                event.key = parseInt(detail.key.dataset.key);
                event.octave = parseInt(detail.key.dataset.octave);
                event.pitch = detail.key.dataset.pitch;
                break;
            default:
                break;
        }

        kbdEl.dispatchEvent(event);
        return event;
    }

    function bindEvents(kbdEl) {
        function onNoteOn(e) {
            var kbdEvent;

            e.preventDefault();
            if (e.buttons === 1 && !e.target.classList.contains('-active')) {
                this.focus();
                kbdEvent = triggerKeyboardEvent(this, 'noteon', { key: e.target });
                if (kbdEvent.defaultPrevented) {
                    return;
                }
                doNoteOn(e.target);
            }
        }

        function onNoteOff(e) {
            var kbdEvent;

            e.preventDefault();
            if (e.target.classList.contains('-active')) {
                kbdEvent = triggerKeyboardEvent(this, 'noteoff', { key: e.target });
                if (kbdEvent.defaultPrevented) {
                    return;
                }
                doNoteOff(e.target);
            }
        }

        function onKeyboardKeydown(e) {
            var kbdEl = this,
                bindingsMap = kbdEl.dataset.bindingsMap.toLowerCase(),
                key,
                keyEl,
                kbdEvent;

            e.preventDefault();

            if (typeof bindingsMap === 'undefined') {
                return;
            }

            key = bindings[bindingsMap][e.which];

            if (typeof key === 'undefined') {
                return;
            }

            keyEl = kbdEl.querySelector('[data-key="' + key + '"]');

            if (keyEl.classList.contains('-active')) {
                return;
            }

            kbdEvent = triggerKeyboardEvent(this, 'noteon', { key: keyEl });
            if (kbdEvent.defaultPrevented) {
                return;
            }

            doNoteOn(keyEl);
        }

        function onKeyboardKeyup(e) {
            var kbdEl = this,
                bindingsMap = kbdEl.dataset.bindingsMap.toLowerCase(),
                key,
                keyEl,
                kbdEvent;

            e.preventDefault();

            if (typeof bindingsMap === 'undefined') {
                return;
            }

            key = bindings[bindingsMap][e.which];

            if (typeof key === 'undefined') {
                return;
            }

            keyEl = kbdEl.querySelector('[data-key="' + key + '"]');

            if (!keyEl.classList.contains('-active')) {
                return;
            }

            kbdEvent = triggerKeyboardEvent(this, 'noteoff', { key: keyEl });
            if (kbdEvent.defaultPrevented) {
                return;
            }
            doNoteOff(keyEl);
        }

        kbdEl.addEventListener('keydown', onKeyboardKeydown);
        kbdEl.addEventListener('keyup', onKeyboardKeyup);
        kbdEl.addEventListener('mousedown', onNoteOn, true);
        kbdEl.addEventListener('mouseenter', onNoteOn, true);
        kbdEl.addEventListener('mouseup', onNoteOff, true);
        kbdEl.addEventListener('mouseleave', onNoteOff, true);
    }

    function normalizeKeyboardData(kbdEl) {
        var temp;

        kbdEl.dataset.kbdId = kbdEl.dataset.kbdId || Date.now();
        kbdEl.dataset.startKey = kbdEl.dataset.startKey || grandPianoStartKey;
        kbdEl.dataset.endKey = kbdEl.dataset.endKey || grandPianoEndKey;

        if (isNaN(kbdEl.dataset.startKey)) {
            kbdEl.dataset.startKey = grandPianoStartKey;
        }

        if (isNaN(kbdEl.dataset.endKey)) {
            kbdEl.dataset.endKey = grandPianoEndKey;
        }

        if (parseInt(kbdEl.dataset.startKey) > parseInt(kbdEl.dataset.endKey)) {
            temp = kbdEl.dataset.startKey;
            kbdEl.dataset.startKey = kbdEl.dataset.endKey;
            kbdEl.dataset.endKey = temp;
        }

        kbdEl.dataset.bindingsMap = 'standard';
    }

    function addKeyboardUiAttributes(kbdEl) {
        kbdEl.setAttribute('tabindex', 0);
    }

    function initializeKeyboardStyle(kbdEl) {
        var styleEl = document.querySelector('style[data-kbd-id="' + kbdEl.dataset.kbdId + '"]'),
            styleParent = document.getElementsByTagName('head')[0] || document.body;

        if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.dataset.kbdId = kbdEl.dataset.kbdId;
            styleParent.appendChild(styleEl);
        }
        styleEl.innerHTML = generateStyle(kbdEl.dataset);
    }

    function initializeKeyboard(kbdEl) {
        normalizeKeyboardData(kbdEl);
        initializeKeyboardStyle(kbdEl);
        generateKeys(kbdEl);
        bindEvents(kbdEl);
        addKeyboardUiAttributes(kbdEl);
    }

    Array.prototype.slice.call(document.querySelectorAll('.piano-keyboard'))
        .forEach(initializeKeyboard);
})();

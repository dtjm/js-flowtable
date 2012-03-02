// flowtable.js v1.0.0
// Copyright (c) 2012 Sam Nguyen
// flowtable.js is freely distributable under the MIT license
// http://www.opensource.org/licenses/mit-license.php
// Homepage: http://dtjm.github.com/js-flowtable

(function(global){
    var calculateColumnWidths = function(data) {
        var maxWidths = [];
        data.forEach(function(row, i){
            row.forEach(function(col, j){
                if(typeof maxWidths[j] === "undefined") {
                    maxWidths[j] = 0;
                }

                maxWidths[j] = Math.max(maxWidths[j], col.trim().length);
            });
        });
        return maxWidths;
    };

    var padText = function(text, length) {
        while(text.length < length) {
            text += " ";
        }
        return text;
    };

    var getCursorLine = function(index, args) {
        var length = args.text.length;
        var lineIndex = 0;
        var numLines = args.lines.length;
        for(var i = 0; i < numLines; i++) {
            lineIndex += args.lines[i].length + 1;
            if(index < lineIndex) {
                return i;
            }
        }
        return i;
    };

    var getCursorCol = function(index, args) {
        var lineIndex = 0;
        var line = getCursorLine(index, args);
        for(var i = 0; i < line; i++) {
            lineIndex += args.lines[i].length + 1;
        }
        return index - lineIndex;
    };

    var translateIndex = function(index, args, newLines) {
        var newIndex = 0;
        var cursorLine = getCursorLine(index, args);
        var cursorCol  = getCursorCol(index, args);
        for(var i = 0; i < cursorLine; i++) {
            newIndex += newLines[i].length + 1;
        }
        return newIndex + cursorCol;
    };

    var getPosition = function(index, oldLines) {
        var lineIndex = 0;
        var numLines = oldLines.length;
        var lineLengths = oldLines.map(function(l){return l.length;});
        var line, col;
        for(var i = 0; i < numLines; i++) {
            lineIndex += lineLengths[i] + 1;
            if(index < lineIndex) {
                line = i;
                break;
            }
        }

        lineIndex = 0;
        for(var i = 0; i < line; i++) {
            lineIndex += lineLengths[i] + 1;
        }
        return [line, index - lineIndex];
    };

    // args: delimiter, selection array, text
    global.flowTable = function(args){
        var oldLines = args.lines = args.text.split("\n");
        var data = [];
        oldLines.forEach(function(l){
            data.push(l.split(args.splitter));
        });

        var widths = calculateColumnWidths(data);

        var position = getPosition(args.selectionEnd, oldLines);
        var cursorLine = position[0];

        var text = "";
        var newLines = [];
        data.forEach(function(row, i){
            // If the cursor is on the current line, don't format it
            if(cursorLine === i) {
                newLines.push(args.lines[i]);
                return;
            }
            var cols = [];
            row.forEach(function(col, j) {
                cols.push(padText(col.trim(), widths[j]));
            });
            newLines.push(cols.join(args.joiner));
        });
        args.outputLines = newLines;

        return {
            text: args.outputLines.join("\n"),
            selectionStart: translateIndex(args.selectionStart, args, newLines),
            selectionEnd: translateIndex(args.selectionEnd, args, newLines)
        };
    };

})(typeof exports !== "undefined" ? exports : window);

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

    var translateIndex = function(index, args) {
        var newIndex = 0;
        var cursorLine = getCursorLine(index, args);
        var cursorCol  = getCursorCol(index, args);
        for(var i = 0; i < cursorLine; i++) {
            newIndex += args.outputLines[i].length + 1;
        }
        return newIndex + cursorCol;
    };

    // args: delimiter, selection array, text
    global.flowTable = function(args){
        args.lines = args.text.split("\n");
        var data = [];
        args.lines.forEach(function(l){
            data.push(l.split(args.splitter));
        });

        var widths = calculateColumnWidths(data);

        var cursorLine = getCursorLine(args.selectionEnd, args);

        var text = "";
        args.outputLines = [];
        data.forEach(function(row, i){
            // If the cursor is on the current line, don't format it
            if(cursorLine === i) {
                args.outputLines.push(args.lines[i]);
                return;
            }
            var cols = [];
            row.forEach(function(col, j) {
                cols.push(padText(col.trim(), widths[j]));
            });
            args.outputLines.push(cols.join(args.joiner));
        });

        return {
            text: args.outputLines.join("\n"),
            selectionStart: translateIndex(args.selectionStart, args),
            selectionEnd: translateIndex(args.selectionEnd, args)
        };
    };

})(typeof exports !== "undefined" ? exports : window);

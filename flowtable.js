// Copyright (C) 2012 Sam Nguyen
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

(function(global) {

    // State that we need to cache

    // Calculate the new column widths. `data` is a two-dimensional array
    // storing all the cell values
    var calculateColumnWidths = function(data) {
        var widths = [];
        data.forEach(function(row, i){
            row.forEach(function(col, j){
                if(typeof widths[j] === "undefined") {
                    widths[j] = 0;
                }

                widths[j] = Math.max(widths[j], col.length);
            });
        });
        return widths;
    };

    // Pad the given string with spaces until it reaches the given length
    var padText = function(text, length) {
        while(text.length < length) text += " ";
        return text;
    };

    // Given a index position in the entire text and lengths of each line,
    // return the line number and index on that current line that the index
    // resides on
    var getPosition = function(index, lineLengths) {
        var lineIndex = 0;
        lineLengths.forEach(function(length, i){
            lineIndex += length + 1;
            if(index < lineIndex) return [i, index-lineIndex];
        });
        console.log("getPosition", index, JSON.stringify(lineLengths), lineLengths.length, index-lineIndex);
        return [lineLengths.length, index-lineIndex];
    };

    // 
    var translatePosition = function(index, oldLines, newLines) {
        var newIndex = 0;
        var oldLineLengths = oldLines.map(function(line){ return line.length; });

        // Get line number and index position in that line for the given index
        var position = getPosition(index, oldLineLengths);

        // Add up the lengths of the new lines up to the line of the current
        // position, then add the position on that line to get the new index
        // relative to the new text
        for(var i = 0; i < position[0]; i++) {
            newIndex += newLines[i].length + 1;
        }
        return newIndex + position[1];
    };

    // flowTable
    //
    // **Params**
    // A single object with the properties:
    // - `joiner` - text to use to join columns
    // - `splitter` - text or regex to use to separate columns
    // - `selectionStart` - beginning of selection
    // - `selectionEnd`
    // - `text` - the input text
    //
    // **Returns**
    // A single object with the properties:
    // - `text` - the output text
    // - `selectionStart` - the new translated position 
    var flowTable = function(args){
        // Split the original text into a two-dimensional array
        var oldLines = args.text.split("\n");
        var data = [];
        oldLines.forEach(function(l){
            data.push(l.split(args.splitter));
        });

        // Calculate the new widths of each column
        var widths = calculateColumnWidths(data);

        // Calculate the original positions
        var oldPositions = args.positions.map(function(p){return getPosition(p, oldLines);});

        // Render the output text
        var newLines = [];
        data.forEach(function(row, i){
            // If the start or end position is on the current line, don't
            // format it (just use the original line text)
            for(var pi = 0; pi < oldPositions.length; pi++) {
                if(oldPositions[pi][0] === i) {
                    return newLines.push(oldLines[i]);
                }
            }

            // Loop through each cell in the row and pad it to the width of the
            // column, then join them together with the `joiner` text
            var cols = [];
            row.forEach(function(col, j) {
                cols.push(padText(col, widths[j]));
            });
            newLines.push(cols.join(args.joiner));
        });

        var newPositions = args.positions.map(function(p){
            return translatePosition(p, oldLines, newLines);
        });
        console.log(JSON.stringify(args.positions), JSON.stringify(newPositions));

        return {
            text:      newLines.join("\n"),
            positions: newPositions
        };
    };

    global.flowTable = flowTable;

})(typeof exports !== "undefined" ? exports : window);

/*
* Ceefax.js - HTML5 Ceefax Emulator
*
* Version: 1.0 (07 Feb 2013)
* Author: Matt Ryder (@CSMattRyder)
* Homepage: https://github.com/MattRyder/ceefax.js
* 
*/

(function ( window ) {
  'use strict';

  //Used to store the pages used in the Ceefax instance
  var Pages = [],

  CeefaxPage = window.CeefaxPage = function( page, category, headline, article ) {
      this.page = page, this.category = category, this.headline = headline, this.article = article;
  },

  Ceefax = window.Ceefax = function( canvasID, drawInterval ) {

    var getCanvasContext = function(id) {
        var canvas = document.getElementById(id);
        return(canvas) ? canvas.getContext('2d') : null;
    };

    var calculateTime = function() {
        var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

          date = new Date(),
          day = date.getDate(),
          hour = date.getHours(),
          mins = date.getMinutes(),
          secs = date.getSeconds();

        // Double-up the digits if not already:
        if(day < 10) day = '0' + day;
        if(hour < 10) hour = '0' + hour;
        if(mins < 10) mins = '0' + mins;
        if(secs < 10) secs = '0' + secs;

        return {
          'dayofweek': days[date.getDay()],
          'day': day,
          'month': months[date.getMonth()],
          'hour': hour,
          'minute': mins,
          'second': secs
        };
    };

    var generatePageNumber = function(pageNumber) {
        if(!pageNumber.toString().match(/^[0-9]{1,3}$/)) return;

        for(var i = pageNumber.toString().length; i < 3; i += 1) {
          pageNumber = '0' + pageNumber;
        }
        return pageNumber;
    };

    var drawStatusBanner = function() {
        var date = calculateTime(),
          stringSize = 0,
          drawX = 0,
          currPageNumber = currentPage ? generatePageNumber(currentPage.page) : 100,

          timeStr = date.hour + ':' + date.minute + '/' + date.second,
          dateStr = date.dayofweek + ' ' + date.day + ' ' + date.month + ' ',
          statusString = 'CEEFAX 1' + ' ' + currPageNumber + ' ' + dateStr,
          fontSize = (0.0375 * context.canvas.height);

        // If we're requesting a page, show the request process in lieu of current page
        if(isRequesting) {
          currPageNumber = requestedPageNumber;
        }

        context.font = fontSize + 'px stdTeletextFont';
        context.textBaseLine = 'middle';

        // Output the Green Page ID:
        stringSize = context.measureText('P' + currPageNumber);
        drawText('P' + currPageNumber, bounds.x, fontSize, '#0F0');
        drawX = bounds.x + stringSize.width;

        // Output the Yellow Time String:
        stringSize = context.measureText(timeStr);
        drawText(timeStr, bounds.width - stringSize.width, fontSize, '#FF0');

        context.save();
        context.scale(1.5, 1);

        //Output the Title, Page and Date String in White:
        stringSize = context.measureText(statusString);
        drawText(statusString, drawX, fontSize, '#FFF', bounds.width - context.measureText(timeStr) / 1.5);

        context.restore();
    };

    var drawHeaderBanner = function() {
        var i, bbcString = 'CND',
          pageTitle = currentPage && currentPage.category !== undefined ? currentPage.category.toUpperCase() : 'NEWS',
          boxX = bounds.x,
          boxY = bounds.height * 0.05,
          boxSpace = bounds.width * 0.01,
          boxSize = bounds.height * 0.10,
          fontX = boxX + (boxSize / 3.5),
          fontY = boxY + 4.25 * (boxSize / 5);

        context.font = 'bold ' + boxSize + 'px stdCeefaxFont';

        //Draw the three white boxes:
        for(i = 0; i < 3; i++) {
          drawRect(boxX, boxY, boxSize, boxSize, '#FFF');
          drawText(bbcString[i], fontX, fontY, '#000');

          boxX += boxSize + boxSpace;
          fontX = boxX + (boxSize / 3.5);
          fontY = boxY + 4.25 * (boxSize / 5);
        }

        //Draw the blue page title:
        var titleX = boxX + boxSpace,
          titleW = bounds.width - (boxX + boxSpace);

        drawRect(titleX, boxY, titleW, boxSize, '#00F');

        //Draw coloured text in the page title box:
        context.textAlign = 'center';
        drawText(pageTitle, boxX + (titleW / 2), fontY, '#000', titleW - 50); //Draw shadow layer
        drawText(pageTitle, boxX + (titleW / 2) + 5, fontY, '#0F0', titleW - 50); //Draw overlay
    };

    var drawArticleLine = function(articleText, x, y, colour) {
        var i = 0,
          fontSize = context.canvas.height * 0.0375;

        //Set the article font:
        context.font = 'normal ' + fontSize + 'px stdTeletextFont';
        context.textAlign = 'left';

        // Parse the article into canvas-friendly article lines, that fit within the bounds of the canvas
        var articlePhrases = createArticleLineData(context, articleText, bounds.width - (2 * bounds.x));

        // Draw each phrase/line of the article, until we're out, or hit the bottom bounds
        for(i; i < articlePhrases.length; i++) {
          drawText(articlePhrases[i], x, y, colour);
          y += fontSize;

          if(y > (context.canvas.height * 0.90) - fontSize) break;
        }

        //Return the Y-coord of the next draw position:
        return y;
    };

    var createArticleLineData = function(context, articleText, maxLineLength) {
        var wordArray = articleText.split(' '),
          phraseArray = [],
          lastPhrase = wordArray[0],
          len = maxLineLength,
          measure = 0,
          i;

        for(i = 1; i < wordArray.length; i += 1) {
          var word = wordArray[i],
            insertNewline = false;

          //If newline, splice the pre and post words back into wordArray
          if(word.indexOf('\n') !== -1) {
            var splitWords = word.split('\n');

            wordArray.splice(i, 1, splitWords[0]);
            wordArray.splice(i + 1, 0, splitWords[1]);
            word = wordArray[i];
            insertNewline = true;
          }

          measure = context.measureText(lastPhrase + word).width;

          if(measure < len) {
            lastPhrase += (lastPhrase.length == 0) ? word : ' ' + word;
          } else {
            phraseArray.push(lastPhrase);
            lastPhrase = word;
          }

          if(insertNewline) {
            phraseArray.push(lastPhrase);
            lastPhrase = '';
            phraseArray.push('');
          }

          if(i == wordArray.length - 1) {
            phraseArray.push(lastPhrase);
            break;
          }
        }

        // If there's only one word, just return the last phrase
        return(phraseArray.length > 0) ? phraseArray : new Array(lastPhrase.toString());
    };

    var summariseString = function(string, maxLength) {
        var summarisedString = '',
          strLength, i;

        if(context.measureText(string).width < maxLength) return string;

        for(i = 0; i < string.length; i += 1) {
          strLength = context.measureText(summarisedString + '...').width;

          if(strLength >= maxLength) {
            return summarisedString + '...';
          }
          summarisedString += string[i];
        }
        return summarisedString;
    };

    var drawNavigationBar = function() {
        var navX = bounds.x * 1.2,
          navY = context.canvas.height * 0.90,
          navW = bounds.width - bounds.x,
          navH = context.canvas.height * 0.085,

          fontSize = navH * 0.35,
          nextPageIndex = (pageIndex + 1 < Pages.length) ? pageIndex + 1 : 0,
          nextPageText = Pages[nextPageIndex] ? 'P' + generatePageNumber(Pages[nextPageIndex].page) : '';

        context.font = fontSize + 'px stdTeletextFont';
        drawRect(bounds.x, navY, navW, navH, '#00F');

        if(Pages.length == 0) return;

        drawText(summariseString(Pages[nextPageIndex].headline, navW * 0.75), navX, navY + fontSize, '#FFF');
        drawText(nextPageText, navW - context.measureText(nextPageText).width, navY + fontSize, '#FFF');

        nextPageIndex = (nextPageIndex + 1 < Pages.length) ? nextPageIndex + 1 : 0;
        nextPageText = Pages[nextPageIndex] ? 'P' + generatePageNumber(Pages[nextPageIndex].page) : '';

        drawText(summariseString(Pages[nextPageIndex].headline, navW * 0.75), navX, navY + 2.5 * fontSize, '#FFF');
        drawText(nextPageText, navW - context.measureText(nextPageText).width, navY + 2.5 * fontSize, '#FFF');
    };

    var drawText = function(text, x, y, colour, maxLength) {
        context.fillStyle = colour;
        if(maxLength) context.fillText(text, x, y, maxLength);
        else context.fillText(text, x, y);
    };

    var drawRect = function(x, y, w, h, colour) {
        context.fillStyle = colour;
        context.fillRect(x, y, w, h);
    };

    var draw = function() {
        var textY = context.canvas.height * 0.25;

        //Wipe screen for redraw:
        context.canvas.width = context.canvas.width;
        drawRect(0, 0, context.canvas.width, context.canvas.height, '#000');

        drawStatusBanner();
        drawHeaderBanner();

        if(currentPage) {
          textY = drawArticleLine(currentPage.headline, bounds.x, textY, '#0F0');
          textY = drawArticleLine(currentPage.article, bounds.x, textY, '#FFF');
        } else {
          currentPage = Pages[0];
        }

        drawNavigationBar();
    };

    var updateIntervalSpan = function() {
      pageIndex = (pageIndex + 1 < Pages.length) ? pageIndex + 1 : 0;
      currentPage = Pages[pageIndex];
    };

    var resetRequest = function() {
      var i;

      // Timeout expired for entering digits:
      if(isRequesting) {

        // Try to locate the page requested:
        for(i = 0; i < Pages.length; i++) {
          if(Pages[i].page == requestedPageNumber) {
            pageIndex = i;
            currentPage = Pages[pageIndex];
            break;
          }
        }

        isRequesting = false;
        requestedPageNumber = "000";
      }
    };

    var handleInput = function(event) {
      var keyCode = event.charCode || event.which;

      if(keyCode < 48 || keyCode > 57) return;

      requestedPageNumber = generatePageNumber(requestedPageNumber.substring(1) + (keyCode - 48));

      if(!isRequesting) {
        setTimeout(resetRequest, 3000);
        isRequesting = true;
      }

      // Force a redraw, update the page counter
      draw();
    };

    var context = getCanvasContext(canvasID),
        currentPage = [],
        pageIndex = 0,

        requestedPageNumber = "000",
        isRequesting = false,

        bounds = {
          'x': context.canvas.width * 0.03,
          'y': 0,
          'width': context.canvas.width * 0.975,
          'height': context.canvas.height * 0.975
        };

    // Register the Keypress event
    if(window.addEventListener) { window.addEventListener("keypress", handleInput, false); } 
    else { window.attachEvent("keypress", handleInput); }

    // If we've got the canvas, let's do some rendering!
    if(context) {
      currentPage = Pages[0];
      draw();

      setInterval(draw, drawInterval);
      setInterval(updateIntervalSpan, 10000);
    } else {
      window.alert("Ceefax.js can't get a valid Canvas Context.\nCheck the spelling of your Canvas ID, or try another browser.");
    }
  };

  /*
   * Ceefax Pages - Property to access the pages being displayed
   */
  Object.defineProperty(Ceefax, 'Pages', {
    get: function() { return Pages; },
    set: function(pages) { Pages = pages; }
  });

  // Returns a new instance of Ceefax
  Ceefax.run = function( src, refreshRate ) {
    return new Ceefax(src, refreshRate, 100);
  };
})(window);

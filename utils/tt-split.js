
$.extend(KhanUtil, {

  //initialize exercise
  createSentenceSplitter: function(sentenceObj) {
    var self = this;
    var words = sentenceObj.words;
    //place words
    $.each(words, function(i, word) {
      $("<span class='word'>"+word+"</span>").appendTo(".answers");
    });
    //add pipes and splitters
    $(".answers .word").each(function(i, wordEle) {
      $word = $(wordEle);
      if (i < words.length-1) {
        //place them in order
        var $pipe = $("<span class='pipe'></span>")
          .insertAfter(this);

        var $split = $("<span class='split'></span>")
          .insertAfter($pipe)
          .click(function() {
              $pipe.toggleClass("selected");
              self.updateSelection();
            })
          .hover(function() {
              $pipe.addClass("hover");
            }, function() {
              $pipe.removeClass("hover");
            });
      } }); //update the splitter and pipes positions programatically
    setTimeout(function() {
      self.updatePipePos();
    }, 10);
    $(window).resize(self.updatePipePos);
  },

  //Set and update the positions of the pipes and splits on resize
  updatePipePos: function() {
    var $words = $(".answers .word");
    $words.each(function(i, wordEle) {
      if (i == $words.length - 1) return;
      var $word = $(wordEle);
      var $nextWord = $(".answers .word").eq(i+1)
      var right = $nextWord.position().left - 3;
      $(".answers .pipe").eq(i)
        .css("left", right + "px")

      var left = $word.position().left + $word.width() / 2 + 6;
      var width = $word.width() / 2 + $nextWord.width() / 2 + 22;
      $(".answers .split").eq(i)
        .css("left", left + "px")
        .css("width", width + "px")
    });
  },

  //validate if the split is correct
  checkCorrectSplit: function(sentenceObj) {
    var self = this;
    var startIdx = 0;
    var correct = true;
    var $words = $(".answers").children();
    var $selected = $(".answers .pipe.selected");
    if ($selected.length == 0) return false;
    console.log($selected);
    $selected.each(function() {
      console.log(this);
      var endIdx = $(this).index()
      var part = "";
      for (var i=startIdx;i<endIdx;i++) {
        if ($words.eq(i).hasClass("word")) { 
          if (part.length) part += " ";
          part += $words.eq(i).html();
        }
      }
      var partType = self.getPartType(sentenceObj, part)
      console.log("part", partType, part)
      if (!partType) {
        correct = false;
        return;
      }
      startIdx = endIdx;
    });
    return correct;
  },

  updateSelection: function() {
    $(".answers").children().each(function() {
      $(this).removeClass("box-border box-start box-end")
    });
  
    //nothing to do
    if ($(".answers .selected").length == 0) { 
      pColor = $(".answers").parent().css("background-color");
      $(".answers").find(".word").animate({backgroundColor: pColor}, 100);
      return;
    }

    //select until every split
    var _colors = $.extend([], colors);
    var startIdx = 0;
    var $selected = $(".answers .selected");
    for (var i=0;i<=$selected.length;i++) {
      var endIdx = i<$selected.length ? 
        $selected.eq(i).index() : $(".answers").children().last().index()
      //wrong way to get colors
      var color = shadeColor(_colors[Object.keys(_colors)[0]], 30);
      delete _colors[Object.keys(_colors)[0]];
      this.selectWords(startIdx, endIdx, color);
      startIdx = endIdx+2;
    }
  },

  selectWords: function(startIdx, endIdx, color) {
    var $ele = $(".answers").children().eq(startIdx);
    this.setDefaultColor($ele);
    $ele.addClass("box-start");
    for (var i=startIdx; i<=endIdx; i++) {
      this.setDefaultColor($ele);
      var $ele = $(".answers").children().eq(i);
      if (!$ele.hasClass("word")) continue;
      $ele.addClass("box-border").data("color", color);
    }
    //look for end, depending if is a middle box or the last
    for (var i=endIdx-1; i<=endIdx+1; i++) {
      var $ele = $(".answers").children().eq(i);
      if (!$ele.hasClass("word")) continue;
      this.setDefaultColor($ele);
      $ele.addClass("box-end");
      break;
    }
  },


  setLighterColor: function(ele) {
    var color = $(ele).first().data("color");
    color = shadeColor(color, 10);
    $(ele).animate({
      backgroundColor: color,
      borderColor: color,
    }, 100);
  },

  setDefaultColor: function(ele) {
    var color = $(ele).first().data("color");
    $(ele).animate({
      backgroundColor: color,
      borderColor: color,
    }, 100);
  },


  /*
   from here split, check and place the parts in boxes
  */
  levelParts: [
    [], //0
    ['pv'],//1
    ['pv','ond','overige zinsdelen'],
    ['pv','ond','wwg','overige zinsdelen'],
    ['pv','ond','lv','wwg','overige zinsdelen'],
    [],//5
    ['pv','ond','lv','overige zinsdelen'],
    [],
    [],
    [],
    [ 'pv','ond','lv','mwv','overige zinsdelen'], //10
    [],
    ['pv','ond','lv', 'wwg','mwv','overige zinsdelen'],
    [],
    ['pv','ond','lv', 'wwg','mwv', 'bb','overige zinsdelen'],
    [], //15
    ['pv','ond','lv', 'wwg','mwv', 'bb','nwg','overige zinsdelen']
  ],

  createAnswerBoxes: function(level) {
    var selected = this.levelParts[level];
    for (var i=0;i<selected.length - 1;i++) {
      $box = $("<div class='parts'>"+
                "<span class='part-name'>"+selected[i]+"</span>"+
                "<span class='part-target'></span>"+
                "</div>");
      $box.appendTo(".boxes");
      $(".boxes").hide();
    }
  },

  checkFinish: function() {
    var oneEmpty = false;
    $(".boxes").children().each(function() {
      if ($(this).find(".part-target").is(":empty")) {
        oneEmpty = true;
      };
    });
    if (oneEmpty) {
      $("#answercontent").fadeOut();
    } else {
      $("#answercontent").fadeIn();
    }
  },

  attachHover: function(words) {
    var self = this;
    $(words).addClass("selectable")
    /*
        
      .hover(function() {
        $(this).data("hovered", true);
        //group hovered
        self.setLighterColor(self.getPartWords(this));
      }, function() {
        var $words = self.getPartWords(this);
        $(this).data("hovered", false);
        setTimeout(function() {
          var count = 0;
          $words.each(function() {
            if ($(this).data("hovered") == true) {
              count++;
            }
          });
          if (count == 0) {
            //group unhovered
            self.setDefaultColor($words);
          }
        }, 1);
      })
    */
      .click(function() {
        var $words = self.getPartWords(this);
        self.partClicked($words);
      })
  },

  startCheckSplitButton: function(sentenceObj, level) {
    var self = this;
    //$("#check-answer-button").hide();
    $("#answercontent").hide();
    $("#check-split").click(function() {
      if (self.checkCorrectSplit(sentenceObj)) {
        $(this).fadeOut(function() {
          $(".answers .pipe").fadeOut();
          $(".answers .split").hide();
          self.createAnswerBoxes(level);
          self.attachHover($(".answers .word"));
          $(".boxes").fadeIn();
        });
      } else {
        $(".check-split-wrapper")
          .effect("shake", {times: 3, distance: 5}, 480)
        $("#check-split").val("Try again!");
      }
    });
  },

  test2b: function() {
    setTimeout(function() {
    $(".split").eq(1).click();
    $("#check-split").click();
    }, 100);
  },
  
  moveCloneBack: function(target) {
    var $target = $(target);
    $cloned = $target.find(".word");
    var incLeft = $cloned.data("incLeft");
    var prevTop = $cloned.data("prevTop");
    $cloned.animate({left:"-="+incLeft+"px", top:prevTop+"px"}, function() {
      $(this).remove();
    });
  },

  targetClickedBack: function(target) {
    var self = this;
    var $target = $(target);
    //recover color 
    $target.animate({"background-color": this.getBgColor()}, 100);
    //mark as empty
    $target.removeClass("filled")

    //get original sentence group of words
    var $firstWord = $target.find(".word").first();
    var words = this.getPartWords($firstWord);
    $(words).animate({"background-color": $firstWord.data("color")}, 100);

    //place back cloned words;
    this.moveCloneBack($target);

    //make words clickable again
    this.attachHover(words);
    //disable check button
    self.checkFinish();
  },

  getBgColor: function() {
    return $(".answers").parent().css("background-color");
  },

  moveClone2Target: function($clone, $target) {
    var $target = $target.find(".part-target");
    $clone.appendTo($target);
    var pos = $clone.offset();
    var newPos = $target.offset();
    var incLeft = newPos.left - pos.left + 20;
    $clone.animate({
      left:"+="+incLeft+"px", 
      top:newPos.top+"px"}
    ).data({
      incLeft: incLeft,
      prevTop: pos.top
    });
  },
  
  targetClicked: function(target) {
    var $target = $(target);
    if ($target.hasClass("filled")) return;


    var self = this;
    var $words = $(".word.selected");
    var color = $words.first().data("color")


    //unselectable boxes
    $(".boxes").find(".parts, .part-name").removeClass("selectable");
    //no more posible to click
    $(".boxes").find(":not(.filled)").unbind("click");
    //mark target as used
    $target.addClass("filled");
    //restore bg color
    $words.animate({
       "background-color": this.getBgColor(),
       "border-color": this.getBgColor()
    }, 100);
    //remove click for words
    $words.unbind('click mouseenter mouseleave').removeClass("selectable");
    //clone words
    var $clone = $words.clone()
      .css({
        "position":"absolute", 
        "background-color":""
      })
    //set the position
    $clone.each(function(i, ele) {
      var pos = $words.eq(i).offset()
      $(this).css({
        "left": pos.left + "px",
        "top": pos.top + "px"
      }).data("color", color);
    });
    //set target bg color as the same
    //remove click from traget
    $target.animate({
      "background-color": color
    }, 100).unbind("click");
    //add click to put it back
    $target.click(function() {
      self.targetClickedBack(this);
    });
    this.moveClone2Target($clone, $target)

    //$(".boxes").children().each(function(i, ele) {
    //  if ($(ele).find(".part-target").is(":empty")) {
    //    console.log('unbind click', ele);
    //    $(ele).unbind("click");
    //  }
    //});
    //var fistPos = $words.first().offset();

    //check is disable/enable check button
    this.checkFinish();
  },

  partClicked: function($words) {
    var self = this;
    $(".word").removeClass("selected");
    $words.addClass("selected");

    //selectable target boxes
    var $parts = $(".boxes").find(".parts:not(.filled)")
    $parts.addClass("selectable");
    $parts.children().addClass("selectable");

    $words.animate({borderColor: "#990000"}, 100);
    $(".boxes").children().click(function() {
      self.targetClicked(this);
    });
    $words.unbind('mouseenter mouseleave');
  },
  getPartWords: function(word) {
    var bgColor = $(word).data("color");
    var words = [];
    $(".answers").find(".word").each(function() {
      if ($(this).data("color") == bgColor) {
        words.push(this);
      }
    });
    return $(words);
  }
})

(function () {
  "use strict";

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //
  // H E L P E R    F U N C T I O N S
  //
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Function to check if we clicked inside an element with a particular class
   * name.
   *
   * @param {Object} e The event
   * @param {String} className The class name to check against
   * @return {Boolean}
   */
  function clickInsideElement(e, className) {
    var el = e.srcElement || e.target;

    if (el.classList.contains(className)) {
      return el;
    } else {
      while ((el = el.parentNode)) {
        if (el.classList && el.classList.contains(className)) {
          return el;
        }
      }
    }

    return false;
  }

  /**
   * Get's exact position of event.
   *
   * @param {Object} e The event passed in
   * @return {Object} Returns the x and y position
   */
  function getPosition(e) {
    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;

    if (e.pageX || e.pageY) {
      posx = e.pageX;
      posy = e.pageY;
    } else if (e.clientX || e.clientY) {
      posx =
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft;
      posy =
        e.clientY +
        document.body.scrollTop +
        document.documentElement.scrollTop;
    }

    return {
      x: posx,
      y: posy,
    };
  }

  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////
  //
  // C O R E    F U N C T I O N S
  //
  //////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////

  /**
   * Variables.
   */
  var contextMenuClassName = "context-menu";
  var contextMenuItemClassName = "context-menu__item";
  var contextMenuLinkClassName = "context-menu__link";
  var contextMenuActive = "context-menu--active";

  var taskItemClassName = "task";
  var taskItemInContext;

  var clickCoords;
  var clickCoordsX;
  var clickCoordsY;

  var menu = document.querySelector("#context-menu");
  var menuItems = menu.querySelectorAll(".context-menu__item");
  var menuState = 0;
  var menuWidth;
  var menuHeight;
  var menuPosition;
  var menuPositionX;
  var menuPositionY;

  var windowWidth;
  var windowHeight;

  var rangeSlider = document.querySelector("#range-slider");
  var rangeSliderValue = document.querySelector("#range-slider-value");

  let readalong = document.querySelector("body > read-along").shadowRoot;

  /**
   * Initialise our application's code.
   */
  function init() {
    contextListener();
    clickListener();
    keyupListener();
    resizeListener();
    sliderListener();
    buttonListener();
  }

  /**
   * Listens for contextmenu events.
   */
  function contextListener() {
    document.addEventListener("contextmenu", function (e) {
      taskItemInContext = lookupElement(e);
      // taskItemInContext = clickInsideElement( e, taskItemClassName );

      if (taskItemInContext) {
        e.preventDefault();
        toggleMenuOn(taskItemInContext);
        positionMenu(e);
      } else {
        taskItemInContext = null;
        toggleMenuOff();
      }
    });
  }

  function lookupElement(e) {
    let container = readalong.querySelector("[data-cy=text-container]");

    if (isPointerEventInsideElement(e, container)) {
      let pages = container.querySelectorAll(".page");
      for (let i = 0; i < pages.length; i++) {
        if (isPointerEventInsideElement(e, pages[i])) {
          let paragraphs = pages[i].querySelectorAll(".page__col__text");
          for (let j = 0; j < paragraphs.length; j++) {
            if (isPointerEventInsideElement(e, paragraphs[j])) {
              let sentences = paragraphs[j].querySelectorAll(".sentence");
              for (let k = 0; k < sentences.length; k++) {
                if (isPointerEventInsideElement(e, sentences[k])) {
                  let words = sentences[k].querySelectorAll(".sentence__word");
                  for (let l = 0; l < words.length; l++) {
                    let word = words[l];
                    if (isPointerEventInsideElement(e, word)) {
                      console.log(word);
                      return word;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // let container = readalong.querySelector(
    //   "#read-along-container > div > div > div"
    // );

    // if (isPointerEventInsideElement(e, container)) {
    //   for (let i = 0; i < container.childNodes.length; i++) {
    //     let paragraph = container.childNodes[i];
    //     if (isPointerEventInsideElement(e, paragraph)) {
    //       for (let j = 0; j < paragraph.childNodes.length; j++) {
    //         let sentences = paragraph.childNodes[j];
    //         for (let k = 0; k < sentences.childNodes.length; k++) {
    //           let word = sentences.childNodes[k];
    //           if (isPointerEventInsideElement(e, word)) {
    //             console.log(word);
    //             return word;
    //           }
    //         }
    //       }
    //     }
    //   }
  }

  function isPointerEventInsideElement(event, element) {
    var pos = {
      x:
        (event.targetTouches ? event.targetTouches[0].pageX : event.pageX) -
        scrollX,
      y:
        (event.targetTouches ? event.targetTouches[0].pageY : event.pageY) -
        scrollY,
    };
    var rect = element.getBoundingClientRect();
    return (
      pos.x < rect.right &&
      pos.x > rect.left &&
      pos.y < rect.bottom &&
      pos.y > rect.top
    );
  }

  /**
   * Listens for click events.
   */
  function clickListener() {
    document.addEventListener("click", function (e) {
      var clickeElIsLink = clickInsideElement(e, contextMenuLinkClassName);

      if (clickeElIsLink) {
        e.preventDefault();
        menuItemListener(clickeElIsLink);
      } else {
        if (!clickInsideElement(e, contextMenuClassName)) {
          var button = e.which || e.button;
          if (button === 1) {
            toggleMenuOff();
          }
        }
      }
    });
  }

  /**
   * Listens for keyup events.
   */
  function keyupListener() {
    window.onkeyup = function (e) {
      if (e.keyCode === 27) {
        toggleMenuOff();
      }
    };
  }

  /**
   * Window resize event listener
   */
  function resizeListener() {
    window.onresize = function (e) {
      toggleMenuOff();
    };
  }

  function sliderListener() {
    rangeSliderValue.innerHTML = rangeSlider.value + "ms";
    rangeSlider.oninput = function () {
      rangeSliderValue.innerHTML = this.value + "ms";
    };
  }

  function buttonListener() {
    document
      .querySelector('[data-action="play"]')
      .addEventListener("click", function () {
        window.wavesurfer.playPause();
      });

    document
      .querySelector('[data-action="play-region"]')
      .addEventListener("click", function () {
        let region = Object.values(wavesurfer.regions.list)[0];
        if (region) {
          region.play();
        }
      });

    document
      .querySelector('[data-action="export"]')
      .addEventListener("click", function () {
        let container = readalong.querySelector(
          "#read-along-container > div > div > div"
        );

        let data = extractData();
        console.log(JSON.stringify(data, null, 2));

        // let paragraphs = [];
        // for (let i = 0; i < container.childNodes.length; i++) {
        //   let paragraph = container.childNodes[i];
        //   let sentences = [];
        //   for (let j = 0; j < paragraph.childNodes.length; j++) {
        //     let sentence = paragraph.childNodes[j];
        //     let wordList = [];
        //     for (let k = 0; k < sentence.childNodes.length; k++) {
        //       let word = sentence.childNodes[k];
        //       let text = word.textContent.replace(/&/g, '&amp;')
        //       .replace(/</g, '&lt;')
        //       .replace(/>/g, '&gt;')
        //       .replace(/"/g, '&quot;')

        //       if (word.getAttribute("data-anchor") != null){
        //         let time = word.getAttribute("data-anchor");
        //         wordList.push(`<anchor time="${time}ms"/>`);
        //       }
        //       wordList.push(text.length == 0 ? " " : text);
        //     }
        //     sentences.push(wordList);
        //   }
        //   paragraphs.push(sentences);
        // }

        // let result = "";
        // for (let paragraph of paragraphs){
        //   result += "<p>\n";
        //   for (let sentence of paragraph) {
        //     result += "\t<s>";
        //     for (let word of sentence) {
        //       result +=(word);
        //     }
        //     result += "</s>\n";
        //   }
        //   result+= "</p>\n";
        // }

        // prompt("Result", result);
      });
  }

  /**
   * Turns the custom context menu on.
   */
  function toggleMenuOn(element) {
    // if (menuState !== 1) {
    //   menuState = 1;
    menu.classList.add(contextMenuActive);

    let actionButton = document.querySelector("#actionButton");
    actionButton.childNodes[2].nodeValue = element.classList.contains("anchor")
      ? "Update"
      : "Insert";

    let id = element.getAttribute("id");
    let anchor = element.getAttribute("data-anchor") || 0;

    menu.setAttribute("data-id", id);
    rangeSlider.value = anchor;
    rangeSliderValue.innerHTML = anchor + "ms";
    // }
  }

  /**
   * Turns the custom context menu off.
   */
  function toggleMenuOff() {
    // if (menuState !== 0) {
    //   menuState = 0;
    menu.classList.remove(contextMenuActive);
    // }
  }

  /**
   * Positions the menu properly.
   *
   * @param {Object} e The event
   */
  function positionMenu(e) {
    clickCoords = getPosition(e);
    clickCoordsX = clickCoords.x;
    clickCoordsY = clickCoords.y;

    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    if (windowWidth - clickCoordsX < menuWidth) {
      menu.style.left = windowWidth - menuWidth + "px";
    } else {
      menu.style.left = clickCoordsX + "px";
    }

    if (windowHeight - clickCoordsY < menuHeight) {
      menu.style.top = windowHeight - menuHeight + "px";
    } else {
      menu.style.top = clickCoordsY + "px";
    }
  }

  /**
   * Dummy action function that logs an action when a menu item link is clicked
   *
   * @param {HTMLElement} link The link that was clicked
   */
  function menuItemListener(link) {
    let taskId = menu.getAttribute("data-id");
    let action = link.getAttribute("data-action");

    console.log("Task ID - " + taskId + ", Task action - " + action);

    let element = readalong.querySelector(`#${taskId}`);
    switch (action) {
      case "add-anchor":
        if (rangeSlider.value == 0) {
          if (!element.classList.contains("anchor")) {
            alert("Please select a delay value");
          } else {
            element.removeAttribute(`data-anchor`);
            element.classList.remove("anchor");
          }
        } else {
          if (rangeSlider.value == element.getAttribute(`data-anchor`)) {
            alert("You have not change any value");
          } else {
            element.setAttribute(`data-anchor`, rangeSlider.value);
            element.classList.add("anchor");
          }
        }
        break;
      case "remove-anchor":
        element.removeAttribute(`data-anchor`);
        element.classList.remove("anchor");
        break;
    }

    toggleMenuOff();
  }

  function getXML(path) {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", path, false);
    xmlhttp.addEventListener("error", function (error) {
      console.log(error);
    });
    xmlhttp.send();

    return xmlhttp.responseText;
  }

  function extractData() {
    let container = readalong.querySelector("[data-cy=text-container]");

    let pagesList = [];
    let pages = container.querySelectorAll(".page");
    for (let i = 0; i < pages.length; i++) {
      let paragraphs = pages[i].querySelectorAll(".page__col__text");
      let paragraphsList = [];
      for (let j = 0; j < paragraphs.length; j++) {
        let sentences = paragraphs[j].querySelectorAll(".sentence");
        let sentencesList = [];
        for (let k = 0; k < sentences.length; k++) {
          let words = sentences[k].querySelectorAll(".sentence__word");
          let wordsList = [];
          for (let l = 0; l < words.length; l++) {
            let word = words[l];
            let text = word.textContent
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;");

            let tmp = {
              text: text.length == 0 ? " " : text,
              anchor: word.getAttribute("data-anchor") || "0"
            };

            if (text == "ᐁ") {
              debugger;
            }
            wordsList.push(tmp);
          }
          if (wordsList.length > 0) {
            sentencesList.push(wordsList);
          }
        }
        if (sentences.length > 0) {
          paragraphsList.push(sentencesList);
        }
      }
      if (paragraphs.length > 0) {
        pagesList.push(paragraphsList);
      }
    }

    prompt("Result : ", JSON.stringify(pagesList, null, 2));
    return pagesList;
  }

  /**
   * Run the app.
   */
  init();
})();

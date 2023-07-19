import * as DOMPurify from "dompurify";
import html2md from "html-to-md";

//Services
import { calculateReadTime } from "../../../services/utils";
import { createContent } from "../../../services/content";

const randomNumberBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const onAnimationButtonClick = (container, sparklesCount) => {
  // Letter animation
  container.querySelectorAll('.summarize__animated-letter').forEach((el, i) => {
    el.animate([
      { transform: 'translateY(0px)' },
      { transform: 'translateY(-16px)' },
    ], {
      duration: 200,
      delay: i * 50,
      fill: 'forwards'
    });
  });

  // Sparkle animation
  for (let i = 0; i < sparklesCount; i++) {
    const sparkle = container.querySelector(`.sparkle-${i}`);
    sparkle.animate([
      { transform: 'translate(0px, 0px)', opacity: 0 },
      { transform: `translate(${randomNumberBetween(-100, 100)}px, ${randomNumberBetween(-100, 100)}px)`, opacity: 1 },
    ], {
      duration: 500,
      easing: 'ease-out',
      fill: 'forwards'
    });

    // Add fade-out animation after the previous animation
    sparkle.animate([
      { opacity: 1 },
      { opacity: 0 }
    ], {
      delay: 500, // Delay the start of the fade-out animation by the duration of the previous animation
      duration: 500, // Set the duration for the fade-out animation
      easing: 'ease-in',
      fill: 'forwards'
    });
  }

  // Button scaling animation
  const button = container.querySelector('#summarize__animation-button');
  button.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(0.8)' },
    { transform: 'scale(1)' }
  ], {
    duration: 200,
    fill: 'forwards'
  });
};

// Check given item against blacklist, return null if in blacklist
const blacklist = ["comment"];
function checkAgainstBlacklist(elem, level) {
  if (elem && elem != null) {
    const className = elem.className,
      id = elem.id;

    const isBlackListed = blacklist
      .map((item) => {
        if (
          (typeof className === "string" && className.indexOf(item) >= 0) ||
          (typeof id === "string" && id.indexOf(item) >= 0)
        ) {
          return true;
        }
      })
      .filter((item) => item)[0];

    if (isBlackListed) {
      return null;
    }

    const parent = elem.parentElement;
    if (level > 0 && parent && !parent.isSameNode(document.body)) {
      return checkAgainstBlacklist(parent, --level);
    }
  }

  return elem;
}

let contentSelector;
function getContainer() {
  let selectedContainer;

  if (contentSelector && document.querySelector(contentSelector)) {
    selectedContainer = document.querySelector(contentSelector);
  } else if (document.head.querySelector("meta[name='articleBody'")) {
    selectedContainer = document.createElement("div");
    selectedContainer.innerHTML = DOMPurify.sanitize(
      document.head
        .querySelector("meta[name='articleBody'")
        .getAttribute("content")
    );
  } else {
    const numWordsOnPage = document.body.innerText.match(/\S+/g).length;
    let ps = document.body.querySelectorAll("p");

    // Find the paragraphs with the most words in it
    let pWithMostWords = document.body,
      highestWordCount = 0;

    if (ps.length === 0) {
      ps = document.body.querySelectorAll("div");
    }

    ps.forEach((p) => {
      if (
        checkAgainstBlacklist(p, 3) && // Make sure it's not in our blacklist
        p.offsetHeight !== 0
      ) {
        //  Make sure it's visible on the regular page
        const myInnerText = p.innerText.match(/\S+/g);
        if (myInnerText) {
          const wordCount = myInnerText.length;
          if (wordCount > highestWordCount) {
            highestWordCount = wordCount;
            pWithMostWords = p;
          }
        }
      }

      // Remove elements in JR that were hidden on the original page
      if (p.offsetHeight === 0) {
        p.dataset.simpleDelete = true;
      }
    });

    // Keep selecting more generally until over 2/5th of the words on the page have been selected
    selectedContainer = pWithMostWords;
    let wordCountSelected = highestWordCount;

    while (
      wordCountSelected / numWordsOnPage < 0.4 &&
      selectedContainer != document.body &&
      selectedContainer.parentElement.innerText
    ) {
      selectedContainer = selectedContainer.parentElement;
      wordCountSelected = selectedContainer.innerText.match(/\S+/g).length;
    }

    // Make sure a single p tag is not selected
    if (selectedContainer.tagName === "P") {
      selectedContainer = selectedContainer.parentElement;
    }
  }

  return selectedContainer;
}

function getContentOfArticle() {
  let pageSelectedContainer = getContainer();

  const pattern1 = /<a\b[^>]*>(.*?)<\/a>/gi;
  pageSelectedContainer.innerHTML = DOMPurify.sanitize(
    pageSelectedContainer.innerHTML.replace(pattern1, "")
  );
  const pattern2 = new RegExp("<br/?>[ \r\ns]*<br/?>", "g");
  pageSelectedContainer.innerHTML = DOMPurify.sanitize(
    pageSelectedContainer.innerHTML.replace(pattern2, "</p><p>")
  );

  let content = DOMPurify.sanitize(pageSelectedContainer.innerHTML);
  content = html2md(content);
  
  return content;
}

function addStylesheet(doc, link, classN) {
  const path = chrome.runtime.getURL(link),
    styleLink = document.createElement("link");

  styleLink.setAttribute("rel", "stylesheet");
  styleLink.setAttribute("type", "text/css");
  styleLink.setAttribute("href", path);

  if (classN) styleLink.className = classN;

  doc.appendChild(styleLink);

  const style = document.createElement("style");
  style.textContent = `
    :host {
      all: initial;
    }
    .summarize-gpt-container * {
      font-family: sans-serif;
      line-height: normal;
      font-size: 16px;
    }
  `;
  doc.appendChild(style);
}

function copyTextToClipboard(text) {
  var copyButton = document.querySelector("#copy-button");
  navigator.clipboard.writeText(text).then(function () {
    copyButton.textContent = 'Copied';
  }, function () {
    copyButton.textContent = 'Failed';
  });
}

const ce = ({ props, tag, children, name }, elementsObj) => {
  const elm = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === "style") {
      Object.entries(v).forEach(([k2, v2]) => {
        elm.style[k2] = v2;
      });
    } else {
      elm[k] = v;
    }
  });
  if (children) {
    children.forEach((x) => {
      if (x) {
        const child = ce(x, elementsObj);
        elm.appendChild(child);
      }
    });
  }
  if (name && elementsObj) {
    // eslint-disable-next-line no-param-reassign
    elementsObj[name] = elm;
  }
  return elm;
};

function createContainer() {
  return ce(createContent());
}

function setTabs(container){
  const tabItems = container.getElementsByClassName("summarize__tab-item");
  const tabsByIds = { 0: 'home', 1: 'prompts', 2: 'plans', 3: 'help' }
  const activeTabClasses = ["sumz-border-b-2", "sumz-border-violet-400", "sumz-text-gray-950"];

  for (let i = 0; i < tabItems.length; i++) {
    if (i > 0) {
      container.querySelector("#summarize__" + tabsByIds[i]).style.display = 'none';
    }

    tabItems[i].addEventListener("click", function () {
      for (let count = 0; count < tabItems.length; count++) {
        tabItems[count].classList.remove(...activeTabClasses)
        container.querySelector("#summarize__" + tabsByIds[count]).style.display = 'none';
      }
      tabItems[i].classList.add(...activeTabClasses)
      container.querySelector("#summarize__" + tabsByIds[i]).style.display = 'block';
    })
  }

  tabItems[0].classList.add(...activeTabClasses)
}

async function run() {
  const container = createContainer();

  let root = document.createElement('div');
  root.id = "summarize-root";
  document.body.appendChild(root);

  let shadowRoot = root.attachShadow({ mode: 'open' });

  // Appending the styles to the shadow root
  if (!shadowRoot.querySelector(".summarize-styles"))
    addStylesheet(shadowRoot, "styles.css", "summarize-styles");

  shadowRoot.appendChild(container);

  // Adding styles to position the root
  root.style.position = 'fixed';
  root.style.zIndex = '9999'; // Make sure it's on top of other elements

  const innerContainerBody = container.querySelector("#summarize__body");
  innerContainerBody.innerHTML = '<p>Waiting for ChatGPT response...</p>';

  const closeButton = container.querySelector("#summarize__close-button");
  closeButton.addEventListener("click", function () {
    document.body.removeChild(root);
  });

  setTabs(container)

  let content;
  let selection = window.getSelection();

  if (selection.isCollapsed) {
    content = getContentOfArticle();
  } else {
    content = selection.toString();
  }

  const readTime = calculateReadTime(content)
  const innerWarningHeader = container.querySelector("#summarize__time_read_message");
  const timeReadMessage = innerWarningHeader.innerHTML.replace("${readTime}", readTime)
  innerWarningHeader.innerHTML = timeReadMessage;

  const port = chrome.runtime.connect();
  port.onMessage.addListener(function (msg) {
    if (msg.answer) {
      innerContainerBody.innerHTML = msg.answer;
    } else if (msg.error === "UNAUTHORIZED") {
      innerContainerBody.innerHTML =
        '<p>Please login at <a href="https://chat.openai.com" target="_blank">chat.openai.com</a></p>';
    } else {
      innerContainerBody.innerHTML = "<p>Failed to load response from ChatGPT</p>";
    }
  });
  port.postMessage({ content });
}

run();

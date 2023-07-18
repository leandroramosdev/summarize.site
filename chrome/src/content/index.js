import * as DOMPurify from "dompurify";
import html2md from "html-to-md";
import CrossIC from "../../../assets/res/cross.svg";
import WarnningIC from "../../../assets/res/warning_icon.svg";

//Services
import { calculateReadTime } from "../../../services/utils";

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

function createTabs() {
  let listTabsName = ["Home", "Prompts", "Plans", "Help"];
  let listTabs = listTabsName.map((tab, index) => {
    let defaultClass = "summarize__tab-item sumz-cursor-pointer sumz-text-center hover:sumz-text-gray-600 hover:sumz-border-b-gray-300 hover:sumz-border-b-2 sumz-h-[24px] sumz-w-[20%] ";
    return {
      tag: "li",
      props: {
        id: "summarize__tab-item-" + index,
        className: defaultClass,
        innerText: tab
      },
    };
  })

  let tabs = {
    tag: "ul",
    props: {
      id: "summarize__tabs",
      className: "sumz-flex sumz-justify-between sumz-h-full sumz-w-full sumz-overflow-y-auto sumz-px-4 sumz-mt-4"
    },
    children: listTabs,
  }

  return tabs;
}

function createHomeContainer() {
  let homeContainer = {
    tag: "div",
    props: {
      id: "summarize__home",
      className: "sumz-max-h-[80%] sumz-w-full sumz-overflow-y-auto"
    },
    children: [
      {
        tag: "div",
        props: {
          id: "summarize__home_header",
          className: "sumz-p-4"
        },
        children: [
          {
            tag: "div",
            props: {
              id: "summarize__home_header_warning",
              className: "sumz-w-full sumz-h-12 sumz-flex sumz-items-center sumz-justify-center sumz-mt-2 sumz-bg-teal-200 sumz-rounded-lg sumz-p-1"
            },
            children: [
              { 
                tag: "img", 
                props: { id: "summarize__warning-icon", 
                  className: "sumz-h-[24px] sumz-w-12 sumz-cursor-pointer sumz-mr-2", 
                  src: WarnningIC, 
                  alt: "warning" 
                } 
              },
              {
                tag: "span",
                props: {
                  id: "summarize__time_read_message",
                  className: "!sumz-text-[14px]",
                  innerText: 'Summarize already saved you ${readToTime} of unnecessary reading.'
                }
              }
            ]
          },
        ]
      },
      // divider
      { tag: "div", props: { className: "sumz-w-full sumz-h-[2px] sumz-bg-gray-300" } },
      {
        tag: "div",
        props: {
          className: "sumz-p-4"
        },
        children: [
          {
            tag: "div",
            props: {
              id: "summarize__body",
              className: "sumz-p-2 sumz-rounded-md sumz-max-h-[160px] sumz-overflow-auto sumz-bg-gray-200 sumz-text-3-xl sumz-mb-2 sumz-flex sumz-flex-col sumz-whitespace-pre-line sumz-text-gray-700"
            },
          },
        ]
      },
    ],
  };

  return homeContainer;
}

function createPromptsContainer() {
  let promptsContainer = {
    tag: "div",
    props: {
      id: "summarize__prompts",
      className: "",
      innerHTML: "prompts"
    },
  };

  return promptsContainer;
}

function createPlansContainer() {
  let plansContainer = {
    tag: "div",
    props: {
      id: "summarize__plans",
      className: "",
      innerHTML: "plans"
    },
  };

  return plansContainer;
}

function createHelpContainer() {
  let helpContainer = {
    tag: "div",
    props: {
      id: "summarize__help",
      className: "",
      innerHTML: "help"
    },
  };

  return helpContainer;
}

function createContainer() {
  return ce({
    tag: "div",
    props: { className: "summarize-gpt-container" },
    children: [
      {
        tag: "div",
        props: { className: "sumz-min-w-[30%] sumz-max-h-[80%] sumz-max-w-[30%] sumz-fixed sumz-right-4 sumz-top-8 sumz-flex sumz-flex-col sumz-items-center sumz-justify-center sumz-rounded-lg sumz-bg-white sumz-shadow-md" },
        children: [
          // heading
          {
            tag: "div",
            props: { className: "sumz-flex sumz-h-[40px] sumz-w-full sumz-items-center sumz-justify-between sumz-rounded-t-lg sumz-bg-gray-200 sumz-px-4" },
            children: [
              {
                tag: "div",
                props: { id: "summarize__heading-text", className: "sumz-text-xl sumz-font-black sumz-animate-text sumz-bg-gradient-to-r sumz-from-teal-500 sumz-via-purple-500 sumz-to-orange-500 sumz-bg-clip-text sumz-text-transparent" },
              },
              { tag: "img", props: { id: "summarize__close-button", className: "sumz-h-[24px] sumz-w-6 sumz-cursor-pointer sumz-rounded-lg hover:sumz-bg-sky-200", src: CrossIC, alt: "close" } }
            ],
          },
          // body
          {
            tag: "div",
            props: { className: "sumz-flex-row sumz-w-full sumz-max-h-[80%] sumz-items-center sumz-rounded-t-lg sumz-px-2 sumz-mb-2" },
            children: [
              createTabs(),
              {
                tag: "div",
                props: {
                  className: "sumz-bg-gray-200 sumz-max-h-[80%] sumz-p-4",
                },
                children: [
                  {
                    tag: "div",
                    props: {
                      className: "sumz-white sumz-max-h-[60%] sumz-rounded-lg sumz-bg-white",
                    },
                    children: [
                      createHomeContainer(),
                      createPromptsContainer(),
                      createPlansContainer(),
                      createHelpContainer()
                    ]
                  },
                ]
              }
            ],
          },
        ],
      },
    ],
  });
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

  const tabItems = container.getElementsByClassName("summarize__tab-item");
  const tabsByIds = { 0: 'home', 1: 'prompts', 2: 'plans', 3: 'help' }
  for (let i = 0; i < tabItems.length; i++) {
    if (i > 0) {
      container.querySelector("#summarize__" + tabsByIds[i]).style.display = 'none';
    }

    tabItems[i].addEventListener("click", function () {
      for (let count = 0; count < tabItems.length; count++) {
        tabItems[count].classList.remove("sumz-border-b-2", "sumz-border-violet-400")
        container.querySelector("#summarize__" + tabsByIds[count]).style.display = 'none';
      }
      tabItems[i].classList.add("sumz-border-b-2", "sumz-border-violet-400")
      container.querySelector("#summarize__" + tabsByIds[i]).style.display = 'block';
    })
  }

  tabItems[0].classList.add("sumz-border-b-2", "sumz-border-violet-400")

  const closeButton = container.querySelector("#summarize__close-button");
  closeButton.addEventListener("click", function () {
    document.body.removeChild(root);
  });

  let content;
  let selection = window.getSelection();

  if (selection.isCollapsed) {
    content = getContentOfArticle();
  } else {
    content = selection.toString();
  }

  const readTime = calculateReadTime(content)

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

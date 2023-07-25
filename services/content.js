import CrossIC from "../assets/res/cross.svg";
import WarnningIC from "../assets/res/warning_icon.webp";

export function createContent() {
    const content = {
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
    };

    return content;
}

function createTabs() {
    let defaultClass = "summarize__tab-item sumz-text-gray-700 sumz-cursor-pointer sumz-text-center hover:sumz-text-gray-900 hover:sumz-border-b-gray-300 hover:sumz-border-b-2 sumz-h-[24px] sumz-w-[20%] ";
    let listTabsName = ["Home", "Prompts", "Plans", "Help"];
    let listTabs = listTabsName.map((tab, index) => {
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
                            className: "sumz-w-full sumz-h-16 sumz-flex sumz-items-center sumz-justify-center sumz-bg-teal-200 sumz-rounded-lg sumz-p-1"
                        },
                        children: [
                            {
                                tag: "img",
                                props: {
                                    id: "summarize__warning-icon",
                                    className: "sumz-h-[24px] sumz-w-12 sumz-cursor-pointer sumz-mr-2",
                                    src: WarnningIC,
                                    alt: "warning"
                                }
                            },
                            {
                                tag: "span",
                                props: {
                                    id: "summarize__time-read-message",
                                    className: "!sumz-text-[14px] sumz-text-teal-900 sumz-py-2",
                                    innerText: 'Summarize already saved you ${readTime} of unnecessary reading.'
                                }
                            }
                        ]
                    },
                ]
            },
            // divider
            { tag: "div", props: { className: "sumz-w-full sumz-h-[2px] sumz-bg-gray-300" } },
            {
                tag: "button",
                props: {
                    id: "summarize__bt-start-summary",
                    className: "sumz-m-4 sumz-w-[90%] sumz-bg-violet-500 hover:sumz-bg-violet-700 sumz-text-white sumz-py-2 sumz-px-4 sumz-rounded",
                    innerText: "Summaryze"
                }
            },
            {
                tag: "div",
                props: {
                    id: "summarize__body-container",
                    className: "hidden"
                },
                children: [
                    {
                        tag: "p",
                        props: {
                            className: "sumz-text-md sumz-mt-3 sumz-ml-4",
                            innerText: "Summary by Chat GPT 3.5"
                        }
                    },
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
            className: "sumz-px-4 sumz-py-2",
        },
        children: [
            {
                tag: "p",
                props: {
                    className: "sumz-text-md sumz-my-3",
                    innerText: "Summarize options"
                }
            },
            {
                tag: "small",
                props: {
                    className: "!sumz-text-sm sumz-text-md sumz-mt-3",
                    innerText: "Prompt to use"
                }
            },
            {
                tag: "div",
                props: {
                    className: "sumz-flex sumz-flex-col sumz-justify-between sumz-mt-2 sumz-w-full"
                },
                children: [
                    {
                        tag: "input",
                        props: {
                            type: "text",
                            className: "sumz-shadow sumz-appearance-none sumz-border sumz-rounded sumz-w-full sumz-py-2 sumz-px-3 sumz-text-gray-700 sumz-leading-tight sumz-focus:outline-none sumz-focus:shadow-outline",
                        }
                    },
                    {
                        tag: "div",
                        props: {
                            className: "sumz-w-full sumz-flex sumz-justify-end",
                        },
                        children: [
                            {
                                tag: "button",
                                props: {
                                    id: "summarize__bt-search-prompt",
                                    className: "sumz-w-[40%] sumz-mt-2 sumz-bg-violet-500 hover:sumz-bg-violet-700 sumz-text-white sumz-py-2 sumz-px-4 sumz-rounded",
                                    innerText: "search"
                                }
                            },
                        ]
                    },
                ]
            },
        ]
    };

    return promptsContainer;
}

function createPlansContainer() {
    let defaultClass = "sumz-shadow-sm sumz-p-4 sumz-w-full sumz-h-[40px] sumz-mb-4 sumz-flex sumz-items-center sumz-justify-between";

    let listPlans = [
        {name: "Free", price: 0},
        {name: "Premium", price: 100}
    ];

    let plansCard = listPlans.map((plan, index) => {
        return {
            tag: "div",
            props: {
                id: "summarize__plan-item-" + index,
                className: defaultClass,
            },
            children: [
                {
                    tag: "span",
                    props: {
                        className: "",
                        innerText: plan.name
                    }
                },
                {
                    tag: "div",
                    props: {},
                    children: [
                        {
                            tag: "label",
                            props: {
                                className: "sumz-mr-2",
                                innerText: `${'$' + plan.price}`
                            }
                        },
                        {
                            tag: "input",
                            props: {
                                type: "radio",
                                className: "summarize_plan-checkbox",
                                name: "plan"
                            },
                        }
                    ]
                },  
            ]
        }
    })

    let plansContainer = {
        tag: "div",
        props: {
            id: "summarize__plans",
            className: "sumz-p-4 sumz-w-full"
        },
        children:[
            {
                tag: "div",
                props: {},
                children: plansCard 
            },
            {
                tag: "div",
                props: {
                    className: "sumz-w-full sumz-flex sumz-justify-end",
                },
                children: [
                    {
                        tag: "button",
                        props: {
                            id: "summarize__bt-choose-plan",
                            className: "sumz-w-[40%] sumz-mt-2 sumz-bg-gray-500 sumz-text-white sumz-py-2 sumz-px-4 sumz-rounded",
                            innerText: "choose plan",
                            disabled: true
                        }
                    },
                ]
            },
        ]
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
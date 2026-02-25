(() => {
  // node_modules/@dynein/state/built/state.js
  var isSignalSymbol = Symbol("isSignal");
  var assertedStatic = false;
  var collectingDependencies = false;
  var currentOwner = void 0;
  var currentEffect = void 0;
  var contextValues = /* @__PURE__ */ new Map();
  function updateState(new_assertedStatic, new_collectingDependencies, new_currentOwner, new_currentEffect, inner) {
    const old_assertedStatic = assertedStatic;
    const old_collectingDependencies = collectingDependencies;
    const old_currentOwner = currentOwner;
    const old_currentEffect = currentEffect;
    assertedStatic = new_assertedStatic;
    collectingDependencies = new_collectingDependencies;
    currentOwner = new_currentOwner;
    currentEffect = new_currentEffect;
    try {
      return inner();
    } finally {
      assertedStatic = old_assertedStatic;
      collectingDependencies = old_collectingDependencies;
      currentOwner = old_currentOwner;
      currentEffect = old_currentEffect;
    }
  }
  function untrack(inner) {
    return updateState(false, false, currentOwner, currentEffect, inner);
  }
  var sample = untrack;
  function assertStatic(inner) {
    return updateState(true, false, currentOwner, currentEffect, inner);
  }
  function runWithOwner(owner, inner) {
    return updateState(assertedStatic, collectingDependencies, owner, currentEffect, inner);
  }
  function getOwner() {
    return currentOwner;
  }
  function _runAtBaseWithState(new_assertedStatic, new_collectingDependencies, new_currentOwner, new_currentEffect, inner) {
    const restore = getRestoreAllStateFunction();
    try {
      restoreBaseState(false);
      assertedStatic = new_assertedStatic;
      collectingDependencies = new_collectingDependencies;
      currentOwner = new_currentOwner;
      currentEffect = new_currentEffect;
      return inner();
    } finally {
      restore();
    }
  }
  function createRoot(inner) {
    const owner = new Owner(null);
    return _runAtBaseWithState(false, false, owner, void 0, () => inner(() => owner.destroy()));
  }
  var rootOwners = /* @__PURE__ */ new Set();
  var Owner = class _Owner {
    ///*DEBUG*/debugID: string
    children = /* @__PURE__ */ new Set();
    isDestroyed = false;
    parent = null;
    ///*DEBUG*/protected createContext: any
    ///*DEBUG*/protected destroyContext: any
    constructor(parent = currentOwner) {
      if (parent === void 0) {
        console.trace("Destructables created outside of a `createRoot` will never be disposed.");
      }
      if (!parent) {
        rootOwners.add(this);
      } else {
        parent.addChild(this);
      }
    }
    addChild(thing) {
      if (this.isDestroyed) {
        throw new Error("Can't add to destroyed context.");
      }
      if (thing instanceof _Owner) {
        thing.parent = this;
      }
      this.children.add(thing);
    }
    destroy() {
      this.isDestroyed = true;
      if (this.parent) {
        this.parent.children.delete(this);
        this.parent = null;
      }
      this.reset();
    }
    reset() {
      const children = this.children;
      this.children = /* @__PURE__ */ new Set();
      _runAtBaseWithState(false, false, void 0, void 0, () => {
        batch(() => {
          for (const child of children) {
            if (child instanceof _Owner) {
              child.parent = null;
              child.destroy();
            } else {
              child();
            }
          }
        });
      });
    }
  };
  var onWriteListenersFunctionsSymbol = Symbol("onWriteListeners");
  var onWriteListenersOwnersSymbol = Symbol("onWriteOwners");
  var onWriteListenersContextValuesSymbol = Symbol("onWriteContextValues");
  function isSignal(thing) {
    return thing && thing[isSignalSymbol] === true;
  }
  function createEffect(fn) {
    return new Effect(fn);
  }
  function onCleanup(fn) {
    if (currentOwner === void 0) {
      console.trace("Destructables created outside of a `createRoot` will never be disposed.");
    }
    const savedContextValues = new Map(contextValues);
    currentOwner?.addChild(() => {
      const old_contextValues = contextValues;
      try {
        contextValues = savedContextValues;
        fn();
      } catch (err) {
        console.warn("Caught error in cleanup function:", err);
      } finally {
        contextValues = old_contextValues;
      }
    });
  }
  function batch(fn) {
    return currentUpdateQueue.delayStart(fn);
  }
  var UpdateQueue = class _UpdateQueue {
    parent;
    thisTick;
    nextTick;
    onTickEnd;
    ticking;
    startDelayed;
    constructor(parent = null) {
      this.parent = parent;
      this.thisTick = /* @__PURE__ */ new Set();
      this.nextTick = /* @__PURE__ */ new Set();
      this.onTickEnd = /* @__PURE__ */ new Set();
      this.ticking = false;
      this.startDelayed = false;
    }
    start() {
      if (this.ticking || this.startDelayed) {
        return;
      }
      let subTickN = 0;
      this.ticking = true;
      while (true) {
        if (subTickN > 1e4) {
          console.warn("Runaway update detected");
          break;
        }
        subTickN++;
        const tmp = this.thisTick;
        this.thisTick = this.nextTick;
        this.nextTick = tmp;
        this.nextTick.clear();
        if (this.thisTick.size === 0) {
          if (this.onTickEnd.size === 0) {
            break;
          }
          const old_assertedStatic = assertedStatic;
          const old_collectingDependencies = collectingDependencies;
          const old_currentOwner = currentOwner;
          const old_currentEffect = currentEffect;
          const old_contextValues = contextValues;
          const restoreCustomStates = customStateStashers.map((stasher) => stasher());
          assertedStatic = false;
          collectingDependencies = false;
          currentOwner = void 0;
          currentEffect = void 0;
          contextValues = /* @__PURE__ */ new Map();
          for (const fn of customRestoreBaseStateFunctions) {
            fn();
          }
          for (const fn of this.onTickEnd) {
            this.onTickEnd.delete(fn);
            try {
              fn();
            } catch (err) {
              console.warn("Caught error in onBatchEnd function:", err);
            }
          }
          assertedStatic = old_assertedStatic;
          collectingDependencies = old_collectingDependencies;
          currentOwner = old_currentOwner;
          currentEffect = old_currentEffect;
          contextValues = old_contextValues;
          for (const fn of restoreCustomStates) {
            fn();
          }
          continue;
        }
        for (const fn of this.thisTick) {
          this.thisTick.delete(fn);
          try {
            fn();
          } catch (err) {
            console.warn("Caught error in tick function:", err);
          }
        }
      }
      this.ticking = false;
    }
    subclock(fn) {
      this.unschedule(fn);
      const oldUpdateQueue = currentUpdateQueue;
      currentUpdateQueue = new _UpdateQueue(this);
      try {
        fn();
      } finally {
        currentUpdateQueue = oldUpdateQueue;
      }
    }
    delayStart(fn) {
      const oldStartDelayed = this.startDelayed;
      this.startDelayed = true;
      try {
        return fn();
      } finally {
        this.startDelayed = oldStartDelayed;
        this.start();
      }
    }
    unschedule(fn) {
      this.thisTick.delete(fn);
      this.nextTick.delete(fn);
      this.parent?.unschedule(fn);
    }
    schedule(fn) {
      if (this.thisTick.has(fn)) {
        return;
      }
      this.parent?.unschedule(fn);
      this.nextTick.add(fn);
      this.start();
    }
  };
  var currentUpdateQueue = new UpdateQueue();
  var Effect = class extends Owner {
    fn;
    savedContextValues;
    sources;
    boundExec;
    destroyPending = false;
    execPending = false;
    executing = false;
    synchronousExecutionDepth = 0;
    constructor(fn) {
      super();
      this.savedContextValues = new Map(contextValues);
      this.fn = fn.bind(void 0);
      this.sources = /* @__PURE__ */ new Set();
      this.boundExec = this.exec.bind(this);
      this.boundExec();
    }
    exec() {
      this.execPending = false;
      if (this.synchronousExecutionDepth > 0) {
        console.error("Nested effect self-triggering detected. This is not supported because it can lead to unexpected behavior. The effect will now be destroyed and further executions will be blocked.");
        this.synchronousExecutionDepth = 0;
        this.executing = false;
        this.destroy();
        return;
      }
      if (this.isDestroyed) {
        return;
      }
      const cachedUpdateQueue = currentUpdateQueue;
      const oldStartDelayed = currentUpdateQueue.startDelayed;
      cachedUpdateQueue.startDelayed = true;
      this.reset();
      for (const src of this.sources) {
        src.drains.delete(this);
      }
      this.sources.clear();
      const oldContextValues = contextValues;
      const restoreCustomStates = customStateStashers.map((stasher) => stasher());
      for (const fn of customRestoreBaseStateFunctions) {
        fn();
      }
      let asyncExec = false;
      try {
        contextValues = this.savedContextValues;
        this.synchronousExecutionDepth++;
        this.executing = true;
        const maybePromise = updateState(false, true, this, this, this.fn);
        asyncExec = maybePromise instanceof Promise;
        if (asyncExec) {
          maybePromise.finally(() => {
            this.executing = false;
            if (this.destroyPending) {
              this.destroy();
            }
          });
        }
      } finally {
        this.synchronousExecutionDepth--;
        if (!asyncExec) {
          this.executing = false;
        }
        contextValues = oldContextValues;
        for (const fn of restoreCustomStates) {
          fn();
        }
        if (this.destroyPending) {
          this.executing = false;
          this.destroy();
        }
        cachedUpdateQueue.startDelayed = oldStartDelayed;
        cachedUpdateQueue.start();
      }
    }
    destroy(force = false) {
      if (this.sources.size > 0) {
        for (const src of this.sources) {
          src.drains.delete(this);
        }
        this.sources.clear();
      }
      if (this.executing && !force) {
        this.destroyPending = true;
        this.reset();
      } else {
        super.destroy();
      }
      if (this.sources.size > 0) {
        for (const src of this.sources) {
          src.drains.delete(this);
        }
        this.sources.clear();
      }
      if (this.isDestroyed) {
        this.executing = false;
        this.synchronousExecutionDepth = 0;
      }
    }
    schedule() {
      this.reset();
      this.execPending = true;
      currentUpdateQueue.schedule(this.boundExec);
    }
    forceExec() {
      currentUpdateQueue.subclock(this.boundExec);
    }
  };
  var rootUpdateQueue = currentUpdateQueue;
  var customStateStashers = [];
  var customRestoreBaseStateFunctions = [];
  function registerCustomStateStasher(stateStasher) {
    customStateStashers.push(stateStasher);
    customRestoreBaseStateFunctions.push(stateStasher());
  }
  function getRestoreAllStateFunction() {
    const old_assertedStatic = assertedStatic;
    const old_collectingDependencies = collectingDependencies;
    const old_currentOwner = currentOwner;
    const old_currentEffect = currentEffect;
    const old_contextValues = new Map(contextValues);
    const old_currentUpdateQueue = currentUpdateQueue;
    const old_currentUpdateQueue_startDelayed = currentUpdateQueue.startDelayed;
    const restoreCustomStates = customStateStashers.map((stasher) => stasher());
    return () => {
      assertedStatic = old_assertedStatic;
      collectingDependencies = old_collectingDependencies;
      currentOwner = old_currentOwner;
      currentEffect = old_currentEffect;
      contextValues = new Map(old_contextValues);
      currentUpdateQueue = old_currentUpdateQueue;
      currentUpdateQueue.startDelayed = old_currentUpdateQueue_startDelayed;
      for (const fn of restoreCustomStates) {
        fn();
      }
    };
  }
  function restoreBaseState(leavingSynchronousRegion = true) {
    if (leavingSynchronousRegion && currentEffect && currentEffect.destroyPending) {
      currentEffect.destroy(true);
    }
    assertedStatic = false;
    collectingDependencies = false;
    currentOwner = void 0;
    currentEffect = void 0;
    contextValues = /* @__PURE__ */ new Map();
    for (const fn of customRestoreBaseStateFunctions) {
      fn();
    }
    if (leavingSynchronousRegion) {
      currentUpdateQueue = rootUpdateQueue;
      rootUpdateQueue.startDelayed = false;
      rootUpdateQueue.start();
    }
  }

  // node_modules/@dynein/dom/built/dom.js
  var updateEventTable = {
    value: "input",
    checked: "input",
    selectedIndex: "input"
    //<select>
  };
  function setAttrOrProp(el, name, val) {
    if (el.namespaceURI === "http://www.w3.org/2000/svg" || name.startsWith("data-") || name.startsWith("aria-")) {
      el.setAttribute(name, val);
    } else {
      if (name === "class") {
        name = "className";
      }
      el[name] = val;
    }
  }
  var insertTarget = null;
  var insertBeforeNode = null;
  registerCustomStateStasher(() => {
    const old_insertTarget = insertTarget;
    const old_insertBeforeNode = insertBeforeNode;
    return () => {
      insertTarget = old_insertTarget;
      insertBeforeNode = old_insertBeforeNode;
    };
  });
  function addNode(node) {
    if (insertTarget === null) {
      throw new Error("not rendering");
    }
    if (insertBeforeNode && insertBeforeNode.parentNode !== insertTarget) {
    } else {
      insertTarget.insertBefore(node, insertBeforeNode);
    }
    return node;
  }
  function runWithInsertionState(parentNode, beforeNode, inner) {
    const old_insertTarget = insertTarget;
    const old_insertBeforeNode = insertBeforeNode;
    insertTarget = parentNode;
    insertBeforeNode = beforeNode;
    try {
      return inner();
    } finally {
      insertTarget = old_insertTarget;
      insertBeforeNode = old_insertBeforeNode;
    }
  }
  function stringify(val) {
    return val?.toString() ?? "";
  }
  function wrapEventListener(fn) {
    const owner = new Owner();
    return function wrappedListener() {
      owner.reset();
      updateState(false, false, owner, void 0, () => {
        fn.apply(this, arguments);
      });
    };
  }
  function createSignalUpdateListener(el, attr, sig) {
    return () => {
      sig(el[attr]);
    };
  }
  function createAndInsertElement(namespace, tagName, attrs, inner) {
    let el;
    if (namespace === "svg") {
      el = document.createElementNS("http://www.w3.org/2000/svg", tagName);
    } else {
      el = document.createElement(tagName);
    }
    if (attrs) {
      for (const attributeName in attrs) {
        const val = attrs[attributeName];
        if (attributeName.startsWith("on")) {
          if (val === void 0 || val === null) {
            continue;
          }
          if (typeof val !== "function") {
            throw new Error("Listeners must be functions.");
          }
          el.addEventListener(attributeName.substring(2).toLowerCase(), wrapEventListener(val));
        } else if (typeof val === "function") {
          if (isSignal(val)) {
            const updateEventName = updateEventTable[attributeName];
            if (updateEventName) {
              el.addEventListener(updateEventName, createSignalUpdateListener(el, attributeName, val));
            } else {
              console.warn(`No update event in table for attribute "${attributeName}", so couldn't bind.`);
            }
          }
          createEffect(() => {
            const rawVal = val() ?? "";
            setAttrOrProp(el, attributeName, rawVal);
          });
        } else {
          setAttrOrProp(el, attributeName, val);
        }
      }
    }
    if (inner !== null) {
      if (typeof inner === "function") {
        runWithInsertionState(el, null, () => {
          inner(el);
        });
      } else {
        el.appendChild(document.createTextNode(stringify(inner)));
      }
    }
    if (tagName === "select" && attrs && namespace === "xhtml") {
      const specialSelectAttrs = ["value", "selectedIndex"];
      for (const attr of specialSelectAttrs) {
        if (attr in attrs) {
          const val = attrs[attr];
          if (typeof val === "function") {
            const rawVal = sample(val) ?? "";
            setAttrOrProp(el, attr, rawVal);
          } else {
            setAttrOrProp(el, attr, val ?? "");
          }
        }
      }
    }
    addNode(el);
    return el;
  }
  function makeCreateElementsProxy(namespace) {
    return new Proxy(/* @__PURE__ */ Object.create(null), {
      get(target, tagName, receiver) {
        if (typeof tagName !== "string") {
          throw new Error("tagName must be a string");
        }
        function boundCreate(a7, b) {
          const aIsObject = typeof a7 === "object";
          if (a7 === void 0 && b === void 0) {
            return createAndInsertElement(namespace, tagName, null, null);
          } else if (aIsObject && b === void 0) {
            return createAndInsertElement(namespace, tagName, a7, null);
          } else if (b === void 0) {
            return createAndInsertElement(namespace, tagName, null, a7);
          } else if (aIsObject) {
            return createAndInsertElement(namespace, tagName, a7, b);
          } else {
            throw new Error("Unexpected state");
          }
        }
        return boundCreate;
      }
    });
  }
  var elements = makeCreateElementsProxy("xhtml");
  var svgElements = makeCreateElementsProxy("svg");
  function addText(val) {
    const node = document.createTextNode("");
    runWithInsertionState(null, null, () => {
      if (typeof val === "function") {
        createEffect(() => {
          node.textContent = stringify(val());
        });
      } else {
        node.textContent = stringify(val);
      }
    });
    return addNode(node);
  }
  function addPortal(parentNode, beforeOrInner, maybeInner) {
    let inner;
    let beforeNode;
    if (typeof beforeOrInner === "function") {
      inner = beforeOrInner;
      beforeNode = null;
    } else {
      inner = maybeInner;
      beforeNode = beforeOrInner;
    }
    const startNode = document.createComment("<portal>");
    const endNode = document.createComment("</portal>");
    parentNode.insertBefore(startNode, beforeNode);
    parentNode.insertBefore(endNode, beforeNode);
    onCleanup(() => {
      const range = document.createRange();
      range.setStartBefore(startNode);
      range.setEndAfter(endNode);
      range.deleteContents();
    });
    assertStatic(() => {
      runWithInsertionState(parentNode, endNode, inner);
    });
  }
  function mountBody(inner) {
    if (document.body) {
      addPortal(document.body, null, inner);
    } else {
      const savedOwner = getOwner();
      window.addEventListener("load", () => {
        runWithOwner(savedOwner, () => {
          addPortal(document.body, null, inner);
        });
      });
    }
  }

  // src/utils/router.ts
  var location = window.location.pathname.substring(1).replace(/\.html$/, "");
  var { protocol, hostname, port } = window.location;
  var url = `${protocol}//${hostname}:${port}`;
  window.addEventListener("popstate", () => {
    window.location.reload();
  });
  function pageIs(path) {
    if (path instanceof RegExp) {
      return path.test(location);
    } else {
      return path === location;
    }
  }

  // src/pages/home.ts
  var { section, img, div, main, header, p, a } = elements;
  function home() {
    div({ class: "column" }, () => {
      main({ class: "content" }, () => {
        div({ class: "bio" }, () => {
          img({ class: "headshot", src: "assets/headshot.avif" });
          section({ class: "container-vertical" }, () => {
            header({ class: "title" }, "Hello :)");
            p({ class: "description" }, "Welcome to my personal website!");
          });
        });
        div({ class: "directory" }, () => {
          addItem({
            title: "Projects",
            description: "Some cool projects I've worked on",
            href: "projects.html"
          });
          addItem({
            title: "About",
            description: "Learn all about me!",
            href: "about.html"
          });
          addItem({
            title: "Blog",
            description: "WIP - Come back later!",
            href: "index.html"
          });
        });
      });
    });
  }
  function addItem({ title, description, href }) {
    a({ class: "directory-item", href }, () => {
      p({ class: "title" }, title);
      p({ class: "description" }, description);
    });
  }

  // src/components/header.ts
  var { a: a2, img: img2, nav } = elements;
  function header2({ style, season }) {
    nav({
      class: `${season ?? "summer"} header`,
      style
    }, () => {
      a2({ href: "index.html" }, () => {
        img2({
          class: "header-image",
          src: "assets/headshot.avif"
        });
      });
      a2({ class: "header-button", href: "index.html" }, "Home");
      a2({ class: "header-button", href: "projects.html" }, "Projects");
      a2({ class: "header-button", href: "about.html" }, "About");
      a2({ class: "header-button", href: "index.html" }, "Blog");
    });
  }

  // src/components/projectCard.ts
  var { div: div2, p: p2, header: header3, a: a3, section: section2 } = elements;
  function projectCard({ title, description, img: img6, reversed, stack }) {
    div2({
      class: "project-card" + (reversed ? " reverse" : "")
    }, () => {
      img6();
      section2({}, () => {
        header3({ class: "title" }, () => addLinkable(title));
        for (const paragraph of listify(description)) {
          p2({ class: "description" }, paragraph);
        }
        if (stack) {
          addStack(stack);
        }
      });
    });
  }
  function addStack(stack) {
    p2({ class: "stack" }, () => {
      addText("Stack: ");
      let first = true;
      for (const stackElement of stack) {
        if (!first) {
          addText(", ");
        }
        addLinkable(stackElement);
        first = false;
      }
    });
  }
  function addLinkable(text) {
    if (typeof text === "string") {
      addText(text);
    } else {
      text();
    }
  }
  function listify(maybeList) {
    return [].concat(maybeList);
  }

  // src/components/iconButton.ts
  var { a: a4, img: img3, div: div3 } = elements;
  function iconButton({ icon, color, text, href }) {
    a4({
      href,
      style: color ? `background-color: ${color};` : "",
      rel: "noopener noreferrer",
      target: "_blank"
    }, () => {
      div3(() => {
        if (icon) {
          img3({ src: icon });
        }
        addText(text);
      });
    });
  }

  // src/pages/about.ts
  var { div: div4, main: main2, img: img4, p: p3, a: a5, span } = elements;
  function about() {
    div4({ class: "about-column" }, () => {
      header2({ season: "winter" });
      main2({ class: "content" }, () => {
        img4({ class: "about-banner", src: "assets/about/banner.avif" });
        p3({ class: "title" }, () => {
          addText("Hello, I'm ");
          split("Pedro");
          addText("!");
        });
        p3(() => {
          addText("I am a senior Computer Science major and Music minor at Lafayette College. Although I have experience with full-stack development, I love working with back-end systems the most. I also really enjoy teaching myself new tools and technologies. For example, I recently taught myself how to use ");
          a5({ class: "link", href: "https://www.docker.com/" }, "Docker");
          addText(" (+more) by setting up my own self-hosted media server!");
        });
        p3(() => {
          addText("Over the last two summers, I've had the opportunity to intern with ");
          a5({ class: "link", href: "https://www.newspapersystems.com/" }, "Software Consulting Services");
          addText(" / ");
          a5({ class: "link", href: "https://www.sn1.live/" }, "SN1");
          addText(" as a software developer. It was a blast getting to work both on real legacy systems and on their startup's new data visualization tools! My favorite project was implementing real-time group video calls for their latest (and yet-to-be-announced) application!");
        });
        div4({ class: "buttons" }, () => {
          iconButton({
            text: "GitHub",
            href: "https://github.com/nypedro",
            color: "#121613",
            icon: "assets/icons/github.svg"
          });
          iconButton({
            text: "LinkedIn",
            href: "https://www.linkedin.com/in/pedro-ds",
            color: "#007ebb",
            icon: "assets/icons/linkedin.svg"
          });
          iconButton({
            text: "Transcript",
            href: "assets/about/transcript.pdf",
            color: "#771b0f",
            icon: "assets/icons/transcript.svg"
          });
          iconButton({
            text: "Resume",
            href: "assets/about/resume.pdf",
            color: "#837c19",
            icon: "assets/icons/resume.svg"
          });
        });
      });
    });
  }
  function split(str) {
    for (const char of str) {
      span({ class: "waving" }, char);
    }
  }

  // src/pages/projects.ts
  var { img: img5, a: a6, main: main3, em } = elements;
  function projects() {
    main3({ class: "project-list" }, () => {
      header2({ season: "fall" });
      projectCard({
        title: "OneSearch",
        description: [
          "In my Databases course, my partner and I were tasked with creating a tool to visualize and compare statistics about the Pennsylvanian educational system.",
          "While my partner created a web-based interface, I developed a series of Python scripts which scraped and cleaned public data from various government websites to automatically generate a comprehensive database."
        ],
        stack: [
          link("Python", "https://www.python.org/"),
          link("SQLite", "https://sqlite.org/"),
          link("Typescript", "https://www.typescriptlang.org/"),
          link("React", "https://react.dev/")
        ],
        img: () => img5({
          src: "/assets/projects/onesearch1.avif"
        })
      });
      projectCard({
        title: "This Website",
        description: [
          "Over my winter break, I decided to practice my web design skills by finally creating this very website! To make sure I really understood the fundamentals, I decided to avoid libraries such as React or Bootstrap.",
          "I've had a lot of fun building it from the ground up, doing my best to balance professionalism with silliness/creativity!"
        ],
        stack: [
          link("Typescript", "https://www.typescriptlang.org/"),
          link("Dynein", "https://github.com/kerwizzy/Dynein/tree/master"),
          link("Sass", "https://sass-lang.com"),
          link("GitHub Pages", "https://sass-lang.com")
        ],
        img: () => img5({
          src: "/assets/projects/website.avif"
        }),
        reversed: true
      });
      projectCard({
        title: "Self-Hosting    ",
        description: "I've (not-so-) recently fallen into the self-hosting rabbithole, and finally had the chance to set one up myself. Although I'm operating on a college student budget, I currently self-host a network-wide ad blocker, NAS, and media server. Everything is fully backed-up using 3-2-1 backup rule!",
        stack: [
          link("Pi-hole", "https://pi-hole.net/"),
          link("Backblaze B2", "https://www.backblaze.com/cloud-storage"),
          link("copyparty", "https://github.com/9001/copyparty"),
          link("nginx", "https://nginx.org/"),
          link("Docker", "https://www.docker.com/"),
          link("Jellyfin", "https://jellyfin.org/"),
          link("Tailscale", "https://tailscale.com/")
        ],
        img: () => img5({
          src: "/assets/projects/homelab.avif"
        })
      });
      projectCard({
        title: "SQL Server",
        description: "As a group project for my Operating Systems course, my partner and I created a custom SQL-ish database and webserver. The system is capable of performing all the typical CRUD operations, and can even support multiple concurrent connections!",
        stack: [
          link("C", "https://en.wikipedia.org/wiki/C_(programming_language)"),
          link("HTTP", "https://en.wikipedia.org/wiki/HTTP"),
          link("Common Gateway Interface", "https://en.wikipedia.org/wiki/Common_Gateway_Interface")
        ],
        img: () => img5({
          src: "/assets/projects/sql-server.avif"
        }),
        reversed: true
      });
      projectCard({
        title: "Game Bots",
        description: [
          "Inspired by creators such as Games Computers Play, CodeNoodles, and Code Bullet, I made a few Python scripts to automatically play some simple games for me.",
          "Using image processing, these bots can react to the games, allowing them to reach inhumanly high scores. So far, I've made bots for Piano Tiles, Swords & Souls, and Kuku Kube."
        ],
        stack: [
          link("Python", "https://www.python.org/"),
          link("PyAutoGUI", "https://pyautogui.readthedocs.io/en/latest/"),
          link("Pillow", "https://pillow.readthedocs.io/en/stable/")
        ],
        img: () => img5({
          src: "/assets/projects/bots.avif"
        })
      });
    });
  }
  function link(text, href) {
    return () => a6({
      class: "link",
      target: "_blank",
      // Open in new tab,
      rel: "noopener noreferrer",
      // Protect my legacy browser peeps :)
      href
    }, text);
  }

  // src/app.ts
  var { p: p4 } = elements;
  createRoot(() => {
    mountBody(() => {
      if (pageIs(/^(index|home)?$/)) {
        home();
      } else if (pageIs("about")) {
        about();
      } else if (pageIs("projects")) {
        projects();
      } else {
        p4("Unknown page");
      }
    });
  });
})();
//# sourceMappingURL=bundle.js.map

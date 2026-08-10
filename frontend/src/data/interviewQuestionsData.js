/**
 * Top 50 Frontend + Top 50 Backend Theoretical Interview Questions & Comprehensive Answers
 * Sanjeevani Healthcare & Full-Stack Tech Stack Reference
 */

export const FRONTEND_QUESTIONS = [
  {
    id: 'fe-1',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What is the Virtual DOM in React and how does reconciliation work?',
    answer: 'The Virtual DOM is an in-memory lightweight JS representation of the real DOM. When component state changes, React creates a new Virtual DOM tree, compares it with the previous tree using the Diffing algorithm (Reconciliation), calculates the minimum necessary DOM updates, and batches them efficiently into the real DOM.'
  },
  {
    id: 'fe-2',
    category: 'JavaScript',
    difficulty: 'Basic',
    question: 'What is a Closure in JavaScript and what are its practical use cases?',
    answer: 'A closure is the combination of a function bundled together with references to its surrounding state (lexical environment). It gives an inner function access to an outer function\'s scope even after the outer function has returned. Use cases include data privacy/encapsulation, currying, function memoization, and maintaining state in callbacks.'
  },
  {
    id: 'fe-3',
    category: 'React',
    difficulty: 'Advanced',
    question: 'Explain the difference between useEffect, useLayoutEffect, and useInsertionEffect.',
    answer: 'useEffect runs asynchronously AFTER the browser paint. useLayoutEffect runs synchronously AFTER DOM mutations but BEFORE the browser paint, useful for measuring DOM layouts to prevent visual flickers. useInsertionEffect runs BEFORE DOM mutations, designed for CSS-in-JS libraries to inject dynamic styles.'
  },
  {
    id: 'fe-4',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'Explain the JavaScript Event Loop, Microtasks, and Macrotasks.',
    answer: 'JavaScript runs on a single thread with a call stack and callback queues. When asynchronous operations complete, their callbacks enter either the Microtask Queue (Promises, process.nextTick, queueMicrotask) or Macrotask Queue (setTimeout, setInterval, I/O, UI rendering). The Event Loop prioritizes processing ALL microtasks before moving to the next macrotask.'
  },
  {
    id: 'fe-5',
    category: 'Web Performance',
    difficulty: 'Advanced',
    question: 'What are Core Web Vitals (LCP, FID/INP, CLS) and how do you optimize them?',
    answer: 'LCP (Largest Contentful Paint) measures loading performance (<2.5s). Optimize via image compression, CDN caching, and lazy loading. FID/INP (First Input Delay / Interaction to Next Paint) measures responsiveness (<200ms). Optimize by minimizing main thread blocking scripts and code splitting. CLS (Cumulative Layout Shift) measures visual stability (<0.1). Optimize by specifying explicit width/height on images and reserving layout space.'
  },
  {
    id: 'fe-6',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is Prototypal Inheritance in JavaScript?',
    answer: 'Every JavaScript object has an internal `[[Prototype]]` property pointing to another object. When accessing a property on an object, JS searches the object itself; if missing, it traverses up the prototype chain until it finds the property or reaches `null` (Object.prototype.__proto__).'
  },
  {
    id: 'fe-7',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What are React Server Components (RSC) vs Client Components?',
    answer: 'Server Components execute exclusively on the server, generating static HTML without shipping JavaScript bundle code to the client, improving load performance. Client Components execute on both server (hydration) and client, maintaining interactivity (useState, useEffect, event handlers).'
  },
  {
    id: 'fe-8',
    category: 'Web Architecture',
    difficulty: 'Intermediate',
    question: 'Explain CORS (Cross-Origin Resource Sharing) and preflight requests.',
    answer: 'CORS is a browser security mechanism that restricts HTTP requests made from a different domain, protocol, or port. For non-simple HTTP requests (PUT, DELETE, custom headers), browsers send an OPTIONS Preflight Request to verify allowed origins (`Access-Control-Allow-Origin`) before executing the actual request.'
  },
  {
    id: 'fe-9',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'How does React React.memo, useMemo, and useCallback prevent unnecessary renders?',
    answer: 'React.memo memoizes a component so it only re-renders when props change. useMemo memoizes the computed result of an expensive calculation. useCallback memoizes a function reference across re-renders to prevent child components receiving new function props from re-rendering.'
  },
  {
    id: 'fe-10',
    category: 'CSS',
    difficulty: 'Basic',
    question: 'What is the CSS Box Model and box-sizing property?',
    answer: 'The CSS Box Model consists of Content, Padding, Border, and Margin. By default (`box-sizing: content-box`), element width excludes padding and border. Setting `box-sizing: border-box` includes padding and border within the declared width/height, making responsive layouts predictable.'
  },
  {
    id: 'fe-11',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is the difference between `var`, `let`, and `const`?',
    answer: '`var` is function-scoped, hoisted with `undefined`, and can be re-declared. `let` and `const` are block-scoped, hoisted into a Temporal Dead Zone (TDZ) where accessing them before initialization throws a ReferenceError. `const` prevents variable re-assignment.'
  },
  {
    id: 'fe-12',
    category: 'JavaScript',
    difficulty: 'Advanced',
    question: 'Explain Deep Copy vs Shallow Copy in JavaScript.',
    answer: 'A shallow copy copies top-level primitives by value and nested objects by reference (e.g., `Object.assign()`, spread `{...obj}`). A deep copy duplicates all nested objects recursively so mutations on the new object do not affect the original (e.g., `structuredClone(obj)` or `JSON.parse(JSON.stringify(obj))`).'
  },
  {
    id: 'fe-13',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What is the Context API and when should you use Context vs Redux/Zustand?',
    answer: 'Context API passes data down the component tree without prop drilling. It is ideal for low-frequency global state (theme, user auth, locale). For high-frequency state updates or complex state logic, dedicated state managers (Redux Toolkit, Zustand) prevent unnecessary whole-tree re-renders.'
  },
  {
    id: 'fe-14',
    category: 'Web Security',
    difficulty: 'Advanced',
    question: 'What is XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery)?',
    answer: 'XSS occurs when malicious scripts are injected into web pages and executed in victim browsers. Prevent via input sanitization, React\'s auto-escaping, and Content Security Policy (CSP). CSRF tricks authenticated users into executing unwanted HTTP requests. Prevent via Anti-CSRF Tokens and SameSite=Strict cookies.'
  },
  {
    id: 'fe-15',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is Debouncing vs Throttling?',
    answer: 'Debouncing delays executing a function until a specified time has elapsed since the LAST event call (e.g., search input autocomplete). Throttling enforces a maximum frequency rate, executing the function at most once per specified time interval (e.g., scroll/resize listeners).'
  },
  {
    id: 'fe-16',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What are Custom Hooks in React and why create them?',
    answer: 'Custom Hooks are reusable JavaScript functions starting with `use` that encapsulate stateful logic using built-in React hooks. They promote DRY code, separate UI rendering from business logic, and allow modular testing.'
  },
  {
    id: 'fe-17',
    category: 'Web Performance',
    difficulty: 'Intermediate',
    question: 'What is Code Splitting and dynamic `import()` in React?',
    answer: 'Code splitting breaks down a monolithic JavaScript bundle into smaller chunks that load on demand. React achieves this using `React.lazy()` and dynamic `import()`, significantly reducing initial page load time.'
  },
  {
    id: 'fe-18',
    category: 'CSS',
    difficulty: 'Intermediate',
    question: 'Explain CSS Flexbox vs CSS Grid layout systems.',
    answer: 'Flexbox is a 1-Dimensional layout system designed for aligning content along a single row or column. Grid is a 2-Dimensional layout system designed for complex layout structures involving simultaneous rows and columns.'
  },
  {
    id: 'fe-19',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'How do Promises work and how do `async/await` syntax abstract them?',
    answer: 'A Promise represents an eventual completion (or failure) of an asynchronous operation (Pending, Fulfilled, Rejected). `async/await` is syntactic sugar built on top of Promises that allows writing asynchronous code synchronously, handling errors using `try/catch` blocks.'
  },
  {
    id: 'fe-20',
    category: 'Web Security',
    difficulty: 'Intermediate',
    question: 'Where should JWTs be stored in the browser (LocalStorage vs HttpOnly Cookie)?',
    answer: 'LocalStorage is vulnerable to XSS attacks because any JavaScript script can read it. HttpOnly cookies cannot be accessed via JS scripts, shielding tokens from XSS. Adding `SameSite=Strict` and `Secure` flags prevents CSRF attacks.'
  },
  {
    id: 'fe-21',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What is Component Lifecycle in React Class Components vs Functional Components?',
    answer: 'Class components use methods (`componentDidMount`, `componentDidUpdate`, `componentWillUnmount`). Functional components use `useEffect` (empty dependency array = mount, dependency array = update, returned cleanup function = unmount).'
  },
  {
    id: 'fe-22',
    category: 'JavaScript',
    difficulty: 'Advanced',
    question: 'What is the `this` keyword in JavaScript and how does execution context change it?',
    answer: '`this` refers to the object executing the current function. In method invocation, `this` is the owner object. In regular functions, `this` is `window/undefined`. In arrow functions, `this` is lexically bound from surrounding scope. `call()`, `apply()`, and `bind()` explicitly set `this`.'
  },
  {
    id: 'fe-23',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What are Controlled vs Uncontrolled Components in React forms?',
    answer: 'Controlled components have input state driven by React (`value` + `onChange`). Uncontrolled components maintain state inside the DOM (`ref` + `defaultValue`), useful for file inputs or legacy integrations.'
  },
  {
    id: 'fe-24',
    category: 'Web Performance',
    difficulty: 'Intermediate',
    question: 'What is Tree Shaking in modern module bundlers (Vite/Webpack)?',
    answer: 'Tree shaking is a dead-code elimination technique that relies on ES Modules (`import`/`export`) static analysis to detect and remove unused code exports from the final production bundle.'
  },
  {
    id: 'fe-25',
    category: 'CSS',
    difficulty: 'Intermediate',
    question: 'What is CSS Specificity and how is it calculated?',
    answer: 'Specificity determines which CSS rule applies when multiple rules target the same element. It is calculated as a 4-part weight: Inline Styles (1,0,0,0) > IDs (0,1,0,0) > Classes/Attributes/Pseudo-classes (0,0,1,0) > Elements/Pseudo-elements (0,0,0,1).'
  },
  {
    id: 'fe-26',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is Event Bubbling and Event Capturing in DOM event propagation?',
    answer: 'Event propagation has 3 phases: Capturing (event moves down from window to target), Target, and Bubbling (event propagates back up from target to window). `event.stopPropagation()` stops propagation.'
  },
  {
    id: 'fe-27',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What is the purpose of the `key` prop in React lists?',
    answer: 'Keys give React elements a stable identity across renders. They allow the reconciliation algorithm to efficiently identify which items have changed, been added, or removed, avoiding complete DOM subtree re-renders.'
  },
  {
    id: 'fe-28',
    category: 'Web Architecture',
    difficulty: 'Intermediate',
    question: 'What is Progressive Web App (PWA) and Service Worker?',
    answer: 'A PWA provides app-like experiences on web. Service Workers act as proxy servers sitting between browser and network, enabling offline functionality, background sync, and push notifications via caching strategies.'
  },
  {
    id: 'fe-29',
    category: 'JavaScript',
    difficulty: 'Basic',
    question: 'What is the difference between `==` and `===` operators?',
    answer: '`==` performs abstract type coercion before comparison (e.g., `"5" == 5` is true). `===` evaluates strict equality without type coercion, checking both data type and value.'
  },
  {
    id: 'fe-30',
    category: 'React',
    difficulty: 'Advanced',
    question: 'Explain Error Boundaries in React.',
    answer: 'Error Boundaries are class components that catch JavaScript errors anywhere in their child component tree (`getDerivedStateFromError`, `componentDidCatch`), log errors, and display fallback UI instead of crashing the app.'
  },
  {
    id: 'fe-31',
    category: 'Web Performance',
    difficulty: 'Intermediate',
    question: 'How does Browser Caching work (Cache-Control, ETag, Expires)?',
    answer: '`Cache-Control` specifies directives (`max-age`, `no-cache`, `immutable`). `ETag` provides a unique resource hash for validation (304 Not Modified). `Expires` sets an absolute expiration HTTP date header.'
  },
  {
    id: 'fe-32',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is Function Currying in JavaScript?',
    answer: 'Currying transforms a function taking multiple arguments into a sequence of nested functions each taking a single argument (e.g., `f(a, b, c)` into `f(a)(b)(c)`).'
  },
  {
    id: 'fe-33',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'Explain `useRef` hook and how it differs from `useState`.',
    answer: '`useRef` returns a mutable object whose `.current` property persists across component re-renders. Unlike `useState`, mutating `.current` does NOT trigger a component re-render.'
  },
  {
    id: 'fe-34',
    category: 'CSS',
    difficulty: 'Intermediate',
    question: 'What is Glassmorphism CSS styling and how is `backdrop-filter` used?',
    answer: 'Glassmorphism creates a frosted-glass UI aesthetic using semi-transparent backgrounds (`rgba`), subtle borders, drop-shadows, and `backdrop-filter: blur(px)` to blur elements behind the container.'
  },
  {
    id: 'fe-35',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is Map, Set, WeakMap, and WeakSet in JavaScript?',
    answer: '`Map` holds key-value pairs with keys of any type. `Set` holds unique values. `WeakMap` and `WeakSet` allow garbage collection of key references when no other references exist, preventing memory leaks.'
  },
  {
    id: 'fe-36',
    category: 'React',
    difficulty: 'Advanced',
    question: 'Explain Synthetic Events in React.',
    answer: 'React wraps native browser events in a cross-browser `SyntheticEvent` wrapper to ensure consistent event behavior across browsers while delegating events to the root DOM node for performance.'
  },
  {
    id: 'fe-37',
    category: 'Web Performance',
    difficulty: 'Intermediate',
    question: 'What is Lazy Loading vs Eager Loading of resources?',
    answer: 'Eager loading fetches resources upfront during page load. Lazy loading (`loading="lazy"`, dynamic imports) defers resource loading until the resource enters or approaches the viewport.'
  },
  {
    id: 'fe-38',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is the Generator Function and `yield` keyword in ES6?',
    answer: 'Generators (`function*`) can pause execution (`yield`) and resume later (`.next()`), maintaining local variable state. They enable generator iterators and async flow control.'
  },
  {
    id: 'fe-39',
    category: 'CSS',
    difficulty: 'Intermediate',
    question: 'Explain CSS Custom Properties (CSS Variables) vs preprocessor variables.',
    answer: 'CSS Custom Properties (`--brand-color`) exist dynamically in the browser DOM, supporting runtime updates via JavaScript and cascading inheritance. Preprocessor variables (Sass `$var`) compile statically at build time.'
  },
  {
    id: 'fe-40',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What is Higher-Order Component (HOC) in React?',
    answer: 'An HOC is a pure function that takes a component as an argument and returns an enhanced component, sharing cross-cutting concerns (e.g., `withAuth(MyComponent)`).'
  },
  {
    id: 'fe-41',
    category: 'Web Architecture',
    difficulty: 'Intermediate',
    question: 'Explain Single Page Application (SPA) vs Multi-Page Application (MPA).',
    answer: 'SPAs load a single HTML page and dynamically rewrite content on user interaction without full page reloads. MPAs request fresh HTML documents from the server on every page navigation.'
  },
  {
    id: 'fe-42',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is the difference between `Object.freeze()` and `Object.seal()`?',
    answer: '`Object.freeze()` makes an object completely immutable (cannot add, delete, or modify properties). `Object.seal()` prevents adding or deleting properties, but existing writable properties can still be modified.'
  },
  {
    id: 'fe-43',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'How do Portals work in React (`ReactDOM.createPortal`)?',
    answer: 'Portals render child elements into a DOM node existing outside the parent component\'s DOM hierarchy (e.g., modals, tooltips), while preserving React event bubbling context.'
  },
  {
    id: 'fe-44',
    category: 'Web Performance',
    difficulty: 'Intermediate',
    question: 'What is Critical Rendering Path (CRP)?',
    answer: 'CRP is the sequence of steps browser executes to render HTML, CSS, and JS into pixels on screen: HTML -> DOM tree, CSS -> CSSOM tree, Render Tree, Layout, Paint.'
  },
  {
    id: 'fe-45',
    category: 'CSS',
    difficulty: 'Basic',
    question: 'What is the difference between `display: none` and `visibility: hidden`?',
    answer: '`display: none` removes the element completely from layout space (0 width/height). `visibility: hidden` hides the element visually, but preserves its layout space on screen.'
  },
  {
    id: 'fe-46',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is the difference between Synchronous and Asynchronous execution?',
    answer: 'Synchronous execution executes code line-by-line sequentially, blocking execution. Asynchronous execution delegates tasks to web APIs/workers, resuming when complete without blocking main execution thread.'
  },
  {
    id: 'fe-47',
    category: 'React',
    difficulty: 'Intermediate',
    question: 'What is React StrictMode and why does it render components twice in dev mode?',
    answer: 'StrictMode is a development tool that highlights potential bugs, deprecated APIs, and unexpected side-effects by intentionally double-invoking function components and effects in development.'
  },
  {
    id: 'fe-48',
    category: 'Web Architecture',
    difficulty: 'Intermediate',
    question: 'What is HTTP/2 and HTTP/3 vs HTTP/1.1?',
    answer: 'HTTP/1.1 suffers from head-of-line blocking. HTTP/2 introduces multiplexing over a single TCP connection, header compression (HPACK), and server push. HTTP/3 utilizes QUIC protocol over UDP for faster handshake and connection migration.'
  },
  {
    id: 'fe-49',
    category: 'JavaScript',
    difficulty: 'Intermediate',
    question: 'What is MutationObserver API in JavaScript?',
    answer: 'MutationObserver provides a mechanism to monitor changes made to DOM tree nodes (attribute modifications, child additions/removals) asynchronously.'
  },
  {
    id: 'fe-50',
    category: 'React',
    difficulty: 'Advanced',
    question: 'What is React Fiber architecture?',
    answer: 'React Fiber is the re-architected reconciliation engine in React 16+. It breaks rendering work into incremental work units, enabling prioritized rendering, interruptible rendering, and smooth animations.'
  }
];

export const BACKEND_QUESTIONS = [
  {
    id: 'be-1',
    category: 'Java Core',
    difficulty: 'Intermediate',
    question: 'What is the difference between String, StringBuilder, and StringBuffer in Java?',
    answer: '`String` is immutable (creates new memory objects in String Constant Pool upon modification). `StringBuilder` is mutable and fast for single-threaded string manipulations. `StringBuffer` is mutable and thread-safe (synchronized methods), ideal for multi-threaded environments.'
  },
  {
    id: 'be-2',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'What is Dependency Injection (DI) and Inversion of Control (IoC) in Spring?',
    answer: 'IoC is a design pattern where object creation and lifecycle management are delegated to the Spring IoC Container instead of developer code. Dependency Injection (DI) is the concrete implementation where Spring injects required bean dependencies via Constructor, Setter, or Field injection.'
  },
  {
    id: 'be-3',
    category: 'Database & SQL',
    difficulty: 'Intermediate',
    question: 'Explain ACID Properties in Relational Databases (RDBMS).',
    answer: 'Atomicity (all operations succeed or whole transaction rolls back), Consistency (database transitions between valid state schemas), Isolation (concurrent transactions execute independently without interference), Durability (committed transaction data survives system failures).'
  },
  {
    id: 'be-4',
    category: 'REST API',
    difficulty: 'Basic',
    question: 'What is the difference between HTTP GET, POST, PUT, PATCH, and DELETE?',
    answer: 'GET retrieves data (idempotent/safe). POST creates new resource. PUT replaces entire resource target (idempotent). PATCH applies partial modifications. DELETE removes resource target (idempotent).'
  },
  {
    id: 'be-5',
    category: 'Microservices',
    difficulty: 'Advanced',
    question: 'Explain the Circuit Breaker Pattern in Microservices (Resilience4j / Hystrix).',
    answer: 'The Circuit Breaker pattern prevents cascading failures across microservices. When error rate threshold exceeds limit, circuit opens (trips), immediately returning fallback responses without executing failing downstream network calls until health checks pass (Half-Open).'
  },
  {
    id: 'be-6',
    category: 'Java Core',
    difficulty: 'Intermediate',
    question: 'How does Java Garbage Collection work (Young, Old, Metaspace)?',
    answer: 'GC automatically reclaims unreachable heap memory. Heap is split into Young Generation (Eden + Survivor spaces for short-lived objects via Minor GC) and Tenured/Old Generation (long-lived objects via Major GC). Metaspace stores class metadata in native memory.'
  },
  {
    id: 'be-7',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'Explain Spring Boot `@RestController` vs `@Controller`.',
    answer: '`@Controller` is used for traditional Spring MVC web views returning view template names. `@RestController` combines `@Controller` and `@ResponseBody`, automatically serializing Java return objects directly into JSON/XML HTTP responses.'
  },
  {
    id: 'be-8',
    category: 'Security & Auth',
    difficulty: 'Advanced',
    question: 'How does JWT (JSON Web Token) authentication work end-to-end?',
    answer: 'Client submits valid credentials. Server verifies and signs JWT containing Header, Payload (claims), and Signature using secret/private key. Client stores token and sends it in `Authorization: Bearer <token>` header for stateless validation on protected endpoints.'
  },
  {
    id: 'be-9',
    category: 'Database & SQL',
    difficulty: 'Advanced',
    question: 'What is Database Indexing and what are B-Tree indexes?',
    answer: 'Database indexes are data structures that speed up query retrieval (`SELECT`) by reducing disk I/O at the cost of slower write performance (`INSERT/UPDATE`). B-Trees maintain self-balancing sorted data nodes enabling $O(\\log N)$ lookup performance.'
  },
  {
    id: 'be-10',
    category: 'Java Multithreading',
    difficulty: 'Advanced',
    question: 'What is the difference between Runnable, Callable, and ExecutorService in Java?',
    answer: '`Runnable` defines a task returning `void` and cannot throw checked exceptions. `Callable<V>` returns a result value of type `V` and can throw checked exceptions. `ExecutorService` manages a reusable worker thread pool for executing tasks asynchronously.'
  },
  {
    id: 'be-11',
    category: 'Hibernate & JPA',
    difficulty: 'Advanced',
    question: 'What is the N+1 SELECT problem in Hibernate/JPA and how do you solve it?',
    answer: 'The N+1 problem occurs when fetching 1 parent entity triggers N additional SQL queries to fetch child relationships. Solved via `JOIN FETCH` queries, `@EntityGraph`, or configuring batch fetching `@BatchSize`.'
  },
  {
    id: 'be-12',
    category: 'System Design',
    difficulty: 'Advanced',
    question: 'What is Caching and Redis Cache-Aside Pattern?',
    answer: 'In Cache-Aside, application checks cache first. On cache hit, data returns immediately. On cache miss, application queries primary database, populates cache entry, and returns data. Prevents unnecessary database load.'
  },
  {
    id: 'be-13',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'Explain `@Transactional` annotation propagation and isolation levels in Spring.',
    answer: '`@Transactional` manages database transaction boundaries. Propagation defines behavior when calling transactional methods (`REQUIRED`, `REQUIRES_NEW`, `NESTED`). Isolation levels control visibility of concurrent changes (`READ_COMMITTED`, `REPEATABLE_READ`, `SERIALIZABLE`).'
  },
  {
    id: 'be-14',
    category: 'Java Core',
    difficulty: 'Intermediate',
    question: 'What is the difference between `HashMap` and `ConcurrentHashMap` in Java?',
    answer: '`HashMap` is non-synchronized and unsafe for multithreading. `ConcurrentHashMap` allows concurrent thread reads without locking and uses bucket-level lock segmenting for thread-safe concurrent writes.'
  },
  {
    id: 'be-15',
    category: 'Database & SQL',
    difficulty: 'Intermediate',
    question: 'What is the difference between SQL (Relational) and NoSQL (Document/Key-Value) databases?',
    answer: 'SQL databases (PostgreSQL, MySQL) are structured, schema-bound, support ACID transactions, and scale vertically. NoSQL databases (MongoDB, Redis) are schema-less, document/key-value based, scale horizontally, and offer high write performance.'
  },
  {
    id: 'be-16',
    category: 'Microservices',
    difficulty: 'Advanced',
    question: 'What is API Gateway Pattern (Spring Cloud Gateway)?',
    answer: 'API Gateway acts as the single entry point for client requests, handling routing, cross-cutting concerns (authentication, rate limiting, logging, SSL termination), and load balancing across microservices.'
  },
  {
    id: 'be-17',
    category: 'Payment Gateway',
    difficulty: 'Advanced',
    question: 'How do you handle Razorpay Webhooks safely in Spring Boot?',
    answer: 'Verify incoming webhook payload signature using HMAC-SHA256 with webhook secret header (`X-Razorpay-Signature`) before processing order payment events (`payment.captured`, `order.paid`). Ensure idempotent event handlers.'
  },
  {
    id: 'be-18',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'What is Spring Security Filter Chain?',
    answer: 'Spring Security processes incoming HTTP requests through a chain of security filters (e.g., `UsernamePasswordAuthenticationFilter`, `JwtAuthenticationFilter`, `ExceptionTranslationFilter`) before reaching `@RestController` handlers.'
  },
  {
    id: 'be-19',
    category: 'Java Core',
    difficulty: 'Intermediate',
    question: 'What are Java 8 Features (Lambda Expressions, Streams API, Optional)?',
    answer: 'Lambda expressions enable functional programming. Streams API enables functional pipeline operations (`filter`, `map`, `reduce`). `Optional<T>` prevents `NullPointerException` by explicitly representing value presence or absence.'
  },
  {
    id: 'be-20',
    category: 'System Design',
    difficulty: 'Advanced',
    question: 'What is Message Broker (Apache Kafka vs RabbitMQ)?',
    answer: 'Kafka is a distributed append-only commit log streaming platform designed for high-throughput event sourcing. RabbitMQ is a traditional message broker supporting complex AMQP routing topologies.'
  },
  {
    id: 'be-21',
    category: 'Database & SQL',
    difficulty: 'Intermediate',
    question: 'What are Database Joins (INNER, LEFT, RIGHT, FULL, CROSS)?',
    answer: 'INNER returns matching records in both tables. LEFT returns all left table records + matching right records. RIGHT returns all right table records + matching left records. FULL returns all records when match exists in either table.'
  },
  {
    id: 'be-22',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'What is Spring Boot Actuator?',
    answer: 'Actuator exposes production-ready HTTP/JMX endpoints (`/health`, `/metrics`, `/env`, `/info`) to monitor and manage application operational health and metrics.'
  },
  {
    id: 'be-23',
    category: 'Hibernate & JPA',
    difficulty: 'Intermediate',
    question: 'What is Entity First-Level vs Second-Level Cache in Hibernate?',
    answer: 'First-level cache is associated with the `Session` (mandatory, enabled by default). Second-level cache is session-factory scoped across multiple sessions (optional, configured using EHCache/Redis).'
  },
  {
    id: 'be-24',
    category: 'Java Multithreading',
    difficulty: 'Advanced',
    question: 'What is `volatile` keyword in Java?',
    answer: '`volatile` guarantees visibility of variable updates across thread CPU caches directly to main memory, preventing thread caching inconsistency, but does NOT guarantee atomicity.'
  },
  {
    id: 'be-25',
    category: 'REST API',
    difficulty: 'Intermediate',
    question: 'What is Idempotency in REST APIs?',
    answer: 'An API method is idempotent if making multiple identical requests has the same server state result as a single request (GET, PUT, DELETE are idempotent; POST is non-idempotent).'
  },
  {
    id: 'be-26',
    category: 'System Design',
    difficulty: 'Advanced',
    question: 'Explain CAP Theorem in Distributed Systems.',
    answer: 'CAP states that a distributed system can simultaneously provide at most 2 out of 3 guarantees: Consistency (all nodes see same data), Availability (every request gets non-error response), Partition Tolerance (system functions despite network drops).'
  },
  {
    id: 'be-27',
    category: 'Java Core',
    difficulty: 'Intermediate',
    question: 'What is the difference between Abstract Class and Interface in Java 8+?',
    answer: 'Abstract classes can hold state fields and constructors. Interfaces hold behavior signatures. Since Java 8/9, interfaces support default, static, and private methods.'
  },
  {
    id: 'be-28',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'Explain Spring Bean Scope (`singleton`, `prototype`, `request`, `session`).',
    answer: '`singleton` (default) creates one shared instance per Spring container. `prototype` creates a new instance every time requested. `request`/`session` scope instances per HTTP request/session.'
  },
  {
    id: 'be-29',
    category: 'Security & Auth',
    difficulty: 'Advanced',
    question: 'What is OAuth 2.0 and OpenID Connect (OIDC)?',
    answer: 'OAuth 2.0 is an authorization framework allowing third-party applications limited access to user resources via Access Tokens. OpenID Connect is an identity layer built on top of OAuth 2.0 providing authentication (ID Tokens).'
  },
  {
    id: 'be-30',
    category: 'Database & SQL',
    difficulty: 'Intermediate',
    question: 'What is Database Normalization (1NF, 2NF, 3NF)?',
    answer: 'Normalization organizes database tables to reduce data redundancy. 1NF ensures atomic values. 2NF removes partial dependencies on composite keys. 3NF removes transitive dependencies.'
  },
  {
    id: 'be-31',
    category: 'Java Core',
    difficulty: 'Intermediate',
    question: 'How do `equals()` and `hashCode()` contracts work in Java?',
    answer: 'If two objects are equal according to `equals()`, their `hashCode()` integers MUST be identical. If `hashCode()` values are equal, objects are NOT required to be equal.'
  },
  {
    id: 'be-32',
    category: 'Microservices',
    difficulty: 'Advanced',
    question: 'What is Eureka Service Discovery (Spring Cloud Netflix)?',
    answer: 'Service Discovery registers microservice instances dynamically with a discovery server (Eureka), allowing services to find and communicate with each other using logical service names instead of hardcoded IPs.'
  },
  {
    id: 'be-33',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'Explain Spring Boot `@Qualifier` vs `@Primary`.',
    answer: 'When multiple beans of the same type exist, `@Primary` gives preference to a default bean. `@Qualifier("beanName")` explicitly specifies which exact bean instance to inject at injection site.'
  },
  {
    id: 'be-34',
    category: 'Java Multithreading',
    difficulty: 'Advanced',
    question: 'What is Deadlock in Java and how do you prevent it?',
    answer: 'Deadlock occurs when two threads wait indefinitely for locks held by each other. Prevent by acquiring locks in a consistent global order, using `tryLock()` timeouts, or minimizing synchronized blocks.'
  },
  {
    id: 'be-35',
    category: 'System Design',
    difficulty: 'Advanced',
    question: 'What is Rate Limiting and Token Bucket algorithm?',
    answer: 'Rate limiting caps client request frequency to protect backend servers. Token Bucket algorithm adds tokens at a fixed rate; requests consume tokens and are rejected/throttled if bucket is empty.'
  },
  {
    id: 'be-36',
    category: 'Database & SQL',
    difficulty: 'Advanced',
    question: 'What is Database Sharding vs Read Replicas?',
    answer: 'Read Replicas replicate primary database updates to multiple read-only database nodes for scaling query reads. Sharding partitions data horizontally across independent database servers for scaling writes and storage.'
  },
  {
    id: 'be-37',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'What is Spring Data JPA Repository pattern?',
    answer: 'Spring Data JPA provides repository abstractions (`JpaRepository`, `CrudRepository`) that automatically generate SQL queries based on repository interface method naming conventions.'
  },
  {
    id: 'be-38',
    category: 'Java Core',
    difficulty: 'Intermediate',
    question: 'What is Reflection API in Java and what are its drawbacks?',
    answer: 'Reflection inspects or modifies class runtime behavior (fields, methods, constructors). Drawbacks include performance overhead, security restrictions, and breaking object encapsulation.'
  },
  {
    id: 'be-39',
    category: 'Security & Auth',
    difficulty: 'Intermediate',
    question: 'What is Password Hashing and why use BCrypt?',
    answer: 'Passwords should never be stored in plain text. BCrypt uses a salted cryptographic hash with an adjustable cost factor (work factor) to protect against rainbow table and brute-force attacks.'
  },
  {
    id: 'be-40',
    category: 'Microservices',
    difficulty: 'Advanced',
    question: 'What is Saga Pattern for Distributed Transactions?',
    answer: 'Saga manages distributed transactions as a sequence of local service transactions. If a step fails, Saga executes compensating transactions in reverse order to undo prior steps.'
  },
  {
    id: 'be-41',
    category: 'Java Core',
    difficulty: 'Intermediate',
    question: 'What is Try-With-Resources statement in Java?',
    answer: 'Introduced in Java 7, try-with-resources automatically closes objects implementing `AutoCloseable` (e.g., file streams, database connections) at statement end, eliminating manual `finally` cleanup.'
  },
  {
    id: 'be-42',
    category: 'Database & SQL',
    difficulty: 'Intermediate',
    question: 'What is Connection Pooling (HikariCP)?',
    answer: 'HikariCP maintains a reusable pool of active database connections, eliminating the performance overhead of opening and closing physical TCP connections for every HTTP API request.'
  },
  {
    id: 'be-43',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'What is Spring AOP (Aspect-Oriented Programming)?',
    answer: 'Spring AOP decouples cross-cutting concerns (logging, security, auditing, transactions) from business code using Aspects, Joinpoints, Pointcuts, and Advice (`@Before`, `@Around`).'
  },
  {
    id: 'be-44',
    category: 'REST API',
    difficulty: 'Intermediate',
    question: 'What is HATEOAS in RESTful Web Services?',
    answer: 'Hypermedia As The Engine Of Application State (HATEOAS) provides dynamic hypermedia links in API responses, allowing clients to discover valid available actions without hardcoding URLs.'
  },
  {
    id: 'be-45',
    category: 'Java Multithreading',
    difficulty: 'Advanced',
    question: 'What are Virtual Threads (Project Loom in Java 21)?',
    answer: 'Virtual threads are lightweight threads managed by the JVM rather than OS threads, allowing applications to handle millions of concurrent blocking I/O tasks with minimal memory footprint.'
  },
  {
    id: 'be-46',
    category: 'System Design',
    difficulty: 'Advanced',
    question: 'What is Eventual Consistency vs Strong Consistency?',
    answer: 'Strong consistency guarantees all nodes return latest updated data immediately. Eventual consistency allows temporary data divergence across nodes, guaranteeing convergence over time.'
  },
  {
    id: 'be-47',
    category: 'Database & SQL',
    difficulty: 'Intermediate',
    question: 'What is Database Deadlock and how do you resolve it?',
    answer: 'Occurs when two database transactions hold locks on rows needed by each other. RDBMS detects deadlock cycles and aborts/rolls back one transaction (victim).'
  },
  {
    id: 'be-48',
    category: 'Spring Boot',
    difficulty: 'Intermediate',
    question: 'Explain Spring Boot Profile configuration (`@Profile`).',
    answer: 'Spring Profiles segregate application configuration parts for environments (`application-dev.properties`, `application-prod.properties`), activating specific beans via `spring.profiles.active`.'
  },
  {
    id: 'be-49',
    category: 'Security & Auth',
    difficulty: 'Intermediate',
    question: 'What is SQL Injection (SQLi) and how do Prepared Statements prevent it?',
    answer: 'SQLi occurs when untrusted user input is concatenated into raw SQL strings. Prepared Statements (parameterized queries) compile SQL logic upfront, treating input strictly as data values.'
  },
  {
    id: 'be-50',
    category: 'Microservices',
    difficulty: 'Advanced',
    question: 'What is Centralized Logging and Distributed Tracing (Zipkin / Jaeger)?',
    answer: 'Distributed tracing assigns a unique `TraceID` and `SpanID` to requests across microservices, enabling developers to visualize end-to-end latency bottlenecks and diagnose distributed failures.'
  }
];

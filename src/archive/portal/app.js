const journeySteps = [
  "Intake",
  "Documents",
  "Practitioner review",
  "Ready to submit",
  "Submitted",
  "SARS verification",
  "Complete",
];

const requiredDocs = [
  "ID document",
  "IRP5 / IT3(a)",
  "Medical aid certificate",
  "Retirement annuity certificate",
  "Travel logbook",
  "Donation certificate",
  "Other supporting documents",
];

const clients = [
  {
    name: "A. Mokoena",
    email: "amokoena@example.com",
    phone: "+27 72 000 0001",
    status: 2,
    income: "IRP5 received",
    missing: ["Medical aid certificate", "Travel logbook"],
    uploaded: ["ID document", "IRP5 / IT3(a)"],
    updated: "Today, 08:14",
  },
  {
    name: "L. Naidoo",
    email: "lnaidoo@example.com",
    phone: "+27 73 000 0002",
    status: 4,
    income: "Ready with deductions",
    missing: [],
    uploaded: [
      "ID document",
      "IRP5 / IT3(a)",
      "Medical aid certificate",
      "Retirement annuity certificate",
    ],
    updated: "Yesterday, 17:42",
  },
  {
    name: "T. Dlamini",
    email: "tdlamini@example.com",
    phone: "+27 74 000 0003",
    status: 1,
    income: "Awaiting first upload",
    missing: ["ID document", "IRP5 / IT3(a)", "Medical aid certificate"],
    uploaded: [],
    updated: "Yesterday, 10:05",
  },
];

const products = [
  {
    id: "finance",
    label: "Finance",
    title: "Tax client portal",
    audience: "For tax practitioners, bookkeepers, and small finance offices",
    description: "Collect documents, track missing files, and show clients their filing progress in one branded workspace.",
    status: "Ready to demo",
    cta: "Open finance demo",
  },
  {
    id: "education",
    label: "Education",
    title: "Study tracker",
    audience: "For learners, tutors, schools, and support programs",
    description: "Track study sessions, subject progress, applications, and learner accountability from one login.",
    status: "Returning soon",
    cta: "Education login",
  },
  {
    id: "applications",
    label: "Applications",
    title: "Bursary and university tracker",
    audience: "For students, parents, and advisors",
    description: "Manage deadlines, required documents, application status, and follow-ups without losing the thread.",
    status: "Planned",
    cta: "Preview login",
  },
  {
    id: "clientops",
    label: "Business",
    title: "Client workflow portal",
    audience: "For service businesses that need intake, documents, and status updates",
    description: "A reusable portal pattern for any business that spends too much time chasing clients for information.",
    status: "Planned",
    cta: "Explore use case",
  },
];

const app = document.querySelector("#app");
const config = {
  salesWhatsApp: "27793257256",
  ...(window.LOGTRAQ_CONFIG || {}),
};
let selectedClientIndex = 0;
let clientMode = false;
let supabaseClientPromise;

function salesHref(topic = "LogTraq") {
  if (!config.salesWhatsApp) return "#pricing";
  const message = encodeURIComponent(`Hi LogTraq, I'm interested in ${topic}`);
  return `https://wa.me/${config.salesWhatsApp.replace(/[^0-9]/g, "")}?text=${message}`;
}

async function getSupabaseClient() {
  if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("https://esm.sh/@supabase/supabase-js@2").then(({ createClient }) =>
      createClient(config.supabaseUrl, config.supabaseAnonKey)
    );
  }
  return supabaseClientPromise;
}

async function uploadTaxDocument(client, documentType, file) {
  const supabase = await getSupabaseClient();
  if (!supabase) return { mode: "demo" };

  const bucket = config.storageBucket || "tax-documents";
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const path = `demo-practice/${client.email || client.name}/${Date.now()}-${cleanName}`;
  const uploadResult = await supabase.storage.from(bucket).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadResult.error) {
    console.warn("Supabase upload failed; keeping demo state only.", uploadResult.error);
    return { mode: "demo", error: uploadResult.error.message };
  }

  return { mode: "supabase", path };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function progressPercent(status) {
  return Math.round((status / (journeySteps.length - 1)) * 100);
}

function statusLabel(status) {
  return journeySteps[status] || journeySteps[0];
}

function renderJourney(status, compact = false) {
  const wrap = el("div", compact ? "journey compact" : "journey");
  const line = el("div", "journey-line");
  const fill = el("div", "journey-fill");
  fill.style.width = `${progressPercent(status)}%`;
  line.appendChild(fill);
  wrap.appendChild(line);

  journeySteps.forEach((step, index) => {
    const point = el("div", "journey-point");
    point.style.left = `${(index / (journeySteps.length - 1)) * 100}%`;
    const dot = el("span", index <= status ? "dot done" : "dot");
    const label = el("strong", "", step);
    const small = el("small", "", index < status ? "Done" : index === status ? "Current" : "Pending");
    point.append(dot, label, small);
    wrap.appendChild(point);
  });

  return wrap;
}

function renderLanding() {
  const shell = el("main", "site-shell");

  const nav = el("nav", "topbar");
  nav.innerHTML = `
    <a class="brand" href="#" aria-label="LogTraq home">
      <span class="brand-mark">LQ</span>
      <span>LogTraq</span>
    </a>
    <div class="nav-actions">
      <a class="ghost-button" href="#products">Products</a>
      <button class="ghost-button" id="viewDemo">Finance demo</button>
      <a class="primary-button" href="${salesHref("a LogTraq portal")}" target="_blank" rel="noreferrer">WhatsApp LogTraq</a>
    </div>
  `;

  const hero = el("section", "hero");
  hero.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">One domain. Multiple portals.</p>
      <h1>LogTraq turns messy admin into tracked client journeys.</h1>
      <p class="hero-text">Choose the workspace you need: finance, education, applications, or client operations. Each product uses the same idea: collect information, track progress, and keep people moving.</p>
      <div class="hero-actions">
        <button class="primary-button" id="openPortal">Open finance demo</button>
        <a class="secondary-link" href="#products">Choose a product</a>
      </div>
    </div>
    <div class="hero-media">
      <video src="./assets/dash-bg.mp4" autoplay loop muted playsinline></video>
      <div class="floating-stat">
        <span>First product live</span>
        <strong>Finance</strong>
      </div>
    </div>
  `;

  const productSection = el("section", "section-block product-section");
  productSection.id = "products";
  productSection.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Product lineup</p>
      <h2>One LogTraq brand, different login paths.</h2>
      <p>Visitors do not need a different domain for every offer. They land on LogTraq, choose the workspace that fits them, and enter the right portal.</p>
    </div>
  `;
  const productGrid = el("div", "product-grid");
  products.forEach((product) => {
    const card = el("article", `product-card ${product.id}`);
    card.innerHTML = `
      <div class="product-meta">
        <span>${product.label}</span>
        <em>${product.status}</em>
      </div>
      <h3>${product.title}</h3>
      <p class="audience">${product.audience}</p>
      <p>${product.description}</p>
      <button class="${product.id === "finance" ? "primary-button" : "secondary-button"}" data-product="${product.id}">${product.cta}</button>
    `;
    productGrid.appendChild(card);
  });
  productSection.appendChild(productGrid);

  const journey = el("section", "section-block tracker-preview");
  journey.innerHTML = `
    <div>
      <p class="eyebrow">Reusable portal engine</p>
      <h2>Every product can use a progress map.</h2>
      <p>Finance clients can track tax filing. Students can track study and applications. Service clients can track intake, documents, review, and completion.</p>
    </div>
  `;
  journey.appendChild(renderJourney(3));

  const grid = el("section", "value-grid");
  [
    ["One brand", "LogTraq stays the umbrella, so the domain can support more than one market without looking scattered."],
    ["Separate workspaces", "Finance, education, applications, and business portals can each have their own login and dashboard."],
    ["Same engine", "Intake, uploads, progress tracking, statuses, and admin dashboards can be reused across products."],
  ].forEach(([title, body]) => {
    const card = el("article", "value-card");
    card.innerHTML = `<h3>${title}</h3><p>${body}</p>`;
    grid.appendChild(card);
  });

  const pricing = el("section", "pricing-band");
  pricing.id = "pricing";
  pricing.innerHTML = `
    <div>
      <p class="eyebrow">First sellable offer</p>
      <h2>Finance portal launch setup: R800.</h2>
      <p>The first product to sell is the tax client portal because filing season creates urgent demand. The domain still remains a multi-product LogTraq hub.</p>
    </div>
    <a class="primary-button" href="${salesHref("the R800 finance portal setup")}" target="_blank" rel="noreferrer">Claim launch setup</a>
  `;

  shell.append(nav, hero, productSection, journey, grid, pricing);
  app.replaceChildren(shell);

  document.querySelector("#openPortal").addEventListener("click", () => renderPortal());
  document.querySelector("#viewDemo").addEventListener("click", () => renderPortal());
  document.querySelectorAll("[data-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const product = products.find((item) => item.id === button.dataset.product);
      if (product?.id === "finance") renderPortal();
      else renderProductLogin(product);
    });
  });
}

function renderProductLogin(product) {
  const shell = el("main", "login-shell");
  shell.innerHTML = `
    <section class="login-preview">
      <a class="brand" href="#" id="loginHome">
        <span class="brand-mark">LQ</span>
        <span>LogTraq</span>
      </a>
      <div class="login-card">
        <p class="eyebrow">${product.label} workspace</p>
        <h1>${product.title}</h1>
        <p>${product.description}</p>
        <label>
          Email
          <input type="email" placeholder="you@example.com" />
        </label>
        <label>
          Password
          <input type="password" placeholder="Password" />
        </label>
        <button class="primary-button">Login preview</button>
        <a class="secondary-link" href="${salesHref(product.title)}" target="_blank" rel="noreferrer">Ask about this product</a>
      </div>
      <button class="ghost-button" id="backToHub">Back to product hub</button>
    </section>
  `;
  app.replaceChildren(shell);
  document.querySelector("#loginHome").addEventListener("click", renderLanding);
  document.querySelector("#backToHub").addEventListener("click", renderLanding);
}

function metric(label, value, detail) {
  const node = el("article", "metric-card");
  node.innerHTML = `<span>${label}</span><strong>${value}</strong><small>${detail}</small>`;
  return node;
}

function renderClientList() {
  const list = el("div", "client-list");
  clients.forEach((client, index) => {
    const item = el("button", index === selectedClientIndex ? "client-row active" : "client-row");
    item.innerHTML = `
      <span>
        <strong>${client.name}</strong>
        <small>${client.email}</small>
      </span>
      <em>${statusLabel(client.status)}</em>
    `;
    item.addEventListener("click", () => {
      selectedClientIndex = index;
      renderPortal();
    });
    list.appendChild(item);
  });
  return list;
}

function renderDocuments(client) {
  const wrap = el("div", "doc-grid");
  requiredDocs.forEach((doc) => {
    const uploaded = client.uploaded.includes(doc);
    const item = el("label", uploaded ? "doc-slot uploaded" : "doc-slot");
    item.innerHTML = `
      <span>
        <strong>${doc}</strong>
        <small>${uploaded ? "Uploaded" : "Waiting for client"}</small>
      </span>
      <input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
    `;
    item.querySelector("input").addEventListener("change", async (event) => {
      if (!event.target.files.length) return;
      const result = await uploadTaxDocument(client, doc, event.target.files[0]);
      if (!client.uploaded.includes(doc)) client.uploaded.push(doc);
      client.missing = client.missing.filter((missing) => missing !== doc);
      client.updated = result.mode === "supabase" ? "Uploaded to Supabase" : "Demo upload only";
      renderPortal();
    });
    wrap.appendChild(item);
  });
  return wrap;
}

function renderPortal() {
  const client = clients[selectedClientIndex];
  const shell = el("main", "portal-shell");

  const sidebar = el("aside", "sidebar");
  sidebar.innerHTML = `
    <a class="brand portal-brand" href="#">
      <span class="brand-mark">LQ</span>
      <span>LogTraq Tax</span>
    </a>
    <button class="side-link active">Dashboard</button>
    <button class="side-link">Clients</button>
    <button class="side-link">Documents</button>
    <button class="side-link">Settings</button>
    <button class="side-link muted" id="backHome">Landing page</button>
  `;

  const content = el("section", "portal-content");
  const header = el("header", "portal-header");
  header.innerHTML = `
    <div>
      <p class="eyebrow">Practitioner workspace</p>
      <h1>${clientMode ? "Client progress view" : "Tax practice dashboard"}</h1>
    </div>
    <div class="toggle-group" role="group" aria-label="View mode">
      <button class="${clientMode ? "" : "active"}" id="practiceMode">Practice</button>
      <button class="${clientMode ? "active" : ""}" id="clientMode">Client</button>
    </div>
  `;

  const metrics = el("section", "metrics");
  metrics.append(
    metric("Active clients", "42", "Tax season queue"),
    metric("Ready to file", "18", "All required docs received"),
    metric("Missing documents", "27", "Follow-ups needed")
  );

  if (clientMode) {
    const clientView = el("section", "client-view");
    clientView.innerHTML = `
      <div class="client-hero">
        <p class="eyebrow">For ${client.name}</p>
        <h2>Your tax return is at: ${statusLabel(client.status)}</h2>
        <p>Upload the remaining documents below. Your practitioner will update this progress tracker as your return moves through review and submission.</p>
      </div>
    `;
    clientView.append(renderJourney(client.status), renderDocuments(client));
    content.append(header, clientView);
  } else {
    const workspace = el("section", "workspace-grid");
    const left = el("div", "panel");
    left.innerHTML = `
      <div class="panel-head">
        <div>
          <p class="eyebrow">Client queue</p>
          <h2>Today&apos;s filing work</h2>
        </div>
      </div>
    `;
    left.appendChild(renderClientList());

    const right = el("div", "panel client-detail");
    right.innerHTML = `
      <div class="panel-head">
        <div>
          <p class="eyebrow">Selected client</p>
          <h2>${client.name}</h2>
          <p>${client.income}</p>
        </div>
        <span class="status-pill">${statusLabel(client.status)}</span>
      </div>
    `;
    right.append(renderJourney(client.status, true));
    const missing = el("div", "missing-box");
    missing.innerHTML = `
      <h3>${client.missing.length ? "Missing documents" : "Ready for practitioner review"}</h3>
      <p>${client.missing.length ? client.missing.join(", ") : "All required launch-demo documents are uploaded."}</p>
      <a class="secondary-button" href="https://wa.me/${client.phone.replace(/[^0-9]/g, "")}?text=Hi%2C%20please%20upload%20your%20remaining%20tax%20documents%20to%20your%20LogTraq%20portal." target="_blank" rel="noreferrer">WhatsApp follow-up</a>
    `;
    right.append(missing, renderDocuments(client));

    workspace.append(left, right);
    content.append(header, metrics, workspace);
  }

  shell.append(sidebar, content);
  app.replaceChildren(shell);

  document.querySelector("#backHome").addEventListener("click", renderLanding);
  document.querySelector("#practiceMode").addEventListener("click", () => {
    clientMode = false;
    renderPortal();
  });
  document.querySelector("#clientMode").addEventListener("click", () => {
    clientMode = true;
    renderPortal();
  });
}

renderLanding();

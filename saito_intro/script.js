document.addEventListener("DOMContentLoaded", () => {
  const siteList = document.getElementById("siteList");
  const searchInput = document.getElementById("searchInput");
  const filterArea = document.getElementById("filterArea");
  const countText = document.getElementById("countText");
  const lastUpdated = document.getElementById("lastUpdated");

  const termsOverlay = document.getElementById("termsOverlay");
  const acceptTermsButton = document.getElementById("acceptTermsButton");

  let allSites = [];
  let currentFilter = "ALL";

  if (termsOverlay && acceptTermsButton) {
    const accepted = localStorage.getItem("portfolioBoxTermsAccepted");

    if (accepted === "yes") {
      termsOverlay.classList.add("hidden");
    }

    acceptTermsButton.addEventListener("click", () => {
      localStorage.setItem("portfolioBoxTermsAccepted", "yes");
      termsOverlay.classList.add("hidden");
    });
  }

  async function loadSites() {
    try {
      const response = await fetch("sites.json?" + Date.now());
      const data = await response.json();

      allSites = Array.isArray(data) ? data : [];

      setupFilters();
      renderSites();
      setLastUpdated();

    } catch (error) {
      console.error(error);

      if (siteList) {
        siteList.innerHTML = `
          <div class="empty-result">
            読み込みに失敗しました。
          </div>
        `;
      }
    }
  }

  function setupFilters() {
    if (!filterArea) return;

    const categories = [
      "ALL",
      ...new Set(allSites.map(site => site.category || "その他"))
    ];

    filterArea.innerHTML = "";

    categories.forEach(category => {
      const button = document.createElement("button");
      button.className = "filter-btn";
      button.textContent = category;

      if (category === currentFilter) {
        button.classList.add("active");
      }

      button.addEventListener("click", () => {
        currentFilter = category;

        document.querySelectorAll(".filter-btn").forEach(btn => {
          btn.classList.remove("active");
        });

        button.classList.add("active");
        renderSites();
      });

      filterArea.appendChild(button);
    });
  }

  function renderSites() {
    if (!siteList || !searchInput || !countText) return;

    const keyword = searchInput.value.trim().toLowerCase();

    const filtered = allSites.filter(site => {
      const categoryMatch =
        currentFilter === "ALL" || site.category === currentFilter;

      const searchText = [
        site.title,
        site.titleEn,
        site.description,
        site.category,
        site.categoryCode,
        site.date
      ].join(" ").toLowerCase();

      const keywordMatch =
        keyword === "" || searchText.includes(keyword);

      return categoryMatch && keywordMatch;
    });

    countText.textContent = `${filtered.length} BOXES`;

    if (filtered.length === 0) {
      siteList.innerHTML = `
        <div class="empty-result">
          BOXが見つかりませんでした。
        </div>
      `;
      return;
    }

    siteList.innerHTML = "";

    filtered.forEach((site, index) => {
      const article = document.createElement("article");
      article.className = "site-card fade-up";

      const colorbar = document.createElement("div");
      colorbar.className = "card-colorbar";

      const fileCode = document.createElement("div");
      fileCode.className = "file-code";
      fileCode.textContent = String(index + 1).padStart(2, "0");

      const thumb = createThumb(site);

      const body = document.createElement("div");
      body.className = "card-body";

      const meta = document.createElement("div");
      meta.className = "meta";

      const tag = document.createElement("div");
      tag.className = "tag";
      tag.textContent = site.category || "その他";

      const date = document.createElement("div");
      date.className = "date";
      date.textContent = site.date || "";

      meta.appendChild(tag);
      meta.appendChild(date);

      const title = document.createElement("h2");
      title.className = "card-title";
      title.textContent = site.title || "無題";

      const titleEn = document.createElement("div");
      titleEn.className = "card-en";
      titleEn.textContent = site.titleEn || "";

      const divider = document.createElement("div");
      divider.className = "divider";

      const desc = document.createElement("p");
      desc.className = "desc";
      desc.textContent = site.description || "";

      const link = document.createElement("a");
      link.className = "cta";
      link.href = site.url || "#";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "OPEN";

      const arrow = document.createElement("span");
      arrow.className = "arrow";
      link.appendChild(arrow);

      body.appendChild(meta);
      body.appendChild(title);
      body.appendChild(titleEn);
      body.appendChild(divider);
      body.appendChild(desc);
      body.appendChild(link);

      article.appendChild(colorbar);
      article.appendChild(fileCode);
      article.appendChild(thumb);
      article.appendChild(body);

      siteList.appendChild(article);
    });

    requestAnimationFrame(() => {
      document.querySelectorAll(".fade-up").forEach((element, index) => {
        setTimeout(() => {
          element.classList.add("visible");
        }, index * 60);
      });
    });
  }

  function createThumb(site) {
    const thumb = document.createElement("div");

    if (site.image) {
      thumb.className = "thumb";

      const sticker = document.createElement("div");
      sticker.className = "thumb-sticker";
      sticker.textContent = site.categoryCode || "BOX";

      const img = document.createElement("img");
      img.src = site.image;
      img.alt = site.title || "";
      img.loading = "lazy";

      img.onerror = () => {
        thumb.innerHTML = "";
        thumb.className = "thumb empty";
        createEmptyThumb(thumb, site);
      };

      thumb.appendChild(sticker);
      thumb.appendChild(img);
    } else {
      thumb.className = "thumb empty";
      createEmptyThumb(thumb, site);
    }

    return thumb;
  }

  function createEmptyThumb(thumb, site) {
    const mark = document.createElement("div");
    mark.className = "empty-mark";
    mark.textContent = site.mark || "□";

    const label = document.createElement("div");
    label.className = "empty-label";
    label.textContent = "NO IMAGE";

    thumb.appendChild(mark);
    thumb.appendChild(label);
  }

  function setLastUpdated() {
    if (!lastUpdated) return;

    const dates = allSites
      .map(site => site.date)
      .filter(Boolean)
      .sort()
      .reverse();

    if (dates.length > 0) {
      lastUpdated.textContent =
        "LAST UPDATED — " + dates[0].replaceAll("-", ".");
    }
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderSites);
  }

  loadSites();
});
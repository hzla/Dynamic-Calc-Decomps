(function () {
    const modal = document.getElementById("romhack-browser-modal");
    const trigger = document.getElementById("open-romhack-modal");
    const content = document.getElementById("romhack-browser-content");
    const catalog = window.romhackCatalog;
    const gameIndex = window.romhackGameIndex || {};

    if (!modal || !trigger || !content || !catalog || !Array.isArray(catalog.sections)) {
        return;
    }

    let lastFocusedElement = null;

    function getSectionGames(section) {
        const gameIds = Array.isArray(section.gameIds) ? section.gameIds : [];
        const games = gameIds
            .map((gameId) => gameIndex[gameId])
            .filter(Boolean);

        if (section.sortGames === "alphabetical") {
            games.sort((left, right) => String(left.title || "").localeCompare(String(right.title || "")));
        }

        return games;
    }

    function renderVariantLink(variant) {
        const link = document.createElement("a");
        link.className = "romhack-browser-link romhack-browser-action";
        link.href = variant.source;
        link.textContent = variant.label;
        return link;
    }

    function renderGameCard(game) {
        const variants = Array.isArray(game.variants) ? game.variants : [];
        const isSingleVariant = variants.length === 1;
        const cardTag = isSingleVariant ? "a" : "article";
        const card = document.createElement(cardTag);
        card.className = `romhack-browser-game${isSingleVariant ? " romhack-browser-game-single romhack-browser-action" : ""}`;

        if (isSingleVariant) {
            card.href = variants[0].source;
        }

        const title = document.createElement("h3");
        title.className = "romhack-browser-game-title";
        title.textContent = game.title;
        card.appendChild(title);

        if (isSingleVariant) {
            return card;
        }

        const links = document.createElement("div");
        links.className = "romhack-browser-links";
        variants.forEach((variant) => {
            links.appendChild(renderVariantLink(variant));
        });
        card.appendChild(links);

        return card;
    }

    function renderSection(section) {
        const sectionEl = document.createElement("section");
        sectionEl.className = "romhack-browser-section";

        const heading = document.createElement("h2");
        heading.className = "romhack-browser-section-title";
        heading.textContent = section.title;
        sectionEl.appendChild(heading);

        const grid = document.createElement("div");
        grid.className = "romhack-browser-grid";
        getSectionGames(section).forEach((game) => {
            grid.appendChild(renderGameCard(game));
        });

        sectionEl.appendChild(grid);
        return sectionEl;
    }

    function renderCatalog() {
        content.innerHTML = "";
        catalog.sections.forEach((section) => {
            content.appendChild(renderSection(section));
        });
    }

    function closeModal() {
        modal.hidden = true;
        document.body.classList.remove("romhack-browser-open");
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
    }

    function openModal() {
        lastFocusedElement = document.activeElement;
        modal.hidden = false;
        document.body.classList.add("romhack-browser-open");
        const firstLink = modal.querySelector(".romhack-browser-action");
        if (firstLink) {
            firstLink.focus();
        }
    }

    renderCatalog();

    trigger.addEventListener("click", openModal);
    modal.addEventListener("click", function (event) {
        if (event.target instanceof Element && event.target.hasAttribute("data-close-romhack-modal")) {
            closeModal();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });
})();

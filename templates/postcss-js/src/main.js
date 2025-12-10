const toggleTheme = (theme) => {
  const s = document.createElement("style");
  s.textContent =
    "*,*::before,*::after{transition:none!important;animation:none!important}";
  document.head.appendChild(s);
  const html = document.documentElement;
  if (theme === "dark") html.classList.add("dark");
  else html.classList.remove("dark");
  requestAnimationFrame(() => requestAnimationFrame(() => s.remove()));
};

document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  const initialTheme =
    savedTheme ??
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  toggleTheme(initialTheme);

  const toggleThemeBtn = document.querySelector("[data-theme-toggle-btn]");
  toggleThemeBtn?.addEventListener("click", () => {
    const current = localStorage.getItem("theme") ?? initialTheme;
    const newTheme = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", newTheme);
    toggleTheme(newTheme);
  });
});

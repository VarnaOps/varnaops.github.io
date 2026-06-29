/* VarnaOps nav — close any open dropdown when clicking outside it.
   Progressive enhancement: the <details> dropdown works without this. */
document.addEventListener("click", function (e) {
  document.querySelectorAll("details.nav-dd[open]").forEach(function (d) {
    if (!d.contains(e.target)) d.removeAttribute("open");
  });
});

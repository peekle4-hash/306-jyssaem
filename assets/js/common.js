(function(){
  const mobileBtn = document.querySelector("[data-hamburger]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if(mobileBtn && mobileNav){
    mobileBtn.addEventListener("click", ()=>{
      const open = mobileNav.style.display === "block";
      mobileNav.style.display = open ? "none" : "block";
    });
  }

  // Active link
  const path = location.pathname.split("/").pop() || "index.html";
  const links = document.querySelectorAll("a[data-nav]");
  links.forEach(a=>{
    const href = a.getAttribute("href");
    if(!href) return;
    const target = href.split("/").pop();
    if(target === path) a.classList.add("active");
  });

  // Footer year
  const y = document.querySelector("[data-year]");
  if(y) y.textContent = new Date().getFullYear();
})();

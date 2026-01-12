const burgerToggle = document.getElementById('burgerToggle');
const navMenu = document.getElementById('navMenu');
const modal = document.getElementById('orderModal');
const cartCount = document.querySelector('.cart-count');
let count = 0;

burgerToggle.onclick = () => {
  burgerToggle.classList.toggle('active');
  navMenu.classList.toggle('active');
};

// Filter Logic
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach((btn) => {
  btn.onclick = () => {
    filterBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    const val = btn.getAttribute('data-filter');
    productCards.forEach((card) => {
      const cat = card.getAttribute('data-category');
      card.style.display =
        val === 'all' || cat.includes(val) ? 'block' : 'none';
    });
  };
});

// Клик по всей карточке товара
productCards.forEach((card) => {
  card.onclick = () => {
    modal.style.display = 'flex';

    if (cartCount) {
      count++;
      cartCount.innerText = count;
    }
  };
});

document.getElementById('contactLinkNav').onclick = (e) => {
  e.preventDefault();
  modal.style.display = 'flex';
};
document.getElementById('closeOrderModal').onclick = () => {
  modal.style.display = 'none';
};
window.onclick = (e) => {
  if (e.target == modal) modal.style.display = 'none';
};

function scrollToCatalog() {
  document.getElementById('catalog').scrollIntoView({ behavior: 'smooth' });
}

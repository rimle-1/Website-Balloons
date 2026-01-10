document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("contactModal");
    const closeBtn = document.querySelector(".close-modal");
    
    // Находим все кнопки "В корзину"
    const buyButtons = document.querySelectorAll(".btn-cart");

    buyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = "block";
        });
    });

    // Закрытие
    closeBtn.onclick = () => modal.style.display = "none";
    
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
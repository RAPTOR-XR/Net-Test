document.addEventListener('DOMContentLoaded', function() {
    imgMod();
});
function imgMod() {
    let modal = document.querySelector(".img-modal");
    let img = document.querySelector(".profile-picture > img.round-pic");
    let modalImg = document.querySelector(".img-modal .modal-content");
    let caption = document.getElementById("modal-img-caption");
    img.onclick = function()
    {
        document.body.style.overflow = "hidden";
        modal.style.display = "block";
        modalImg.src = this.src;
        caption.innerHTML = this.alt;
    }
    modal.addEventListener('click', (event) => {
        let closer = document.querySelector(".modal-close");
        if (event.target === modal || event.target === closer) {
            document.body.style.overflow = "auto";
            modal.style.display = "none";
        }
    })
}
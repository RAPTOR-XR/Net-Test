document.addEventListener('DOMContentLoaded', function() {
    imageValidate();
});
function imageValidate() {
    const file = document.querySelector("form input[type=file]");
    const fileLabel = document.querySelector(".custom-file-label");
    file.addEventListener("change", (event) => {
        const filess = event.target.files[0];
        const sizess = filess.size / 1024 / 1024;
        const typess = filess.type;
        const namess = filess.name;
        if (typeof typess == "undefined" || typess.indexOf("img") === -1) {
            document.getElementById("file-type-error").classList.remove("hidden");
            file.value = null;
            fileLabel.innerHTML = fileLabel.dataset.default;
        } else if (sizess > 7) {
            document.getElementById("file-size-error").classList.remove("hidden");
            file.value = null;
            fileLabel.innerHTML = fileLabel.dataset.default;
        } else {
            fileLabel.innerHTML = namess;
        }
    });
}
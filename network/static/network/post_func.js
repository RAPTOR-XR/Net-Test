function getCookie(name) {
    var cookieVal = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieVal = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieVal;
}
function reactPostCon(postNode){
    let elem = postNode.querySelector(".react-panel")
    elem.addEventListener('click', (event) => {
        let csrftoken = getCookie('csrftoken');
        let emoji;
        if (event.target.name === "like"){
            emoji = event.target.name;
        } else if (typeof event.target.dataset.name === "string"){
            emoji = event.target.dataset.name;
        } else {
            return false;
        }
        if (postNode.querySelector(".react-button").classList.contains("liked")) {
            fetch(`/react/post/${postNode.id.substr(5)}`, {
                method: "PUT",
                body: JSON.stringify({ emoji: emoji }),
                headers: { "X-CSRFToken": csrftoken }
            })
            .then(async(response) => {
                if (response.status === 201) {
                    updatePostReact(postNode);
                    let prevEmo = postNode.querySelector(".react-button > i").dataset.name;
                    updateEmoji(postNode, emoji, prevEmo);
                    reactCountCon(postNode);
                } else {
                    let res_body = await response.json();
                    throw new Error(res_body.error);
                }
            })
            .catch(error => {
                alert(error);
                location.reload();
            })
        } else {
            fetch(`/react/post/${postNode.id.substr(5)}`, {
                method: "POST",
                body: JSON.stringify({
                    emoji: emoji
                }),
                headers: {"X-CSRFToken": csrftoken}
            })
            .then(async(response) => {
                if (response.status === 201) {
                    updatePostReact(postNode);
                    updateEmoji(postNode, emoji);
                    reactCountCon(postNode);
                } else {
                    let res_body = await response.json();
                    throw new Error(res_body.error);
                }
            })
            .catch(error => {
                alert(error);
                location.reload();
            })
        }
    })
}
function updatePostReact(postNode){
    fetch(`/react/post/${postNode.id.substr(5)}`)
    .then(async(response) => {
        let res_body = await response.json();
        if (response.status === 200) {
            if (res_body.react === "True"){
                let reactButton = postNode.querySelector(".react-button");
                reactButton.innerHTML = emojiNameToHtml(res_body.emoji);
            }
        } else {
            throw new Error(res_body.error);
        }
    })
    .catch(error => {
        alert(error);
        location.reload();
    })
}
function editPost(postNode) {
    let edit_modal = postNode.querySelector(".edit-modal");
    if (edit_modal !== null) {
        $(edit_modal).on('show.bs.modal', () => {
            let saveButton = edit_modal.querySelector(".modal-footer > .btn-primary");
            let modalBody = edit_modal.querySelector(".modal-body");
            const post_id = postNode.id.substr(5);
            let contNode = postNode.querySelector("div.post-content");
            const contInner = contNode.textContent.trim();
            modalBody.innerHTML = `<textarea class="new-content form-control">${contInner}</textarea>`;
            saveButton.addEventListener("click", () => {
                const submitted = modalBody.querySelector("textarea.new-content").value.trim();
                let csrftoken = getCookie('csrftoken');
                $(edit_modal).modalBody('hide');
                fetch("/ppost/post", {
                    method: "PUT",
                    body: JSON.stringify({ id: post_id, content: submitted, }),
                    headers: {"X-CSRFToken": csrftoken}
                })
                .then(async(response) => {
                    if ( response.status === 201) {
                        showMore(postNode);
                        contNode.innerHTML = submitted;
                    } else {
                        let res_body = await response.json();
                        throw new Error(res_body.error);
                    }
                })
                .catch(error => {
                    alert(error);
                    location.reload();
                })
            });
        });
    }
}
function deletePost(postNode){
    let delButton = postNode.querySelector(".modal-footer > .btn-danger");
    if (delButton !== null) {
        delButton.addEventListener("click", () => {
            let csrftoken = getCookie('csrftoken');
            fetch("/ppost/post", {
                method: "DELETE",
                body: JSON.stringify({ id: postNode.id.substr(5), }),
                headers: {"X-CSRFToken": csrftoken}
            })
            .then(async(response) => {
                if (response.status === 204) {
                    location.reload()
                } else {
                    let res_body = await response.json();
                    throw new Error(res_body.error);
                }
            })
            .catch(error => {
                alert(error);
                location.reload();
            })
        })
    }
}
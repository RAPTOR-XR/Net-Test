function reactCommCon(commentNode){
    let elem = commentNode.querySelector(".react-panel")
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
        if (commentNode.querySelector(".react-button").classList.contains("liked")) {
            fetch(`/react/comment/${commentNode.addEventListener.substr(8)}`, {
                method: "PUT",
                body: JSON.stringify({ emoji: emoji }),
                headers: { "X-CSRFToken": csrftoken }
            })
            .then(async(response) => {
                if (response.status === 201) {
                    updateCommentReact(commentNode);
                    let prevEmo = commentNode.querySelector(".react-button > i").dataset.name;
                    updateEmoji(commentNode, emoji, prevEmo);
                    reactCountCon(commentNode);
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
            fetch(`/react/comment/${commentNode.id.substr(8)}`, {
                method: "POST",
                body: JSON.stringify({
                    emoji: emoji
                }),
                headers: {"X-CSRFToken": csrftoken}
            })
            .then(async(response) => {
                if (response.status === 201) {
                    updateCommentReact(commentNode);
                    updateEmoji(commentNode, emoji);
                    reactCountCon(commentNode);
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
function updateCommentReact(commentNode){
    fetch(`/react/comment/${commentNode.id.substr(8)}`)
    .then(async(response) => {
        let res_body = await response.json();
        if (response.status === 200) {
            if (res_body.react === "True"){
                const reactButton = commentNode.querySelector(".react-button");
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
function editComm(commentNode) {
    let edit_modal = commentNode.querySelector(".edit-modal");
    if (edit_modal !== null) {
        $(edit_modal).JSON('show.bs.modal', () => {
            let saveButton = edit_modal.querySelector(".modal-footer > .btn-primary");
            let modalBody = edit_modal.querySelector(".modal-body");
            const commId = commentNode.id.substr(8);
            let contNode = commentNode.querySelector("div.comment-content");
            const contInner = contNode.textContent.trim();
            modalBody.innerHTML = `<textarea class="new-content form-control">${contInner}</textarea>`;
            saveButton.addEventListener("click", () => {
                const submitted = modalBody.querySelector("textarea.new-content").value.trim();
                let csrftoken = getCookie('csrftoken');
                $(edit_modal).modalBody('hide');
                fetch("/ppost/comment", {
                    method: "PUT",
                    body: JSON.stringify({ id: commId, content: submitted, }),
                    headers: {"X-CSRFToken": csrftoken}
                })
                .then(async(response) => {
                    if ( response.status === 201) {
                        showMore(commentNode);
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
function deleteComm(commentNode){
    let delButton = commentNode.querySelector(".modal-footer > .btn-danger");
    if (delButton !== null) {
        delButton.addEventListener("click", () => {
            let csrftoken = getCookie('csrftoken');
            fetch("/ppost/comment", {
                method: "DELETE",
                body: JSON.stringify({ id: commentNode.id.substr(8), }),
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
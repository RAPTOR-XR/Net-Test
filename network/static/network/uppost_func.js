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
function dropdownSettings(node) {
    let dropdownElem = node.querySelector(".delete-edit-panel > .dropdown");
    $(window).on("resize", () => {
        if (window.innerWidth < 800) {
            dropdownElem.classList.add("dropleft");
        } else {
            dropdownElem.classList.remove("dropleft");
        }
    })
}
function updateEmoji(node, newEmo, prevEmo=null) {
    if (prevEmo !== null) {
        let prevEmoNode = node.querySelector(`.emoji-list > i[data-name=${prevEmo}]`);
        prevEmoNode.dataset.count -= 1;
        if (prevEmoNode.dataset.count < 1) {
            prevEmoNode.remove();
        }
    }
    let emoList = node.querySelector("ul.emoji-list");
    let newEmoNode = emoList.querySelector(`i[data-name=${newEmo}]`);
    if (newEmoNode) {
        newEmoNode.dataset.count = parseInt(newEmoNode.dataset.count) + 1;
    } else {
        let wrap = document.createElement("div");
        wrap.innerHTML = emojiNameToHtml(newEmo);
        emoList.appendChild(wrap.firstChild);
    }
    updateReactCount(node);
    sortEmo(node);
}
function updateReactCount(node) {
    let addReacts = 0;
    let emoTag = 0;
    let emoType = 0;
    let emoTagArr = Array.from(node.querySelector("ul.emoji-list").children);
    for (const i in emoTagArr) {
        emoTag += 1;
        emoType += parseInt(emoTagArr[i].dataset.count);
    }
    addReacts = emoType - emoTag;
    if (addReacts > 0) {
        node.querySelector("span.react-counter").textContent = `+${addReacts}`;
    } else {
        node.querySelector("span.react-counter").textContent = "";
    }
}
function sortEmo(node) {
    let emoList = node.querySelector("ul.emoji-list");
    if (emoList.children.length > 1) {
        Array.from(emoList.children).sort(({dataset: {count: a}}, {dataset: {count: b}}) => parseInt(b) - parseInt(a)).forEach((emojiTag) => {
            emoList.appendChild(emojiTag)
        })
    }
}
function reactCountCon(node) {
    node.querySelectorAll(".emoji-list > i.em").forEach(emojiTag => {
        let reactCount = document.createElement("li");
        reactCount.className = "react-count";
        emojiTag.onmouseover = (event) => {
            if (event.target.classList.contains("em")) {
                reactCount.innerHTML = event.target.dataset.count;
                event.target.appendChild(reactCount);
            }
        }
        emojiTag.onmouseout = () => {
            reactCount.remove();
        }
    })
}
function reactAnime(node) {
    let reactPane = node.querySelector(".react-panel");
    const emojiPanel = reactPane.querySelector(".emoji-choice");
    let timeoutOut;
    let timeoutIn;
    reactPane.addEventListener("mouseover", () => {
        clearTimeout(timeoutOut)
        timeoutIn = setTimeout(() => {
            emojiPanel.classList.remove("hidden");
            emojiPanel.classList.add("react-panel-in");
        }, 500)
    })
    reactPane.addEventListener("mouseout", () => {
        clearTimeout(timeoutIn)
        timeoutOut =setTimeout(() => {
            emojiPanel.classList.remove("react-panel-in");
            emojiPanel.classList.add("hidden");
        }, 700)
    })
}
function showMore(node) {
    let cont = node.querySelector(".content");
    let showMoree;
    if (cont.classList.contains("post-content")) {
        showMoree = cont.nextElementSibling;
    } else {
        showMoree = cont.parentElement.nextElementSibling;
    }
    const isOverflowing = (cont.clientWidth < cont.scrollWidth) || (cont.clientHeight < cont.scrollHeight);
    if (isOverflowing) {
        showMoree.classList.remove("hidden");
        showMoree.onclick = () => {
            cont.classList.remove("short");
            showMoree.classList.add("hidden");
        }
    } else {
        showMoree.classList.add("hidden");
    }
}
function showHideComm(postNode) {
    let commButton = postNode.querySelector(".comment-button");
    let commSec = postNode.nextElementSibling;
    $(commSec).on('shown.bs.collapse', () => {
        commSec.querySelectorAll(".comment").forEach(commentNode => {
            showMore(commentNode);
        })
    })
}
function emojiNameToHtml(emoji) {
    let emoHtml;
    switch (emoji) {
        case "like":
            emoHtml = '<i class="em em---1" aria-role="presentation" aria-label="THUMBS UP SIGN" data-count=1 data-name="like"></i>' + gettext("React");
            break;
        case "dislike":
            emoHtml = '<i class="em em--1" aria-role="presentation" aria-label="THUMBS DOWN SIGN" data-count=1 data-name="dislike"></i>' + gettext("React");
            break;
        case "smile":
            emoHtml = '<i class="em em-smile" aria-role="presentation" aria-label="SMILING FACE WITH OPEN MOUTH AND SMILING EYES" data-count=1 data-name="smile"></i>' + gettext("React");
            break;
        case "heart":
            emoHtml = '<i class="em em-heart" aria-role="presentation" aria-label="HEAVY BLACK HEART" data-count=1 data-name="heart"></i>' + gettext("React");
            break;
        case "thanks":
            emoHtml = '<i class="em em-bouquet" aria-role="presentation" aria-label="BOUQUET" data-count=1 data-name="thanks"></i>' + gettext("React");
            break;
        default:
            emoHtml = '';
    }
    return emoHtml;
}
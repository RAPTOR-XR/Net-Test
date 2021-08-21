document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll("div.post").forEach((postNode) => {
        editPost(postNode);
        deletePost(postNode);
        updatePostReact(postNode);
        reactPostCon(postNode);
        updateReactCount(postNode);
        reactCountCon(postNode);
        sortEmo(postNode);
        reactAnime(postNode);
        showHideComm(postNode);
        showMore(postNode);
        dropdownSettings(postNode);
    });
    document.querySelectorAll("div.comment").forEach((commentNode) => {
        editComm(commentNode);
        deleteComm(commentNode);
        updateCommentReact(commentNode);
        reactCommCon(commentNode);
        updateReactCount(commentNode);
        reactCountCon(commentNode);
        sortEmo(commentNode);
        reactAnime(commentNode);
        showMore(commentNode);
        dropdownSettings(commentNode);
    });
    window.addEventListener("resize", function() {
        document.querySelectorAll("div.post").forEach((postNode) => {
            showMore(postNode);
        })
        document.querySelectorAll("div.comment").forEach((commentNode) => {
            showMore(commentNode);
        })
    })
});

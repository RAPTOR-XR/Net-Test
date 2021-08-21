document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll("div.post").forEach((postNode) => {
        showMore(postNode);
        reactCountCon(postNode);
        updateReactCount(postNode);
        sortEmo(postNode);
    })
    window.onresize = () => {
        document.querySelectorAll("div.post").forEach((postNode) => {
            showMore(postNode);
        })
    }
});

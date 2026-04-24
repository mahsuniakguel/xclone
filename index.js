import { thoughtsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

// DOM Elements
const postBtn = document.getElementById("post-btn");
const thoughtInput = document.getElementById("thought-input");
const charCounter = document.getElementById("char-counter");
const feed = document.getElementById("feed");
const replyModal = document.getElementById("reply-modal");
const modalClose = document.getElementById("modal-close");
const replyToTweet = document.getElementById("reply-to-tweet");
const replyInput = document.getElementById("reply-input");
const replyBtn = document.getElementById("reply-btn");

const MAX_CHARS = 280;
let currentReplyTweetId = null;

// ==========================================
// COMPOSE FUNCTIONALITY
// ==========================================

function autoResize(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
}

thoughtInput.addEventListener("input", function () {
    autoResize(this);
    updateCharCounter();
    updatePostButton();
});

function updateCharCounter() {
    const remaining = MAX_CHARS - thoughtInput.value.length;

    if (thoughtInput.value.length > 0) {
        charCounter.classList.add("visible");

        if (remaining <= 20 && remaining > 0) {
            charCounter.textContent = remaining;
            charCounter.classList.add("warning");
            charCounter.classList.remove("danger");
        } else if (remaining <= 0) {
            charCounter.textContent = remaining;
            charCounter.classList.add("danger");
            charCounter.classList.remove("warning");
        } else {
            charCounter.textContent = "";
            charCounter.classList.remove("warning", "danger");
        }
    } else {
        charCounter.classList.remove("visible", "warning", "danger");
    }
}

function updatePostButton() {
    const hasContent = thoughtInput.value.trim().length > 0;
    const withinLimit = thoughtInput.value.length <= MAX_CHARS;

    if (hasContent && withinLimit) {
        postBtn.classList.add("active");
    } else {
        postBtn.classList.remove("active");
    }
}

// Post new thought
postBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (!postBtn.classList.contains("active")) return;

    const newThought = {
        userName: "@user101",
        displayName: "You",
        profilePic: "images/user.webp",
        likes: 0,
        retweets: 0,
        tweetText: thoughtInput.value.trim(),
        isLiked: false,
        isRetweeted: false,
        showComments: false,
        comments: [],
        uuid: uuidv4(),
        timestamp: "Just now",
    };

    thoughtsData.unshift(newThought);
    thoughtInput.value = "";
    thoughtInput.style.height = "auto";
    updateCharCounter();
    updatePostButton();
    render();
    showToast("Your post was sent!");
});

// ==========================================
// FEED RENDERING
// ==========================================

function getFeedHtml() {
    let feedHtml = "";

    thoughtsData.forEach(function (tweet, index) {
        const likedClass = tweet.isLiked ? "active" : "";
        const retweetedClass = tweet.isRetweeted ? "active" : "";
        const heartIcon = tweet.isLiked ? "fa-solid" : "fa-regular";

        const isVerified = ["@elon", "@realdonaldtrump", "@ronaldo", "@paveldurov"].includes(tweet.userName);
        const verifiedBadge = isVerified ? '<i class="fa-solid fa-circle-check verified-badge"></i>' : "";

        const commentsHtml = tweet.showComments ? getCommentsHtml(tweet) : "";

        feedHtml += `
            <article class="tweet" data-tweet-id="${tweet.uuid}">
                <div class="tweet-inner">
                    <img src="${tweet.profilePic}" alt="${tweet.displayName || tweet.userName}" class="profile-pic">
                    <div class="tweet-content">
                        <div class="tweet-header">
                            <span class="display-name">${tweet.displayName || tweet.userName.replace("@", "")}</span>
                            ${verifiedBadge}
                            <span class="handle">${tweet.userName}</span>
                            <span class="timestamp">${tweet.timestamp || "2h"}</span>
                        </div>
                        <p class="tweet-text">${tweet.tweetText}</p>
                        <div class="tweet-actions">
                            <button class="action-btn reply" data-reply="${tweet.uuid}">
                                <i class="fa-regular fa-comment" data-reply="${tweet.uuid}"></i>
                                <span data-reply="${tweet.uuid}">${tweet.comments.length || ""}</span>
                            </button>
                            <button class="action-btn retweet ${retweetedClass}" data-retweet="${tweet.uuid}">
                                <i class="fa-solid fa-retweet" data-retweet="${tweet.uuid}"></i>
                                <span data-retweet="${tweet.uuid}">${tweet.retweets || ""}</span>
                            </button>
                            <button class="action-btn like ${likedClass}" data-like="${tweet.uuid}">
                                <i class="${heartIcon} fa-heart" data-like="${tweet.uuid}"></i>
                                <span data-like="${tweet.uuid}">${tweet.likes || ""}</span>
                            </button>
                            <button class="action-btn share">
                                <i class="fa-solid fa-arrow-up-from-bracket"></i>
                            </button>
                        </div>
                    </div>
                </div>
                ${commentsHtml}
            </article>
        `;
    });

    return feedHtml;
}

function getCommentsHtml(tweet) {
    if (tweet.comments.length === 0) return "";

    let html = '<div class="comments-section">';

    tweet.comments.forEach(comment => {
        html += `
            <div class="comment">
                <img src="${comment.profilePic}" alt="${comment.userName}" class="profile-pic">
                <div class="comment-content">
                    <div class="comment-header">
                        <span class="display-name">${comment.userName.replace("@", "")}</span>
                        <span class="handle">${comment.userName}</span>
                    </div>
                    <p class="comment-text">${comment.commentText}</p>
                </div>
            </div>
        `;
    });

    html += "</div>";
    return html;
}

function render() {
    feed.innerHTML = getFeedHtml();
}

// ==========================================
// EVENT HANDLERS
// ==========================================

document.addEventListener("click", function (e) {
    if (e.target.dataset.like) {
        handleLike(e.target.dataset.like);
        return;
    }

    if (e.target.dataset.retweet) {
        handleRetweet(e.target.dataset.retweet);
        return;
    }

    if (e.target.dataset.reply) {
        handleReplyClick(e.target.dataset.reply);
        return;
    }

    // Toggle comments when clicking tweet body
    const tweet = e.target.closest(".tweet");
    const isAction = e.target.closest(".action-btn");

    if (tweet && !isAction) {
        const tweetId = tweet.dataset.tweetId;
        const targetTweet = thoughtsData.find(t => t.uuid === tweetId);

        if (targetTweet && targetTweet.comments.length > 0) {
            targetTweet.showComments = !targetTweet.showComments;
            render();
        }
    }
});

function handleLike(tweetId) {
    const targetTweet = thoughtsData.find(tweet => tweet.uuid === tweetId);

    if (targetTweet) {
        targetTweet.isLiked = !targetTweet.isLiked;
        targetTweet.likes += targetTweet.isLiked ? 1 : -1;

        const likeBtn = document.querySelector(`button.like[data-like="${tweetId}"]`);
        if (likeBtn) {
            const icon = likeBtn.querySelector("i");
            const count = likeBtn.querySelector("span");

            likeBtn.classList.toggle("active", targetTweet.isLiked);
            icon.className = targetTweet.isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart";
            count.textContent = targetTweet.likes || "";

            icon.style.animation = "none";
            icon.offsetHeight;
            icon.style.animation = targetTweet.isLiked ? "likePop 0.3s ease" : "";
        }
    }
}

function handleRetweet(tweetId) {
    const targetTweet = thoughtsData.find(tweet => tweet.uuid === tweetId);

    if (targetTweet) {
        targetTweet.isRetweeted = !targetTweet.isRetweeted;
        targetTweet.retweets += targetTweet.isRetweeted ? 1 : -1;

        const retweetBtn = document.querySelector(`button.retweet[data-retweet="${tweetId}"]`);
        if (retweetBtn) {
            const icon = retweetBtn.querySelector("i");
            const count = retweetBtn.querySelector("span");

            retweetBtn.classList.toggle("active", targetTweet.isRetweeted);
            count.textContent = targetTweet.retweets || "";

            icon.style.animation = "none";
            icon.offsetHeight;
            icon.style.animation = targetTweet.isRetweeted ? "retweetPop 0.3s ease" : "";

            if (targetTweet.isRetweeted) {
                showToast("Reposted!");
            }
        }
    }
}

function handleReplyClick(tweetId) {
    const targetTweet = thoughtsData.find(tweet => tweet.uuid === tweetId);

    if (targetTweet) {
        currentReplyTweetId = tweetId;

        replyToTweet.innerHTML = `
            <div class="tweet-inner">
                <img src="${targetTweet.profilePic}" alt="${targetTweet.userName}" class="profile-pic">
                <div class="tweet-content">
                    <div class="tweet-header">
                        <span class="display-name">${targetTweet.displayName || targetTweet.userName.replace("@", "")}</span>
                        <span class="handle">${targetTweet.userName}</span>
                    </div>
                    <p class="tweet-text">${targetTweet.tweetText}</p>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 12px;">
                        Replying to <span style="color: var(--accent);">${targetTweet.userName}</span>
                    </p>
                </div>
            </div>
        `;

        openModal();
    }
}

// ==========================================
// MODAL
// ==========================================

function openModal() {
    replyModal.classList.add("active");
    document.body.style.overflow = "hidden";
    setTimeout(() => replyInput.focus(), 100);
}

function closeModal() {
    replyModal.classList.remove("active");
    document.body.style.overflow = "";
    replyInput.value = "";
    currentReplyTweetId = null;
}

modalClose.addEventListener("click", closeModal);

replyModal.addEventListener("click", function (e) {
    if (e.target === replyModal) {
        closeModal();
    }
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && replyModal.classList.contains("active")) {
        closeModal();
    }
});

replyInput.addEventListener("input", function () {
    autoResize(this);
    replyBtn.classList.toggle("active", this.value.trim().length > 0);
});

replyBtn.addEventListener("click", function (e) {
    e.preventDefault();

    if (!replyBtn.classList.contains("active") || !currentReplyTweetId) return;

    const targetTweet = thoughtsData.find(tweet => tweet.uuid === currentReplyTweetId);

    if (targetTweet) {
        targetTweet.comments.push({
            profilePic: "images/user.webp",
            userName: "@user101",
            commentText: replyInput.value.trim(),
        });

        targetTweet.showComments = true;
        closeModal();
        render();
        showToast("Your reply was sent!");
    }
});

// ==========================================
// TOAST
// ==========================================

function showToast(message) {
    const existingToast = document.querySelector(".toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add("show");
    });

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==========================================
// UI EXTRAS
// ==========================================

document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", function () {
        document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
        this.classList.add("active");
    });
});

document.querySelectorAll(".follow-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        if (this.textContent === "Follow") {
            this.textContent = "Following";
            this.style.background = "transparent";
            this.style.color = "var(--text-primary)";
            this.style.border = "1px solid var(--border-color)";
            showToast("Followed!");
        } else {
            this.textContent = "Follow";
            this.style.background = "var(--text-primary)";
            this.style.color = "var(--bg-primary)";
            this.style.border = "none";
        }
    });
});

// ==========================================
// INIT
// ==========================================

thoughtsData.forEach(tweet => {
    if (!tweet.displayName) {
        const names = {
            "@maso": "Maso",
            "@realdonaldtrump": "Donald J. Trump",
            "@elon": "Elon Musk",
            "@paveldurov": "Pavel Durov",
            "@ronaldo": "Cristiano Ronaldo",
        };
        tweet.displayName = names[tweet.userName] || tweet.userName.replace("@", "");
    }
    tweet.showComments = false;
});

render();

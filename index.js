import { thoughtsData } from "./data.js";
import { v4 as uuidv4 } from "https://jspm.dev/uuid";

const postBtn = document.getElementById("post-btn");

function handleBtnClick() {
  const thoughtInput = document.getElementById("input");

  if (tweetsInput.value) {
    thoughtsData.unshift({
      userName: `@user101`,
      profilePic: `images/user.webp`,
      likes: 0,
      retweets: 0,
      tweetText: thoughtInput.value,
      isLiked: false,
      isRetweeted: false,
      comments: [],
      uuid: uuidv4(),
    });

    thoughtInput.value = "";
  }
}

postBtn.addEventListener("click", function () {
  handleBtnClick();
});

function getFeedHtml() {
  let feedHtml = "";

  thoughtsData.forEach(function (tweet) {
    const likeIconClass = tweet.isLiked ? "liked" : "";
    const retweetIconClass = tweet.isRetweeted ? "retweeted" : "";

    // TODO 3: Erstelle hier eine Variable "commentsHtml"
    // - Du musst durch tweet.comments loopen (forEach oder map)
    // - Für jeden Kommentar erstellst du HTML mit profilePic, userName, commentText
    // - Am Ende soll commentsHtml ein String mit allem HTML sein
    // Beispiel-Struktur für einen Kommentar:
    //   <div class="comment">
    //     <img src="${comment.profilePic}" class="profile-pic">
    //     <p>${comment.userName}: ${comment.commentText}</p>
    //   </div>
    let commentsHTML = "";
    tweet.comments.forEach((comment) => {
      commentsHTML += `
        <div class="comment">
          <img src="${comment.profilePic}" class="profile-pic">
          <p>${comment.userName}: ${comment.commentText}</p>
        </div>`;
    });

    feedHtml += `
        <div class="tweet">
            <div class="tweet-inner">
                <img src="${tweet.profilePic}" class="profile-pic">
                <div>
                    <p class="handle">${tweet.userName}</p>
                    <p class="tweet-text">${tweet.tweetText}</p>
                    <div class="tweet-details">
                        <span class="tweet-detail">
                            <i class="fa-regular fa-comment-dots"
                            data-reply="${tweet.uuid}"
                            ></i>
                            ${tweet.comments.length}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-heart ${likeIconClass}"
                            data-like="${tweet.uuid}"
                            ></i>
                            ${tweet.likes}
                        </span>
                        <span class="tweet-detail">
                            <i class="fa-solid fa-retweet ${retweetIconClass}"
                            data-retweet="${tweet.uuid}"
                            ></i>
                            ${tweet.retweets}
                        </span>
                    </div>
                </div>
            </div>
            <div class="hidden" id="replies-${tweet.uuid}">
                ${commentsHTML}
            </div>
        </div>
`;
  });
  return feedHtml;
}

function render() {
  document.getElementById("feed").innerHTML = getFeedHtml();
}


const likeButtons = document.querySelectorAll("[data-like]");
const retweetButtons = document.querySelectorAll("[data-retweet]");

document.addEventListener("click", function (e) {
  if (e.target.dataset.like) {
    thoughtsData.find(t => t.uuid === e.target.dataset.like).isLiked = !thoughtsData.find(t => t.uuid === e.target.dataset.like).isLiked;
  }
});

// TODO 4: Event Listener für Like-Klicks
// - Du brauchst einen Event Listener auf dem document (document.addEventListener)
// - Höre auf "click" Events
// - Prüfe ob das geklickte Element ein data-like Attribut hat (e.target.dataset.like)
// - Wenn ja: Finde den Tweet in thoughtsData mit der passenden uuid
// - Toggle isLiked (true wird false, false wird true)
// - Aktualisiere auch likes (isLiked ? likes++ : likes--)
// - Rufe render() auf um die Änderung anzuzeigen

// TODO 5: Event Listener für Retweet-Klicks
// - Gleiche Logik wie TODO 4, aber mit data-retweet und isRetweeted

render();

$(document).ready(function() {
    $("#top-nav").fadeIn('slow');
    $("#headerImage").fadeIn('slow');
    $("body").fadeIn('slow');
    $("#gagsForm").submit(function(event) {
        event.preventDefault();
        $("#loading").fadeIn('fast');
        $.ajax({
            url: '/api/gags',
            type: 'GET',
            data: $(this).serialize(),
            success: function(response) {
                // Gags were found, display them
                if (response && response.posts && response.posts.length > 0) {
                    $("#loading").fadeOut('fast');
                    $("#headerImage").fadeOut('slow');
                    $('#homeButton').fadeIn('slow');

                    $("#gagsForm").fadeOut('slow', function() {
                        $("#results").html(formatGags(response.posts)).fadeIn('slow');
                    });
                } else { // No gags were found, display the no-results message
                    $("#loading").fadeOut('fast');
                    $("#headerImage").fadeOut('slow');
                    $('#gagsForm').fadeOut('slow');
                    $('#homeButton').fadeIn('slow');

                    $("#results").html(formatNoGagsMessage()).fadeIn('slow');
                }
            }
        });
    });

    function formatNoGagsMessage() {
        return `
            <div class="no-gags-message">
                <span>No gags were found. Please adjust your search criteria and try again.</span>
            </div>
        `;
    }

    function formatGags(posts) {
        return posts.map((post, index) => `
            <div class="gag">
            <div class="author-info">
                <div class="author-image">
                    <a href="${post.creator.avatarUrl}" target="_blank">
                        <img src="${post.creator.avatarUrl}" alt="Author profile picture">
                    </a>
                </div>
                <div class="author-name">
                    <a href="${post.creator.profileUrl}" target="_blank">
                        ${post.creator.fullName}
                    </a>
                    <span class="username">@${post.creator.username} • ${timeSince(post.creationTs)}</span>
                </div>
            </div>
            <div class="gag-content">
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">${tag.key}</span>`).join('')}
                </div>
                <h3>
                    <a href="${post.url}" target="_blank">${post.title}</a>
                </h3>
                ${post.type === 'Article' ? formatArticle(post) : ''}
                ${formatMedia(post)}
            </div>
            <div class="gag-stats">
                <span class="gag-index"><i class="fas fa-arrow-down-wide-short"></i> ${index + 1}/${posts.length}</span>
                <span class="upvotes-count"><i class="fas fa-thumbs-up"></i> ${post.upVoteCount}</span>
                <span class="downvotes-count"><i class="fas fa-thumbs-down"></i> ${post.downVoteCount}</span>
                <span class="awards-count"><i class="fas fa-award"></i> ${post.awardUsersCount}</span>
                <span class="comments-count"><i class="fas fa-comments"></i> ${post.commentsCount}</span>
                <div class="stats-spacer"></div> <!-- Spacer to push download icon to the right -->
                <span class="download-gag" data-gag='${encodeURIComponent(JSON.stringify(post))}' data-title='${post.title}' title="Download Gag Data">
                    <i class="fas fa-download"></i>
                </span>
            </div>
        </div>
        `).join('');
    }

    function formatArticle(post) {
        let articleContent = post.article.blocks.map(block => block.type === 'RichText' ? `<p>${block.content}</p>` : '').join('');
        return `${articleContent}<p>Source: <a href="${post.sourceUrl}" target="_blank">${post.sourceUrl}</a></p>`;
    }

    function formatMedia(post) {
        if (post.type === 'Animated' && 'image460sv' in post.images) {
            return `
                <a href="${post.images.image460sv.url}" target="_blank">
                    <video width="100%" class="hover-video" controls>
                        <source src="${post.images.image460sv.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </a>`;
        } else if ('image700' in post.images) {
            return `<a href="${post.images.image700.url}" target="_blank">
                        <img src="${post.images.image700.url}" alt="Image" style="max-width:100%;height:auto;">
                    </a>`;
        } else {
            return `<p>No media available.</p>`;
        }
    }

    $(document).on('click', '.download-gag', function() {
        const encodedData = $(this).data('gag');
        const title = $(this).data('title');
        downloadJsonData(decodeURIComponent(encodedData), title);
    });

    // Event listener for hovering over the video
    $(document).on('mouseover', '.hover-video', function() {
        this.play();
    });

    // Event listener for leaving the hover on the video
    $(document).on('mouseleave', '.hover-video', function() {
        this.pause();
        this.currentTime = 0; // Rewind the video to the start
    });

    function downloadJsonData(data, title) {
        // Parse JSON string to JSON object
        const jsonData = JSON.parse(data);

        // Create a Blob from the JSON data
        var blob = new Blob([JSON.stringify(jsonData)], {type: "application/json;charset=utf-8"});

        // Use FileSaver to save the Blob as a file
        saveAs(blob, `${title}.json`);
    }

    function timeSince(timestamp) {
        // Get the current time in seconds
        const now = Math.floor(Date.now() / 1000);

        // Calculate the difference in seconds
        const diff = now - timestamp;

        // Define the time thresholds in seconds
        const minute = 60;
        const hour = 60 * minute;
        const day = 24 * hour;
        const month = 30 * day;
        const year = 12 * month;

        let count, label;

        // Determine the time unit and value
        if (diff < hour) {
            count = Math.floor(diff / minute);
            label = "m"; // minutes
        } else if (diff < day) {
            count = Math.floor(diff / hour);
            label = "h"; // hours
        } else if (diff < month) {
            count = Math.floor(diff / day);
            label = "d"; // days
        } else if (diff < year) {
            count = Math.floor(diff / month);
            label = "m"; // months
        } else {
            count = Math.floor(diff / year);
            label = "y"; // years
        }

        return `${count}${label} ago`;
    }
});

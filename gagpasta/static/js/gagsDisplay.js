$(document).ready(function() {
    $("#top-nav").fadeIn('slow');
    $("#headerImage").fadeIn('slow');
    $("body").fadeIn('slow');

    $("#gagsForm").submit(function(event) {
        event.preventDefault();
        $("#loading").fadeIn('fast');
        $.ajax({
            url: '/gags',
            type: 'GET',
            data: $(this).serialize(),
            success: function(response) {
                if ((response.status === 429 || response.status === 404 || response.status === 500) && response.message) {
                    $("#loading").fadeOut('fast');
                    $("#headerImage").fadeOut('slow');
                    $('#gagsForm').fadeOut('slow');
                    $('#timestamp').fadeIn('slow');
                    $('#homeButton').fadeIn('slow');

                    $("#results").html(formatMessage(response.message)).fadeIn('slow');
                } else if (response.status === 200 && response.gags && response.gags.length > 0) {
                    sessionStorage.setItem('gagData', JSON.stringify(response.gags)); // Store gags data in session storage
                    $('#downloadData').show(); // Make sure this button is in your HTML and initially set to display:none;
                    $("#loading").fadeOut('fast');
                    $("#headerImage").fadeOut('slow');
                    $('#homeButton').fadeIn('slow');

                    $("#gagsForm").fadeOut('slow', function() {
                        $("#results").html(formatGags(response.gags)).fadeIn('slow');
                    });
                } else if (response.status === 200 && response.gags.length === 0) {
                    $("#loading").fadeOut('fast');
                    $("#headerImage").fadeOut('slow');
                    $('#gagsForm').fadeOut('slow');
                    $('#timestamp').fadeIn('slow');
                    $('#homeButton').fadeIn('slow');

                    $("#results").html(formatMessage("No gags were found. Please adjust your search criteria and try again.")).fadeIn('slow');
                }
            },
        });
    });

    $('#downloadData').click(function() {
        const data = sessionStorage.getItem('gagData');
        if (data) {
            const blob = new Blob([data], {type: "application/json;charset=utf-8"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'gagData.json'; // Name the file
            document.body.appendChild(a); // Append the anchor to body
            a.click(); // Simulate click on the anchor
            document.body.removeChild(a); // Remove the anchor from body
        }
    });

    // Event listeners for hover and leave on videos
    $(document).on('mouseover', '.hover-video', function() {
        this.play();
    });

    $(document).on('mouseleave', '.hover-video', function() {
        this.pause();
    });

    // Function for downloading gag data (if needed)
    $(document).on('click', '.download-gag', function() {
        const gagKey = $(this).data('gag-key');
        const title = $(this).data('title');
        const gagData = sessionStorage.getItem(gagKey);
        if (gagData) {
            downloadJsonData(gagData, title);
        }
    });

    function formatMessage(message) {
        return `
            <div class="status-message">
                <span>${message}</span>
            </div>
        `;
    }

    function formatGags(gags) {
        return gags.filter(gag => gag.creator).map((gag, index, filteredGags) => {
            // Store each gag's data in session storage
            const gagKey = `gagData_${index}`;
            sessionStorage.setItem(gagKey, JSON.stringify(gag));

            const { creator, creationTs, tags, title, type, url, upVoteCount, downVoteCount, awardUsersCount, commentsCount, images } = gag;

            let mediaUrls = [];
            if (type === 'Animated') {
                images && images.image460sv && mediaUrls.push(images.image460sv.url);
            } else if (type === 'Photo' && images && images.image700) {
                mediaUrls.push(images.image700.url);
            }

            return `
                <div class="gag">
                    <div class="gag-header">
                        <div class="gag-download">
                            <i class="fas fa-file-download download-gag" data-gag-key="${gagKey}" data-title="${title}" title="Download post data"></i>
                        </div>
                        <div class="author-info">
                            <div class="author-image" href="${creator.profileUrl}">
                                <img src="${creator.avatarUrl}" alt="Author profile picture">
                            </div>
                            <div class="author-name">
                                <a href="${creator.profileUrl}" target="_blank">
                                    ${creator.fullName}
                                </a>
                                <span class="username">@${creator.username} • ${timeSince(creationTs)}</span>
                            </div>
                        </div>
                    </div>

                    <div class="gag-content">
                        <div class="tags">
                            ${tags.map(tag => `<span class="tag">${tag.key}</span>`).join('')}
                        </div>
                        <h3><a href="${url}" target="_blank">${title}</a></h3>
                        ${type === 'Article' ? formatArticle(gag) : ''}
                        ${formatMedia(gag)}
                    </div>

                    <div class="gag-stats">
                        <span class="gag-index"><i class="fas fa-arrow-down-wide-short"></i> ${index + 1}/${filteredGags.length}</span>
                        <span class="upvotes-count"><i class="fas fa-thumbs-up"></i> ${upVoteCount}</span>
                        <span class="downvotes-count"><i class="fas fa-thumbs-down"></i> ${downVoteCount}</span>
                        <span class="awards-count"><i class="fas fa-award"></i> ${awardUsersCount}</span>
                        <span class="comments-count"><i class="fas fa-comments"></i> ${commentsCount}</span>
                    </div>
                </div>`;
        }).join('');
    }


    function formatArticle(gag) {
        let articleContent = gag.article.blocks.map(block => block.type === 'RichText' ? `<p>${block.content}</p>` : '').join('');
        return `${articleContent}<p>Source: <a href="${gag.sourceUrl}" target="_blank">${gag.sourceUrl}</a></p>`;
    }

    function formatMedia(gag) {
        if (gag.article && gag.article.medias) {
            let mediaHtml = '<div class="media-grid">';
            gag.article.blocks.forEach(block => {
                if (block.type === 'Media') {
                    const mediaItem = gag.article.medias[block.mediaId];
                    if (mediaItem && mediaItem.type === 'Photo') {
                        mediaHtml += `
                            <div class="media-item">
                                <a href="${mediaItem.images.image700.url}" target="_blank">
                                    <img src="${mediaItem.images.image700.url}" alt="Image">
                                </a>
                            </div>`;
                    }
                }
            });
            mediaHtml += '</div>';
            return mediaHtml;
        }
        if (gag.type === 'Animated' && 'image460sv' in gag.images) {
            return `
                <a href="${gag.images.image460sv.url}" target="_blank">
                    <video width="100%" class="hover-video" controls style="border-radius: 10px; overflow: hidden;">
                        <source src="${gag.images.image460sv.url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                </a>`;
        } else if ('image700' in gag.images) {
            return `<a href="${gag.images.image700.url}" target="_blank">
                        <img src="${gag.images.image700.url}" alt="Image" style="max-width:100%;height:auto;">
                    </a>`;
        } else {
            return `<p>No media available.</p>`;
        }
    }

    function downloadJsonData(data, title) {
        const jsonData = JSON.parse(data);
        var blob = new Blob([JSON.stringify(jsonData)], {type: "application/json;charset=utf-8"});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = `${title}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function downloadMedia(url, title) {
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        fetch(proxyUrl + url)
            .then(response => response.blob())
            .then(blob => {
                let fileExtension = url.split('.').pop(); // Extracts file extension from URL
                saveAs(blob, `${title}.${fileExtension}`);
            })
            .catch(e => alert(e));
    }

    function timeSince(timestamp) {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;
        const minute = 60;
        const hour = 60 * minute;
        const day = 24 * hour;
        const week = 7 * day;
        const month = 30 * day;
        const year = 12 * month;
        let count, label;
        if (diff < minute) {
            count = diff;
            label = "sec";
        } else if (diff < hour) {
            count = Math.floor(diff / minute);
            label = "min";
        } else if (diff < day) {
            count = Math.floor(diff / hour);
            label = "h";
        } else if (diff < week) {
            count = Math.floor(diff / day);
            label = "d";
        } else if (diff < month) {
            count = Math.floor(diff / week);
            label = "w";
        } else if (diff < year) {
            count = Math.floor(diff / month);
            label = "mo";
        } else {
            count = Math.floor(diff / year);
            label = "y";
        }
        return `${count}${label} ago`;
    }
});

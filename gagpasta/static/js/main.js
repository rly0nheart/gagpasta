$(document).ready(function() {
    $("#top-nav").fadeIn('fast');
    $("body").fadeIn('fast');

    $("#mainForm").submit(function(event) {
        event.preventDefault();
        // Change button icon to loading spinner
        $('#submitButton').html('<i class="fa-solid fa-circle-notch fa-spin"></i>');
        $.ajax({
            url: '/gags',
            type: 'GET',
            data: $(this).serialize(),
            success: function(response) {
                if ((response.status === 429 || response.status === 404 || response.status === 500) && response.message) {
                    $('#mainForm').fadeOut('fast');
                    $('#homeButton').fadeIn('fast');
                    $("#resultsContainer").html(formatMessage(response.message)).fadeIn('fast');
                } else if (response.status === 200 && response.gags && response.gags.length > 0) {
                    sessionStorage.setItem('gagData', JSON.stringify(response.gags)); // Store gags data in session storage
                    $('#homeButton').fadeIn('fast');
                    $("#mainForm").fadeOut('fast', function() {
                        $("#resultsContainer").html(formatGags(gags=response.gags)).fadeIn('fast');
                    });
                } else if (response.status === 200 && response.gags.length === 0) {
                    $('#mainForm').fadeOut('fast');
                    $('#homeButton').fadeIn('fast');
                    $("#resultsContainer").html(formatMessage("No gags were found. Please adjust your search criteria and try again.")).fadeIn('fast');
                }
            },

            complete: function(){
                // Change back to the original icon after Ajax request is complete
                $('#submitButton').html('<i class="fa-solid fa-chevron-right"></i>');
            }
        });
    });

    // Event listeners for hover and leave on videos
    $(document).on('mouseover', '.hover-video', function() {
        this.play();
    });

    $(document).on('mouseleave', '.hover-video', function() {
        this.pause();
    });

    // Event handler for clicking the API Documentation link
    $("#ApiDocumentation").click(function() {
        showApiDocumentation();
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

    // Function for downloading gag data (if needed)
    $(document).on('click', '.download-gag', function() {
        const gagKey = $(this).data('gag-key');
        const title = $(this).data('title');
        const gagData = sessionStorage.getItem(gagKey);
        if (gagData) {
            downloadJsonData(gagData, title);
        }
    });

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
                <div class="gag" onmousedown='return false;' onselect='return false;'>
                    <div class="gag-header" >
                        <div class="gag-download">
                            <i class="fas fa-file-download download-gag" data-gag-key="${gagKey}" data-title="${title}" title="Download raw post data"></i>
                        </div>
                        <div class="author-info">
                            <div class="author-image" href="${creator.profileUrl}">
                                <img src="${creator.avatarUrl}" alt="Author profile picture">
                            </div>
                            <div class="author-name">
                                <a href="${creator.profileUrl}" target="_blank">
                                    ${creator.fullName}
                                </a>
                                <span class="username">@${creator.username}・${timeSince(creationTs)}</span>
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
                        <span class="gag-index"><i class="fas fa-arrow-down-1-9"></i> ${index + 1}/${filteredGags.length}</span>
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

    function showApiDocumentation() {
        $('#mainForm, #resultsContainer').fadeOut('fast');
        $('#homeButton').fadeIn('fast');
        const apiDocumentationHtml = `
            <div class="api-docs">
                <h2>API Documentation</h2>
                <p>Welcome to the Gag Pasta API! Here's how you can integrate your applications with our treasure trove of gags. The API allows you to search and retrieve gag posts programmatically..</p>

                <div class="api-content">
                    <h3>Base URL</h3>
                    <code>https://gagpasta.com/gags</code>

                    <h3>Endpoints</h3>
                    <p>The following are the available endpoints within the API:</p>
                    <ul>
                        <li><strong>?source=tag&tag-name={tag}</strong> - Retrieves gags by a specific tag.</li>
                        <li><strong>?source=group&group-name={group}</strong> - Retrieves gags from a specific group.</li>
                    </ul>

                    <h3>Parameters</h3>
                    <p>Both endpoints accept the following query parameters to customize your requests:</p>
                    <ul>
                        <li><code>limit</code> - Specifies the number of results to return. Default is 20.</li>
                        <li><code>media</code> - Returns posts with the specified media type</li>
                    </ul>
                    <h3>Example Request</h3>
                    <p>Here is an example of how to request gags by a tag:</p>
                    <code>curl -X GET "https://gagpasta.com/gags?source=tag&tag-name=funny&limit=5"</code>

                    <h3>Response Format</h3>
                    <p>The API returns data in JSON format. Below is an example response from the <code>/gags/tag/funny</code> endpoint:</p>
                    <pre>{
        "status": "success",
        "data": [
            {
                "id": "12345",
                "title": "Funny Doge Meme",
                "url": "https://gagpasta.com/gags/12345",
                "tags": ["doge", "meme", "funny"],
                "upVoteCount": 420,
                "downVoteCount": 69,
                "commentsCount": 1337,
                "creationTs": "2024-02-18T12:34:56Z",
                "images": {
                    "image700": {
                        "url": "https://gagpasta.com/static/images/12345.jpg"
                    }
                }
            }
        ]
    }</pre>
                </div>
            </div>
        `;
        $('#apiDocumentationContainer').html(apiDocumentationHtml).fadeIn('fast');
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

        let count;
        let label;

        if (diff < minute) {
            count = diff;
            label = count === 1 ? "second" : "seconds";
        } else if (diff < hour) {
            count = Math.floor(diff / minute);
            label = count === 1 ? "minute" : "minutes";
        } else if (diff < day) {
            count = Math.floor(diff / hour);
            label = count === 1 ? "hour" : "hours";
        } else if (diff < week) {
            count = Math.floor(diff / day);
            label = count === 1 ? "day" : "days";
        } else if (diff < month) {
            count = Math.floor(diff / week);
            label = count === 1 ? "week" : "weeks";
        } else if (diff < year) {
            count = Math.floor(diff / month);
            label = count === 1 ? "month" : "months";
        } else {
            count = Math.floor(diff / year);
            label = count === 1 ? "year" : "years";
        }

        return count === 0 ? "just now" : `${count} ${label} ago`;
    }
});

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #
from datetime import datetime

import aiohttp
from flask import (
    Flask,
    request,
    render_template,
    jsonify,
)
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from ._api import get_gags, GROUP_GAGS_ENDPOINT, TAGGED_GAGS_ENDPOINT

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

app = Flask(__name__)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["5000 per hour", "80 per minute"],
    storage_uri="redis://localhost:6379",
)

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #


@app.route("/", methods=["GET"])
def index():
    """
    Render the home page.

    :return: The HTML template for the index page.
    """
    return render_template("index.html")


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #


@app.errorhandler(429)
def ratelimit_handler(message):
    return jsonify(
        {"timestamp": datetime.now(), "status": 429, "message": str(message)}
    )


@app.route("/gags", methods=["GET"])
async def gags():
    """
    Fetch and return a list of gags based on the specified parameters.

    Parameters
    ----------
        - source: Source of the gags ('tag' or 'group').
        - tag-name: Name of the tag (if source is 'tag').
        - group-name: Name of the group (if source is 'group').
        - gags-type: Type of gags to fetch (e.g., 'home', 'top', 'trending', 'fresh').
        - media: Filter for the type of media ('all', 'animated', 'photo', 'article').
        - limit: Maximum number of gags to return.
        :return: JSON response containing the list of gags, current timestamp, and media type.
    """
    # Extract parameters from the request
    gags_source: str = request.args.get("source")
    tag_name: str = request.args.get("tag-name")
    group_name: str = request.args.get("group-name")
    gags_type = request.args.get("gags-type", "home")
    media_type = (
        None if request.args.get("media") == "all" else request.args.get("media")
    )
    gags_limit: int = int(request.args.get("limit", 10))

    # Determine the API endpoint based on the source parameter
    gags_endpoint = (
        (f"{TAGGED_GAGS_ENDPOINT % tag_name}/type/{gags_type}", f"tag #{tag_name}")
        if gags_source == "tag"
        else (
            f"{GROUP_GAGS_ENDPOINT % group_name}/type/{gags_type}",
            f"group {group_name}",
        )
    )

    # Fetch gags from the API
    async with aiohttp.ClientSession() as session:
        gags_data: list = await get_gags(
            endpoint=gags_endpoint[0],
            media_type=media_type,
            limit=gags_limit,
            session=session,
        )

        response: dict = {
            "status": 200,
            "timestamp": datetime.now(),
            "type": gags_type,
            "media": media_type,
            "gags": gags_data,
        }
        return jsonify(response)


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

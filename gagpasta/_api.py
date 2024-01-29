# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #
from typing import Literal

import aiohttp

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

BASE_9GAG_API_ENDPOINT: str = "https://9gag.com/v1"
TAGGED_GAGS_ENDPOINT: str = f"{BASE_9GAG_API_ENDPOINT}/tag-posts/tag/%s"
GROUP_GAGS_ENDPOINT: str = f"{BASE_9GAG_API_ENDPOINT}/group-posts/group/%s"

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #


async def get_data(endpoint: str, session: aiohttp.ClientSession) -> dict:
    """
    Asynchronously fetches JSON data from a specified API endpoint.

    :param endpoint:
    :type endpoint:
    :param session:
    :type session:
    :return:
    :rtype:
    """
    try:
        async with session.get(
            endpoint,
            headers={"User-Agent": "Mediapartners-Google"},
        ) as response:
            if response.status == 200:
                return await response.json()
            else:
                error_message = await response.json()
                print(f"An API error occurred: {error_message}")
                return {}

    except aiohttp.ClientConnectionError as error:
        print(f"An HTTP error occurred: {error}")
        return {}
    except Exception as error:
        print(f"An unknown error occurred: {error}")
        return {}


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #


async def paginate(
    initial_endpoint: str,
    session: aiohttp.ClientSession,
    limit: int,
    media_type: Literal["animated", "photo", "article"] = None,
) -> list:
    """
    Paginates the gags based on the limit and media type.

    :param initial_endpoint: The specific 9Gag API endpoint to fetch gags from.
    :param session: An aiohttp session to use for the request.
    :param limit: The maximum number of gags to fetch and return.
    :param media_type: Specifies the type of media to filter the gags (optional).
        Defaults to None, which means no filtering will be applied.
    :return: A list of paginated gags.
    """
    gags_list: list = []
    next_cursor: str = "c=10"
    is_pagination: bool = limit > 10

    while len(gags_list) < limit:
        pagination_endpoint: str = (
            f"{initial_endpoint}?{next_cursor}" if is_pagination else initial_endpoint
        )

        response_data = await get_data(endpoint=pagination_endpoint, session=session)
        gags: list = response_data.get("data").get("posts")

        if not gags:
            break  # Break if no more posts are returned

        for gag in gags:
            if media_type and gag.get("type").lower() != media_type:
                continue  # Skip gags that do not match the media_type filter

            gags_list.append(gag)

            if len(gags_list) == limit:
                break  # Break if the limit has been reached

        next_cursor = response_data.get("data").get("nextCursor")

    return gags_list


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #


async def get_gags(
    endpoint: str,
    session: aiohttp.ClientSession,
    limit: int,
    media_type: Literal["animated", "photo", "article"] = None,
) -> dict:
    # Fetch the original response
    response = await get_data(endpoint, session)

    # Paginate gags and update the 'posts' key in the original response
    response.get("data")["posts"] = await paginate(
        initial_endpoint=endpoint,
        media_type=media_type,
        limit=limit,
        session=session,
    )

    return response.get("data")


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

import aiohttp
import pytest

from conftest import (
    TEST_TAG,
    TEST_GROUP,
)
from gagpasta.api import get_gags, TAGGED_GAGS_ENDPOINT, GROUP_GAGS_ENDPOINT


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #


@pytest.mark.asyncio
async def test_tagged_gags():
    async with aiohttp.ClientSession() as session:
        response: dict = await get_gags(
            endpoint=TAGGED_GAGS_ENDPOINT % TEST_TAG,
            media_type="animated",
            limit=10,
            session=session,
        )

        for gag in response.get("posts"):
            assert gag.get("type") == "Animated"
            for tag in gag.get("tags"):
                if TEST_TAG.lower() in tag.values():
                    assert True


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #


@pytest.mark.asyncio
async def test_group_gags():
    async with aiohttp.ClientSession() as session:
        response: dict = await get_gags(
            endpoint=GROUP_GAGS_ENDPOINT % TEST_GROUP,
            media_type="photo",
            limit=8,
            session=session,
        )

        assert len(response.get("posts")) == 8
        for gag in response.get("posts"):
            assert gag.get("type") == "Photo"
            assert response.get("group").get("name") == TEST_GROUP.capitalize()


# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

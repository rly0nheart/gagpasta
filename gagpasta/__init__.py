# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

import os
from datetime import date

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

author: str = "Richard Mwewa"
about_author: str = "https://rly0nheart.github.io"

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #


class Version:
    major: str = "1"
    minor: str = "0"
    patch: str = "0"
    release: str = f"{major}.{minor}"


description: str = f"""
# Gag Pasta (CLI/WEB) {Version.release}
"""

_copyright: str = (
    f"© Copyright {date.today().year} [{author}]({about_author}). All rights reserved."
)

_license: str = """
```
GNU General Public License v3 (GPLv3)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
"""

epilog: str = f"""
# {_copyright}
{_license}
"""
# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

DATA_DIRECTORY: str = os.path.join(os.path.expanduser("~"), "gagpasta-data")

# +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ #

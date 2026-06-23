# Oda's FarmRate

Oda's FarmRate is a simple game income calculator for passive currency systems.

Open `index.html` in a browser and use one of the three modes:

- Earn: calculate how much currency you gain over a duration.
- Target: calculate how long it takes to reach a target.
- Convert: convert an income rate into per-second, per-minute, per-hour, and per-day values.

The `assets` folder contains the visual used by the dark theme, so include it when deploying.

Supported number formats include plain numbers, decimals, commas, scientific notation, and game suffixes such as `k`, `M`, `B`, `T`, `Qd`, `Qn`, `Sx`, `Sp`, `Oc`, `No`, and `Dc`.

Standard short-scale progression:

- `1K` = 1,000
- `1M` = 1,000K
- `1B` = 1,000M
- `1T` = 1,000B
- `1Qd` = 1,000T
- `1Qn` = 1,000Qd
- `1Sx` = 1,000Qn
- `1Sp` = 1,000Sx
- `1Oc` = 1,000Sp
- `1No` = 1,000Oc
- `1Dc` = 1,000No

## Free online hosting

Oda's FarmRate is a static app, so it can run online for free without a server.

Recommended options:

- Netlify: drag the `farmrate` folder into Netlify Drop.
- Vercel: import a GitHub repository and set the project root to `farmrate`.
- GitHub Pages: publish the `farmrate` folder from a repository, or move these files into a Pages branch.

No database, API key, or backend is required.

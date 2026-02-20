---
trigger: always_on
---

An experiment is a serverless self-contained app that is in the `src/experiments` folder. I has to have at least an `index.html` file which is it's entry point, but it can have other files, like thumbnails.

JS and CSS may be either be included in the `index.html` itself, for simpler cases like the `projections` experiment, or, if a more complex app, be split in other files inside the experiment folder.
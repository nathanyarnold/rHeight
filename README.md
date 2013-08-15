rHeight
====

A jQuery plugin that uses min-height to force DOM elements to the height of the viewport.

#### Allows for:

- min-width thresholds (functionality doesn't engage until cpecified min-width is reached in viewport),
- min-heights and max-heights on elements using either pixels or width:height ratios,
- offsets that subtract either a set pixels amount or the combined height of specified DOM elements from total height,
- extention of set height to all specified child-nodes.

#### Note: 

Currently requires CSS box-model "box-sizing:border-box" on all elements to work.

#### To-do:

1. Allow sizable child-nodes to also have their own independant offset,
2. Calculate heights with default CSS box-model (height + margin + border),
3. Allow child nodes that are centered in their parent using "data-rheight-child-centered.

## Markup pattern:

Basically add the following attribute to any node you want this to work on:

> &lt;div data-rheight="true"&gt;&lt;/div&gt;

And it should work. 


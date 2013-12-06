rHeight
======

A jQuery plugin that uses min-height to force DOM elements to the height of the viewport.

#### Allows for:

- min-width thresholds (functionality doesn't engage until cpecified min-width is reached in viewport),
- min-heights and max-heights on elements using either pixels or width:height ratios,
- offsets that subtract either a set pixels amount or the combined height of specified DOM elements from total height,
- extention of set height to all specified child-nodes.

#### Notes:

Currently requires CSS box-model "box-sizing:border-box" on all elements to work. To do: calculate heights with default CSS box-model (height + margin + border).



Instructions
------------

At its simplest, add the **data-rHeight** attribute to any node you want this to work on, and it will set a min-height CSS value equal to the height of the viewport:

    &lt;div data-rHeight="true"&gt;&lt;/div&gt;

If you would like to set another CSS attribute (other than 'min-height') you can set that specifically with the **data-rHeight-attr** attribute. For example, to set the *height* or *margin-top*, use:

    &lt;div data-rHeight="true" data-rHeight-attr="height"&gt;&lt;/div&gt;
    &lt;div data-rHeight="true" data-rHeight-attr="margin-top"&gt;&lt;/div&gt;
    
(Accepted values include: min-height, height, margin-top, padding-top, border-top, margin-bottom, padding-bottom, border-bottom, top, bottom.)


rHeight
======

A jQuery plugin that uses min-height to force DOM elements to the height of the viewport.

#### Allows for

- min-width thresholds (functionality doesn't engage until cpecified min-width is reached in viewport),
- min-heights and max-heights on elements using either pixels or width:height ratios,
- offsets that subtract either a set pixels amount or the combined height of specified DOM elements from total height,
- extention of set height to all specified child-nodes.

#### Notes

Currently requires CSS box-model "box-sizing:border-box" on all elements to work. 

#### To do's

- Calculate heights with default CSS box-model (height + margin + border).
- Don't bind events if there is nothing to work on, keep better track of this
- Allow maximum thresholds in addition to minimum thresholds



Instructions
------------

At its simplest, add the **data-rHeight** attribute to any node you want this to work on, and it will set a *min-height* CSS value equal to the height of the viewport:

    <div data-rHeight="true"></div>

It will run onDOMReady, and then again on any viewport-resize or orientation-change event.

#### Specifying CSS attributes

If you would like to set another CSS attribute (other than *min-height*) you can set that specifically with the **data-rHeight-attr** attribute. For example, to set the *height* or *margin-top*, use:

    <div data-rHeight="true" data-rHeight-attr="height"></div>
    <div data-rHeight="true" data-rHeight-attr="margin-top"></div>
    
(Accepted values include: min-height, height, margin-top, padding-top, border-top, margin-bottom, padding-bottom, border-bottom, top, bottom.)

#### Offsets

If you don't want to use the FULL height of the viewport, you can specify an offset using the **data-rHeight-offset** attribute. You can pass in either a fixed pixel value (eg. "25" or "25px"), a %-based value (eg. "25%"), or a jQuery selector where it will calculate the outerHeight() of any nodes it finds. 

    <div data-rHeight="true" data-rHeight-offset="25px"></div>  // 25 pixels
    <div data-rHeight="true" data-rHeight-offset="25%"></div>   // 20%
    <div data-rHeight="true" data-rHeight-offset="#hd"></div>   // the value of $('#hd').outerHeight()

#### Thresholds

In responsive-design layouts, you may not want this plugin to even run if the viewport isn't a certain minimum size. For example, *don't run if we don't have at least 100px of height*, or *don't run unless we have at least 768px of width*.

You can set either of these minimum threshold by using the **data-rHeight-threshold-width** and/or **data-rHeight-threshold-height** attributes:

    <div data-rHeight="true" data-rHeight-threshold-height="100"></div>
	<div data-rHeight="true" data-rHeight-threshold-width="768"></div>


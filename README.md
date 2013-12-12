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

#### Minimums and Maximums

Sometimes you won't want an element to be smaller than a certain height, or larger than a certain height. You can specify either an absolute pixel value or a ratio, by setting the **data-rHeight-minheight** and/or **data-rHeight-maxheight** attributes:

    <div data-rHeight="true" data-rHeight-minheight="100"></div>   // minimum 100px of height
    <div data-rHeight="true" data-rHeight-maxheight="16:9"></div>  // a maximum height of 16:9 (ratio with width)
    
#### Child Nodes

You may want to extend this functionality to any child-nodes of the element you're working on. A good example could be to set an outer DIV, and then an internal div to the same height. You can do this by adding the attribute **data-rHeight-child** to any nodes within the outer node set with **data-rHeight**:

    <div data-rHeight="true">                  // set outer wrapper div
        <div data-rHeight-child="true"></div>  // set inner div
    </div>
    
**Child Node Options**

Two of the same options available to the parentNode, are also available to a child node:

Use **data-rHeight-child-attr** to specify which CSS attribute is being set (eg, *height* instead of *min-height*). Use **data-rHeight-child-offset** to specify any additional offsets that should be applied to the child node. 

Here's an example of both in action: we're going to set the outer wrapper div so that it has at least as much height as the viewport, and then margin the inner div so that it starts halfway down the screen:

    <div data-rHeight="true">
        <div data-rHeight-child="true" data-rHeight-child-attr="margin-top" data-rHeight-child-offset="50%"></div>
    </div>

Child nodes can also be centered within an outer element by setting **data-rHeight-child-attr="center"**. This can be helpful if you want to center some text on a full-screen element:

    <div data-rHeight="true">
        <div data-rHeight-child="true" data-rHeight-child-attr="center"></div>
    </div>



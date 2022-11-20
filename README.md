# HackerNewsCommentShuffle
### A Browser Extension (unpublished)

![icon](icons/hncs-shapes.png)

<sup>Image created with [Hundred Rabits Dotgrid](https://100r.co/site/dotgrid.html)</sup>

An Egalitarian comment structure for the revolting and less polished. Actually It's not THAT serious. Negativity always seems to find its way to the top, giving yet another example of [Gresham's Law](https://en.wikipedia.org/wiki/Gresham%27s_law) in a sociocultural context.

Click the extension icon to shuffle the HN comment tree. Parent and child nodes are shuffled together. Click it again or refresh the page to set the original order. 

### Note:
This extension utilizes manifest v3 and at the time of writing was denied sumbission to the Firefox add-ons repository. I can't seem to find any updated information on the support timeline but the latest correspondance indicates at least partial support by this time, 11/12/2022. I tried porting back to v2 but my content script injection fails. Probably a result of shitty code. I'll likely wait to publish until manifest v3 is fully supported.
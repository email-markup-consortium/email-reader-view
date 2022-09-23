# Email Reader View
Thanks for looking at this reader view browser extension, built for web based email clients. The idea is it will take the main content from an HTML email and replace the styles with something simpler, making it easier to read. It also allows  the user to adjust these simple styles to suit their own personal preferences.

## Supported email clients
Currently, this works with;
* Gmail
* Yahoo Mail
* AOL Mail
* Outlook.com

If there is another web based email client you would like to see listed, let me know.


## Styles
There are a number of styles applied to the reader view, these can be adjusted to your own preference.
### Background
Set a background colour to sit behind the content
###  Width
Set a maximum width for the content. If the viewport is less than the width set, the width will be 100% of the viewport.
### Text colour
Colour of the text
### Link colour
Colour of link text.
### Text align
Alignment of text, start, center or end. In a left to right language, start is equivalent to left aligned and end if the equipment of right aligned. In a right to left language, it's the reverse.
### Font family
Set the font-family for the text, options include; serif, sans-serif, monospace  and cursive. If you want an exact font, you can assign specific fonts to each of those keywords in chrome settings chrome://settings/fonts
### Font size
Sets the size of the text.  If the provided range isn't enough for you, you can also adjust this in chrome settings chrome://settings/fonts
### Line height
Sets the space between lines of text.
### Word spacing
Sets the space between words.
### Letter spacing
Sets the space between letters.
### Block images
Hides images and shows their alt text.

## Set up
This is not yet available on the [Chrome extensions web store](https://chrome.google.com/webstore/category/extensions), however if you want to try it out before it's available, you can.
* Download this GitHub Repo.  
	* If you're not too familiar with GitHub the easiest way to do this is to click on the green `code` button and select download zip. Once downloaded, unzip that file.
* In the Chrome browser, navigate to the extensions page chrome://extensions/
* In the top right corner, click the `Developer mode` button
* A button will appear, to `Load Unpacked`, click this button.
* Select the email-reader-view folder that you downloaded, and you'll see it appear in your list of browser extensions.
* Click the puzzle piece in the chrome toolbar to see your extensions and click the pin next to the Email Reader view, it will now stay showing in the tool bar.
* Open an email in one of the supported email clients and click the Email Reader View icon and then the `apply reader view` button.
